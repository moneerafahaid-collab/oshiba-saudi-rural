import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ChoiceItem {
  id: string;
  label: string;
  subtitle?: string;
  emoji?: string;
  imageUrl?: string;
}

interface ChoiceCarouselProps {
  title: string;
  items: ChoiceItem[];
  onSelect: (item: ChoiceItem) => void;
  variant?: "compact" | "image";
}

export function ChoiceCarousel({
  title,
  items,
  onSelect,
  variant = "compact",
}: ChoiceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "prev" | "next") => {
    scrollRef.current?.scrollBy({
      left: direction === "next" ? -280 : 280,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-foreground mb-3 text-right px-1">{title}</h3>
      <div className="relative group/carousel">
        <button
          type="button"
          onClick={() => scroll("prev")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted opacity-90"
          aria-label="السابق"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll("next")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted opacity-90"
          aria-label="التالي"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory px-1"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`snap-start shrink-0 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all text-right overflow-hidden flex ${
                variant === "image" ? "w-[260px]" : "w-[200px]"
              }`}
            >
              {variant === "image" && item.imageUrl ? (
                <>
                  <div className="flex-1 p-3.5 flex flex-col justify-center min-w-0">
                    <p className="text-[11px] text-muted-foreground mb-0.5">
                      {item.subtitle}
                    </p>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {item.label}
                    </p>
                  </div>
                  <div className="w-[90px] shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.label}
                      className="w-full h-full min-h-[100px] object-cover"
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 w-full">
                  {item.emoji && (
                    <span className="text-2xl mb-2 block">{item.emoji}</span>
                  )}
                  <p className="text-sm font-bold text-foreground">{item.label}</p>
                  {item.subtitle && (
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
