import type { ServiceType, SubscriptionPlan } from '../types/index.js';

// ═══════════════════════════════════════════════════════════
// TOKEN COSTS PER SERVICE PER PLAN
// ═══════════════════════════════════════════════════════════

export const TOKEN_COSTS: Record<
  SubscriptionPlan,
  Record<string, number>
> = {
  silver: {
    plan_generation: 80,
    weekly_content: 50,
    market_research: 60,
    buyer_persona: 40,
    branding: 50,
    seo_strategy: 60,
    ad_campaign: 70,
    performance_report: 30,
    lead_generation: 50,
    kitchen_analysis: 40,
    recipe_costing: 20,
    promotion_optimization: 30,
    image_processing: 5,
    data_edit_light: 2,
    data_edit_heavy: 5,
    pdf_export: 2,
    integrated_plan_no_followup: 300,
  },
  gold: {
    plan_generation: 60,
    weekly_content: 40,
    market_research: 50,
    buyer_persona: 30,
    branding: 40,
    seo_strategy: 45,
    ad_campaign: 55,
    performance_report: 25,
    lead_generation: 40,
    kitchen_analysis: 30,
    recipe_costing: 15,
    promotion_optimization: 25,
    image_processing: 3,
    data_edit_light: 2,
    data_edit_heavy: 4,
    pdf_export: 1,
    integrated_plan_no_followup: 230,
  },
  platinum: {
    plan_generation: 45,
    weekly_content: 30,
    market_research: 35,
    buyer_persona: 25,
    branding: 30,
    seo_strategy: 35,
    ad_campaign: 40,
    performance_report: 20,
    lead_generation: 30,
    kitchen_analysis: 25,
    recipe_costing: 10,
    promotion_optimization: 20,
    image_processing: 2,
    data_edit_light: 1,
    data_edit_heavy: 3,
    pdf_export: 0,
    integrated_plan_no_followup: 170,
    integrated_plan_with_followup: 500,
  },
} as const;

// ═══════════════════════════════════════════════════════════
// FREE OPERATIONS (no token deduction)
// ═══════════════════════════════════════════════════════════

export const FREE_OPERATIONS = new Set<string>([
  'initial_financial_analysis',
  'digital_presence_scan',
  'daily_recommendations',
  'view_results',
  'health_check',
]);

// ═══════════════════════════════════════════════════════════
// FINANCIAL FIELDS (trigger heavy edit cost)
// ═══════════════════════════════════════════════════════════

export const FINANCIAL_FIELDS = new Set<string>([
  'selling_price',
  'cost_of_goods',
  'monthly_fixed_costs',
  'monthly_revenue',
  'commission_rate',
  'food_cost_percentage',
  'hourly_rate',
  'avg_deal_value',
  'monthly_marketing_budget',
  'seating_capacity',
  'average_check_per_person',
]);

// ═══════════════════════════════════════════════════════════
// SUBSCRIPTION PLANS CONFIG
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// TOKEN ADD-ON PACKAGES
// ═══════════════════════════════════════════════════════════

export const TOKEN_ADDONS = {
  micro: { tokens: 200, price: 15 },
  small: { tokens: 500, price: 35 },
  medium: { tokens: 1500, price: 99 },
  large: { tokens: 5000, price: 299 },
  enterprise: { tokens: 15000, price: 799 },
} as const;

export type TokenAddonSize = keyof typeof TOKEN_ADDONS;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export function getTokenCost(
  plan: SubscriptionPlan,
  serviceType: string
): number {
  return TOKEN_COSTS[plan][serviceType] ?? 0;
}

export function isFreeOperation(serviceType: string): boolean {
  return FREE_OPERATIONS.has(serviceType);
}

export function getEditCost(
  changedFields: string[],
  plan: SubscriptionPlan
): number {
  const financialChanges = changedFields.filter((f) =>
    FINANCIAL_FIELDS.has(f)
  ).length;
  const isSubstantial = financialChanges >= 3;
  const base = isSubstantial ? 5 : 2;
  const discount = plan === 'platinum' ? 1 : 0;
  return Math.max(0, base - discount);
}
