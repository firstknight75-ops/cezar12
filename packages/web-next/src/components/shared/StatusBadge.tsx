import { Badge } from '@/components/ui/badge'

type Status = 'active' | 'inactive' | 'pending' | 'error' | 'success'

const STATUS_MAP: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }> = {
  active: { label: 'نشط', variant: 'success' },
  inactive: { label: 'غير نشط', variant: 'secondary' },
  pending: { label: 'قيد الانتظار', variant: 'warning' },
  error: { label: 'خطأ', variant: 'destructive' },
  success: { label: 'مكتمل', variant: 'success' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, variant } = STATUS_MAP[status]
  return <Badge variant={variant}>{label}</Badge>
}
