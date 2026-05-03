import { TrendingUp, Users, Wallet } from "lucide-react"
import { CHANNELS_AR, CHANNELS_EN, type Lang, type SetupData, setupT } from "@/lib/setup-i18n"

interface Props {
  data: SetupData
  setField: <K extends keyof SetupData>(key: K, value: SetupData[K]) => void
  lang: Lang
}

export default function Step4MarketingStatus({ data, setField, lang }: Props) {
  const i = setupT[lang]
  const channels = lang === "ar" ? CHANNELS_AR : CHANNELS_EN

  const toggleChannel = (c: string) => {
    const next = data.current_channels.includes(c)
      ? data.current_channels.filter((x) => x !== c)
      : [...data.current_channels, c]
    setField("current_channels", next)
  }

  return (
    <div className="space-y-10">

      {/* ── 1. Marketing team ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">
          {i.hasMarketingTeam}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              {
                value: true,
                label: i.yes,
                desc: lang === "ar" ? "لدينا فريق مخصص للتسويق" : "We have a dedicated marketing team",
                icon: "✦",
              },
              {
                value: false,
                label: i.no,
                desc: lang === "ar" ? "نتولى التسويق بأنفسنا" : "We handle marketing ourselves",
                icon: "○",
              },
            ] as { value: boolean; label: string; desc: string; icon: string }[]
          ).map(({ value, label, desc, icon }) => {
            const sel = data.has_marketing_team === value
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => setField("has_marketing_team", value)}
                className={`relative flex flex-col items-start gap-2 p-5 rounded-sm border text-start transition-all ${
                  sel
                    ? "border-oxblood bg-[var(--gradient-editorial)] text-cream shadow-[var(--shadow-editorial)]"
                    : "border-ink/20 bg-cream hover:border-ink/40 text-ink"
                }`}
              >
                <span className={`font-display text-2xl ${sel ? "text-cream/70" : "text-ink/25"}`}>
                  {icon}
                </span>
                <span className={`font-mono-ed text-xs uppercase tracking-[0.2em] ${sel ? "text-cream" : "text-ink"}`}>
                  {label}
                </span>
                <span className={`font-mono-ed text-[10px] leading-snug ${sel ? "text-cream/70" : "text-ink/45"}`}>
                  {desc}
                </span>
                {sel && (
                  <span className="absolute top-3 end-3 font-mono-ed text-[8px] uppercase tracking-[0.2em] bg-cream/20 text-cream px-1.5 py-0.5 rounded-full">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* ── 2. Financial targets ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">
          {lang === "ar" ? "الأرقام المالية" : "Financial Targets"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Monthly budget */}
          <div className="border border-ink/15 rounded-sm p-5 bg-cream space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-ink/35" />
              <span className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/55">
                {i.monthlyBudget}
              </span>
            </div>
            <div className="relative">
              <span className="absolute start-0 top-1/2 -translate-y-1/2 font-display text-2xl text-ink/20 pointer-events-none">
                $
              </span>
              <input
                type="number"
                min={0}
                value={data.monthly_marketing_budget}
                onChange={(e) => setField("monthly_marketing_budget", e.target.value)}
                placeholder={i.monthlyBudgetPh}
                className="w-full ps-7 h-10 bg-transparent border-b border-ink/20 font-display text-xl text-ink placeholder:text-ink/25 focus:outline-none focus:border-oxblood transition-colors"
                dir="ltr"
              />
            </div>
            <p className="font-mono-ed text-[9px] uppercase tracking-[0.2em] text-ink/35">USD / month</p>
          </div>

          {/* Target revenue */}
          <div className="border border-ink/15 rounded-sm p-5 bg-cream space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ink/35" />
              <span className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/55">
                {i.targetRevenue}
              </span>
            </div>
            <div className="relative">
              <span className="absolute start-0 top-1/2 -translate-y-1/2 font-display text-2xl text-ink/20 pointer-events-none">
                $
              </span>
              <input
                type="number"
                min={0}
                value={data.target_monthly_revenue_usd}
                onChange={(e) => setField("target_monthly_revenue_usd", e.target.value)}
                placeholder={i.targetRevenuePh}
                className="w-full ps-7 h-10 bg-transparent border-b border-ink/20 font-display text-xl text-ink placeholder:text-ink/25 focus:outline-none focus:border-oxblood transition-colors"
                dir="ltr"
              />
            </div>
            <p className="font-mono-ed text-[9px] uppercase tracking-[0.2em] text-ink/35">USD / month</p>
          </div>
        </div>
      </section>

      {/* ── 3. Channels ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">
            {i.currentChannels}
          </p>
          {data.current_channels.length > 0 && (
            <span className="font-mono-ed text-[10px] text-oxblood">
              {data.current_channels.length} {lang === "ar" ? "محدد" : "selected"}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {channels.map((c) => {
            const sel = data.current_channels.includes(c)
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleChannel(c)}
                className={`relative flex items-center justify-between px-4 py-3 rounded-sm border text-start transition-all ${
                  sel
                    ? "border-oxblood bg-oxblood/5 text-oxblood"
                    : "border-ink/15 bg-cream text-ink/65 hover:border-ink/35 hover:text-ink"
                }`}
              >
                <span className="font-mono-ed text-[11px]">{c}</span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    sel ? "border-oxblood bg-oxblood" : "border-ink/25"
                  }`}
                >
                  {sel && (
                    <svg viewBox="0 0 8 6" className="w-2 h-1.5 fill-none stroke-cream stroke-[1.5]">
                      <polyline points="1,3 3,5 7,1" />
                    </svg>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── 4. Biggest pain ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">
          {i.biggestPain}
        </p>
        <div className="flex gap-4">
          {/* Accent bar */}
          <div className="w-0.5 rounded-full bg-gradient-to-b from-oxblood to-ember shrink-0 self-stretch" />
          <textarea
            value={data.biggest_marketing_pain}
            onChange={(e) => setField("biggest_marketing_pain", e.target.value)}
            placeholder={i.biggestPainPh}
            rows={4}
            className="flex-1 px-0 py-1 bg-transparent border-none font-display text-base text-ink placeholder:text-ink/30 focus:outline-none resize-none leading-relaxed"
          />
        </div>
        <div className="h-px bg-ink/10" />
      </section>

      {/* ── 5. Unlock banner ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-sm bg-[var(--gradient-editorial)] p-6 text-cream grain">
        <div className="relative z-10 flex items-start gap-4">
          <Users className="h-5 w-5 shrink-0 mt-0.5 opacity-70" />
          <div className="space-y-1">
            <p className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-cream/60">
              {lang === "ar" ? "بعد الإكمال" : "After completion"}
            </p>
            <p className="font-display text-lg leading-snug text-balance">
              {lang === "ar"
                ? "ستفتح أمامك جميع خدمات الذكاء الاصطناعي المخصصة لنشاطك التجاري."
                : "You'll unlock all AI-powered services tailored to your business."}
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
