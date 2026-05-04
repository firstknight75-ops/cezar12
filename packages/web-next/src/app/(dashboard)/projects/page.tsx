'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProjectCard, type Project } from '@/components/projects/ProjectCard'
import { useRouter } from 'next/navigation'

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'متجر الأناقة', domain: 'ECOMMERCE', status: 'monitoring', riskLevel: 'LOW', score: 87, updatedAt: '2026-05-01' },
  { id: '2', name: 'مطعم البيت', domain: 'RESTAURANT', status: 'strategy_ready', riskLevel: 'MEDIUM', score: 65, updatedAt: '2026-04-28' },
  { id: '3', name: 'استشارات الأعمال', domain: 'SERVICES', status: 'diagnosed', riskLevel: 'HIGH', score: 42, updatedAt: '2026-04-20' },
  { id: '4', name: 'العقارات الذهبية', domain: 'REAL_ESTATE', status: 'draft', riskLevel: 'CRITICAL', score: 18, updatedAt: '2026-04-10' },
  { id: '5', name: 'متجر الإلكترونيات', domain: 'ECOMMERCE', status: 'diagnosed', riskLevel: 'MEDIUM', score: 61, updatedAt: '2026-04-05' },
  { id: '6', name: 'مطعم المندي', domain: 'RESTAURANT', status: 'monitoring', riskLevel: 'LOW', score: 91, updatedAt: '2026-03-28' },
]

const TABS = [
  { value: 'all', label: 'الكل' },
  { value: 'ECOMMERCE', label: 'تجارة' },
  { value: 'SERVICES', label: 'خدمات' },
  { value: 'RESTAURANT', label: 'مطعم' },
  { value: 'REAL_ESTATE', label: 'عقارات' },
]

export default function ProjectsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  return (
    <div>
      <PageHeader
        title="المشاريع"
        description="إدارة ومتابعة جميع مشاريعك التجارية"
        action={
          <Button asChild>
            <Link href="/projects/new"><Plus className="h-4 w-4" />مشروع جديد</Link>
          </Button>
        }
      />

      <div className="mb-6 relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="ابحث عن مشروع..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>

        {TABS.map((tab) => {
          const filtered = MOCK_PROJECTS.filter((p) => {
            const matchesDomain = tab.value === 'all' || p.domain === tab.value
            const matchesSearch = !search || p.name.includes(search)
            return matchesDomain && matchesSearch
          })
          return (
            <TabsContent key={tab.value} value={tab.value}>
              {filtered.length === 0 ? (
                <EmptyState
                  title="لا توجد مشاريع"
                  description="لم يتم العثور على مشاريع تطابق البحث"
                  action={{ label: 'مشروع جديد', onClick: () => router.push('/projects/new') }}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
