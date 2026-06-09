/** مراكز تقريبية لمناطق المملكة — لتحديد أقرب منطقة من إحداثيات المستخدم */
const REGION_CENTERS: { fullRegion: string; lat: number; lng: number }[] = [
  { fullRegion: "منطقة حائل", lat: 27.5114, lng: 41.69 },
  { fullRegion: "منطقة جازان", lat: 16.8892, lng: 42.5511 },
  { fullRegion: "منطقة عسير", lat: 18.2164, lng: 42.5053 },
  { fullRegion: "منطقة الرياض", lat: 24.7136, lng: 46.6753 },
  { fullRegion: "منطقة مكة المكرمة", lat: 21.2854, lng: 40.4153 },
  { fullRegion: "منطقة المدينة المنورة", lat: 24.4672, lng: 39.6111 },
  { fullRegion: "المنطقة الشرقية", lat: 25.3852, lng: 49.5867 },
  { fullRegion: "منطقة الباحة", lat: 20.0129, lng: 41.4677 },
  { fullRegion: "منطقة القصيم", lat: 26.326, lng: 43.975 },
  { fullRegion: "منطقة تبوك", lat: 28.3838, lng: 36.555 },
  { fullRegion: "منطقة نجران", lat: 17.4933, lng: 44.1277 },
  { fullRegion: "منطقة الجوف", lat: 29.9697, lng: 40.2064 },
  { fullRegion: "منطقة الحدود الشمالية", lat: 30.9753, lng: 41.0381 },
];

const KSA_BOUNDS = {
  minLat: 16,
  maxLat: 32.5,
  minLng: 34,
  maxLng: 56,
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isInsideSaudiArabia(lat: number, lng: number) {
  return (
    lat >= KSA_BOUNDS.minLat &&
    lat <= KSA_BOUNDS.maxLat &&
    lng >= KSA_BOUNDS.minLng &&
    lng <= KSA_BOUNDS.maxLng
  );
}

export function detectRegionFromCoords(lat: number, lng: number): string | null {
  if (!isInsideSaudiArabia(lat, lng)) return null;

  let closest = REGION_CENTERS[0];
  let minDist = Infinity;

  for (const center of REGION_CENTERS) {
    const d = distanceKm(lat, lng, center.lat, center.lng);
    if (d < minDist) {
      minDist = d;
      closest = center;
    }
  }

  return closest.fullRegion;
}

export const USER_REGION_STORAGE_KEY = "reef_user_region";
