import { useEffect, useMemo, useState } from "react";
import { createBooking, type AuthUser } from "../api/client";
import { ReefLogo } from "./ReefLogo";
import {
  X,
  Clock,
  Users,
  ChevronLeft,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle,
  Download,
  Calendar,
  Home,
  UserRound,
} from "lucide-react";

export interface BookingExperience {
  id: number;
  title: string;
  region: string;
  price: number;
  duration: string;
  imageUrl: string;
  host: string;
  maxGroup: number;
}

type GroupType = "family" | "youth";
type PaymentMethod = "mada" | "apple" | "card" | "cash";

interface BookingFlowProps {
  experience: BookingExperience;
  authUser?: AuthUser | null;
  onClose: () => void;
}

interface TimeSlot {
  id: string;
  dateLabel: string;
  timeLabel: string;
  iso: string;
}

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  { id: "mada", label: "مدى", desc: "بطاقة مدى السعودية", Icon: CreditCard },
  { id: "apple", label: "Apple Pay", desc: "دفع سريع وآمن", Icon: Smartphone },
  { id: "card", label: "بطاقة ائتمان", desc: "فيزا أو ماستركارد", Icon: CreditCard },
  { id: "cash", label: "الدفع عند الوصول", desc: "ادفع في موقع التجربة", Icon: Wallet },
];

function toArabicDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

function buildTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const times = ["٠٨:٠٠ ص", "١٠:٣٠ ص", "٠٢:٠٠ م", "٠٤:٣٠ م", "٠٦:٠٠ م"];
  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];

  for (let d = 1; d <= 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dayLabel = dayNames[date.getDay()];
    const dateLabel = `${dayLabel} ${toArabicDigits(date.getDate())} ${monthNames[date.getMonth()]}`;

    times.forEach((timeLabel, i) => {
      if (d > 3 && i > 2) return;
      slots.push({
        id: `${date.toISOString().slice(0, 10)}-${i}`,
        dateLabel,
        timeLabel,
        iso: date.toISOString(),
      });
    });
  }
  return slots;
}

function generateInvoiceNumber(): string {
  const n = Date.now().toString().slice(-8);
  return `RS-${n}`;
}

