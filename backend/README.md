# Backend — اكتشف ريف السعودية

## التشغيل

```bash
cd backend
npm install
npm start
```

الخادم: http://localhost:5000

## أوامر مفيدة

| الأمر | الوصف |
|--------|--------|
| `npm start` | تشغيل الخادم |
| `docker compose up -d` | تشغيل PostgreSQL محلياً |
| `npm run db:migrate` | تطبيق مخطط الجداول |
| `npm run seed` | تعبئة التجارب (إن كانت فارغة) |
| `npm run seed:force` | إعادة تعبئة كاملة |
| `npm run rag:ingest` | إعادة فهرسة تجارب RAG |

---

## API

| Method | المسار | الوصف |
|--------|--------|--------|
| GET | `/api/health` | صحة الخادم وقاعدة البيانات |
| GET | `/api/experiences` | قائمة التجارب |
| POST | `/api/bookings` | إنشاء حجز |
| POST | `/api/submissions` | طلب إضافة تجربة |
| **POST** | **`/api/chat`** | **مساعد RAG (ذكاء اصطناعي)** |
| GET | `/api/chat/status` | حالة الفهرس وOllama |
| POST | `/api/chat/reindex` | إعادة فهرسة التجارب |

### مثال محادثة

```json
POST /api/chat
{ "message": "أفضل تجربة عائلية في حائل" }

// Response
{
  "success": true,
  "reply": "...",
  "sources": [{ "id": 14, "title": "جولة بيئية في محمية الفقع", ... }],
  "mode": "ollama"
}
```

---

## مساعد RAG + Ollama (محلي)

### هيكل المجلدات

```
backend/
├── rag/
│   ├── knowledgeBase.js   # تحويل seedData → مستندات
│   ├── ingest.js          # فهرسة وتخزين المتجهات
│   ├── embeddings.js      # تضمين Ollama + احتياطي معجمي
│   ├── vectorStore.js     # بحث تشابه cosine
│   ├── retriever.js       # استرجاع Top-K
│   └── pipeline.js        # RAG: استرجاع → توليد
├── llm/
│   └── ollamaClient.js   # اتصال Ollama (chat + embed)
├── routes/
│   └── chat.js           # POST /api/chat
└── data/
    ├── seedData.js        # 24 تجربة (مصدر المعرفة)
    └── vectors.json       # فهرس المتجهات (يُنشأ تلقائياً)
```

### إعداد Ollama

1. ثبّت [Ollama](https://ollama.com)
2. حمّل النماذج:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

3. في `.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBED_MODEL=nomic-embed-text
RAG_TOP_K=5
```

### آلية العمل

1. **Ingest:** كل تجربة (عنوان، منطقة، تصنيف، وصف، وسوم، سعر…) → نص → تضمين.
2. **Retrieve:** سؤال المستخدم → أقرب 5 تجارب (cosine similarity).
3. **Generate:** السياق + السؤال → Ollama → رد عربي مبني على التجارب.
4. **Fallback:** إن Ollama غير متاح → رد من البيانات المسترجعة فقط.

### تشغيل الواجهة + المساعد

```bash
# نافذة 1 — Backend
cd backend && npm start

# نافذة 2 — Ollama (إن لم يعمل تلقائياً)
ollama serve

# نافذة 3 — Frontend
npm run dev
```

افتح http://localhost:5173 واضغط أيقونة المحادثة أسفل اليسار.

---

## PostgreSQL

```bash
cd backend
docker compose up -d
cp .env.example .env
npm install
npm run db:migrate
npm start
```

### الجداول

| الجدول | الوصف |
|--------|--------|
| `users` | الزوار، مقدمو الأنشطة، المدير |
| `experiences` | الخدمات/التجارب المعروضة |
| `bookings` | الحجوزات — مع `FOREIGN KEY` ومعاملات `FOR UPDATE` |
| `submissions` | طلبات إضافة تجربة |
| `reviews` | تعليقات الزوار |
| `inquiries` | استفسارات الزوار |

---

## المتطلبات

- Node.js 18+
- PostgreSQL 14+ (أو Docker)
- Ollama (اختياري لكن موصى به للردود الذكية)
