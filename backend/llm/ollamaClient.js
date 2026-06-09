/**
 * عميل Ollama المحلي — بدون مفاتيح API مدفوعة
 * OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_EMBED_MODEL في .env
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

async function ollamaFetch(path, body) {
  const res = await fetch(`${OLLAMA_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama ${path}: ${res.status} — ${errText.slice(0, 200)}`);
  }

  return res.json();
}

/** تضمين نصوص (دفعة) — يدعم /api/embed و /api/embeddings */
async function embedTexts(texts) {
  try {
    const data = await ollamaFetch("/api/embed", {
      model: OLLAMA_EMBED_MODEL,
      input: texts,
    });
    const embeddings = data.embeddings;
    if (embeddings?.length) return embeddings;
  } catch {
    /* جرّب المسار القديم */
  }

  const embeddings = [];
  for (const text of texts) {
    const data = await ollamaFetch("/api/embeddings", {
      model: OLLAMA_EMBED_MODEL,
      prompt: text,
    });
    if (!data.embedding) throw new Error("تضمين غير صالح");
    embeddings.push(data.embedding);
  }
  return embeddings;
}

/** محادثة مع سياق */
async function chat(messages, options = {}) {
  const data = await ollamaFetch("/api/chat", {
    model: options.model || OLLAMA_MODEL,
    messages,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.4,
      num_predict: options.numPredict ?? 600,
    },
  });

  const content = data.message?.content?.trim();
  if (!content) throw new Error("رد فارغ من النموذج");
  return content;
}

async function ping() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = {
  embedTexts,
  chat,
  ping,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  OLLAMA_EMBED_MODEL,
};
