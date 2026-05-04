'use client'

import Link from 'next/link'
import { ShoppingCart, Briefcase, ChefHat, Building2, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { RiskBadge } from '@/components/financial/RiskBadge'
import { DOMAIN_LABELS, STATUS_LABELS } from '@/lib/constants'

export type Project = {
  id: string
  name: string
  domain: 'ECOMMERCE' | 'SERVICES' | 'RESTAURANT' | 'REAL_ESTATE'
  status: 'draft' | 'diagnosed' | 'strategy_ready' | 'producing' | 'monitoring'
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  score: number
  updatedAt: string
}

const DOMAIN_ICONS: Record<Project['domain'], React.ElementType> = {
  ECOMMERCE: ShoppingCart,
  SERVICES: Briefcase,
  RESTAURANT: ChefHat,
  REAL_ESTATE: Building2,
}

const SCORE_COLOR = (score: number) => {
  if (score < 25) return 'bg-red-500'
  if (score < 55) return 'bg-yellow-400'
  if (score < 85) return 'bg-blue-400'
  return 'bg-green-400'
}

export function ProjectCard({ project }: { project: Project }) {
  const Icon = DOMAIN_ICONS[project.domain]
  return (
    <Card className="hover:border-slate-700 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-800 p-2">
              <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">{project.name}</h3>
              <p className="text-xs text-slate-500">{DOMAIN_LABELS[project.domain]}</p>
            </div>
          </div>
          <RiskBadge level={project.riskLevel} />
        </div>

        {/* Score bar */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">نقاط الصحة المالية</span>
            <span className="font-semibold text-slate-200">{project.score}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${SCORE_COLOR(project.score)}`}
              style={{ width: `${project.score}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
            {STATUS_LABELS[project.status]}
          </span>
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            عرض التفاصيل
            <ArrowLeft className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
