import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const services = [
  { n: "01", ar: "التقييم الأولي",    en: "Initial Assessment",   d: "تشخيص فوري لوضعك المالي." },
  { n: "02", ar: "خطة التسعين يوماً", en: "90-Day Growth Plan",    d: "مسار واضح نحو النمو." },
  { n: "03", ar: "المحتوى الأسبوعي",  en: "Weekly Content",       d: "صوت علامتك، منظّم ومستمر." },
  { n: "04", ar: "بحث السوق",         en: "Market Research",      d: "افهم من يحيط بك." },
  { n: "05", ar: "شخصية المشتري",     en: "Buyer Persona",        d: "اعرف من يشتري منك." },
  { n: "06", ar: "الهوية البصرية",    en: "Visual Identity",      d: "المظهر الذي يبني الثقة." },
  { n: "07", ar: "خطة SEO",           en: "SEO Plan",             d: "الحضور الرقمي الذي يدوم." },
  { n: "08", ar: "الحملة الإعلانية",  en: "Ad Campaign",          d: "الإنفاق الذكي على الإعلان." },
  { n: "09", ar: "تقرير الأداء",      en: "Performance Report",   d: "أرقامك، مُفسَّرة بوضوح." },
  { n: "10", ar: "توليد العملاء",     en: "Lead Generation",      d: "عملاء مؤهلون وجاهزون." },
  { n: "11", ar: "تحليل التكلفة الحقيقية", en: "True Cost Analysis", d: "كل ريال في مكانه الصحيح." },
  { n: "12", ar: "تحسين الترويج",     en: "Promotion Optimizer",  d: "العروض التي تُحقق المبيعات." },
]

const domains = [
  { ar: "التجارة الإلكترونية", en: "E-Commerce" },
  { ar: "الخدمات المهنية",     en: "Services" },
  { ar: "المطاعم",             en: "Restaurant" },
  { ar: "العقارات",            en: "Real Estate" },
]

