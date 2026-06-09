const Experience = require("../models/Experience");
const { generateContent, isConfigured } = require("../llm/geminiClient");
const { chat, ping: ollamaPing } = require("../llm/ollamaClient");
const { retrieveRelevant } = require("./retriever");
const { ensureIngested } = require("./ingest");
const { resolveRegion } = require("./regionHints");
const { PLATFORM_KNOWLEDGE, answerPlatformFaq } = require("./platformKnowledge");

function isGuideNavigation(message) {
  const m = String(message || "").trim();
  if (/^(منطقة|المنطقة|مناطق|عائلات|عائلة|شباب|استفسار|سؤال)$/i.test(m)) {
    return true;
  }
  return false;
}

function isPlatformQuestion(message) {
  const m = String(message || "").trim();
  if (isGuideNavigation(m)) return false;
  if (
    /فكرة (ال)?منص[ةه]|عن المنص[ةه]|عشيبة السعودية|اكتشف ريف|ريف السعودية|وش تقدم|وش تسو[يى]|ما (هي|فائدة) المنص|كيف (أ|ا)حجز|طريقة الحجز|من (أ|ا)نت|وش عشيب|دورك|مساعد[ةه]|كيف تعمل|وش الخدم|التسجيل|حساب|أسعار|بكم|كم (السعر|تكلف)|أي مناطق|وين (تغط|موجود)/i.test(
      m
    )
  ) {
    return true;
  }
  if (/^(وش|ما|ماهي|ما هي|كيف|لماذا|ليش|وين|أين|متى|كم|هل)\s/.test(m)) {
    return !/تجرب|احجز|اقتر|أنشط|رحل|ابي|أبي|ابغ|أبغ|نشاط|محتار|الافضل|الأفضل/i.test(m);
  }
  return false;
}

function wantsExperienceRecommendations(message, intent) {
  if (intent === "suggest" || intent === "book" || intent === "story") return true;
  if (intent === "faq" || intent === "inquiry" || intent === "guide") return false;
  return /تجرب|اقتر|تقتر|أنشط|رحل|احجز|ابي|أبي|ابغ|أبغ|نشاط|محتار|الافضل|الأفضل|وين أروح|وش اسوي|شي (مناسب|حلو)/i.test(
    String(message || "")
  );
}

const INTEREST_CATEGORIES = {
  adventure: ["مغامرات", "فعاليات"],
  exploration: ["محميات", "زراعة", "مهن", "إقامة", "مواشي", "صيد"],
  both: null,
};

const INTEREST_LABELS = {
  adventure: "محب المغامرات (تطعيس، جبال، أنشطة مثيرة)",
  exploration: "محب الاستكشاف (محميات، تراث، طبيعة هادئة)",
  both: "يحب المغامرة والاستكشاف معاً",
};

function detectIntent(message) {
  const m = String(message || "").trim();
  if (/احجز|حجز|أبي أحجز|ابي احجز|ابغى احجز|أبغى أحجز|ودي احجز/i.test(m)) return "book";
  if (/استفسار|استفسر|سؤال|أسئلة|استعلام/i.test(m)) return "inquiry";
  if (/قصة|حكاية|احكي|اسمع|اكمل|أكمل|كملي|كمل|القصة/i.test(m)) return "story";
  if (isGuideNavigation(m)) return "guide";
  if (
    /اقترح|تقترح|شو تقترح|وش تقترح|شي معين|شي محدد|وش تنصح|ماذا تنصح|محتار|الافضل|الأفضل|ما ادري|ما أدري|انت اختار|أنت اختار/i.test(
      m
    )
  )
    return "suggest";
  if (isPlatformQuestion(m)) return "faq";
  return "general";
}

function docToSource(doc, score = 0.85) {
  return {
    id: doc.legacyId ?? doc.id,
    title: doc.title,
    region: doc.region,
    category: doc.category,
    price: doc.price,
    duration: doc.duration,
    rating: doc.rating,
    reviews: doc.reviews,
    host: doc.host,
    tags: doc.tags || [],
    description: doc.description || doc.title,
    imageUrl: doc.imageUrl,
    featured: !!doc.featured,
    score,
  };
}

function filterByAudience(docs, profile = {}) {
  const interest = profile.interestType || "both";
  if (interest === "adventure") {
    return docs.filter((d) => ["مغامرات", "فعاليات"].includes(d.category));
  }
  if (interest === "exploration") {
    return docs.filter(
      (d) =>
        d.category !== "مغامرات" ||
        (d.tags || []).some((t) => /عائلات|عائلة|هادئ/i.test(t))
    );
  }
  return docs;
}

