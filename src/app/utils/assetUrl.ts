/** مسار أصول public مع دعم GitHub Pages (base path) */
export function assetUrl(path: string): string {
  if (!path) return path;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL || "/";

  // تجنّب تكرار base path (مثلاً عند تطبيق assetUrl مرتين)
  if (path.startsWith(base)) {
    return path;
  }

  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${normalized}`;
}
