import { Briefcase, Building2, ShoppingCart, UtensilsCrossed, X } from "lucide-react"
import {
  CITIES,
  SETUP_COUNTRIES,
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

const INDUSTRIES = (i: (typeof setupT)["ar"] | (typeof setupT)["en"]) => [
  { value: "ecommerce", label: i.industryEcommerce, Icon: ShoppingCart },
  { value: "services", label: i.industryServices, Icon: Briefcase },
  { value: "restaurant", label: i.industryRestaurant, Icon: UtensilsCrossed },
  { value: "real_estate", label: i.industryRealEstate, Icon: Building2 },
]

const SIZES = ["1-10", "11-50", "51-200", "200+"]
const MODELS = ["B2B", "B2C", "B2B2C", "Marketplace"]

export default function Step1BasicInfo({ data, setField, errors, lang }: Props) {
  const i = setupT[lang]
  const cities = data.country ? (CITIES[data.country] ?? []) : []

  const toggleCity = (city: string) => {
    const next = data.target_cities.includes(city)
      ? data.target_cities.filter((c) => c !== city)
      : [...data.target_cities, city]
    setField("target_cities", next)
  }

  const onCountryChange = (code: string) => {
    setField("country", code)
    setField("target_cities", [])
  }

  return (
    <div className="space-y-8">
      {/* Company names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.companyName}
          </label>
          <input
            type="text"
            value={data.company_name}
            onChange={(e) => setField("company_name", e.target.value)}
            placeholder={i.companyNamePh}
            className={inputClass}
          />
          {errors.company_name && (
            <p className="text-xs text-destructive">{errors.company_name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70 flex items-center gap-2">
            {i.companyNameEn}
            <span className="normal-case text-ink/40">{i.optional}</span>
          </label>
          <input
            type="text"
            value={data.company_name_en}
            onChange={(e) => setField("company_name_en", e.target.value)}
            placeholder={i.companyNameEnPh}
            className={inputClass}
            dir="ltr"
          />
        </div>
      </div>

      {/* Industry */}
      <div className="space-y-3">
        <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
          {i.industry}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INDUSTRIES(i).map(({ value, label, Icon }) => {
            const selected = data.industry === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setField("industry", value)}
                className={`relative flex flex-col items-center gap-2.5 p-4 rounded-sm border transition-all text-center ${
                  selected
                    ? "border-oxblood bg-oxblood/5 shadow-[inset_0_0_0_1px_hsl(var(--oxblood))]"
                    : "border-ink/20 bg-cream hover:border-ink/40"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${selected ? "text-oxblood" : "text-ink/50"}`}
                />
                <span
                  className={`font-mono-ed text-[11px] uppercase tracking-[0.15em] ${selected ? "text-oxblood" : "text-ink/70"}`}
                >
                  {label}
                </span>
                {selected && (
                  <span className="absolute top-2 end-2 w-1.5 h-1.5 rounded-full bg-oxblood" />
                )}
              </button>
            )
          })}
        </div>
        {errors.industry && <p className="text-xs text-destructive">{errors.industry}</p>}
      </div>

      {/* Size + Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.companySize}
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => {
              const sel = data.company_size === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setField("company_size", s)}
                  className={`px-4 py-2 rounded-sm border font-mono-ed text-xs transition-all ${
                    sel
                      ? "border-oxblood bg-oxblood text-cream"
                      : "border-ink/20 bg-cream text-ink/70 hover:border-ink/40"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
          {errors.company_size && (
            <p className="text-xs text-destructive">{errors.company_size}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
            {i.businessModel}
          </label>
          <div className="flex flex-wrap gap-2">
            {MODELS.map((m) => {
              const sel = data.business_model === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setField("business_model", m)}
                  className={`px-4 py-2 rounded-sm border font-mono-ed text-xs transition-all ${
                    sel
                      ? "border-oxblood bg-oxblood text-cream"
                      : "border-ink/20 bg-cream text-ink/70 hover:border-ink/40"
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>
          {errors.business_model && (
            <p className="text-xs text-destructive">{errors.business_model}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div className="space-y-1.5">
        <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
          {i.country}
        </label>
        <select
          value={data.country}
          onChange={(e) => onCountryChange(e.target.value)}
          className={inputClass}
        >
          <option value="">{i.selectCountry}</option>
          {SETUP_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {lang === "ar" ? c.ar : c.en} — {c.currency}
            </option>
          ))}
        </select>
        {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
      </div>

      {/* Target cities — only shown once a country is chosen */}
      {cities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
              {i.targetCities}
            </label>
            {data.target_cities.length > 0 && (
              <button
                type="button"
                onClick={() => setField("target_cities", [])}
                className="font-mono-ed text-[10px] text-ink/40 hover:text-destructive transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                {lang === "ar" ? "إلغاء الكل" : "Clear all"}
              </button>
            )}
          </div>
          <p className="font-mono-ed text-[10px] text-ink/50">{i.targetCitiesHint}</p>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => {
              const label = lang === "ar" ? city.ar : city.en
              const sel = data.target_cities.includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleCity(label)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-mono-ed transition-all ${
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
      )}
    </div>
  )
}
