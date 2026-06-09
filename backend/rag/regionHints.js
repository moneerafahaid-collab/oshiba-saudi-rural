/** ربط أسماء المناطق المختصرة بالاسم الكامل في قاعدة البيانات */
const REGION_ALIASES = [
  { keys: ["حائل", "منطقة حائل"], full: "منطقة حائل" },
  { keys: ["عسير", "منطقة عسير"], full: "منطقة عسير" },
  { keys: ["الأحساء", "الاحساء", "الشرقية", "المنطقة الشرقية"], full: "المنطقة الشرقية" },
  { keys: ["الطائف", "مكة", "منطقة مكة المكرمة"], full: "منطقة مكة المكرمة" },
  { keys: ["جازان", "منطقة جازان"], full: "منطقة جازان" },
  { keys: ["الباحة", "منطقة الباحة"], full: "منطقة الباحة" },
  { keys: ["المدينة", "منطقة المدينة المنورة"], full: "منطقة المدينة المنورة" },
  { keys: ["الرياض", "منطقة الرياض"], full: "منطقة الرياض" },
  { keys: ["القصيم", "منطقة القصيم"], full: "منطقة القصيم" },
  { keys: ["تبوك", "منطقة تبوك"], full: "منطقة تبوك" },
  { keys: ["نجران", "منطقة نجران"], full: "منطقة نجران" },
  { keys: ["الجوف", "منطقة الجوف"], full: "منطقة الجوف" },
  { keys: ["الحدود الشمالية"], full: "منطقة الحدود الشمالية" },
];

function resolveRegionFromText(text) {
  const t = String(text || "");
  for (const { keys, full } of REGION_ALIASES) {
    if (keys.some((k) => t.includes(k))) return full;
  }
  return null;
}

function resolveRegion(profile = {}, history = [], message = "") {
  const fromProfile = profile.region;
  if (fromProfile && fromProfile !== "all-regions" && fromProfile !== "جميع المناطق") {
    return fromProfile;
  }

  const userLines = history
    .filter((h) => h.role === "user")
    .map((h) => h.content)
    .join(" ");
  const combined = `${userLines} ${message}`;
  return resolveRegionFromText(combined);
}

module.exports = { REGION_ALIASES, resolveRegion, resolveRegionFromText };
