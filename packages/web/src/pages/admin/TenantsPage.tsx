import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ChevronRight, PauseCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

type Plan   = "silver" | "gold" | "platinum"
type Status = "active" | "suspended" | "expired"

interface Tenant {
  id: string
  company: string
  plan: Plan
  status: Status
  tokenBalance: number
  lastActive: string
}

const TENANTS: Tenant[] = [
  { id: "t1",  company: "مطبخ نجد",             plan: "gold",     status: "active",    tokenBalance: 842,  lastActive: "2026-05-05" },
  { id: "t2",  company: "Gulf Store",            plan: "silver",   status: "active",    tokenBalance: 204,  lastActive: "2026-05-05" },
  { id: "t3",  company: "Apex Consulting",       plan: "platinum", status: "active",    tokenBalance: 1943, lastActive: "2026-05-04" },
  { id: "t4",  company: "دار العقارات",          plan: "gold",     status: "suspended", tokenBalance: 0,    lastActive: "2026-04-12" },
  { id: "t5",  company: "Al Faris Logistics",    plan: "silver",   status: "expired",   tokenBalance: 0,    lastActive: "2026-03-28" },
  { id: "t6",  company: "Riyadh Digital Agency", plan: "platinum", status: "active",    tokenBalance: 2187, lastActive: "2026-05-05" },
  { id: "t7",  company: "Bloom Café",            plan: "silver",   status: "active",    tokenBalance: 118,  lastActive: "2026-05-03" },
  { id: "t8",  company: "Cedar Properties",      plan: "gold",     status: "active",    tokenBalance: 617,  lastActive: "2026-05-04" },
  { id: "t9",  company: "Yanbu Tech Partners",   plan: "silver",   status: "suspended", tokenBalance: 0,    lastActive: "2026-04-22" },
  { id: "t10", company: "Medina Retail Co.",     plan: "gold",     status: "active",    tokenBalance: 391,  lastActive: "2026-05-05" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_STYLE: Record<Plan, string> = {
  silver:   "bg-slate-100 text-slate-600 border border-slate-200",
  gold:     "bg-amber-50 text-amber-700 border border-amber-200",
  platinum: "bg-oxblood/8 text-oxblood border border-oxblood/20",
}

const STATUS_STYLE: Record<Status, string> = {
  active:    "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-600",
  expired:   "bg-zinc-100 text-zinc-500",
}

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className={cn("font-mono-ed text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm", PLAN_STYLE[plan])}>
      {plan}
    </span>
  )
}

function StatusPill({ status }: { status: Status }) {
  return (
    <span className={cn("font-mono-ed text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full", STATUS_STYLE[status])}>
      {status}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TenantsPage() {
  const navigate = useNavigate()
  const [query,     setQuery]     = useState("")
  const [planFilter, setPlan]     = useState<Plan | "all">("all")
  const [statusFilter, setStatus] = useState<Status | "all">("all")

  const filtered = useMemo(() => {
    return TENANTS.filter((t) => {
      const matchQ = t.company.toLowerCase().includes(query.toLowerCase())
      const matchP = planFilter   === "all" || t.plan   === planFilter
      const matchS = statusFilter === "all" || t.status === statusFilter
      return matchQ && matchP && matchS
    })
  }, [query, planFilter, statusFilter])

  const handleSuspend = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    navigate(`/admin/tenants/${id}?modal=suspend`)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Tenants</h1>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
          {TENANTS.length} total · {TENANTS.filter(t => t.status === "active").length} active
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company…"
            className="w-full pl-9 pr-3 h-9 text-sm border border-border rounded-sm bg-card focus:outline-none focus:ring-1 focus:ring-oxblood/40"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlan(e.target.value as Plan | "all")}
          className="h-9 px-3 text-sm border border-border rounded-sm bg-card font-mono-ed text-[11px] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-oxblood/40"
        >
          <option value="all">All Plans</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="platinum">Platinum</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value as Status | "all")}
          className="h-9 px-3 text-sm border border-border rounded-sm bg-card font-mono-ed text-[11px] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-oxblood/40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-sm overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {["Company", "Plan", "Status", "Tokens", "Last Active", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  No tenants match your filters.
                </td>
              </tr>
            ) : filtered.map((t, i) => (
              <tr
                key={t.id}
                onClick={() => navigate(`/admin/tenants/${t.id}`)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-secondary/50",
                  i !== filtered.length - 1 && "border-b border-border"
                )}
              >
                <td className="px-4 py-3 font-medium text-foreground">{t.company}</td>
                <td className="px-4 py-3"><PlanBadge plan={t.plan} /></td>
                <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                <td className="px-4 py-3 font-mono-ed text-[12px] text-foreground">
                  {t.tokenBalance.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono-ed text-[11px] text-muted-foreground">{t.lastActive}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/tenants/${t.id}`) }}
                      className="font-mono-ed text-[10px] uppercase tracking-wider text-oxblood hover:underline flex items-center gap-0.5"
                    >
                      Details <ChevronRight className="w-3 h-3" />
                    </button>
                    {t.status === "active" && (
                      <button
                        onClick={(e) => handleSuspend(e, t.id)}
                        className="font-mono-ed text-[10px] uppercase tracking-wider text-red-500 hover:underline flex items-center gap-0.5"
                      >
                        <PauseCircle className="w-3 h-3" /> Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
