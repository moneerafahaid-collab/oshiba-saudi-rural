const { query } = require("../db/pool");
const { mapExperience, experienceFromSeed, isUuid } = require("../db/rowMap");
const { buildWhere, buildSort } = require("../db/buildWhere");

const COL_MAP = {
  region: "region",
  category: "category",
  featured: "featured",
  active: "active",
  host: "host",
  legacyId: "legacy_id",
  id: "id",
  _id: "id",
};

function normalizeFilter(filter) {
  const f = { ...filter };
  if (f.legacyId != null) {
    f.legacy_id = f.legacyId;
    delete f.legacyId;
  }
  if (f._id) {
    f.id = f._id;
    delete f._id;
  }
  return f;
}

function findOne(filter = {}) {
  const q = new ExperienceQuery(normalizeFilter(filter));
  q._single = true;
  return q;
}

function find(filter = {}) {
  return new ExperienceQuery(normalizeFilter(filter));
}

async function create(data) {
  const row = experienceFromSeed(data);
  const { rows } = await query(
    `INSERT INTO experiences (
      legacy_id, title, region, category, price, duration, rating, reviews_count,
      image_url, host, max_group, tags, featured, active, description,
      booking_includes, booking_options, heritage_story, host_story, host_name,
      host_title, why_special, preview_images
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16::jsonb,$17::jsonb,
      $18,$19,$20,$21,$22,$23::jsonb
    ) RETURNING *`,
    [
      row.legacy_id,
      row.title,
      row.region,
      row.category,
      row.price,
      row.duration,
      row.rating,
      row.reviews_count,
      row.image_url,
      row.host,
      row.max_group,
      row.tags,
      row.featured,
      row.active,
      row.description,
      row.booking_includes,
      row.booking_options,
      row.heritage_story,
      row.host_story,
      row.host_name,
      row.host_title,
      row.why_special,
      row.preview_images,
    ]
  );
  return mapExperience(rows[0]);
}

async function insertMany(docs) {
  const results = [];
  for (const doc of docs) {
    results.push(await create(doc));
  }
  return results;
}

async function countDocuments(filter = {}) {
  const f = normalizeFilter(filter);
  const { where, params } = buildWhere(f, COL_MAP);
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM experiences ${where}`, params);
  return rows[0].c;
}

async function deleteMany(filter = {}) {
  const f = normalizeFilter(filter);
  const { where, params } = buildWhere(f, COL_MAP);
  if (!where) {
    await query("DELETE FROM experiences");
  } else {
    await query(`DELETE FROM experiences ${where}`, params);
  }
}

async function findOneAndUpdate(filter, update, options = {}) {
  const existing = await findOne(filter).lean();
  if (!existing) return null;

  const active = update.active !== undefined ? update.active : existing.active;
  const { rows } = await query(
    `UPDATE experiences SET active = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [existing._id, active]
  );
  const doc = mapExperience(rows[0]);
  return options.returnDocument === "after" ? doc : existing;
}

async function distinct(field, filter = {}) {
  const f = normalizeFilter(filter);
  const { where, params } = buildWhere(f, COL_MAP);
  const col = field === "region" ? "region" : field === "category" ? "category" : field;
  const { rows } = await query(
    `SELECT DISTINCT ${col} AS v FROM experiences ${where} ORDER BY v`,
    params
  );
  return rows.map((r) => r.v);
}

class ExperienceQuery {
  constructor(filter) {
    this.filter = filter || {};
    this.sortSpec = null;
    this.limitN = null;
    this._single = false;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(n) {
    this.limitN = n;
    return this;
  }

  select() {
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
    const limitN = this._single ? 1 : this.limitN;
    const limit = limitN ? `LIMIT ${limitN}` : "";
    const { rows } = await query(
      `SELECT * FROM experiences ${where} ${order} ${limit}`,
      params
    );
    const docs = rows.map(mapExperience);
    return this._single ? docs[0] || null : docs;
  }
}

module.exports = {
  findOne,
  find,
  create,
  insertMany,
  countDocuments,
  deleteMany,
  findOneAndUpdate,
  distinct,
  isUuid,
};
