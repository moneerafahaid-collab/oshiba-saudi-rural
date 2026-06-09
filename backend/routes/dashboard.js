const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Experience = require("../models/Experience");
const Submission = require("../models/Submission");
const { formatExperience } = require("../utils/formatExperience");
const { INTEREST_LABELS } = require("../utils/userFormat");

const router = express.Router();

function normalizePhone(input) {
  return String(input || "")
    .replace(/\s+/g, "")
    .replace(/^\+966/, "0")
    .trim();
}

/** GET /api/dashboard/visitor/:phone */
router.get("/visitor/:phone", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const user = await User.findOne({ phone, role: "visitor", active: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "الحساب غير موجود" });
    }

    const bookings = await Booking.find({ userPhone: phone })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          phone: user.phone,
          email: user.email,
          age: user.age,
          interestType: user.interestType,
          interestLabel: user.interestType ? INTEREST_LABELS[user.interestType] : undefined,
          profileCompleted: user.profileCompleted,
          roleLabel: "زائر",
          memberSince: user.createdAt,
        },
        stats: {
          bookingsCount: bookings.length,
          avgRatingGiven: 4.8,
          reviewsCount: bookings.length > 0 ? Math.min(bookings.length, 3) : 0,
        },
        bookings: bookings.map((b) => ({
          invoiceNumber: b.invoiceNumber,
          experienceTitle: b.experienceTitle,
          experienceRegion: b.experienceRegion,
          dateLabel: b.dateLabel,
          timeLabel: b.timeLabel,
          guests: b.guests,
          total: b.total,
          status: b.status,
          createdAt: b.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/dashboard/provider/:phone */
router.get("/provider/:phone", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const user = await User.findOne({ phone, role: "provider", active: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "حساب مقدم التجربة غير موجود" });
    }

    const hostName = user.providerHost || user.name;
    const experiences = await Experience.find({ host: hostName, active: true })
      .sort({ featured: -1, rating: -1 })
      .lean();

    const bookings = await Booking.find({ host: hostName })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);

    res.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          phone: user.phone,
          roleLabel: "مقدم تجربة",
          providerHost: hostName,
        },
        stats: {
          experiencesCount: experiences.length,
          bookingsCount: bookings.length,
          totalRevenue,
          avgRating:
            experiences.length > 0
              ? (
                  experiences.reduce((s, e) => s + e.rating, 0) / experiences.length
                ).toFixed(1)
              : "0",
        },
        experiences: experiences.map((e) => formatExperience(e)),
        bookings: bookings.map((b) => ({
          invoiceNumber: b.invoiceNumber,
          experienceTitle: b.experienceTitle,
          userName: b.userName || "زائر",
          dateLabel: b.dateLabel,
          guests: b.guests,
          total: b.total,
          status: b.status,
          createdAt: b.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/dashboard/admin */
router.get("/admin", async (req, res, next) => {
  try {
    const [usersCount, experiencesCount, bookingsCount, submissionsCount, pendingSubmissions] =
      await Promise.all([
        User.countDocuments({ active: true }),
        Experience.countDocuments({ active: true }),
        Booking.countDocuments(),
        Submission.countDocuments(),
        Submission.countDocuments({ status: "pending" }),
      ]);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const users = await User.find({ active: true })
      .select("name phone role providerHost createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          usersCount,
          experiencesCount,
          bookingsCount,
          submissionsCount,
          pendingSubmissions,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        users: users.map((u) => ({
          name: u.name,
          phone: u.phone,
          role: u.role,
          providerHost: u.providerHost,
        })),
        recentBookings: recentBookings.map((b) => ({
          invoiceNumber: b.invoiceNumber,
          experienceTitle: b.experienceTitle,
          userName: b.userName || "—",
          host: b.host,
          total: b.total,
          status: b.status,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
