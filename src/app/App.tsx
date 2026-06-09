import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin, Search, Star, Clock, Users, ChevronLeft,
  Menu, X, Heart, ChevronDown, Leaf, Phone, CheckCircle, Plus, BookOpen, LogIn, LogOut, LayoutDashboard,
} from "lucide-react";
import { BookingFlow } from "./components/BookingFlow";
import { AddExperienceForm } from "./components/AddExperienceForm";
import { Chatbot } from "./components/Chatbot";
import { UserDashboard } from "./components/UserDashboard";
import { VisitorTestimonials } from "./components/VisitorTestimonials";
import { ExperienceDetailModal } from "./components/ExperienceDetailModal";
import { ExperienceStoryModal } from "./components/ExperienceStoryModal";
import { ReefLogo } from "./components/ReefLogo";
import { assetUrl } from "./utils/assetUrl";
import {
  fetchExperiences,
  checkApiHealth,
  AUTH_STORAGE_KEY,
  type AuthUser,
} from "./api/client";
import { AuthModal } from "./components/AuthModal";
import { enrichExperience, hasHeritageStory } from "./data/experienceEnrichment";
import { hailExperiences } from "./data/hailExperiences";
import { RegionSpotlight } from "./components/RegionSpotlight";
import { useUserRegion } from "./hooks/useUserRegion";
import { ALL_REGIONS } from "./data/regions";

export interface Experience {
  id: number;
  title: string;
  region: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  host: string;
  maxGroup: number;
  tags: string[];
  featured: boolean;
  /** إثراء تفاصيل الحجز والتراث — نموذج مربط الطائي */
  description?: string;
  bookingIncludes?: string[];
  bookingOptions?: { label: string; description: string }[];
  heritageStory?: string;
  hostStory?: string;
  hostName?: string;
  hostTitle?: string;
  whySpecial?: string;
  previewImages?: string[];
}

interface HowStep {
  step: string;
  title: string;
  desc: string;
  Icon: React.ElementType;
}

