const fs = require("fs");
const path = require("path");
const { query } = require("./pool");

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  await query(fs.readFileSync(schemaPath, "utf8"));

  const profilePath = path.join(__dirname, "profileMigration.sql");
  if (fs.existsSync(profilePath)) {
    await query(fs.readFileSync(profilePath, "utf8"));
  }

  console.log("✓ تم تطبيق مخطط PostgreSQL");
}

module.exports = { migrate };
