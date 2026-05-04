import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'

export type Column<T> = {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'لا توجد بيانات',
}: DataTableProps<T>) {
  if (isLoading) return <LoadingState rows={5} />
  if (data.length === 0) return <EmptyState title={emptyMessage} />

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-slate-400">
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-slate-800/50 transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-slate-200">
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