const STATIC_EXPERIENCES: Experience[] = [
  {
    id: 1,
    title: "قطاف التمور في واحة الأحساء",
    region: "المنطقة الشرقية",
    category: "زراعة",
    price: 120,
    duration: "٤ ساعات",
    rating: 4.9,
    reviews: 142,
    imageUrl: "https://images.unsplash.com/photo-1642073537056-20608544f111?w=600&h=400&fit=crop&auto=format",
    host: "أبو محمد الزهراني",
    maxGroup: 8,
    tags: ["تمور", "حصاد", "تراث"],
    featured: true,
  },
  {
    id: 2,
    title: "تجربة الفلاحة التقليدية في عسير",
    region: "منطقة عسير",
    category: "زراعة",
    price: 95,
    duration: "٦ ساعات",
    rating: 4.8,
    reviews: 98,
    imageUrl: "https://images.unsplash.com/photo-1616382093586-84ed7932c216?w=600&h=400&fit=crop&auto=format",
    host: "أم سالم العسيري",
    maxGroup: 6,
    tags: ["حراثة", "جبال", "أسرة"],
    featured: false,
  },
  {
    id: 3,
    title: "قطف ورد الطائف مع المزارعين",
    region: "منطقة مكة المكرمة",
    category: "زراعة",
    price: 150,
    duration: "٣ ساعات",
    rating: 4.9,
    reviews: 215,
    imageUrl: "https://images.unsplash.com/photo-1722435693931-c54b95084d56?w=600&h=400&fit=crop&auto=format",
    host: "فارس القحطاني",
    maxGroup: 10,
    tags: ["ورد الطائف", "عطور", "ربيع"],
    featured: true,
  },
  {
    id: 4,
    title: "زيارة مزارع العسل في جبال الباحة",
    region: "منطقة الباحة",
    category: "مواشي",
    price: 200,
    duration: "٥ ساعات",
    rating: 4.7,
    reviews: 76,
    imageUrl: "https://images.unsplash.com/photo-1758522965291-36664fbdac9c?w=600&h=400&fit=crop&auto=format",
    host: "ناصر آل زاهر",
    maxGroup: 5,
    tags: ["عسل", "نحل بري", "جبال"],
    featured: false,
  },
  {
    id: 5,
    title: "رحلة صيد تقليدي في خليج جازان",
    region: "منطقة جازان",
    category: "صيد",
    price: 180,
    duration: "٨ ساعات",
    rating: 4.6,
    reviews: 54,
    imageUrl: "https://images.unsplash.com/photo-1778098809190-dbd18f7c0729?w=600&h=400&fit=crop&auto=format",
    host: "عبدالله الجازاني",
    maxGroup: 8,
    tags: ["بحر", "غروب", "تراث"],
    featured: false,
  },
  {
    id: 6,
    title: "ليلة في مزرعة النخيل بالمدينة",
    region: "منطقة المدينة المنورة",
    category: "إقامة",
    price: 350,
    duration: "ليلة كاملة",
    rating: 4.9,
    reviews: 189,
    imageUrl: "https://images.unsplash.com/photo-1604302882991-b75900e23890?w=600&h=400&fit=crop&auto=format",
    host: "حمد المدني",
    maxGroup: 4,
    tags: ["نخيل", "هدوء", "إقامة"],
    featured: true,
  },
  {
    id: 7,
    title: "نسج السدو التراثي مع حرفيات الرياض",
    region: "منطقة الرياض",
    category: "مهن",
    price: 130,
    duration: "٤ ساعات",
    rating: 4.8,
    reviews: 67,
    imageUrl: "https://images.unsplash.com/photo-1638310533874-6c124c012e1d?w=600&h=400&fit=crop&auto=format",
    host: "أم خالد العنزي",
    maxGroup: 6,
    tags: ["سدو", "نسيج", "تراث"],
    featured: true,
  },
  {
    id: 8,
    title: "رعي الإبل في بادية نجد",
    region: "منطقة الرياض",
    category: "مواشي",
    price: 160,
    duration: "٦ ساعات",
    rating: 4.7,
    reviews: 45,
    imageUrl: "https://images.unsplash.com/photo-1659870461071-9bf6852f3cdd?w=600&h=400&fit=crop&auto=format",
    host: "سالم الدوسري",
    maxGroup: 10,
    tags: ["إبل", "بادية", "رعي"],
    featured: false,
  },
  {
    id: 9,
    title: "صناعة سلال الخوص في الأحساء",
    region: "المنطقة الشرقية",
    category: "مهن",
    price: 110,
    duration: "٣ ساعات",
    rating: 4.6,
    reviews: 83,
    imageUrl: "https://images.unsplash.com/photo-1707978932202-751b08324daf?w=600&h=400&fit=crop&auto=format",
    host: "فاطمة العبدالله",
    maxGroup: 8,
    tags: ["خوص", "سلال", "حرفة"],
    featured: false,
  },
  {
    id: 10,
    title: "قطف الرمان في بساتين القصيم",
    region: "منطقة القصيم",
    category: "زراعة",
    price: 85,
    duration: "٥ ساعات",
    rating: 4.8,
    reviews: 112,
    imageUrl: "https://images.unsplash.com/photo-1759211695822-9e214a87d082?w=600&h=400&fit=crop&auto=format",
    host: "أبو عبدالرحمن البريدي",
    maxGroup: 12,
    tags: ["رمان", "قصيم", "بستان"],
    featured: false,
  },
  {
    id: 11,
    title: "صيد الأسماك في شواطئ تبوك",
    region: "منطقة تبوك",
    category: "صيد",
    price: 200,
    duration: "٧ ساعات",
    rating: 4.7,
    reviews: 39,
    imageUrl: "https://images.unsplash.com/photo-1777543807214-1a45ca79f5bf?w=600&h=400&fit=crop&auto=format",
    host: "ماجد السلمي",
    maxGroup: 6,
    tags: ["بحر أحمر", "تبوك", "قوارب"],
    featured: false,
  },
  {
    id: 12,
    title: "إقامة في قرية عسير الجبلية",
    region: "منطقة عسير",
    category: "إقامة",
    price: 420,
    duration: "ليلة كاملة",
    rating: 4.9,
    reviews: 156,
    imageUrl: "https://images.unsplash.com/photo-1665477116539-0bab93c41e87?w=600&h=400&fit=crop&auto=format",
    host: "عائلة آل شهري",
    maxGroup: 5,
    tags: ["جبال", "عسير", "ضباب"],
    featured: true,
  },
  {
    id: 13,
    title: "تقطير عطر الورد الطائفي يدوياً",
    region: "منطقة مكة المكرمة",
    category: "مهن",
    price: 175,
    duration: "٤ ساعات",
    rating: 4.9,
    reviews: 203,
    imageUrl: "https://images.unsplash.com/photo-1582758054019-6e219958f733?w=600&h=400&fit=crop&auto=format",
    host: "عبدالعزيز العتيبي",
    maxGroup: 8,
    tags: ["عطور", "تقطير", "ورد"],
    featured: true,
  },
  ...hailExperiences,
];

