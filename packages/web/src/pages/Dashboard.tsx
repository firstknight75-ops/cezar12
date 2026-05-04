import { useState } from "react"
import {
  ShoppingCart,
  Wrench,
  UtensilsCrossed,
  Building2,
  Zap,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  ChevronRight,
  Plus,
} from "lucide-react"
import { financialEngine, type FinancialResult, type Domain } from "@/lib/financial-engine"
import { SERVICES, servicesForDomain, type DomainKey, type PlanName } from "@/lib/service-catalog"
import { useTokens } from "@/hooks/use-tokens"
import TokenWidget from "@/components/tokens/TokenWidget"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectStatus = "strategy_ready" | "producing" | "draft"

type MockProject = {
  id: string
  name: string
  nameAr: string
  domain: Domain
  domainKey: DomainKey
  plan: PlanName
  status: ProjectStatus
  result: FinancialResult
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: MockProject[] = [
  {
    id: "proj-1",
    name: "Najd Kitchen",
    nameAr: "مطبخ نجد",
    domain: "RESTAURANT",
    domainKey: "restaurant",
    plan: "gold",
    status: "strategy_ready",
    result: financialEngine.analyze("RESTAURANT", {
      seating_capacity: 60,
      avg_table_turn_minutes: 45,
      daily_operating_hours: 12,
      average_check_per_person: 85,
      food_cost_percentage: 35,
      monthly_fixed_costs: 55000,
    }),
  },
  {
    id: "proj-2",
    name: "Gulf Store",
    nameAr: "متجر الخليج",
    domain: "ECOMMERCE",
    domainKey: "ecommerce",
    plan: "silver",
    status: "strategy_ready",
    result: financialEngine.analyze("ECOMMERCE", {
      selling_price: 250,
      cost_of_goods: 110,
      monthly_fixed_costs: 18000,
      monthly_marketing_budget: 7000,
    }),
  },
  {
    id: "proj-3",
    name: "Apex Consulting",
    nameAr: "أبيكس للاستشارات",
    domain: "SERVICES",
    domainKey: "services",
    plan: "platinum",
    status: "producing",
    result: financialEngine.analyze("SERVICES", {
      hourly_rate: 350,
      monthly_hours_capacity: 160,
      current_utilization_pct: 38,
      monthly_fixed_costs: 25000,
    }),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOMAIN_ICON: Record<Domain, React.ElementType> = {
  RESTAURANT: UtensilsCrossed,
  ECOMMERCE: ShoppingCart,
  SERVICES: Wrench,
  REAL_ESTATE: Building2,
}

const DOMAIN_LABEL: Record<Domain, string> = {
  RESTAURANT: "Restaurant",
  ECOMMERCE: "E-Commerce",
  SERVICES: "Services",
  REAL_ESTATE: "Real Estate",
}

const RISK_COLOR: Record<FinancialResult["risk_level"], string> = {
  CRITICAL: "text-red-600",
  HIGH: "text-orange-500",
  MEDIUM: "text-amber-500",
  LOW: "text-green-500",
}

const RISK_BG: Record<FinancialResult["risk_level"], string> = {
  CRITICAL: "bg-red-50 border-red-200",
  HIGH: "bg-orange-50 border-orange-200",
  MEDIUM: "bg-amber-50 border-amber-200",
  LOW: "bg-green-50 border-green-200",
}

const RISK_BAR: Record<FinancialResult["risk_level"], string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-green-500",
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  strategy_ready: "Ready",
  producing: "Generating",
  draft: "Draft",
}

const STATUS_CLS: Record<ProjectStatus, string> = {
  strategy_ready: "bg-green-100 text-green-700",
  producing: "bg-amber-100 text-amber-700",
  draft: "bg-muted text-muted-foreground",
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(0)
}

// ─── Project sidebar card ──────────────────────────────────────────────────────

function ProjectCard({
  project,
  selected,
  onClick,
}: {
  project: MockProject
  selected: boolean
  onClick: () => void
}) {
  const Icon = DOMAIN_ICON[project.domain]
  const { risk_level } = project.result
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border rounded-sm transition-all group",
        selected
          ? "border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.04)] shadow-sm"
          : "border-border bg-card hover:border-[hsl(var(--primary)/0.25)] hover:bg-[hsl(var(--primary)/0.02)]",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5",
            selected ? "bg-[hsl(var(--primary)/0.1)]" : "bg-muted",
          )}
        >
          <Icon
            className={cn("w-4 h-4", selected ? "text-[hsl(var(--primary))]" : "text-muted-foreground")}
          />
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 flex-shrink-0 transition-transform",
                selected ? "text-[hsl(var(--primary))] translate-x-0.5" : "text-muted-foreground/40",
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">
            {project.nameAr}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-sm",
                RISK_COLOR[risk_level],
                risk_level === "CRITICAL"
                  ? "bg-red-50"
                  : risk_level === "HIGH"
                    ? "bg-orange-50"
                    : risk_level === "MEDIUM"
                      ? "bg-amber-50"
                      : "bg-green-50",
              )}
            >
              {risk_level}
            </span>
            <span
              className={cn(
                "inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm",
                STATUS_CLS[project.status],
              )}
            >
              {STATUS_LABEL[project.status]}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Financial health card ────────────────────────────────────────────────────

