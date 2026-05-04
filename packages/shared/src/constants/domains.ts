import type { DomainID } from '../types/index.js';

export const ACTIVE_DOMAINS: DomainID[] = [
  'ecommerce',
  'services',
  'restaurant',
  'real_estate',
];

export const DOMAIN_LABELS: Record<DomainID, string> = {
  ecommerce: 'التجارة الإلكترونية',
  services: 'الخدمات المهنية',
  restaurant: 'المطاعم والكافيهات',
  real_estate: 'العقارات',
};

export const DOMAIN_ICONS: Record<DomainID, string> = {
  ecommerce: '🛒',
  services: '💼',
  restaurant: '🍽️',
  real_estate: '🏠',
};

export const DOMAIN_DESCRIPTIONS: Record<DomainID, string> = {
  ecommerce: 'بيع منتجات أونلاين وإدارة متجر إلكتروني',
  services: 'تقديم خدمات مهنية وإدارة الكفاءات',
  restaurant: 'إدارة مطعم أو كافيه مع تحليل المطبخ',
  real_estate: 'وساطة وتطوير ووساطة عقارية',
};

export const FINANCIAL_FIELDS_BY_DOMAIN: Record<DomainID, string[]> = {
  ecommerce: [
    'selling_price',
    'cost_of_goods',
    'inventory_units',
    'monthly_fixed_costs',
    'monthly_marketing_budget',
  ],
  services: [
    'hourly_rate',
    'monthly_hours_capacity',
    'current_utilization_pct',
    'monthly_fixed_costs',
    'monthly_marketing_budget',
  ],
  restaurant: [
    'average_check_per_person',
    'food_cost_percentage',
    'monthly_fixed_costs',
    'seating_capacity',
    'monthly_marketing_budget',
  ],
  real_estate: [
    'avg_deal_value_usd',
    'monthly_deals_count',
    'commission_rate_pct',
    'monthly_fixed_costs',
    'monthly_marketing_budget',
  ],
};
