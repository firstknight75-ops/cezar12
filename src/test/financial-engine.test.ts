import { describe, it, expect } from 'vitest'
import { FinancialEngine, financialEngine } from '../lib/financial-engine'
import { ZodError } from 'zod'

describe('FinancialEngine', () => {
  it('exports singleton', () => {
    expect(financialEngine).toBeInstanceOf(FinancialEngine)
  })

  describe('ECOMMERCE', () => {
    it('CRITICAL when margin < 0', () => {
      const r = financialEngine.analyze('ECOMMERCE', {
        selling_price: 50,
        cost_of_goods: 60,
        monthly_fixed_costs: 5000,
        monthly_marketing_budget: 1000,
      })
      expect(r.risk_level).toBe('CRITICAL')
      expect(r.financial_score).toBeGreaterThanOrEqual(0)
      expect(r.financial_score).toBeLessThanOrEqual(24)
      expect(r.can_proceed).toBe(false)
    })

    it('HIGH when 0 <= margin < 15%', () => {
      const r = financialEngine.analyze('ECOMMERCE', {
        selling_price: 100,
        cost_of_goods: 92,
        monthly_fixed_costs: 5000,
        monthly_marketing_budget: 500,
      })
      expect(r.risk_level).toBe('HIGH')
      expect(r.financial_score).toBeGreaterThanOrEqual(25)
      expect(r.financial_score).toBeLessThanOrEqual(54)
      expect(r.can_proceed).toBe(true)
    })

    it('MEDIUM when 15% <= margin <= 30%', () => {
      const r = financialEngine.analyze('ECOMMERCE', {
        selling_price: 100,
        cost_of_goods: 77,
        monthly_fixed_costs: 5000,
        monthly_marketing_budget: 500,
      })
      expect(r.metrics.gross_margin_pct).toBeCloseTo(23)
      expect(r.risk_level).toBe('MEDIUM')
      expect(r.financial_score).toBeGreaterThanOrEqual(55)
      expect(r.financial_score).toBeLessThanOrEqual(84)
    })

    it('LOW when margin > 30%', () => {
      const r = financialEngine.analyze('ECOMMERCE', {
        selling_price: 100,
        cost_of_goods: 50,
        monthly_fixed_costs: 5000,
        monthly_marketing_budget: 500,
      })
      expect(r.risk_level).toBe('LOW')
      expect(r.financial_score).toBeGreaterThanOrEqual(85)
      expect(r.financial_score).toBeLessThanOrEqual(100)
    })

    it('computes metrics correctly', () => {
      const r = financialEngine.analyze('ECOMMERCE', {
        selling_price: 100,
        cost_of_goods: 60,
        monthly_fixed_costs: 4000,
        monthly_marketing_budget: 800,
      })
      expect(r.metrics.gross_margin_pct).toBeCloseTo(40)
      expect(r.metrics.break_even_units).toBeCloseTo(100) // 4000 / 40
      expect(r.metrics.contribution_per_unit).toBeCloseTo(40)
    })

    it('throws ZodError on invalid input', () => {
      expect(() =>
        financialEngine.analyze('ECOMMERCE', {
          selling_price: -10,
          cost_of_goods: 5,
          monthly_fixed_costs: 1000,
          monthly_marketing_budget: 100,
        } as never),
      ).toThrow(ZodError)
    })
  })

  describe('SERVICES', () => {
    it('CRITICAL when utilization < break-even', () => {
      const r = financialEngine.analyze('SERVICES', {
        hourly_rate: 100,
        monthly_hours_capacity: 160,
        current_utilization_pct: 10,
        monthly_fixed_costs: 8000, // break_even = 8000/16000 = 50%
      })
      expect(r.risk_level).toBe('CRITICAL')
      expect(r.can_proceed).toBe(false)
    })

    it('HIGH when break_even <= util < 50', () => {
      const r = financialEngine.analyze('SERVICES', {
        hourly_rate: 100,
        monthly_hours_capacity: 160,
        current_utilization_pct: 40,
        monthly_fixed_costs: 3200, // break_even = 20%
      })
      expect(r.risk_level).toBe('HIGH')
    })

    it('MEDIUM when 50 <= util <= 70', () => {
      const r = financialEngine.analyze('SERVICES', {
        hourly_rate: 100,
        monthly_hours_capacity: 160,
        current_utilization_pct: 60,
        monthly_fixed_costs: 3200,
      })
      expect(r.risk_level).toBe('MEDIUM')
    })

    it('LOW when util > 70', () => {
      const r = financialEngine.analyze('SERVICES', {
        hourly_rate: 100,
        monthly_hours_capacity: 160,
        current_utilization_pct: 85,
        monthly_fixed_costs: 3200,
      })
      expect(r.risk_level).toBe('LOW')
    })

    it('computes metrics correctly', () => {
      const r = financialEngine.analyze('SERVICES', {
        hourly_rate: 100,
        monthly_hours_capacity: 160,
        current_utilization_pct: 75,
        monthly_fixed_costs: 4000,
      })
      expect(r.metrics.monthly_revenue_potential).toBeCloseTo(16000)
      expect(r.metrics.current_revenue).toBeCloseTo(12000)
      expect(r.metrics.break_even_utilization).toBeCloseTo(25)
    })
  })

  describe('RESTAURANT', () => {
    it('CRITICAL when food_cost >= 70', () => {
      const r = financialEngine.analyze('RESTAURANT', {
        seating_capacity: 50,
        avg_table_turn_minutes: 45,
        daily_operating_hours: 10,
        average_check_per_person: 80,
        food_cost_percentage: 75,
        monthly_fixed_costs: 30000,
      })
      expect(r.risk_level).toBe('CRITICAL')
      expect(r.can_proceed).toBe(false)
    })

    it('HIGH when food_cost 40-70', () => {
      const r = financialEngine.analyze('RESTAURANT', {
        seating_capacity: 50,
        avg_table_turn_minutes: 45,
        daily_operating_hours: 10,
        average_check_per_person: 80,
        food_cost_percentage: 55,
        monthly_fixed_costs: 30000,
      })
      expect(r.risk_level).toBe('HIGH')
    })

    it('MEDIUM when food_cost 30-40', () => {
      const r = financialEngine.analyze('RESTAURANT', {
        seating_capacity: 50,
        avg_table_turn_minutes: 45,
        daily_operating_hours: 10,
        average_check_per_person: 80,
        food_cost_percentage: 35,
        monthly_fixed_costs: 30000,
      })
      expect(r.risk_level).toBe('MEDIUM')
    })

    it('LOW when food_cost < 30', () => {
      const r = financialEngine.analyze('RESTAURANT', {
        seating_capacity: 50,
        avg_table_turn_minutes: 45,
        daily_operating_hours: 10,
        average_check_per_person: 80,
        food_cost_percentage: 25,
        monthly_fixed_costs: 30000,
      })
      expect(r.risk_level).toBe('LOW')
    })

    it('computes max_daily_covers correctly', () => {
      // floor(50 / 45 * 10 * 60) = floor(666.67) = 666
      const r = financialEngine.analyze('RESTAURANT', {
        seating_capacity: 50,
        avg_table_turn_minutes: 45,
        daily_operating_hours: 10,
        average_check_per_person: 100,
        food_cost_percentage: 30,
        monthly_fixed_costs: 20000,
      })
      expect(r.metrics.max_daily_covers).toBe(666)
      expect(r.metrics.potential_daily_revenue).toBeCloseTo(66600)
      expect(r.metrics.potential_monthly_revenue).toBeCloseTo(1998000)
    })
  })

  describe('REAL_ESTATE', () => {
    it('CRITICAL when buffer < 0', () => {
      const r = financialEngine.analyze('REAL_ESTATE', {
        avg_deal_value: 300000,
        commission_rate: 2,
        monthly_transactions: 1,
        monthly_fixed_costs: 20000, // commission = 6000 < 20000
      })
      expect(r.risk_level).toBe('CRITICAL')
      expect(r.can_proceed).toBe(false)
    })

    it('HIGH when buffer 0-20%', () => {
      const r = financialEngine.analyze('REAL_ESTATE', {
        avg_deal_value: 300000,
        commission_rate: 2,
        monthly_transactions: 4,
        monthly_fixed_costs: 20000, // commission = 24000, buffer = 20%
      })
      expect(r.risk_level).toBe('HIGH')
    })

    it('MEDIUM when buffer 20-50%', () => {
      const r = financialEngine.analyze('REAL_ESTATE', {
        avg_deal_value: 300000,
        commission_rate: 2,
        monthly_transactions: 5,
        monthly_fixed_costs: 20000, // commission = 30000, buffer = 50%... edge
      })
      expect(r.risk_level).toBe('MEDIUM')
    })

    it('LOW when buffer > 50%', () => {
      const r = financialEngine.analyze('REAL_ESTATE', {
        avg_deal_value: 300000,
        commission_rate: 2,
        monthly_transactions: 8,
        monthly_fixed_costs: 20000, // commission = 48000, buffer = 140%
      })
      expect(r.risk_level).toBe('LOW')
    })

    it('computes metrics correctly', () => {
      const r = financialEngine.analyze('REAL_ESTATE', {
        avg_deal_value: 500000,
        commission_rate: 2.5,
        monthly_transactions: 3,
        monthly_fixed_costs: 15000,
      })
      expect(r.metrics.commission_per_deal).toBeCloseTo(12500)
      expect(r.metrics.monthly_commission).toBeCloseTo(37500)
      expect(r.metrics.break_even_deals).toBe(2)
      expect(r.metrics.buffer_pct).toBeCloseTo(150)
    })
  })

  describe('result shape', () => {
    it('always includes Arabic disclaimer', () => {
      const r = financialEngine.analyze('ECOMMERCE', {
        selling_price: 100,
        cost_of_goods: 50,
        monthly_fixed_costs: 5000,
        monthly_marketing_budget: 500,
      })
      expect(r.disclaimer).toContain('تنبيه')
    })

    it('can_proceed is false only for CRITICAL', () => {
      const critical = financialEngine.analyze('ECOMMERCE', {
        selling_price: 50,
        cost_of_goods: 60,
        monthly_fixed_costs: 5000,
        monthly_marketing_budget: 1000,
      })
      expect(critical.can_proceed).toBe(false)

      const high = financialEngine.analyze('ECOMMERCE', {
        selling_price: 100,
        cost_of_goods: 93,
        monthly_fixed_costs: 5000,
        monthly_marketing_budget: 500,
      })
      expect(high.can_proceed).toBe(true)
    })

    it('throws ZodError on invalid domain', () => {
      expect(() =>
        financialEngine.analyze('INVALID' as never, {} as never),
      ).toThrow(ZodError)
    })
  })

  describe('performance', () => {
    it('runs 1000 analyses in <150ms', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        financialEngine.analyze('ECOMMERCE', {
          selling_price: 100,
          cost_of_goods: 55,
          monthly_fixed_costs: 5000,
          monthly_marketing_budget: 500,
        })
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(150)
    })
  })
})
