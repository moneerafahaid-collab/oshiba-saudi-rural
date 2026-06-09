# عشيبة السعودية الريفية

منصة سياحة ريفية ذكية — تجارب أصيلة، حجز، ومرشدة **عشيبة** بالذكاء الاصطناعي.

## الروابط

| | |
|---|---|
| **GitHub** | https://github.com/moneerafahaid-collab/oshiba-saudi-rural |
| **الموقع المنشور (GitHub Pages)** | https://moneerafahaid-collab.github.io/oshiba-saudi-rural/ |
| **API كامل (اختياري — Render)** | https://oshiba-saudi-rural.onrender.com |

## النشر على GitHub Pages

النشر **تلقائي** عند كل push على فرع `main` عبر GitHub Actions.

لتفعيل أول مرة:
1. افتح: **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. أو شغّل workflow يدوياً من تبويب **Actions**

> **ملاحظة:** GitHub Pages يعرض الواجهة. للتجربة الكاملة (عشيبة، الحجز، قاعدة البيانات) أضيفي في **Settings → Secrets and variables → Actions → Variables** المتغير `VITE_API_URL` بقيمة رابط الـ API (مثل Render)، أو انشري الـ API على Render من الرابط أدناه.

## النشر الكامل على Render (واجهة + API + قاعدة بيانات)

1. افتح: **https://render.com/deploy?repo=https://github.com/moneerafahaid-collab/oshiba-saudi-rural**
2. سجّل دخول GitHub واضغط **Apply**
3. **مهم:** Blueprint Path = `render.yaml` (جذر المشروع) — **ليس** `backend/render.yaml`
4. انتظر حتى يظهر **Web Service + Database** (ليس قاعدة بيانات فقط)
5. (اختياري) أضف `GEMINI_API_KEY` في Environment Variables

**رابط الموقع الكامل:** https://oshiba-saudi-rural.onrender.com

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
