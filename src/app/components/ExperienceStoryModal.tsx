import { X, BookOpen, MapPin, User, Sparkles } from "lucide-react";
import type { Experience } from "../App";
import { StoryTeaser, splitStoryTeaser } from "./StoryTeaser";
import { assetUrl } from "../utils/assetUrl";

interface ExperienceStoryModalProps {
  experience: Experience;
  onClose: () => void;
  onBook: () => void;
  isLoggedIn?: boolean;
  onLogin?: () => void;
}

export function ExperienceStoryModal({
  experience,
  onClose,
  onBook,
  isLoggedIn = false,
  onLogin,
}: ExperienceStoryModalProps) {
  const previewImages =
    experience.previewImages?.length ? experience.previewImages : [experience.imageUrl];

  const heritageParts = experience.heritageStory
    ? splitStoryTeaser(experience.heritageStory)
    : { preview: "", hidden: "" };

  const hiddenStoryBlob = [
    heritageParts.hidden,
    experience.hostStory,
    experience.whySpecial,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-label={`قصة ${experience.title}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="إغلاق"
      />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border">
        <div className="relative h-48 sm:h-56 shrink-0">
          <img
            src={assetUrl(experience.imageUrl)}
            alt={experience.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/55"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            قصة تراثية
          </span>
          {!isLoggedIn && (
            <span className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              معاينة — سجّل لإكمال القراءة
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6 -mt-6 relative">
          <h2
            className="text-xl font-black text-foreground mb-1"
            style={{ fontFamily: "'Noto Serif Arabic', serif" }}
          >
            {experience.title}
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
            <MapPin className="w-3.5 h-3.5" />
            {experience.region}
          </p>

          {(experience.hostName || experience.host) && (
            <div className="flex items-start gap-3 bg-muted/50 rounded-2xl p-4 mb-4 border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground">
                  {experience.hostName || experience.host}
                </p>
                {experience.hostTitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{experience.hostTitle}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  صاحب النشاط يشاركك قصة المهنة وتراثها في أرياف حائل.
                </p>
              </div>
            </div>
          )}

          {experience.heritageStory && (
            <section className="mb-4">
              <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                قصة المكان والتراث
              </h3>
              {isLoggedIn ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {experience.heritageStory}
                </p>
              ) : (
                <StoryTeaser
                  preview={heritageParts.preview}
                  hiddenText={hiddenStoryBlob}
                  onLogin={() => onLogin?.()}
                />
              )}
            </section>
          )}

          {isLoggedIn && experience.hostStory && (
            <section className="mb-4">
              <h3 className="text-sm font-bold text-foreground mb-2">من صاحب النشاط</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {experience.hostStory}
              </p>
            </section>
          )}

          {isLoggedIn && experience.whySpecial && (
            <p className="text-sm font-medium text-primary bg-primary/10 rounded-xl px-3 py-2.5 mb-4">
              {experience.whySpecial}
            </p>
          )}

          {isLoggedIn && (
            <section className="mb-5">
              <h3 className="text-sm font-bold text-foreground mb-2">استكشف المكان</h3>
              <div className="rounded-2xl overflow-hidden border border-border">
                {previewImages.map((src, i) => (
                  <img
                    key={src + i}
                    src={assetUrl(src)}
                    alt={`معاينة ${experience.title}`}
                    className="w-full h-44 object-cover"
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                معاينة بصرية — جولة كاملة 360° قريباً
              </p>
            </section>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onBook();
            }}
            className="w-full bg-primary text-primary-foreground font-bold text-sm rounded-xl py-3 hover:bg-primary/90 transition-colors"
          >
            احجز التجربة
          </button>
        </div>
      </div>
    </div>
  );
}
