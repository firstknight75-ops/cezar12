import { useState } from "react"
import { Check, Link, Sparkles, Zap } from "lucide-react"
import {
  PLANS,
  CYCLE_LABELS,
  type BillingCycle,
  type Plan,
} from "@/lib/plans"
import { useTokens } from "@/hooks/use-tokens"
import TokenWidget from "@/components/tokens/TokenWidget"
import LowTokenBanner from "@/components/tokens/LowTokenBanner"
import AddonModal from "@/components/tokens/AddonModal"

// ─── Metallic badge ────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span
      className="inline-block font-mono-ed text-[10px] uppercase tracking-[0.25em] px-2.5 py-0.5 rounded-full text-[#1A1A1A] shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      style={{ background: plan.badgeGradient }}
    >
      {plan.label}
    </span>
  )
}

// ─── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  cycle,
  onChoose,
}: {
  plan: Plan
  cycle: BillingCycle
  onChoose: () => void
}) {
  const price = plan.prices[cycle]
  const saving = plan.savings[cycle]

  return (
    <div
      className={`relative flex flex-col rounded-sm border-2 overflow-hidden transition-all ${
        plan.popular
          ? `${plan.borderClass} shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)]`
          : `${plan.borderClass}/60 hover:${plan.borderClass}`
      } ${plan.accentClass}`}
    >
      {/* Most Popular ribbon */}
      {plan.popular && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-[#D4AC0D] text-[#1A1A1A]">
          <Sparkles className="h-3 w-3" />
          <span className="font-mono-ed text-[9px] uppercase tracking-[0.3em]">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 space-y-6">
        {/* Plan identity */}
        <div className="space-y-2">
          <PlanBadge plan={plan} />
          <div>
            <div className="flex items-end gap-1.5 mt-3">
              <span className="font-display text-4xl text-ink">${price}</span>
              <span className="font-mono-ed text-[10px] text-ink/45 mb-1.5">/ mo</span>
            </div>
            {saving > 0 && (
              <span className="inline-flex items-center gap-1 mt-1 font-mono-ed text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-emerald-500/12 text-emerald-700 border border-emerald-500/25 rounded-full">
                Save {saving}%
              </span>
            )}
            {cycle !== "monthly" && (
              <p className="font-mono-ed text-[10px] text-ink/40 mt-1">
                vs ${plan.prices.monthly}/mo billed monthly
              </p>
            )}
          </div>
        </div>

        {/* Token allowance */}
        <div className={`flex items-center gap-2 py-3 px-3.5 rounded-sm border ${plan.borderClass}/30 bg-cream/50`}>
          <Zap className={`h-4 w-4 ${plan.labelClass}`} />
          <span className="font-display text-lg text-ink">
            {plan.tokens.toLocaleString()}
          </span>
          <span className="font-mono-ed text-[10px] text-ink/50">tokens / month</span>
        </div>

        {/* Feature list */}
        <ul className="space-y-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${plan.labelClass}`} />
              <span className="text-sm text-ink/75">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          type="button"
          onClick={onChoose}
          className={`w-full h-11 font-mono-ed text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-[var(--shadow-press)] ${
            plan.popular
              ? "bg-[#D4AC0D] text-[#1A1A1A] hover:bg-[#B8960B]"
              : "bg-oxblood text-cream hover:bg-ink"
          }`}
        >
          Choose {plan.label}
        </button>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Plans() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly")
  const [addonModalOpen, setAddonModalOpen] = useState(false)
  const tokenState = useTokens()
  const { totalRemaining, isLow, purchaseAddon } = tokenState

  const handleChoose = (plan: Plan) => {
    // POST /api/subscriptions — mocked; navigate to checkout in production
    console.log("Choose plan", plan.name, cycle)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Low token banner — full width at very top */}
      {isLow && (
        <div className="px-6 lg:px-10 pt-4">
          <LowTokenBanner
            totalRemaining={totalRemaining}
            onBuyMore={() => setAddonModalOpen(true)}
          />
        </div>
      )}

      {/* Page header */}
      <header className="px-6 lg:px-10 pt-12 pb-4 max-w-6xl mx-auto">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-3">
          Cezar 12 · Pricing
        </p>
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-3 text-balance">
          Choose your plan
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Every plan includes financial analysis, digital diagnostics, and AI-powered
          marketing recommendations. Scale your token allowance as you grow.
        </p>
      </header>

      {/* Billing cycle toggle */}
      <div className="px-6 lg:px-10 py-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center border border-ink/20 rounded-sm overflow-hidden">
          {(["monthly", "quarterly", "annual"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={`relative h-9 px-5 font-mono-ed text-[11px] uppercase tracking-[0.2em] transition-colors ${
                cycle === c
                  ? "bg-ink text-cream"
                  : "text-ink/60 hover:text-ink bg-cream"
              }`}
            >
              {CYCLE_LABELS[c]}
              {c !== "monthly" && cycle !== c && (
                <span className="absolute -top-1.5 -end-1 font-mono-ed text-[7px] uppercase px-1 bg-emerald-500 text-white rounded-full leading-none py-0.5">
                  Save
                </span>
              )}
            </button>
          ))}
        </div>
        {cycle !== "monthly" && (
          <p className="font-mono-ed text-[10px] text-ink/45 mt-2">
            {cycle === "quarterly" ? "Billed every 3 months" : "Billed once per year"}
          </p>
        )}
      </div>

      {/* Two-column layout: plan cards + sidebar */}
      <div className="px-6 lg:px-10 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start">
          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                cycle={cycle}
                onChoose={() => handleChoose(plan)}
              />
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <TokenWidget tokenState={tokenState} />

            {/* Need help */}
            <div className="border border-ink/10 rounded-sm p-4 space-y-2">
              <p className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/50">
                Need help choosing?
              </p>
              <p className="text-xs text-ink/60 leading-relaxed">
                Compare features or talk to our team for a recommendation.
              </p>
              <button
                type="button"
                className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-oxblood hover:text-ink transition-colors flex items-center gap-1"
              >
                <Link className="h-3 w-3" />
                Contact sales
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Standalone addon modal (triggered from banner or widget) */}
      <AddonModal
        open={addonModalOpen}
        onClose={() => setAddonModalOpen(false)}
        onPurchase={purchaseAddon}
      />
    </div>
  )
}
