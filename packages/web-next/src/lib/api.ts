function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay(): Promise<void> {
  return delay(300 + Math.random() * 500)
}

type LoginParams = { email: string; password: string }
type RegisterParams = { name: string; email: string; password: string }

type User = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'support'
  plan: 'silver' | 'gold' | 'platinum'
  tokenBalance: number
}

type Project = {
  id: string
  name: string
  domain: 'ECOMMERCE' | 'SERVICES' | 'RESTAURANT' | 'REAL_ESTATE'
  status: 'draft' | 'diagnosed' | 'strategy_ready' | 'producing' | 'monitoring'
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  score: number
  updatedAt: string
}

type ServiceItem = {
  id: string
  type: string
  name: string
  description: string
  tokenCost: number
  estimatedMinutes: number
  status: 'available' | 'processing' | 'completed' | 'failed'
}

type Job = {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result: string | null
  createdAt: string
}

type Report = {
  id: string
  title: string
  type: string
  createdAt: string
  status: 'ready' | 'generating'
}

const mockUser: User = {
  id: '1',
  name: 'محمد أحمد',
  email: 'mohammed@example.com',
  role: 'user',
  plan: 'gold',
  tokenBalance: 250,
}

const mockProjects: Project[] = [
  { id: '1', name: 'متجر الأناقة', domain: 'ECOMMERCE', status: 'monitoring', riskLevel: 'LOW', score: 87, updatedAt: '2026-05-01' },
  { id: '2', name: 'مطعم البيت', domain: 'RESTAURANT', status: 'strategy_ready', riskLevel: 'MEDIUM', score: 65, updatedAt: '2026-04-28' },
  { id: '3', name: 'استشارات الأعمال', domain: 'SERVICES', status: 'diagnosed', riskLevel: 'HIGH', score: 42, updatedAt: '2026-04-20' },
  { id: '4', name: 'العقارات الذهبية', domain: 'REAL_ESTATE', status: 'draft', riskLevel: 'CRITICAL', score: 18, updatedAt: '2026-04-10' },
  { id: '5', name: 'سوبرماركت الحي', domain: 'ECOMMERCE', status: 'producing', riskLevel: 'MEDIUM', score: 58, updatedAt: '2026-04-25' },
  { id: '6', name: 'خدمات التنظيف المتميزة', domain: 'SERVICES', status: 'monitoring', riskLevel: 'LOW', score: 91, updatedAt: '2026-05-02' },
]

const mockServices: ServiceItem[] = [
  { id: '1', type: 'growth_plan', name: 'خطة النمو', description: 'تحليل شامل وخطة عمل مخصصة لتنمية أعمالك', tokenCost: 50, estimatedMinutes: 5, status: 'available' },
  { id: '2', type: 'marketing_content', name: 'المحتوى التسويقي', description: 'محتوى تسويقي احترافي لمنصات التواصل الاجتماعي', tokenCost: 30, estimatedMinutes: 3, status: 'available' },
  { id: '3', type: 'financial_analysis', name: 'التحليل المالي', description: 'تقرير مالي مفصل مع توصيات للتحسين', tokenCost: 40, estimatedMinutes: 4, status: 'available' },
  { id: '4', type: 'risk_assessment', name: 'تقييم المخاطر', description: 'تحديد وتقييم المخاطر المحتملة في أعمالك', tokenCost: 35, estimatedMinutes: 4, status: 'available' },
]

const mockReports: Report[] = [
  { id: '1', title: 'تقرير النمو - متجر الأناقة', type: 'growth', createdAt: '2026-05-01', status: 'ready' },
  { id: '2', title: 'تحليل السوق - مطعم البيت', type: 'market', createdAt: '2026-04-28', status: 'ready' },
  { id: '3', title: 'التحليل المالي الشهري', type: 'financial', createdAt: '2026-04-20', status: 'generating' },
]

export const api = {
  auth: {
    login: async (params: LoginParams): Promise<User> => {
      await randomDelay()
      if (!params.email || !params.password) throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
      return mockUser
    },
    register: async (params: RegisterParams): Promise<User> => {
      await randomDelay()
      if (!params.email || !params.password || !params.name) throw new Error('جميع الحقول مطلوبة')
      return { ...mockUser, name: params.name, email: params.email }
    },
    logout: async (): Promise<void> => {
      await randomDelay()
    },
    me: async (): Promise<User> => {
      await randomDelay()
      return mockUser
    },
  },
  projects: {
    list: async (): Promise<Project[]> => {
      await randomDelay()
      return mockProjects
    },
    get: async (id: string): Promise<Project> => {
      await randomDelay()
      const project = mockProjects.find((p) => p.id === id)
      if (!project) throw new Error('المشروع غير موجود')
      return project
    },
    create: async (data: Omit<Project, 'id' | 'updatedAt'>): Promise<Project> => {
      await randomDelay()
      return {
        ...data,
        id: String(Date.now()),
        updatedAt: new Date().toISOString().split('T')[0],
      }
    },
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      await randomDelay()
      const project = mockProjects.find((p) => p.id === id)
      if (!project) throw new Error('المشروع غير موجود')
      return { ...project, ...data }
    },
    delete: async (_id: string): Promise<void> => {
      await randomDelay()
    },
  },
  services: {
    list: async (_projectId: string): Promise<ServiceItem[]> => {
      await randomDelay()
      return mockServices
    },
    request: async (_projectId: string, _serviceType: string): Promise<Job> => {
      await randomDelay()
      return {
        id: String(Date.now()),
        status: 'pending',
        result: null,
        createdAt: new Date().toISOString(),
      }
    },
    getJob: async (jobId: string): Promise<Job> => {
      await randomDelay()
      return {
        id: jobId,
        status: 'completed',
        result: 'تم اكتمال المهمة بنجاح. تم إنشاء خطة النمو المخصصة لمشروعك.',
        createdAt: new Date().toISOString(),
      }
    },
  },
  tokens: {
    getBalance: async (): Promise<{ balance: number }> => {
      await randomDelay()
      return { balance: 250 }
    },
    purchase: async (_pack: string): Promise<{ balance: number }> => {
      await randomDelay()
      return { balance: 500 }
    },
  },
  reports: {
    list: async (): Promise<Report[]> => {
      await randomDelay()
      return mockReports
    },
    get: async (id: string): Promise<Report> => {
      await randomDelay()
      const report = mockReports.find((r) => r.id === id)
      if (!report) throw new Error('التقرير غير موجود')
      return report
    },
  },
}
