import { useState } from "react"
import { Zap } from "lucide-react"
import { type UseTokensReturn } from "@/hooks/use-tokens"
import AddonModal from "./AddonModal"

interface Props {
  tokenState: UseTokensReturn
}

export default function TokenWidget({ tokenState }: Props) {
  const { tokens, purchaseAddon } = tokenState
  const [modalOpen, setModalOpen] = useState(false)

  const planRemaining = tokens.planTotal - tokens.planUsed
  const planUsedPct = Math.min((tokens.planUsed / tokens.planTotal) * 100, 100)
  // Addon segment extends the bar beyond 100% of plan — cap combined display at total+addon
  const combinedTotal = tokens.planTotal + tokens.addonBalance
  const addonPct = Math.min((tokens.addonBalance / combinedTotal) * 100, 100)
  const planBarPct = Math.min((tokens.planTotal / combinedTotal) * 100, 100)
  const planFillPct = (tokens.planUsed / combinedTotal) * 100

  return (
    <>
      <div className="border border-ink/15 rounded-sm p-4 bg-cream space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-ember" />
            <span className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Tokens
            </span>
          </div>
          <span className="font-mono-ed text-[10px] text-ink/40">
            {(planRemaining + tokens.addonBalance).toLocaleString()} left
          </span>
        </div>

        {/* Two rows */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono-ed text-[10px] text-ink/55">Plan tokens</span>
            <span className="font-mono-ed text-[11px] text-ink">
              <span className={planRemaining < 50 ? "text-destructive" : "text-ink"}>
                {planRemaining.toLocaleString()}
              </span>
              <span className="text-ink/35"> / {tokens.planTotal.toLocaleString()}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono-ed text-[10px] text-ink/55">Add-on tokens</span>
            <span className="font-mono-ed text-[11px] text-ember">
              {tokens.addonBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Combined progress bar */}
        <div className="h-2 bg-ink/8 rounded-full overflow-hidden relative">
          {/* Plan-used fill (oxblood) */}
          <div
            className="absolute inset-y-0 start-0 bg-oxblood rounded-full transition-all duration-500"
            style={{ width: `${planFillPct}%` }}
          />
          {/* Plan-remaining region implied by planBarPct boundary */}
          {/* Addon segment (ember) — sits at the right of the plan bar */}
          {tokens.addonBalance > 0 && (
            <div
              className="absolute inset-y-0 rounded-full bg-ember/60 transition-all duration-500"
              style={{ left: `${planBarPct}%`, width: `${addonPct}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-oxblood" />
            <span className="font-mono-ed text-[9px] text-ink/45">Plan used</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ember/60" />
            <span className="font-mono-ed text-[9px] text-ink/45">Add-on</span>
          </span>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full h-9 border border-ink/20 text-ink font-mono-ed text-[10px] uppercase tracking-[0.2em] rounded-sm hover:border-oxblood hover:text-oxblood transition-colors flex items-center justify-center gap-1.5"
        >
          <Zap className="h-3 w-3" />
          Buy more tokens
        </button>
      </div>

      <AddonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPurchase={purchaseAddon}
      />
    </>
  )
}
