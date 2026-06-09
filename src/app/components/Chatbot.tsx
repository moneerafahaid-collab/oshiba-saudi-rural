import { useEffect, useMemo, useRef, useState } from "react";
import { X, Send, Loader2, RotateCcw } from "lucide-react";
import {
  sendChatMessage,
  fetchExperiences,
  checkApiHealth,
  submitInquiry,
  type AuthUser,
  type ChatAction,
  type ChatProfile,
  type ChatSource,
} from "../api/client";
import { ALL_REGIONS } from "../data/regions";
import { hasHeritageStory } from "../data/experienceEnrichment";
import { ExperienceCarousel, type CarouselItem } from "./chat/ExperienceCarousel";
import { ChoiceCarousel, type ChoiceItem } from "./chat/ChoiceCarousel";
import { OshibaAvatar } from "./chat/OshibaAvatar";
import { ChatActions } from "./chat/ChatActions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  actions?: ChatAction[];
}

interface ChatbotProps {
  authUser?: AuthUser | null;
  userRegion?: string | null;
  onBookExperience?: (experienceId: number | string) => void;
  onOpenStory?: (experienceId: number | string) => void;
  onRequestLogin?: () => void;
}

const SESSION_KEY = "reef_oshiba_messages";

type GuideStep = "audience" | "region" | "category" | "done";
type AudienceType = "family" | "youth" | "inquiry";

interface GuidePrefs {
  audience: AudienceType | null;
  region: string | null;
  category: string | null;
}

const AUDIENCE_OPTIONS: ChoiceItem[] = [
  {
    id: "family",
    label: "عائلات",
    emoji: "👨‍👩‍👧",
    subtitle: "تجارب هادئة ومناسبة للعائلة والأطفال",
  },
  {
    id: "youth",
    label: "شباب",
    emoji: "🧗",
    subtitle: "مغامرة، نشاط، وتجارب حيوية",
  },
  {
    id: "inquiry",
    label: "استفسار",
    emoji: "💬",
    subtitle: "سؤال أو استفسار عن التجارب والمناطق",
  },
];

const CATEGORY_OPTIONS: ChoiceItem[] = [
  { id: "all", label: "كل الفئات", emoji: "🌿", subtitle: "عرض جميع التجارب" },
  { id: "محميات", label: "محميات وطبيعة", emoji: "🦌", subtitle: "محميات وبيئة" },
  { id: "فعاليات", label: "فعاليات وتطعيس", emoji: "✨", subtitle: "تطعيس وفعاليات" },
  { id: "مغامرات", label: "مغامرات وجبال", emoji: "🥾", subtitle: "هايكينق وجبال" },
  { id: "زراعة", label: "زراعة", emoji: "🌾", subtitle: "مزارع وقطاف" },
  { id: "إقامة", label: "إقامة ريفية", emoji: "🏡", subtitle: "منتجعات وإقامة" },
  { id: "مهن", label: "مهن تراثية", emoji: "🪔", subtitle: "حرف وتراث" },
  { id: "مواشي", label: "مواشي وعسل", emoji: "🐝", subtitle: "عسل ورعي" },
  { id: "صيد", label: "صيد بحري", emoji: "🎣", subtitle: "بحر وصيد" },
];

const INTEREST_GREETING: Record<string, string> = {
  adventure: "محب المغامرات — تطعيس، جبال، ونشاط",
  exploration: "محب الاستكشاف — محميات، تراث، وطبيعة",
  both: "تحب المغامرة والاستكشاف معاً",
};

const QUICK_PROMPTS = [
  { id: "suggest", label: "وش تقترحين؟", message: "وش تقترحين لي حسب اهتمامي؟" },
  { id: "book", label: "أبي أحجز", message: "أبي أحجز تجربة مناسبة لي" },
  { id: "inquiry", label: "عندي استفسار", message: "عندي استفسار عن التجارب" },
  { id: "story", label: "احكيني قصة", message: "احكيني قصة أو حكاية تراثية" },
];

