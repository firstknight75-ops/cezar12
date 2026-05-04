import { FolderOpen, Coins, FileText, Lightbulb, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProjectCard } from '@/components/projects/ProjectCard'
import type { Project } from '@/components/projects/ProjectCard'

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'متجر الأناقة', domain: 'ECOMMERCE', status: 'monitoring', riskLevel: 'LOW', score: 87, updatedAt: '2026-05-01' },
  { id: '2', name: 'مطعم البيت', domain: 'RESTAURANT', status: 'strategy_ready', riskLevel: 'MEDIUM', score: 65, updatedAt: '2026-04-28' },
  { id: '3', name: 'استشارات الأعمال', domain: 'SERVICES', status: 'diagnosed', riskLevel: 'HIGH', score: 42, updatedAt: '2026-04-20' },
]

const STATS = [
  { label: 'إجمالي المشاريع', value: '١٢', icon: FolderOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'الرصيد', value: '٢٥٠ رمز', icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { label: 'التقارير المكتملة', value: '٨', icon: FileText, color: 'text-green-400', bg: 'bg-green-400/10' },
  { label: 'التوصيات النشطة', value: '٥', icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-400/10' },
]

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على أداء مشاريعك"
        action={
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              مشروع جديد
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-50">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent projects */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">المشاريع الأخيرة</h2>
          <Link href="/projects" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            عرض الكل
            <TrendingUp className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PROJECTS.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-200">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'مشروع جديد', href: '/projects/new', icon: FolderOpen },
            { label: 'طلب تقرير', href: '/reports/new/1', icon: FileText },
            { label: 'شراء رموز', href: '/packages', icon: Coins },
            { label: 'التوصيات', href: '/recommendations', icon: Lightbulb },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-center hover:border-slate-700 hover:bg-slate-800/50 transition-colors"
              >
                <Icon className="h-6 w-6 text-blue-400" />
                <span className="text-sm text-slate-300">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
