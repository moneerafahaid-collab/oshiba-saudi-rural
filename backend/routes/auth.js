const express = require("express");
const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/password");
const { formatUser, INTEREST_LABELS } = require("../utils/userFormat");

const router = express.Router();

function normalizePhone(input) {
  return String(input || "")
    .replace(/\s+/g, "")
    .replace(/^\+966/, "0")
    .trim();
}

function normalizeEmail(input) {
  return String(input || "").trim().toLowerCase();
}

/** POST /api/auth/register — تسجيل زائر جديد */
router.post("/register", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.name || "").trim();
    const age = Number(req.body.age);
    const password = String(req.body.password || "");

    if (!phone || !email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "الجوال والإيميل والاسم وكلمة المرور مطلوبة",
      });
    }
    if (!/^05\d{8}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني غير صالح" });
    }
    if (!Number.isFinite(age) || age < 5 || age > 120) {
      return res.status(400).json({ success: false, message: "أدخل عمراً صحيحاً" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور 6 أحرف على الأقل",
      });
    }

    const existing = await User.findOne({ phone }).lean();
    if (existing) {
      return res.status(400).json({ success: false, message: "رقم الجوال مسجّل مسبقاً" });
    }

    const user = await User.create({
      phone,
      email,
      name,
      age,
      passwordHash: hashPassword(password),
      role: "visitor",
      profileCompleted: false,
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء حسابك — أكمل بروفايلك من لوحتي",
      user: formatUser(user),
    });
  } catch (err) {
    if (err.code === "23505") {
      const msg = err.constraint?.includes("email")
        ? "البريد الإلكتروني مسجّل مسبقاً"
        : "رقم الجوال مسجّل مسبقاً";
      return res.status(400).json({ success: false, message: msg });
    }
    next(err);
  }
});

/** POST /api/auth/login */
router.post("/login", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || "");

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "أدخل رقم الجوال وكلمة المرور",
      });
    }

    const user = await User.findOne({ phone, active: true });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: "رقم الجوال أو كلمة المرور غير صحيحة",
      });
    }

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/auth/profile/:phone — تفضيلات الزائر */
router.patch("/profile/:phone", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const { interestType } = req.body;

    if (!["adventure", "exploration", "both"].includes(interestType)) {
      return res.status(400).json({
        success: false,
        message: "اختر تفضيلاً: مغامرات، استكشاف، أو الاثنان",
      });
    }

    const user = await User.updateProfile(phone, { interestType });
    if (!user) {
      return res.status(404).json({ success: false, message: "حساب الزائر غير موجود" });
    }

    res.json({
      success: true,
      message: "تم حفظ بروفايلك",
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/auth/demo-accounts — للعرض التوضيحي */
router.get("/demo-accounts", (req, res) => {
  res.json({
    success: true,
    data: [
      { role: "visitor", roleLabel: "زائر", phone: "0500000000" },
      { role: "provider", roleLabel: "مقدم تجربة", phone: "0500000001" },
      { role: "admin", roleLabel: "مدير", phone: "0500000002" },
    ],
    note: "كلمة المرور التجريبية: 123123",
    interests: INTEREST_LABELS,
  });
});

module.exports = router;
