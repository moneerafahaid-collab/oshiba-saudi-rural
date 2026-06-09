const Review = require("../models/Review");
const Inquiry = require("../models/Inquiry");
const Experience = require("../models/Experience");

async function seedPanelData() {
  const alTai = await Experience.findOne({ host: "أكاديمية ومربط الطائي" }).lean();
  if (!alTai) return;

  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) {
    await Review.insertMany([
      {
        experienceId: alTai._id,
        experienceTitle: alTai.title,
        host: alTai.host,
        userName: "سارة العتيبي",
        userPhone: "0500000000",
        rating: 5,
        comment: "تجربة رائعة! المدرب محترف والخيل أصيل. أنصح العائلات بزيارة مربط الطائي.",
      },
      {
        experienceId: alTai._id,
        experienceTitle: alTai.title,
        host: alTai.host,
        userName: "محمد الحربي",
        userPhone: "0551234567",
        rating: 4,
        comment: "جولة خارجية ممتعة في الروضة. أتمنى إضافة أوقات مسائية أكثر.",
      },
      {
        experienceId: alTai._id,
        experienceTitle: alTai.title,
        host: alTai.host,
        userName: "نورة القحطاني",
        rating: 5,
        comment: "أفضل تجربة ركوب خيل في حائل — قصة التراث جميلة والاستقبال ممتاز.",
      },
    ]);
    console.log("✓ تم تعبئة تعليقات تجريبية");
  }

  const featuredCount = await Review.countDocuments({ featured: true });
  if (featuredCount === 0) {
    const all = await Review.find().sort({ createdAt: 1 }).lean();
    const highlights = ["benefit", "ease", "experience"];
    for (let i = 0; i < Math.min(all.length, 3); i++) {
      await Review.findByIdAndUpdate(all[i]._id, {
        featured: true,
        highlight: highlights[i % highlights.length],
      });
    }
    if (all.length > 0) console.log("✓ تم اختيار تعليقات للعرض في الصفحة الرئيسية");
  }

  const inquiryCount = await Inquiry.countDocuments();
  if (inquiryCount === 0) {
    await Inquiry.insertMany([
      {
        userName: "زائر تجريبي",
        userPhone: "0500000000",
        subject: "استفسار عن حجز عائلي",
        message: "هل يمكن حجز تجربة مربط الطائي لعائلة من 5 أشخاص مع أطفال؟",
        status: "open",
      },
      {
        userName: "أحمد الشمري",
        userPhone: "0559876543",
        subject: "تجارب في عسير",
        message: "أبحث عن تجارب زراعية في عسير لعطلة نهاية الأسبوع. ما المتوفر؟",
        status: "open",
      },
    ]);
    console.log("✓ تم تعبئة استفسارات تجريبية");
  }
}

module.exports = { seedPanelData };
