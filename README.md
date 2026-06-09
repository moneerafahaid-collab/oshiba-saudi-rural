# عشيبة السعودية الريفية

منصة سياحة ريفية ذكية — تجارب أصيلة، حجز، ومرشدة **عشيبة** بالذكاء الاصطناعي.

## الروابط

| | |
|---|---|
| **GitHub** | https://github.com/moneerafahaid-collab/oshiba-saudi-rural |
| **الموقع المنشور** | https://oshiba-saudi-rural.onrender.com *(بعد النشر)* |

## النشر على Render (رابط واحد للجنة)

1. افتح: **https://render.com/deploy?repo=https://github.com/moneerafahaid-collab/oshiba-saudi-rural**
2. سجّل دخول GitHub واضغط **Apply**
3. انتظر 5–10 دقائق حتى يكتمل البناء
4. (اختياري) في إعدادات الخدمة أضف `GEMINI_API_KEY` لتفعيل عشيبة الذكية

> الخطة المجانية قد تتوقف بعد فترة خمول — أول زيارة قد تأخذ 30–60 ثانية.

## تشغيل محلي

```bash
# قاعدة البيانات
cd backend && docker compose up -d

# الخادم
cp .env.example .env   # ثم عدّل القيم
npm install && npm start

# الواجهة (نافذة ثانية)
cd ..
npm install && npm run dev
```

**حسابات تجريبية:** جوال `0500000000` — كلمة المرور `123123`

## التقنيات

- **Frontend:** React + Vite + Tailwind
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **AI:** Gemini (مع fallback محلي)
