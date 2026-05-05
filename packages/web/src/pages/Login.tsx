import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import Field, { inputClass } from "@/components/auth/Field";
import { Lang, t, validEmail } from "@/lib/auth-i18n";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type LoginError =
  | { kind: "bad" }
  | { kind: "unverified" }
  | { kind: "locked"; until: string }
  | { kind: "rate" }
  | { kind: "generic" }
  | null;

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string; email: string; fullName: string; countryCode: string;
    currency: string; preferredLang: string; isVerified: boolean; hasCompanyProfile: boolean;
  };
  subscription: {
    id: string; plan: string; billingCycle: string; status: string;
    tokensPerCycle: number; tokensRemaining: number; currentPeriodEnd: string;
  } | null;
  tokenBalance: { plan: number; addon: number; total: number };
}

const Login = () => {
  const [lang, setLang] = useState<Lang>("ar");
  const i = t[lang];
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<LoginError>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendInfo, setResendInfo] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = i.errRequired;
    else if (!validEmail(email)) e.email = i.errEmail;
    if (!password) e.password = i.errRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setServerErr(null);
    setResendInfo("");
    try {
      const data = await apiPost<LoginResponse>("/auth/login", { email, password, remember });
      setAuth({
        user: data.user,
        subscription: data.subscription ?? {
          id: "", plan: "silver" as const, billingCycle: "monthly", status: "active",
          tokensPerCycle: 0, tokensRemaining: 0, currentPeriodEnd: new Date().toISOString(),
        },
        tokenBalance: data.tokenBalance,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { error?: { code?: string } } } })?.response?.status;
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (status === 401) setServerErr({ kind: "bad" });
      else if (status === 403 && code === "EMAIL_NOT_VERIFIED") setServerErr({ kind: "unverified" });
      else if (status === 429) setServerErr({ kind: "rate" });
      else setServerErr({ kind: "generic" });
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    setResendInfo(lang === "ar" ? "تم إرسال رابط جديد إلى بريدك." : "A new verification link was sent.");
  };

  const renderServerErr = () => {
    if (!serverErr) return null;
    const base = "border rounded-sm px-3 py-2.5 text-sm";
    switch (serverErr.kind) {
      case "bad":
        return <div className={`${base} border-destructive/40 bg-destructive/5 text-destructive`}>{i.badCreds}</div>;
      case "unverified":
        return (
          <div className={`${base} border-ember/50 bg-ember/10 text-ink space-y-2`}>
            <p>{i.notVerified}</p>
            <button
              onClick={onResend}
              className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-oxblood hover:text-ink"
            >{i.resendVerify}</button>
          </div>
        );
      case "locked":
        return <div className={`${base} border-destructive/40 bg-destructive/5 text-destructive`}>{i.locked} {serverErr.until}</div>;
      case "rate":
        return <div className={`${base} border-destructive/40 bg-destructive/5 text-destructive`}>{i.err429}</div>;
      default:
        return <div className={`${base} border-destructive/40 bg-destructive/5 text-destructive`}>{i.errGeneric}</div>;
    }
  };

  return (
    <AuthShell
      lang={lang}
      setLang={setLang}
      title={i.loginTitle}
      subtitle={i.loginSub}
      footer={
        <p>{i.noAccount}{" "}
          <Link to="/register" className="text-oxblood font-medium hover:underline">{i.create}</Link>
        </p>
      }
    >
      <div className="space-y-5">
        {renderServerErr()}
        {resendInfo && !serverErr && (
          <div className="border border-oxblood/30 bg-oxblood/5 text-ink text-sm rounded-sm px-3 py-2">{resendInfo}</div>
        )}

        <Field label={i.email} error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className={inputClass}
            dir="ltr"
            autoComplete="email"
          />
        </Field>

        <Field label={i.password} error={errors.password}>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              dir="ltr"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className={`absolute top-1/2 -translate-y-1/2 ${lang === "ar" ? "left-3" : "right-3"} text-[10px] font-mono-ed uppercase tracking-wider text-ink/60 hover:text-oxblood`}
            >{showPass ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "إظهار" : "Show")}</button>
          </div>
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-oxblood"
            />
            <span className="text-ink/80">{i.remember}</span>
          </label>
          <Link to="/forgot-password" className="text-oxblood hover:text-ink transition-colors">{i.forgot}</Link>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full h-12 bg-oxblood text-cream font-mono-ed text-xs uppercase tracking-[0.25em] rounded-sm hover:bg-ink transition-colors disabled:opacity-60 shadow-[var(--shadow-press)]"
        >
          {submitting ? i.loading : i.signInBtn}
        </button>
      </div>
    </AuthShell>
  );
};


export default Login;
