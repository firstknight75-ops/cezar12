import { useState } from "react"
import { Search, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types & mock data ────────────────────────────────────────────────────────

type Scope = "global" | "silver" | "gold" | "platinum" | "tenant"
type FlagValue = boolean | string | number

interface Flag {
  id: string
  name: string
  description: string
  value: FlagValue
  scope: Scope
  tenantId?: string
  lastChanged: string
}

const INITIAL_FLAGS: Flag[] = [
  { id: "f1", name: "ai_provider",           description: "Active AI provider (anthropic | openai)", value: "anthropic", scope: "global",   lastChanged: "2026-05-04 09:00" },
  { id: "f2", name: "enable_kitchen_intel",  description: "Kitchen Intelligence service enabled",     value: true,        scope: "gold",     lastChanged: "2026-04-28 14:30" },
  { id: "f3", name: "enable_competitor",     description: "Competitor analysis service",              value: true,        scope: "platinum", lastChanged: "2026-04-15 11:00" },
  { id: "f4", name: "beta_real_estate_v2",   description: "Real Estate dashboard v2 UI",              value: false,       scope: "global",   lastChanged: "2026-05-01 08:20" },
  { id: "f5", name: "max_projects_per_user", description: "Max projects allowed per subscription",    value: 20,          scope: "global",   lastChanged: "2026-03-10 16:00" },
  { id: "f6", name: "token_overage_enabled", description: "Allow addon token purchases",              value: true,        scope: "global",   lastChanged: "2026-04-01 00:00" },
  { id: "f7", name: "trial_mode",            description: "Free trial features for new signups",      value: false,       scope: "silver",   lastChanged: "2026-02-20 09:45" },
  { id: "f8", name: "apex_beta_access",      description: "Beta features for Apex Consulting",        value: true,        scope: "tenant",   tenantId: "t3", lastChanged: "2026-05-03 12:00" },
]

const SCOPE_STYLE: Record<Scope, string> = {
  global:   "bg-sky-50 text-sky-700 border border-sky-200",
  silver:   "bg-slate-100 text-slate-600 border border-slate-200",
  gold:     "bg-amber-50 text-amber-700 border border-amber-200",
  platinum: "bg-oxblood/8 text-oxblood border border-oxblood/20",
  tenant:   "bg-purple-50 text-purple-700 border border-purple-200",
}

// ─── Inline edit cell ─────────────────────────────────────────────────────────

function ValueCell({
  flag,
  onChange,
}: {
  flag: Flag
  onChange: (id: string, val: FlagValue) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(String(flag.value))

  if (typeof flag.value === "boolean") {
    return (
      <button
        onClick={() => onChange(flag.id, !flag.value)}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono-ed text-[10px] uppercase tracking-wider transition-colors",
          flag.value
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200"
        )}
      >
        {flag.value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        {flag.value ? "true" : "false"}
      </button>
    )
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-32 h-7 px-2 text-xs border border-oxblood/40 rounded-sm bg-card focus:outline-none"
        />
        <button
          onClick={() => {
            onChange(flag.id, typeof flag.value === "number" ? Number(draft) : draft)
            setEditing(false)
          }}
          className="w-6 h-6 flex items-center justify-center bg-oxblood text-cream rounded-sm hover:bg-ink"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={() => { setDraft(String(flag.value)); setEditing(false) }}
          className="w-6 h-6 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:bg-secondary"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="font-mono-ed text-[11px] text-foreground px-2 py-1 border border-transparent rounded-sm hover:border-border hover:bg-secondary transition-colors"
    >
      {String(flag.value)}
    </button>
  )
}

// ─── Scope selector ───────────────────────────────────────────────────────────

function ScopeCell({
  flag,
  onChange,
}: {
  flag: Flag
  onChange: (id: string, scope: Scope, tenantId?: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState<Scope>(flag.scope)
  const [tenantQ, setTenantQ] = useState(flag.tenantId ?? "")

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={cn(
          "font-mono-ed text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm",
          SCOPE_STYLE[flag.scope]
        )}
      >
        {flag.scope}{flag.tenantId ? ` · ${flag.tenantId}` : ""}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={draft}
        onChange={(e) => setDraft(e.target.value as Scope)}
        className="h-7 px-2 text-xs border border-border rounded-sm bg-card focus:outline-none"
      >
        <option value="global">Global</option>
        <option value="silver">Silver</option>
        <option value="gold">Gold</option>
        <option value="platinum">Platinum</option>
        <option value="tenant">Specific Tenant</option>
      </select>
      {draft === "tenant" && (
        <input
          value={tenantQ}
          onChange={(e) => setTenantQ(e.target.value)}
          placeholder="Tenant ID…"
          className="h-7 px-2 text-xs border border-border rounded-sm bg-card focus:outline-none"
        />
      )}
      <div className="flex gap-1">
        <button
          onClick={() => {
            onChange(flag.id, draft, draft === "tenant" ? tenantQ : undefined)
            setEditing(false)
          }}
          className="flex-1 text-[10px] font-mono-ed uppercase bg-oxblood text-cream rounded-sm py-1 hover:bg-ink"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex-1 text-[10px] font-mono-ed uppercase border border-border rounded-sm py-1 text-muted-foreground hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>(INITIAL_FLAGS)
  const [query, setQuery] = useState("")

  const filtered = flags.filter(
    (f) =>
      f.name.includes(query.toLowerCase()) ||
      f.description.toLowerCase().includes(query.toLowerCase())
  )

  const updateValue = (id: string, val: FlagValue) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, value: val, lastChanged: new Date().toISOString().slice(0, 16).replace("T", " ") } : f
      )
    )
  }

  const updateScope = (id: string, scope: Scope, tenantId?: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, scope, tenantId, lastChanged: new Date().toISOString().slice(0, 16).replace("T", " ") } : f
      )
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Feature Flags</h1>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
          {flags.length} flags · changes apply immediately
        </p>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search flags…"
          className="w-full pl-9 pr-3 h-9 text-sm border border-border rounded-sm bg-card focus:outline-none focus:ring-1 focus:ring-oxblood/40"
        />
      </div>

      <div className="border border-border rounded-sm overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {["Flag", "Description", "Value", "Scope", "Last Changed"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((flag, i) => (
              <tr key={flag.id} className={cn("hover:bg-secondary/30 transition-colors", i < filtered.length - 1 && "border-b border-border")}>
                <td className="px-4 py-3 font-mono-ed text-[11px] text-foreground">{flag.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">{flag.description}</td>
                <td className="px-4 py-3">
                  <ValueCell flag={flag} onChange={updateValue} />
                </td>
                <td className="px-4 py-3">
                  <ScopeCell flag={flag} onChange={updateScope} />
                </td>
                <td className="px-4 py-3 font-mono-ed text-[10px] text-muted-foreground">{flag.lastChanged}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
