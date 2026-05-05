/**
 * Local shim replacing the @cezar12/shared workspace package.
 * All types and constants are inlined here so the web package
 * can be built standalone without the monorepo workspace resolver.
 */

// ─── Subscription / Plan ──────────────────────────────────────────────────────

export type SubscriptionPlan = 'silver' | 'gold' | 'platinum';

// ─── Execution / Task ─────────────────────────────────────────────────────────

export type ExecutionStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'dead_letter';

export interface TaskStatus {
  task_id: string;
  status: ExecutionStatus;
  progress?: number;
  result_id?: string;
  result_url?: string;
  error?: string;
  tokens_used?: number;
  tokens_refunded?: number;
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
}

// ─── Token ────────────────────────────────────────────────────────────────────

export interface TokenBalance {
  subscription_tokens: number;
  addon_tokens: number;
  total_available: number;
  plan: SubscriptionPlan;
  period_end: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

interface ApiMeta {
  timestamp: string;
  request_id: string;
  version?: string;
}

interface ApiError {
  code: string;
  message: string;
  user_message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Plan Config ──────────────────────────────────────────────────────────────

export const PLAN_CONFIG = {
  silver: {
    monthly: { price: 49, tokens: 500, discount: 0 },
    quarterly: { price: 132, tokens: 500, discount: 10 },
    annual: { price: 441, tokens: 500, discount: 25 },
    maxProjects: 3,
    features: ['basic_services', 'financial_analysis'],
  },
  gold: {
    monthly: { price: 99, tokens: 1500, discount: 0 },
    quarterly: { price: 252, tokens: 1500, discount: 15 },
    annual: { price: 832, tokens: 1500, discount: 30 },
    maxProjects: 10,
    features: [
      'all_services',
      'kitchen_intelligence',
      'daily_recommendations',
      'competitor_analysis',
    ],
  },
  platinum: {
    monthly: { price: 199, tokens: 5000, discount: 0 },
    quarterly: { price: 478, tokens: 5000, discount: 20 },
    annual: { price: 1552, tokens: 5000, discount: 35 },
    maxProjects: Infinity,
    features: [
      'all_services',
      'kitchen_intelligence',
      'daily_recommendations',
      'integrated_plan_with_followup',
      'api_access',
      'white_label',
    ],
  },
} as const;
