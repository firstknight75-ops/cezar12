import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  Briefcase,
  UtensilsCrossed,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { financialEngine } from "@/lib/financial-engine"
import type { FinancialResult } from "@/lib/financial-engine"

// ─── Domain config ────────────────────────────────────────────────────────────

const DOMAINS = [
  {
    key: "ecommerce" as const,
    label: "E-Commerce",
    labelAr: "تجارة إلكترونية",
    icon: ShoppingCart,
    desc: "Online product sales & retail",
    gradient: "from-blue-900 to-blue-700",
  },
  {
    key: "services" as const,
    label: "Services",
    labelAr: "خدمات",
    icon: Briefcase,
    desc: "Professional & personal services",
    gradient: "from-purple-900 to-purple-700",
  },
  {
    key: "restaurant" as const,
    label: "Restaurant",
    labelAr: "مطعم",
    icon: UtensilsCrossed,
    desc: "Food, café & cloud kitchen",
    gradient: "from-[hsl(354_65%_24%)] to-[hsl(354_65%_14%)]",
  },
  {
    key: "real_estate" as const,
    label: "Real Estate",
    labelAr: "عقارات",
    icon: Building2,
    desc: "Property sales, rental & brokerage",
    gradient: "from-emerald-900 to-emerald-700",
  },
]

// ─── Form field types ─────────────────────────────────────────────────────────

type EcomFields = {
  product_name: string
  selling_price: string
  cost_of_goods: string
  inventory_units: string
  monthly_fixed_costs: string
  monthly_marketing_budget: string
  business_stage: "idea" | "launch" | "growth" | "scale"
  brand_positioning: "value" | "mid-range" | "premium" | "luxury"
  brand_voice_tone: "formal" | "friendly" | "bold" | "minimal"
}

type RestaurantFields = {
  restaurant_name: string
  cuisine_type: string
  seating_capacity: string
  average_check_per_person: string
  daily_operating_hours: string
  avg_table_turn_minutes: string
  food_cost_percentage: string
  monthly_fixed_costs: string
  service_type: "dine_in" | "delivery" | "both"
}

// ─── Risk badge ───────────────────────────────────────────────────────────────

const RISK_STYLES = {
  CRITICAL: { bg: "bg-red-600", text: "text-white", icon: AlertCircle, label: "Critical Risk" },
  HIGH: { bg: "bg-orange-500", text: "text-white", icon: AlertTriangle, label: "High Risk" },
  MEDIUM: { bg: "bg-amber-400", text: "text-ink", icon: AlertTriangle, label: "Medium Risk" },
  LOW: { bg: "bg-green-500", text: "text-white", icon: TrendingUp, label: "Low Risk" },
} as const

// ─── Shared field components ──────────────────────────────────────────────────

function Field({
  label,
  labelAr,
  children,
}: {
  label: string
  labelAr: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground font-mono-ed" dir="rtl">
          {labelAr}
        </span>
      </div>
      {children}
    </div>
  )
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))] transition-shadow"

function RadioGroup<T extends string>({
  label,
  labelAr,
  value,
  onChange,
  options,
}: {
  label: string
  labelAr: string
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
}) {
  return (
    <Field label={label} labelAr={labelAr}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-sm border px-3 py-2 text-sm text-left transition-all",
              value === opt.value
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-medium"
                : "border-border text-muted-foreground hover:border-[hsl(var(--primary)/0.4)]",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </Field>
  )
}

// ─── Ecommerce form ───────────────────────────────────────────────────────────

