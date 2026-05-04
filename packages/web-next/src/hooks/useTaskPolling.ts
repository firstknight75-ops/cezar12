'use client'

import { useState, useEffect, useRef } from 'react'

type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed'

type TaskPollingResult = {
  status: TaskStatus
  result: string | null
}

export function useTaskPolling(jobId: string | null): TaskPollingResult {
  const [status, setStatus] = useState<TaskStatus>('pending')
  const [result, setResult] = useState<string | null>(null)
  const elapsedRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!jobId) return

    elapsedRef.current = 0
    setStatus('pending')
    setResult(null)

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 3

      if (elapsedRef.current >= 60) {
        setStatus('failed')
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }

      if (elapsedRef.current >= 6 && status === 'pending') {
        setStatus('processing')
      }

      if (elapsedRef.current >= 15) {
        setStatus('completed')
        setResult('تم اكتمال المهمة بنجاح. تم إنشاء المحتوى المطلوب وهو جاهز للمراجعة.')
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { status, result }
}
