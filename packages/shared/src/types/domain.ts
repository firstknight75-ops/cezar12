// ─── Domain ───────────────────────────────────────────────────────────────────

export type Domain = "ECOMMERCE" | "SERVICES" | "RESTAURANT" | "REAL_ESTATE"
export type DomainKey = "ecommerce" | "services" | "restaurant" | "real_estate"
export type PlanName = "silver" | "gold" | "platinum"
export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

// ─── Financial analysis ───────────────────────────────────────────────────────

export type FinancialResult = {
  risk_level: RiskLevel
  financial_score: number
  metrics: Record<string, number>
  recommendations: string[]
  can_proceed: boolean
  disclaimer: string
}

export type EcommerceData = {
  selling_price: number
  cost_of_goods: number
  monthly_fixed_costs: number
  monthly_marketing_budget: number
}

export type ServicesData = {
  hourly_rate: number
  monthly_hours_capacity: number
  current_utilization_pct: number
  monthly_fixed_costs: number
}

export type RestaurantData = {
  seating_capacity: number
  avg_table_turn_minutes: number
  daily_operating_hours: number
  average_check_per_person: number
  food_cost_percentage: number
  monthly_fixed_costs: number
}

export type RealEstateData = {
  avg_deal_value: number
  commission_rate: number
  monthly_transactions: number
  monthly_fixed_costs: number
}

export type DomainData = EcommerceData | ServicesData | RestaurantData | RealEstateData