function EcommerceForm({
  data,
  onChange,
}: {
  data: EcomFields
  onChange: (d: EcomFields) => void
}) {
  const set = (k: keyof EcomFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value })

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Field label="Product Name" labelAr="اسم المنتج">
          <input className={inputCls} value={data.product_name} onChange={set("product_name")} placeholder="e.g. Artisan Olive Oil" />
        </Field>
      </div>
      <Field label="Selling Price (SAR)" labelAr="سعر البيع">
        <input className={inputCls} type="number" min="0" value={data.selling_price} onChange={set("selling_price")} placeholder="120" />
      </Field>
      <Field label="Cost of Goods (SAR)" labelAr="تكلفة البضاعة">
        <input className={inputCls} type="number" min="0" value={data.cost_of_goods} onChange={set("cost_of_goods")} placeholder="65" />
      </Field>
      <Field label="Inventory Units" labelAr="وحدات المخزون">
        <input className={inputCls} type="number" min="0" value={data.inventory_units} onChange={set("inventory_units")} placeholder="500" />
      </Field>
      <Field label="Monthly Fixed Costs (SAR)" labelAr="التكاليف الثابتة الشهرية">
        <input className={inputCls} type="number" min="0" value={data.monthly_fixed_costs} onChange={set("monthly_fixed_costs")} placeholder="8000" />
      </Field>
      <div className="col-span-2">
        <Field label="Monthly Marketing Budget (SAR)" labelAr="ميزانية التسويق الشهرية">
          <input className={inputCls} type="number" min="0" value={data.monthly_marketing_budget} onChange={set("monthly_marketing_budget")} placeholder="3000" />
        </Field>
      </div>
      <div className="col-span-2">
        <RadioGroup
          label="Business Stage"
          labelAr="مرحلة العمل"
          value={data.business_stage}
          onChange={(v) => onChange({ ...data, business_stage: v })}
          options={[
            { value: "idea", label: "Idea Stage" },
            { value: "launch", label: "Launch" },
            { value: "growth", label: "Growth" },
            { value: "scale", label: "Scaling" },
          ]}
        />
      </div>
      <div className="col-span-2">
        <RadioGroup
          label="Brand Positioning"
          labelAr="موقع العلامة التجارية"
          value={data.brand_positioning}
          onChange={(v) => onChange({ ...data, brand_positioning: v })}
          options={[
            { value: "value", label: "Value" },
            { value: "mid-range", label: "Mid-Range" },
            { value: "premium", label: "Premium" },
            { value: "luxury", label: "Luxury" },
          ]}
        />
      </div>
      <div className="col-span-2">
        <RadioGroup
          label="Brand Voice"
          labelAr="صوت العلامة التجارية"
          value={data.brand_voice_tone}
          onChange={(v) => onChange({ ...data, brand_voice_tone: v })}
          options={[
            { value: "formal", label: "Formal" },
            { value: "friendly", label: "Friendly" },
            { value: "bold", label: "Bold" },
            { value: "minimal", label: "Minimal" },
          ]}
        />
      </div>
    </div>
  )
}

// ─── Restaurant form ──────────────────────────────────────────────────────────

function RestaurantForm({
  data,
  onChange,
}: {
  data: RestaurantFields
  onChange: (d: RestaurantFields) => void
}) {
  const set = (k: keyof RestaurantFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value })

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Field label="Restaurant Name" labelAr="اسم المطعم">
          <input className={inputCls} value={data.restaurant_name} onChange={set("restaurant_name")} placeholder="e.g. Bait Al Kabsa" />
        </Field>
      </div>
      <div className="col-span-2">
        <Field label="Cuisine Type" labelAr="نوع المطبخ">
          <input className={inputCls} value={data.cuisine_type} onChange={set("cuisine_type")} placeholder="e.g. Saudi, Mediterranean, Asian Fusion" />
        </Field>
      </div>
      <Field label="Seating Capacity" labelAr="سعة الجلوس">
        <input className={inputCls} type="number" min="1" value={data.seating_capacity} onChange={set("seating_capacity")} placeholder="80" />
      </Field>
      <Field label="Avg Check / Person (SAR)" labelAr="متوسط الفاتورة للشخص">
        <input className={inputCls} type="number" min="1" value={data.average_check_per_person} onChange={set("average_check_per_person")} placeholder="85" />
      </Field>
      <Field label="Operating Hours / Day" labelAr="ساعات التشغيل اليومية">
        <input className={inputCls} type="number" min="1" max="24" value={data.daily_operating_hours} onChange={set("daily_operating_hours")} placeholder="14" />
      </Field>
      <Field label="Avg Table Turn (min)" labelAr="متوسط دوران الطاولة (دقيقة)">
        <input className={inputCls} type="number" min="10" value={data.avg_table_turn_minutes} onChange={set("avg_table_turn_minutes")} placeholder="45" />
      </Field>
      <Field label="Food Cost %" labelAr="نسبة تكلفة الطعام">
        <input className={inputCls} type="number" min="0" max="100" value={data.food_cost_percentage} onChange={set("food_cost_percentage")} placeholder="38" />
      </Field>
      <Field label="Monthly Fixed Costs (SAR)" labelAr="التكاليف الثابتة الشهرية">
        <input className={inputCls} type="number" min="0" value={data.monthly_fixed_costs} onChange={set("monthly_fixed_costs")} placeholder="35000" />
      </Field>
      <div className="col-span-2">
        <RadioGroup
          label="Service Type"
          labelAr="نوع الخدمة"
          value={data.service_type}
          onChange={(v) => onChange({ ...data, service_type: v })}
          options={[
            { value: "dine_in", label: "Dine-in Only" },
            { value: "delivery", label: "Delivery Only" },
            { value: "both", label: "Dine-in + Delivery" },
          ]}
        />
      </div>
    </div>
  )
}