function FinancialHealthCard({ project }: { project: MockProject }) {
  const { result } = project
  const { risk_level, financial_score, metrics } = result

  const metricEntries = Object.entries(metrics)
    .filter(([, v]) => v !== -1)
    .slice(0, 4)

  const metricLabel: Record<string, string> = {
    gross_margin_pct: "Gross Margin",
    break_even_units: "Break-even Units",
    marketing_pct: "Marketing %",
    contribution_per_unit: "Contribution / Unit",
    monthly_revenue_potential: "Revenue Potential",
    current_revenue: "Current Revenue",
    break_even_utilization: "Break-even Util.",
    current_utilization_pct: "Utilization",
    max_daily_covers: "Max Daily Covers",
    potential_daily_revenue: "Daily Revenue",
    potential_monthly_revenue: "Monthly Revenue",
    food_cost_percentage: "Food Cost %",
    monthly_fixed_costs: "Fixed Costs",
    commission_per_deal: "Commission / Deal",
    monthly_commission: "Monthly Commission",
    break_even_deals: "Break-even Deals",
    buffer_pct: "Safety Buffer",
  }

  const metricUnit: Record<string, string> = {
    gross_margin_pct: "%",
    marketing_pct: "%",
    break_even_utilization: "%",
    current_utilization_pct: "%",
    food_cost_percentage: "%",
    buffer_pct: "%",
  }

  return (
    <div className={cn("border rounded-sm p-4 space-y-4", RISK_BG[risk_level])}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground mb-1">
            Financial Health
          </p>
          <div className="flex items-center gap-2">
            <span className={cn("text-xl font-bold font-display", RISK_COLOR[risk_level])}>
              {risk_level}
            </span>
            {risk_level === "CRITICAL" && (
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono-ed text-foreground">{financial_score}</p>
          <p className="text-[10px] text-muted-foreground">/ 100</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="h-2 bg-black/10 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", RISK_BAR[risk_level])}
            style={{ width: `${financial_score}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground font-mono-ed">
          <span>CRITICAL</span>
          <span>HIGH</span>
          <span>MEDIUM</span>
          <span>LOW</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {metricEntries.map(([key, value]) => (
          <div key={key} className="bg-white/60 rounded-sm px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{metricLabel[key] ?? key}</p>
            <p className="text-sm font-semibold font-mono-ed text-foreground">
              {typeof value === "number" ? fmt(value) : value}
              {metricUnit[key] && (
                <span className="text-[10px] text-muted-foreground ml-0.5">{metricUnit[key]}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Top recommendation */}
      {result.recommendations[0] && (
        <div className="border-t border-black/10 pt-3">
          <p className="text-xs text-muted-foreground leading-relaxed" dir="rtl">
            {result.recommendations[0]}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Services grid ─────────────────────────────────────────────────────────────

function ServicesGrid({
  project,
  totalTokens,
}: {
  project: MockProject
  totalTokens: number
}) {
  const available = servicesForDomain(project.domainKey, project.plan)
  const allForDomain = SERVICES.filter(
    (s) => s.domains === "all" || (s.domains as DomainKey[]).includes(project.domainKey),
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground">
          AI Services
        </p>
        <span className="text-[10px] text-muted-foreground">
          {available.length} available on {project.plan}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {allForDomain.map((svc) => {
          const cost = svc.cost[project.plan]
          const isAvailableOnPlan = cost !== null
          const canAfford = cost === null ? false : totalTokens >= cost
          const isFree = cost === 0

          return (
            <button
              key={svc.key}
              type="button"
              disabled={!isAvailableOnPlan}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm border text-left transition-all",
                isAvailableOnPlan
                  ? canAfford || isFree
                    ? "border-border bg-card hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.02)] cursor-pointer"
                    : "border-border bg-card opacity-60 cursor-not-allowed"
                  : "border-dashed border-border/50 bg-muted/30 opacity-40 cursor-not-allowed",
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-medium truncate",
                    isAvailableOnPlan ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {svc.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{svc.description}</p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-1">
                {!isAvailableOnPlan ? (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    Upgrade
                  </span>
                ) : isFree ? (
                  <span className="text-[10px] font-semibold text-green-600 whitespace-nowrap">
                    Free
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[10px] font-mono-ed font-semibold whitespace-nowrap",
                      canAfford ? "text-[hsl(var(--primary))]" : "text-muted-foreground",
                    )}
                  >
                    <Zap className="w-2.5 h-2.5" />
                    {cost}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {project.plan === "silver" && (
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Upgrade to Gold to unlock kitchen intelligence services
        </p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_PROJECTS[0].id)
  const tokenState = useTokens()
  const navigate = useNavigate()

  const selected = MOCK_PROJECTS.find((p) => p.id === selectedId) ?? MOCK_PROJECTS[0]

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] font-sans">
      {/* Top bar */}
      <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[hsl(var(--primary))]" />
          <span className="font-display text-base font-semibold text-foreground">Dashboard</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/projects/new")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium hover:bg-[hsl(354_65%_22%)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* ── Left sidebar ── */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-card/50 flex flex-col">
          <div className="px-4 pt-5 pb-3">
            <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground">
              Projects
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
            {MOCK_PROJECTS.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                selected={p.id === selectedId}
                onClick={() => setSelectedId(p.id)}
              />
            ))}
          </div>

          {/* Token widget at bottom of sidebar */}
          <div className="p-3 border-t border-border">
            <TokenWidget tokenState={tokenState} />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            {/* Project header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const Icon = DOMAIN_ICON[selected.domain]
                    return <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                  })()}
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {selected.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-mono-ed" dir="rtl">
                    {selected.nameAr}
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs text-muted-foreground">
                    {DOMAIN_LABEL[selected.domain]}
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {selected.plan} plan
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-sm font-medium",
                    STATUS_CLS[selected.status],
                  )}
                >
                  {STATUS_LABEL[selected.status]}
                </span>
                {selected.domain === "RESTAURANT" && (
                  <button
                    type="button"
                    onClick={() => navigate("/restaurant")}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm border border-border hover:border-[hsl(var(--primary)/0.4)] transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Kitchen View
                  </button>
                )}
              </div>
            </div>

            {/* Financial health */}
            <FinancialHealthCard project={selected} />

            {/* Services */}
            <ServicesGrid project={selected} totalTokens={tokenState.totalRemaining} />
          </div>
        </main>
      </div>
    </div>
  )
}
