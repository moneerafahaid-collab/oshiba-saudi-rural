const { isUuid } = require("./rowMap");

function buildWhere(filter = {}, columnMap = {}) {
  const clauses = [];
  const params = [];
  let idx = 1;

  const col = (key) => columnMap[key] || key;

  for (const [key, value] of Object.entries(filter)) {
    if (key === "$or") continue;
    if (value === undefined) continue;

    if (key === "_id" || key === "id") {
      clauses.push(`${col("id")} = $${idx++}`);
      params.push(String(value));
      continue;
    }

    const dbCol = col(key);
    clauses.push(`${dbCol} = $${idx++}`);
    params.push(value);
  }

  if (filter.$or && Array.isArray(filter.$or)) {
    const orParts = [];
    for (const orItem of filter.$or) {
      for (const [key, val] of Object.entries(orItem)) {
        if (val?.$regex) {
          const dbCol = col(key);
          orParts.push(`${dbCol} ILIKE $${idx++}`);
          params.push(`%${val.$regex}%`);
        }
      }
    }
    if (orParts.length) clauses.push(`(${orParts.join(" OR ")})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

function buildSort(sortSpec) {
  if (!sortSpec) return "";
  const parts = [];
  for (const [field, dir] of Object.entries(sortSpec)) {
    const col =
      field === "createdAt"
        ? "created_at"
        : field === "legacyId"
          ? "legacy_id"
          : field === "updatedAt"
            ? "updated_at"
            : field.replace(/([A-Z])/g, "_$1").toLowerCase();
    parts.push(`${col} ${dir === -1 ? "DESC" : "ASC"}`);
  }
  return parts.length ? `ORDER BY ${parts.join(", ")}` : "";
}

function resolveExperienceFilter(filter) {
  const mapped = { ...filter };
  if (mapped.legacyId != null) {
    mapped.legacy_id = mapped.legacyId;
    delete mapped.legacyId;
  }
  if (mapped._id) {
    mapped.id = mapped._id;
    delete mapped._id;
  }
  if (mapped.maxGroup != null) {
    mapped.max_group = mapped.maxGroup;
    delete mapped.maxGroup;
  }
  if (mapped.imageUrl) {
    mapped.image_url = mapped.imageUrl;
    delete mapped.imageUrl;
  }
  return mapped;
}

function resolveIdFilter(filter, idField = "id") {
  const f = { ...filter };
  if (f._id) {
    f[idField] = f._id;
    delete f._id;
  }
  if (f.legacyId != null) {
    f.legacy_id = f.legacyId;
    delete f.legacyId;
  }
  return f;
}

module.exports = { buildWhere, buildSort, resolveExperienceFilter, resolveIdFilter, isUuid };
