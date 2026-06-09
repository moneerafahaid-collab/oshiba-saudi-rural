import { Lock, LogIn } from "lucide-react";

/** يقسّم النص لعرض ~٢٥٪ كمعاينة */
export function splitStoryTeaser(text: string, ratio = 0.28): { preview: string; hidden: string } {
  const trimmed = text.trim();
  if (!trimmed) return { preview: "", hidden: "" };

  const sentences = trimmed.split(/(?<=[.،!؟])\s+/).filter(Boolean);
  if (sentences.length > 1) {
    const count = Math.max(1, Math.ceil(sentences.length * ratio));
    return {
      preview: sentences.slice(0, count).join(" "),
      hidden: sentences.slice(count).join(" "),
    };
  }

  const words = trimmed.split(/\s+/);
  const wordCount = Math.max(8, Math.ceil(words.length * ratio));
  return {
    preview: words.slice(0, wordCount).join(" "),
    hidden: words.slice(wordCount).join(" "),
  };
}

interface StoryTeaserProps {
  preview: string;
  hiddenText: string;
  onLogin: () => void;
  children?: React.ReactNode;
}

export function StoryTeaser({ preview, hiddenText, onLogin, children }: StoryTeaserProps) {
  const filler =
    hiddenText ||
    "وتتواصل الحكاية عبر أجيال من الفروسية والتراث في قلب الريف السعودي، حيث يلتقي الماضي بالحاضر في تجربة لا تُنسى...";

  return (
    <div className="relative">
      {preview && (
        <p className="text-sm text-foreground leading-relaxed font-medium">{preview}</p>
      )}

      <div className="flex items-center gap-3 my-4" aria-hidden>
        <div className="flex-1 h-px bg-gradient-to-l from-primary/30 to-transparent" />
        <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full w-8 h-8 shadow-md shadow-primary/25 shrink-0">
          <Lock className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="blur-[5px] select-none pointer-events-none opacity-80 leading-relaxed text-sm text-muted-foreground px-0.5"
          aria-hidden
        >
          <p>{filler}</p>
          {children}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-card/10 via-card/75 to-card flex flex-col items-center justify-center px-5 py-10 text-center">
          <p
            className="text-base font-bold text-foreground mb-1"
            style={{ fontFamily: "'Noto Serif Arabic', serif" }}
          >
            باقي القصة ينتظرك
          </p>
          <p className="text-xs text-muted-foreground mb-4 max-w-[240px] leading-relaxed">
            سجّل دخولك مجاناً لتكمل رحلة التراث وتكتشف حكاية المكان كاملة
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl px-6 py-3 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            سجّل دخول لتكمل القصة
          </button>
        </div>
      </div>
    </div>
  );
}
