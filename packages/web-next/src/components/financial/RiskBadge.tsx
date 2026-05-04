import { cn } from '@/lib/utils'

type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

const RISK_CONFIG: Record<RiskLevel, { label: string; className: string }> = {
  CRITICAL: { label: 'حرج', className: 'bg-red-500/20 text-red-500 border border-red-500/30' },
  HIGH: { label: 'عالي', className: 'bg-red-400/10 text-red-400 border border-red-400/30' },
  MEDIUM: { label: 'متوسط', className: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' },
  LOW: { label: 'منخفض', className: 'bg-green-400/10 text-green-400 border border-green-400/30' },
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { label, className } = RISK_CONFIG[level]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}>
      {label}
    </span>
  )
}
