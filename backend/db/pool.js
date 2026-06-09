const { Pool } = require("pg");

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL غير معرّف في .env");
    }
    const isProduction = process.env.NODE_ENV === "production";
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    });
    pool.on("error", (err) => {
      console.error("خطأ غير متوقع في اتصال PostgreSQL:", err.message);
    });
  }
  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function isConnected() {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

module.exports = { getPool, query, withTransaction, isConnected };
