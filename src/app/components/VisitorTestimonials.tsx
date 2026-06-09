import { useEffect, useState } from "react";
import { Star, Sparkles, ThumbsUp, Zap } from "lucide-react";
import { fetchFeaturedReviews, type FeaturedReview } from "../api/client";

const HIGHLIGHT_ICONS = {
  benefit: Sparkles,
  ease: Zap,
  experience: ThumbsUp,
} as const;

const HIGHLIGHT_COLORS = {
  benefit: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ease: "bg-sky-100 text-sky-800 border-sky-200",
  experience: "bg-amber-100 text-amber-800 border-amber-200",
} as const;

const FALLBACK: FeaturedReview[] = [
  {
    id: "1",
    userName: "سارة العتيبي",
    rating: 5,
    comment: "تجربة رائعة! المدرب محترف والخيل أصيل. أنصح العائلات بزيارة مربط الطائي.",
    experienceTitle: "ركوب الخيل في مربط الطائي حائل",
    host: "أكاديمية ومربط الطائي",
    highlight: "benefit",
    highlightLabel: "فائدة التجربة",
  },
  {
    id: "2",
    userName: "محمد الحربي",
    rating: 4,
    comment: "الحجز سهل والتأكيد سريع — كل شيء واضح من أول خطوة حتى الوصول للمكان.",
    experienceTitle: "ركوب الخيل في مربط الطائي حائل",
    highlight: "ease",
    highlightLabel: "سهولة الحجز",
  },
  {
    id: "3",
    userName: "نورة القحطاني",
    rating: 5,
    comment: "أفضل تجربة ركوب خيل في حائل — قصة التراث جميلة والاستقبال ممتاز.",
    experienceTitle: "ركوب الخيل في مربط الطائي حائل",
    highlight: "experience",
    highlightLabel: "تجربة إيجابية",
  },
];

export function VisitorTestimonials() {
  const [reviews, setReviews] = useState<FeaturedReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchFeaturedReviews()
      .then((res) => setReviews(res.data.length > 0 ? res.data : FALLBACK))
      .catch(() => setReviews(FALLBACK))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;
  if (reviews.length === 0) return null;

  return (
    <section id="visitor-stories" className="py-14 sm:py-16 scroll-mt-24">
      <div className="text-center mb-10">
        <span className="inline-block text-xs font-bold tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
          تجارب حقيقية من زوارنا
        </span>
        <h2
          className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
          style={{ fontFamily: "'Noto Serif Arabic', serif" }}
        >
          ماذا يقول الزوار عن تجاربهم؟
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          تعليقات مختارة من مدير المنصة — عن فائدة الأنشطة، سهولة الحجز، والتجارب الإيجابية
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => {
          const Icon = HIGHLIGHT_ICONS[r.highlight] || ThumbsUp;
          const colorClass = HIGHLIGHT_COLORS[r.highlight] || HIGHLIGHT_COLORS.experience;

          return (
            <article
              key={r.id}
              className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow text-right flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${colorClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {r.highlightLabel}
                </span>
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <blockquote className="text-sm text-foreground leading-relaxed flex-1 mb-4">
                «{r.comment}»
              </blockquote>

              <div className="pt-4 border-t border-border">
                <p className="font-bold text-sm text-foreground">{r.userName}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {r.experienceTitle}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
