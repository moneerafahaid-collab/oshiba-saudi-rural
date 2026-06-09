require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { migrate } = require("../db/migrate");
const { seedDatabase } = require("../utils/seedDatabase");
const { seedUsers } = require("../utils/seedUsers");
const { seedPanelData } = require("../utils/seedPanelData");

async function run() {
  const force = process.argv.includes("--force");
  await migrate();
  console.log("✓ متصل بـ PostgreSQL");
  await seedDatabase(force);
  await seedUsers();
  await seedPanelData();
  console.log("✓ انتهى");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
