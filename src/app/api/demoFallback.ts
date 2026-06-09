import {
  filterCatalogExperiences,
  type CatalogExperience,
} from "../data/catalogExperiences";
import type {
  AuthUser,
  ChatAction,
  ChatIntent,
  ChatProfile,
  ChatSource,
  VisitorInterest,
} from "./client";

const DEMO_USERS: Array<{
  phone: string;
  password: string;
  role: AuthUser["role"];
  name: string;
  email?: string;
  age?: number;
  interestType?: VisitorInterest;
  providerHost?: string;
  profileCompleted?: boolean;
}> = [
  {
    phone: "0500000000",
    password: "123123",
    role: "visitor",
    name: "زائر تجريبي",
    email: "visitor@reef-saudi.demo",
    age: 28,
    interestType: "both",
    profileCompleted: true,
  },
  {
    phone: "0500000001",
    password: "123123",
    role: "provider",
    name: "مقدم تجربة — مربط الطائي",
    providerHost: "أكاديمية ومربط الطائي",
  },
  {
    phone: "0500000002",
    password: "123123",
    role: "admin",
    name: "مدير المنصة",
  },
];

const ROLE_LABELS: Record<AuthUser["role"], string> = {
  visitor: "زائر",
  provider: "مقدم تجربة",
  admin: "مدير",
};

const INTEREST_LABELS: Record<VisitorInterest, string> = {
  adventure: "مغامرة",
  exploration: "استكشاف",
  both: "مغامرة واستكشاف",
};

function toAuthUser(u: (typeof DEMO_USERS)[number]): AuthUser {
  return {
    id: `demo-${u.phone}`,
    name: u.name,
    phone: u.phone,
    email: u.email,
    age: u.age,
    role: u.role,
    roleLabel: ROLE_LABELS[u.role],
    providerHost: u.providerHost,
    interestType: u.interestType,
    interestLabel: u.interestType ? INTEREST_LABELS[u.interestType] : undefined,
    profileCompleted: u.profileCompleted ?? u.role !== "visitor",
  };
}

function toChatSource(exp: CatalogExperience): ChatSource {
  return {
    id: exp.id,
    title: exp.title,
    region: exp.region,
    category: exp.category,
    price: exp.price,
    duration: exp.duration,
    rating: exp.rating,
    host: exp.host,
    tags: exp.tags,
    description: exp.title,
    imageUrl: exp.imageUrl,
  };
}

/** وضع تجريبي — GitHub Pages فقط (مسار فرعي /oshiba-saudi-rural/) */
export function isOfflineDemoMode(): boolean {
  if (import.meta.env.VITE_OFFLINE_DEMO === "true") return true;
  if (import.meta.env.VITE_API_URL) return false;
  const base = import.meta.env.BASE_URL || "/";
  return import.meta.env.PROD && base !== "/" && base !== "";
}

export function demoLogin(phone: string, password: string) {
  const user = DEMO_USERS.find(
    (u) => u.phone === phone.trim() && u.password === password
  );
  if (!user) {
    throw new Error("رقم الجوال أو كلمة المرور غير صحيحة");
  }
  return {
    success: true,
    message: "تم تسجيل الدخول (وضع العرض التجريبي)",
    user: toAuthUser(user),
  };
}

export function demoRegisterVisitor(body: {
  phone: string;
  email: string;
  name: string;
  age: number;
}) {
  return {
    success: true,
    message: "تم إنشاء الحساب (وضع العرض التجريبي)",
    user: toAuthUser({
      phone: body.phone.trim(),
      password: "123123",
      role: "visitor",
      name: body.name.trim(),
      email: body.email.trim(),
      age: body.age,
      interestType: "both",
      profileCompleted: false,
    }),
  };
}

function filterForProfile(
  list: CatalogExperience[],
  profile?: ChatProfile
): CatalogExperience[] {
  let items = [...list];
  if (profile?.region) {
    const scoped = items.filter((e) => e.region === profile.region);
    if (scoped.length) items = scoped;
  }
  if (profile?.category && profile.category !== "all") {
    const scoped = items.filter((e) => e.category === profile.category);
    if (scoped.length) items = scoped;
  }
  if (profile?.interestType === "adventure") {
    items = items.filter((e) =>
      ["مغامرات", "فعاليات"].includes(e.category)
    );
  } else if (profile?.interestType === "exploration") {
    items = items.filter(
      (e) =>
        ["محميات", "زراعة", "مهن", "إقامة"].includes(e.category) ||
        e.tags.some((t) => /عائلات|تراث/i.test(t))
    );
  }
  return items;
}

