import { CHANNELS_AR, CHANNELS_EN, type Lang, type SetupData, setupT } from "@/lib/setup-i18n"

interface Props {
  data: SetupData
  setField: <K extends keyof SetupData>(key: K, value: SetupData[K]) => void
  lang: Lang
}

const inputClass =
  "w-full h-11 px-3 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors"

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
    <div className="space-y-8">
      {/* Marketing team toggle */}
      <div className="space-y-3">
        <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
          {i.hasMarketingTeam}
        </label>
        <div className="flex gap-3">
          {(
            [
              { value: true, label: i.yes },
              { value: false, label: i.no },
            ] as { value: boolean; label: string }[]
          ).map(({ value, label }) => {
            const sel = data.has_marketing_team === value
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => setField("has_marketing_team", value)}
                className={`px-6 py-2.5 rounded-sm border font-mono-ed text-xs transition-all ${
                  sel
                    ? "border-oxblood bg-oxblood text-cream"
                    : "border-ink/20 bg-cream text-ink/70 hover:border-ink/40"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Monthly budget + target revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.monthlyBudget}
          </label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 font-mono-ed text-xs text-ink/40 pointer-events-none">
              $
            </span>
            <input
              type="number"
              min={0}
              value={data.monthly_marketing_budget}
              onChange={(e) => setField("monthly_marketing_budget", e.target.value)}
              placeholder={i.monthlyBudgetPh}
              className="w-full h-11 ps-7 pe-3 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.targetRevenue}
          </label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 font-mono-ed text-xs text-ink/40 pointer-events-none">
              $
            </span>
            <input
              type="number"
              min={0}
              value={data.target_monthly_revenue_usd}
              onChange={(e) => setField("target_monthly_revenue_usd", e.target.value)}
              placeholder={i.targetRevenuePh}
              className="w-full h-11 ps-7 pe-3 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Current channels */}
      <div className="space-y-3">
        <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
          {i.currentChannels}
        </label>
        <div className="flex flex-wrap gap-2">
          {channels.map((c) => {
            const sel = data.current_channels.includes(c)
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleChannel(c)}
                className={`px-3 py-1.5 rounded-full border text-xs font-mono-ed transition-all ${
                  sel
                    ? "border-oxblood bg-oxblood text-cream"
                    : "border-ink/20 bg-cream text-ink/70 hover:border-ink/40"
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {/* Biggest pain */}
      <div className="space-y-1.5">
        <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
          {i.biggestPain}
        </label>
        <textarea
          value={data.biggest_marketing_pain}
          onChange={(e) => setField("biggest_marketing_pain", e.target.value)}
          placeholder={i.biggestPainPh}
          rows={4}
          className="w-full px-3 py-2.5 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* Completion nudge */}
      <div className="border border-ink/10 rounded-sm p-4 bg-oxblood/3 flex items-start gap-3">
        <span className="font-display text-oxblood text-xl mt-0.5">✦</span>
        <p className="text-sm text-ink/70 leading-relaxed">
          {lang === "ar"
            ? "بعد إكمال الملف التعريفي، ستتمكن من الوصول إلى جميع خدمات الذكاء الاصطناعي المخصصة لنشاطك."
            : "After completing your profile, you'll unlock all AI-powered services tailored to your business."}
        </p>
      </div>
    </div>
  )
}