const categories = [
  { id: "all", label: "الكل", emoji: "🌿" },
  { id: "محميات", label: "محميات وطبيعة", emoji: "🦌" },
  { id: "فعاليات", label: "فعاليات وتطعيس", emoji: "✨" },
  { id: "مغامرات", label: "مغامرات وجبال", emoji: "🥾" },
  { id: "زراعة", label: "زراعة", emoji: "🌾" },
  { id: "مواشي", label: "مواشي وعسل", emoji: "🐝" },
  { id: "صيد", label: "صيد بحري", emoji: "🎣" },
  { id: "إقامة", label: "إقامة ريفية", emoji: "🏡" },
  { id: "مهن", label: "مهن تراثية", emoji: "🪔" },
];

const regions = [
  "جميع المناطق",
  "منطقة الرياض",
  "منطقة مكة المكرمة",
  "المنطقة الشرقية",
  "منطقة عسير",
  "منطقة جازان",
  "منطقة الباحة",
  "منطقة المدينة المنورة",
  "منطقة القصيم",
  "منطقة تبوك",
  "منطقة حائل",
];

const howItWorks: HowStep[] = [
  {
    step: "١",
    title: "استكشف التجارب",
    desc: "تصفّح مئات التجارب الريفية الأصيلة من مختلف أنحاء المملكة، وصفّها حسب المنطقة والوقت والميزانية.",
    Icon: Search,
  },
  {
    step: "٢",
    title: "اختر وتواصل",
    desc: "اطلع على تفاصيل كل تجربة وتقييمات الزوار، ثم تواصل مباشرة مع مقدّم التجربة لتأكيد الحجز.",
    Icon: Phone,
  },
  {
    step: "٣",
    title: "عِش التجربة",
    desc: "استمتع بتجربة ريفية أصيلة واكتشف جمال الريف السعودي مع مرشدين محليين متمرسين.",
    Icon: CheckCircle,
  },
];

const NAV_LINKS = [
  { id: "experiences", label: "التجارب" },
  { id: "regions", label: "المناطق" },
  { id: "about", label: "عن المنصة" },
] as const;

