const { query, withTransaction } = require("../db/pool");
const { mapBooking } = require("../db/rowMap");
const { buildWhere, buildSort } = require("../db/buildWhere");

const COL_MAP = {
  invoiceNumber: "invoice_number",
  experienceId: "experience_id",
  host: "host",
  userPhone: "user_phone",
  status: "status",
  id: "id",
  _id: "id",
};

async function create(data) {
  return withTransaction(async (client) => {
    const { rows: expRows } = await client.query(
      `SELECT id, title, region, host, price, max_group, active
       FROM experiences WHERE id = $1 FOR UPDATE`,
      [data.experienceId]
    );
    const exp = expRows[0];
    if (!exp || !exp.active) {
      const err = new Error("التجربة غير موجودة");
      err.status = 404;
      throw err;
    }

    const guestCount = Number(data.guests);
    if (guestCount < 1 || guestCount > exp.max_group) {
      const err = new Error(`عدد الأشخاص يجب أن يكون بين ١ و ${exp.max_group}`);
      err.status = 400;
      throw err;
    }

    const { rows } = await client.query(
      `INSERT INTO bookings (
        invoice_number, experience_id, experience_title, experience_region, host,
        date_label, time_label, guests, group_type, payment_method,
        price_per_person, subtotal, service_fee, total, user_phone, user_name, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *`,
      [
        data.invoiceNumber,
        data.experienceId,
        data.experienceTitle ?? exp.title,
        data.experienceRegion ?? exp.region,
        data.host ?? exp.host,
        data.dateLabel,
        data.timeLabel,
        guestCount,
        data.groupType,
        data.paymentMethod,
        data.pricePerPerson ?? exp.price,
        data.subtotal,
        data.serviceFee,
        data.total,
        data.userPhone || null,
        data.userName || null,
        data.status || "confirmed",
      ]
    );
    return mapBooking(rows[0]);
  });
}

function findOne(filter = {}) {
  const q = new BookingQuery(filter);
  q._single = true;
  return q;
}

function find(filter = {}) {
  return new BookingQuery(filter);
}

async function findOneAndUpdate(filter, update, options = {}) {
  const existing = await findOne(filter).lean();
  if (!existing) return null;

  const status = update.status ?? existing.status;
  const extraHost = filter.host ? ` AND host = $3` : "";
  const params = filter.host
    ? [filter.invoiceNumber, status, filter.host]
    : [filter.invoiceNumber, status];

  const { rows } = await query(
    `UPDATE bookings SET status = $2, updated_at = NOW()
     WHERE invoice_number = $1${extraHost}
     RETURNING *`,
    params
  );
  const doc = mapBooking(rows[0]);
  return options.returnDocument === "after" ? doc : existing;
}

async function countDocuments(filter = {}) {
  const { where, params } = buildWhere(filter, COL_MAP);
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM bookings ${where}`, params);
  return rows[0].c;
}

async function aggregate(pipeline) {
  const groupStage = pipeline.find((s) => s.$group);
  const matchStage = pipeline.find((s) => s.$match);

  let where = "";
  const params = [];
  if (matchStage?.$match?.status) {
    where = "WHERE status = $1";
    params.push(matchStage.$match.status);
  }

  if (groupStage?.$group?.total?.$sum === "$total") {
    const { rows } = await query(
      `SELECT COALESCE(SUM(total), 0)::int AS total FROM bookings ${where}`,
      params
    );
    return [{ total: rows[0].total }];
  }

  const { rows } = await query(
    `SELECT COALESCE(SUM(total), 0)::int AS total FROM bookings ${where}`,
    params
  );
  return [{ total: rows[0].total }];
}

class BookingQuery {
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
      `SELECT * FROM bookings ${where} ${order} ${limit}`,
      params
    );
    const docs = rows.map(mapBooking);
    return this._single ? docs[0] || null : docs;
  }
}

module.exports = {
  create,
  findOne,
  find,
  findOneAndUpdate,
  countDocuments,
  aggregate,
};
