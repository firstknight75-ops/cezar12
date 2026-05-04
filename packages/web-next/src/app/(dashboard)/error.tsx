'use client'

import { ErrorState } from '@/components/shared/ErrorState'

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full items-center justify-center">
      <ErrorState message="حدث خطأ في تحميل الصفحة" onRetry={reset} />
    </div>
  )
}
