const { query } = require("../db/pool");
const { mapInquiry } = require("../db/rowMap");
const { buildWhere, buildSort } = require("../db/buildWhere");

const COL_MAP = {
  status: "status",
  id: "id",
  _id: "id",
};

async function create(data) {
  const { rows } = await query(
    `INSERT INTO inquiries (user_name, user_phone, subject, message, status)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [
      data.userName,
      data.userPhone || null,
      data.subject,
      data.message,
      data.status || "open",
    ]
  );
  return mapInquiry(rows[0]);
}

async function insertMany(docs) {
  const results = [];
  for (const doc of docs) {
    results.push(await create(doc));
  }
  return results;
}

function find(filter = {}) {
  return new InquiryQuery(filter);
}

async function countDocuments(filter = {}) {
  const { where, params } = buildWhere(filter, COL_MAP);
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM inquiries ${where}`, params);
  return rows[0].c;
}

async function findByIdAndUpdate(id, update, options = {}) {
  const { rows } = await query(
    `UPDATE inquiries SET
       admin_reply = $2,
       status = $3,
       replied_at = NOW(),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, update.adminReply, update.status || "answered"]
  );
  const doc = mapInquiry(rows[0]);
  return options.returnDocument === "after" ? doc : doc;
}

class InquiryQuery {
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
      `SELECT * FROM inquiries ${where} ${order} ${limit}`,
      params
    );
    return rows.map(mapInquiry);
  }
}

module.exports = {
  create,
  insertMany,
  find,
  countDocuments,
  findByIdAndUpdate,
};
