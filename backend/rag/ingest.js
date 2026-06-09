const { loadKnowledgeDocuments } = require("./knowledgeBase");
const { embedDocuments } = require("./embeddings");
const { VectorStore } = require("./vectorStore");

const store = new VectorStore();
let storeMeta = { mode: "none", vocabulary: null };
let ingestPromise = null;

async function runIngest(force = false) {
  if (store.ready && !force) return store;

  const docs = loadKnowledgeDocuments();
  console.log(`↻ فهرسة ${docs.length} تجربة لـ RAG...`);

  const result = await embedDocuments(docs);
  store.setItems(result.items, result.mode, result.vocabulary || null);
  storeMeta = {
    mode: result.mode,
    vocabulary: result.vocabulary || store.vocabulary || null,
  };

  console.log(`✓ RAG جاهز (${result.mode}) — ${result.items.length} مستند`);
  return store;
}

function ensureIngested() {
  if (store.ready) return Promise.resolve(store);
  if (!ingestPromise) {
    if (store.loadFromDisk()) {
      storeMeta = { mode: store.mode, vocabulary: store.vocabulary };
      console.log(`✓ تحميل فهرس RAG من القرص (${store.items.length} مستند)`);
      return Promise.resolve(store);
    }
    ingestPromise = runIngest(false).finally(() => {
      ingestPromise = null;
    });
  }
  return ingestPromise;
}

function getStore() {
  return store;
}

function getStoreMeta() {
  return {
    mode: store.mode || storeMeta.mode,
    vocabulary: store.vocabulary || storeMeta.vocabulary,
  };
}

module.exports = { runIngest, ensureIngested, getStore, getStoreMeta };
