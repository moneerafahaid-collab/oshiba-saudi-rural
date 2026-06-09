const { embedQuery } = require("./embeddings");
const { getStore, getStoreMeta } = require("./ingest");

const TOP_K = Number(process.env.RAG_TOP_K) || 5;

/**
 * استرجاع أقرب التجارب لسؤال المستخدم
 */
async function retrieveRelevant(message, hints = {}) {
  const store = getStore();
  const meta = getStoreMeta();

  if (!store.ready) {
    return [];
  }

  const queryVec = await embedQuery(message, meta);
  let results = store.search(queryVec, TOP_K);

  if (!results.length && hints.region) {
    results = store.items
      .filter((item) => item.doc.region === hints.region)
      .slice(0, TOP_K)
      .map((item) => ({ doc: item.doc, score: 0.5 }));
  }

  return results.map(({ doc, score }) => ({
    id: doc.id,
    title: doc.title,
    region: doc.region,
    category: doc.category,
    price: doc.price,
    duration: doc.duration,
    rating: doc.rating,
    reviews: doc.reviews,
    host: doc.host,
    tags: doc.tags,
    description: doc.description,
    imageUrl: doc.imageUrl,
    featured: !!doc.featured,
    score: Math.round(score * 1000) / 1000,
  }));
}

module.exports = { retrieveRelevant };
