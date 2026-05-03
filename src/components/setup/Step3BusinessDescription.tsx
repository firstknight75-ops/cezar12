import { useState } from "react"
import { Crown, DollarSign, Gem, Star, X } from "lucide-react"
import {
  CHALLENGES_AR,
  CHALLENGES_EN,
  type Lang,
  type SetupData,
  setupT,
} from "@/lib/setup-i18n"

interface Props {
  data: SetupData
  setField: <K extends keyof SetupData>(key: K, value: SetupData[K]) => void
  errors: Record<string, string>
  lang: Lang
}

const inputClass =
  "w-full h-11 px-3 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors"

const PRICE_RANGES = (i: (typeof setupT)["ar"] | (typeof setupT)["en"]) => [
  { value: "budget", label: i.priceBudget, Icon: DollarSign },
  { value: "mid-range", label: i.priceMid, Icon: Star },
  { value: "premium", label: i.pricePremium, Icon: Gem },
  { value: "luxury", label: i.priceLuxury, Icon: Crown },
]

export default function Step3BusinessDescription({ data, setField, errors, lang }: Props) {
  const i = setupT[lang]
  const [tagInput, setTagInput] = useState("")
  const [competitorInput, setCompetitorInput] = useState("")

  const challenges = lang === "ar" ? CHALLENGES_AR : CHALLENGES_EN
  const descLen = data.description.length

  const addProduct = () => {
    const val = tagInput.trim()
    if (!val || data.main_products.length >= 10) return
    setField("main_products", [...data.main_products, val])
    setTagInput("")
  }

  const removeProduct = (idx: number) => {
    setField(
      "main_products",
      data.main_products.filter((_, i) => i !== idx),
    )
  }

  const addCompetitor = () => {
    const val = competitorInput.trim()
    if (!val || data.main_competitors.length >= 5) return
    setField("main_competitors", [...data.main_competitors, val])
    setCompetitorInput("")
  }

  const removeCompetitor = (idx: number) => {
    setField(
      "main_competitors",
      data.main_competitors.filter((_, i) => i !== idx),
    )
  }

  const toggleChallenge = (c: string) => {
    const next = data.current_challenges.includes(c)
      ? data.current_challenges.filter((x) => x !== c)
      : [...data.current_challenges, c]
    setField("current_challenges", next)
  }

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.description}
          </label>
          <span
            className={`font-mono-ed text-[10px] transition-colors ${
              descLen < 50
                ? "text-destructive"
                : descLen > 950
                  ? "text-ember"
                  : "text-ink/40"
            }`}
          >
            {i.descriptionHint(descLen)}
          </span>
        </div>
        <textarea
          value={data.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder={i.descriptionPh}
          rows={5}
          maxLength={1000}
          className="w-full px-3 py-2.5 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors resize-none leading-relaxed"
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Unique value prop */}
      <div className="space-y-1.5">
        <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
          {i.uniqueValueProp}
        </label>
        <input
          type="text"
          value={data.unique_value_prop}
          onChange={(e) => setField("unique_value_prop", e.target.value)}
          placeholder={i.uniqueValuePh}
          className={inputClass}
        />
        {errors.unique_value_prop && (
          <p className="text-xs text-destructive">{errors.unique_value_prop}</p>
        )}
      </div>

      {/* Main products — tag input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.mainProducts}
          </label>
          <span className="font-mono-ed text-[10px] text-ink/40">
            {data.main_products.length}/10 — {i.mainProductsHint}
          </span>
        </div>

        {data.main_products.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {data.main_products.map((p, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-oxblood/10 border border-oxblood/25 text-oxblood text-xs font-mono-ed rounded-full"
              >
                {p}
                <button
                  type="button"
                  onClick={() => removeProduct(idx)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {data.main_products.length < 10 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  addProduct()
                }
              }}
              placeholder={i.mainProductsPh}
              className={inputClass}
            />
            <button
              type="button"
              onClick={addProduct}
              disabled={!tagInput.trim()}
              className="h-11 px-4 bg-ink text-cream font-mono-ed text-xs rounded-sm hover:bg-oxblood transition-colors disabled:opacity-30 shrink-0"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
          {i.priceRange}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRICE_RANGES(i).map(({ value, label, Icon }) => {
            const sel = data.price_range === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setField("price_range", value)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-sm border transition-all ${
                  sel
                    ? "border-oxblood bg-oxblood/5 shadow-[inset_0_0_0_1px_hsl(var(--oxblood))]"
                    : "border-ink/20 bg-cream hover:border-ink/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${sel ? "text-oxblood" : "text-ink/40"}`} />
                <span
                  className={`font-mono-ed text-[10px] uppercase tracking-[0.15em] ${sel ? "text-oxblood" : "text-ink/60"}`}
                >
                  {label}
                </span>
                {sel && (
                  <span className="absolute top-2 end-2 w-1.5 h-1.5 rounded-full bg-oxblood" />
                )}
              </button>
            )
          })}
        </div>
        {errors.price_range && (
          <p className="text-xs text-destructive">{errors.price_range}</p>
        )}
      </div>

      {/* Competitors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.competitors}
          </label>
          <span className="font-mono-ed text-[10px] text-ink/40">
            {data.main_competitors.length}/5
          </span>
        </div>

        {data.main_competitors.length > 0 && (
          <div className="space-y-2">
            {data.main_competitors.map((comp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono-ed text-[10px] text-ink/40 w-5 shrink-0">
                  {idx + 1}.
                </span>
                <div className="flex-1 h-10 px-3 bg-cream/60 border border-ink/15 rounded-sm text-sm text-ink flex items-center">
                  {comp}
                </div>
                <button
                  type="button"
                  onClick={() => removeCompetitor(idx)}
                  className="text-ink/30 hover:text-destructive transition-colors p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {data.main_competitors.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCompetitor()
                }
              }}
              placeholder={i.competitorPh(data.main_competitors.length + 1)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={addCompetitor}
              disabled={!competitorInput.trim()}
              className="h-11 px-4 bg-ink text-cream font-mono-ed text-xs rounded-sm hover:bg-oxblood transition-colors disabled:opacity-30 whitespace-nowrap shrink-0"
            >
              {lang === "ar" ? "+" : "+"}
            </button>
          </div>
        )}
      </div>

      {/* Challenges */}
      <div className="space-y-3">
        <div>
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.challenges}
          </label>
          <p className="font-mono-ed text-[10px] text-ink/45 mt-0.5">{i.challengesHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {challenges.map((c) => {
            const sel = data.current_challenges.includes(c)
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleChallenge(c)}
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
    </div>
  )
}
