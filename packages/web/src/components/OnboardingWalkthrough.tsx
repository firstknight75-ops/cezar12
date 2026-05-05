import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShoppingCart, Wrench, UtensilsCrossed, Building2,
  FileBarChart, Megaphone, ChevronRight, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "cezar12_onboarding_seen"

// ─── i18n ─────────────────────────────────────────────────────────────────────

const copy = {
  ar: {
    skip: "تخطي",
    back: "السابق",
    next: "التالي",
    start: "ابدأ الآن",
    step: "خطوة",
    of: "من",

    // Step 1 — Welcome
    s1title: "مرحباً بك في سيزر 12",
    s1sub: "منصة الذكاء التجاري للشركات الخليجية",
    s1body:
      "نحلّل بياناتك المالية ونولّد لك خطط نمو وتقارير ذكاء تشغيلي بالذكاء الاصطناعي — باللغتين العربية والإنجليزية.",

    // Step 2 — Domains
    s2title: "اختر مجال عملك",
    s2sub: "كل تحليل مُصمَّم خصيصاً لصناعتك",
    domains: [
      { label: "التجارة الإلكترونية", desc: "ربحية المنتجات، قنوات البيع، رحلة العميل" },
      { label: "الخدمات المهنية", desc: "الطاقة الاستيعابية، سلّم الأسعار، صحة خط الأعمال" },
      { label: "المطاعم والمقاهي", desc: "تكلفة المنيو، معدل دوران الطاولات، الربحية التشغيلية" },
      { label: "العقارات", desc: "خط الصفقات، تتبع العمولات، مؤشرات السوق" },
    ],

    // Step 3 — How it works
    s3title: "كيف تعمل المنصة؟",
    s3sub: "ثلاث خطوات للحصول على رؤى قابلة للتنفيذ",
    steps: [
      { n: "١", title: "أدخل بيانات مشروعك", desc: "أرقام مالية بسيطة عن عملك — لا خبرة محاسبية مطلوبة." },
      { n: "٢", title: "احصل على تشخيص فوري", desc: "نسبة صحة مالية من 0 إلى 100 مع تحديد نقاط الضعف." },
      { n: "٣", title: "فعّل خدمات الذكاء الاصطناعي", desc: "12 خدمة متخصصة — من خطط النمو إلى محتوى التسويق." },
    ],

    // Step 4 — Get started
    s4title: "جاهز للبدء؟",
    s4sub: "ثلاث خطوات سريعة لإطلاق أول مشروع",
    cards: [
      { n: "1", title: "أكمل ملف شركتك", desc: "المعلومات الأساسية عن نشاطك التجاري", cta: "إكمال الملف", href: "/setup" },
      { n: "2", title: "اختر خطة اشتراكك", desc: "فضي · ذهبي · بلاتيني", cta: "عرض الخطط", href: "/plans" },
      { n: "3", title: "أنشئ مشروعك الأول", desc: "أدخل بيانات مشروع وابدأ التحليل", cta: "إنشاء مشروع", href: "/projects/new" },
    ],
  },

  en: {
    skip: "Skip",
    back: "Back",
    next: "Next",
    start: "Let's go",
    step: "Step",
    of: "of",

    s1title: "Welcome to Cezar 12",
    s1sub: "Business intelligence platform for Gulf-region companies",
    s1body:
      "We analyse your financial data and generate AI-powered growth plans and operational intelligence reports — in Arabic and English.",

    s2title: "Choose your industry",
    s2sub: "Every insight is tailored to your sector",
    domains: [
      { label: "E-Commerce", desc: "Product profitability, sales channels, customer journey" },
      { label: "Professional Services", desc: "Capacity, rate ladder, pipeline health" },
      { label: "Restaurants & Cafés", desc: "Menu costing, table turnover, operational margin" },
      { label: "Real Estate", desc: "Deal pipeline, commission tracking, market signals" },
    ],

    s3title: "How it works",
    s3sub: "Three steps to actionable insights",
    steps: [
      { n: "1", title: "Enter your project data", desc: "Simple financial numbers about your business — no accounting expertise needed." },
      { n: "2", title: "Get an instant diagnosis", desc: "A 0–100 financial health score pinpointing your weak spots." },
      { n: "3", title: "Activate AI services", desc: "12 specialist services — from growth plans to marketing content." },
    ],

    s4title: "Ready to start?",
    s4sub: "Three quick steps to launch your first project",
    cards: [
      { n: "1", title: "Complete your company profile", desc: "Basic info about your business", cta: "Complete profile", href: "/setup" },
      { n: "2", title: "Pick a subscription plan", desc: "Silver · Gold · Platinum", cta: "View plans", href: "/plans" },
      { n: "3", title: "Create your first project", desc: "Enter project data and start analysis", cta: "New project", href: "/projects/new" },
    ],
  },
} as const

type Lang = "ar" | "en"

// ─── Domain icons ──────────────────────────────────────────────────────────────

