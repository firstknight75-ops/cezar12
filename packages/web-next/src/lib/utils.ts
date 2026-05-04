import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('ar-SA').format(n)
}

export function formatCurrency(n: number): string {
  return `${new Intl.NumberFormat('ar-SA').format(n)} ريال`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${formatNumber(diffDays)} أيام`
  if (diffDays < 30) return `منذ ${formatNumber(Math.floor(diffDays / 7))} أسابيع`
  return `منذ ${formatNumber(Math.floor(diffDays / 30))} أشهر`
}
