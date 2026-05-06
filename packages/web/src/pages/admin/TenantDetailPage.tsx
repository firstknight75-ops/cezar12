import { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, CreditCard, Activity, ClipboardList,
  X, AlertTriangle,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

type Plan   = "silver" | "gold" | "platinum"
type Status = "active" | "suspended" | "expired"

interface TenantDetail {
  id: string
  company: string
  plan: Plan
  status: Status
  joinDate: string
  lastLogin: string
  projectCount: number
  planTokens: number
  addonTokens: number
  cycleEnd: string
  billingCycle: "monthly" | "quarterly" | "annual"
}

const TENANTS: Record<string, TenantDetail> = {
  t1:  { id: "t1",  company: "مطبخ نجد",             plan: "gold",     status: "active",    joinDate: "2025-09-14", lastLogin: "2026-05-05", projectCount: 3,  planTokens: 742,  addonTokens: 100, cycleEnd: "2026-06-14", billingCycle: "monthly" },
  t2:  { id: "t2",  company: "Gulf Store",            plan: "silver",   status: "active",    joinDate: "2025-11-02", lastLogin: "2026-05-05", projectCount: 1,  planTokens: 204,  addonTokens: 0,   cycleEnd: "2026-06-02", billingCycle: "monthly" },
  t3:  { id: "t3",  company: "Apex Consulting",       plan: "platinum", status: "active",    joinDate: "2025-08-19", lastLogin: "2026-05-04", projectCount: 7,  planTokens: 1743, addonTokens: 200, cycleEnd: "2026-08-19", billingCycle: "annual"  },
  t4:  { id: "t4",  company: "دار العقارات",          plan: "gold",     status: "suspended", joinDate: "2025-10-05", lastLogin: "2026-04-12", projectCount: 2,  planTokens: 0,    addonTokens: 0,   cycleEnd: "2026-05-05", billingCycle: "monthly" },
  t5:  { id: "t5",  company: "Al Faris Logistics",    plan: "silver",   status: "expired",   joinDate: "2025-07-30", lastLogin: "2026-03-28", projectCount: 1,  planTokens: 0,    addonTokens: 0,   cycleEnd: "2026-03-30", billingCycle: "monthly" },
  t6:  { id: "t6",  company: "Riyadh Digital Agency", plan: "platinum", status: "active",    joinDate: "2025-06-11", lastLogin: "2026-05-05", projectCount: 12, planTokens: 2187, addonTokens: 0,   cycleEnd: "2026-09-11", billingCycle: "quarterly"},
  t7:  { id: "t7",  company: "Bloom Café",            plan: "silver",   status: "active",    joinDate: "2026-01-15", lastLogin: "2026-05-03", projectCount: 1,  planTokens: 118,  addonTokens: 0,   cycleEnd: "2026-06-15", billingCycle: "monthly" },
  t8:  { id: "t8",  company: "Cedar Properties",      plan: "gold",     status: "active",    joinDate: "2025-12-01", lastLogin: "2026-05-04", projectCount: 4,  planTokens: 617,  addonTokens: 0,   cycleEnd: "2026-06-01", billingCycle: "monthly" },
  t9:  { id: "t9",  company: "Yanbu Tech Partners",   plan: "silver",   status: "suspended", joinDate: "2026-02-20", lastLogin: "2026-04-22", projectCount: 1,  planTokens: 0,    addonTokens: 0,   cycleEnd: "2026-05-20", billingCycle: "monthly" },
  t10: { id: "t10", company: "Medina Retail Co.",     plan: "gold",     status: "active",    joinDate: "2025-10-18", lastLogin: "2026-05-05", projectCount: 5,  planTokens: 391,  addonTokens: 0,   cycleEnd: "2026-06-18", billingCycle: "monthly" },
}

const DAY_TOKENS = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  tokens: Math.floor(Math.random() * 80 + 5),
}))

const SERVICE_BREAKDOWN = [
  { name: "Growth Plan", value: 38 },
  { name: "Marketing", value: 24 },
  { name: "Kitchen Intel", value: 18 },
  { name: "Competitor Analysis", value: 12 },
  { name: "Other", value: 8 },
]

const AUDIT_ROWS = [
  { ts: "2026-05-05 14:32", action: "Generated Growth Plan", ip: "197.32.44.21" },
  { ts: "2026-05-04 09:11", action: "Created project #3", ip: "197.32.44.21" },
  { ts: "2026-05-03 16:44", action: "Approved AI result #12", ip: "197.32.44.21" },
  { ts: "2026-05-02 11:20", action: "Purchased 200 token addon", ip: "197.32.44.99" },
  { ts: "2026-05-01 08:05", action: "Updated company profile", ip: "197.32.44.21" },
  { ts: "2026-04-30 17:55", action: "Generated Marketing Content", ip: "197.32.44.21" },
]

