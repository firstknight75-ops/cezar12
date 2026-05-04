'use client'

import { useState, useEffect } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(60)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const resend = async () => {
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSending(false)
    setCountdown(60)
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
        <Mail className="h-8 w-8 text-blue-400" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-slate-50">تحقق من بريدك الإلكتروني</h1>
      <p className="mb-2 text-sm text-slate-400">
        أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى فتحه والنقر على الرابط لتأكيد حسابك.
      </p>
      <p className="mb-8 text-xs text-slate-500">تحقق من مجلد الرسائل غير المرغوب فيها إذا لم تجد الرسالة.</p>

      <Button onClick={resend} variant="outline" className="w-full" disabled={countdown > 0 || sending}>
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : countdown > 0 ? (
          `إعادة الإرسال بعد ${countdown}ث`
        ) : (
          'إعادة إرسال الرابط'
        )}
      </Button>
    </div>
  )
}