function answerFaq(message: string): string | null {
  const m = message.trim();
  if (/فكرة|وش (ال)?منص|عن المنص|عشيبة السعودية|وش تقدم/i.test(m)) {
    return (
      "«عشيبة السعودية الريفية» تجمع تجارب الريف السعودي في مكان واحد — محميات، تطعيس، مزارع، تراث، وإقامة.\n\n" +
      "اختر من الكروت أو قُل لي وش يناسبك (عائلات، شباب، أو منطقة معيّنة)."
    );
  }
  if (/كيف (أ|ا)حجز|طريقة الحجز/i.test(m)) {
    return "اختر تجربة من الكروت → اضغط «احجز» → أدخل بياناتك. أو قُل «أبي أحجز» وأقترح لك تجربة.";
  }
  if (/من (أ|ا)نت|وش عشيب|دورك/i.test(m)) {
    return (
      "أنا عشيبة، مرشدتك الريفية الذكية. أساعدك في اقتراح تجارب، الحجز، والقصص التراثية.\n\n" +
      "اسألني عن المنصة أو اختر من الكروت بالأسفل."
    );
  }
  return null;
}

export function demoChatMessage(
  message: string,
  options?: {
    profile?: ChatProfile;
    selectedExperienceId?: number | string;
  }
) {
  const m = message.trim();
  const faq = answerFaq(m);
  if (faq) {
    return {
      success: true,
      reply: faq,
      intent: "faq" as ChatIntent,
      mode: "demo",
    };
  }

  let intent: ChatIntent = "general";
  if (/احجز|أبي أحجز|ابي احجز|حجز/i.test(m)) intent = "book";
  else if (/استفسار|سؤال|استفسر/i.test(m)) intent = "inquiry";
  else if (/قصة|حكاية|تراث/i.test(m)) intent = "story";
  else if (/اقترح|تقترح|محتار|مناسب|وش تنصح/i.test(m)) intent = "suggest";

  let catalog = filterCatalogExperiences({
    region: options?.profile?.region,
    category:
      options?.profile?.category && options.profile.category !== "all"
        ? options.profile.category
        : undefined,
  });
  catalog = filterForProfile(catalog, options?.profile);

  if (options?.selectedExperienceId) {
    const one = catalog.find(
      (e) => String(e.id) === String(options.selectedExperienceId)
    );
    if (one) catalog = [one];
  }

  const sources = catalog.slice(0, 6).map(toChatSource);
  const regionHint = options?.profile?.region
    ? ` في ${options.profile.region}`
    : "";

  let reply: string;
  if (intent === "book" && sources.length) {
    reply = `تقدر تحجز من الكروت${regionHint}. اختر تجربة واضغط «احجز».`;
  } else if (intent === "story") {
    reply = sources.some((s) => /طائي|تطعيس/i.test(s.title))
      ? "عندنا قصص تراثية جميلة — اختر تجربة فيها «قصة تراثية» من الكروت."
      : "سجّل دخولك لقراءة القصص كاملة، أو اختر تجربة من الكروت.";
  } else if (intent === "inquiry") {
    reply = "اكتب استفسارك في النموذج بالأسفل، أو اختر «استفسار» من البداية.";
  } else if (sources.length) {
    reply = `إليك ${sources.length} تجربة مناسبة${regionHint}. اختر من الكروت للحجز أو القصة.`;
    intent = "suggest";
  } else {
    reply =
      "لم أجد تجربة مطابقة — جرّب منطقة أو فئة أخرى من الكروت، أو اسألني عن المنصة.";
  }

  const actions: ChatAction[] | undefined =
    intent === "inquiry"
      ? [{ type: "inquiry", label: "إرسال استفسار", subject: m }]
      : undefined;

  return {
    success: true,
    reply,
    sources: sources.length ? sources : undefined,
    intent,
    actions,
    mode: "demo",
  };
}
