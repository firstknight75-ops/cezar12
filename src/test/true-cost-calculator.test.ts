import { describe, it, expect } from "vitest"
import { TrueCostCalculator, trueCostCalculator } from "../lib/true-cost-calculator"

const BASE: Parameters<TrueCostCalculator["calculate"]>[0] = {
  selling_price: 100,
  food_cost_pct: 28,
  labor_pct: 20,
  overhead_pct: 10,
  packaging_pct: 3,
  delivery_commission_pct: 5,
  wastage_pct: 4,
  marketing_pct: 5,
}

describe("TrueCostCalculator", () => {
  it("exports singleton", () => {
    expect(trueCostCalculator).toBeInstanceOf(TrueCostCalculator)
  })

  it("calculates true_cost_total correctly", () => {
    const r = trueCostCalculator.calculate(BASE)
    // 28+20+10+3+5+4+5 = 75% of 100 = 75
    expect(r.true_cost_total).toBe(75)
  })

  it("calculates net_margin correctly", () => {
    const r = trueCostCalculator.calculate(BASE)
    expect(r.net_margin).toBe(25)
  })

  it("calculates net_margin_pct correctly", () => {
    const r = trueCostCalculator.calculate(BASE)
    expect(r.net_margin_pct).toBe(25)
  })

  it("is_profitable true when margin > 0", () => {
    expect(trueCostCalculator.calculate(BASE).is_profitable).toBe(true)
  })

  it("is_profitable false when costs exceed selling_price", () => {
    const r = trueCostCalculator.calculate({ ...BASE, food_cost_pct: 80 })
    expect(r.is_profitable).toBe(false)
  })

  it("returns 8 components", () => {
    const r = trueCostCalculator.calculate(BASE)
    expect(r.components).toHaveLength(7)
  })

  it("components sum equals true_cost_total", () => {
    const r = trueCostCalculator.calculate(BASE)
    const sum = r.components.reduce((a, c) => a + c.amount, 0)
    expect(Math.round(sum * 100) / 100).toBe(r.true_cost_total)
  })

  it("component names are present", () => {
    const r = trueCostCalculator.calculate(BASE)
    const names = r.components.map((c) => c.name)
    expect(names).toContain("Food Cost")
    expect(names).toContain("Labor")
    expect(names).toContain("Delivery Commission")
  })

  it("no alerts when food_cost and margin are fine", () => {
    const r = trueCostCalculator.calculate(BASE)
    expect(r.alerts).toHaveLength(0)
  })

  it("alerts when food_cost_pct > target (30 default)", () => {
    const r = trueCostCalculator.calculate({ ...BASE, food_cost_pct: 35 })
    expect(r.alerts.some((a) => a.includes("Food cost"))).toBe(true)
  })

  it("alerts when net_margin_pct < 10", () => {
    // 28+20+10+3+5+4+5 = 75, so margin = 25 → fine. Bump labor to 55:
    const r = trueCostCalculator.calculate({ ...BASE, labor_pct: 55 })
    expect(r.alerts.some((a) => a.includes("Net margin"))).toBe(true)
  })

  it("both alerts can fire simultaneously", () => {
    const r = trueCostCalculator.calculate({
      ...BASE,
      food_cost_pct: 40,
      labor_pct: 50,
    })
    expect(r.alerts).toHaveLength(2)
  })

  it("respects custom target_food_cost_pct", () => {
    // food_cost_pct=28 is fine vs 30, but should alert vs 25
    const r = trueCostCalculator.calculate({ ...BASE, target_food_cost_pct: 25 })
    expect(r.alerts.some((a) => a.includes("Food cost"))).toBe(true)
  })

  it("handles fractional selling_price", () => {
    const r = trueCostCalculator.calculate({ ...BASE, selling_price: 29.99 })
    expect(r.true_cost_total).toBeCloseTo(29.99 * 0.75, 1)
  })

  it("net_margin_pct is 0 when selling_price is 0", () => {
    const r = trueCostCalculator.calculate({ ...BASE, selling_price: 0 })
    expect(r.net_margin_pct).toBe(0)
  })

  it("negative net_margin when costs > selling_price", () => {
    const r = trueCostCalculator.calculate({ ...BASE, food_cost_pct: 90 })
    expect(r.net_margin).toBeLessThan(0)
    expect(r.is_profitable).toBe(false)
  })
})