function normalizeSearch(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchesExperience(exp: Experience, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const haystack = [
    exp.title,
    exp.region,
    exp.category,
    exp.host,
    exp.duration,
    ...exp.tags,
  ]
    .join(" ")
    .toLowerCase();
  return (
    haystack.includes(q) ||
    q.split(" ").every((word) => word.length > 0 && haystack.includes(word))
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("جميع المناطق");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [bookingExperience, setBookingExperience] = useState<Experience | null>(null);
  const [storyExperience, setStoryExperience] = useState<Experience | null>(null);
  const [detailExperience, setDetailExperience] = useState<Experience | null>(null);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<string | undefined>();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeNav, setActiveNav] = useState<string>("");
  const [experienceList, setExperienceList] = useState<Experience[]>(STATIC_EXPERIENCES);
  const [usingApi, setUsingApi] = useState(false);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [countSource, setCountSource] = useState<Experience[]>(STATIC_EXPERIENCES);
  const experiencesRef = useRef<HTMLElement>(null);
  const heroSearchRef = useRef<HTMLInputElement>(null);
  const { fullRegion: userRegion, status: locationStatus, requestLocation } = useUserRegion();

  useEffect(() => {
    checkApiHealth().then(setUsingApi);
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) setAuthUser(JSON.parse(saved) as AuthUser);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!usingApi) {
      setCountSource(STATIC_EXPERIENCES);
      return;
    }
    fetchExperiences()
      .then((data) => setCountSource(data as Experience[]))
      .catch(() => setCountSource(STATIC_EXPERIENCES));
  }, [usingApi]);

  const regionsWithCounts = useMemo(
    () =>
      ALL_REGIONS.map((r) => ({
        ...r,
        experiences: countSource.filter((e) => e.region === r.fullRegion).length,
      })),
    [countSource]
  );

  const displayedRegions = showAllRegions
    ? regionsWithCounts
    : regionsWithCounts.filter((r) => r.featured);

  useEffect(() => {
    if (!usingApi) {
      setExperienceList(STATIC_EXPERIENCES);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoadingExperiences(true);
      try {
        const data = await fetchExperiences({
          region: selectedRegion,
          category: activeCategory,
          search: searchQuery,
        });
        if (!cancelled) {
          setExperienceList(data as Experience[]);
        }
      } catch {
        if (!cancelled) setExperienceList(STATIC_EXPERIENCES);
      } finally {
        if (!cancelled) setLoadingExperiences(false);
      }
    }, searchQuery ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [usingApi, selectedRegion, activeCategory, searchQuery]);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveNav(sectionId);
    }
    setMobileMenuOpen(false);
  }, []);

  const focusExperiences = useCallback(() => {
    scrollToSection("experiences");
  }, [scrollToSection]);

  useEffect(() => {
    if (!normalizeSearch(searchQuery)) return;
    const timer = window.setTimeout(() => {
      experiencesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const openAddExperience = () => {
    setShowAddExperience(true);
    setMobileMenuOpen(false);
  };

  const openLogin = () => {
    setShowLogin(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setShowDashboard(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setMobileMenuOpen(false);
  };

  const openDashboard = () => {
    if (authUser) setShowDashboard(true);
    setMobileMenuOpen(false);
  };

  const handleAuthSuccess = (user: AuthUser, isNew?: boolean) => {
    setAuthUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setShowLogin(false);
    if (user.role === "visitor" && (isNew || !user.profileCompleted)) {
      setDashboardInitialTab("profile");
      setShowDashboard(true);
    }
  };

  const handleUserUpdate = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const base = usingApi
      ? experienceList
      : STATIC_EXPERIENCES.filter((exp) => {
          const matchCat = activeCategory === "all" || exp.category === activeCategory;
          const matchRegion =
            selectedRegion === "جميع المناطق" || exp.region === selectedRegion;
          const matchSearch = matchesExperience(exp, searchQuery);
          return matchCat && matchRegion && matchSearch;
        });
    return base.map((exp) => enrichExperience(exp));
  }, [usingApi, experienceList, activeCategory, selectedRegion, searchQuery]);

  const hasActiveSearch = normalizeSearch(searchQuery).length > 0;

  const resolveExperienceById = useCallback(
    (id: number | string) => {
      const numId = Number(id);
      const pool = (usingApi ? experienceList : STATIC_EXPERIENCES).map((exp) =>
        enrichExperience(exp)
      );
      return pool.find((e) => e.id === numId) ?? null;
    },
    [usingApi, experienceList]
  );

  if (showDashboard && authUser) {
    return (
      <UserDashboard
        user={authUser}
        initialTab={dashboardInitialTab}
        onUserUpdate={handleUserUpdate}
        onBack={() => {
          setShowDashboard(false);
          setDashboardInitialTab(undefined);
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center hover:opacity-85 transition-opacity"
              aria-label="عشيبة السعودية الريفية — الصفحة الرئيسية"
            >
              <ReefLogo height={42} />
            </button>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`text-sm transition-colors ${
                    activeNav === link.id
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {authUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden lg:inline">
                    {authUser.name}
                    <span className="text-primary font-bold mr-1">· {authUser.roleLabel}</span>
                  </span>
                  <button
                    type="button"
                    onClick={openDashboard}
                    className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    لوحتي
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                    title="تسجيل خروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2 hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  تسجيل دخول
                </button>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-border flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`text-sm text-right py-1 ${
                    activeNav === link.id ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {authUser ? (
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs text-muted-foreground text-right">
                    {authUser.name} · <span className="text-primary font-bold">{authUser.roleLabel}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openDashboard}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl px-4 py-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      لوحتي
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border"
                    >
                      <LogOut className="w-4 h-4" />
                      خروج
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2.5 w-fit"
                >
                  <LogIn className="w-4 h-4" />
                  تسجيل دخول
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-16 h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0D1A08]">
          <img
            src="https://images.unsplash.com/photo-1695289566332-08eb1e223b6e?w=1600&h=900&fit=crop&auto=format"
            alt="الريف السعودي - تلال خضراء ومزارع أصيلة"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1A08]/30 via-transparent to-[#0D1A08]/85" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0D1A08]/40" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-accent/25 border border-accent/50 rounded-full px-4 py-1.5 text-sm font-semibold text-[#FFBA88] mb-6">
              ✦ مبادرة تدعم رؤية السعودية ٢٠٣٠
            </span>

            <h1
              className="text-4xl sm:text-6xl font-extrabold text-white leading-[1.2] mb-5"
              style={{ fontFamily: "'Noto Serif Arabic', serif" }}
            >
              اكتشف جمال
              <br />
              <span className="text-[#AEDA7A]">أرياف المملكة</span>
            </h1>

            <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              أكثر من ١٣٠ تجربة زراعية وريفية أصيلة في ١٤ منطقة — بما فيها حائل
              ومحمياتها وجبالها. اشترك في
              الحصاد، تعرّف على المزارعين، وعِش بعيداً عن صخب المدينة.
            </p>

            <form
              className="bg-card rounded-2xl p-1.5 flex gap-2 max-w-lg shadow-2xl shadow-black/40"
              onSubmit={(e) => {
                e.preventDefault();
                focusExperiences();
              }}
            >
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  ref={heroSearchRef}
                  type="search"
                  placeholder="ابحث عن تجربة، منطقة، أو نشاط..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm text-right"
                  aria-label="بحث عن تجارب"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-bold text-sm hover:bg-primary/90 transition-colors shrink-0"
              >
                ابحث الآن
              </button>
            </form>
          </div>
        </div>

        {/* Floating stat badges */}
        <div className="hidden lg:flex absolute left-12 bottom-16 flex-col gap-3">
          {[
            { val: "٤.٨ ★", label: "متوسط التقييم" },
            { val: "٨٠٠+", label: "زيارة شهرياً" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-white"
            >
              <div
                className="text-xl font-bold"
                style={{ fontFamily: "'Noto Serif Arabic', serif" }}
              >
                {s.val}
              </div>
              <div className="text-white/60 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-x-reverse divide-primary-foreground/20">
          {[
            { val: "١٣٠+", label: "تجربة ريفية" },
            { val: "١٤", label: "منطقة سعودية" },
            { val: "٤.٨", label: "متوسط التقييم" },
            { val: "٨٠٠+", label: "زيارة شهرياً" },
          ].map((s) => (
            <div key={s.label} className="text-center px-4">
              <div
                className="text-2xl sm:text-3xl font-black text-primary-foreground mb-0.5"
                style={{ fontFamily: "'Noto Serif Arabic', serif" }}
              >
                {s.val}
              </div>
              <div className="text-primary-foreground/60 text-xs sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main
        ref={experiencesRef}
        id="experiences"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20"
      >
        {hasActiveSearch && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-primary/10 border border-primary/25 rounded-xl px-4 py-3">
            <p className="text-sm text-foreground">
              نتائج البحث عن{" "}
              <span className="font-bold text-primary">«{searchQuery.trim()}»</span>
              {" — "}
              <span className="font-bold">{filtered.length}</span> تجربة
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline"
            >
              مسح البحث
            </button>
          </div>
        )}

        <RegionSpotlight
          fullRegion={userRegion}
          status={locationStatus}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          onRequestLocation={requestLocation}
        />

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-10">
          {/* Category pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-card text-foreground border border-border hover:border-primary/40 hover:bg-card"
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Region selector + count */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium hover:border-primary/40 transition-colors"
              >
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>{selectedRegion}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    regionDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {regionDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 bg-card border border-border rounded-2xl shadow-xl z-30 w-56 py-1.5 overflow-hidden">
                  {regions.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedRegion(r);
                        setRegionDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                        selectedRegion === r
                          ? "text-primary font-semibold bg-muted"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="text-foreground font-bold">{filtered.length}</span>
              تجربة متاحة
              {usingApi && (
                <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                  متصل بالخادم
                </span>
              )}
              {loadingExperiences && (
                <span className="text-[10px] text-muted-foreground">جاري التحميل...</span>
              )}
            </p>
          </div>
        </div>

        {/* Experience Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {filtered.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                saved={savedIds.has(exp.id)}
                onToggleSave={() => toggleSave(exp.id)}
                onOpen={() => setDetailExperience(exp)}
                onBook={() => setBookingExperience(exp)}
                onExploreStory={
                  hasHeritageStory(exp) ? () => setStoryExperience(exp) : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-xl font-bold text-foreground mb-2">لا توجد تجارب مطابقة</p>
            <p className="text-sm text-muted-foreground">
              جرّب تغيير الفلتر أو المنطقة للعثور على تجربتك المثالية
            </p>
          </div>
        )}

        {/* About + How It Works */}
        <section id="about" className="mb-20 scroll-mt-24">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-10">
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3"
              style={{ fontFamily: "'Noto Serif Arabic', serif" }}
            >
              عن المنصة
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
              «عشيبة السعودية الريفية» منصة رقمية تربط الزوار بتجارب زراعية وريفية أصيلة في
              مختلف مناطق المملكة — من محميات حائل (الفقع والفروة) وتطعيسها، إلى مزارع
              الفراولة وجبال أجا. ندعم المزارعين والحرفيين المحليين ونساهم في السياحة
              الريفية المستدامة ضمن رؤية السعودية ٢٠٣٠.
            </p>
          </div>

          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3"
              style={{ fontFamily: "'Noto Serif Arabic', serif" }}
            >
              كيف تعمل المنصة؟
            </h2>
            <p className="text-muted-foreground text-base">
              ثلاث خطوات بسيطة للوصول إلى تجربتك الريفية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-14 right-[calc(33.33%+1.5rem)] left-[calc(33.33%+1.5rem)] h-px bg-border" />

            {howItWorks.map((step, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-7 text-center hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="relative w-12 h-12 mx-auto mb-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <step.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div
                    className="absolute -top-1.5 -left-1.5 text-xs font-black text-primary/40 leading-none"
                    style={{ fontFamily: "'Noto Serif Arabic', serif" }}
                  >
                    {step.step}
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2.5">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Regions */}
        <section id="regions" className="mb-6 scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Noto Serif Arabic', serif" }}
            >
              استكشف بالمنطقة
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowAllRegions((prev) => !prev);
                scrollToSection("regions");
              }}
              className="text-primary text-sm font-semibold flex items-center gap-1 group hover:gap-2 transition-all"
            >
              <span>{showAllRegions ? "عرض أقل" : "عرض الكل"}</span>
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${
                  showAllRegions
                    ? "rotate-90"
                    : "group-hover:-translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4 -mt-4">
            {showAllRegions
              ? `جميع المناطق (${displayedRegions.length})`
              : `أبرز المناطق — اضغط عرض الكل لرؤية ${regionsWithCounts.length} منطقة`}
          </p>

          <div
            className={`grid gap-4 ${
              showAllRegions
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            }`}
          >
            {displayedRegions.map((region) => (
              <button
                type="button"
                key={region.fullRegion}
                onClick={() => {
                  setSelectedRegion(region.fullRegion);
                  setActiveCategory("all");
                  setSearchQuery("");
                  scrollToSection("experiences");
                }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group text-right w-full"
                style={{ aspectRatio: "3/4" }}
              >
                <img
                  src={assetUrl(region.imageUrl)}
                  alt={`منطقة ${region.name} - ${region.desc}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-bold text-xl mb-0.5">{region.name}</h3>
                  <p className="text-white/65 text-xs mb-2.5">{region.desc}</p>
                  <span className="inline-block text-xs bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                    {region.experiences} تجربة
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <VisitorTestimonials />
      </main>

      {/* ─── PROVIDER CTA ─── */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[#AEDA7A] text-xs font-bold tracking-widest uppercase mb-4">
                لمقدمي التجارب
              </div>
              <h2
                className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5"
                style={{ fontFamily: "'Noto Serif Arabic', serif" }}
              >
                هل لديك مزرعة
                <br />
                أو تجربة ريفية؟
              </h2>
              <p className="text-primary-foreground/70 text-base leading-relaxed mb-7">
                انضم إلى مجتمع مقدمي التجارب وشارك إرثك الزراعي مع الزوار من
                كل أنحاء المملكة. دعم كامل من فريقنا لإطلاق صفحتك الخاصة.
              </p>

              <ul className="flex flex-col gap-3.5 mb-8">
                {[
                  "إنشاء صفحة تجربتك مجاناً",
                  "وصول لآلاف الزوار كل شهر",
                  "دعم فني ومالي متواصل",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                    <div className="w-5 h-5 rounded-full bg-accent/80 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={openAddExperience}
                className="bg-accent text-white font-bold px-8 py-3.5 rounded-xl hover:bg-accent/85 transition-colors shadow-lg shadow-accent/30"
              >
                سجّل تجربتك الآن
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-primary/40">
              <img
                src={assetUrl("/images/provider-farmers.png")}
                alt="مزارع سعودي يقطف البن في مزرعة تقليدية"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 via-transparent to-transparent" />
              <div className="absolute bottom-5 right-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white max-w-[180px]">
                <div
                  className="text-2xl font-black mb-0.5"
                  style={{ fontFamily: "'Noto Serif Arabic', serif" }}
                >
                  +٤٠
                </div>
                <div className="text-xs text-white/70">مزارع سجّل تجربته هذا العام</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0E1408] text-white/50">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <ReefLogo height={36} className="brightness-125" />
              </div>
              <p className="text-xs leading-relaxed mb-4">
                منصة رقمية تدعم السياحة الريفية المستدامة وتمكّن المجتمعات
                الزراعية في مختلف مناطق المملكة.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[10px] border border-white/15 rounded-full px-3 py-1.5 text-white/40">
                <span>رؤية</span>
                <span className="text-[#AEDA7A] font-bold">٢٠٣٠</span>
              </div>
            </div>

            {[
              {
                title: "المنصة",
                links: ["استكشف التجارب", "المناطق", "كيف تعمل المنصة", "الأسئلة الشائعة"],
              },
              {
                title: "للمزارعين",
                links: ["أضف تجربتك", "إدارة الحجوزات", "دعم مقدمي الخدمة", "شروط الانضمام"],
              },
              {
                title: "تواصل معنا",
                links: ["واتساب", "البريد الإلكتروني", "تويتر / X", "إنستغرام"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs hover:text-white/80 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">© ٢٠٢٦ عشيبة السعودية الريفية. جميع الحقوق محفوظة.</p>
            <p className="text-xs">صُنعت بشغف لأرياف المملكة 🌿</p>
          </div>
        </div>
      </footer>

      {bookingExperience && (
        <BookingFlow
          experience={bookingExperience}
          authUser={authUser}
          onClose={() => setBookingExperience(null)}
        />
      )}

      {showAddExperience && (
        <AddExperienceForm onClose={() => setShowAddExperience(false)} />
      )}

      {showLogin && (
        <AuthModal onClose={() => setShowLogin(false)} onSuccess={handleAuthSuccess} />
      )}

      {detailExperience && (
        <ExperienceDetailModal
          experience={detailExperience}
          onClose={() => setDetailExperience(null)}
          onBook={() => setBookingExperience(detailExperience)}
          onOpenStory={
            hasHeritageStory(detailExperience)
              ? () => setStoryExperience(detailExperience)
              : undefined
          }
        />
      )}

      {storyExperience && (
        <ExperienceStoryModal
          experience={storyExperience}
          isLoggedIn={!!authUser}
          onLogin={() => setShowLogin(true)}
          onClose={() => setStoryExperience(null)}
          onBook={() => setBookingExperience(storyExperience)}
        />
      )}

      <Chatbot
        authUser={authUser}
        userRegion={userRegion}
        onBookExperience={(id) => {
          const exp = resolveExperienceById(id);
          if (exp) setBookingExperience(exp);
        }}
        onOpenStory={(id) => {
          const exp = resolveExperienceById(id);
          if (exp) setStoryExperience(exp);
        }}
        onRequestLogin={openLogin}
      />
    </div>
  );
}

function ExperienceCard({
  experience,
  saved,
  onToggleSave,
  onOpen,
  onBook,
  onExploreStory,
}: {
  experience: Experience;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
  onBook: () => void;
  onExploreStory?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 bg-muted overflow-hidden shrink-0">
        <img
          src={assetUrl(experience.imageUrl)}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {experience.featured && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
            ✦ مميز
          </div>
        )}
        {onExploreStory && (
          <div className="absolute top-12 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            قصة تراثية
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className="absolute top-3 left-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              saved ? "fill-accent text-accent" : "text-foreground/70"
            }`}
          />
        </button>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/45 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-xs">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{experience.region}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors flex-1">
            {experience.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-muted rounded-lg px-2 py-1">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-foreground">{experience.rating}</span>
            <span className="text-xs text-muted-foreground">({experience.reviews})</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {experience.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {experience.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 shrink-0" />
            حتى {experience.maxGroup} أشخاص
          </span>
        </div>

        {/* Host */}
        <p className="text-xs text-muted-foreground mb-4">
          مع{" "}
          <span className="text-foreground font-semibold">{experience.host}</span>
        </p>

        {onExploreStory && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExploreStory();
            }}
            className="w-full mb-3 flex items-center justify-center gap-2 border border-primary/40 text-primary text-sm font-bold rounded-xl py-2 hover:bg-primary/5 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            اكتشف القصة والمكان
          </button>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3.5 border-t border-border mt-auto">
          <div>
            <span
              className="font-black text-xl text-foreground"
              style={{ fontFamily: "'Noto Serif Arabic', serif" }}
            >
              {experience.price}
            </span>
            <span className="text-muted-foreground text-xs"> ر.س / شخص</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className="bg-primary text-primary-foreground text-sm font-bold rounded-xl px-4 py-2 hover:bg-primary/90 active:scale-95 transition-all"
          >
            احجز
          </button>
        </div>
      </div>
    </div>
  );
}
