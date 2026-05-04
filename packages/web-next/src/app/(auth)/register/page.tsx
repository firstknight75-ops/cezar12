'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جداً'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور ٨ أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    await new Promise((r) => setTimeout(r, 800))
    console.log('register', data)
    router.push('/onboarding')
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-slate-50">إنشاء حساب جديد</h1>
      <p className="mb-6 text-sm text-slate-400">ابدأ رحلتك مع سيزار ١٢ اليوم</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">الاسم الكامل</Label>
          <Input id="name" placeholder="محمد أحمد" {...register('name')} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" type="email" placeholder="example@company.com" {...register('email')} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} aria-invalid={!!errors.password} />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
          {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إنشاء الحساب'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  )
}
