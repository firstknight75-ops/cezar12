'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Briefcase, ChefHat, Building2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Domain = 'ECOMMERCE' | 'SERVICES' | 'RESTAURANT' | 'REAL_ESTATE'

const DOMAINS = [
  { key: 'ECOMMERCE' as Domain, label: 'تجارة إلكترونية', icon: ShoppingCart },
  { key: 'SERVICES' as Domain, label: 'خدمات', icon: Briefcase },
  { key: 'RESTAURANT' as Domain, label: 'مطعم', icon: ChefHat },
  { key: 'REAL_ESTATE' as Domain, label: 'عقارات', icon: Building2 },
]

const PLANS = [
  { key: 'silver', label: 'فضي', tokens: '٥٠٠', price: '٢٩٩', features: ['٥٠٠ رمز شهرياً', 'تقرير مالي', 'تشخيص الأعمال'] },
  { key: 'gold', label: 'ذهبي', tokens: '١٠٠٠', price: '٥٩٩', features: ['١٠٠٠ رمز شهرياً', 'خطة نمو', 'محتوى تسويقي', 'تحليل منافسين'], popular: true },
  { key: 'platinum', label: 'بلاتيني', tokens: '٢٥٠٠', price: '٩٩٩', features: ['٢٥٠٠ رمز شهرياً', 'جميع الخدمات', 'دعم مخصص', 'تقارير متقدمة'] },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState<Domain | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const progress = (step / 4) * 100

  const complete = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-blue-400">سيزار ١٢</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>الخطوة {step} من ٤</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          {step === 1 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-50">ما هو نشاطك التجاري؟</h2>
              <p className="mb-6 text-sm text-slate-400">اختر القطاع الذي يصف نشاطك التجاري بدقة.</p>
              <div className="grid grid-cols-2 gap-3">
                {DOMAINS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setDomain(key)}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all ${
                      domain === key
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-medium">{label}</span>
                    {domain === key && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-50">معلومات الشركة</h2>
              <p className="mb-6 text-sm text-slate-400">أخبرنا المزيد عن شركتك.</p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>اسم الشركة</Label>
                  <Input placeholder="شركة الأناقة للتجارة" />
                </div>
                <div className="space-y-1.5">
                  <Label>المدينة</Label>
                  <Input placeholder="الرياض" />
                </div>
                <div className="space-y-1.5">
                  <Label>رقم الجوال</Label>
                  <Input placeholder="05xxxxxxxx" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>الموقع الإلكتروني (اختياري)</Label>
                  <Input placeholder="https://example.com" dir="ltr" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-50">الوضع المالي الحالي</h2>
              <p className="mb-6 text-sm text-slate-400">هذه المعلومات تساعدنا على تحليل وضعك التجاري.</p>
              <div className="space-y-4">
                {domain === 'ECOMMERCE' && (
                  <>
                    <div className="space-y-1.5"><Label>سعر البيع (ريال)</Label><Input type="number" placeholder="١٠٠" /></div>
                    <div className="space-y-1.5"><Label>تكلفة البضاعة (ريال)</Label><Input type="number" placeholder="٥٠" /></div>
                    <div className="space-y-1.5"><Label>التكاليف الثابتة الشهرية (ريال)</Label><Input type="number" placeholder="٥٠٠٠" /></div>
                  </>
                )}
                {domain === 'RESTAURANT' && (
                  <>
                    <div className="space-y-1.5"><Label>عدد المقاعد</Label><Input type="number" placeholder="٥٠" /></div>
                    <div className="space-y-1.5"><Label>متوسط الفاتورة للفرد (ريال)</Label><Input type="number" placeholder="٨٠" /></div>
                    <div className="space-y-1.5"><Label>نسبة تكلفة الطعام %</Label><Input type="number" placeholder="٣٠" /></div>
                  </>
                )}
                {(domain === 'SERVICES' || domain === 'REAL_ESTATE' || domain === null) && (
                  <>
                    <div className="space-y-1.5"><Label>الإيرادات الشهرية التقريبية (ريال)</Label><Input type="number" placeholder="٢٠٠٠٠" /></div>
                    <div className="space-y-1.5"><Label>التكاليف الشهرية التقريبية (ريال)</Label><Input type="number" placeholder="١٠٠٠٠" /></div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-50">اختر خطتك</h2>
              <p className="mb-6 text-sm text-slate-400">يمكنك تغيير الخطة في أي وقت.</p>
              <div className="grid gap-4">
                {PLANS.map((plan) => (
                  <div key={plan.key} className={`relative rounded-xl border-2 p-5 ${plan.popular ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-800/30'}`}>
                    {plan.popular && (
                      <span className="absolute -top-3 start-4 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">الأكثر شيوعاً</span>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-50">{plan.label}</h3>
                        <ul className="mt-2 space-y-1">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                              <Check className="h-3 w-3 text-green-400" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-end">
                        <p className="text-2xl font-bold text-slate-50">{plan.price}</p>
                        <p className="text-xs text-slate-500">ريال/شهر</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>السابق</Button>
            ) : <div />}
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !domain}>
                التالي
              </Button>
            ) : (
              <Button onClick={complete} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ابدأ الآن'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
