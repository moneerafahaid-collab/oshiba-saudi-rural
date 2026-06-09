const Experience = require("../models/Experience");
const seedData = require("../data/seedData");

async function seedDatabase(force = false) {
  const count = await Experience.countDocuments();

  if (count > 0 && !force) {
    console.log(`✓ قاعدة البيانات تحتوي على ${count} تجربة — تخطي التعبئة`);
    return { seeded: false, count };
  }

  if (force) {
    await Experience.deleteMany({});
    console.log("↻ تم مسح التجارب السابقة");
  }

  await Experience.insertMany(seedData);
  console.log(`✓ تم تعبئة ${seedData.length} تجربة في PostgreSQL`);
  return { seeded: true, count: seedData.length };
}

module.exports = { seedDatabase };
