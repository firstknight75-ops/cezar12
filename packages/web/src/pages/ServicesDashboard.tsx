import { useState } from "react"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import {
  Wrench,
  TrendingUp,
  DollarSign,
  BarChart2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// ─── Mock data ────────────────────────────────────────────────────────────────

const CAPACITY = {
  hourly_rate: 350,
  monthly_hours_capacity: 160,
  current_utilization_pct: 38,
  monthly_fixed_costs: 25_000,
  break_even_utilization: 44.6,
  current_revenue: 21_280,
  max_revenue: 56_000,
  revenue_gap: 34_720,
}

const RATE_LADDER = [
  { rate: 250, utilization_needed: 62.5, monthly_revenue: 40_000, feasible: true },
  { rate: 300, utilization_needed: 52.1, monthly_revenue: 40_000, feasible: true },
  { rate: 350, utilization_needed: 44.6, monthly_revenue: 40_000, feasible: true },
  { rate: 400, utilization_needed: 39.1, monthly_revenue: 40_000, feasible: true },
  { rate: 450, utilization_needed: 34.7, monthly_revenue: 40_000, feasible: true },
  { rate: 500, utilization_needed: 31.3, monthly_revenue: 40_000, feasible: true },
]

const REVENUE_SCENARIOS = [
  { utilization: 20, revenue: 11_200, label: "20%" },
  { utilization: 30, revenue: 16_800, label: "30%" },
  { utilization: 38, revenue: 21_280, label: "38% ← Now", current: true },
  { utilization: 50, revenue: 28_000, label: "50%" },
  { utilization: 60, revenue: 33_600, label: "60%" },
  { utilization: 75, revenue: 42_000, label: "75%" },
  { utilization: 90, revenue: 50_400, label: "90%" },
]

const PIPELINE = [
  { stage: "Prospect",    stageAr: "مبدئي",    count: 12, value: 84_000,  probability: 15 },
  { stage: "Qualified",   stageAr: "مؤهَّل",   count: 7,  value: 49_000,  probability: 35 },
  { stage: "Proposal",    stageAr: "عرض أولي", count: 4,  value: 56_000,  probability: 55 },
  { stage: "Negotiation", stageAr: "تفاوض",    count: 2,  value: 28_000,  probability: 75 },
  { stage: "Won",         stageAr: "مُغلق",    count: 1,  value: 14_000,  probability: 100 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(0)
}

// ─── Tab 1: Capacity Analysis ─────────────────────────────────────────────────

function CapacityTab() {
  const c = CAPACITY
  const isUnderBreakEven = c.current_utilization_pct < c.break_even_utilization

  return (
    <div className="space-y-6">
      {isUnderBreakEven && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            Current utilization ({c.current_utilization_pct}%) is below break-even ({c.break_even_utilization}%).
            Increase billable hours or reduce fixed costs.
          </p>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Hourly Rate",         value: `SAR ${c.hourly_rate}` },
          { label: "Monthly Capacity",    value: `${c.monthly_hours_capacity}h` },
          { label: "Utilization",         value: `${c.current_utilization_pct}%`,
            warn: c.current_utilization_pct < c.break_even_utilization },
          { label: "Revenue Gap",         value: `SAR ${fmt(c.revenue_gap)}`, warn: true },
        ].map((k) => (
          <div key={k.label} className="bg-muted/50 rounded-sm p-4">
            <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-xl font-bold font-mono-ed", k.warn ? "text-red-600" : "text-foreground")}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Utilization gauge */}
      <div>
        <div className="flex justify-between text-xs font-mono-ed text-muted-foreground mb-2">
          <span>Utilization</span>
          <span>{c.current_utilization_pct}% of {c.monthly_hours_capacity}h capacity</span>
        </div>
        <div className="relative h-5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${c.current_utilization_pct}%` }}
          />
          {/* Break-even line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
            style={{ left: `${c.break_even_utilization}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0%</span>
          <span className="text-red-500">Break-even: {c.break_even_utilization}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Revenue scenario chart */}
      <div>
        <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground mb-4">
          Revenue at Different Utilization Levels
        </p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_SCENARIOS} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${fmt(v)}`} />
              <Tooltip
                formatter={(v: number) => [`SAR ${fmt(v)}`, "Revenue"]}
                contentStyle={{ fontSize: 12 }}
              />
              <ReferenceLine y={c.monthly_fixed_costs} stroke="#ef4444" strokeDasharray="4 3" label={{ value: "Break-even", fontSize: 10, fill: "#ef4444" }} />
              <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
                {REVENUE_SCENARIOS.map((s, i) => (
                  <Cell key={i} fill={s.current ? "#9b2335" : "#e07b39"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2: Rate Ladder ───────────────────────────────────────────────────────

function RateLadderTab() {
  const breakEvenTarget = CAPACITY.monthly_fixed_costs
  const currentRate = CAPACITY.hourly_rate

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        At what hourly rate do you hit break-even, and at what utilization? Use this to negotiate
        pricing and set monthly hour targets.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Hourly Rate", "Hours Needed (Break-even)", "Monthly Revenue Potential", "Vs. Current"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {RATE_LADDER.map((row) => {
              const hoursNeeded = Math.ceil(breakEvenTarget / row.rate)
              const maxRevenue = row.rate * CAPACITY.monthly_hours_capacity
              const isCurrent = row.rate === currentRate
              return (
                <tr key={row.rate} className={cn("hover:bg-muted/30 transition-colors", isCurrent && "bg-[hsl(var(--primary)/0.05)]")}>
                  <td className="py-3 px-3">
                    <span className={cn("font-mono-ed font-bold", isCurrent ? "text-[hsl(var(--primary))]" : "text-foreground")}>
                      SAR {row.rate}/hr
                    </span>
                    {isCurrent && (
                      <span className="ml-2 text-[10px] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-1.5 py-0.5 rounded-sm font-mono-ed">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono-ed text-foreground">
                    {hoursNeeded}h
                    <span className="text-xs text-muted-foreground ml-1">
                      ({((hoursNeeded / CAPACITY.monthly_hours_capacity) * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono-ed text-foreground">SAR {fmt(maxRevenue)}</td>
                  <td className={cn("py-3 px-3 font-mono-ed font-semibold", row.rate > currentRate ? "text-green-600" : row.rate < currentRate ? "text-red-500" : "text-muted-foreground")}>
                    {row.rate > currentRate ? `+SAR ${row.rate - currentRate}/hr` : row.rate < currentRate ? `-SAR ${currentRate - row.rate}/hr` : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Rate trend chart */}
      <div>
        <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground mb-4">
          Max Monthly Revenue by Rate (at 100% utilization)
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={RATE_LADDER.map((r) => ({ rate: `SAR ${r.rate}`, max: r.rate * CAPACITY.monthly_hours_capacity }))}
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="rate" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
              <Tooltip formatter={(v: number) => [`SAR ${fmt(v)}`, "Max Revenue"]} contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="max" stroke="#9b2335" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: Pipeline ──────────────────────────────────────────────────────────

function PipelineTab() {
  const weightedTotal = PIPELINE.reduce((sum, s) => sum + (s.value * s.probability) / 100, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total Pipeline Value",    value: `SAR ${fmt(PIPELINE.reduce((s, r) => s + r.value, 0))}` },
          { label: "Weighted (Probability)",  value: `SAR ${fmt(weightedTotal)}` },
          { label: "Total Opportunities",     value: `${PIPELINE.reduce((s, r) => s + r.count, 0)}` },
        ].map((k) => (
          <div key={k.label} className="bg-muted/50 rounded-sm p-4">
            <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
            <p className="text-xl font-bold font-mono-ed text-foreground">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline funnel */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={PIPELINE} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 80 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => [`SAR ${fmt(v)}`, "Value"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[0, 2, 2, 0]}>
              {PIPELINE.map((_, i) => {
                const colors = ["#e07b39", "#c4a882", "#9b6b7a", "#6b4c8a", "#9b2335"]
                return <Cell key={i} fill={colors[i]} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Stage", "Deals", "Value", "Probability", "Weighted Value"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {PIPELINE.map((row) => (
              <tr key={row.stage} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-3">
                  <p className="font-medium text-foreground">{row.stage}</p>
                  <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">{row.stageAr}</p>
                </td>
                <td className="py-3 px-3 font-mono-ed text-foreground">{row.count}</td>
                <td className="py-3 px-3 font-mono-ed text-foreground">SAR {fmt(row.value)}</td>
                <td className={cn("py-3 px-3 font-mono-ed font-semibold",
                  row.probability >= 75 ? "text-green-600" : row.probability >= 50 ? "text-amber-600" : "text-muted-foreground")}>
                  {row.probability}%
                </td>
                <td className="py-3 px-3 font-mono-ed text-foreground">
                  SAR {fmt((row.value * row.probability) / 100)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type TabId = "capacity" | "rates" | "pipeline"

const TABS: Array<{ id: TabId; label: string; labelAr: string; icon: React.ElementType }> = [
  { id: "capacity", label: "Capacity Analysis",  labelAr: "تحليل الطاقة",        icon: BarChart2  },
  { id: "rates",    label: "Rate Ladder",         labelAr: "سلّم التسعير",         icon: DollarSign },
  { id: "pipeline", label: "Pipeline Health",     labelAr: "صحة خط الأعمال",       icon: TrendingUp },
]

export default function ServicesDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("capacity")
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
          <Wrench className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="font-display text-base font-semibold text-foreground">Services Intelligence</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono-ed" dir="rtl">ذكاء الخدمات</span>
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
              {activeTab === "capacity" && "Billable hours vs. capacity, break-even utilization, and revenue gap to potential."}
              {activeTab === "rates"    && "Hourly rate scenarios — hours needed to break even and maximum revenue potential."}
              {activeTab === "pipeline" && "Deal pipeline by stage with weighted probability and total forecast value."}
            </p>
            <span className="text-xs font-mono-ed text-muted-foreground" dir="rtl">· {tab.labelAr}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          {activeTab === "capacity" && <CapacityTab />}
          {activeTab === "rates"    && <RateLadderTab />}
          {activeTab === "pipeline" && <PipelineTab />}
        </div>
      </main>
    </div>
  )
}
