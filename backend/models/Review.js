const { query } = require("../db/pool");
const { mapReview } = require("../db/rowMap");
const { buildWhere, buildSort } = require("../db/buildWhere");

const COL_MAP = {
  host: "host",
  visible: "visible",
  featured: "featured",
  id: "id",
  _id: "id",
};

async function create(data) {
  const { rows } = await query(
    `INSERT INTO reviews (
      experience_id, experience_title, host, user_name, user_phone,
      rating, comment, visible, featured, highlight
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      data.experienceId || null,
      data.experienceTitle,
      data.host || null,
      data.userName,
      data.userPhone || null,
      data.rating,
      data.comment,
      data.visible !== false,
      data.featured || false,
      data.highlight || "experience",
    ]
  );
  return mapReview(rows[0]);
}

async function insertMany(docs) {
  const results = [];
  for (const doc of docs) {
    results.push(await create(doc));
  }
  return results;
}

function find(filter = {}) {
  return new ReviewQuery(filter);
}

async function countDocuments(filter = {}) {
  const { where, params } = buildWhere(filter, COL_MAP);
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM reviews ${where}`, params);
  return rows[0].c;
}

async function findByIdAndUpdate(id, update, options = {}) {
  const sets = [];
  const params = [id];
  let idx = 2;

  if (update.visible === false) {
    sets.push(`visible = $${idx++}`);
    params.push(false);
  }
  if (typeof update.featured === "boolean") {
    sets.push(`featured = $${idx++}`);
    params.push(update.featured);
  }
  if (update.highlight) {
    sets.push(`highlight = $${idx++}`);
    params.push(update.highlight);
  }

  if (!sets.length) return null;

  sets.push("updated_at = NOW()");
  const { rows } = await query(
    `UPDATE reviews SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    params
  );
  const doc = mapReview(rows[0]);
  return options.returnDocument === "after" ? doc : doc;
}

class ReviewQuery {
  constructor(filter) {
    this.filter = filter;
    this.sortSpec = { createdAt: -1 };
    this.limitN = null;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(n) {
    this.limitN = n;
    return this;
  }

  lean() {
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }

  async exec() {
    const { where, params } = buildWhere(this.filter, COL_MAP);
    const order = buildSort(this.sortSpec);
    const limit = this.limitN ? `LIMIT ${this.limitN}` : "";
    const { rows } = await query(
      `SELECT * FROM reviews ${where} ${order} ${limit}`,
      params
    );
    return rows.map(mapReview);
  }
}

module.exports = {
  create,
  insertMany,
  find,
  countDocuments,
  findByIdAndUpdate,
};
