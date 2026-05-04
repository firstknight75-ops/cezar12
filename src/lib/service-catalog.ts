export type PlanName = "silver" | "gold" | "platinum"
export type DomainKey = "ecommerce" | "services" | "restaurant" | "real_estate"

export type ServiceEntry = {
  key: string
  label: string
  labelAr: string
  description: string
  /** null = not available on that plan */
  cost: Record<PlanName, number | null>
  domains: "all" | DomainKey[]
  estimatedSeconds: number
}

// Mirrors SERVER_SIDE SERVICE_COSTS in token-service.ts exactly.
export const SERVICES: ServiceEntry[] = [
  {
    key: "initial_assessment",
    label: "Initial Assessment",
    labelAr: "التقييم الأولي",
    description: "Free health check of your business financials",
    cost: { silver: 0, gold: 0, platinum: 0 },
    domains: "all",
    estimatedSeconds: 30,
  },
  {
    key: "plan_90day",
    label: "90-Day Plan",
    labelAr: "خطة 90 يوماً",
    description: "Full action plan with weekly milestones",
    cost: { silver: 80, gold: 60, platinum: 45 },
    domains: "all",
    estimatedSeconds: 30,
  },
  {
    key: "weekly_content",
    label: "Weekly Content",
    labelAr: "محتوى أسبوعي",
    description: "4-week social content calendar",
    cost: { silver: 50, gold: 40, platinum: 30 },
    domains: "all",
    estimatedSeconds: 25,
  },
  {
    key: "market_research",
    label: "Market Research",
    labelAr: "أبحاث السوق",
    description: "Competitor landscape & positioning gap",
    cost: { silver: 60, gold: 50, platinum: 35 },
    domains: "all",
    estimatedSeconds: 25,
  },
  {
    key: "buyer_persona",
    label: "Buyer Persona",
    labelAr: "شخصية المشتري",
    description: "2-3 detailed customer personas",
    cost: { silver: 40, gold: 30, platinum: 25 },
    domains: "all",
    estimatedSeconds: 25,
  },
  {
    key: "visual_identity",
    label: "Visual Identity",
    labelAr: "الهوية البصرية",
    description: "Colors, type, logo direction & brand voice",
    cost: { silver: 50, gold: 40, platinum: 30 },
    domains: "all",
    estimatedSeconds: 25,
  },
  {
    key: "seo_plan",
    label: "SEO Plan",
    labelAr: "خطة السيو",
    description: "Keywords, on-page & link-building roadmap",
    cost: { silver: 60, gold: 45, platinum: 35 },
    domains: "all",
    estimatedSeconds: 30,
  },
  {
    key: "ad_campaign",
    label: "Ad Campaign",
    labelAr: "حملة إعلانية",
    description: "Paid ads strategy with 3 creative briefs",
    cost: { silver: 70, gold: 55, platinum: 40 },
    domains: "all",
    estimatedSeconds: 30,
  },
  {
    key: "performance_report",
    label: "Performance Report",
    labelAr: "تقرير الأداء",
    description: "ROI analysis & improvement actions",
    cost: { silver: 30, gold: 25, platinum: 20 },
    domains: "all",
    estimatedSeconds: 30,
  },
  {
    key: "lead_generation",
    label: "Lead Generation",
    labelAr: "توليد العملاء",
    description: "Lead magnets + 5-step nurture sequence",
    cost: { silver: 50, gold: 40, platinum: 30 },
    domains: "all",
    estimatedSeconds: 30,
  },
  // ─── Kitchen intelligence (restaurant domain only) ────────────────────────
  {
    key: "kitchen_cost_analysis",
    label: "Kitchen Cost Analysis",
    labelAr: "تحليل تكاليف المطبخ",
    description: "Cost drivers, menu engineering & margin uplift",
    cost: { silver: null, gold: 40, platinum: 25 },
    domains: ["restaurant"],
    estimatedSeconds: 15,
  },
  {
    key: "recipe_costing",
    label: "Recipe Costing",
    labelAr: "تكلفة الوصفات",
    description: "Per-dish cost, substitutions & wastage flags",
    cost: { silver: null, gold: 20, platinum: 10 },
    domains: ["restaurant"],
    estimatedSeconds: 15,
  },
]

export function getCost(key: string, plan: PlanName): number | null {
  return SERVICES.find((s) => s.key === key)?.cost[plan] ?? null
}

export function isAvailable(key: string, plan: PlanName): boolean {
  return getCost(key, plan) !== null
}

export function servicesForDomain(domain: DomainKey, plan: PlanName): ServiceEntry[] {
  return SERVICES.filter(
    (s) => s.domains === "all" || (s.domains as DomainKey[]).includes(domain),
  )
}
