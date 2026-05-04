// ─── Service types ────────────────────────────────────────────────────────────

export type ServiceType =
  | "plan_90day"
  | "weekly_content"
  | "market_research"
  | "buyer_persona"
  | "visual_identity"
  | "seo_plan"
  | "ad_campaign"
  | "performance_report"
  | "lead_generation"
  | "kitchen_cost_analysis"
  | "recipe_costing"
  | "promotion_optimizer"
  | "initial_assessment"

export type QueueName =
  | "plan-generation"
  | "content-generation"
  | "kitchen-analysis"
  | "image-processing"

export const QUEUE_FOR_SERVICE: Record<ServiceType, QueueName> = {
  plan_90day: "plan-generation",
  seo_plan: "plan-generation",
  ad_campaign: "plan-generation",
  performance_report: "plan-generation",
  lead_generation: "plan-generation",
  initial_assessment: "plan-generation",
  weekly_content: "content-generation",
  market_research: "content-generation",
  buyer_persona: "content-generation",
  visual_identity: "content-generation",
  kitchen_cost_analysis: "kitchen-analysis",
  recipe_costing: "kitchen-analysis",
  promotion_optimizer: "kitchen-analysis",
}

// ─── Job status ───────────────────────────────────────────────────────────────

export type AiJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "approved"
  | "rejected"
  | "deferred"

export type JobStatus = {
  id: string
  status: AiJobStatus
  resultContent: string | null
  tokensDeducted: number
  tokensRefunded: number
  startedAt: Date | null
  completedAt: Date | null
  approvedAt: Date | null
  expiresAt: Date | null
}

// ─── Worker job data ──────────────────────────────────────────────────────────

export type WorkerJobData = {
  dbJobId: string
  userId: string
  projectId: string
  serviceType: ServiceType
  prompt: string
  anonymizeValues: {
    company_name?: string
    city?: string
    phone?: string
    website_url?: string
  }
}
