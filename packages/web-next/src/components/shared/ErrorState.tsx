import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'حدث خطأ غير متوقع', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-red-500/10 p-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-200">حدث خطأ</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-400">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          حاول مرة أخرى
        </Button>
      )}
    </div>
  )
}
