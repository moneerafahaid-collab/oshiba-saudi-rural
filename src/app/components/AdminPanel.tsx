import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  Users,
  Package,
  Calendar,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  LayoutDashboard,
  UserPlus,
  Mail,
  Ban,
  RotateCcw,
} from "lucide-react";
import {
  fetchAdminPanel,
  updateSubmission,
  updateUserAccount,
  addUserAccount,
  replyInquiry,
  hideReview,
  updateReviewFeature,
  deleteAdminExperience,
  updateAdminBooking,
  type AuthUser,
} from "../api/client";
import { DashboardLayout } from "./DashboardLayout";

interface AdminPanelProps {
  user: AuthUser;
  onBack: () => void;
  onLogout: () => void;
}

type Tab =
  | "overview"
  | "activities"
  | "bookings"
  | "submissions"
  | "users"
  | "inquiries"
  | "reviews"
  | "addUser";

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

const roleLabel: Record<string, string> = {
  visitor: "زائر",
  provider: "مقدم نشاط",
  admin: "مدير",
};

const statusLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغى",
  approved: "مقبول",
  rejected: "مرفوض",
  open: "مفتوح",
  answered: "تم الرد",
};

export function AdminPanel({ user, onBack, onLogout }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    role: "provider" as "visitor" | "provider" | "admin",
    providerHost: "",
    password: "123123",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminPanel();
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحميل اللوحة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = (data?.stats as Record<string, number | string>) || {};
  const users = (data?.users as Record<string, unknown>[]) || [];
  const experiences = (data?.experiences as Record<string, unknown>[]) || [];
  const bookings = (data?.bookings as Record<string, unknown>[]) || [];
  const submissions = (data?.submissions as Record<string, unknown>[]) || [];
  const inquiries = (data?.inquiries as Record<string, unknown>[]) || [];
  const reviews = (data?.reviews as Record<string, unknown>[]) || [];
  const visitorAnalytics = (data?.visitorAnalytics as Record<string, unknown>) || {};

  const activeExperiences = experiences.filter((e) => e.active !== false);
  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const openInquiries = inquiries.filter((i) => i.status === "open");

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleSubmission = async (id: string, status: "approved" | "rejected") => {
    setBusy(true);
    try {
      const res = await updateSubmission(id, status);
      flash(res.message);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل التحديث");
    } finally {
      setBusy(false);
    }
  };

  const handleUser = async (phone: string, action: "suspend" | "activate" | "delete") => {
    const confirmMsg =
      action === "delete"
        ? "هل تريد حذف هذا الحساب نهائياً؟"
        : action === "suspend"
          ? "هل تريد إيقاف هذا الحساب؟"
          : "تفعيل الحساب؟";
    if (!confirm(confirmMsg)) return;
    setBusy(true);
    try {
      const res = await updateUserAccount(phone, action);
      flash(res.message);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل التحديث");
    } finally {
      setBusy(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await addUserAccount(newUser);
      flash(res.message);
      setNewUser({ name: "", phone: "", role: "provider", providerHost: "", password: "123123" });
      setTab("users");
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل الإضافة");
    } finally {
      setBusy(false);
    }
  };

  const handleReply = async (id: string) => {
    const text = replyText[id]?.trim();
    if (!text) return;
    setBusy(true);
    try {
      const res = await replyInquiry(id, text);
      flash(res.message);
      setReplyText((r) => ({ ...r, [id]: "" }));
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل الرد");
    } finally {
      setBusy(false);
    }
  };

  const handleHideReview = async (id: string) => {
    if (!confirm("إخفاء هذا التعليق؟")) return;
    setBusy(true);
    try {
      const res = await hideReview(id);
      flash(res.message);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل الإخفاء");
    } finally {
      setBusy(false);
    }
  };

  const handleFeatureReview = async (
    id: string,
    featured: boolean,
    highlight?: "benefit" | "ease" | "experience"
  ) => {
    setBusy(true);
    try {
      const res = await updateReviewFeature(id, { featured, ...(highlight ? { highlight } : {}) });
      flash(res.message);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل التحديث");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteExp = async (id: string | number) => {
    if (!confirm("حذف هذا النشاط من المنصة؟")) return;
    setBusy(true);
    try {
      const res = await deleteAdminExperience(id);
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
      const res = await updateAdminBooking(invoice, status);
      flash(res.message);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "فشل التحديث");
    } finally {
      setBusy(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    { id: "activities", label: "أنشطة", icon: Package },
    { id: "bookings", label: "حجوزات", icon: Calendar },
    {
      id: "submissions",
      label: "طلبات",
      icon: TrendingUp,
      badge: pendingSubmissions.length,
    },
    { id: "users", label: "مستخدمون", icon: Users },
    {
      id: "inquiries",
      label: "استفسارات",
      icon: Mail,
      badge: openInquiries.length,
    },
    { id: "reviews", label: "تعليقات", icon: MessageSquare },
    { id: "addUser", label: "إضافة", icon: UserPlus },
  ];

  return (
    <DashboardLayout
      title="مدير المنصة"
      user={user}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(id) => setTab(id as Tab)}
      onBack={onBack}
      onLogout={onLogout}
      actionMsg={actionMsg}
      loading={loading}
      error={error}
    >
      {data && (
        <>
              {tab === "overview" && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                    <StatCard label="المستخدمون" value={stats.usersCount as number} icon={Users} />
                    <StatCard label="الأنشطة" value={stats.experiencesCount as number} icon={Package} />
                    <StatCard label="الحجوزات" value={stats.bookingsCount as number} icon={Calendar} />
                    <StatCard
                      label="طلبات معلّقة"
                      value={stats.pendingSubmissions as number}
                      icon={TrendingUp}
                    />
                    <StatCard
                      label="استفسارات مفتوحة"
                      value={stats.openInquiries as number}
                      icon={Mail}
                    />
                    <StatCard
                      label="إجمالي الإيرادات"
                      value={`${stats.totalRevenue} ر.س`}
                      icon={Shield}
                    />
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">
                      تحليل بيانات الزوار (للتخطيط المستقبلي)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <StatCard
                        label="إجمالي الزوار"
                        value={Number(visitorAnalytics.totalVisitors) || 0}
                        icon={Users}
                      />
                      <StatCard
                        label="بروفايل مكتمل"
                        value={Number(visitorAnalytics.profilesCompleted) || 0}
                        icon={Shield}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-bold text-xs text-muted-foreground mb-2">حسب الاهتمام</p>
                        {((visitorAnalytics.byInterest as Record<string, unknown>[]) || []).length ===
                        0 ? (
                          <p className="text-xs text-muted-foreground">لا بيانات بعد</p>
                        ) : (
                          (visitorAnalytics.byInterest as Record<string, unknown>[]).map((row) => (
                            <p key={String(row.type)} className="text-xs py-1">
                              {String(row.type) === "adventure"
                                ? "مغامرات"
                                : String(row.type) === "exploration"
                                  ? "استكشاف"
                                  : "الاثنان"}{" "}
                              · {String(row.count)} زائر
                            </p>
                          ))
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-muted-foreground mb-2">حسب العمر</p>
                        {((visitorAnalytics.byAge as Record<string, unknown>[]) || []).length === 0 ? (
                          <p className="text-xs text-muted-foreground">لا بيانات بعد</p>
                        ) : (
                          (visitorAnalytics.byAge as Record<string, unknown>[]).map((row) => (
                            <p key={String(row.bucket)} className="text-xs py-1">
                              {String(row.bucket)} · {String(row.count)} زائر
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tab === "activities" && (
                <div className="space-y-2">
                  {activeExperiences.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">لا أنشطة</p>
                  ) : (
                    activeExperiences.map((e) => (
                      <div
                        key={String(e.id)}
                        className="flex items-center gap-3 rounded-xl border border-border p-3"
                      >
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDeleteExp(e.id as string | number)}
                          className="shrink-0 w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="text-right flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{String(e.title)}</p>
                          <p className="text-xs text-muted-foreground">
                            {String(e.host)} · {String(e.region)} · {String(e.price)} ر.س
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "bookings" && (
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div
                      key={String(b.invoiceNumber)}
                      className="rounded-xl border border-border p-3 text-right"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-muted">
                          {statusLabel[String(b.status)] || String(b.status)}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{String(b.experienceTitle)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {String(b.userName)} · {String(b.host)} · {String(b.dateLabel)}
                          </p>
                          <p className="text-xs text-primary font-bold">{String(b.total)} ر.س</p>
                        </div>
                      </div>
                      {b.status === "pending" && (
                        <div className="flex gap-2 mt-2 justify-end">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleBooking(String(b.invoiceNumber), "confirmed")
                            }
                            className="text-xs font-bold px-3 py-1 rounded-lg bg-green-600 text-white"
                          >
                            تأكيد
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleBooking(String(b.invoiceNumber), "cancelled")
                            }
                            className="text-xs font-bold px-3 py-1 rounded-lg bg-destructive/10 text-destructive"
                          >
                            إلغاء
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "submissions" && (
                <div className="space-y-3">
                  {submissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">
                      لا طلبات مشاركة
                    </p>
                  ) : (
                    submissions.map((s) => (
                      <div
                        key={String(s.id)}
                        className="rounded-xl border border-border p-3 text-right"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              s.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : s.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {statusLabel[String(s.status)]}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{String(s.title)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {String(s.hostName)} · {String(s.region)} · {String(s.price)} ر.س
                            </p>
                            {s.description && (
                              <p className="text-xs text-foreground mt-2 line-clamp-2">
                                {String(s.description)}
                              </p>
                            )}
                          </div>
                        </div>
                        {s.status === "pending" && (
                          <div className="flex gap-2 mt-3 justify-end">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleSubmission(String(s.id), "approved")}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 text-white"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              قبول ونشر
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleSubmission(String(s.id), "rejected")}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              رفض
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "users" && (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={String(u.phone)}
                      className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                    >
                      <div className="flex gap-1 shrink-0">
                        {u.active !== false ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleUser(String(u.phone), "suspend")}
                            className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"
                            title="إيقاف"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleUser(String(u.phone), "activate")}
                            className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center"
                            title="تفعيل"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleUser(String(u.phone), "delete")}
                          className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right flex-1">
                        <p className="font-semibold text-sm">
                          {String(u.name)}
                          {u.active === false && (
                            <span className="text-[10px] text-destructive mr-2">(موقوف)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground dir-ltr">
                          {String(u.phone)} · {roleLabel[String(u.role)] || String(u.role)}
                          {u.providerHost ? ` · ${String(u.providerHost)}` : ""}
                        </p>
                        {u.role === "visitor" && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {u.age ? `${String(u.age)} سنة` : "—"}
                            {u.email ? ` · ${String(u.email)}` : ""}
                            {u.interestLabel ? ` · ${String(u.interestLabel)}` : " · بروفايل ناقص"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "inquiries" && (
                <div className="space-y-3">
                  {inquiries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">
                      لا استفسارات
                    </p>
                  ) : (
                    inquiries.map((i) => (
                      <div
                        key={String(i.id)}
                        className="rounded-xl border border-border p-3 text-right"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-muted">
                            {statusLabel[String(i.status)]}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{String(i.subject)}</p>
                            <p className="text-xs text-muted-foreground">
                              {String(i.userName)}
                              {i.userPhone ? ` · ${String(i.userPhone)}` : ""}
                            </p>
                            <p className="text-sm mt-2">{String(i.message)}</p>
                            {i.adminReply && (
                              <p className="text-sm mt-2 p-2 bg-primary/5 rounded-lg text-primary">
                                <strong>ردك:</strong> {String(i.adminReply)}
                              </p>
                            )}
                          </div>
                        </div>
                        {i.status === "open" && (
                          <div className="mt-3 flex gap-2">
                            <input
                              value={replyText[String(i.id)] || ""}
                              onChange={(e) =>
                                setReplyText((r) => ({
                                  ...r,
                                  [String(i.id)]: e.target.value,
                                }))
                              }
                              placeholder="اكتب ردك للزائر..."
                              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm"
                            />
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleReply(String(i.id))}
                              className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                            >
                              رد
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "reviews" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
                    اختر التعليقات للعرض في الصفحة الرئيسية تحت «استكشف بالمنطقة» — حدّد نوع التمييز: فائدة، سهولة، أو تجربة إيجابية
                  </p>
                  {reviews
                    .filter((r) => r.visible !== false)
                    .map((r) => (
                      <div
                        key={String(r.id)}
                        className={`rounded-xl border p-3 text-right ${
                          r.featured ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                handleFeatureReview(String(r.id), !r.featured)
                              }
                              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                r.featured
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {r.featured ? "★ معروض" : "عرض للزوار"}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleHideReview(String(r.id))}
                              className="text-xs text-destructive font-bold"
                            >
                              إخفاء
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">
                              {String(r.userName)} · {"⭐".repeat(Number(r.rating))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {String(r.experienceTitle)} · {String(r.host)}
                            </p>
                            <p className="text-sm mt-1">{String(r.comment)}</p>
                            {r.featured && (
                              <select
                                value={String(r.highlight || "experience")}
                                disabled={busy}
                                onChange={(e) =>
                                  handleFeatureReview(
                                    String(r.id),
                                    true,
                                    e.target.value as "benefit" | "ease" | "experience"
                                  )
                                }
                                className="mt-2 text-xs px-2 py-1 rounded-lg border border-border bg-background"
                              >
                                <option value="benefit">فائدة التجربة</option>
                                <option value="ease">سهولة الحجز</option>
                                <option value="experience">تجربة إيجابية</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {tab === "addUser" && (
                <form onSubmit={handleAddUser} className="space-y-3 text-right">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">الاسم</label>
                    <input
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">الجوال</label>
                      <input
                        required
                        value={newUser.phone}
                        onChange={(e) => setNewUser((u) => ({ ...u, phone: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm dir-ltr text-right"
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">الدور</label>
                      <select
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser((u) => ({
                            ...u,
                            role: e.target.value as "visitor" | "provider" | "admin",
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      >
                        <option value="visitor">زائر</option>
                        <option value="provider">مقدم نشاط</option>
                        <option value="admin">مدير</option>
                      </select>
                    </div>
                  </div>
                  {newUser.role === "provider" && (
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">اسم النشاط</label>
                      <input
                        value={newUser.providerHost}
                        onChange={(e) =>
                          setNewUser((u) => ({ ...u, providerHost: e.target.value }))
                        }
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        placeholder="مثال: أكاديمية ومربط الطائي"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">كلمة المرور</label>
                    <input
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    إضافة مشارك
                  </button>
                </form>
              )}
        </>
      )}
    </DashboardLayout>
  );
}
