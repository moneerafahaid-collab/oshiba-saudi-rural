import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Star,
  MapPin,
  TrendingUp,
  Loader2,
  LayoutDashboard,
  MessageSquare,
  Mail,
  Compass,
  Mountain,
  Sparkles,
} from "lucide-react";
import {
  fetchVisitorDashboard,
  submitInquiry,
  updateVisitorProfile,
  type AuthUser,
  type VisitorInterest,
} from "../api/client";
import { ProviderPanel } from "./ProviderPanel";
import { AdminPanel } from "./AdminPanel";
import { DashboardLayout } from "./DashboardLayout";

interface UserDashboardProps {
  user: AuthUser;
  onBack: () => void;
  onLogout: () => void;
  initialTab?: string;
  onUserUpdate?: (user: AuthUser) => void;
}

type DashData = Record<string, unknown>;
type VisitorTab = "overview" | "profile" | "bookings" | "inquiry";

const INTEREST_OPTIONS: {
  id: VisitorInterest;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { id: "adventure", label: "محب المغامرات", desc: "تطعيس، جبال، أنشطة مثيرة", icon: Mountain },
  { id: "exploration", label: "محب الاستكشاف", desc: "محميات، تراث، اكتشاف المناطق", icon: Compass },
  { id: "both", label: "الاثنان معاً", desc: "أحب المغامرة والاستكشاف", icon: Sparkles },
];

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border text-right shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xl font-black text-foreground">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function VisitorDashboard({ user, onBack, onLogout, initialTab, onUserUpdate }: UserDashboardProps) {
  const [tab, setTab] = useState<VisitorTab>(
    (initialTab as VisitorTab) || "overview"
  );
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inquiry, setInquiry] = useState({ subject: "", message: "" });
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquiryBusy, setInquiryBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<VisitorInterest | "">(
    user.interestType || ""
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const load = async () => {
      try {
        const res = await fetchVisitorDashboard(user.phone);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "تعذّر تحميل اللوحة");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const profile = (data?.profile as Record<string, string>) || {};
  const stats = (data?.stats as Record<string, number | string>) || {};
  const bookings = (data?.bookings as Record<string, unknown>[]) || [];

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    {
      id: "profile",
      label: "بروفايلي",
      icon: User,
      badge: !user.profileCompleted ? 1 : undefined,
    },
    { id: "bookings", label: "حجوزاتي", icon: Calendar },
    { id: "inquiry", label: "استفسار", icon: Mail },
  ];

  const profileCard = data ? (
    <div className="flex items-center gap-3 bg-card rounded-2xl p-4 mb-5 border border-border shadow-sm">
      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <User className="w-6 h-6 text-primary" />
      </div>
      <div className="text-right flex-1">
        <p className="font-bold text-foreground">{profile.name || user.name}</p>
        <p className="text-xs text-muted-foreground dir-ltr text-right">
          {profile.phone || user.phone}
          {(profile.email || user.email) && ` · ${profile.email || user.email}`}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {profile.age || user.age ? `العمر: ${profile.age || user.age}` : ""}
          {(profile.interestLabel || user.interestLabel) &&
            ` · ${profile.interestLabel || user.interestLabel}`}
        </p>
        <span className="inline-block mt-1 text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
          {profile.roleLabel || user.roleLabel}
        </span>
      </div>
    </div>
  ) : null;

  return (
    <DashboardLayout
      title="حسابي"
      user={user}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(id) => setTab(id as VisitorTab)}
      onBack={onBack}
      onLogout={onLogout}
      actionMsg={profileMsg || inquiryMsg || undefined}
      loading={loading}
      error={error}
      profileCard={!loading && !error && data ? profileCard : undefined}
    >
      {data && (
        <>
          {tab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                label="حجوزاتي"
                value={stats.bookingsCount as number}
                icon={Calendar}
              />
              <StatCard
                label="تقييماتي"
                value={stats.reviewsCount as number}
                icon={Star}
              />
              <StatCard
                label="متوسط تقييمي"
                value={stats.avgRatingGiven as number}
                icon={TrendingUp}
              />
            </div>
          )}

          {tab === "profile" && (
            <div className="max-w-xl">
              <h3 className="text-sm font-bold text-foreground mb-2">اهتماماتك في الريف</h3>
              <p className="text-xs text-muted-foreground mb-4">
                نستخدم هذه البيانات لتحسين تجاربك وتحليل اهتمامات الزوار — العمر والتفضيلات
                محفوظة بأمان
              </p>
              {!user.profileCompleted && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                  أكمل بروفايلك لنقترح تجارب أنسب لك
                </p>
              )}
              <div className="space-y-2 mb-4">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedInterest(opt.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 text-right transition-colors ${
                      selectedInterest === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-muted/30"
                    }`}
                  >
                    <opt.icon
                      className={`w-5 h-5 shrink-0 ${
                        selectedInterest === opt.id ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="font-bold text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!selectedInterest || profileBusy}
                onClick={async () => {
                  if (!selectedInterest) return;
                  setProfileBusy(true);
                  setProfileMsg("");
                  try {
                    const res = await updateVisitorProfile(user.phone, selectedInterest);
                    setProfileMsg(res.message);
                    onUserUpdate?.(res.user);
                  } catch (err) {
                    setProfileMsg(err instanceof Error ? err.message : "فشل الحفظ");
                  } finally {
                    setProfileBusy(false);
                  }
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {profileBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ البروفايل"
                )}
              </button>
            </div>
          )}

          {tab === "bookings" && (
            <>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16 bg-card rounded-xl border border-border">
                  لا توجد حجوزات بعد — احجز تجربتك الأولى من الصفحة الرئيسية!
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {bookings.map((b) => (
                    <div
                      key={String(b.invoiceNumber)}
                      className="rounded-xl border border-border bg-card p-4 text-right shadow-sm"
                    >
                      <p className="font-semibold text-sm text-foreground">
                        {String(b.experienceTitle)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {String(b.experienceRegion)} · {String(b.dateLabel)}
                      </p>
                      <p className="text-xs text-primary font-bold mt-2">
                        {String(b.total)} ر.س · {String(b.guests)} أشخاص
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "inquiry" && (
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">استفسار أو مساعدة</h3>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setInquiryBusy(true);
                  setInquiryMsg("");
                  try {
                    const res = await submitInquiry({
                      userName: user.name,
                      userPhone: user.phone,
                      subject: inquiry.subject,
                      message: inquiry.message,
                    });
                    setInquiryMsg(res.message);
                    setInquiry({ subject: "", message: "" });
                  } catch (err) {
                    setInquiryMsg(err instanceof Error ? err.message : "فشل الإرسال");
                  } finally {
                    setInquiryBusy(false);
                  }
                }}
                className="space-y-3 text-right bg-card rounded-2xl border border-border p-5 shadow-sm"
              >
                <input
                  required
                  value={inquiry.subject}
                  onChange={(e) => setInquiry((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="موضوع الاستفسار"
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-background"
                />
                <textarea
                  required
                  rows={5}
                  value={inquiry.message}
                  onChange={(e) => setInquiry((f) => ({ ...f, message: e.target.value }))}
                  placeholder="اكتب سؤالك أو طلب المساعدة..."
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm resize-none bg-background"
                />
                <button
                  type="submit"
                  disabled={inquiryBusy}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inquiryBusy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال للفريق"
                  )}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export function UserDashboard({
  user,
  onBack,
  onLogout,
  initialTab,
  onUserUpdate,
}: UserDashboardProps) {
  if (user.role === "provider") {
    return <ProviderPanel user={user} onBack={onBack} onLogout={onLogout} />;
  }
  if (user.role === "admin") {
    return <AdminPanel user={user} onBack={onBack} onLogout={onLogout} />;
  }
  return (
    <VisitorDashboard
      user={user}
      onBack={onBack}
      onLogout={onLogout}
      initialTab={initialTab}
      onUserUpdate={onUserUpdate}
    />
  );
}
