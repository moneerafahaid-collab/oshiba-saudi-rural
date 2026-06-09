const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Experience = require("../models/Experience");
const Submission = require("../models/Submission");
const Review = require("../models/Review");
const Inquiry = require("../models/Inquiry");
const { formatExperience } = require("../utils/formatExperience");
const { INTEREST_LABELS } = require("../utils/userFormat");

const router = express.Router();

function normalizePhone(input) {
  return String(input || "").replace(/\s+/g, "").replace(/^\+966/, "0").trim();
}

async function getProviderUser(phone) {
  return User.findOne({ phone: normalizePhone(phone), role: "provider", active: true });
}

// ─── استفسارات الزوار (عام) ───
router.post("/inquiries", async (req, res, next) => {
  try {
    const { userName, userPhone, subject, message } = req.body;
    if (!userName || !subject || !message) {
      return res.status(400).json({ success: false, message: "الاسم والموضوع والرسالة مطلوبة" });
    }
    const inquiry = await Inquiry.create({ userName, userPhone, subject, message });
    res.status(201).json({ success: true, message: "تم إرسال استفسارك — سيرد عليك الفريق قريباً", data: inquiry });
  } catch (err) {
    next(err);
  }
});

// ═══ لوحة مقدم النشاط ═══
router.get("/provider/:phone", async (req, res, next) => {
  try {
    const user = await getProviderUser(req.params.phone);
    if (!user) return res.status(404).json({ success: false, message: "حساب مقدم النشاط غير موجود" });

    const hostName = user.providerHost || user.name;
    const [experiences, bookings, reviews] = await Promise.all([
      Experience.find({ host: hostName }).sort({ createdAt: -1 }).lean(),
      Booking.find({ host: hostName }).sort({ createdAt: -1 }).limit(50).lean(),
      Review.find({ host: hostName, visible: true }).sort({ createdAt: -1 }).lean(),
    ]);

    const totalRevenue = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total, 0);

    res.json({
      success: true,
      data: {
        profile: { name: user.name, phone: user.phone, providerHost: hostName, roleLabel: "مقدم تجربة" },
        stats: {
          experiencesCount: experiences.filter((e) => e.active).length,
          bookingsCount: bookings.length,
          reviewsCount: reviews.length,
          totalRevenue,
          avgRating: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0",
        },
        experiences: experiences.map((e) => ({ ...formatExperience(e), active: e.active })),
        bookings: bookings.map((b) => ({
          invoiceNumber: b.invoiceNumber,
          experienceTitle: b.experienceTitle,
          userName: b.userName || "زائر",
          userPhone: b.userPhone,
          dateLabel: b.dateLabel,
          timeLabel: b.timeLabel,
          guests: b.guests,
          total: b.total,
          status: b.status,
          createdAt: b.createdAt,
        })),
        reviews: reviews.map((r) => ({
          id: String(r._id),
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          experienceTitle: r.experienceTitle,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/provider/:phone/experiences", async (req, res, next) => {
  try {
    const user = await getProviderUser(req.params.phone);
    if (!user) return res.status(404).json({ success: false, message: "غير مصرح" });

    const { title, region, category, price, duration, imageUrl, maxGroup, tags } = req.body;
    if (!title || !region || !category || !price || !duration) {
      return res.status(400).json({ success: false, message: "بيانات النشاط ناقصة" });
    }

    const maxLegacy = await Experience.findOne().sort({ legacyId: -1 }).select("legacyId").lean();
    const legacyId = (maxLegacy?.legacyId || 100) + 1;

    const exp = await Experience.create({
      legacyId,
      title,
      region,
      category,
      price: Number(price),
      duration,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
      host: user.providerHost || user.name,
      maxGroup: Number(maxGroup) || 10,
      tags: tags || [],
      rating: 4.5,
      reviews: 0,
      featured: false,
      active: true,
    });

    res.status(201).json({ success: true, message: "تمت إضافة النشاط بنجاح", data: formatExperience(exp) });
  } catch (err) {
    next(err);
  }
});

router.delete("/provider/:phone/experiences/:id", async (req, res, next) => {
  try {
    const user = await getProviderUser(req.params.phone);
    if (!user) return res.status(404).json({ success: false, message: "غير مصرح" });

    const hostName = user.providerHost || user.name;
    const filter = { host: hostName, active: true };
    if (/^\d+$/.test(req.params.id)) filter.legacyId = Number(req.params.id);
    else filter._id = req.params.id;

    const exp = await Experience.findOneAndUpdate(filter, { active: false }, { returnDocument: "after" });
    if (!exp) return res.status(404).json({ success: false, message: "النشاط غير موجود" });

    res.json({ success: true, message: "تم حذف النشاط" });
  } catch (err) {
    next(err);
  }
});

router.patch("/provider/:phone/bookings/:invoice", async (req, res, next) => {
  try {
    const user = await getProviderUser(req.params.phone);
    if (!user) return res.status(404).json({ success: false, message: "غير مصرح" });

    const { status } = req.body;
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "حالة غير صالحة" });
    }

    const hostName = user.providerHost || user.name;
    const booking = await Booking.findOneAndUpdate(
      { invoiceNumber: req.params.invoice, host: hostName },
      { status },
      { returnDocument: "after" }
    );
    if (!booking) return res.status(404).json({ success: false, message: "الحجز غير موجود" });

    res.json({ success: true, message: status === "confirmed" ? "تم تأكيد الحجز" : "تم إلغاء الحجز", data: booking });
  } catch (err) {
    next(err);
  }
});

// ═══ لوحة مدير المنصة ═══
router.get("/admin", async (req, res, next) => {
  try {
    const [users, experiences, bookings, submissions, inquiries, reviews, visitorAnalytics] =
      await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Experience.find().sort({ createdAt: -1 }).lean(),
      Booking.find().sort({ createdAt: -1 }).limit(50).lean(),
      Submission.find().sort({ createdAt: -1 }).lean(),
      Inquiry.find().sort({ createdAt: -1 }).lean(),
      Review.find().sort({ createdAt: -1 }).lean(),
      User.getVisitorAnalytics(),
    ]);

    const totalRevenue = bookings.reduce((s, b) => s + (b.total || 0), 0);

    res.json({
      success: true,
      data: {
        stats: {
          usersCount: users.filter((u) => u.active).length,
          experiencesCount: experiences.filter((e) => e.active).length,
          bookingsCount: bookings.length,
          pendingSubmissions: submissions.filter((s) => s.status === "pending").length,
          openInquiries: inquiries.filter((i) => i.status === "open").length,
          reviewsCount: reviews.filter((r) => r.visible).length,
          totalRevenue,
          visitorAnalytics,
        },
        visitorAnalytics,
        users: users.map((u) => ({
          id: String(u._id),
          name: u.name,
          phone: u.phone,
          email: u.email,
          age: u.age,
          interestType: u.interestType,
          interestLabel: u.interestType ? INTEREST_LABELS[u.interestType] : undefined,
          profileCompleted: u.profileCompleted,
          role: u.role,
          providerHost: u.providerHost,
          active: u.active,
        })),
        experiences: experiences.map((e) => ({ ...formatExperience(e), active: e.active })),
        bookings: bookings.map((b) => ({
          invoiceNumber: b.invoiceNumber,
          experienceTitle: b.experienceTitle,
          userName: b.userName || "—",
          host: b.host,
          total: b.total,
          status: b.status,
          dateLabel: b.dateLabel,
        })),
        submissions: submissions.map((s) => ({
          id: String(s._id),
          title: s.title,
          region: s.region,
          category: s.category,
          price: s.price,
          hostName: s.hostName,
          phone: s.phone,
          description: s.description,
          status: s.status,
          createdAt: s.createdAt,
        })),
        inquiries: inquiries.map((i) => ({
          id: String(i._id),
          userName: i.userName,
          userPhone: i.userPhone,
          subject: i.subject,
          message: i.message,
          status: i.status,
          adminReply: i.adminReply,
          createdAt: i.createdAt,
        })),
        reviews: reviews.map((r) => ({
          id: String(r._id),
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          experienceTitle: r.experienceTitle,
          host: r.host,
          visible: r.visible,
          featured: r.featured || false,
          highlight: r.highlight || "experience",
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/submissions/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "حالة غير صالحة" });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    );
    if (!submission) return res.status(404).json({ success: false, message: "الطلب غير موجود" });

    if (status === "approved") {
      const maxLegacy = await Experience.findOne().sort({ legacyId: -1 }).select("legacyId").lean();
      await Experience.create({
        legacyId: (maxLegacy?.legacyId || 100) + 1,
        title: submission.title,
        region: submission.region,
        category: submission.category,
        price: submission.price,
        duration: submission.duration,
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
        host: submission.hostName,
        maxGroup: 10,
        tags: [submission.category],
        rating: 4.5,
        reviews: 0,
        active: true,
      });
    }

    res.json({
      success: true,
      message: status === "approved" ? "تم قبول النشاط ونشره" : "تم رفض الطلب",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/users/:phone", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const { action } = req.body;

    if (action === "suspend") {
      const user = await User.findOneAndUpdate({ phone }, { active: false }, { returnDocument: "after" });
      if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
      return res.json({ success: true, message: "تم إيقاف الحساب" });
    }
    if (action === "activate") {
      const user = await User.findOneAndUpdate({ phone }, { active: true }, { returnDocument: "after" });
      if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
      return res.json({ success: true, message: "تم تفعيل الحساب" });
    }
    if (action === "delete") {
      await User.deleteOne({ phone });
      return res.json({ success: true, message: "تم حذف الحساب" });
    }

    res.status(400).json({ success: false, message: "إجراء غير صالح" });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/users", async (req, res, next) => {
  try {
    const { name, phone, role, providerHost, password } = req.body;
    if (!name || !phone || !role || !password) {
      return res.status(400).json({ success: false, message: "بيانات المستخدم ناقصة" });
    }
    const { hashPassword } = require("../utils/password");
    const user = await User.create({
      name,
      phone: normalizePhone(phone),
      role,
      providerHost: role === "provider" ? providerHost : undefined,
      passwordHash: hashPassword(password),
      active: true,
    });
    res.status(201).json({ success: true, message: "تمت إضافة المستخدم", data: { name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    if (err.code === "23505" || err.code === 11000) {
      return res.status(400).json({ success: false, message: "رقم الجوال مسجّل مسبقاً" });
    }
    next(err);
  }
});

router.patch("/admin/inquiries/:id", async (req, res, next) => {
  try {
    const { adminReply } = req.body;
    if (!adminReply?.trim()) {
      return res.status(400).json({ success: false, message: "الرد مطلوب" });
    }
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { adminReply: adminReply.trim(), status: "answered", repliedAt: new Date() },
      { returnDocument: "after" }
    );
    if (!inquiry) return res.status(404).json({ success: false, message: "الاستفسار غير موجود" });
    res.json({ success: true, message: "تم إرسال الرد", data: inquiry });
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/reviews/:id", async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { visible: false }, { returnDocument: "after" });
    if (!review) return res.status(404).json({ success: false, message: "التعليق غير موجود" });
    res.json({ success: true, message: "تم إخفاء التعليق" });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/reviews/:id", async (req, res, next) => {
  try {
    const { featured, highlight } = req.body;
    const update = {};
    if (typeof featured === "boolean") update.featured = featured;
    if (["benefit", "ease", "experience"].includes(highlight)) update.highlight = highlight;

    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, message: "لا توجد بيانات للتحديث" });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" });
    if (!review) return res.status(404).json({ success: false, message: "التعليق غير موجود" });

    const msg = update.featured === true
      ? "تم اختيار التعليق للعرض في الصفحة الرئيسية"
      : update.featured === false
        ? "تم إزالة التعليق من العرض العام"
        : "تم تحديث التعليق";

    res.json({ success: true, message: msg, data: review });
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/experiences/:id", async (req, res, next) => {
  try {
    const filter = /^\d+$/.test(req.params.id) ? { legacyId: Number(req.params.id) } : { _id: req.params.id };
    const exp = await Experience.findOneAndUpdate(filter, { active: false }, { returnDocument: "after" });
    if (!exp) return res.status(404).json({ success: false, message: "النشاط غير موجود" });
    res.json({ success: true, message: "تم حذف النشاط" });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/bookings/:invoice", async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { invoiceNumber: req.params.invoice },
      { status },
      { returnDocument: "after" }
    );
    if (!booking) return res.status(404).json({ success: false, message: "الحجز غير موجود" });
    res.json({ success: true, message: "تم تحديث الحجز", data: booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
