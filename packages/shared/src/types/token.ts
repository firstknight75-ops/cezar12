// ─── Token state ──────────────────────────────────────────────────────────────

import type { PlanName } from "./domain.js"

export type TokenState = {
  planUsed: number
  planTotal: number
  addonBalance: number
}

// ─── Plan allocations ─────────────────────────────────────────────────────────

export const PLAN_MONTHLY_TOKENS: Record<PlanName, number> = {
  silver: 500,
  gold: 1_000,
  platinum: 2_500,
}

// ─── Service costs (mirrors server SERVICE_COSTS) ─────────────────────────────

export const SERVICE_COSTS: Record<string, Record<PlanName, number | null>> = {
  initial_assessment:   { silver: 0,    gold: 0,    platinum: 0    },
  plan_90day:           { silver: 80,   gold: 60,   platinum: 45   },
  weekly_content:       { silver: 50,   gold: 40,   platinum: 30   },
  market_research:      { silver: 60,   gold: 50,   platinum: 35   },
  buyer_persona:        { silver: 40,   gold: 30,   platinum: 25   },
  visual_identity:      { silver: 50,   gold: 40,   platinum: 30   },
  seo_plan:             { silver: 60,   gold: 45,   platinum: 35   },
  ad_campaign:          { silver: 70,   gold: 55,   platinum: 40   },
  performance_report:   { silver: 30,   gold: 25,   platinum: 20   },
  lead_generation:      { silver: 50,   gold: 40,   platinum: 30   },
  kitchen_cost_analysis:{ silver: null, gold: 40,   platinum: 25   },
  recipe_costing:       { silver: null, gold: 20,   platinum: 10   },
  promotion_optimizer:  { silver: null, gold: 35,   platinum: 20   },
}
