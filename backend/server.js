require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { migrate } = require("./db/migrate");
const { isConnected } = require("./db/pool");

const experiencesRouter = require("./routes/experiences");
const bookingsRouter = require("./routes/bookings");
const submissionsRouter = require("./routes/submissions");
const chatRouter = require("./routes/chat");
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");
const panelRouter = require("./routes/panel");
const reviewsRouter = require("./routes/reviews");
const { seedDatabase } = require("./utils/seedDatabase");
const { seedUsers } = require("./utils/seedUsers");
const { seedPanelData } = require("./utils/seedPanelData");
const { ensureIngested } = require("./rag/ingest");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
if (process.env.NODE_ENV === "production") {
  app.use(cors({ origin: true, credentials: true }));
} else {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "مرحباً بك في API منصة عشيبة السعودية الريفية",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      experiences: "GET /api/experiences",
      bookings: "POST /api/bookings",
      submissions: "POST /api/submissions",
      chat: "POST /api/chat",
      chatStatus: "GET /api/chat/status",
      authLogin: "POST /api/auth/login",
      dashboard: "GET /api/dashboard/{visitor|provider|admin}",
      panel: "GET/POST /api/panel/{provider|admin}",
      seed: "POST /api/seed",
    },
  });
});

app.get("/api/health", async (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    database: (await isConnected()) ? "connected" : "disconnected",
    engine: "postgresql",
  });
});

app.use("/api/experiences", experiencesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/panel", panelRouter);
app.use("/api/reviews", reviewsRouter);

/** تعبئة قاعدة البيانات — للتطوير */
app.post("/api/seed", async (req, res, next) => {
  try {
    if (!(await isConnected())) {
      return res.status(503).json({
        success: false,
        message: "قاعدة البيانات غير متصلة",
      });
    }
    const force = req.query.force === "true";
    const result = await seedDatabase(force);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `المسار ${req.method} ${req.originalUrl} غير موجود`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({
    success: false,
    message: err.message || "خطأ داخلي في الخادم",
  });
});

// ─── تشغيل ───
async function bootstrapDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠ DATABASE_URL غير معرّف");
    return;
  }
  try {
    await migrate();
    const connected = await isConnected();
    if (connected) {
      console.log("✓ متصل بـ PostgreSQL");
      await seedDatabase(false);
      await seedUsers();
      await seedPanelData();
    }
  } catch (err) {
    console.warn("⚠ تعذّر الاتصال بـ PostgreSQL:", err.message);
  }
  ensureIngested().catch((err) =>
    console.warn("⚠ تهيئة RAG:", err.message)
  );
}

function startServer() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ الخادم يعمل على المنفذ ${PORT}`);
    bootstrapDatabase();
  });
}

startServer();
