import { MapPin, Navigation } from "lucide-react";
import { getRegionSpotlight } from "../data/regionSpotlight";
import { assetUrl } from "../utils/assetUrl";
import type { LocationStatus } from "../hooks/useUserRegion";

interface RegionSpotlightProps {
  fullRegion: string | null;
  status: LocationStatus;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  onRequestLocation: () => void;
}

export function RegionSpotlight({
  fullRegion,
  status,
  selectedRegion,
  onSelectRegion,
  onRequestLocation,
}: RegionSpotlightProps) {
  if (status === "requesting") {
    return (
      <section className="mb-10 rounded-2xl overflow-hidden border border-border bg-card animate-pulse">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-6 sm:p-8 space-y-4">
            <div className="h-8 bg-muted rounded-lg w-2/3" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-16 bg-muted rounded-full" />
              ))}
            </div>
          </div>
          <div className="h-48 md:h-auto min-h-[12rem] bg-muted" />
        </div>
        <p className="text-center text-xs text-muted-foreground py-3 flex items-center justify-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 animate-pulse" />
          جاري تحديد منطقتك…
        </p>
      </section>
    );
  }

  if (status === "denied" || status === "unsupported" || status === "outside") {
    return (
      <section className="mb-10 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-right flex-1">
          <p className="text-sm font-bold text-foreground mb-1 flex items-center gap-2 justify-end sm:justify-start">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            {status === "outside"
              ? "موقعك خارج نطاق المنصة حالياً"
              : "فعّل الموقع لاكتشاف منطقتك"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {status === "outside"
              ? "نعرض تجارب المملكة كاملة — يمكنك اختيار منطقتك من القائمة أدناه."
              : "اسمح بالوصول للموقع لنعرض لك «اكتشف ريف منطقتك» مع صورة ووصف مخصّص."}
          </p>
        </div>
        {status !== "outside" && (
          <button
            type="button"
            onClick={onRequestLocation}
            className="shrink-0 flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl px-5 py-2.5 hover:bg-primary/90 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            تفعيل الموقع
          </button>
        )}
      </section>
    );
  }

  if (!fullRegion) return null;

  const spotlight = getRegionSpotlight(fullRegion);
  if (!spotlight) return null;

  return (
    <section className="mb-10 rounded-2xl overflow-hidden border border-primary/30 bg-gradient-to-l from-primary/15 via-card to-card">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            أنت في {spotlight.name}
          </p>
          <h2
            className="text-2xl sm:text-3xl font-black text-foreground mb-3"
            style={{ fontFamily: "'Noto Serif Arabic', serif" }}
          >
            اكتشف ريف {spotlight.name}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {spotlight.description}
            <br />
            <span className="text-foreground font-semibold mt-2 block">
              {spotlight.highlight}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {spotlight.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-secondary text-secondary-foreground rounded-full px-3 py-1 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          {selectedRegion !== spotlight.fullRegion && (
            <button
              type="button"
              onClick={() => onSelectRegion(spotlight.fullRegion)}
              className="mt-4 w-fit text-sm font-bold text-primary hover:underline"
            >
              عرض تجارب {spotlight.name} فقط ←
            </button>
          )}
        </div>
        <div className="relative h-48 md:h-auto min-h-[12rem]">
          <img
            src={assetUrl(spotlight.imageUrl)}
            alt={spotlight.imageAlt}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-card via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
