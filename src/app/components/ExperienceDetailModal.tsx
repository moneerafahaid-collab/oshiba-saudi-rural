import {
  X,
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle,
  BookOpen,
  Home,
  Trees,
} from "lucide-react";
import type { Experience } from "../App";
import { getDetailFallback } from "../data/experienceEnrichment";
import { assetUrl } from "../utils/assetUrl";

interface ExperienceDetailModalProps {
  experience: Experience;
  onClose: () => void;
  onBook: () => void;
  onOpenStory?: () => void;
}

export function ExperienceDetailModal({
  experience,
  onClose,
  onBook,
  onOpenStory,
}: ExperienceDetailModalProps) {
  const fallback = getDetailFallback(experience);
  const description = experience.description ?? fallback.description!;
  const includes = experience.bookingIncludes?.length
    ? experience.bookingIncludes
    : fallback.bookingIncludes!;
  const options = experience.bookingOptions ?? [];

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-label={`تفاصيل ${experience.title}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="إغلاق"
      />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border">
        <div className="relative h-44 sm:h-52 shrink-0">
          <img
            src={assetUrl(experience.imageUrl)}
            alt={experience.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/20" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/55"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 right-3 left-3">
            <h2
              className="text-lg sm:text-xl font-black text-white drop-shadow-md"
              style={{ fontFamily: "'Noto Serif Arabic', serif" }}
            >
              {experience.title}
            </h2>
            <p className="text-xs text-white/90 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {experience.region}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-muted rounded-lg px-2.5 py-1">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-foreground">{experience.rating}</span>
              <span>({experience.reviews})</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {experience.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              حتى {experience.maxGroup} أشخاص
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {description}
          </p>

          <section className="mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3">
              ماذا يشمل الحجز؟
            </h3>
            <ul className="space-y-2">
              {includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {options.length > 0 && (
            <section className="mb-5">
              <h3 className="text-sm font-bold text-foreground mb-3">
                خيارات الركوب
              </h3>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div
                    key={opt.label}
                    className="rounded-xl border border-border bg-muted/30 p-3.5"
                  >
                    <p className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
                      {i === 0 ? (
                        <Home className="w-4 h-4 text-primary" />
                      ) : (
                        <Trees className="w-4 h-4 text-primary" />
                      )}
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-muted-foreground mb-5">
            المضيف:{" "}
            <span className="font-semibold text-foreground">{experience.host}</span>
          </p>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border mb-4">
            <div>
              <span
                className="font-black text-2xl text-foreground"
                style={{ fontFamily: "'Noto Serif Arabic', serif" }}
              >
                {experience.price}
              </span>
              <span className="text-muted-foreground text-sm"> ر.س / شخص</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBook();
              }}
              className="w-full bg-primary text-primary-foreground font-bold text-sm rounded-xl py-3.5 hover:bg-primary/90 transition-colors"
            >
              احجز الآن
            </button>
            {onOpenStory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStory();
                }}
                className="w-full flex items-center justify-center gap-2 border border-primary/40 text-primary font-bold text-sm rounded-xl py-3 hover:bg-primary/5 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                اكتشف القصة التراثية
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