function parseGuideMessage(
  text: string,
  regions: typeof ALL_REGIONS
):
  | { type: "audience"; id: AudienceType }
  | { type: "region"; regionId?: string }
  | { type: "category"; categoryId?: string }
  | null {
  const t = text.trim();
  if (!t) return null;

  if (/^(عائلات|عائلة|للعائلات)$/i.test(t)) return { type: "audience", id: "family" };
  if (/^(شباب|للشباب)$/i.test(t)) return { type: "audience", id: "youth" };
  if (/^(استفسار|استفسارات|سؤال)$/i.test(t)) return { type: "audience", id: "inquiry" };

  if (/^(منطقة|المنطقة|مناطق|اختر منطقة)$/i.test(t)) return { type: "region" };

  const regionMatch = regions.find(
    (r) => t === r.name || t === r.fullRegion || t.includes(r.name)
  );
  if (regionMatch) return { type: "region", regionId: regionMatch.fullRegion };

  const catMatch = CATEGORY_OPTIONS.find(
    (c) => c.id !== "all" && (t === c.label || t === c.id || t.includes(c.label))
  );
  if (catMatch) return { type: "category", categoryId: catMatch.id };

  return null;
}

function shouldShowExperienceCards(intent?: string, message?: string, region?: string) {
  if (intent === "suggest" || intent === "book" || intent === "story") return true;
  if (region && message && /اقترح|تقترح|محتار|الافضل|أبي أحجز|ابي احجز/i.test(message)) {
    return true;
  }
  return false;
}

function isSuggestMessage(text: string) {
  return /اقترح|تقترح|محتار|الافضل|الأفضل|أبي أحجز|ابي احجز|ودي احجز/i.test(text);
}

function enrichCarouselItems(
  sources: ChatSource[],
  allItems: CarouselItem[]
): CarouselItem[] {
  return sources.map((s) => {
    const match = allItems.find((e) => e.id === s.id);
    return {
      ...s,
      imageUrl: s.imageUrl || match?.imageUrl,
      duration: s.duration || match?.duration,
      reviews: match?.reviews,
      featured: match?.featured,
      hasStory: hasHeritageStory(s),
    };
  });
}

function toCarouselItem(exp: {
  id: number | string;
  title: string;
  region: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string;
  host: string;
  tags: string[];
}): CarouselItem {
  return {
    id: exp.id,
    title: exp.title,
    region: exp.region,
    category: exp.category,
    price: exp.price,
    duration: "",
    rating: exp.rating,
    host: exp.host,
    tags: exp.tags,
    description: exp.title,
    imageUrl: exp.imageUrl,
  };
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end items-end gap-2 mb-4 pr-1">
      <div className="max-w-[85%] min-w-[200px] bg-card rounded-2xl rounded-bl-md px-4 py-3.5 text-sm leading-relaxed shadow-sm border border-border text-foreground text-right whitespace-pre-wrap">
        {children}
      </div>
      <OshibaAvatar size="md" className="mb-0.5 shrink-0" />
    </div>
  );
}

