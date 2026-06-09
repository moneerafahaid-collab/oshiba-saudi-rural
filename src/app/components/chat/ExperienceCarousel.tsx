import { useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Star, BookOpen } from "lucide-react";
import type { ChatSource } from "../../api/client";
import { assetUrl } from "../../utils/assetUrl";

export type CarouselItem = ChatSource & {
  imageUrl?: string;
  reviews?: number;
  featured?: boolean;
  hasStory?: boolean;
};

interface ExperienceCarouselProps {
  title: string;
  items: CarouselItem[];
  onSelect?: (item: CarouselItem) => void;
  onBook?: (item: CarouselItem) => void;
  onStory?: (item: CarouselItem) => void;
  variant?: "horizontal" | "rich";
}

export function ExperienceCarousel({
  title,
  items,
  onSelect,
  onBook,
  onStory,
  variant = "rich",
}: ExperienceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items.length) return null;

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "next" ? -amountForVariant() : amountForVariant(),
      behavior: "smooth",
    });
  };

  const amountForVariant = () => (variant === "rich" ? 272 : 300);

  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-foreground mb-3 text-right px-1">{title}</h3>
      <div className="relative group/carousel">
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scroll("prev")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors opacity-90"
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("next")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors opacity-90"
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory px-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) =>
            variant === "rich" ? (
              <RichCard
                key={String(item.id)}
                item={item}
                onSelect={onSelect}
                onBook={onBook}
                onStory={onStory}
              />
            ) : (
              <HorizontalCard key={String(item.id)} item={item} onSelect={onSelect} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function RichCard({
  item,
  onSelect,
  onBook,
  onStory,
}: {
  item: CarouselItem;
  onSelect?: (item: CarouselItem) => void;
  onBook?: (item: CarouselItem) => void;
  onStory?: (item: CarouselItem) => void;
}) {
  return (
    <article className="snap-start shrink-0 w-[260px] bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden flex flex-col text-right">
      <div className="relative h-[130px] bg-muted shrink-0">
        {item.imageUrl ? (
          <img
            src={assetUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-3xl">
            🌿
          </div>
        )}
        <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
          {item.category}
        </span>
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/45 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-[10px]">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[140px]">{item.region}</span>
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1 gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1">
            {item.title}
          </h4>
          {item.rating != null && (
            <span className="shrink-0 flex items-center gap-0.5 bg-muted rounded-lg px-1.5 py-0.5 text-[10px] font-bold">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              {item.rating}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-sm font-bold text-primary">{item.price} ر.س</span>
          {item.duration && (
            <span className="text-[10px] text-muted-foreground">{item.duration}</span>
          )}
        </div>

        <div className="flex gap-2">
          {onBook && (
            <button
              type="button"
              onClick={() => onBook(item)}
              className="flex-1 text-[11px] font-bold rounded-xl py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              احجز
            </button>
          )}
          {onStory && item.hasStory && (
            <button
              type="button"
              onClick={() => onStory(item)}
              className="flex-1 text-[11px] font-bold rounded-xl py-2 border-2 border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              قصة
            </button>
          )}
          {!onBook && !onStory && onSelect && (
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-[11px] font-bold rounded-xl py-2 bg-primary text-primary-foreground"
            >
              اختر
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function HorizontalCard({
  item,
  onSelect,
}: {
  item: CarouselItem;
  onSelect?: (item: CarouselItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="snap-start shrink-0 w-[280px] bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden flex text-right"
    >
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div>
          <p className="text-[11px] text-muted-foreground mb-1">{item.category}</p>
          <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {item.title}
          </p>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <span className="truncate">{item.region}</span>
            <MapPin className="w-3 h-3 shrink-0 text-accent" />
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-primary">{item.price} ر.س</span>
            {item.rating != null && (
              <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                {item.rating}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="w-[100px] shrink-0 relative bg-muted">
        {item.imageUrl ? (
          <img
            src={assetUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full min-h-[120px] object-cover"
          />
        ) : (
          <div className="w-full h-full min-h-[120px] bg-primary/10 flex items-center justify-center text-2xl">
            🌿
          </div>
        )}
      </div>
    </button>
  );
}