async function loadDbExperiences(profile = {}) {
  const filter = { active: true };
  if (profile.region) filter.region = profile.region;
  if (profile.category && profile.category !== "all") filter.category = profile.category;

  let docs = await Experience.find(filter).sort({ featured: -1, rating: -1 }).limit(12).lean();
  const filtered = filterByAudience(docs, profile);
  if (filtered.length) return filtered.map((d, i) => docToSource(d, 0.9 - i * 0.02));

  if (profile.region) {
    docs = await Experience.find({ active: true, region: profile.region })
      .sort({ featured: -1, rating: -1 })
      .limit(8)
      .lean();
    return docs.map((d, i) => docToSource(d, 0.88 - i * 0.02));
  }

  return docs.map((d, i) => docToSource(d, 0.85 - i * 0.02));
}

function scopeSourcesToRegion(sources, region) {
  if (!region) return sources;
  const inRegion = sources.filter((s) => s.region === region);
  return inRegion.length ? inRegion : sources;
}

function mergeSources(primary = [], secondary = []) {
  const seen = new Set();
  const out = [];
  for (const s of [...primary, ...secondary]) {
    const key = String(s.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function enrichSearchQuery(message, profile, history) {
  const parts = [message];
  if (profile.region) parts.push(profile.region);
  if (profile.category && profile.category !== "all") parts.push(profile.category);
  history
    .filter((h) => h.role === "user")
    .slice(-4)
    .forEach((h) => parts.push(h.content));
  return parts.join(" ");
}

function rankByProfile(sources, profile = {}) {
  if (!sources.length) return sources;

  const interest = profile.interestType || "both";
  const allowed = INTEREST_CATEGORIES[interest];
  const region = profile.region;

  const scored = sources.map((s) => {
    let score = s.score ?? 0;
    if (allowed && allowed.includes(s.category)) score += 0.15;
    if (region && s.region === region) score += 0.12;
    if (s.featured) score += 0.05;
    return { ...s, score };
  });

  return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function formatContext(sources) {
  if (!sources.length) return "لا توجد تجارب مطابقة حالياً.";
  return sources
    .map(
      (s, i) =>
        `[${i + 1}] id=${s.id} | ${s.title}
- المنطقة: ${s.region} | التصنيف: ${s.category}
- السعر: ${s.price} ر.س | المدة: ${s.duration} | التقييم: ${s.rating}
- المضيف: ${s.host}
- الوصف: ${s.description}`
    )
    .join("\n\n");
}

function profileBlock(profile = {}) {
  const parts = [];
  if (profile.name) parts.push(`الاسم: ${profile.name}`);
  if (profile.interestType) {
    parts.push(`الاهتمام: ${INTEREST_LABELS[profile.interestType] || profile.interestType}`);
  }
  if (profile.region) parts.push(`المنطقة المفضلة/الموقع: ${profile.region}`);
  if (profile.age) parts.push(`العمر: ${profile.age}`);
  return parts.length ? parts.join("\n") : "زائر بدون بروفايل مكتمل — قدّم اقتراحات متنوعة.";
}

async function loadExperienceStory(experienceId) {
  if (!experienceId) return null;
  const id = Number(experienceId);
  let doc = await Experience.findOne({ legacyId: id, active: true });
  if (!doc) doc = await Experience.findById(String(experienceId));
  if (!doc) return null;
  return {
    id: doc.legacyId ?? doc.id,
    title: doc.title,
    heritageStory: doc.heritageStory || "",
    hostStory: doc.hostStory || "",
    whySpecial: doc.whySpecial || "",
    hostName: doc.hostName || doc.host,
  };
}

function pickExperience(sources, selectedExperienceId, message) {
  if (selectedExperienceId) {
    const found = sources.find((s) => String(s.id) === String(selectedExperienceId));
    if (found) return found;
  }
  const quoted = message.match(/«([^»]+)»|\"([^\"]+)\"/);
  if (quoted) {
    const title = (quoted[1] || quoted[2] || "").trim();
    const match = sources.find((s) => s.title.includes(title) || title.includes(s.title));
    if (match) return match;
  }
  return sources[0] || null;
}

function buildActions(intent, sources, selectedExperienceId, message) {
  const actions = [];
  const top = pickExperience(sources, selectedExperienceId, message);

  if (intent === "book" && top) {
    actions.push({
      type: "book",
      experienceId: top.id,
      title: top.title,
      label: `احجز «${top.title}»`,
    });
  }

  if (intent === "story" && top) {
    actions.push({
      type: "story",
      experienceId: top.id,
      title: top.title,
      label: `اكتشف قصة «${top.title}»`,
    });
  }

  if (intent === "inquiry") {
    actions.push({
      type: "inquiry",
      subject: top ? `استفسار عن ${top.title}` : "استفسار عام",
      label: "أرسل استفساراً",
    });
  }

  if ((intent === "suggest" || intent === "general") && sources.length) {
    sources.slice(0, 3).forEach((s) => {
      actions.push({
        type: "book",
        experienceId: s.id,
        title: s.title,
        label: `احجز: ${s.title}`,
      });
    });
  }

  return actions.slice(0, 4);
}

function fallbackReply(message, sources, profile, intent, history = []) {
  const interest = profile.interestType
    ? INTEREST_LABELS[profile.interestType]
    : "اهتمامات متنوعة";

  if (intent === "faq") {
    return answerPlatformFaq(message, history);
  }

  if (intent === "guide") {
    return answerGuideNavigation(message);
  }

  if (intent === "inquiry") {
    return "يسعدني أخذ استفسارك. اضغط «أرسل استفساراً» بالأسفل أو اكتب سؤالك بالتفصيل.";
  }

  if (intent === "general" && !wantsExperienceRecommendations(message, intent)) {
    return answerPlatformFaq(message, history);
  }

  if (!sources.length) {
    return (
      `مرحباً${profile.name ? ` ${profile.name}` : ""}! بناءً على اهتمامك (${interest})، ` +
      "لم أجد تجربة مطابقة تماماً الآن. جرّب اسم منطقة أو نشاط (مثل: حائل، تطعيس، محمية)، " +
      "أو اختر من الأزرار أدناه."
    );
  }

  const top = sources.slice(0, 3);
  const list = top.map((s) => `• ${s.title} (${s.region}) — ${s.price} ر.س`).join("\n");

  if (intent === "book") {
    const t = top[0];
    return `تمام! أنسب تجربة للحجز الآن: **${t.title}** في ${t.region} — ${t.price} ر.س/شخص.\nاضغط زر الحجز بالأسفل وسأنقلك مباشرة دون تكرار الخطوات.`;
  }

  if (intent === "story") {
    const t = top[0];
    return `عندي قصة جميلة عن **${t.title}**! اضغط «اكتشف القصة» بالأسفل أو اسألني أكمل لك الحكاية هنا.`;
  }

  return (
    `بناءً على بروفايلك (${interest})${profile.region ? ` ومنطقتك ${profile.region}` : ""}:\n\n${list}\n\n` +
    "اختر تجربة من الأزرار أو الكروت — وعند الاختيار أنقلك للحجز مباشرة."
  );
}

const SYSTEM_PROMPT = `أنت «عشيبة»، المرشدة الريفية الذكية لمنصة «عشيبة السعودية الريفية».
قواعدك:
- أجب بالعربية الفصحى الحديثة، ودودة ومختصرة (فقرتان كحد أقصى).
- إذا كان السؤال عن المنصة أو كيف تعمل أو من أنتِ: أجيبي على السؤال مباشرة من «معرفة المنصة» — لا تسردي تجارب إلا إذا طلب الزائر اقتراحاً صراحة.
- عند التوصية بالتجارب: اعتمدي على القائمة المرفقة فقط — لا تختلقي تجارب.
- إذا وُجدت تجارب في القائمة وطلب اقتراحاً: اقترحي منها — لا تقلي أبداً إن المنطقة بلا تجارب.
- راعِ اهتمام الزائر (مغامرة / استكشاف) والمنطقة في اقتراحاتك.
- إذا طلب حجزاً: أكّدي اسم التجربة وقلي له يضغط زر الحجز.
- إذا طلب قصة: احكي من heritageStory إن وُجدت.
- إذا طلب استفساراً: اطلبي التفاصيل أو وجّهيه لزر الاستفسار.
- لا تستخدم markdown معقداً — نقاط بسيطة فقط.`;

async function generateReply({ message, sources, profile, intent, storyContext, history }) {
  const includeExperiences = wantsExperienceRecommendations(message, intent);
  const contextBlock = includeExperiences
    ? formatContext(sources)
    : `معرفة المنصة:\n${PLATFORM_KNOWLEDGE}`;
  const userPrompt = [
    `بروفايل الزائر:\n${profileBlock(profile)}`,
    `نية الرسالة: ${intent}${includeExperiences ? "" : " (سؤال معلوماتي — أجب على السؤال دون اقتراح تجارب)"}`,
    storyContext ? `قصة التجربة (للإكمال إن طُلب):\n${storyContext}` : "",
    includeExperiences ? `التجارب المتاحة:\n${contextBlock}` : contextBlock,
    history?.length
      ? `آخر المحادثة:\n${history.map((h) => `${h.role}: ${h.content}`).join("\n")}`
      : "",
    `رسالة الزائر الآن: ${message}`,
  ]
    .filter(Boolean)
    .join("\n\n---\n");

  if (isConfigured()) {
    try {
      return {
        text: await generateContent(
          [{ role: "user", content: userPrompt }],
          { system: SYSTEM_PROMPT }
        ),
        mode: "gemini",
      };
    } catch (err) {
      console.warn("⚠ Gemini:", err.message);
    }
  }

  if (await ollamaPing()) {
    try {
      const text = await chat([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ]);
      return { text, mode: "ollama" };
    } catch (err) {
      console.warn("⚠ Ollama:", err.message);
    }
  }

  return {
    text: fallbackReply(message, sources, profile, intent, history),
    mode: "fallback",
  };
}

function answerGuideNavigation(message) {
  const m = String(message || "").trim();
  if (/^(عائلات|عائلة)$/i.test(m)) {
    return "اختر «عائلات» من الكروت بالأسفل للمتابعة.";
  }
  if (/^شباب$/i.test(m)) {
    return "اختر «شباب» من الكروت بالأسفل للمتابعة.";
  }
  if (/^(استفسار|سؤال)$/i.test(m)) {
    return "اختر «استفسار» من الكروت، أو اكتب سؤالك مباشرة.";
  }
  if (/^(منطقة|المنطقة|مناطق)$/i.test(m)) {
    return "تمام! اختر منطقتك من كروت المناطق بالأسفل، أو اكتب اسم منطقة (مثل: حائل).";
  }
  return "استخدم الكروت بالأسفل للاختيار خطوة بخطوة.";
}

async function oshibaChat(body) {
  await ensureIngested();

  const message = String(body.message || "").trim();
  if (!message) throw new Error("الرسالة فارغة");

  const profile = body.profile || {};
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
  const selectedExperienceId = body.selectedExperienceId;

  const resolvedRegion = resolveRegion(profile, history, message);
  const enrichedProfile = {
    ...profile,
    region: resolvedRegion || profile.region,
  };

  const intent = detectIntent(message);
  const includeExperiences = wantsExperienceRecommendations(message, intent);

  let sources = [];
  if (includeExperiences) {
    if (enrichedProfile.region) {
      sources = await loadDbExperiences(enrichedProfile);
    } else {
      const searchQuery = enrichSearchQuery(message, enrichedProfile, history);
      sources = await retrieveRelevant(searchQuery, { region: enrichedProfile.region });
      sources = rankByProfile(sources, enrichedProfile);
      if (!sources.length) {
        sources = await loadDbExperiences(enrichedProfile);
      }
    }
    sources = scopeSourcesToRegion(sources, enrichedProfile.region).slice(0, 8);
    sources = rankByProfile(sources, enrichedProfile);
  }

  let storyContext = "";
  if (intent === "story" || /قصة|حكاية|احكي|كمل/i.test(message)) {
    const expId = selectedExperienceId || sources[0]?.id;
    const story = await loadExperienceStory(expId);
    if (story) {
      storyContext = [story.heritageStory, story.hostStory, story.whySpecial]
        .filter(Boolean)
        .join("\n\n");
    }
  }

  const { text: reply, mode } = await generateReply({
    message,
    sources,
    profile: enrichedProfile,
    intent,
    storyContext,
    history,
  });

  const actions = includeExperiences
    ? buildActions(intent, sources, selectedExperienceId, message)
    : intent === "inquiry"
      ? buildActions(intent, [], selectedExperienceId, message)
      : [];

  return {
    reply,
    sources: includeExperiences ? sources.slice(0, 5) : [],
    intent,
    actions,
    mode,
  };
}

module.exports = { oshibaChat, detectIntent, isGuideNavigation };
