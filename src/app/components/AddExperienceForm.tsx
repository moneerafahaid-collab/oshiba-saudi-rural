import { useEffect, useState } from "react";
import { X, CheckCircle, Leaf } from "lucide-react";
import { createSubmission } from "../api/client";

interface AddExperienceFormProps {
  onClose: () => void;
}

const REGION_OPTIONS = [
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

const CATEGORY_OPTIONS = [
  "محميات",
  "فعاليات",
  "مغامرات",
  "زراعة",
  "مواشي",
  "صيد",
  "إقامة",
  "مهن",
];

export function AddExperienceForm({ onClose }: AddExperienceFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [hostName, setHostName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const canSubmit =
    title.trim() &&
    price.trim() &&
    duration.trim() &&
    hostName.trim() &&
    phone.trim() &&
    description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await createSubmission({
        title,
        region,
        category,
        price,
        duration,
        hostName,
        phone,
        description,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="إغلاق"
      />

      <div className="relative w-full sm:max-w-lg max-h-[94vh] bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="text-xs text-accent font-bold">لمقدمي التجارب</p>
              </div>
              <h2
                className="font-bold text-lg text-foreground"
                style={{ fontFamily: "'Noto Serif Arabic', serif" }}
              >
                أضف تجربتك
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                سيراجع فريقنا طلبك ويتواصل معك خلال ٤٨ ساعة
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-9 h-9 text-primary" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">تم إرسال طلبك!</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              شكراً {hostName}! سنراجع تجربة «{title}» ونتواصل معك على {phone}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-primary text-primary-foreground font-bold rounded-xl px-8 py-3 hover:bg-primary/90"
            >
              حسناً
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <Field label="اسم التجربة">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: قطاف التمور في واحة الأحساء"
                className="field-input"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="المنطقة">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="field-input"
                >
                  {REGION_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="التصنيف">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field-input"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="السعر (ر.س / شخص)">
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="120"
                  className="field-input"
                  required
                />
              </Field>
              <Field label="المدة">
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="٤ ساعات"
                  className="field-input"
                  required
                />
              </Field>
            </div>

            <Field label="اسم المضيف / المزرعة">
              <input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="اسمك أو اسم المزرعة"
                className="field-input"
                required
              />
            </Field>

            <Field label="رقم الجوال">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="field-input dir-ltr text-right"
                required
              />
            </Field>

            <Field label="وصف التجربة">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="صف ما يقدّمه الزائر في تجربتك..."
                rows={4}
                className="field-input resize-none"
                required
              />
            </Field>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full bg-accent text-accent-foreground font-bold rounded-xl py-3.5 hover:bg-accent/90 disabled:opacity-45 transition-colors shadow-md shadow-accent/20"
            >
              {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .field-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--input-background);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
        }
        .field-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
