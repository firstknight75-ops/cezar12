import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIJobStatus = "pending" | "ready" | "approved" | "rejected" | "deferred"

export type AIServiceCardProps = {
  status: AIJobStatus
  serviceType: string
  serviceLabelAr?: string
  content?: string
  tokensUsed?: number
  estimatedSeconds?: number
  expiresAt?: Date
  onApprove?: () => void
  onReject?: () => void
  onDefer?: () => void
}

// ─── Lightweight markdown renderer ───────────────────────────────────────────

function renderContent(raw: string) {
  const lines = raw.split("\n")
  return lines.map((line, i) => {
    if (/^##\s/.test(line))
      return (
        <h3 key={i} className="font-display text-base font-semibold text-[hsl(var(--foreground))] mt-4 mb-1">
          {line.replace(/^##\s/, "")}
        </h3>
      )
    if (/^#\s/.test(line))
      return (
        <h2 key={i} className="font-display text-lg font-bold text-[hsl(var(--primary))] mt-5 mb-2">
          {line.replace(/^#\s/, "")}
        </h2>
      )
    if (/^[-•]\s/.test(line))
      return (
        <li key={i} className="ml-4 text-sm text-muted-foreground list-disc">
          {applyInline(line.replace(/^[-•]\s/, ""))}
        </li>
      )
    if (line.trim() === "") return <div key={i} className="h-2" />
    return (
      <p key={i} className="text-sm text-foreground leading-relaxed">
        {applyInline(line)}
      </p>
    )
  })
}

function applyInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-[hsl(var(--foreground))]">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

// ─── Sub-states ───────────────────────────────────────────────────────────────

function PendingCard({ serviceType, estimatedSeconds = 30 }: { serviceType: string; estimatedSeconds?: number }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const pct = Math.min(100, Math.round((elapsed / estimatedSeconds) * 100))
  const remaining = Math.max(0, estimatedSeconds - elapsed)

  return (
    <div className="space-y-4">
      {/* Animated skeleton */}
      <div className="space-y-2">
        {[100, 85, 72, 90, 60].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-sm bg-muted animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[hsl(var(--accent))]" />
            AI generating&hellip;
          </span>
          <span>{remaining > 0 ? `~${remaining}s remaining` : "Finalising…"}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function ReadyCard({
  content,
  tokensUsed,
  onApprove,
  onReject,
  onDefer,
}: Pick<AIServiceCardProps, "content" | "tokensUsed" | "onApprove" | "onReject" | "onDefer">) {
  return (
    <div className="space-y-4">
      {/* Content */}
      <div className="prose-sm max-h-72 overflow-y-auto pr-1 space-y-1 border border-border rounded-sm p-3 bg-[hsl(var(--cream)/0.4)]">
        {content ? renderContent(content) : <p className="text-muted-foreground text-sm">No content returned.</p>}
      </div>
      {/* Tokens used */}
      {tokensUsed !== undefined && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {tokensUsed} tokens used
        </p>
      )}
      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onApprove}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(354_65%_22%)] shadow-[var(--shadow-press)] active:translate-y-px transition-all"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve
        </button>
        <button
          onClick={onDefer}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-muted transition-all"
        >
          <Clock className="w-3.5 h-3.5" />
          Defer
        </button>
        <button
          onClick={onReject}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/5 transition-all"
        >
          <XCircle className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  plan_90day: "90-Day Plan",
  weekly_content: "Weekly Content",
  market_research: "Market Research",
  buyer_persona: "Buyer Persona",
  visual_identity: "Visual Identity",
  seo_plan: "SEO Plan",
  ad_campaign: "Ad Campaign",
  performance_report: "Performance Report",
  lead_generation: "Lead Generation",
  kitchen_cost_analysis: "Kitchen Cost Analysis",
  recipe_costing: "Recipe Costing",
  promotion_optimizer: "Promotion Optimizer",
  initial_assessment: "Initial Assessment",
}

export function AIServiceCard({
  status,
  serviceType,
  serviceLabelAr,
  content,
  tokensUsed,
  estimatedSeconds,
  expiresAt,
  onApprove,
  onReject,
  onDefer,
}: AIServiceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const label = SERVICE_LABELS[serviceType] ?? serviceType

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
    : 30

  return (
    <div
      className={cn(
        "rounded-sm border bg-card transition-all duration-300",
        status === "approved" && "border-green-500/40 bg-green-50/40",
        status === "rejected" && "border-border opacity-50",
        status === "deferred" && "border-amber-400/40",
        status === "pending" && "border-border",
        status === "ready" && "border-[hsl(var(--primary)/0.4)] shadow-[var(--shadow-editorial)]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {serviceLabelAr && (
            <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">
              {serviceLabelAr}
            </p>
          )}
        </div>
        <StatusBadge status={status} daysLeft={daysLeft} />
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {status === "pending" && (
          <PendingCard serviceType={serviceType} estimatedSeconds={estimatedSeconds} />
        )}
        {status === "ready" && (
          <ReadyCard
            content={content}
            tokensUsed={tokensUsed}
            onApprove={onApprove}
            onReject={onReject}
            onDefer={onDefer}
          />
        )}
        {status === "approved" && (
          <p className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Added to project — results merged into your growth plan.
          </p>
        )}
        {status === "rejected" && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Result rejected.{" "}
            <span className="text-[hsl(var(--accent))] font-medium">50 tokens refunded.</span>
          </p>
        )}
        {status === "deferred" && (
          <div className="space-y-2">
            <button
              className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 transition-colors"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? "Hide" : "Show"} result &middot; expires in{" "}
              <strong>{daysLeft} days</strong>
            </button>
            {expanded && content && (
              <div className="mt-2 border border-amber-200 rounded-sm p-3 bg-amber-50/50 space-y-1 max-h-64 overflow-y-auto">
                {renderContent(content)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status, daysLeft }: { status: AIJobStatus; daysLeft: number }) {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
        Generating
      </span>
    )
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        Ready to review
      </span>
    )
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-green-500 text-white">
        <CheckCircle className="w-3 h-3" />
        Approved
      </span>
    )
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-muted text-muted-foreground line-through">
        Rejected
      </span>
    )
  if (status === "deferred")
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3 h-3" />
        {daysLeft}d left
      </span>
    )
  return null
}
