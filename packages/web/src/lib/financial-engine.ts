import { z } from 'zod'

// ─── Public types ─────────────────────────────────────────────────────────────

export type Domain = 'ECOMMERCE' | 'SERVICES' | 'RESTAURANT' | 'REAL_ESTATE'

export type FinancialResult = {
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  financial_score: number
  metrics: Record<string, number>
  recommendations: string[]
  can_proceed: boolean
  disclaimer: string
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const DomainSchema = z.enum(['ECOMMERCE', 'SERVICES', 'RESTAURANT', 'REAL_ESTATE'])

const EcommerceDataSchema = z.object({
  selling_price: z.number().positive(),
  cost_of_goods: z.number().nonnegative(),
  monthly_fixed_costs: z.number().nonnegative(),
  monthly_marketing_budget: z.number().nonnegative(),
})

const ServicesDataSchema = z.object({
  hourly_rate: z.number().positive(),
  monthly_hours_capacity: z.number().positive(),
  current_utilization_pct: z.number().min(0).max(100),
  monthly_fixed_costs: z.number().nonnegative(),
})

const RestaurantDataSchema = z.object({
  seating_capacity: z.number().int().positive(),
  avg_table_turn_minutes: z.number().positive(),
  daily_operating_hours: z.number().positive().max(24),
  average_check_per_person: z.number().positive(),
  food_cost_percentage: z.number().min(0).max(100),
  monthly_fixed_costs: z.number().nonnegative(),
})

const RealEstateDataSchema = z.object({
  avg_deal_value: z.number().positive(),
  commission_rate: z.number().positive().max(100),
  monthly_transactions: z.number().nonnegative(),
  monthly_fixed_costs: z.number().nonnegative(),
})

export type EcommerceData = z.infer<typeof EcommerceDataSchema>
export type ServicesData = z.infer<typeof ServicesDataSchema>
export type RestaurantData = z.infer<typeof RestaurantDataSchema>
export type RealEstateData = z.infer<typeof RealEstateDataSchema>
export type DomainData = EcommerceData | ServicesData | RestaurantData | RealEstateData

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCLAIMER =
  'تنبيه: هذا التحليل المالي مقدم لأغراض إرشادية فقط ولا يُعدّ استشارة مالية أو قانونية أو ضريبية. يُرجى الاستعانة بمستشار مالي مختص قبل اتخاذ أي قرارات استثمارية أو تجارية.'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function interpolateScore(
  value: number,
  low: number,
  high: number,
  scoreLow: number,
  scoreHigh: number,
): number {
  const ratio = Math.max(0, Math.min(1, (value - low) / (high - low)))
  return Math.round(scoreLow + ratio * (scoreHigh - scoreLow))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export class FinancialEngine {
  analyze(domain: Domain, data: DomainData): FinancialResult {
    DomainSchema.parse(domain)

    switch (domain) {
      case 'ECOMMERCE':
        return this.analyzeEcommerce(EcommerceDataSchema.parse(data))
      case 'SERVICES':
        return this.analyzeServices(ServicesDataSchema.parse(data))
      case 'RESTAURANT':
        return this.analyzeRestaurant(RestaurantDataSchema.parse(data))
      case 'REAL_ESTATE':
        return this.analyzeRealEstate(RealEstateDataSchema.parse(data))
    }
  }

  private analyzeEcommerce(data: EcommerceData): FinancialResult {
    const { selling_price, cost_of_goods, monthly_fixed_costs, monthly_marketing_budget } = data

    const contribution = selling_price - cost_of_goods
    const gross_margin_pct = (contribution / selling_price) * 100
    const break_even_units = contribution > 0 ? monthly_fixed_costs / contribution : Infinity
    const marketing_pct =
      isFinite(break_even_units) && break_even_units > 0
        ? (monthly_marketing_budget / (break_even_units * selling_price)) * 100
        : 0

    let risk_level: FinancialResult['risk_level']
    let financial_score: number

    if (gross_margin_pct < 0) {
      risk_level = 'CRITICAL'
      financial_score = interpolateScore(gross_margin_pct, -100, 0, 0, 24)
    } else if (gross_margin_pct < 15) {
      risk_level = 'HIGH'
      financial_score = interpolateScore(gross_margin_pct, 0, 15, 25, 54)
    } else if (gross_margin_pct <= 30) {
      risk_level = 'MEDIUM'
      financial_score = interpolateScore(gross_margin_pct, 15, 30, 55, 84)
    } else {
      risk_level = 'LOW'
      financial_score = interpolateScore(gross_margin_pct, 30, 100, 85, 100)
    }

    const recommendations: string[] = []
    if (risk_level === 'CRITICAL') {
      recommendations.push('الهامش السلبي يعني خسارة فعلية على كل وحدة مباعة — راجع التسعير فوراً')
      recommendations.push('قلّل تكلفة البضاعة أو ارفع سعر البيع قبل الاستمرار في البيع')
    } else if (risk_level === 'HIGH') {
      recommendations.push('هامش الربح أقل من 15% — راجع اتفاقيات الموردين أو أعد النظر في السعر')
      recommendations.push('ابحث عن طرق لخفض تكلفة المنتج أو تحسين حزمة القيمة')
    } else if (risk_level === 'MEDIUM') {
      recommendations.push('الهامش مقبول — يمكن تحسينه بمفاوضة أفضل مع الموردين')
      recommendations.push('ركّز على رفع حجم المبيعات للاستفادة من الاقتصاديات الحجمية')
    } else {
      recommendations.push('هامش الربح قوي — استثمر في التوسع وزيادة حجم المبيعات')
      recommendations.push('فكّر في إطلاق منتجات متكاملة لرفع متوسط قيمة الطلب')
    }
    if (marketing_pct > 30) {
      recommendations.push('الإنفاق التسويقي مرتفع نسبةً لنقطة التعادل — قيّم كفاءة القنوات')
    }

    return {
      risk_level,
      financial_score,
      metrics: {
        gross_margin_pct: round2(gross_margin_pct),
        break_even_units: isFinite(break_even_units) ? round2(break_even_units) : -1,
        marketing_pct: round2(marketing_pct),
        contribution_per_unit: round2(contribution),
      },
      recommendations,
      can_proceed: risk_level !== 'CRITICAL',
      disclaimer: DISCLAIMER,
    }
  }

  private analyzeServices(data: ServicesData): FinancialResult {
    const { hourly_rate, monthly_hours_capacity, current_utilization_pct, monthly_fixed_costs } = data

    const monthly_revenue_potential = hourly_rate * monthly_hours_capacity
    const current_revenue = monthly_revenue_potential * (current_utilization_pct / 100)
    const break_even_utilization =
      monthly_revenue_potential > 0
        ? (monthly_fixed_costs / monthly_revenue_potential) * 100
        : Infinity

    let risk_level: FinancialResult['risk_level']
    let financial_score: number

    if (current_utilization_pct < break_even_utilization) {
      risk_level = 'CRITICAL'
      const beUtil = isFinite(break_even_utilization) ? break_even_utilization : 100
      financial_score = interpolateScore(current_utilization_pct, 0, beUtil, 0, 24)
    } else if (current_utilization_pct < 50) {
      risk_level = 'HIGH'
      const beUtil = isFinite(break_even_utilization) ? break_even_utilization : 0
      financial_score = interpolateScore(current_utilization_pct, beUtil, 50, 25, 54)
    } else if (current_utilization_pct <= 70) {
      risk_level = 'MEDIUM'
      financial_score = interpolateScore(current_utilization_pct, 50, 70, 55, 84)
    } else {
      risk_level = 'LOW'
      financial_score = interpolateScore(current_utilization_pct, 70, 100, 85, 100)
    }

    const recommendations: string[] = []
    if (risk_level === 'CRITICAL') {
      recommendations.push('الإيرادات الحالية لا تغطي التكاليف الثابتة — أنت في منطقة خسارة')
      recommendations.push(
        `يجب رفع معدل الاستخدام فوق ${isFinite(break_even_utilization) ? break_even_utilization.toFixed(1) : 'N/A'}% للوصول إلى نقطة التعادل`,
      )
    } else if (risk_level === 'HIGH') {
      recommendations.push('معدل الاستخدام أقل من 50% — ركّز على اكتساب عملاء جدد')
      recommendations.push('فكّر في عروض أسعار تحفيزية أو حزم لزيادة معدل الاشتغال')
    } else if (risk_level === 'MEDIUM') {
      recommendations.push('معدل الاستخدام جيد — استهدف تجاوز 70% لتحسين الربحية')
      recommendations.push('وظّف جهود التسويق على أوقات الذروة المنخفضة')
    } else {
      recommendations.push('أداء ممتاز — فكّر في توسيع الطاقة الاستيعابية أو رفع الأسعار')
      recommendations.push('استثمر في تطوير الكوادر للحفاظ على جودة الخدمة مع النمو')
    }

    return {
      risk_level,
      financial_score,
      metrics: {
        monthly_revenue_potential: round2(monthly_revenue_potential),
        current_revenue: round2(current_revenue),
        break_even_utilization: isFinite(break_even_utilization)
          ? round2(break_even_utilization)
          : -1,
        current_utilization_pct,
      },
      recommendations,
      can_proceed: risk_level !== 'CRITICAL',
      disclaimer: DISCLAIMER,
    }
  }

  private analyzeRestaurant(data: RestaurantData): FinancialResult {
    const {
      seating_capacity,
      avg_table_turn_minutes,
      daily_operating_hours,
      average_check_per_person,
      food_cost_percentage,
      monthly_fixed_costs,
    } = data

    const max_daily_covers = Math.floor(
      (seating_capacity / avg_table_turn_minutes) * daily_operating_hours * 60,
    )
    const potential_daily_revenue = max_daily_covers * average_check_per_person
    const potential_monthly_revenue = potential_daily_revenue * 30
    const gross_margin_pct = (1 - food_cost_percentage / 100) * 100

    let risk_level: FinancialResult['risk_level']
    let financial_score: number

    if (food_cost_percentage >= 70 || gross_margin_pct < 10) {
      risk_level = 'CRITICAL'
      // gross_margin range for CRITICAL: [0, 30] (food_cost >=70 → gross_margin <=30)
      financial_score = interpolateScore(gross_margin_pct, 0, 30, 0, 24)
    } else if (food_cost_percentage > 40) {
      risk_level = 'HIGH'
      // food_cost (40,70) → gross_margin (30,60)
      financial_score = interpolateScore(gross_margin_pct, 30, 60, 25, 54)
    } else if (food_cost_percentage >= 30) {
      risk_level = 'MEDIUM'
      // food_cost [30,40] → gross_margin [60,70]
      financial_score = interpolateScore(gross_margin_pct, 60, 70, 55, 84)
    } else {
      risk_level = 'LOW'
      // food_cost <30 → gross_margin >70
      financial_score = interpolateScore(gross_margin_pct, 70, 100, 85, 100)
    }

    const recommendations: string[] = []
    if (risk_level === 'CRITICAL') {
      recommendations.push(
        'تكلفة الطعام بالغة الخطورة — راجع قائمة الطعام وأزل الأصناف الأعلى تكلفة',
      )
      recommendations.push('تفاوض مع موردين بديلين وراجع الحصص والهدر في المطبخ فوراً')
    } else if (risk_level === 'HIGH') {
      recommendations.push('تكلفة الطعام تجاوزت 40% — راجع هيكل الأسعار وحجم الحصص')
      recommendations.push('اعمل على هندسة القائمة لإبراز الأصناف ذات الهامش المرتفع')
    } else if (risk_level === 'MEDIUM') {
      recommendations.push('تكلفة الطعام في النطاق المقبول — حسّن التفاوض مع الموردين لخفضها')
      recommendations.push('راقب الهدر اليومي وطوّر عمليات المطبخ لتحقيق وفرات إضافية')
    } else {
      recommendations.push('تكلفة الطعام ممتازة — حافظ على هذا المستوى وركّز على رفع معدل دوران الطاولات')
      recommendations.push('فكّر في تحسين تجربة الضيف لرفع متوسط الفاتورة')
    }

    return {
      risk_level,
      financial_score,
      metrics: {
        max_daily_covers,
        potential_daily_revenue: round2(potential_daily_revenue),
        potential_monthly_revenue: round2(potential_monthly_revenue),
        gross_margin_pct: round2(gross_margin_pct),
        food_cost_percentage,
        monthly_fixed_costs,
      },
      recommendations,
      can_proceed: risk_level !== 'CRITICAL',
      disclaimer: DISCLAIMER,
    }
  }

  private analyzeRealEstate(data: RealEstateData): FinancialResult {
    const { avg_deal_value, commission_rate, monthly_transactions, monthly_fixed_costs } = data

    const commission_per_deal = (avg_deal_value * commission_rate) / 100
    const monthly_commission = commission_per_deal * monthly_transactions
    const break_even_deals =
      commission_per_deal > 0 ? Math.ceil(monthly_fixed_costs / commission_per_deal) : Infinity
    const buffer_pct =
      monthly_fixed_costs > 0
        ? ((monthly_commission - monthly_fixed_costs) / monthly_fixed_costs) * 100
        : monthly_commission > 0
          ? Infinity
          : 0

    let risk_level: FinancialResult['risk_level']
    let financial_score: number

    if (buffer_pct < 0) {
      risk_level = 'CRITICAL'
      financial_score = interpolateScore(buffer_pct, -100, 0, 0, 24)
    } else if (buffer_pct <= 20) {
      risk_level = 'HIGH'
      financial_score = interpolateScore(buffer_pct, 0, 20, 25, 54)
    } else if (buffer_pct <= 50) {
      risk_level = 'MEDIUM'
      financial_score = interpolateScore(buffer_pct, 20, 50, 55, 84)
    } else {
      risk_level = 'LOW'
      financial_score = interpolateScore(buffer_pct, 50, 200, 85, 100)
    }

    const recommendations: string[] = []
    if (risk_level === 'CRITICAL') {
      recommendations.push('العمولات الشهرية لا تغطي التكاليف الثابتة — أنت في منطقة خسارة')
      recommendations.push(
        `تحتاج إلى ${isFinite(break_even_deals) ? break_even_deals : 'N/A'} صفقة على الأقل شهرياً للوصول لنقطة التعادل`,
      )
    } else if (risk_level === 'HIGH') {
      recommendations.push('الهامش أقل من 20% فوق التكاليف — وضع هش عند تذبذب الصفقات')
      recommendations.push('اعمل على خفض التكاليف الثابتة أو زيادة متوسط قيمة الصفقة')
    } else if (risk_level === 'MEDIUM') {
      recommendations.push('هامش جيد — استمر في بناء خط الصفقات للوصول لهامش 50%+')
      recommendations.push('طوّر شبكة العلاقات لتعزيز تكرار الصفقات وزيادة الإحالات')
    } else {
      recommendations.push('أداء مالي ممتاز — فكّر في التوسع الجغرافي أو استقطاب وكلاء جدد')
      recommendations.push('استثمر الفائض في أدوات التسويق الرقمي لرفع قاعدة العملاء')
    }

    return {
      risk_level,
      financial_score,
      metrics: {
        commission_per_deal: round2(commission_per_deal),
        monthly_commission: round2(monthly_commission),
        break_even_deals: isFinite(break_even_deals) ? break_even_deals : -1,
        buffer_pct: isFinite(buffer_pct) ? round2(buffer_pct) : 999,
      },
      recommendations,
      can_proceed: risk_level !== 'CRITICAL',
      disclaimer: DISCLAIMER,
    }
  }
}

export const financialEngine = new FinancialEngine()
