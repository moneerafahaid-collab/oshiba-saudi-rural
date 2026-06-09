const express = require("express");
const { oshibaChat } = require("../rag/oshibaAgent");
const { ensureIngested, runIngest } = require("../rag/ingest");
const { ping: ollamaPing } = require("../llm/ollamaClient");
const { isConfigured: geminiConfigured, ping: geminiPing } = require("../llm/geminiClient");

const router = express.Router();

/** POST /api/chat — عشيبة: اقتراح، حجز، استفسار، قصص */
router.post("/", async (req, res, next) => {
  try {
    const { message, profile, history, selectedExperienceId } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "يرجى إرسال رسالة في الحقل message",
      });
    }

    const result = await oshibaChat({
      message: String(message).trim(),
      profile: profile || {},
      history: history || [],
      selectedExperienceId,
    });

    res.json({
      success: true,
      reply: result.reply,
      sources: result.sources,
      intent: result.intent,
      actions: result.actions,
      mode: result.mode,
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/chat/status — حالة RAG والنماذج */
router.get("/status", async (req, res) => {
  try {
    await ensureIngested();
    const { getStore } = require("../rag/ingest");
    const store = getStore();
    const ollama = await ollamaPing();
    const gemini = geminiConfigured() ? await geminiPing() : false;

    res.json({
      success: true,
      ragReady: store.ready,
      documents: store.items?.length ?? 0,
      ollama,
      gemini,
      geminiConfigured: geminiConfigured(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/chat/reindex — إعادة فهرسة (تطوير) */
router.post("/reindex", async (req, res, next) => {
  try {
    await runIngest(true);
    res.json({ success: true, message: "تمت إعادة فهرسة التجارب" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
