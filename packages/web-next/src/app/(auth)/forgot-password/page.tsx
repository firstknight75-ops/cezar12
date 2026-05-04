'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({ email: z.string().email('بريد إلكتروني غير صالح') })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: Form) => {
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-400/10">
          <CheckCircle className="h-7 w-7 text-green-400" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-slate-50">تم إرسال الرابط</h2>
        <p className="mb-6 text-sm text-slate-400">تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.</p>
        <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300">
          العودة لتسجيل الدخول
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-slate-50">نسيت كلمة المرور؟</h1>
      <p className="mb-6 text-sm text-slate-400">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" type="email" placeholder="example@company.com" {...register('email')} />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال رابط إعادة التعيين'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          ← العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  )
}
