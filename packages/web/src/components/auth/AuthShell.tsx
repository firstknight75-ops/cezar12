import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lang, t } from "@/lib/auth-i18n";

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({ lang, setLang, title, subtitle, children, footer }: Props) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const i = t[lang];

  return (
    <div dir={dir} className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      {/* Editorial side */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[var(--gradient-editorial)] text-cream">
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between font-mono-ed text-xs uppercase tracking-[0.25em]">
          <Link to="/" className="hover:opacity-80">{i.brand}</Link>
          <span className="opacity-70">EDITION · 12</span>
        </div>

        <div className="relative z-10 space-y-6">
          <p className="font-mono-ed text-[10px] uppercase tracking-[0.3em] opacity-70">
            {lang === "ar" ? "الفصل ٠١" : "Chapter 01"}
          </p>
          <h1 className="font-display text-5xl xl:text-6xl leading-[1.05] text-balance">
            {lang === "ar"
              ? "أعمالك الخليجية، بذكاءٍ مصقول."
              : "Your Gulf business, refined by intelligence."}
          </h1>
          <p className="font-display text-lg opacity-85 max-w-md text-balance">
            {i.tagline}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between font-mono-ed text-[10px] uppercase tracking-[0.25em] opacity-70">
          <span>© {new Date().getFullYear()} {i.brand}</span>
          <span>STK · GULF</span>
        </div>
      </aside>

      {/* Form side */}
      <section className="relative flex flex-col">
        <header className="flex items-center justify-between px-6 lg:px-12 py-6 font-mono-ed text-[11px] uppercase tracking-[0.25em]">
          <Link to="/" className="lg:hidden text-oxblood">{i.brand}</Link>
          <span className="hidden lg:inline text-ink/50">{lang === "ar" ? "تسجيل" : "Account"}</span>
          <div className="flex items-center gap-1 border border-ink/20 rounded-sm overflow-hidden">
            <button
              onClick={() => setLang("ar")}
              className={`px-2.5 py-1 transition-colors ${lang === "ar" ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"}`}
            >AR</button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 transition-colors ${lang === "en" ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"}`}
            >EN</button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 pb-12">
          <div className="w-full max-w-md rise">
            <div className="mb-8">
              <h2 className="font-display text-3xl lg:text-4xl text-ink mb-2 text-balance">{title}</h2>
              {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
