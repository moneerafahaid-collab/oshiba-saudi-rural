const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

const HIGHLIGHT_LABELS = {
  benefit: "فائدة التجربة",
  ease: "سهولة الحجز",
  experience: "تجربة إيجابية",
};

/** تعليقات مختارة من المدير — للعرض العام */
router.get("/featured", async (req, res, next) => {
  try {
    const reviews = await Review.find({ visible: true, featured: true })
      .sort({ updatedAt: -1 })
      .limit(12)
      .lean();

    res.json({
      success: true,
      data: reviews.map((r) => ({
        id: String(r._id),
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        experienceTitle: r.experienceTitle,
        host: r.host,
        highlight: r.highlight || "experience",
        highlightLabel: HIGHLIGHT_LABELS[r.highlight] || HIGHLIGHT_LABELS.experience,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
