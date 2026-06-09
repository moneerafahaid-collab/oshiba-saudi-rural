const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

/** POST /api/submissions — طلب إضافة تجربة */
router.post("/", async (req, res, next) => {
  try {
    const { title, region, category, price, duration, hostName, phone, description } =
      req.body;

    if (!title || !region || !category || !price || !duration || !hostName || !phone || !description) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول مطلوبة",
      });
    }

    const submission = await Submission.create({
      title,
      region,
      category,
      price: Number(price),
      duration,
      hostName,
      phone,
      description,
    });

    res.status(201).json({
      success: true,
      message: "تم إرسال طلبك بنجاح — سيراجعه الفريق خلال ٤٨ ساعة",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/submissions — للمراجعة (بدائي) */
router.get("/", async (req, res, next) => {
  try {
    const list = await Submission.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
