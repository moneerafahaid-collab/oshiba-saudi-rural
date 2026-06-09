import type { ChatAction } from "../../api/client";

interface ChatActionsProps {
  actions: ChatAction[];
  onBook?: (experienceId: number | string, title: string) => void;
  onStory?: (experienceId: number | string, title: string) => void;
  onInquiry?: (subject: string) => void;
}

export function ChatActions({ actions, onBook, onStory, onInquiry }: ChatActionsProps) {
  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-end mb-3 px-1">
      {actions.map((action, i) => (
        <button
          key={`${action.type}-${action.experienceId ?? i}`}
          type="button"
          onClick={() => {
            if (action.type === "book" && action.experienceId != null) {
              onBook?.(action.experienceId, action.title || "");
            } else if (action.type === "story" && action.experienceId != null) {
              onStory?.(action.experienceId, action.title || "");
            } else if (action.type === "inquiry") {
              onInquiry?.(action.subject || "استفسار عام");
            }
          }}
          className={`text-xs font-bold rounded-xl px-3.5 py-2 transition-colors ${
            action.type === "book"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : action.type === "story"
                ? "border-2 border-primary text-primary hover:bg-primary/5"
                : "bg-muted text-foreground hover:bg-muted/80 border border-border"
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