const DOMAIN_ICONS = [ShoppingCart, Wrench, UtensilsCrossed, Building2]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === current ? "w-6 bg-oxblood" : "w-1.5 bg-ink/20"
          )}
        />
      ))}
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ i }: { i: typeof copy.ar }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-16 h-16 rounded-full bg-oxblood/10 flex items-center justify-center">
        <FileBarChart className="w-8 h-8 text-oxblood" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-ink">{i.s1title}</h2>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-oxblood">{i.s1sub}</p>
      </div>
      <p className="text-sm text-ink/70 leading-relaxed max-w-xs">{i.s1body}</p>
      <div className="grid grid-cols-3 gap-3 w-full pt-2">
        {["12\nخدمة", "4\nقطاعات", "0-100\nنتيجة"].map((stat) => (
          <div key={stat} className="border border-ink/10 rounded-sm p-3 bg-cream/50">
            <p className="font-mono-ed text-lg font-bold text-oxblood whitespace-pre-line leading-tight">
              {stat.split("\n")[0]}
            </p>
            <p className="font-mono-ed text-[10px] text-ink/50 uppercase tracking-wider mt-0.5">
              {stat.split("\n")[1]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step2({ i }: { i: typeof copy.ar }) {
  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="text-center space-y-1">
        <h2 className="font-display text-xl text-ink">{i.s2title}</h2>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.15em] text-oxblood">{i.s2sub}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {i.domains.map((d, idx) => {
          const Icon = DOMAIN_ICONS[idx]
          return (
            <div
              key={idx}
              className="border border-ink/10 rounded-sm p-3 bg-cream/40 hover:border-oxblood/30 hover:bg-oxblood/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-oxblood/10 flex items-center justify-center mb-2">
                <Icon className="w-4 h-4 text-oxblood" />
              </div>
              <p className="font-display text-sm text-ink leading-snug">{d.label}</p>
              <p className="text-[11px] text-ink/55 mt-1 leading-snug">{d.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step3({ i }: { i: typeof copy.ar }) {
  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="text-center space-y-1">
        <h2 className="font-display text-xl text-ink">{i.s3title}</h2>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.15em] text-oxblood">{i.s3sub}</p>
      </div>
      <div className="space-y-3">
        {i.steps.map((s, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div className="w-8 h-8 shrink-0 rounded-full bg-oxblood text-cream flex items-center justify-center font-mono-ed text-sm font-bold">
              {s.n}
            </div>
            <div className="pt-0.5">
              <p className="font-display text-sm text-ink">{s.title}</p>
              <p className="text-[12px] text-ink/60 mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border border-ember/30 bg-ember/5 rounded-sm px-4 py-3 flex items-center gap-3">
        <Megaphone className="w-4 h-4 text-ember shrink-0" />
        <p className="text-[12px] text-ink/70 leading-relaxed">
          {i === copy.ar
            ? "كل مخرجات الذكاء الاصطناعي تحتوي على تنبيه إرشادي باللغة العربية وفق متطلبات الامتثال."
            : "All AI outputs include an Arabic compliance disclaimer as required."}
        </p>
      </div>
    </div>
  )
}

function Step4({ i, onNavigate }: { i: typeof copy.ar; onNavigate: (href: string) => void }) {
  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="text-center space-y-1">
        <h2 className="font-display text-xl text-ink">{i.s4title}</h2>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.15em] text-oxblood">{i.s4sub}</p>
      </div>
      <div className="space-y-2.5">
        {i.cards.map((c) => (
          <button
            key={c.n}
            onClick={() => onNavigate(c.href)}
            className="w-full flex items-center gap-4 border border-ink/10 rounded-sm px-4 py-3 bg-cream/40 hover:border-oxblood/40 hover:bg-oxblood/5 transition-colors text-start"
          >
            <div className="w-7 h-7 shrink-0 rounded-full border border-oxblood/30 text-oxblood font-mono-ed text-xs flex items-center justify-center">
              {c.n}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm text-ink">{c.title}</p>
              <p className="text-[11px] text-ink/55 mt-0.5">{c.desc}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-oxblood font-mono-ed text-[10px] uppercase tracking-wider">
              {c.cta}
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TOTAL_STEPS = 4

interface OnboardingWalkthroughProps {
  /** Force-show for testing; ignores localStorage. */
  forceShow?: boolean
}

export default function OnboardingWalkthrough({ forceShow }: OnboardingWalkthroughProps) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState<Lang>("ar")
  const navigate = useNavigate()
  const i = copy[lang]

  useEffect(() => {
    if (forceShow || !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [forceShow])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  const handleNavigate = (href: string) => {
    dismiss()
    navigate(href)
  }

  if (!visible) return null

  const isLast = step === TOTAL_STEPS - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "hsla(0,35%,12%,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div
        className="relative w-full max-w-md bg-[hsl(38,38%,94%)] rounded-sm shadow-2xl"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <StepIndicator total={TOTAL_STEPS} current={step} />
          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-oxblood transition-colors"
            >
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <button onClick={dismiss} className="text-ink/40 hover:text-ink transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 pt-5 pb-2 min-h-[340px]">
          {step === 0 && <Step1 i={i} />}
          {step === 1 && <Step2 i={i} />}
          {step === 2 && <Step3 i={i} />}
          {step === 3 && <Step4 i={i} onNavigate={handleNavigate} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ink/8">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors"
            >
              {i.back}
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-ink/40 hover:text-ink/60 transition-colors"
            >
              {i.skip}
            </button>
          )}

          {!isLast ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 bg-oxblood text-cream font-mono-ed text-[11px] uppercase tracking-[0.2em] px-4 py-2 rounded-sm hover:bg-ink transition-colors"
            >
              {i.next}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="bg-oxblood text-cream font-mono-ed text-[11px] uppercase tracking-[0.2em] px-4 py-2 rounded-sm hover:bg-ink transition-colors"
            >
              {i.start}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
