const { chat, ping } = require("../llm/ollamaClient");
const { retrieveRelevant } = require("./retriever");
const { ensureIngested } = require("./ingest");

function formatContext(sources) {
  if (!sources.length) {
    return "لا توجد تجارب مطابقة في قاعدة البيانات.";
  }

  return sources
    .map(
      (s, i) =>
        `[${i + 1}] ${s.title}
- المنطقة: ${s.region} | التصنيف: ${s.category}
- السعر: ${s.price} ر.س/شخص | المدة: ${s.duration} | التقييم: ${s.rating}
- المضيف: ${s.host}
- الوصف: ${s.description}`
    )
    .join("\n\n");
}

/** رد احتياطي عند تعذّر Ollama */
function fallbackReply(question, sources) {
  if (!sources.length) {
    return (
      "شكراً لسؤالك. لم أجد تجربة مطابقة تماماً في قاعدة بياناتنا الحالية، " +
      "لكن يمكنك تصفح جميع التجارب في المنصة أو تجربة البحث باسم منطقة أو نشاط (مثل: حائل، تطعيس، محمية). " +
      "هذا اقتراح عام — ننصحك بمراجعة تفاصيل كل تجربة قبل الحجز."
    );
  }

  const top = sources.slice(0, 3);
  const list = top
    .map(
      (s) =>
        `• **${s.title}** (${s.region}) — ${s.category}، ${s.price} ر.س/شخص، مدة ${s.duration}`
    )
    .join("\n");

  return (
    `بناءً على تجارب منصة «عشيبة السعودية الريفية»، إليك ما يناسب سؤالك:\n\n${list}\n\n` +
    `يمكنك الضغط على «احجز الآن» في صفحة التجربة لمزيد من التفاصيل. ` +
    `(تم توليد هذا الرد من البيانات المتاحة — النموذج اللغوي غير متصل حالياً.)`
  );
}

const SYSTEM_PROMPT = `أنت «عشيبة»، المرشدة الريفية الذكية لمنصة «عشيبة السعودية الريفية» — منصة سياحة ريفية وزراعية في المملكة.
قواعدك:
- عرّفي عن نفسك باسم عشيبة عند الترحيب أو عند السؤال عن هويتك.
- أجب دائماً بالعربية الفصحى الحديثة، بأسلوب ودود ومفيد.
- اعتمد فقط على «التجارب المتاحة» المرفقة في السياق عند التوصية.
- إن كان السؤال خارج البيانات، قل ذلك بوضوح ثم قدّم اقتراحاً عاماً متعلقاً بالسياحة الريفية.
- اذكر أسماء التجارب والمناطق والأسعار عند الاقتراح.
- لا تختلق تجارب غير موجودة في السياق.
- اجعل الرد مختصراً (فقرة أو اثنتان + نقاط إن لزم).`;

/**
 * خط أنابيب RAG: استرجاع → توليد
 */
async function ragChat(userMessage) {
  await ensureIngested();

  const message = String(userMessage || "").trim();
  if (!message) {
    throw new Error("الرسالة فارغة");
  }

  const sources = await retrieveRelevant(message);
  const contextBlock = formatContext(sources);

  const ollamaUp = await ping();

  if (!ollamaUp) {
    return {
      reply: fallbackReply(message, sources),
      sources,
      mode: "fallback",
    };
  }

  try {
    const reply = await chat([
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `التجارب المتاحة:\n${contextBlock}\n\n---\nسؤال المستخدم: ${message}`,
      },
    ]);

    return { reply, sources, mode: "ollama" };
  } catch (err) {
    console.warn("⚠ فشل توليد Ollama:", err.message);
    return {
      reply: fallbackReply(message, sources),
      sources,
      mode: "fallback",
    };
  }
}

module.exports = { ragChat };