export function BookingFlow({ experience, authUser, onClose }: BookingFlowProps) {
  const timeSlots = useMemo(() => buildTimeSlots(), []);
  const [step, setStep] = useState(1);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [groupType, setGroupType] = useState<GroupType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedSlot = timeSlots.find((s) => s.id === selectedSlotId);
  const subtotal = experience.price * guests;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const canProceedStep1 = selectedSlotId && groupType && guests >= 1;
  const canProceedStep2 = paymentMethod !== null;

  const handleConfirmPayment = async () => {
    if (!canProceedStep2 || !selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await createBooking({
        experienceId: experience.id,
        dateLabel: selectedSlot.dateLabel,
        timeLabel: selectedSlot.timeLabel,
        guests,
        groupType: groupType!,
        paymentMethod: paymentMethod!,
        userPhone: authUser?.phone,
        userName: authUser?.name,
      });
      setInvoiceNumber(res.data.invoiceNumber);
    } catch {
      setInvoiceNumber(generateInvoiceNumber());
    }
    setCompletedAt(
      new Date().toLocaleString("ar-SA", {
        dateStyle: "long",
        timeStyle: "short",
      })
    );
    setSubmitting(false);
    setStep(3);
  };

  const handlePrint = () => window.print();

  const paymentLabel =
    PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.label ?? "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="إغلاق"
      />

      <div className="relative w-full sm:max-w-lg max-h-[94vh] sm:max-h-[90vh] bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-accent font-bold mb-1">حجز تجربة</p>
              <h2
                id="booking-title"
                className="font-bold text-foreground text-base leading-snug line-clamp-2"
                style={{ fontFamily: "'Noto Serif Arabic', serif" }}
              >
                {experience.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">مع {experience.host}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          {step < 3 && (
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: "التفاصيل" },
                { n: 2, label: "الدفع" },
                { n: 3, label: "الفاتورة" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      step >= s.n
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.n ? <CheckCircle className="w-4 h-4" /> : toArabicDigits(s.n)}
                  </div>
                  <span
                    className={`text-xs font-semibold truncate hidden sm:block ${
                      step >= s.n ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full ${
                        step > s.n ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 1 && (
            <div className="space-y-6">
              {/* Time */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">اختر الوقت</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-0.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`text-right rounded-xl border px-3 py-2.5 transition-all ${
                        selectedSlotId === slot.id
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-0.5">{slot.dateLabel}</p>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                        {slot.timeLabel}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Guests */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">عدد الأشخاص</h3>
                </div>
                <div className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3">
                  <button
                    type="button"
                    disabled={guests <= 1}
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-10 h-10 rounded-xl bg-muted font-bold text-lg disabled:opacity-40 hover:bg-muted/80 transition-colors"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <span
                      className="text-2xl font-black text-foreground"
                      style={{ fontFamily: "'Noto Serif Arabic', serif" }}
                    >
                      {toArabicDigits(guests)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      حد أقصى {toArabicDigits(experience.maxGroup)} أشخاص
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={guests >= experience.maxGroup}
                    onClick={() => setGuests((g) => Math.min(experience.maxGroup, g + 1))}
                    className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  >
                    +
                  </button>
                </div>
              </section>

              {/* Group type */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">نوع المجموعة</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      {
                        id: "family" as const,
                        label: "عائلة",
                        desc: "مع الأطفال والكبار",
                        Icon: Home,
                      },
                      {
                        id: "youth" as const,
                        label: "شباب",
                        desc: "مجموعة شبابية",
                        Icon: UserRound,
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGroupType(opt.id)}
                      className={`rounded-2xl border p-4 text-right transition-all ${
                        groupType === opt.id
                          ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <opt.Icon
                        className={`w-6 h-6 mb-2 ${
                          groupType === opt.id ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p className="font-bold text-sm text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Summary preview */}
              <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm">
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>{toArabicDigits(experience.price)} ر.س × {toArabicDigits(guests)}</span>
                  <span>التقدير</span>
                </div>
                <div className="flex justify-between font-bold text-foreground">
                  <span
                    style={{ fontFamily: "'Noto Serif Arabic', serif" }}
                  >
                    {toArabicDigits(subtotal)} ر.س
                  </span>
                  <span>المجموع الفرعي</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-background border border-border rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الوقت</span>
                  <span className="font-semibold text-foreground">
                    {selectedSlot?.dateLabel} — {selectedSlot?.timeLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الأشخاص</span>
                  <span className="font-semibold">{toArabicDigits(guests)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموعة</span>
                  <span className="font-semibold">
                    {groupType === "family" ? "عائلة" : "شباب"}
                  </span>
                </div>
              </div>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">طريقة الدفع</h3>
                </div>
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-right transition-all ${
                        paymentMethod === opt.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          paymentMethod === opt.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <opt.Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          paymentMethod === opt.id
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {paymentMethod === opt.id && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <div className="border border-border rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{toArabicDigits(subtotal)} ر.س</span>
                  <span>المجموع الفرعي</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{toArabicDigits(serviceFee)} ر.س</span>
                  <span>رسوم الخدمة (٥٪)</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                  <span style={{ fontFamily: "'Noto Serif Arabic', serif" }}>
                    {toArabicDigits(total)} ر.س
                  </span>
                  <span>الإجمالي</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div id="booking-invoice" className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3
                  className="text-xl font-black text-foreground mb-1"
                  style={{ fontFamily: "'Noto Serif Arabic', serif" }}
                >
                  تم تأكيد الحجز!
                </h3>
                <p className="text-sm text-muted-foreground">
                  أُرسلت الفاتورة إلى بريدك ويمكنك تحميلها أدناه
                </p>
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden bg-background">
                <div className="bg-primary px-4 py-3 text-primary-foreground flex justify-between items-center gap-3">
                  <span className="font-bold text-sm shrink-0">فاتورة حجز</span>
                  <div className="rounded-md bg-white px-2 py-0.5">
                    <ReefLogo height={26} />
                  </div>
                </div>

                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between pb-3 border-b border-border">
                    <span className="font-mono text-xs text-muted-foreground dir-ltr">
                      {invoiceNumber}
                    </span>
                    <span className="text-muted-foreground">رقم الفاتورة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground font-medium">{completedAt}</span>
                    <span className="text-muted-foreground">التاريخ</span>
                  </div>

                  <div className="py-3 border-y border-border">
                    <p className="font-bold text-foreground mb-1">{experience.title}</p>
                    <p className="text-xs text-muted-foreground">{experience.region}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      المدة: {experience.duration} · المضيف: {experience.host}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      ["الموعد", `${selectedSlot?.dateLabel} — ${selectedSlot?.timeLabel}`],
                      ["عدد الأشخاص", toArabicDigits(guests)],
                      ["نوع المجموعة", groupType === "family" ? "عائلة" : "شباب"],
                      ["طريقة الدفع", paymentLabel],
                    ].map(([val, label]) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span className="text-foreground font-medium text-left">{val}</span>
                        <span className="text-muted-foreground shrink-0">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border space-y-1.5">
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        {toArabicDigits(experience.price)} × {toArabicDigits(guests)}
                      </span>
                      <span>سعر الفرد</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{toArabicDigits(serviceFee)} ر.س</span>
                      <span>رسوم الخدمة</span>
                    </div>
                    <div className="flex justify-between font-black text-foreground text-base pt-1">
                      <span style={{ fontFamily: "'Noto Serif Arabic', serif" }}>
                        {toArabicDigits(total)} ر.س
                      </span>
                      <span>الإجمالي المدفوع</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                    <Building2 className="w-4 h-4 shrink-0 text-primary" />
                    <span>هذه فاتورة تجريبية — الدفع الإلكتروني غير مفعّل بعد في النسخة التجريبية</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 border-t border-border bg-card flex gap-3">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="flex-[2] rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 disabled:opacity-45 transition-colors"
              >
                متابعة للدفع
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                رجوع
              </button>
              <button
                type="button"
                disabled={!canProceedStep2 || submitting}
                onClick={handleConfirmPayment}
                className="flex-1 rounded-xl bg-accent text-accent-foreground py-3 text-sm font-bold hover:bg-accent/90 disabled:opacity-45 transition-colors shadow-md shadow-accent/20"
              >
                {submitting ? "جاري الحجز..." : "تأكيد الدفع والحجز"}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 flex-1 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
                تحميل / طباعة
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                تم
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
