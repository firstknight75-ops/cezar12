// ─── Types ────────────────────────────────────────────────────────────────────

export type TrueCostInput = {
  selling_price: number
  food_cost_pct: number
  labor_pct: number
  overhead_pct: number
  packaging_pct: number
  delivery_commission_pct: number
  wastage_pct: number
  marketing_pct: number
  /** Override the alert threshold (default: 30) */
  target_food_cost_pct?: number
}

export type CostComponent = {
  name: string
  pct: number
  amount: number
}

export type TrueCostResult = {
  true_cost_total: number
  net_margin: number
  net_margin_pct: number
  components: CostComponent[]
  is_profitable: boolean
  alerts: string[]
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export class TrueCostCalculator {
  calculate(input: TrueCostInput): TrueCostResult {
    const {
      selling_price,
      food_cost_pct,
      labor_pct,
      overhead_pct,
      packaging_pct,
      delivery_commission_pct,
      wastage_pct,
      marketing_pct,
      target_food_cost_pct = 30,
    } = input

    const componentDefs: Array<[string, number]> = [
      ["Food Cost", food_cost_pct],
      ["Labor", labor_pct],
      ["Overhead", overhead_pct],
      ["Packaging", packaging_pct],
      ["Delivery Commission", delivery_commission_pct],
      ["Wastage", wastage_pct],
      ["Marketing", marketing_pct],
    ]

    const components: CostComponent[] = componentDefs.map(([name, pct]) => ({
      name,
      pct,
      amount: round2(selling_price * pct / 100),
    }))

    const true_cost_total = round2(
      components.reduce((sum, c) => sum + c.amount, 0),
    )
    const net_margin = round2(selling_price - true_cost_total)
    const net_margin_pct = selling_price > 0
      ? round2((net_margin / selling_price) * 100)
      : 0

    const alerts: string[] = []

    if (food_cost_pct > target_food_cost_pct) {
      alerts.push(
        `Food cost (${food_cost_pct}%) exceeds the ${target_food_cost_pct}% target.`,
      )
    }
    if (net_margin_pct < 10) {
      alerts.push(
        `Net margin (${net_margin_pct}%) is below the minimum 10% threshold.`,
      )
    }

    return {
      true_cost_total,
      net_margin,
      net_margin_pct,
      components,
      is_profitable: net_margin > 0,
      alerts,
    }
  }
}

export const trueCostCalculator = new TrueCostCalculator()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
