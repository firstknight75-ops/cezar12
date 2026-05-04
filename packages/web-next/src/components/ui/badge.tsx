import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        secondary: 'border-slate-700 bg-slate-800 text-slate-300',
        destructive: 'border-red-500/30 bg-red-500/10 text-red-400',
        success: 'border-green-500/30 bg-green-400/10 text-green-400',
        warning: 'border-yellow-500/30 bg-yellow-400/10 text-yellow-400',
        outline: 'border-slate-700 text-slate-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
