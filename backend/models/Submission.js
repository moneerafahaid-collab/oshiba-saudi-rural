const { query } = require("../db/pool");
const { mapSubmission } = require("../db/rowMap");
const { buildWhere, buildSort } = require("../db/buildWhere");

const COL_MAP = {
  status: "status",
  id: "id",
  _id: "id",
};

async function create(data) {
  const { rows } = await query(
    `INSERT INTO submissions (title, region, category, price, duration, host_name, phone, description, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.title,
      data.region,
      data.category,
      data.price,
      data.duration,
      data.hostName,
      data.phone,
      data.description,
      data.status || "pending",
    ]
  );
  return mapSubmission(rows[0]);
}

function find(filter = {}) {
  return new SubmissionQuery(filter);
}

async function findByIdAndUpdate(id, update, options = {}) {
  const status = update.status;
  const { rows } = await query(
    `UPDATE submissions SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  const doc = mapSubmission(rows[0]);
  return options.returnDocument === "after" ? doc : doc;
}

async function countDocuments(filter = {}) {
  const { where, params } = buildWhere(filter, COL_MAP);
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM submissions ${where}`, params);
  return rows[0].c;
}

class SubmissionQuery {
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
      `SELECT * FROM submissions ${where} ${order} ${limit}`,
      params
    );
    return rows.map(mapSubmission);
  }
}

module.exports = {
  create,
  find,
  findByIdAndUpdate,
  countDocuments,
};
