import { useState } from "react"
import { AlertTriangle, X, Zap } from "lucide-react"

interface Props {
  totalRemaining: number
  onBuyMore: () => void
}

export default function LowTokenBanner({ totalRemaining, onBuyMore }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (totalRemaining >= 50 || dismissed) return null

  return (
    <div className="relative flex items-center gap-3 px-4 py-3 rounded-sm border border-destructive/30 bg-gradient-to-r from-destructive/8 via-ember/8 to-destructive/8 overflow-hidden">
      {/* Subtle animated pulse line at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />

      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />

      <p className="flex-1 text-sm text-ink/80 leading-snug">
        <span className="font-display">
          You have{" "}
          <span className="text-destructive font-semibold">
            {totalRemaining} token{totalRemaining !== 1 ? "s" : ""}
          </span>{" "}
          left.
        </span>{" "}
        Buy more to keep generating.
      </p>

      <button
        type="button"
        onClick={onBuyMore}
        className="shrink-0 flex items-center gap-1.5 h-8 px-3.5 bg-destructive text-cream font-mono-ed text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-oxblood transition-colors shadow-[var(--shadow-press)]"
      >
        <Zap className="h-3 w-3" />
        Buy now
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-ink/35 hover:text-ink transition-colors p-1"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
