import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import Field, { inputClass } from "@/components/auth/Field";
import { Lang, countries, passwordStrength, t, validEmail, validPassword } from "@/lib/auth-i18n";
import { authApi } from "@/lib/api";

const Register = () => {
  const [lang, setLang] = useState<Lang>("ar");
  const i = t[lang];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const dial = useMemo(() => countries.find((c) => c.code === country)?.dial ?? "", [country]);
  const strength = passwordStrength(password);

  const onCountryChange = (code: string) => {
    setCountry(code);
    const d = countries.find((c) => c.code === code)?.dial ?? "";
    // Replace existing dial prefix or set fresh
    const stripped = phone.replace(/^\+\d+\s*/, "");
    setPhone(d ? `${d} ${stripped}`.trim() : stripped);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = i.errRequired;
    else if (fullName.trim().length < 2 || fullName.trim().length > 100) e.fullName = i.errName;
    if (!email.trim()) e.email = i.errRequired;
    else if (!validEmail(email)) e.email = i.errEmail;
    if (!password) e.password = i.errRequired;
    else if (!validPassword(password)) e.password = i.errPassRules;
    if (!country) e.country = i.errCountry;
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 8) e.phone = i.errPhone;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      // POST /api/auth/register — mocked
      const res = await fakeRegister({ fullName, email, password, country, phone });
      if (res.status === 201) {
        setSuccess(true);
      } else if (res.status === 409) {
        setErrors({ email: i.errEmailTaken });
      } else if (res.status === 429) {
        setErrors({ form: i.err429 });
      } else {
        setErrors({ form: i.errGeneric });
      }
    } catch {
      setErrors({ form: i.errGeneric });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthShell lang={lang} setLang={setLang} title={i.checkInbox} subtitle={i.checkInboxBody}>
        <div className="rise space-y-6">
          <div className="border border-ink/20 rounded-sm p-6 bg-cream/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-oxblood text-cream flex items-center justify-center font-display text-lg">✓</div>
              <div>
                <p className="font-display text-lg text-ink">{email}</p>
                <p className="text-xs text-muted-foreground font-mono-ed uppercase tracking-wider">
                  {lang === "ar" ? "بانتظار التحقق" : "Awaiting verification"}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{i.checkInboxBody}</p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="font-mono-ed text-[11px] uppercase tracking-[0.25em] text-oxblood hover:text-ink transition-colors"
          >{i.resend}</button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      lang={lang}
      setLang={setLang}
      title={i.registerTitle}
      subtitle={i.registerSub}
      footer={
        <p>{i.haveAccount}{" "}
          <Link to="/login" className="text-oxblood font-medium hover:underline">{i.signIn}</Link>
        </p>
      }
    >
      <div className="space-y-5">
        {errors.form && (
          <div className="border border-destructive/40 bg-destructive/5 text-destructive text-sm rounded-sm px-3 py-2">
            {errors.form}
          </div>
        )}

        <Field label={i.fullName} error={errors.fullName}>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={i.fullNamePh}
            className={inputClass}
            autoComplete="name"
          />
        </Field>

        <Field label={i.email} error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={i.emailPh}
            className={inputClass}
            dir="ltr"
            autoComplete="email"
          />
        </Field>

        <Field
          label={i.password}
          error={errors.password}
          hint={
            password ? (
              <div className="space-y-1.5 mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        strength >= n
                          ? strength === 1
                            ? "bg-destructive"
                            : strength === 2
                            ? "bg-ember"
                            : "bg-oxblood"
                          : "bg-ink/15"
                      }`}
                    />
                  ))}
                </div>
                <p className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/60">
                  {strength <= 1 ? i.strengthWeak : strength === 2 ? i.strengthMedium : i.strengthStrong}
                </p>
              </div>
            ) : null
          }
        >
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={i.passwordPh}
              className={inputClass}
              dir="ltr"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className={`absolute top-1/2 -translate-y-1/2 ${lang === "ar" ? "left-3" : "right-3"} text-[10px] font-mono-ed uppercase tracking-wider text-ink/60 hover:text-oxblood`}
            >
              {showPass ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "إظهار" : "Show")}
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={i.country} error={errors.country}>
            <select
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              className={inputClass}
            >
              <option value="">{i.countryPh}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{lang === "ar" ? c.ar : c.en}</option>
              ))}
            </select>
          </Field>

          <Field label={i.phone} error={errors.phone}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={dial ? `${dial} 5XXXXXXXX` : "+966 5XXXXXXXX"}
              className={inputClass}
              dir="ltr"
              autoComplete="tel"
            />
          </Field>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full h-12 bg-oxblood text-cream font-mono-ed text-xs uppercase tracking-[0.25em] rounded-sm hover:bg-ink transition-colors disabled:opacity-60 shadow-[var(--shadow-press)]"
        >
          {submitting ? i.loading : i.createAccount}
        </button>
      </div>
    </AuthShell>
  );
};

// ---- Mock API ----
async function fakeRegister(data: {
  fullName: string; email: string; password: string; country: string; phone: string;
}): Promise<{ status: number }> {
  await new Promise((r) => setTimeout(r, 700));
  if (data.email.toLowerCase() === "taken@test.com") return { status: 409 };
  if (data.email.toLowerCase() === "limit@test.com") return { status: 429 };
  return { status: 201 };
}

export default Register;
