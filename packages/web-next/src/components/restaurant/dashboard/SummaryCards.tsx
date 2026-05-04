import { DollarSign, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const CARDS = [
  { label: 'التكلفة الحقيقية', value: '٤٥ ريال', sub: 'متوسط الطبق', icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'هامش الربح', value: '٣٢٪', sub: 'متوسط', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
  { label: 'تنبيهات التكلفة', value: '٣', sub: 'أطباق تحتاج مراجعة', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { label: 'أفضل طبق', value: 'كبسة', sub: 'هامش ٤٥٪', icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10' },
]

export function SummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{c.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-50">{c.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{c.sub}</p>
                </div>
                <div className={`rounded-xl p-3 ${c.bg}`}>
                  <Icon className={`h-5 w-5 ${c.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