const PIE_COLORS = ["#7f1d2f", "#d97706", "#6b7280", "#0ea5e9", "#a3a3a3"]

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

// ─── Plan Modal ───────────────────────────────────────────────────────────────

function PlanModal({ tenant, onClose }: { tenant: TenantDetail; onClose: () => void }) {
  const [plan, setPlan]   = useState<Plan>(tenant.plan)
  const [cycle, setCycle] = useState(tenant.billingCycle)
  const [tokens, setTokens] = useState(0)
  const [reason, setReason] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background rounded-sm shadow-2xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-base text-foreground">Plan Management</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Current plan */}
          <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-sm">
            <span className="text-sm text-muted-foreground">Current plan</span>
            <span className={cn("font-mono-ed text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm", PLAN_STYLE[tenant.plan])}>
              {tenant.plan}
            </span>
          </div>

          {/* Change plan */}
          <div className="space-y-1.5">
            <label className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Change Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as Plan)}
              className="w-full h-9 px-3 text-sm border border-border rounded-sm bg-card focus:outline-none focus:ring-1 focus:ring-oxblood/40"
            >
              <option value="silver">Silver — 500 tokens/mo</option>
              <option value="gold">Gold — 1,000 tokens/mo</option>
              <option value="platinum">Platinum — 2,500 tokens/mo</option>
            </select>
          </div>

          {/* Billing cycle */}
          <div className="space-y-1.5">
            <label className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Billing Cycle</label>
            <div className="flex gap-2">
              {(["monthly", "quarterly", "annual"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-mono-ed uppercase tracking-wider rounded-sm border transition-colors",
                    cycle === c ? "bg-oxblood text-cream border-oxblood" : "border-border text-muted-foreground hover:border-oxblood/40"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grant tokens */}
          <div className="space-y-1.5">
            <label className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Grant Extra Tokens
            </label>
            <input
              type="number"
              min={0}
              value={tokens}
              onChange={(e) => setTokens(Number(e.target.value))}
              className="w-full h-9 px-3 text-sm border border-border rounded-sm bg-card focus:outline-none focus:ring-1 focus:ring-oxblood/40"
              placeholder="0"
            />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)…"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-card focus:outline-none focus:ring-1 focus:ring-oxblood/40 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs font-mono-ed uppercase tracking-wider border border-border rounded-sm text-muted-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono-ed uppercase tracking-wider bg-oxblood text-cream rounded-sm hover:bg-ink transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Suspend Modal ────────────────────────────────────────────────────────────

function SuspendModal({ tenant, onClose }: { tenant: TenantDetail; onClose: () => void }) {
  const [reason, setReason] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-background rounded-sm shadow-2xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="font-display text-base">Suspend Tenant</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to suspend <span className="font-medium text-foreground">{tenant.company}</span>. Their access will be revoked immediately.
          </p>

          <div className="space-y-1.5">
            <label className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe reason for suspension…"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-card focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-700">User will be notified by email.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs font-mono-ed uppercase tracking-wider border border-border rounded-sm text-muted-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono-ed uppercase tracking-wider bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Suspend
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab components ───────────────────────────────────────────────────────────

function OverviewTab({ t }: { t: TenantDetail }) {
  const total = t.planTokens + t.addonTokens
  const planMax = t.plan === "silver" ? 500 : t.plan === "gold" ? 1000 : 2500

  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Plan",           value: t.plan.charAt(0).toUpperCase() + t.plan.slice(1) },
        { label: "Billing Cycle",  value: t.billingCycle },
        { label: "Status",         value: t.status },
        { label: "Cycle End",      value: t.cycleEnd },
        { label: "Last Login",     value: t.lastLogin },
        { label: "Projects",       value: String(t.projectCount) },
      ].map(({ label, value }) => (
        <div key={label} className="border border-border rounded-sm p-4 bg-card">
          <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
          <p className="font-display text-sm text-foreground">{value}</p>
        </div>
      ))}

      {/* Token balance */}
      <div className="col-span-2 border border-border rounded-sm p-4 bg-card">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Token Balance</p>
        <div className="flex items-end gap-8 mb-3">
          <div>
            <p className="font-mono-ed text-2xl font-bold text-oxblood">{total.toLocaleString()}</p>
            <p className="font-mono-ed text-[10px] text-muted-foreground">Total remaining</p>
          </div>
          <div>
            <p className="font-mono-ed text-base text-foreground">{t.planTokens.toLocaleString()}</p>
            <p className="font-mono-ed text-[10px] text-muted-foreground">Plan</p>
          </div>
          <div>
            <p className="font-mono-ed text-base text-ember">{t.addonTokens.toLocaleString()}</p>
            <p className="font-mono-ed text-[10px] text-muted-foreground">Addon</p>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-oxblood rounded-full transition-all"
            style={{ width: `${Math.min(100, (total / planMax) * 100)}%` }}
          />
        </div>
        <p className="font-mono-ed text-[10px] text-muted-foreground mt-1">{total} / {planMax} plan tokens</p>
      </div>
    </div>
  )
}

