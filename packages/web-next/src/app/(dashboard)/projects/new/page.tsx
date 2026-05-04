'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Briefcase, ChefHat, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Domain = 'ECOMMERCE' | 'SERVICES' | 'RESTAURANT' | 'REAL_ESTATE'

const DOMAINS = [
  { key: 'ECOMMERCE' as Domain, label: 'تجارة إلكترونية', desc: 'متجر إلكتروني أو بيع عبر الإنترنت', icon: ShoppingCart },
  { key: 'SERVICES' as Domain, label: 'خدمات', desc: 'شركات خدمية أو استشارية', icon: Briefcase },
  { key: 'RESTAURANT' as Domain, label: 'مطعم', desc: 'مطاعم وخدمات الغذاء', icon: ChefHat },
  { key: 'REAL_ESTATE' as Domain, label: 'عقارات', desc: 'تطوير عقاري أو وساطة', icon: Building2 },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const valid = domain !== null && name.trim().length >= 2

  const save = async () => {
    if (!valid) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    router.push('/projects')
  }

  return (
    <div>
      <PageHeader title="مشروع جديد" description="أنشئ مشروعاً لبدء التحليل المالي" />

      <div className="max-w-2xl space-y-6">
        <div className="space-y-1.5">
          <Label>اسم المشروع</Label>
          <Input placeholder="مثال: متجر الأناقة" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label className="mb-3 block">القطاع التجاري</Label>
          <div className="grid grid-cols-2 gap-3">
            {DOMAINS.map(({ key, label, desc, icon: Icon }) => (
              <Card
                key={key}
                onClick={() => setDomain(key)}
                className={cn(
                  'cursor-pointer border-2 transition-all hover:border-slate-700',
                  domain === key ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-lg p-2', domain === key ? 'bg-blue-500/10' : 'bg-slate-800')}>
                      <Icon className={cn('h-5 w-5', domain === key ? 'text-blue-400' : 'text-slate-400')} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={save} disabled={!valid || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إنشاء المشروع'}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>إلغاء</Button>
        </div>
      </div>
    </div>
  )
}
