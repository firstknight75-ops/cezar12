import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import { Building2, TrendingUp, DollarSign, Map, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// ─── Mock data ────────────────────────────────────────────────────────────────

const PIPELINE_DEALS = [
  { stage: "Lead",        stageAr: "عميل محتمل",  count: 18, value: 126_000_000, pct: 10 },
  { stage: "Viewing",     stageAr: "معاينة",       count: 9,  value: 63_000_000,  pct: 25 },
  { stage: "Offer",       stageAr: "عرض",          count: 4,  value: 56_000_000,  pct: 55 },
  { stage: "Due Diligence", stageAr: "فحص قانوني", count: 2,  value: 28_000_000,  pct: 75 },
  { stage: "Closed",      stageAr: "مُغلق",        count: 1,  value: 14_000_000,  pct: 100 },
]

const COMMISSION_TRACKER = [
  { month: "Jan", earned: 84_000,  target: 120_000 },
  { month: "Feb", earned: 102_000, target: 120_000 },
  { month: "Mar", earned: 97_000,  target: 120_000 },
  { month: "Apr", earned: 138_000, target: 120_000 },
  { month: "May", earned: 115_000, target: 120_000 },
  { month: "Jun", earned: 154_000, target: 120_000 },
]

const PROPERTY_TYPES = [
  { type: "Residential Villa", typeAr: "فيلا سكنية",   deals: 14, avg_deal: 3_200_000, commission_rate: 2.5, total_commission: 1_120_000 },
  { type: "Apartment",         typeAr: "شقة",            deals: 23, avg_deal: 850_000,   commission_rate: 2,   total_commission: 391_000 },
  { type: "Commercial Office", typeAr: "مكتب تجاري",    deals: 6,  avg_deal: 2_100_000,  commission_rate: 3,   total_commission: 378_000 },
  { type: "Land",              typeAr: "أرض",            deals: 4,  avg_deal: 4_500_000,  commission_rate: 2,   total_commission: 360_000 },
  { type: "Retail",            typeAr: "محل تجاري",     deals: 3,  avg_deal: 1_800_000,  commission_rate: 3,   total_commission: 162_000 },
]

const MARKET_INDEX = [
  { area: "Al Olaya",     areaAr: "العليا",      score: 82, trend: "+4.2%", type: "Residential" },
  { area: "King Abdullah", areaAr: "الملك عبدالله", score: 91, trend: "+7.8%", type: "Commercial" },
  { area: "Al Nakheel",   areaAr: "النخيل",      score: 74, trend: "+2.1%", type: "Residential" },
  { area: "Al Malaz",     areaAr: "الملز",        score: 68, trend: "-1.3%", type: "Residential" },
  { area: "KAFD",         areaAr: "مركز الملك عبدالله", score: 95, trend: "+12.4%", type: "Commercial" },
  { area: "Al Rabwah",    areaAr: "الربوة",       score: 77, trend: "+3.5%", type: "Residential" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(0)
}

// ─── Tab 1: Deal Pipeline ─────────────────────────────────────────────────────

function PipelineTab() {
  const totalValue    = PIPELINE_DEALS.reduce((s, r) => s + r.value, 0)
  const weightedValue = PIPELINE_DEALS.reduce((s, r) => s + (r.value * r.pct) / 100, 0)
  const totalDeals    = PIPELINE_DEALS.reduce((s, r) => s + r.count, 0)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Pipeline Value",      value: `SAR ${fmt(totalValue)}` },
          { label: "Weighted Forecast",   value: `SAR ${fmt(weightedValue)}` },
          { label: "Active Deals",        value: String(totalDeals) },
        ].map((k) => (
          <div key={k.label} className="bg-muted/50 rounded-sm p-4">
            <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
            <p className="text-xl font-bold font-mono-ed text-foreground">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel bars */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={PIPELINE_DEALS} layout="vertical" margin={{ top: 4, right: 80, bottom: 4, left: 90 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => [`SAR ${fmt(v)}`, "Deal Value"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[0, 2, 2, 0]}>
              {PIPELINE_DEALS.map((_, i) => {
                const colors = ["#e07b39", "#c49b72", "#9b7b8a", "#6b5b8a", "#9b2335"]
                return <Cell key={i} fill={colors[i]} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stage table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Stage", "Deals", "Total Value", "Probability", "Weighted"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {PIPELINE_DEALS.map((row) => (
              <tr key={row.stage} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-3">
                  <p className="font-medium text-foreground">{row.stage}</p>
                  <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">{row.stageAr}</p>
                </td>
                <td className="py-3 px-3 font-mono-ed text-foreground">{row.count}</td>
                <td className="py-3 px-3 font-mono-ed text-foreground">SAR {fmt(row.value)}</td>
                <td className={cn("py-3 px-3 font-mono-ed font-semibold",
                  row.pct >= 75 ? "text-green-600" : row.pct >= 50 ? "text-amber-600" : "text-muted-foreground")}>
                  {row.pct}%
                </td>
                <td className="py-3 px-3 font-mono-ed text-foreground">
                  SAR {fmt((row.value * row.pct) / 100)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab 2: Commission Tracker ────────────────────────────────────────────────

function CommissionTab() {
  const totalEarned = COMMISSION_TRACKER.reduce((s, r) => s + r.earned, 0)
  const totalTarget = COMMISSION_TRACKER.reduce((s, r) => s + r.target, 0)
  const attainment  = ((totalEarned / totalTarget) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "YTD Earned",     value: `SAR ${fmt(totalEarned)}` },
          { label: "YTD Target",     value: `SAR ${fmt(totalTarget)}` },
          { label: "Attainment",     value: `${attainment}%`, highlight: Number(attainment) >= 100 },
        ].map((k) => (
          <div key={k.label} className="bg-muted/50 rounded-sm p-4">
            <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-xl font-bold font-mono-ed", k.highlight ? "text-green-600" : "text-foreground")}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly trend */}
      <div>
        <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground mb-4">
          Monthly Commission: Earned vs. Target
        </p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={COMMISSION_TRACKER} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
              <Tooltip
                formatter={(v: number, name: string) => [`SAR ${fmt(v)}`, name === "earned" ? "Earned" : "Target"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="target" />
              <Line type="monotone" dataKey="earned" stroke="#9b2335" strokeWidth={2} dot={{ r: 3 }} name="earned" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Property type breakdown */}
      <div>
        <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground mb-4">
          Commission by Property Type
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["Property Type", "Deals", "Avg. Value", "Rate", "Total Commission"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {PROPERTY_TYPES.map((row) => (
                <tr key={row.type} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-medium text-foreground">{row.type}</p>
                    <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">{row.typeAr}</p>
                  </td>
                  <td className="py-3 px-3 font-mono-ed text-foreground">{row.deals}</td>
                  <td className="py-3 px-3 font-mono-ed text-foreground">SAR {fmt(row.avg_deal)}</td>
                  <td className="py-3 px-3 font-mono-ed text-foreground">{row.commission_rate}%</td>
                  <td className="py-3 px-3 font-mono-ed font-semibold text-[hsl(var(--primary))]">
                    SAR {fmt(row.total_commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: Market Index ──────────────────────────────────────────────────────

function MarketIndexTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Area-level demand index (0–100) and 6-month price trend for key Riyadh districts.
        Higher score = stronger buyer demand and transaction velocity.
      </p>

      {/* Scores bar chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MARKET_INDEX} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <XAxis dataKey="area" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: number) => [`${v} / 100`, "Demand Score"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="score" radius={[2, 2, 0, 0]}>
              {MARKET_INDEX.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.score >= 85 ? "#16a34a" : entry.score >= 70 ? "#9b2335" : "#d97706"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Area table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Area", "Type", "Demand Score", "6M Trend", "Signal"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {MARKET_INDEX.sort((a, b) => b.score - a.score).map((row) => {
              const isPositive = row.trend.startsWith("+")
              const signal = row.score >= 85 ? { label: "Buy", cls: "bg-green-100 text-green-700" }
                : row.score >= 70 ? { label: "Hold", cls: "bg-amber-100 text-amber-700" }
                : { label: "Watch", cls: "bg-red-100 text-red-600" }
              return (
                <tr key={row.area} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-medium text-foreground">{row.area}</p>
                    <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">{row.areaAr}</p>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{row.type}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono-ed text-foreground">{row.score}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-16">
                        <div
                          className={cn("h-full rounded-full", row.score >= 85 ? "bg-green-500" : row.score >= 70 ? "bg-[hsl(var(--primary))]" : "bg-amber-400")}
                          style={{ width: `${row.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={cn("py-3 px-3 font-mono-ed font-semibold text-sm",
                    isPositive ? "text-green-600" : "text-red-600")}>
                    {row.trend}
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn("inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-sm", signal.cls)}>
                      {signal.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type TabId = "pipeline" | "commission" | "market"

const TABS: Array<{ id: TabId; label: string; labelAr: string; icon: React.ElementType }> = [
  { id: "pipeline",   label: "Deal Pipeline",       labelAr: "خط الصفقات",        icon: TrendingUp  },
  { id: "commission", label: "Commission Tracker",   labelAr: "متتبع العمولات",     icon: DollarSign  },
  { id: "market",     label: "Market Index",         labelAr: "مؤشر السوق",         icon: Map         },
]

export default function RealEstateDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("pipeline")
  const navigate = useNavigate()
  const tab = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] font-sans">
      <header className="h-14 border-b border-border bg-card px-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <span className="text-border/60">|</span>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="font-display text-base font-semibold text-foreground">
            Real Estate Intelligence
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono-ed" dir="rtl">ذكاء العقارات</span>
      </header>

      <div className="border-b border-border bg-card/50 px-6">
        <div className="flex gap-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all",
                activeTab === id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-foreground">{tab.label}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              {activeTab === "pipeline"   && "Active deals by stage, weighted pipeline value, and probability-adjusted forecast."}
              {activeTab === "commission" && "Monthly commission earned vs. target, and breakdown by property type."}
              {activeTab === "market"     && "Area-level demand scores and 6-month price trends across key districts."}
            </p>
            <span className="text-xs font-mono-ed text-muted-foreground" dir="rtl">· {tab.labelAr}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          {activeTab === "pipeline"   && <PipelineTab />}
          {activeTab === "commission" && <CommissionTab />}
          {activeTab === "market"     && <MarketIndexTab />}
        </div>
      </main>
    </div>
  )
}
