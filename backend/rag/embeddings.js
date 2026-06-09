const { embedTexts } = require("../llm/ollamaClient");

/** توليد متجهات كسولية من تكرار الكلمات (احتياطي بدون Ollama) */
function lexicalVector(text, vocabulary) {
  const tokens = tokenize(text);
  const vec = new Array(vocabulary.length).fill(0);
  tokens.forEach((t) => {
    const i = vocabulary.indexOf(t);
    if (i >= 0) vec[i] += 1;
  });
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function buildVocabulary(documents) {
  const set = new Set();
  documents.forEach((d) => tokenize(d.text).forEach((t) => set.add(t)));
  return [...set];
}

/** تضمين عبر Ollama أو احتياطي معجمي */
async function embedDocuments(documents) {
  try {
    const texts = documents.map((d) => d.text);
    const embeddings = await embedTexts(texts);
    return {
      mode: "ollama",
      items: documents.map((doc, i) => ({
        doc,
        embedding: embeddings[i],
      })),
    };
  } catch (err) {
    console.warn("⚠ تضمين Ollama غير متاح، استخدام البحث المعجمي:", err.message);
    const vocabulary = buildVocabulary(documents);
    return {
      mode: "lexical",
      vocabulary,
      items: documents.map((doc) => ({
        doc,
        embedding: lexicalVector(doc.text, vocabulary),
      })),
    };
  }
}

async function embedQuery(query, storeMeta) {
  if (storeMeta?.mode === "lexical" && storeMeta?.vocabulary) {
    return lexicalVector(query, storeMeta.vocabulary);
  }
  try {
    const [vec] = await embedTexts([query]);
    return vec;
  } catch {
    const vocabulary = storeMeta?.vocabulary || tokenize(query);
    return lexicalVector(query, vocabulary);
  }
}

module.exports = { embedDocuments, embedQuery, tokenize };
