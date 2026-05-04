import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import Field, { inputClass } from "@/components/auth/Field";
import { Lang, t, validEmail } from "@/lib/auth-i18n";

const ForgotPassword = () => {
  const [lang, setLang] = useState<Lang>("ar");
  const i = t[lang];

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) return setError(i.errRequired);
    if (!validEmail(email)) return setError(i.errEmail);
    setError("");
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      lang={lang}
      setLang={setLang}
      title={sent ? i.forgotSent : i.forgotTitle}
      subtitle={sent ? i.forgotSentBody : i.forgotSub}
      footer={
        <Link to="/login" className="text-oxblood hover:underline">← {i.backLogin}</Link>
      }
    >
      {sent ? (
        <div className="rise border border-ink/20 rounded-sm p-6 bg-cream/60">
          <div className="w-12 h-12 rounded-full bg-oxblood text-cream flex items-center justify-center font-display text-xl mb-3">✓</div>
          <p className="font-display text-lg text-ink mb-1">{email}</p>
          <p className="text-sm text-muted-foreground">{i.forgotSentBody}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <Field label={i.email} error={error}>
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

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full h-12 bg-oxblood text-cream font-mono-ed text-xs uppercase tracking-[0.25em] rounded-sm hover:bg-ink transition-colors disabled:opacity-60 shadow-[var(--shadow-press)]"
          >
            {submitting ? i.loading : i.sendLink}
          </button>
        </div>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
