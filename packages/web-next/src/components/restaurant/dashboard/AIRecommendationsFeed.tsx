import { Lightbulb, TrendingDown, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const RECOMMENDATIONS = [
  {
    id: '1',
    icon: TrendingDown,
    title: 'خفض تكلفة الدجاج بنسبة ١٢٪',
    desc: 'التحول لمورد منافس يوفر نفس الجودة بسعر أقل. يُقدر الوفر بـ ٢٠٠ ريال شهرياً.',
    priority: 'عالي' as const,
  },
  {
    id: '2',
    icon: Zap,
    title: 'إضافة طبق جديد بتكلفة منخفضة',
    desc: 'المقلوبة — تكلفة ١٨ ريال وسعر بيع مقترح ٦٥ ريال. هامش ٧٢٪.',
    priority: 'متوسط' as const,
  },
  {
    id: '3',
    icon: Lightbulb,
    title: 'تفعيل عروض الغداء في أوقات الذروة المنخفضة',
    desc: 'بين الساعة ٣-٥ عصراً، معدل الإشغال ٢٥٪. عرض ٢٠٪ خصم يرفعه لـ٦٠٪.',
    priority: 'منخفض' as const,
  },
]

const PRIORITY_MAP = {
  عالي: 'destructive',
  متوسط: 'warning',
  منخفض: 'secondary',
} as const

export function AIRecommendationsFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>توصيات الذكاء الاصطناعي</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {RECOMMENDATIONS.map((rec) => {
          const Icon = rec.icon
          return (
            <div key={rec.id} className="flex gap-3 rounded-lg border border-slate-800 p-4">
              <div className="mt-0.5 rounded-lg bg-yellow-400/10 p-2 shrink-0">
                <Icon className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-100">{rec.title}</p>
                  <Badge variant={PRIORITY_MAP[rec.priority]}>{rec.priority}</Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.desc}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
