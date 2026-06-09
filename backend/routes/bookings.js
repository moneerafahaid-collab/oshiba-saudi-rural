const express = require("express");
const Booking = require("../models/Booking");
const Experience = require("../models/Experience");

const router = express.Router();

function generateInvoiceNumber() {
  return `RS-${Date.now().toString().slice(-8)}`;
}

/** POST /api/bookings — إنشاء حجز */
router.post("/", async (req, res, next) => {
  try {
    const {
      experienceId,
      dateLabel,
      timeLabel,
      guests,
      groupType,
      paymentMethod,
      userPhone,
      userName,
    } = req.body;

    if (!experienceId || !dateLabel || !timeLabel || !guests || !groupType || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "بيانات الحجز ناقصة",
      });
    }

    let experience = null;
    if (/^\d+$/.test(String(experienceId))) {
      experience = await Experience.findOne({
        legacyId: Number(experienceId),
        active: true,
      });
    }
    if (!experience) {
      experience = await Experience.findOne({
        _id: experienceId,
        active: true,
      }).catch(() => null);
    }

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "التجربة غير موجودة",
      });
    }

    const guestCount = Number(guests);
    if (guestCount < 1 || guestCount > experience.maxGroup) {
      return res.status(400).json({
        success: false,
        message: `عدد الأشخاص يجب أن يكون بين ١ و ${experience.maxGroup}`,
      });
    }

    const subtotal = experience.price * guestCount;
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + serviceFee;

    const booking = await Booking.create({
      invoiceNumber: generateInvoiceNumber(),
      experienceId: experience._id,
      experienceTitle: experience.title,
      experienceRegion: experience.region,
      host: experience.host,
      dateLabel,
      timeLabel,
      guests: guestCount,
      groupType,
      paymentMethod,
      pricePerPerson: experience.price,
      subtotal,
      serviceFee,
      total,
      userPhone: userPhone ? String(userPhone).trim() : undefined,
      userName: userName ? String(userName).trim() : undefined,
    });

    res.status(201).json({
      success: true,
      message: "تم تأكيد الحجز",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/bookings/:invoiceNumber */
router.get("/:invoiceNumber", async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      invoiceNumber: req.params.invoiceNumber,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الفاتورة غير موجودة",
      });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
