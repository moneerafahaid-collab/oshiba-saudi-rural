/**
 * قاعدة المعرفة — تُبنى من بيانات التجارب (seedData = App.tsx + hailExperiences)
 */
const seedData = require("../data/seedData");

function buildDescription(exp) {
  return [
    exp.title,
    `تصنيف: ${exp.category}`,
    `المنطقة: ${exp.region}`,
    `المدة: ${exp.duration}`,
    `السعر: ${exp.price} ريال للشخص`,
    `المضيف: ${exp.host}`,
    `حتى ${exp.maxGroup} أشخاص`,
    `التقييم: ${exp.rating} (${exp.reviews} مراجعة)`,
    `الوسوم: ${(exp.tags || []).join("، ")}`,
    exp.heritageStory ? `قصة تراثية: ${exp.heritageStory}` : "",
    exp.featured ? "تجربة مميزة" : "",
  ]
    .filter(Boolean)
    .join(". ");
}

/** تحويل تجربة إلى مستند RAG */
function experienceToDocument(exp) {
  const description = buildDescription(exp);
  const text = `${exp.title}. ${description}`;

  return {
    id: exp.legacyId ?? exp.id,
    title: exp.title,
    region: exp.region,
    category: exp.category,
    price: exp.price,
    duration: exp.duration,
    rating: exp.rating,
    reviews: exp.reviews,
    host: exp.host,
    maxGroup: exp.maxGroup,
    tags: exp.tags || [],
    featured: !!exp.featured,
    imageUrl: exp.imageUrl,
    description,
    text,
  };
}

function loadKnowledgeDocuments() {
  return seedData.map(experienceToDocument);
}

module.exports = { loadKnowledgeDocuments, buildDescription };
