import { useCallback, useEffect, useState } from "react";
import { assetUrl } from "../utils/assetUrl";
import {
  User,
  Calendar,
  Star,
  Package,
  TrendingUp,
  Loader2,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";
import {
  fetchProviderPanel,
  addProviderExperience,
  deleteProviderExperience,
  updateProviderBooking,
  type AuthUser,
} from "../api/client";
import { ALL_REGIONS } from "../data/regions";
import { DashboardLayout } from "./DashboardLayout";

interface ProviderPanelProps {
  user: AuthUser;
  onBack: () => void;
  onLogout: () => void;
}

type Tab = "overview" | "activities" | "bookings" | "reviews" | "add";

const CATEGORIES = [
  "محميات",
  "فعاليات",
  "مغامرات",
  "زراعة",
  "مواشي",
  "صيد",
  "إقامة",
  "مهن",
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
    <div className="bg-muted/40 rounded-xl p-3 border border-border text-right">
      <div className="flex items-center justify-between mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-lg font-black text-foreground">{value}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

const statusLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغى",
};

export function ProviderPanel({ user, onBack, onLogout }: ProviderPanelProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    title: "",
    region: "منطقة حائل",
    category: "مغامرات",
    price: "",
    duration: "٣ ساعات",
    imageUrl: "",
    maxGroup: "10",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProviderPanel(user.phone);
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحميل اللوحة");
    } finally {
      setLoading(false);
    }
  }, [user.phone]);

  useEffect(() => {
    load();
  }, [load]);

  const profile = (data?.profile as Record<string, string>) || {};
  const stats = (data?.stats as Record<string, number | string>) || {};
  const experiences = (data?.experiences as Record<string, unknown>[]) || [];
  const bookings = (data?.bookings as Record<string, unknown>[]) || [];
  const reviews = (data?.reviews as Record<string, unknown>[]) || [];

  const activeExperiences = experiences.filter((e) => e.active !== false);

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await addProviderExperience(user.phone, {
        ...form,
        price: Number(form.price),
        maxGroup: Number(form.maxGroup),
      });
      flash(res.message);
      setForm((f) => ({ ...f, title: "", price: "" }));
      setTab("activities");
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل الإضافة");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("هل تريد حذف هذا النشاط؟")) return;
    setBusy(true);
    try {
      const res = await deleteProviderExperience(user.phone, id);
      flash(res.message);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل الحذف");
    } finally {
      setBusy(false);
    }
  };

  const handleBooking = async (invoice: string, status: "confirmed" | "cancelled") => {
    setBusy(true);
    try {
      const res = await updateProviderBooking(user.phone, invoice, status);
      flash(res.message);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل التحديث");
    } finally {
      setBusy(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    { id: "activities", label: "أنشطتي", icon: Package },
    { id: "bookings", label: "حجوزات", icon: Calendar },
    { id: "reviews", label: "تعليقات", icon: MessageSquare },
    { id: "add", label: "إضافة", icon: Plus },
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
        </p>
        {profile.providerHost && (
          <p className="text-[11px] text-primary mt-1 font-semibold">{profile.providerHost}</p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <DashboardLayout
      title="مقدم النشاط"
      user={user}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(id) => setTab(id as Tab)}
      onBack={onBack}
      onLogout={onLogout}
      actionMsg={actionMsg}
      loading={loading}
      error={error}
      profileCard={!loading && !error && data ? profileCard : undefined}
    >
      {data && (
        <>
              {tab === "overview" && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    <StatCard label="أنشطتي" value={stats.experiencesCount as number} icon={Package} />
                    <StatCard label="الحجوزات" value={stats.bookingsCount as number} icon={Calendar} />
                    <StatCard
                      label="الإيرادات"
                      value={`${stats.totalRevenue} ر.س`}
                      icon={TrendingUp}
                    />
                    <StatCard label="التقييم" value={stats.avgRating as string} icon={Star} />
                  </div>
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {stats.reviewsCount as number} تعليق من الزوار · استخدم التبويبات لإدارة نشاطك
                  </p>
                </>
              )}

              {tab === "activities" && (
                <>
                  {activeExperiences.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10 bg-muted/20 rounded-xl">
                      لا توجد أنشطة — أضف نشاطك الأول من تبويب «إضافة»
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activeExperiences.map((e) => (
                        <div
                          key={String(e.id)}
                          className="flex items-center gap-3 rounded-xl border border-border p-3"
                        >
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(e.id as string | number)}
                            className="shrink-0 w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 disabled:opacity-50"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <img
                            src={assetUrl(String(e.imageUrl))}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <div className="text-right flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{String(e.title)}</p>
                            <p className="text-xs text-muted-foreground">
                              {String(e.region)} · {String(e.price)} ر.س · ⭐ {String(e.rating)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "bookings" && (
                <>
                  {bookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10 bg-muted/20 rounded-xl">
                      لا توجد حجوزات بعد
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bookings.map((b) => (
                        <div
                          key={String(b.invoiceNumber)}
                          className="rounded-xl border border-border p-3 text-right"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                b.status === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : b.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {statusLabel[String(b.status)] || String(b.status)}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{String(b.experienceTitle)}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {String(b.userName)} · {String(b.dateLabel)} · {String(b.guests)}{" "}
                                أشخاص
                              </p>
                              <p className="text-xs text-primary font-bold mt-1">
                                {String(b.total)} ر.س
                              </p>
                            </div>
                          </div>
                          {b.status === "pending" && (
                            <div className="flex gap-2 mt-3 justify-end">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleBooking(String(b.invoiceNumber), "confirmed")
                                }
                                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                تأكيد
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleBooking(String(b.invoiceNumber), "cancelled")
                                }
                                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                إلغاء
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "reviews" && (
                <>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10 bg-muted/20 rounded-xl">
                      لا توجد تعليقات بعد
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {reviews.map((r) => (
                        <div
                          key={String(r.id)}
                          className="rounded-xl border border-border p-3 text-right"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-amber-500 text-sm font-bold">
                              {"⭐".repeat(Number(r.rating))}
                            </span>
                            <p className="font-semibold text-sm">{String(r.userName)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {String(r.experienceTitle)}
                          </p>
                          <p className="text-sm text-foreground mt-2">{String(r.comment)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "add" && (
                <form onSubmit={handleAdd} className="space-y-3 text-right">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">عنوان النشاط</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      placeholder="مثال: جولة في مزرعة الفراولة"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">المنطقة</label>
                      <select
                        value={form.region}
                        onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      >
                        {ALL_REGIONS.map((r) => (
                          <option key={r.fullRegion} value={r.fullRegion}>
                            {r.fullRegion}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">التصنيف</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">السعر (ر.س)</label>
                      <input
                        required
                        type="number"
                        min={1}
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">المدة</label>
                      <input
                        required
                        value={form.duration}
                        onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        placeholder="٣ ساعات"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">الحد الأقصى</label>
                      <input
                        type="number"
                        min={1}
                        value={form.maxGroup}
                        onChange={(e) => setForm((f) => ({ ...f, maxGroup: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">
                      رابط الصورة (اختياري)
                    </label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm dir-ltr text-right"
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    إضافة النشاط
                  </button>
                </form>
              )}
        </>
      )}
    </DashboardLayout>
  );
}
