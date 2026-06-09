const fs = require("fs");
const path = require("path");

const VECTORS_PATH = path.join(__dirname, "../data/vectors.json");

/** تشابه جيبي (cosine) بين متجهين */
function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

class VectorStore {
  constructor() {
    /** @type {{ doc: object, embedding: number[] }[]} */
    this.items = [];
    this.ready = false;
    this.mode = "none"; // ollama | lexical
    this.vocabulary = null;
  }

  loadFromDisk() {
    if (!fs.existsSync(VECTORS_PATH)) return false;
    try {
      const raw = JSON.parse(fs.readFileSync(VECTORS_PATH, "utf8"));
      this.items = raw.items || [];
      this.mode = raw.mode || "ollama";
      this.vocabulary = raw.vocabulary || null;
      this.ready = this.items.length > 0;
      return this.ready;
    } catch {
      return false;
    }
  }

  saveToDisk() {
    const dir = path.dirname(VECTORS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      VECTORS_PATH,
      JSON.stringify(
        { mode: this.mode, vocabulary: this.vocabulary, items: this.items },
        null,
        0
      ),
      "utf8"
    );
  }

  setItems(items, mode, vocabulary = null) {
    this.items = items;
    this.mode = mode;
    this.vocabulary = vocabulary;
    this.ready = items.length > 0;
    this.saveToDisk();
  }

  search(queryEmbedding, topK = 5) {
    if (!this.ready) return [];

    const scored = this.items.map((item) => ({
      doc: item.doc,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter((x) => x.score > 0);
  }
}

module.exports = { VectorStore, VECTORS_PATH, cosineSimilarity };
