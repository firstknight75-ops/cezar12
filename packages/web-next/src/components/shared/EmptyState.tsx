import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-800 p-4">
        <Inbox className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-200">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}
