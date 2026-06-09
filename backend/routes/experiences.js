const express = require("express");
const Experience = require("../models/Experience");
const { formatExperience } = require("../utils/formatExperience");

const router = express.Router();

/** GET /api/experiences — قائمة مع فلترة وبحث */
router.get("/", async (req, res, next) => {
  try {
    const { region, category, search, featured } = req.query;
    const filter = { active: true };

    if (region && region !== "جميع المناطق") {
      filter.region = region;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (featured === "true") {
      filter.featured = true;
    }

    let query = Experience.find(filter).sort({ featured: -1, rating: -1 });

    if (search && String(search).trim()) {
      const q = String(search).trim();
      query = Experience.find({
        ...filter,
        $or: [
          { title: { $regex: q, $options: "i" } },
          { region: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
          { host: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
        ],
      }).sort({ featured: -1, rating: -1 });
    }

    const docs = await query.lean();
    res.json({
      success: true,
      count: docs.length,
      data: docs.map((d) => formatExperience(d)),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/experiences/meta/regions */
router.get("/meta/regions", async (req, res, next) => {
  try {
    const regions = await Experience.distinct("region", { active: true });
    res.json({ success: true, data: ["جميع المناطق", ...regions.sort()] });
  } catch (err) {
    next(err);
  }
});

/** GET /api/experiences/meta/categories */
router.get("/meta/categories", async (req, res, next) => {
  try {
    const categories = await Experience.distinct("category", { active: true });
    res.json({ success: true, data: categories.sort() });
  } catch (err) {
    next(err);
  }
});

/** GET /api/experiences/:id */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let doc = null;

    if (/^\d+$/.test(id)) {
      doc = await Experience.findOne({ legacyId: Number(id), active: true });
    }
    if (!doc) {
      doc = await Experience.findOne({ _id: id, active: true }).catch(() => null);
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "التجربة غير موجودة",
      });
    }

    res.json({ success: true, data: formatExperience(doc) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