// ─── Financial result card ────────────────────────────────────────────────────

function FinancialResultCard({
  result,
  domain,
  name,
  onConfirm,
  onBack,
}: {
  result: FinancialResult
  domain: string
  name: string
  onConfirm: () => void
  onBack: () => void
}) {
  const risk = RISK_STYLES[result.risk_level]
  const RiskIcon = risk.icon
  const scoreWidth = `${result.financial_score}%`

  return (
    <div className="space-y-6">
      {/* Risk header */}
      <div className={cn("rounded-sm p-5 flex items-center justify-between", risk.bg)}>
        <div className="space-y-0.5">
          <p className={cn("text-xs font-medium uppercase tracking-wider opacity-80", risk.text)}>
            Financial Health · {domain}
          </p>
          <p className={cn("font-display text-2xl font-bold", risk.text)}>{risk.label}</p>
          <p className={cn("text-sm opacity-80", risk.text)} dir="rtl">
            {result.risk_level === "CRITICAL" && "مخاطر بالغة — يتطلب تدخلاً فورياً"}
            {result.risk_level === "HIGH" && "مخاطر عالية — يتطلب مراجعة عاجلة"}
            {result.risk_level === "MEDIUM" && "مخاطر متوسطة — قابل للتحسين"}
            {result.risk_level === "LOW" && "وضع مالي قوي — جاهز للنمو"}
          </p>
        </div>
        <RiskIcon className={cn("w-10 h-10 opacity-80", risk.text)} />
      </div>

      {/* Score bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Financial Score</span>
          <span className="font-mono-ed font-semibold text-foreground">
            {result.financial_score} / 100
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", risk.bg)}
            style={{ width: scoreWidth }}
          />
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(result.metrics)
          .slice(0, 4)
          .map(([k, v]) => (
            <div key={k} className="rounded-sm border border-border p-3 bg-card">
              <p className="text-xs text-muted-foreground capitalize">
                {k.replace(/_/g, " ")}
              </p>
              <p className="font-mono-ed text-base font-semibold text-foreground mt-0.5">
                {typeof v === "number" && v === -1
                  ? "∞"
                  : typeof v === "number"
                  ? v.toLocaleString("en-US", { maximumFractionDigits: 1 })
                  : String(v)}
                {k.endsWith("_pct") || k.endsWith("percentage") ? "%" : ""}
              </p>
            </div>
          ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
        <ul className="space-y-2">
          {result.recommendations.map((r, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm text-muted-foreground"
              dir="rtl"
            >
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-[hsl(var(--accent))] mt-0.5 rotate-180" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground leading-relaxed border-t pt-3" dir="rtl">
        {result.disclaimer}
      </p>

      {/* CTAs */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Details
        </button>
        <button
          onClick={onConfirm}
          disabled={!result.can_proceed}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-medium transition-all shadow-[var(--shadow-press)] active:translate-y-px",
            result.can_proceed
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(354_65%_22%)]"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {result.can_proceed ? (
            <>
              Create Project
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            "Resolve Critical Issues First"
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EMPTY_ECOM: EcomFields = {
  product_name: "",
  selling_price: "",
  cost_of_goods: "",
  inventory_units: "",
  monthly_fixed_costs: "",
  monthly_marketing_budget: "",
  business_stage: "launch",
  brand_positioning: "mid-range",
  brand_voice_tone: "friendly",
}

const EMPTY_REST: RestaurantFields = {
  restaurant_name: "",
  cuisine_type: "",
  seating_capacity: "",
  average_check_per_person: "",
  daily_operating_hours: "",
  avg_table_turn_minutes: "",
  food_cost_percentage: "",
  monthly_fixed_costs: "",
  service_type: "both",
}

export default function ProjectCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [domain, setDomain] = useState<(typeof DOMAINS)[number]["key"] | null>(null)
  const [ecomData, setEcomData] = useState<EcomFields>(EMPTY_ECOM)
  const [restData, setRestData] = useState<RestaurantFields>(EMPTY_REST)
  const [result, setResult] = useState<FinancialResult | null>(null)
  const [error, setError] = useState("")

  function handleDomainSelect(d: (typeof DOMAINS)[number]["key"]) {
    setDomain(d)
    setStep(2)
  }

  function handleFormSubmit() {
    setError("")
    try {
      let r: FinancialResult
      if (domain === "ecommerce") {
        r = financialEngine.analyze("ECOMMERCE", {
          selling_price: Number(ecomData.selling_price),
          cost_of_goods: Number(ecomData.cost_of_goods),
          monthly_fixed_costs: Number(ecomData.monthly_fixed_costs),
          monthly_marketing_budget: Number(ecomData.monthly_marketing_budget),
        })
      } else if (domain === "restaurant") {
        r = financialEngine.analyze("RESTAURANT", {
          seating_capacity: Number(restData.seating_capacity),
          avg_table_turn_minutes: Number(restData.avg_table_turn_minutes),
          daily_operating_hours: Number(restData.daily_operating_hours),
          average_check_per_person: Number(restData.average_check_per_person),
          food_cost_percentage: Number(restData.food_cost_percentage),
          monthly_fixed_costs: Number(restData.monthly_fixed_costs),
        })
      } else if (domain === "services") {
        r = financialEngine.analyze("SERVICES", {
          hourly_rate: 200,
          monthly_hours_capacity: 160,
          current_utilization_pct: 55,
          monthly_fixed_costs: 10000,
        })
      } else {
        r = financialEngine.analyze("REAL_ESTATE", {
          avg_deal_value: 500000,
          commission_rate: 2,
          monthly_transactions: 3,
          monthly_fixed_costs: 12000,
        })
      }
      setResult(r)
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please fill all required fields.")
    }
  }

  function handleConfirm() {
    // In a real app: POST /api/projects, then navigate to /dashboard
    navigate("/dashboard")
  }

  const selectedDomain = DOMAINS.find((d) => d.key === domain)
  const projectName =
    domain === "ecommerce"
      ? ecomData.product_name || "New Project"
      : domain === "restaurant"
      ? restData.restaurant_name || "New Project"
      : "New Project"

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "var(--gradient-paper)" }}>
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Dashboard
        </button>
        <div className="flex-1" />
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  step > s
                    ? "bg-green-500 text-white"
                    : step === s
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 3 && <div className={cn("w-8 h-px", step > s ? "bg-green-500" : "bg-border")} />}
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* ── Step 1: Domain ── */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Choose Your Business Domain
              </h1>
              <p className="text-muted-foreground">
                اختر نوع نشاطك التجاري — سيحدد هذا الخوارزمية المالية المستخدمة في التحليل
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {DOMAINS.map((d) => {
                const Icon = d.icon
                return (
                  <button
                    key={d.key}
                    onClick={() => handleDomainSelect(d.key)}
                    className="relative overflow-hidden rounded-sm p-6 text-left transition-all duration-300 group hover:scale-[1.02] hover:shadow-[var(--shadow-editorial)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-90",
                        d.gradient,
                      )}
                    />
                    {/* grain texture */}
                    <div className="absolute inset-0 grain" />
                    <div className="relative space-y-3">
                      <Icon className="w-8 h-8 text-white/90" />
                      <div>
                        <p className="font-display text-lg font-bold text-white">{d.label}</p>
                        <p className="text-white/60 text-xs font-mono-ed" dir="rtl">
                          {d.labelAr}
                        </p>
                      </div>
                      <p className="text-white/70 text-sm">{d.desc}</p>
                    </div>
                    <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: Domain form ── */}
        {step === 2 && selectedDomain && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-sm flex items-center justify-center bg-gradient-to-br",
                  selectedDomain.gradient,
                )}
              >
                <selectedDomain.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {selectedDomain.label} Details
                </h1>
                <p className="text-sm text-muted-foreground" dir="rtl">
                  {selectedDomain.labelAr} · أدخل بيانات نشاطك
                </p>
              </div>
            </div>

            {domain === "ecommerce" && (
              <EcommerceForm data={ecomData} onChange={setEcomData} />
            )}
            {domain === "restaurant" && (
              <RestaurantForm data={restData} onChange={setRestData} />
            )}
            {(domain === "services" || domain === "real_estate") && (
              <div className="rounded-sm border border-dashed border-border p-8 text-center text-muted-foreground space-y-2">
                <Briefcase className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm">
                  {selectedDomain.label} detailed form coming soon.
                </p>
                <p className="text-xs">We'll run a demo analysis for now.</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleFormSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-6 py-2.5 text-sm font-medium shadow-[var(--shadow-press)] active:translate-y-px hover:bg-[hsl(354_65%_22%)] transition-all"
              >
                Analyse Financials
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 3 && result && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Financial Analysis
              </h1>
              <p className="text-sm text-muted-foreground">{projectName}</p>
            </div>
            <FinancialResultCard
              result={result}
              domain={selectedDomain?.label ?? domain ?? ""}
              name={projectName}
              onConfirm={handleConfirm}
              onBack={() => setStep(2)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