function UsageTab() {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-sm p-4 bg-card">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
          Token Consumption — Last 30 Days
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={DAY_TOKENS} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", border: "1px solid hsl(var(--border))", borderRadius: 2 }}
              cursor={{ fill: "hsl(var(--secondary))" }}
            />
            <Bar dataKey="tokens" fill="hsl(var(--oxblood))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border rounded-sm p-4 bg-card">
          <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
            AI Service Breakdown
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={SERVICE_BREAKDOWN}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                paddingAngle={2}
              >
                {SERVICE_BREAKDOWN.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", border: "1px solid hsl(var(--border))", borderRadius: 2 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border rounded-sm p-4 bg-card">
          <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Service Calls</p>
          <div className="space-y-2">
            {SERVICE_BREAKDOWN.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-xs text-foreground">{s.name}</span>
                </div>
                <span className="font-mono-ed text-[11px] text-muted-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditTab() {
  return (
    <div className="border border-border rounded-sm overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            {["Timestamp", "Action", "IP Address"].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AUDIT_ROWS.map((row, i) => (
            <tr key={i} className={cn("hover:bg-secondary/30 transition-colors", i < AUDIT_ROWS.length - 1 && "border-b border-border")}>
              <td className="px-4 py-3 font-mono-ed text-[11px] text-muted-foreground">{row.ts}</td>
              <td className="px-4 py-3 text-sm text-foreground">{row.action}</td>
              <td className="px-4 py-3 font-mono-ed text-[11px] text-muted-foreground">{row.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "usage" | "audit"

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview",  icon: CreditCard },
  { key: "usage",    label: "Usage",     icon: Activity },
  { key: "audit",    label: "Audit Log", icon: ClipboardList },
]

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const modal = searchParams.get("modal") as "plan" | "suspend" | null

  const tenant = id ? TENANTS[id] : undefined

  useEffect(() => {
    if (searchParams.get("modal") === "suspend") {
      // opened from tenant list
    }
  }, [searchParams])

  const openModal = (m: "plan" | "suspend") => {
    setSearchParams({ modal: m })
  }

  const closeModal = () => {
    setSearchParams({})
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Tenant not found.{" "}
        <button onClick={() => navigate("/admin/tenants")} className="text-oxblood hover:underline">Back to tenants</button>
      </div>
    )
  }

  return (
    <>
      <div className="p-8 max-w-4xl">
        {/* Back */}
        <button
          onClick={() => navigate("/admin/tenants")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-mono-ed text-[11px] uppercase tracking-wider">Tenants</span>
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-foreground">{tenant.company}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn("font-mono-ed text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm", {
                "bg-slate-100 text-slate-600 border border-slate-200":   tenant.plan === "silver",
                "bg-amber-50 text-amber-700 border border-amber-200":    tenant.plan === "gold",
                "bg-oxblood/8 text-oxblood border border-oxblood/20":   tenant.plan === "platinum",
              })}>
                {tenant.plan}
              </span>
              <span className={cn("font-mono-ed text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full", {
                "bg-emerald-50 text-emerald-700": tenant.status === "active",
                "bg-red-50 text-red-600":         tenant.status === "suspended",
                "bg-zinc-100 text-zinc-500":      tenant.status === "expired",
              })}>
                {tenant.status}
              </span>
              <span className="font-mono-ed text-[10px] text-muted-foreground">
                Joined {tenant.joinDate}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openModal("plan")}
              className="px-3 py-1.5 text-xs font-mono-ed uppercase tracking-wider border border-oxblood/30 text-oxblood rounded-sm hover:bg-oxblood/5 transition-colors"
            >
              Change Plan
            </button>
            {tenant.status === "active" && (
              <button
                onClick={() => openModal("suspend")}
                className="px-3 py-1.5 text-xs font-mono-ed uppercase tracking-wider border border-red-200 text-red-600 rounded-sm hover:bg-red-50 transition-colors"
              >
                Suspend
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors",
                activeTab === key
                  ? "border-oxblood text-oxblood"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-mono-ed text-[11px] uppercase tracking-[0.15em]">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && <OverviewTab t={tenant} />}
        {activeTab === "usage"    && <UsageTab />}
        {activeTab === "audit"    && <AuditTab />}
      </div>

      {modal === "plan"    && <PlanModal    tenant={tenant} onClose={closeModal} />}
      {modal === "suspend" && <SuspendModal tenant={tenant} onClose={closeModal} />}
    </>
  )
}
