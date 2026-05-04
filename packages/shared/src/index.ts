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
//  ──────────────────────────────────────────────────
export * from './types/index.js';
export * from './constants/tokens.js';
export * from './constants/domains.js';

export const SHARED_VERSION = '0.0.1';
export const DISCLAIMER =
  'هذا التحليل إرشادي فقط ولا يُشكّل استشارة مالية متخصصة. النتائج تعتمد على البيانات المُدخلة. استشر متخصصاً قبل اتخاذ قرارات مالية كبيرة.';
