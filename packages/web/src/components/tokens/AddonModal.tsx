import { useState } from "react"
import { AlertTriangle, Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ADDON_PACKAGES, type AddonPackage } from "@/lib/plans"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
  onPurchase: (tokens: number, price: number) => Promise<void>
}

export default function AddonModal({ open, onClose, onPurchase }: Props) {
  const [selected, setSelected] = useState<AddonPackage | null>(null)
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await onPurchase(selected.tokens, selected.price)
      toast.success(
        `${selected.tokens.toLocaleString()} tokens added to your account`,
        { duration: 3000 },
      )
      setSelected(null)
      onClose()
    } catch {
      toast.error("Purchase failed — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-cream border-ink/20 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-ink/10">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-ember" />
            <DialogTitle className="font-mono-ed text-xs uppercase tracking-[0.25em] text-ink">
              Buy Add-on Tokens
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tokens are added instantly to your account.
          </p>
        </DialogHeader>

        {/* Package grid */}
        <div className="px-6 py-5 space-y-2.5">
          {ADDON_PACKAGES.map((pkg) => {
            const sel = selected?.name === pkg.name
            return (
              <button
                key={pkg.name}
                type="button"
                onClick={() => setSelected(pkg)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-sm border transition-all text-start ${
                  sel
                    ? "border-oxblood bg-oxblood/5 shadow-[inset_0_0_0_1px_hsl(var(--oxblood))]"
                    : pkg.highlight
                      ? "border-ember/40 bg-ember/4 hover:border-ember/60"
                      : "border-ink/15 bg-cream hover:border-ink/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Selector dot */}
                  <span
                    className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${
                      sel ? "border-oxblood bg-oxblood" : "border-ink/30"
                    }`}
                  >
                    {sel && (
                      <svg
                        viewBox="0 0 8 6"
                        className="w-2 h-1.5 fill-none stroke-cream stroke-[1.5]"
                      >
                        <polyline points="1,3 3,5 7,1" />
                      </svg>
                    )}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-ed text-xs uppercase tracking-[0.15em] text-ink">
                        {pkg.name}
                      </span>
                      {pkg.highlight && (
                        <span className="font-mono-ed text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 bg-ember/15 text-ember rounded-full">
                          Best value
                        </span>
                      )}
                    </div>
                    <p className="font-mono-ed text-[10px] text-ink/45 mt-0.5">
                      {pkg.tokens.toLocaleString()} tokens · {pkg.costPerToken} per token
                    </p>
                  </div>
                </div>

                <span className="font-display text-lg text-ink shrink-0">
                  ${pkg.price}
                </span>
              </button>
            )
          })}
        </div>

        {/* Expiry warning */}
        <div className="mx-6 mb-5 flex items-start gap-2.5 px-3.5 py-3 bg-ember/8 border border-ember/25 rounded-sm">
          <AlertTriangle className="h-3.5 w-3.5 text-ember shrink-0 mt-0.5" />
          <p className="font-mono-ed text-[10px] text-ink/70 leading-snug">
            Tokens expire at the end of your current billing cycle. Unused tokens are
            not rolled over.
          </p>
        </div>

        {/* Confirm */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 border border-ink/20 text-ink font-mono-ed text-xs uppercase tracking-[0.2em] rounded-sm hover:border-ink/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!selected || loading}
            className="flex-1 h-11 bg-oxblood text-cream font-mono-ed text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-ink transition-colors shadow-[var(--shadow-press)] disabled:opacity-40"
          >
            {loading
              ? "Processing..."
              : selected
                ? `Confirm — $${selected.price}`
                : "Select a package"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
