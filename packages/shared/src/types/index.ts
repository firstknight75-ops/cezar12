// ═══════════════════════════════════════════════════════════
// DOMAIN TYPES
// ═══════════════════════════════════════════════════════════

export type DomainID =
  | 'ecommerce'
  | 'services'
  | 'restaurant'
  | 'real_estate';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectStatus =
  | 'draft'
  | 'diagnosed'
  | 'strategy_ready'
  | 'producing'
  | 'monitoring';

export type SubscriptionPlan = 'silver' | 'gold' | 'platinum';

export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'past_due'
  | 'trial';

export type ServiceType =
  | 'plan_generation'
  | 'weekly_content'
  | 'ad_campaign'
  | 'market_research'
  | 'buyer_persona'
  | 'branding'
  | 'seo_strategy'
  | 'lead_generation'
  | 'performance_report'
  | 'kitchen_analysis'
  | 'recipe_costing'
  | 'promotion_optimization'
  | 'image_processing'
  | 'digital_presence_scan';

export type ExecutionStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'dead_letter';

export type MarginStatus =
  | 'on_target'
  | 'below_target'
  | 'critical'
  | 'above_target';

export type KitchenProfile = 'light' | 'medium' | 'heavy';

export type DeliveryChannel = 'dine_in' | 'takeaway' | 'delivery';

export type AssetType = 'logo' | 'product' | 'brand' | 'other';

export type RecommendationType =
  | 'IncreasePrice'
  | 'Promote'
  | 'Remove'
  | 'Investigate'
  | 'SupplierChange'
  | 'CostReduction';

export type ActionStatus =
  | 'New'
  | 'Approved'
  | 'In Progress'
  | 'Done'
  | 'Cancelled';

export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

// ═══════════════════════════════════════════════════════════
// UBO TYPES
// ═══════════════════════════════════════════════════════════

export interface UBOBusinessContext {
  project_id: string;
  name: string;
  domain_id: DomainID;
  stage: 'new' | 'growing' | 'established';
  description: string;
  location: string;
  years_in_business: number;
  website?: string;
}

export interface UBOFinancialContext {
  monthly_budget: number;
  risk_level: RiskLevel;
  blocking: boolean;
  metrics: Record<string, number>;
  financial_constraints: string[];
  last_calculated: string;
}

export interface UBOBrandContext {
  voice: {
    tone: string;
    style: string;
    example_phrases: string[];
  };
  positioning: 'budget' | 'mid-range' | 'premium' | 'luxury';
  forbidden_words: string[];
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  unique_selling_points: string[];
  key_messages: string[];
}

export interface UBOPersona {
  name: string;
  age_range: string;
  gender: 'male' | 'female' | 'both';
  interests: string[];
  pain_points: string[];
  preferred_platforms: string[];
  buying_motivation: string;
}

export interface UBOAudienceContext {
  primary_persona: UBOPersona;
  secondary_persona?: UBOPersona;
  geographic_focus: string;
}

export interface UBOChannelStrategy {
  primary_channel: string;
  secondary_channels: string[];
  budget_allocation: Record<string, number>;
  rationale: string;
}

export interface UBOKPISet {
  followers_target?: number;
  engagement_rate_target?: number;
  website_visits_target?: number;
  leads_target?: number;
  sales_target?: number;
  roas_target?: number;
  [key: string]: number | undefined;
}

export interface UBOStrategyContext {
  channel_strategy: UBOChannelStrategy | null;
  content_pillars: string[];
  current_phase: string | null;
  phase_started_at: string | null;
  kpi_targets: {
    month_1: UBOKPISet;
    month_2: UBOKPISet;
    month_3: UBOKPISet;
  } | null;
}

export interface UBOPerformanceContext {
  winning_content_types: string[];
  losing_content_types: string[];
  actual_roas: number | null;
  actual_cac: number | null;
  actual_conversion_rate: number | null;
  best_performing_channels: string[];
  worst_performing_channels: string[];
  last_performance_update: string | null;
  reports_count: number;
}

export interface UBOContentHistory {
  total_pieces_produced: number;
  last_weekly_content_date: string | null;
  recent_topics: string[];
  recent_hooks: string[];
  recent_themes: string[];
  used_ctas: string[];
}

export interface UBOMetadata {
  version: number;
  completeness_score: number;
  missing_required_fields: string[];
  created_at: string;
  updated_at: string;
  last_service_used: string | null;
  total_tokens_spent: number;
}

export interface UBO {
  business_context: UBOBusinessContext;
  financial_context: UBOFinancialContext;
  brand_context: UBOBrandContext;
  audience_context: UBOAudienceContext;
  strategy_context: UBOStrategyContext;
  performance_context: UBOPerformanceContext;
  content_history: UBOContentHistory;
  metadata: UBOMetadata;
}

// ═══════════════════════════════════════════════════════════
// FINANCIAL TYPES
// ═══════════════════════════════════════════════════════════

export interface FinancialRisk {
  level: RiskLevel;
  blocking: boolean;
  reasons: string[];
  score: number;
}

export interface FinancialAnalysis {
  domain: DomainID;
  metrics: Record<string, number>;
  risk: FinancialRisk;
  recommendations: string[];
  quick_actions: string[];
  minimum_safe_actions: string[];
  disclaimer: string;
  calculated_at: string;
}

// ═══════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════

export interface ApiMeta {
  request_id: string;
  timestamp: string;
  version?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiError {
  code: string;
  message: string;
  user_message: string;
  details?: ApiErrorDetail[] | Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ═══════════════════════════════════════════════════════════
// TASK / JOB TYPES
// ═══════════════════════════════════════════════════════════

export interface TaskPayload {
  task_id: string;
  project_id: string;
  user_id: string;
  tenant_id: string;
  domain_id: DomainID;
  service_type: ServiceType;
  ubo: UBO;
  priority: number;
  created_at: string;
  metadata: Record<string, unknown>;
}

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

// ═══════════════════════════════════════════════════════════
// TOKEN TYPES
// ═══════════════════════════════════════════════════════════

export interface TokenBalance {
  subscription_tokens: number;
  addon_tokens: number;
  total_available: number;
  plan: SubscriptionPlan;
  period_end: string;
}

// ═══════════════════════════════════════════════════════════
// TRUE COST BREAKDOWN (Restaurant)
// ═══════════════════════════════════════════════════════════

export interface TrueCostBreakdown {
  A_direct_ingredients: number;
  B_indirect_ingredients: number;
  C_kitchen_load: number;
  D_packaging: number;
  E_washing_cleaning: number;
  F_waste_allocation: number;
  G_overhead_per_plate: number;
  true_cost: number;
  food_cost: number;
  contribution_margin: number;
  margin_pct: number;
  food_cost_pct: number;
  margin_status: MarginStatus;
  minimum_safe_price: number;
  recommended_price: number;
}
