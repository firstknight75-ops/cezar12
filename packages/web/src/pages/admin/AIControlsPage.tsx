import { useState } from "react"
import { Bot, Zap, CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

type Provider = "anthropic" | "openai"

interface ServiceTemp {
  key: string
  label: string
  temp: number
}

interface ApprovalRow {
  service: string
  approved: number
  rejected: number
  deferred: number
  total: number
}

const INITIAL_TEMPS: ServiceTemp[] = [
  { key: "growth_plan",       label: "Growth Plan",         temp: 0.7 },
  { key: "marketing_content", label: "Marketing Content",   temp: 0.85 },
  { key: "kitchen_intel",     label: "Kitchen Intelligence", temp: 0.5 },
  { key: "competitor",        label: "Competitor Analysis",  temp: 0.4 },
  { key: "rate_ladder",       label: "Rate Ladder",          temp: 0.45 },
  { key: "pipeline_health",   label: "Pipeline Health",      temp: 0.55 },
]

const APPROVAL_DATA: ApprovalRow[] = [
  { service: "Growth Plan",         approved: 78, rejected: 8,  deferred: 14, total: 100 },
  { service: "Marketing Content",   approved: 82, rejected: 6,  deferred: 12, total: 100 },
  { service: "Kitchen Intelligence", approved: 71, rejected: 12, deferred: 17, total: 100 },
  { service: "Competitor Analysis", approved: 69, rejected: 15, deferred: 16, total: 100 },
  { service: "Rate Ladder",         approved: 85, rejected: 5,  deferred: 10, total: 100 },
  { service: "Pipeline Health",     approved: 76, rejected: 9,  deferred: 15, total: 100 },
]

// ─── Provider toggle ──────────────────────────────────────────────────────────

function ProviderToggle({
  active,
  onChange,
}: {
  active: Provider
  onChange: (p: Provider) => void
}) {
  const providers = [
    { id: "anthropic" as const, label: "Claude (Anthropic)", model: "claude-opus-4-6", color: "bg-oxblood" },
    { id: "openai"    as const, label: "GPT-4o (OpenAI)",    model: "gpt-4o",          color: "bg-emerald-700" },
  ]

  return (
    <div className="border border-border rounded-sm p-5 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-4 h-4 text-oxblood" />
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          AI Provider
        </p>
      </div>

      <div className="flex gap-3">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={cn(
              "flex-1 flex flex-col items-start gap-2 p-4 rounded-sm border-2 transition-all",
              active === p.id
                ? "border-oxblood bg-oxblood/5"
                : "border-border hover:border-border/80 hover:bg-secondary/40"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-display text-sm text-foreground">{p.label}</span>
              {active === p.id && (
                <span className="font-mono-ed text-[9px] uppercase tracking-wider bg-oxblood text-cream px-2 py-0.5 rounded-sm">
                  Active
                </span>
              )}
            </div>
            <span className="font-mono-ed text-[10px] text-muted-foreground">{p.model}</span>
            <div className={cn("h-1 w-8 rounded-full", p.color)} />
          </button>
        ))}
      </div>

      <p className="font-mono-ed text-[10px] text-muted-foreground mt-3">
        Provider change applies to all new AI jobs. In-queue jobs use the provider at enqueue time.
      </p>
    </div>
  )
}

// ─── Temperature sliders ──────────────────────────────────────────────────────

function TempSliders({
  services,
  onChange,
}: {
  services: ServiceTemp[]
  onChange: (key: string, val: number) => void
}) {
  return (
    <div className="border border-border rounded-sm p-5 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-ember" />
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Per-Service Temperature
        </p>
      </div>

      <div className="space-y-4">
        {services.map((s) => (
          <div key={s.key} className="flex items-center gap-4">
            <div className="w-40 shrink-0">
              <p className="text-sm text-foreground">{s.label}</p>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.temp}
              onChange={(e) => onChange(s.key, parseFloat(e.target.value))}
              className="flex-1 accent-oxblood h-1.5"
            />
            <div className="w-10 text-right">
              <span className="font-mono-ed text-[12px] text-foreground">{s.temp.toFixed(2)}</span>
            </div>
            <div className="w-16">
              <span className={cn(
                "font-mono-ed text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm",
                s.temp < 0.4  ? "bg-sky-50 text-sky-600"    :
                s.temp < 0.7  ? "bg-amber-50 text-amber-600" :
                                "bg-red-50 text-red-600"
              )}>
                {s.temp < 0.4 ? "precise" : s.temp < 0.7 ? "balanced" : "creative"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Approval rate table ──────────────────────────────────────────────────────

function ApprovalTable() {
  return (
    <div className="border border-border rounded-sm overflow-hidden bg-card">
      <div className="px-5 py-4 border-b border-border">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Approval Rates — Last 30 Days
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Service</th>
            <th className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-emerald-600">
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>
            </th>
            <th className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-red-500">
              <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
            </th>
            <th className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-amber-600">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Deferred</span>
            </th>
            <th className="text-left px-4 py-2.5 font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Rate bar</th>
          </tr>
        </thead>
        <tbody>
          {APPROVAL_DATA.map((row, i) => (
            <tr key={row.service} className={cn("hover:bg-secondary/30 transition-colors", i < APPROVAL_DATA.length - 1 && "border-b border-border")}>
              <td className="px-4 py-3 text-sm text-foreground">{row.service}</td>
              <td className="px-4 py-3 font-mono-ed text-[12px] text-emerald-700">{row.approved}%</td>
              <td className="px-4 py-3 font-mono-ed text-[12px] text-red-600">{row.rejected}%</td>
              <td className="px-4 py-3 font-mono-ed text-[12px] text-amber-700">{row.deferred}%</td>
              <td className="px-4 py-3 w-40">
                <div className="h-2 flex rounded-full overflow-hidden gap-px">
                  <div className="bg-emerald-500 rounded-l-full" style={{ width: `${row.approved}%` }} />
                  <div className="bg-amber-400"                  style={{ width: `${row.deferred}%` }} />
                  <div className="bg-red-400 rounded-r-full"     style={{ width: `${row.rejected}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIControlsPage() {
  const [provider, setProvider] = useState<Provider>("anthropic")
  const [temps, setTemps]       = useState<ServiceTemp[]>(INITIAL_TEMPS)

  const updateTemp = (key: string, val: number) => {
    setTemps((prev) => prev.map((s) => (s.key === key ? { ...s, temp: val } : s)))
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">AI Controls</h1>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
          Provider, temperature, and result approval stats
        </p>
      </div>

      <ProviderToggle active={provider} onChange={setProvider} />
      <TempSliders services={temps} onChange={updateTemp} />
      <ApprovalTable />
    </div>
  )
}
