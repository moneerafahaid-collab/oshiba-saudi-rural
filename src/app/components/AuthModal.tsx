import { useState } from "react";
import { X, LogIn, UserPlus } from "lucide-react";
import { loginUser, registerVisitor, type AuthUser } from "../api/client";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: AuthUser, isNew?: boolean) => void;
}

type Mode = "login" | "register";

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [reg, setReg] = useState({
    phone: "",
    email: "",
    name: "",
    age: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(loginPhone.trim(), loginPassword);
      onSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await registerVisitor({
        phone: reg.phone.trim(),
        email: reg.email.trim(),
        name: reg.name.trim(),
        age: Number(reg.age),
        password: reg.password,
      });
      onSuccess(res.user, true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-label="تسجيل الدخول"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="إغلاق"
      />
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 left-3 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-2 mb-5 mt-2 bg-muted/50 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors ${
              mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <LogIn className="w-4 h-4" />
            دخول
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors ${
              mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            حساب جديد
          </button>
        </div>

        {mode === "login" ? (
          <>
            <h2 className="text-lg font-bold text-center mb-1">تسجيل دخول</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">
              زوار، مقدمو تجارب، وإدارة المنصة
            </p>
            <form className="space-y-3" onSubmit={handleLogin}>
              <input
                type="tel"
                placeholder="رقم الجوال (05xxxxxxxx)"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm dir-ltr text-right"
                disabled={loading}
                required
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                disabled={loading}
                required
              />
              {error && <p className="text-xs text-destructive text-center bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-bold text-sm rounded-xl py-3 disabled:opacity-60"
              >
                {loading ? "جاري الدخول..." : "دخول"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-center mb-1">إنشاء حساب زائر</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">
              سجّل بياناتك لنفهم اهتماماتك ونحسّن تجربتك
            </p>
            <form className="space-y-3" onSubmit={handleRegister}>
              <input
                required
                placeholder="الاسم الكامل"
                value={reg.name}
                onChange={(e) => setReg((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                disabled={loading}
              />
              <input
                required
                type="tel"
                placeholder="رقم الجوال (05xxxxxxxx)"
                value={reg.phone}
                onChange={(e) => setReg((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm dir-ltr text-right"
                disabled={loading}
              />
              <input
                required
                type="email"
                placeholder="البريد الإلكتروني"
                value={reg.email}
                onChange={(e) => setReg((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm dir-ltr text-right"
                disabled={loading}
              />
              <input
                required
                type="number"
                min={5}
                max={120}
                placeholder="العمر"
                value={reg.age}
                onChange={(e) => setReg((f) => ({ ...f, age: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                disabled={loading}
              />
              <input
                required
                type="password"
                minLength={6}
                placeholder="كلمة المرور (6 أحرف على الأقل)"
                value={reg.password}
                onChange={(e) => setReg((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                disabled={loading}
              />
              {error && <p className="text-xs text-destructive text-center bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-bold text-sm rounded-xl py-3 disabled:opacity-60"
              >
                {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
              </button>
              <p className="text-[10px] text-muted-foreground text-center">
                بعد التسجيل أكمل بروفايلك من «لوحتي» — اختيار اهتماماتك
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
