const { query } = require("../db/pool");
const { mapUser } = require("../db/rowMap");
const { buildWhere } = require("../db/buildWhere");

const COL_MAP = {
  phone: "phone",
  role: "role",
  active: "active",
  id: "id",
  _id: "id",
};

function findOne(filter = {}) {
  const q = new UserQuery(filter);
  q._single = true;
  return q;
}

function find(filter = {}) {
  return new UserQuery(filter);
}

async function create(data) {
  const { rows } = await query(
    `INSERT INTO users (
      phone, password_hash, name, role, provider_host, active,
      email, age, interest_type, profile_completed
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      data.phone,
      data.passwordHash,
      data.name,
      data.role,
      data.providerHost || null,
      data.active !== false,
      data.email || null,
      data.age != null ? Number(data.age) : null,
      data.interestType || null,
      data.profileCompleted === true,
    ]
  );
  return mapUser(rows[0]);
}

async function updateProfile(phone, data) {
  const { rows } = await query(
    `UPDATE users SET
       interest_type = $2,
       profile_completed = TRUE,
       updated_at = NOW()
     WHERE phone = $1 AND role = 'visitor'
     RETURNING *`,
    [phone, data.interestType]
  );
  return mapUser(rows[0]);
}

async function findOneAndUpdate(filter, update, options = {}) {
  const existing = await findOne(filter).lean();
  const merged = {
    phone: update.phone ?? existing?.phone,
    passwordHash: update.passwordHash ?? existing?.passwordHash,
    name: update.name ?? existing?.name,
    role: update.role ?? existing?.role,
    providerHost: update.providerHost ?? existing?.providerHost ?? null,
    active: update.active ?? existing?.active ?? true,
    email: update.email ?? existing?.email ?? null,
    age: update.age ?? existing?.age ?? null,
    interestType: update.interestType ?? existing?.interestType ?? null,
    profileCompleted: update.profileCompleted ?? existing?.profileCompleted ?? false,
  };

  if (options.upsert) {
    const { rows } = await query(
      `INSERT INTO users (
        phone, password_hash, name, role, provider_host, active,
        email, age, interest_type, profile_completed
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (phone) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         provider_host = EXCLUDED.provider_host,
         active = EXCLUDED.active,
         email = EXCLUDED.email,
         age = EXCLUDED.age,
         interest_type = EXCLUDED.interest_type,
         profile_completed = EXCLUDED.profile_completed,
         updated_at = NOW()
       RETURNING *`,
      [
        merged.phone,
        merged.passwordHash,
        merged.name,
        merged.role,
        merged.providerHost,
        merged.active,
        merged.email,
        merged.age,
        merged.interestType,
        merged.profileCompleted,
      ]
    );
    return mapUser(rows[0]);
  }

  if (!existing) return null;
  const { rows } = await query(
    `UPDATE users SET
       password_hash = COALESCE($2, password_hash),
       name = COALESCE($3, name),
       role = COALESCE($4, role),
       provider_host = $5,
       active = COALESCE($6, active),
       email = COALESCE($7, email),
       age = COALESCE($8, age),
       interest_type = COALESCE($9, interest_type),
       profile_completed = COALESCE($10, profile_completed),
       updated_at = NOW()
     WHERE phone = $1
     RETURNING *`,
    [
      filter.phone || existing.phone,
      update.passwordHash ?? null,
      update.name ?? null,
      update.role ?? null,
      update.providerHost !== undefined ? update.providerHost : existing.providerHost,
      update.active ?? null,
      update.email ?? null,
      update.age ?? null,
      update.interestType ?? null,
      update.profileCompleted ?? null,
    ]
  );
  return mapUser(rows[0]);
}

async function deleteOne(filter) {
  const { where, params } = buildWhere(filter, COL_MAP);
  await query(`DELETE FROM users ${where}`, params);
  return { deletedCount: 1 };
}

async function countDocuments(filter = {}) {
  const { where, params } = buildWhere(filter, COL_MAP);
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM users ${where}`, params);
  return rows[0].c;
}

async function getVisitorAnalytics() {
  const { rows: interestRows } = await query(
    `SELECT interest_type, COUNT(*)::int AS count
     FROM users WHERE role = 'visitor' AND active = TRUE AND interest_type IS NOT NULL
     GROUP BY interest_type`
  );
  const { rows: ageRows } = await query(
    `SELECT
       CASE
         WHEN age < 18 THEN 'أقل من 18'
         WHEN age BETWEEN 18 AND 25 THEN '18-25'
         WHEN age BETWEEN 26 AND 35 THEN '26-35'
         WHEN age BETWEEN 36 AND 50 THEN '36-50'
         ELSE '50+'
       END AS bucket,
       COUNT(*)::int AS count
     FROM users WHERE role = 'visitor' AND active = TRUE AND age IS NOT NULL
     GROUP BY bucket
     ORDER BY bucket`
  );
  const { rows: totalRow } = await query(
    `SELECT COUNT(*)::int AS total FROM users WHERE role = 'visitor' AND active = TRUE`
  );
  const { rows: completedRow } = await query(
    `SELECT COUNT(*)::int AS c FROM users WHERE role = 'visitor' AND profile_completed = TRUE`
  );
  return {
    totalVisitors: totalRow[0]?.total || 0,
    profilesCompleted: completedRow[0]?.c || 0,
    byInterest: interestRows.map((r) => ({
      type: r.interest_type,
      count: r.count,
    })),
    byAge: ageRows.map((r) => ({ bucket: r.bucket, count: r.count })),
  };
}

class UserQuery {
  constructor(filter) {
    this.filter = filter;
    this.sortSpec = { createdAt: -1 };
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
    const sortParts = [];
    for (const [k, d] of Object.entries(this.sortSpec || {})) {
      const col = k === "createdAt" ? "created_at" : k;
      sortParts.push(`${col} ${d === -1 ? "DESC" : "ASC"}`);
    }
    const order = sortParts.length ? `ORDER BY ${sortParts.join(", ")}` : "";
    const limitN = this._single ? 1 : this.limitN;
    const limit = limitN ? `LIMIT ${limitN}` : "";
    const { rows } = await query(
      `SELECT * FROM users ${where} ${order} ${limit}`,
      params
    );
    const docs = rows.map(mapUser);
    return this._single ? docs[0] || null : docs;
  }
}

module.exports = {
  findOne,
  find,
  create,
  updateProfile,
  findOneAndUpdate,
  deleteOne,
  countDocuments,
  getVisitorAnalytics,
};
