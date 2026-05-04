'use client'

import { create } from 'zustand'

type Domain = 'ECOMMERCE' | 'SERVICES' | 'RESTAURANT' | 'REAL_ESTATE'
type ProjectStatus = 'draft' | 'diagnosed' | 'strategy_ready' | 'producing' | 'monitoring'
type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

type Project = {
  id: string
  name: string
  domain: Domain
  status: ProjectStatus
  riskLevel: RiskLevel
  score: number
  updatedAt: string
}

type ProjectState = {
  projects: Project[]
  selectedProjectId: string | null
  setSelectedProject: (id: string) => void
  addProject: (project: Project) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [
    { id: '1', name: 'متجر الأناقة', domain: 'ECOMMERCE', status: 'monitoring', riskLevel: 'LOW', score: 87, updatedAt: '2026-05-01' },
    { id: '2', name: 'مطعم البيت', domain: 'RESTAURANT', status: 'strategy_ready', riskLevel: 'MEDIUM', score: 65, updatedAt: '2026-04-28' },
    { id: '3', name: 'استشارات الأعمال', domain: 'SERVICES', status: 'diagnosed', riskLevel: 'HIGH', score: 42, updatedAt: '2026-04-20' },
    { id: '4', name: 'العقارات الذهبية', domain: 'REAL_ESTATE', status: 'draft', riskLevel: 'CRITICAL', score: 18, updatedAt: '2026-04-10' },
  ],
  selectedProjectId: '1',
  setSelectedProject: (id) => set({ selectedProjectId: id }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
}))
