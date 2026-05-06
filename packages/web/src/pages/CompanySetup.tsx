import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  EMPTY_SETUP,
  STORAGE_KEY,
  type Lang,
  type SetupData,
  setupT,
} from "@/lib/setup-i18n"
import Step1BasicInfo from "@/components/setup/Step1BasicInfo"
import Step2DigitalPresence from "@/components/setup/Step2DigitalPresence"
import Step3BusinessDescription from "@/components/setup/Step3BusinessDescription"
import Step4MarketingStatus from "@/components/setup/Step4MarketingStatus"
import { companyApi } from "@/lib/api"

const TOTAL_STEPS = 4

export default function CompanySetup() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>("ar")
  const [step, setStep] = useState(1)
  const [data, setData] = useState<SetupData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? (JSON.parse(saved) as SetupData) : EMPTY_SETUP
    } catch {
      return EMPTY_SETUP
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const i = setupT[lang]
  const dir = lang === "ar" ? "rtl" : "ltr"

  const setField = <K extends keyof SetupData>(key: K, value: SetupData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const saveLater = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    toast.success(i.savedDraft, { duration: 2500 })
  }

  // ─── Per-step validation ──────────────────────────────────────────────────

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {}

    if (s === 1) {
      if (!data.company_name.trim()) e.company_name = i.errRequired
      if (!data.industry) e.industry = i.errRequired
      if (!data.company_size) e.company_size = i.errRequired
      if (!data.business_model) e.business_model = i.errRequired
      if (!data.country) e.country = i.errRequired
    }

    if (s === 3) {
      if (!data.description.trim()) {
        e.description = i.errRequired
      } else if (data.description.length < 50) {
        e.description = i.errDescShort
      } else if (data.description.length > 1000) {
        e.description = i.errDescLong
      }
      if (!data.unique_value_prop.trim()) e.unique_value_prop = i.errRequired
      if (!data.price_range) e.price_range = i.errRequired
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goNext = () => {
    if (!validateStep(step)) return
    setErrors({})
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const onComplete = async () => {
    if (!validateStep(step)) return
    setSubmitting(true)
    try {
      // POST /api/companies — mocked until backend is wired
      await fakePostCompany(data)
      localStorage.removeItem(STORAGE_KEY)
      navigate("/dashboard")
    } catch {
      toast.error(i.errGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Step metadata ────────────────────────────────────────────────────────

  const stepMeta = [
    { title: i.step1Title, sub: i.step1Sub },
    { title: i.step2Title, sub: i.step2Sub },
    { title: i.step3Title, sub: i.step3Sub },
    { title: i.step4Title, sub: i.step4Sub },
  ]
  const { title, sub } = stepMeta[step - 1]

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-5 font-mono-ed text-[11px] uppercase tracking-[0.25em]">
        <Link to="/" className="text-oxblood hover:opacity-70 transition-opacity">
          {i.brand}
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-ink/40">{i.stepOf(step)}</span>
          <div className="flex items-center gap-0 border border-ink/20 rounded-sm overflow-hidden">
            <button
              onClick={() => setLang("ar")}
              className={`px-2.5 py-1 transition-colors ${lang === "ar" ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"}`}
            >
              AR
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 transition-colors ${lang === "en" ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* ── Sticky progress bar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-ink/10 px-6 lg:px-10 py-4">
        <div className="max-w-2xl mx-auto space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/50">
              {i.stepOf(step)}
            </span>
            <button
              onClick={saveLater}
              className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-oxblood transition-colors"
            >
              {i.saveLater}
            </button>
          </div>
          {/* Track */}
          <div className="h-1 bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-oxblood rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between">
            {Array.from({ length: TOTAL_STEPS }, (_, idx) => {
              const n = idx + 1
              return (
                <div
                  key={n}
                  className={`flex items-center gap-1.5 transition-colors ${n <= step ? "text-oxblood" : "text-ink/30"}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center font-mono-ed text-[8px] transition-all ${
                      n < step
                        ? "bg-oxblood border-oxblood text-cream"
                        : n === step
                          ? "border-oxblood text-oxblood"
                          : "border-ink/20 text-ink/30"
                    }`}
                  >
                    {n < step ? "✓" : n}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Step content ──────────────────────────────────────────────────── */}
      <main className="px-6 lg:px-10 pt-10 pb-36">
        <div className="max-w-2xl mx-auto">
          {/* Step heading */}
          <div className="mb-10 rise">
            <p className="font-mono-ed text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-2">
              {i.stepOf(step)}
            </p>
            <h1 className="font-display text-3xl lg:text-4xl text-ink mb-2">{title}</h1>
            <p className="text-muted-foreground text-sm">{sub}</p>
          </div>

          {/* Step body */}
          <div className="rise-2">
            {step === 1 && (
              <Step1BasicInfo data={data} setField={setField} errors={errors} lang={lang} />
            )}
            {step === 2 && (
              <Step2DigitalPresence data={data} setField={setField} lang={lang} />
            )}
            {step === 3 && (
              <Step3BusinessDescription
                data={data}
                setField={setField}
                errors={errors}
                lang={lang}
              />
            )}
            {step === 4 && (
              <Step4MarketingStatus data={data} setField={setField} lang={lang} />
            )}
          </div>
        </div>
      </main>

      {/* ── Sticky bottom navigation ──────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur-sm border-t border-ink/10 px-6 lg:px-10 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Back */}
          <button
            onClick={goBack}
            disabled={step === 1}
            className="h-11 px-6 border border-ink/25 text-ink font-mono-ed text-xs uppercase tracking-[0.2em] rounded-sm hover:border-ink/50 transition-colors disabled:opacity-30"
          >
            {i.back}
          </button>

          {/* Next / Complete */}
          {step < TOTAL_STEPS ? (
            <button
              onClick={goNext}
              className="h-11 px-8 bg-oxblood text-cream font-mono-ed text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-ink transition-colors shadow-[var(--shadow-press)]"
            >
              {i.next}
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={submitting}
              className="h-11 px-8 bg-oxblood text-cream font-mono-ed text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-ink transition-colors shadow-[var(--shadow-press)] disabled:opacity-60"
            >
              {submitting ? i.completing : i.complete}
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}

// ── Mock POST ──────────────────────────────────────────────────────────────────
async function fakePostCompany(_data: SetupData): Promise<void> {
  await new Promise<void>((res) => setTimeout(res, 800))
  // In production: await fetch("/api/companies", { method: "POST", body: JSON.stringify(_data) })
}
