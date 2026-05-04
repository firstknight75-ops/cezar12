import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div>
      <PageHeader title="الخدمات" description="اطلب خدمات الذكاء الاصطناعي لمشاريعك" />
      <EmptyState
        title="اختر مشروعاً لبدء الخدمات"
        description="انتقل إلى أحد مشاريعك لطلب خدمة تحليل أو خطة نمو أو محتوى تسويقي."
        action={undefined}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'خطة النمو', desc: 'خطة استراتيجية مخصصة لمشروعك', cost: '١٥٠ رمز', href: '/services/1/plan' },
          { label: 'محتوى تسويقي', desc: 'إنتاج محتوى إعلاني جاهز للنشر', cost: '٨٠ رمز', href: '/services/1/content' },
          { label: 'تقرير المنافسين', desc: 'تحليل المنافسين في قطاعك', cost: '١٢٠ رمز', href: '/services/1/plan' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-100">{s.label}</h3>
            </div>
            <p className="mb-4 text-sm text-slate-400">{s.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-400">{s.cost}</span>
              <Button asChild size="sm">
                <Link href={s.href}>طلب الخدمة</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