export function Chatbot({
  authUser,
  userRegion,
  onBookExperience,
  onOpenStory,
  onRequestLogin,
}: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState<CarouselItem[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryBusy, setInquiryBusy] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CarouselItem | null>(null);
  const [guideStep, setGuideStep] = useState<GuideStep>("audience");
  const [prefs, setPrefs] = useState<GuidePrefs>({
    audience: null,
    region: null,
    category: null,
  });
  const [guidedResults, setGuidedResults] = useState<CarouselItem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bookedRef = useRef<Set<string>>(new Set());

  const regionOptions: ChoiceItem[] = useMemo(() => {
    const base = [
      {
        id: "all-regions",
        label: "جميع المناطق",
        subtitle: "استكشف المملكة كاملة",
        imageUrl:
          "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop",
      },
      ...ALL_REGIONS.map((r) => ({
        id: r.fullRegion,
        label: r.name,
        subtitle: r.desc,
        imageUrl: r.imageUrl,
      })),
    ];
    if (!userRegion) return base;
    const match = base.find((r) => r.id === userRegion);
    if (!match) return base;
    return [match, ...base.filter((r) => r.id !== userRegion)];
  }, [userRegion]);

  const chatProfile: ChatProfile = useMemo(
    () => ({
      name: authUser?.name,
      phone: authUser?.phone,
      age: authUser?.age,
      interestType: authUser?.interestType,
      region: userRegion || undefined,
    }),
    [authUser, userRegion]
  );

  const guideProfile: ChatProfile = useMemo(() => {
    const region =
      prefs.region && prefs.region !== "all-regions" ? prefs.region : chatProfile.region;
    const interestType =
      prefs.audience === "youth"
        ? "adventure"
        : prefs.audience === "family"
          ? "exploration"
          : chatProfile.interestType;
    const category =
      prefs.category && prefs.category !== "all" ? prefs.category : undefined;
    return { ...chatProfile, region, interestType, category };
  }, [chatProfile, prefs]);

  const isUndecidedMessage = (text: string) =>
    /محتار|الافضل|الأفضل|ما ادري|ما أدري|انت اختار|أنت اختار|وش تنصح|ماذا تنصح/i.test(text);

  const welcomeText = useMemo(() => {
    const name = authUser?.name ? ` ${authUser.name}` : "";
    const interest = authUser?.interestType
      ? INTEREST_GREETING[authUser.interestType]
      : null;
    const region = userRegion
      ? ALL_REGIONS.find((r) => r.fullRegion === userRegion)?.name || userRegion
      : null;

    let intro = `مرحباً${name}! أنا عشيبة، مرشدتك الريفية الذكية.`;
    if (interest) intro += `\nأرى إنك ${interest}.`;
    if (region) intro += `\nأقترح تجارب قريبة من ${region}.`;
    intro +=
      "\n\nأساعدك في: اقتراح تجارب، الحجز، الاستفسار، وإكمال القصص التراثية.";
    intro += "\n\nاختر من الكروت أدناه — خطوة بخطوة: الفئة، المنطقة، ثم التجربة.";
    return intro;
  }, [authUser, userRegion]);

  useEffect(() => {
    if (!open) return;
    checkApiHealth().then(setApiOnline);
    fetchExperiences()
      .then((all) => setAllItems(all.map(toCarouselItem)))
      .catch(() => setAllItems([]));

    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        setMessages(parsed);
        if (parsed.length > 0) setGuideStep("done");
      } else {
        setGuideStep("audience");
        setPrefs({ audience: null, region: null, category: null });
        setGuidedResults([]);
      }
    } catch {
      setGuideStep("audience");
    }
  }, [open]);

  useEffect(() => {
    if (messages.length) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-20)));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [messages]);

  const restartGuide = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setMessages([]);
    setGuideStep("audience");
    setPrefs({ audience: null, region: null, category: null });
    setGuidedResults([]);
    setSelectedCard(null);
    setShowInquiryForm(false);
    setInquirySubject("");
    setInquiryMessage("");
    setInput("");
    setLoading(false);
  };

  const canRestart = guideStep !== "audience" || messages.length > 0;

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading, selectedCard, showInquiryForm, guideStep, guidedResults]);

  const pushAssistant = (content: string, extra?: Partial<ChatMessage>) => {
    setMessages((m) => [...m, { role: "assistant", content, ...extra }]);
  };

  const pushUser = (content: string) => {
    setMessages((m) => [...m, { role: "user", content }]);
  };

  const loadFilteredExperiences = async (nextPrefs: GuidePrefs) => {
    const region =
      nextPrefs.region && nextPrefs.region !== "all-regions"
        ? nextPrefs.region
        : undefined;
    const category =
      nextPrefs.category && nextPrefs.category !== "all"
        ? nextPrefs.category
        : undefined;

    try {
      const data = await fetchExperiences({ region, category });
      let items = data.map(toCarouselItem);
      if (nextPrefs.audience === "family") {
        items = items.filter(
          (e) =>
            e.category !== "مغامرات" ||
            e.tags.some((t) => /عائلات|عائلة|هادئ/i.test(t))
        );
      } else if (nextPrefs.audience === "youth") {
        items = items.filter((e) =>
          ["مغامرات", "فعاليات"].includes(e.category)
        );
      }
      if (!items.length && region) {
        const fallback = await fetchExperiences({ region, category });
        items = fallback.map(toCarouselItem);
      }
      setGuidedResults(items);
      return items;
    } catch {
      const filtered = allItems.filter((e) => {
        const okRegion = !region || e.region === region;
        const okCat = !category || e.category === category;
        return okRegion && okCat;
      });
      setGuidedResults(filtered);
      return filtered;
    }
  };

  const finishGuide = async (nextPrefs: GuidePrefs) => {
    setGuideStep("done");

    const audienceLabel =
      nextPrefs.audience === "family"
        ? "عائلية"
        : nextPrefs.audience === "youth"
          ? "للشباب"
          : "مناسبة";
    const regionLabel =
      nextPrefs.region === "all-regions" || !nextPrefs.region
        ? "جميع مناطق المملكة"
        : ALL_REGIONS.find((r) => r.fullRegion === nextPrefs.region)?.name ||
          nextPrefs.region;
    const catLabel =
      nextPrefs.category === "all" || !nextPrefs.category
        ? "كل الفئات"
        : nextPrefs.category;

    const list = await loadFilteredExperiences(nextPrefs);
    const query = `اقترح تجارب ${audienceLabel} في ${regionLabel} ضمن ${catLabel}`;

    const profileForGuide: ChatProfile = {
      ...chatProfile,
      interestType:
        nextPrefs.audience === "youth"
          ? "adventure"
          : nextPrefs.audience === "family"
            ? "exploration"
            : chatProfile.interestType,
      region: nextPrefs.region && nextPrefs.region !== "all-regions"
        ? nextPrefs.region
        : chatProfile.region,
    };

    setLoading(true);
    try {
      const res = await sendChatMessage(query, {
        profile: profileForGuide,
        history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
      });
      const regionKey =
        nextPrefs.region && nextPrefs.region !== "all-regions" ? nextPrefs.region : undefined;
      let items = res.sources?.length ? res.sources : list;
      if (regionKey) {
        const scoped = items.filter((i) => i.region === regionKey);
        if (scoped.length) items = scoped;
      }
      pushAssistant(res.reply, {
        sources: items.length ? items : undefined,
        actions: items.length
          ? res.actions?.filter((a) => a.type === "inquiry")
          : res.actions,
      });
    } catch {
      pushAssistant(
        list.length > 0
          ? `إليك ${list.length} تجربة ${audienceLabel} في ${regionLabel}. اختر من الكروت للحجز أو القصة.`
          : `لم أجد تجارب مطابقة في ${regionLabel}. جرّب منطقة أو فئة أخرى.`,
        list.length > 0 ? { sources: list } : undefined
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAudienceSelect = (item: ChoiceItem) => {
    const audience = item.id as AudienceType;
    setPrefs((p) => ({ ...p, audience }));
    pushUser(item.label);
    if (audience === "inquiry") {
      pushAssistant("تمام! أي منطقة يتعلق بها استفسارك؟");
    } else {
      pushAssistant(
        audience === "family"
          ? "اختيار رائع للعائلة! أي منطقة تود استكشافها؟"
          : "ممتاز! أي منطقة تود مغامرتك فيها؟"
      );
    }
    setGuideStep("region");
  };

  const handleRegionSelect = (item: ChoiceItem) => {
    const nextPrefs = { ...prefs, region: item.id };
    setPrefs(nextPrefs);
    pushUser(item.label);

    if (nextPrefs.audience === "inquiry") {
      setGuideStep("done");
      const regionName =
        item.id === "all-regions"
          ? "المنصة"
          : ALL_REGIONS.find((r) => r.fullRegion === item.id)?.name || item.label;
      pushAssistant(`يسعدني أخذ استفسارك عن ${regionName}. اكتب سؤالك في النموذج بالأسفل.`);
      setInquirySubject(`استفسار عن تجارب ${regionName}`);
      setShowInquiryForm(true);
      return;
    }

    pushAssistant("رائع! ما نوع التجربة التي تهمك؟");
    setGuideStep("category");

    if (item.id !== "all-regions") {
      loadFilteredExperiences(nextPrefs).catch(() => undefined);
    }
  };

  const handleCategorySelect = async (item: ChoiceItem) => {
    const nextPrefs = { ...prefs, category: item.id };
    setPrefs(nextPrefs);
    pushUser(item.label);
    await finishGuide(nextPrefs);
  };

  const askOshiba = async (
    text: string,
    selectedExperienceId?: number | string
  ) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (
      isSuggestMessage(trimmed) &&
      prefs.audience &&
      prefs.audience !== "inquiry" &&
      prefs.region &&
      (guideStep === "category" || guideStep === "region")
    ) {
      const nextPrefs: GuidePrefs = {
        ...prefs,
        category: prefs.category && prefs.category !== "all" ? prefs.category : "all",
      };
      setPrefs(nextPrefs);
      pushUser(trimmed);
      await finishGuide(nextPrefs);
      return;
    }

    const guideMsg = parseGuideMessage(trimmed, ALL_REGIONS);
    if (guideMsg) {
      if (guideMsg.type === "audience") {
        const item = AUDIENCE_OPTIONS.find((a) => a.id === guideMsg.id);
        if (item) {
          handleAudienceSelect(item);
          return;
        }
      }
      if (guideMsg.type === "region") {
        if (guideMsg.regionId) {
          const item = regionOptions.find((r) => r.id === guideMsg.regionId);
          if (item) {
            handleRegionSelect(item);
            return;
          }
        }
        pushUser(trimmed);
        pushAssistant("اختر منطقتك من الكروت بالأسفل:");
        setGuideStep("region");
        return;
      }
      if (guideMsg.type === "category" && prefs.region) {
        if (guideMsg.categoryId) {
          const item = CATEGORY_OPTIONS.find((c) => c.id === guideMsg.categoryId);
          if (item) {
            await handleCategorySelect(item);
            return;
          }
        }
        pushUser(trimmed);
        pushAssistant("ما نوع التجربة التي تهمك؟");
        setGuideStep("category");
        return;
      }
    }

    let activePrefs = prefs;
    if (guideStep === "category" && isUndecidedMessage(trimmed)) {
      activePrefs = { ...prefs, category: "all" };
      setPrefs(activePrefs);
    }

    const likelyFaq =
      /^(وش|ما|كيف|لم|ليش|من|هل)\s|فكرة|منص[ةه]|عشيبة السعودية|اكتشف ريف|ريف السعودية/i.test(trimmed) &&
      !guideMsg;

    if (
      !guideMsg &&
      !likelyFaq &&
      (activePrefs.audience || guideStep === "done") &&
      guideStep !== "region" &&
      guideStep !== "category"
    ) {
      setGuideStep("done");
    }

    const profileForChat: ChatProfile = {
      ...guideProfile,
      region:
        activePrefs.region && activePrefs.region !== "all-regions"
          ? activePrefs.region
          : guideProfile.region,
      category:
        activePrefs.category && activePrefs.category !== "all"
          ? activePrefs.category
          : guideProfile.category,
      interestType:
        activePrefs.audience === "youth"
          ? "adventure"
          : activePrefs.audience === "family"
            ? "exploration"
            : guideProfile.interestType,
    };

    let prefetched: CarouselItem[] = [];
    if (
      !likelyFaq &&
      activePrefs.audience &&
      activePrefs.audience !== "inquiry" &&
      activePrefs.region
    ) {
      prefetched = await loadFilteredExperiences(activePrefs);
    }

    const newHistory = [
      ...messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: trimmed },
    ];
    pushUser(trimmed);
    setLoading(true);
    setSelectedCard(null);

    try {
      const res = await sendChatMessage(trimmed, {
        profile: profileForChat,
        history: newHistory,
        selectedExperienceId,
      });
      const showCards = shouldShowExperienceCards(
        res.intent,
        trimmed,
        profileForChat.region
      );
      let items = showCards
        ? res.sources?.length
          ? res.sources
          : prefetched.length
            ? prefetched
            : undefined
        : undefined;
      if (items && profileForChat.region) {
        const scoped = items.filter((i) => i.region === profileForChat.region);
        if (scoped.length) items = scoped;
      }
      pushAssistant(res.reply, {
        sources: items,
        actions: items?.length
          ? res.actions?.filter((a) => a.type === "inquiry")
          : res.actions,
      });

      if (res.intent === "guide") {
        if (/^(منطقة|المنطقة|مناطق)$/i.test(trimmed)) setGuideStep("region");
        else if (/^(عائلات|عائلة|شباب|استفسار)$/i.test(trimmed))
          setGuideStep("audience");
      } else if (res.intent === "faq" && guideStep === "done" && !prefs.audience) {
        setGuideStep("audience");
      }
    } catch (err) {
      pushAssistant(
        err instanceof Error
          ? err.message
          : "تعذّر الاتصال بعشيبة. تأكد من تشغيل الخادم."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (experienceId: number | string, title: string) => {
    const key = String(experienceId);
    if (bookedRef.current.has(key)) return;
    bookedRef.current.add(key);

    setOpen(false);
    setSelectedCard(null);
    onBookExperience?.(experienceId);
  };

  const handleStory = (experienceId: number | string, title: string) => {
    if (!authUser) {
      pushAssistant("سجّل دخولك أولاً لتكمل القصة كاملة — أو اضغط الزر بالأسفل.");
      onRequestLogin?.();
      return;
    }
    setOpen(false);
    onOpenStory?.(experienceId);
  };

  const handleInquiryOpen = (subject: string) => {
    setInquirySubject(subject);
    setInquiryMessage("");
    setShowInquiryForm(true);
  };

  const submitInquiryForm = async () => {
    if (!inquiryMessage.trim() || inquiryBusy) return;
    setInquiryBusy(true);
    try {
      const res = await submitInquiry({
        userName: authUser?.name || "زائر",
        userPhone: authUser?.phone,
        subject: inquirySubject || "استفسار من عشيبة",
        message: inquiryMessage.trim(),
      });
      pushAssistant(res.message);
      setShowInquiryForm(false);
    } catch (err) {
      pushAssistant(err instanceof Error ? err.message : "تعذّر إرسال الاستفسار");
    } finally {
      setInquiryBusy(false);
    }
  };

  const handleCardSelect = (item: CarouselItem) => {
    setSelectedCard(item);
    const actions: ChatAction[] = [
      { type: "book", experienceId: item.id, title: item.title, label: "احجز الآن" },
    ];
    if (hasHeritageStory(item)) {
      actions.push({
        type: "story",
        experienceId: item.id,
        title: item.title,
        label: "اكتشف القصة",
      });
    }
    actions.push({
      type: "inquiry",
      subject: `استفسار عن ${item.title}`,
      label: "استفسار",
    });
    pushAssistant(`اخترت «${item.title}» — ماذا تريد أن تفعل؟`, { actions });
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-[90] rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="فتح عشيبة — مرشدتك الريفية"
        >
          <OshibaAvatar size="xl" className="shadow-md" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:left-6 z-[90] sm:w-[min(100vw-2rem,440px)] sm:h-[min(92vh,720px)] bg-[#EFEBE3] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border"
          role="dialog"
          aria-label="عشيبة — مرشدة عشيبة السعودية الريفية"
        >
          <header className="shrink-0 bg-primary text-primary-foreground px-4 py-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              {canRestart && (
                <button
                  type="button"
                  onClick={restartGuide}
                  disabled={loading}
                  className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center disabled:opacity-50"
                  aria-label="الرجوع للبداية"
                  title="الرجوع للبداية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
            <h2 className="flex-1 text-center text-sm sm:text-base font-bold min-w-0 truncate">
              عشيبة — مساعدك الذكي
            </h2>
            <OshibaAvatar size="sm" className="ring-2 ring-white/90 shrink-0" />
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pb-2">
              <AssistantBubble>{welcomeText}</AssistantBubble>

              {apiOnline === false && import.meta.env.DEV && (
                <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2 text-[11px] text-destructive text-right">
                  الخادم غير متصل — شغّل:{" "}
                  <code className="bg-black/5 px-1 rounded">cd backend && npm start</code>
                </div>
              )}

              {guideStep === "audience" && (
                <ChoiceCarousel
                  title="لمن تبحث عن التجربة؟"
                  items={AUDIENCE_OPTIONS}
                  onSelect={handleAudienceSelect}
                />
              )}

              {guideStep === "region" && (
                <ChoiceCarousel
                  title={
                    prefs.audience === "inquiry"
                      ? "أي منطقة يتعلق بها استفسارك؟"
                      : "أي منطقة تود استكشافها؟"
                  }
                  items={regionOptions}
                  onSelect={handleRegionSelect}
                  variant="image"
                />
              )}

              {guideStep === "category" && (
                <ChoiceCarousel
                  title="ما نوع التجربة التي تهمك؟"
                  items={CATEGORY_OPTIONS}
                  onSelect={handleCategorySelect}
                />
              )}

              {guideStep === "done" && !showInquiryForm && (
                <div className="flex flex-wrap gap-2 justify-end mb-4 px-1">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => askOshiba(q.message)}
                      disabled={loading}
                      className="text-xs font-bold rounded-full px-3.5 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className="mb-2">
                  {msg.role === "user" ? (
                    <div className="flex justify-start mb-3">
                      <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 text-sm shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <>
                      <AssistantBubble>{msg.content}</AssistantBubble>
                      {msg.sources && msg.sources.length > 0 && (
                        <ExperienceCarousel
                          title="تجارب مقترحة لك"
                          items={enrichCarouselItems(msg.sources, allItems)}
                          onBook={(item) => handleBook(item.id, item.title)}
                          onStory={(item) => handleStory(item.id, item.title)}
                          onSelect={handleCardSelect}
                        />
                      )}
                      {msg.actions &&
                        msg.actions.length > 0 &&
                        !msg.sources?.length && (
                          <ChatActions
                            actions={msg.actions}
                            onBook={handleBook}
                            onStory={handleStory}
                            onInquiry={handleInquiryOpen}
                          />
                        )}
                    </>
                  )}
                </div>
              ))}

              {selectedCard && (
                <ExperienceCarousel
                  title="تجربتك المختارة"
                  items={[selectedCard]}
                  onBook={(item) => handleBook(item.id, item.title)}
                  onStory={(item) => handleStory(item.id, item.title)}
                  onSelect={handleCardSelect}
                />
              )}

              {showInquiryForm && (
                <div className="mb-4 bg-card border border-border rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-bold text-foreground">إرسال استفسار</p>
                  <input
                    type="text"
                    value={inquirySubject}
                    onChange={(e) => setInquirySubject(e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background"
                    placeholder="الموضوع"
                  />
                  <textarea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background resize-none"
                    placeholder="اكتب استفسارك..."
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={submitInquiryForm}
                      disabled={inquiryBusy || !inquiryMessage.trim()}
                      className="flex-1 bg-primary text-primary-foreground text-sm font-bold rounded-xl py-2.5 disabled:opacity-50"
                    >
                      {inquiryBusy ? "جاري الإرسال..." : "إرسال"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInquiryForm(false)}
                      className="px-4 text-sm text-muted-foreground"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex justify-end items-end gap-2 mb-4 pr-1">
                  <div className="max-w-[85%] bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                    عشيبة تفكر...
                  </div>
                  <OshibaAvatar size="md" className="mb-0.5 shrink-0 animate-pulse" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <form
            className="shrink-0 p-4 pt-2 bg-[#EFEBE3] border-t border-border/60"
            onSubmit={(e) => {
              e.preventDefault();
              askOshiba(input);
              setInput("");
            }}
          >
            <div className="flex items-center gap-2 bg-card rounded-full border border-border shadow-sm px-2 py-1.5">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
                aria-label="إرسال"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسأل عشيبة أو اطلب حجزاً..."
                className="flex-1 bg-transparent py-2.5 px-2 text-sm outline-none text-right placeholder:text-muted-foreground"
                disabled={loading}
              />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
