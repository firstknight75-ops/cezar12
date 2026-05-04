// ─── Domain & financial types ─────────────────────────────────────────────────
export type {
  Domain,
  DomainKey,
  PlanName,
  RiskLevel,
  FinancialResult,
  EcommerceData,
  ServicesData,
  RestaurantData,
  RealEstateData,
  DomainData,
} from "./types/domain.js"

// ─── Service & job types ──────────────────────────────────────────────────────
export type {
  ServiceType,
  QueueName,
  AiJobStatus,
  JobStatus,
  WorkerJobData,
} from "./types/service.js"

export { QUEUE_FOR_SERVICE } from "./types/service.js"

// ─── Token types & constants ──────────────────────────────────────────────────
export type { TokenState } from "./types/token.js"
export { PLAN_MONTHLY_TOKENS, SERVICE_COSTS } from "./types/token.js"

// ─── Database schema ──────────────────────────────────────────────────────────
export * from "./db/schema.js"