export default function Index() {
  const [time, setTime] = useState("")
  const [lang, setLang] = useState<"ar" | "en">("ar")
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      )
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="min-h-screen relative overflow-hidden bg-[hsl(var(--background))]">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-ink/15">
        <div className="container flex items-center justify-between py-5 font-mono-ed text-xs uppercase tracking-[0.2em]">
          <span className="text-ink font-bold">Cezar 12</span>

          <nav className="hidden md:flex gap-8 text-ink/70">
            <a href="#services" className="hover:text-oxblood transition-colors">
              {lang === "ar" ? "الخدمات" : "Services"}
            </a>
            <a href="#approach" className="hover:text-oxblood transition-colors">
              {lang === "ar" ? "المنهجية" : "Approach"}
            </a>
            <a href="#access" className="hover:text-oxblood transition-colors">
              {lang === "ar" ? "الوصول" : "Early Access"}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="text-ink/60 hover:text-oxblood transition-colors"
            >
              {lang === "ar" ? "EN" : "عر"}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-ink/60 hover:text-oxblood transition-colors"
            >
              {lang === "ar" ? "دخول" : "Login"}
            </button>
            <span className="hidden md:inline text-ink/40">{time} · AST</span>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative grain">
        <div className="container relative pt-16 pb-28 md:pt-28 md:pb-40">

          <div className="flex items-center gap-4 mb-10 rise">
            <span className="h-px w-16 bg-ink" />
            <span className="font-mono-ed text-xs uppercase tracking-[0.3em] text-ink/70">
              {lang === "ar"
                ? "ذكاء الأعمال — مُصمَّم للخليج"
                : "Business Intelligence — Built for the Gulf"}
            </span>
          </div>

          <h1
            className="font-display text-balance leading-[0.85] tracking-tight text-ink rise-2"
            style={{ fontSize: "clamp(4rem, 14vw, 14rem)", fontWeight: 300 }}
          >
            Cezar
            <span
              className="inline-block ml-3 md:ml-6 text-oxblood italic"
              style={{ fontWeight: 900 }}
            >
              12<sup className="text-ember text-[0.35em] align-super ml-1">★</sup>
            </span>
          </h1>

          <div className="mt-12 grid md:grid-cols-12 gap-8 items-end">
            <p
              className="md:col-span-6 md:col-start-1 font-display text-xl md:text-2xl leading-snug text-ink/85 max-w-xl rise-3"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {lang === "ar"
                ? "اثنا عشر تحليلاً بالذكاء الاصطناعي. درجة مالية واحدة من صفر إلى مئة. وضوح تام في قرارات عملك."
                : "Twelve AI-powered analyses. One financial score from 0 to 100. Complete clarity on your business decisions."}
            </p>

            <div className="md:col-span-4 md:col-start-9 flex flex-col gap-4 rise-4">
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center justify-between gap-4 bg-ink text-cream px-6 py-5 font-mono-ed text-xs uppercase tracking-[0.25em] hover:bg-oxblood transition-colors"
              >
                {lang === "ar" ? "ابدأ مجاناً" : "Start Free"}
                <span className="text-ember group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <a
                href="#services"
                className="inline-flex items-center justify-between gap-4 border border-ink/40 px-6 py-5 font-mono-ed text-xs uppercase tracking-[0.25em] hover:border-ink hover:bg-ink/5 transition-all"
              >
                {lang === "ar" ? "استعرض الخدمات" : "View Services"}
                <span>↓</span>
              </a>
            </div>
          </div>

          {/* Score badge */}
          <div className="hidden md:block absolute right-8 top-32 drift">
            <div
              className="relative w-40 h-40 rounded-full bg-oxblood text-cream flex items-center justify-center font-display text-center"
              style={{ boxShadow: "var(--shadow-editorial)" }}
            >
              <div>
                <div className="font-mono-ed text-[10px] uppercase tracking-[0.3em] text-cream/70">
                  Score
                </div>
                <div className="text-5xl font-black italic text-ember">0–100</div>
                <div className="font-mono-ed text-[10px] uppercase tracking-[0.3em] text-cream/70">
                  {lang === "ar" ? "وضوح مالي" : "Clarity"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-ink/20 bg-ink text-cream overflow-hidden py-5">
          <div className="marquee font-display italic text-2xl md:text-3xl whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-16 items-center">
                {[
                  ...domains.flatMap((d) => [d.ar, "★", d.en, "★"]),
                  "12 تحليل", "★", "12 Analyses", "★",
                ].map((w, j) => (
                  <span key={j} className="flex items-center gap-16">
                    <span>{w}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROACH / MANIFESTO ─────────────────────────────────────────── */}
      <section id="approach" className="relative py-28 md:py-40">
        <div className="container grid md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-oxblood">§ 01</div>
            <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-ink/50 mt-1">
              {lang === "ar" ? "المنهجية" : "Approach"}
            </div>
          </div>
          <div className="md:col-span-9">
            <p
              className="font-display text-3xl md:text-5xl leading-[1.1] text-balance text-ink"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {lang === "ar" ? (
                <>
                  نحن نبني أدوات بطيئة على عمد.{" "}
                  <span className="text-ink/40">كل تحليل هو رفض هادئ —</span>
                  <span className="italic text-oxblood"> للتخمين، للضوضاء، للقرارات المتسرّعة.</span>
                </>
              ) : (
                <>
                  We build deliberate tools, on purpose.{" "}
                  <span className="text-ink/40">Each analysis is a quiet refusal —</span>
                  <span className="italic text-oxblood"> of guesswork, noise, and rushed decisions.</span>
                </>
              )}
            </p>

            <div
              className="mt-12 grid md:grid-cols-3 gap-8 font-display text-lg text-ink/80"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              <p>
                <span className="font-mono-ed text-xs uppercase tracking-[0.25em] text-oxblood block mb-2">i.</span>
                {lang === "ar" ? "درجة واحدة تكشف كل شيء." : "One score reveals everything."}
              </p>
              <p>
                <span className="font-mono-ed text-xs uppercase tracking-[0.25em] text-oxblood block mb-2">ii.</span>
                {lang === "ar" ? "بيانات خليجية، فهم محلي." : "Gulf data, local understanding."}
              </p>
              <p>
                <span className="font-mono-ed text-xs uppercase tracking-[0.25em] text-oxblood block mb-2">iii.</span>
                {lang === "ar" ? "اثنا عشر تحليلاً، ثم القرار." : "Twelve analyses, then the decision."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="services" className="relative py-28 md:py-40 bg-ink text-cream">
        <div className="container">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <h2 className="font-display text-5xl md:text-7xl leading-none">
              {lang === "ar" ? (
                <>الاثنا عشر <span className="italic text-ember">تحليلاً</span></>
              ) : (
                <>The Twelve <span className="italic text-ember">Analyses</span></>
              )}
            </h2>
            <span className="font-mono-ed text-xs uppercase tracking-[0.3em] text-cream/60">
              {lang === "ar" ? "قائمة — ٠١ / ١٢" : "Index — 01 / 12"}
            </span>
          </div>

          <ul className="divide-y divide-cream/15 border-y border-cream/15">
            {services.map((s) => (
              <li
                key={s.n}
                className="group grid grid-cols-12 items-center py-6 md:py-8 hover:bg-cream/5 transition-colors px-2 -mx-2"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <span className="col-span-2 md:col-span-1 font-mono-ed text-sm text-ember">{s.n}</span>
                <span className="col-span-5 md:col-span-4 font-display text-2xl md:text-4xl group-hover:translate-x-2 transition-transform">
                  {lang === "ar" ? s.ar : s.en}
                </span>
                <span className="hidden md:block md:col-span-6 font-display italic text-cream/70 text-lg">
                  {s.d}
                </span>
                <span className="col-span-5 md:col-span-1 text-right font-mono-ed text-xs uppercase tracking-[0.2em] text-cream/40 group-hover:text-ember transition-colors">
                  {lang === "ar" ? "استعمل ←" : "Use →"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── DOMAINS ──────────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-40">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-3">
              <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-oxblood">§ 02</div>
              <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-ink/50 mt-1">
                {lang === "ar" ? "القطاعات" : "Domains"}
              </div>
            </div>
            <div className="md:col-span-9">
              <p
                className="font-display text-3xl md:text-4xl leading-[1.1] text-ink"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                {lang === "ar"
                  ? "أربعة قطاعات. منهجية واحدة. نتائج واضحة."
                  : "Four domains. One methodology. Clear results."}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
            {[
              {
                ar: "التجارة الإلكترونية",
                en: "E-Commerce",
                icon: "🛒",
                desc_ar: "ربحية المنتج، كفاءة التسويق، تحليل التحويل.",
                desc_en: "Product profitability, marketing efficiency, conversion analysis.",
              },
              {
                ar: "الخدمات المهنية",
                en: "Services",
                icon: "⚙️",
                desc_ar: "معدل الاستغلال، كفاءة السعر، توقعات الإيراد.",
                desc_en: "Utilization rate, pricing efficiency, revenue forecasting.",
              },
              {
                ar: "المطاعم",
                en: "Restaurant",
                icon: "🍽",
                desc_ar: "تكلفة الوجبة الحقيقية، هندسة القائمة، الإيراد بالغطاء.",
                desc_en: "True dish cost, menu engineering, revenue per cover.",
              },
              {
                ar: "العقارات",
                en: "Real Estate",
                icon: "🏢",
                desc_ar: "خط أنابيب الصفقات، تحليل العمولات، مؤشر السوق.",
                desc_en: "Deal pipeline, commission analysis, market index.",
              },
            ].map((d) => (
              <div
                key={d.en}
                className="bg-[hsl(var(--background))] p-8 group hover:bg-ink hover:text-cream transition-all duration-300"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <div className="text-4xl mb-6">{d.icon}</div>
                <h3 className="font-display text-2xl text-ink group-hover:text-cream mb-2 transition-colors">
                  {lang === "ar" ? d.ar : d.en}
                </h3>
                <p className="font-display text-sm text-ink/60 group-hover:text-cream/70 leading-relaxed transition-colors">
                  {lang === "ar" ? d.desc_ar : d.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS CTA ─────────────────────────────────────────────── */}
      <section id="access" className="relative py-28 md:py-40 grain">
        <div className="container grid md:grid-cols-2 gap-16 items-center">
          <div dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-oxblood mb-6">
              § {lang === "ar" ? "الوصول المبكر" : "Early Access"}
            </div>
            <h3 className="font-display text-5xl md:text-7xl leading-[0.95] text-ink text-balance">
              {lang === "ar" ? (
                <>
                  ابدأ اليوم. <br />
                  <span className="italic text-oxblood">بلا تعقيد.</span>
                </>
              ) : (
                <>
                  Start today. <br />
                  <span className="italic text-oxblood">No complexity.</span>
                </>
              )}
            </h3>
            <p className="font-display text-xl text-ink/75 mt-8 max-w-md">
              {lang === "ar"
                ? "سجّل مشروعك الأول مجاناً. التحليل الأولي بلا تكلفة. النتائج خلال ثوانٍ."
                : "Register your first project for free. Initial assessment at no cost. Results in seconds."}
            </p>
          </div>

          <div className="relative">
            <div
              className="bg-[hsl(var(--background))] border-2 border-ink p-8 md:p-12"
              style={{ boxShadow: "var(--shadow-editorial)" }}
            >
              <div
                className="flex justify-between items-start mb-8 font-mono-ed text-xs uppercase tracking-[0.25em]"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <span>{lang === "ar" ? "التسجيل" : "Registration"}</span>
                <span className="text-oxblood">Cezar 12</span>
              </div>

              <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
                <label className="block">
                  <span className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">
                    {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === "ar" ? "you@company.com" : "you@company.com"}
                    className="mt-2 w-full bg-transparent border-b-2 border-ink pb-2 font-display text-xl focus:outline-none focus:border-oxblood transition-colors"
                  />
                </label>

                <button
                  onClick={() => navigate("/register")}
                  className="w-full mt-6 bg-oxblood text-cream py-5 font-mono-ed text-xs uppercase tracking-[0.3em] hover:bg-ink transition-colors"
                >
                  {lang === "ar" ? "سجّل مجاناً ←" : "Register Free →"}
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full border border-ink/30 text-ink py-4 font-mono-ed text-xs uppercase tracking-[0.3em] hover:border-ink hover:bg-ink/5 transition-all"
                >
                  {lang === "ar" ? "لديك حساب؟ ادخل" : "Have an account? Login"}
                </button>

                <p className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/50 text-center pt-2">
                  {lang === "ar" ? "لا بطاقة ائتمان. لا التزامات." : "No credit card. No commitment."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-ink/20 bg-ink text-cream/80">
        <div className="container py-10 flex flex-col md:flex-row gap-4 justify-between items-center font-mono-ed text-xs uppercase tracking-[0.25em]">
          <span>© Cezar 12 — {lang === "ar" ? "ذكاء الأعمال للخليج" : "Business Intelligence for the Gulf"}</span>
          <span className="flex gap-6">
            <button onClick={() => navigate("/register")} className="hover:text-ember transition-colors">
              {lang === "ar" ? "تسجيل" : "Register"}
            </button>
            <button onClick={() => navigate("/plans")} className="hover:text-ember transition-colors">
              {lang === "ar" ? "الخطط" : "Plans"}
            </button>
            <button onClick={() => navigate("/login")} className="hover:text-ember transition-colors">
              {lang === "ar" ? "دخول" : "Login"}
            </button>
          </span>
        </div>
      </footer>
    </main>
  )
}
