/**
 * عميل Google Gemini — الطبقة المجانية (مفتاح API من Google AI Studio)
 * GEMINI_API_KEY و GEMINI_MODEL في .env
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const FALLBACK_MODELS = [
  GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((m, i, arr) => m && arr.indexOf(m) === i);

async function callModel(model, messages, options = {}) {
  const systemText =
    options.system ||
    messages.find((m) => m.role === "system")?.content ||
    "";

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.45,
      maxOutputTokens: options.maxOutputTokens ?? 700,
    },
  };

  if (systemText) {
    body.systemInstruction = { parts: [{ text: systemText }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini: ${res.status} — ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("رد فارغ من Gemini");
  return text;
}

async function generateContent(messages, options = {}) {
  if (!GEMINI_API_KEY) return null;

  let lastError = null;
  for (const model of FALLBACK_MODELS) {
    try {
      return await callModel(model, messages, options);
    } catch (err) {
      lastError = err;
      const retryable = /429|503|UNAVAILABLE|quota|high demand/i.test(String(err.message));
      if (retryable) {
        console.warn(`⚠ Gemini (${model}):`, err.message.slice(0, 120));
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("Gemini غير متاح");
}

function isConfigured() {
  return Boolean(GEMINI_API_KEY);
}

async function ping() {
  if (!isConfigured()) return false;
  try {
    await generateContent(
      [{ role: "user", content: "قل: جاهزة" }],
      { system: "أجب بكلمة واحدة فقط.", maxOutputTokens: 16 }
    );
    return true;
  } catch {
    return false;
  }
}

module.exports = { generateContent, isConfigured, ping, GEMINI_MODEL };
