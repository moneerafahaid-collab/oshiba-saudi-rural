require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { runIngest } = require("../rag/ingest");

runIngest(true)
  .then(() => {
    console.log("✓ اكتملت إعادة الفهرسة");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
