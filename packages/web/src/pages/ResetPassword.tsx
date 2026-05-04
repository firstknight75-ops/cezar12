import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import Field, { inputClass } from "@/components/auth/Field";
import { Lang, t, validPassword, passwordStrength } from "@/lib/auth-i18n";

const ResetPassword = () => {
  const [lang, setLang] = useState<Lang>("ar");
  const i = t[lang];
  const nav = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const strength = passwordStrength(password);
  const strengthLabel = [i.strengthWeak, i.strengthWeak, i.strengthMedium, i.strengthStrong][strength];
  const strengthColor = ["bg-ink/15", "bg-destructive", "bg-ember", "bg-oxblood"][strength];

  const mismatchMsg = lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match";
  const successTitle = lang === "ar" ? "تم تحديث كلمة المرور" : "Password updated";
  const successBody = lang === "ar"
    ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
    : "You can now sign in with your new password.";
  const newPassLabel = lang === "ar" ? "كلمة المرور الجديدة" : "New password";
  const confirmLabel = lang === "ar" ? "تأكيد كلمة المرور" : "Confirm password";
  const updateBtn = lang === "ar" ? "تحديث كلمة المرور" : "Update password";
  const subtitle = lang === "ar" ? "اختر كلمة مرور قوية لحسابك." : "Choose a strong password for your account.";

  const onSubmit = async () => {
    const e: Record<string, string> = {};
    if (!password) e.password = i.errRequired;
    else if (!validPassword(password)) e.password = i.errPassRules;
    if (!confirm) e.confirm = i.errRequired;
    else if (confirm !== password) e.confirm = mismatchMsg;
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setDone(true);
      setTimeout(() => nav("/login"), 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      lang={lang}
      setLang={setLang}
      title={done ? successTitle : (lang === "ar" ? "تعيين كلمة مرور جديدة" : "Set new password")}
      subtitle={done ? successBody : subtitle}
      footer={
        <Link to="/login" className="text-oxblood hover:underline">← {i.backLogin}</Link>
      }
    >
      {done ? (
        <div className="rise border border-ink/20 rounded-sm p-6 bg-cream/60">
          <div className="w-12 h-12 rounded-full bg-oxblood text-cream flex items-center justify-center font-display text-xl mb-3">✓</div>
          <p className="text-sm text-muted-foreground">{successBody}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <Field
            label={newPassLabel}
            error={errors.password}
            hint={password ? (
              <div className="space-y-1.5">
                <div className="h-1 w-full bg-ink/10 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`h-full flex-1 transition-colors ${strength >= n ? strengthColor : "bg-ink/10"}`} />
                  ))}
                </div>
                <p className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/60">{strengthLabel}</p>
              </div>
            ) : i.errPassRules}
          >
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                dir="ltr"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className={`absolute top-1/2 -translate-y-1/2 ${lang === "ar" ? "left-3" : "right-3"} text-[10px] font-mono-ed uppercase tracking-wider text-ink/60 hover:text-oxblood`}
              >{showPass ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "إظهار" : "Show")}</button>
            </div>
          </Field>

          <Field label={confirmLabel} error={errors.confirm}>
            <input
              type={showPass ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              dir="ltr"
              autoComplete="new-password"
            />
          </Field>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full h-12 bg-oxblood text-cream font-mono-ed text-xs uppercase tracking-[0.25em] rounded-sm hover:bg-ink transition-colors disabled:opacity-60 shadow-[var(--shadow-press)]"
          >
            {submitting ? i.loading : updateBtn}
          </button>
        </div>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
