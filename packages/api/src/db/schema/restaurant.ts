import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  date,
  text,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { projects } from './projects';

// ═══════════════════════════════════════════════════════════
// RESTAURANT SETTINGS
// ═══════════════════════════════════════════════════════════

export const restaurantSettings = pgTable('restaurant_settings', {
  restaurantId: uuid('restaurant_id')
    .primaryKey()
    .references(() => projects.id, { onDelete: 'cascade' }),

  currency: varchar('currency', { length: 5 }).notNull().default('USD'),
  timezone: varchar('timezone', { length: 50 }).notNull().default('Asia/Riyadh'),

  // ── Margin Targets ──────────────────────────────────────
  targetMarginPct: decimal('target_margin_pct', { precision: 5, scale: 2 })
    .notNull()
    .default('65.0'),
  minimumMarginFloorPct: decimal('minimum_margin_floor_pct', {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default('35.0'),

  // ── Baseline ────────────────────────────────────────────
  baselinePlatesPerMonth: integer('baseline_plates_per_month')
    .notNull()
    .default(1000),

  // ── Alert Thresholds ────────────────────────────────────
  defaultPriceAlertPct: decimal('default_price_alert_pct', {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default('15.0'),
  lowMarginWarningPct: decimal('low_margin_warning_pct', {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default('5.0'),

  // ── Kitchen Defaults ────────────────────────────────────
  defaultKitchenProfile: varchar('default_kitchen_profile', { length: 20 })
    .notNull()
    .default('medium'),
  defaultChannel: varchar('default_channel', { length: 20 })
    .notNull()
    .default('dine_in'),
  indirectAllocationMethod: varchar('indirect_allocation_method', { length: 20 })
    .notNull()
    .default('cooking_time'),
  // 'equal' | 'cooking_time' | 'category'

  // ── Washing & Cleaning Monthly Costs ────────────────────
  monthlyWaterCost: decimal('monthly_water_cost', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  monthlyDetergentCost: decimal('monthly_detergent_cost', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  monthlyDishwasherEnergy: decimal('monthly_dishwasher_energy', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  monthlyCleaningLabor: decimal('monthly_cleaning_labor', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),

  // ── Waste ───────────────────────────────────────────────
  monthlyWasteCost: decimal('monthly_waste_cost', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),

  // ── Default Packaging ───────────────────────────────────
  defaultDineInPackaging: decimal('default_dine_in_packaging', {
    precision: 10,
    scale: 4,
  })
    .notNull()
    .default('0.05'),
  defaultTakeawayPackaging: decimal('default_takeaway_packaging', {
    precision: 10,
    scale: 4,
  })
    .notNull()
    .default('0.35'),
  defaultDeliveryPackaging: decimal('default_delivery_packaging', {
    precision: 10,
    scale: 4,
  })
    .notNull()
    .default('0.65'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type RestaurantSetting = typeof restaurantSettings.$inferSelect;
export type NewRestaurantSetting = typeof restaurantSettings.$inferInsert;

// ═══════════════════════════════════════════════════════════
// OPERATING COSTS
// ═══════════════════════════════════════════════════════════

export const operatingCosts = pgTable(
  'operating_costs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    periodMonth: integer('period_month').notNull(),
    periodYear: integer('period_year').notNull(),

    rentUsd: decimal('rent_usd', { precision: 10, scale: 2 }).notNull().default('0'),
    salariesUsd: decimal('salaries_usd', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    utilitiesUsd: decimal('utilities_usd', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    marketingUsd: decimal('marketing_usd', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    otherUsd: decimal('other_usd', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),

    // NOTE: Drizzle ORM does not support GENERATED columns natively
    // These are calculated in application code
    // totalOverheadUsd = rent + salaries + utilities + marketing + other
    // overheadPerPlate = totalOverhead / baselinePlates

    baselinePlates: integer('baseline_plates').notNull().default(1000),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    restaurantPeriodUnique: unique('operating_costs_period').on(
      table.restaurantId,
      table.periodYear,
      table.periodMonth
    ),
    restaurantIdx: index('idx_operating_costs_restaurant').on(table.restaurantId),
  })
);

export type OperatingCost = typeof operatingCosts.$inferSelect;
export type NewOperatingCost = typeof operatingCosts.$inferInsert;

// ═══════════════════════════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════════════════════════

export const suppliers = pgTable(
  'suppliers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    restaurantIdx: index('idx_suppliers_restaurant').on(
      table.restaurantId,
      table.isActive
    ),
  })
);

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RESTAURANT INGREDIENTS
// ═══════════════════════════════════════════════════════════

export const restaurantIngredients = pgTable(
  'restaurant_ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    supplierId: uuid('supplier_id').references(() => suppliers.id),

    name: varchar('name', { length: 200 }).notNull(),
    nameEn: varchar('name_en', { length: 200 }),
    category: varchar('category', { length: 50 }).notNull(),
    // 'protein' | 'vegetable' | 'dairy' | 'grain' | 'spice' |
    // 'sauce' | 'oil' | 'beverage' | 'other'

    unitType: varchar('unit_type', { length: 20 }).notNull(),
    // 'kg' | 'g' | 'liter' | 'ml' | 'piece' | 'dozen' |
    // 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb'

    currentPrice: decimal('current_price', { precision: 10, scale: 4 }).notNull(),
    priceCurrency: varchar('price_currency', { length: 5 })
      .notNull()
      .default('USD'),

    // ── Yield & Waste ─────────────────────────────────────
    usableQtyPerUnit: decimal('usable_qty_per_unit', { precision: 10, scale: 4 })
      .notNull()
      .default('1.0'),
    yieldPct: decimal('yield_pct', { precision: 5, scale: 2 })
      .notNull()
      .default('100.0'),
    // effective_price = current_price / (yield_pct / 100)
    wastePct: decimal('waste_pct', { precision: 5, scale: 2 })
      .notNull()
      .default('0.0'),

    // ── Alerts ────────────────────────────────────────────
    alertThresholdPct: decimal('alert_threshold_pct', { precision: 5, scale: 2 })
      .notNull()
      .default('15.0'),

    // ── Usage Tracking ────────────────────────────────────
    usageCountInRecipes: integer('usage_count_in_recipes').notNull().default(0),

    // ── Flags ─────────────────────────────────────────────
    isActive: boolean('is_active').notNull().default(true),
    isIndirect: boolean('is_indirect').notNull().default(false),
    // indirect = oil, shared seasonings, butter etc.

    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    restaurantIdx: index('idx_ingredients_restaurant').on(
      table.restaurantId,
      table.isActive
    ),
    categoryIdx: index('idx_ingredients_category').on(table.category),
    supplierIdx: index('idx_ingredients_supplier').on(table.supplierId),
  })
);

export type RestaurantIngredient = typeof restaurantIngredients.$inferSelect;
export type NewRestaurantIngredient = typeof restaurantIngredients.$inferInsert;

// ═══════════════════════════════════════════════════════════
// INGREDIENT PRICE HISTORY
// ═══════════════════════════════════════════════════════════

export const ingredientPriceHistory = pgTable(
  'ingredient_price_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => restaurantIngredients.id, { onDelete: 'cascade' }),
    price: decimal('price', { precision: 10, scale: 4 }).notNull(),
    currency: varchar('currency', { length: 5 }).notNull(),
    effectiveDate: date('effective_date').notNull(),
    recordedAt: timestamp('recorded_at').notNull().defaultNow(),
    recordedBy: varchar('recorded_by', { length: 20 }).notNull().default('manual'),
    // 'manual' | 'bulk_import' | 'api'
    changePct: decimal('change_pct', { precision: 7, scale: 2 }),
    isSpike: boolean('is_spike').notNull().default(false),
    notes: text('notes'),
  },
  (table) => ({
    ingredientDateIdx: index('idx_price_history_ingredient').on(
      table.ingredientId,
      table.effectiveDate
    ),
    spikeIdx: index('idx_price_history_spikes').on(table.isSpike),
  })
);

export type IngredientPriceRecord = typeof ingredientPriceHistory.$inferSelect;
export type NewIngredientPriceRecord = typeof ingredientPriceHistory.$inferInsert;

// ═══════════════════════════════════════════════════════════
// INGREDIENT ALERTS
// ═══════════════════════════════════════════════════════════

export const ingredientAlerts = pgTable(
  'ingredient_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => restaurantIngredients.id, { onDelete: 'cascade' }),
    alertType: varchar('alert_type', { length: 30 }).notNull(),
    // 'price_spike' | 'low_yield' | 'high_waste'
    changePct: decimal('change_pct', { precision: 7, scale: 2 }),
    oldPrice: decimal('old_price', { precision: 10, scale: 4 }),
    newPrice: decimal('new_price', { precision: 10, scale: 4 }),
    affectedRecipesCount: integer('affected_recipes_count'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    restaurantIdx: index('idx_alerts_restaurant').on(
      table.restaurantId,
      table.isRead
    ),
    ingredientIdx: index('idx_alerts_ingredient').on(table.ingredientId),
  })
);

export type IngredientAlert = typeof ingredientAlerts.$inferSelect;
export type NewIngredientAlert = typeof ingredientAlerts.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RECIPES
// ═══════════════════════════════════════════════════════════

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    name: varchar('name', { length: 200 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).notNull(),
    targetMarginPct: decimal('target_margin_pct', { precision: 5, scale: 2 }).notNull(),

    isProtected: boolean('is_protected').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    servingSize: varchar('serving_size', { length: 100 }),
    prepTimeMin: integer('prep_time_min'),
    cookingTimeMin: integer('cooking_time_min'),
    notes: text('notes'),

    // ── True Cost Components (calculated) ─────────────────
    directIngredientCost: decimal('direct_ingredient_cost', {
      precision: 10,
      scale: 4,
    }),
    indirectIngredientCost: decimal('indirect_ingredient_cost', {
      precision: 10,
      scale: 4,
    }),
    kitchenLoadCost: decimal('kitchen_load_cost', { precision: 10, scale: 4 }),
    packagingCost: decimal('packaging_cost', { precision: 10, scale: 4 }),
    washingCleaningCost: decimal('washing_cleaning_cost', {
      precision: 10,
      scale: 4,
    }),
    wasteAllocationCost: decimal('waste_allocation_cost', {
      precision: 10,
      scale: 4,
    }),
    overheadPerPlateCost: decimal('overhead_per_plate_cost', {
      precision: 10,
      scale: 4,
    }),

    // ── Aggregated Costs ──────────────────────────────────
    foodCost: decimal('food_cost', { precision: 10, scale: 4 }),
    // food_cost = direct_ingredient_cost only

    trueCost: decimal('true_cost', { precision: 10, scale: 4 }),
    // true_cost = sum of all 7 components

    contributionMargin: decimal('contribution_margin', { precision: 10, scale: 4 }),
    // contribution_margin = selling_price - true_cost

    marginPct: decimal('margin_pct', { precision: 5, scale: 2 }),
    // margin_pct = (contribution_margin / selling_price) * 100

    foodCostPct: decimal('food_cost_pct', { precision: 5, scale: 2 }),
    // food_cost_pct = (food_cost / selling_price) * 100

    marginStatus: varchar('margin_status', { length: 20 }),
    // 'on_target' | 'below_target' | 'critical' | 'above_target'

    lastCostedAt: timestamp('last_costed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    restaurantIdx: index('idx_recipes_restaurant').on(
      table.restaurantId,
      table.isActive
    ),
    marginStatusIdx: index('idx_recipes_margin_status').on(table.marginStatus),
    categoryIdx: index('idx_recipes_category').on(table.category),
  })
);

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RECIPE INGREDIENTS (junction table)
// ═══════════════════════════════════════════════════════════

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => restaurantIngredients.id),
    quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull(),
    unit: varchar('unit', { length: 20 }).notNull(),
    effectiveCost: decimal('effective_cost', { precision: 10, scale: 4 }),
    // calculated: quantity * (price / yield%) * (1 + waste%)
    sortOrder: integer('sort_order').notNull().default(0),
    notes: text('notes'),
  },
  (table) => ({
    recipeIdx: index('idx_recipe_ingredients_recipe').on(table.recipeId),
    ingredientIdx: index('idx_recipe_ingredients_ingredient').on(table.ingredientId),
  })
);

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RECIPE KITCHEN SETTINGS
// ═══════════════════════════════════════════════════════════

export const recipeKitchenSettings = pgTable('recipe_kitchen_settings', {
  recipeId: uuid('recipe_id')
    .primaryKey()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  kitchenProfile: varchar('kitchen_profile', { length: 20 })
    .notNull()
    .default('medium'),
  // 'light' | 'medium' | 'heavy'

  dineInPackagingCost: decimal('dine_in_packaging_cost', {
    precision: 10,
    scale: 4,
  })
    .notNull()
    .default('0'),
  takeawayPackagingCost: decimal('takeaway_packaging_cost', {
    precision: 10,
    scale: 4,
  })
    .notNull()
    .default('0'),
  deliveryPackagingCost: decimal('delivery_packaging_cost', {
    precision: 10,
    scale: 4,
  })
    .notNull()
    .default('0'),

  defaultChannel: varchar('default_channel', { length: 20 })
    .notNull()
    .default('dine_in'),
  customWasteAllocationPct: decimal('custom_waste_allocation_pct', {
    precision: 5,
    scale: 2,
  }),
  // null = use restaurant default
});

export type RecipeKitchenSetting = typeof recipeKitchenSettings.$inferSelect;
export type NewRecipeKitchenSetting = typeof recipeKitchenSettings.$inferInsert;

// ═══════════════════════════════════════════════════════════
// KITCHEN LOAD PROFILES
// ═══════════════════════════════════════════════════════════

export const kitchenLoadProfiles = pgTable(
  'kitchen_load_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    profileName: varchar('profile_name', { length: 20 }).notNull(),
    // 'light' | 'medium' | 'heavy'

    energyCost: decimal('energy_cost', { precision: 10, scale: 4 })
      .notNull()
      .default('0'),
    laborProxy: decimal('labor_proxy', { precision: 10, scale: 4 })
      .notNull()
      .default('0'),
    equipmentProxy: decimal('equipment_proxy', { precision: 10, scale: 4 })
      .notNull()
      .default('0'),
  },
  (table) => ({
    restaurantProfileUnique: unique('kitchen_profiles_unique').on(
      table.restaurantId,
      table.profileName
    ),
  })
);

export type KitchenLoadProfile = typeof kitchenLoadProfiles.$inferSelect;
export type NewKitchenLoadProfile = typeof kitchenLoadProfiles.$inferInsert;

// ═══════════════════════════════════════════════════════════
// COMPETITORS
// ═══════════════════════════════════════════════════════════

export const competitors = pgTable(
  'competitors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    type: varchar('type', { length: 50 }),
    location: varchar('location', { length: 200 }),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    restaurantIdx: index('idx_competitors_restaurant').on(
      table.restaurantId,
      table.isActive
    ),
  })
);

export type Competitor = typeof competitors.$inferSelect;
export type NewCompetitor = typeof competitors.$inferInsert;

// ═══════════════════════════════════════════════════════════
// COMPETITOR MENU ITEMS
// ═══════════════════════════════════════════════════════════

export const competitorMenuItems = pgTable(
  'competitor_menu_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    competitorId: uuid('competitor_id')
      .notNull()
      .references(() => competitors.id, { onDelete: 'cascade' }),
    itemName: varchar('item_name', { length: 200 }).notNull(),
    observedPrice: decimal('observed_price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 5 }).notNull().default('USD'),
    observedDate: date('observed_date').notNull().defaultNow(),
    source: varchar('source', { length: 50 }).notNull().default('manual'),
    // 'manual' | 'menu_url' | 'delivery_app' | 'visit'
    mappedRecipeId: uuid('mapped_recipe_id').references(() => recipes.id),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    competitorIdx: index('idx_competitor_items_competitor').on(table.competitorId),
    mappedRecipeIdx: index('idx_competitor_items_recipe').on(table.mappedRecipeId),
  })
);

export type CompetitorMenuItem = typeof competitorMenuItems.$inferSelect;
export type NewCompetitorMenuItem = typeof competitorMenuItems.$inferInsert;

// ═══════════════════════════════════════════════════════════
// SALES VOLUME IMPORTS
// ═══════════════════════════════════════════════════════════

export const salesVolumeImports = pgTable('sales_volume_imports', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  totalRecords: integer('total_records').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type SalesVolumeImport = typeof salesVolumeImports.$inferSelect;
export type NewSalesVolumeImport = typeof salesVolumeImports.$inferInsert;

// ═══════════════════════════════════════════════════════════
// SALES VOLUME RECORDS (quantity only — NO revenue)
// ═══════════════════════════════════════════════════════════

export const salesVolumeRecords = pgTable(
  'sales_volume_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    importId: uuid('import_id')
      .notNull()
      .references(() => salesVolumeImports.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id').references(() => recipes.id),
    dishName: varchar('dish_name', { length: 200 }).notNull(),
    quantitySold: integer('quantity_sold').notNull(),
    channel: varchar('channel', { length: 20 }),
    // 'dine_in' | 'takeaway' | 'delivery' | 'unknown'
    saleDate: date('sale_date').notNull(),
    isMatched: boolean('is_matched').notNull().default(false),
  },
  (table) => ({
    importIdx: index('idx_sales_records_import').on(table.importId),
    recipeIdx: index('idx_sales_records_recipe').on(table.recipeId),
  })
);

export type SalesVolumeRecord = typeof salesVolumeRecords.$inferSelect;
export type NewSalesVolumeRecord = typeof salesVolumeRecords.$inferInsert;

// ═══════════════════════════════════════════════════════════
// AI RECOMMENDATIONS (Restaurant-specific)
// ═══════════════════════════════════════════════════════════

export const aiRecommendations = pgTable(
  'ai_recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    type: varchar('type', { length: 30 }).notNull(),
    // 'IncreasePrice' | 'Promote' | 'Remove' | 'Investigate' |
    // 'SupplierChange' | 'CostReduction'

    targetType: varchar('target_type', { length: 20 }).notNull(),
    // 'recipe' | 'ingredient' | 'supplier' | 'kitchen_setting'

    targetId: uuid('target_id').notNull(),
    targetName: varchar('target_name', { length: 200 }).notNull(),

    reason: text('reason').notNull(),
    expectedImpact: text('expected_impact').notNull(),
    confidenceScore: integer('confidence_score').notNull(),
    // 0-100

    currentValue: decimal('current_value', { precision: 10, scale: 4 }),
    suggestedValue: decimal('suggested_value', { precision: 10, scale: 4 }),
    valueUnit: varchar('value_unit', { length: 20 }),
    // '%' | '$' | 'qty'

    status: varchar('status', { length: 20 }).notNull().default('pending'),
    // 'pending' | 'approved' | 'dismissed' | 'snoozed'

    snoozedUntil: timestamp('snoozed_until'),
    actionedAt: timestamp('actioned_at'),
    actionId: uuid('action_id'),
    // will reference actions table after it's created

    generatedAt: timestamp('generated_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => ({
    restaurantStatusIdx: index('idx_recommendations_restaurant').on(
      table.restaurantId,
      table.status
    ),
    activeIdx: index('idx_recommendations_active').on(
      table.restaurantId,
      table.generatedAt
    ),
    typeIdx: index('idx_recommendations_type').on(table.type),
  })
);

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type NewAiRecommendation = typeof aiRecommendations.$inferInsert;

// ═══════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════

export const actions = pgTable(
  'actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    title: varchar('title', { length: 300 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    // 'price_update' | 'supplier_change' | 'recipe_review' |
    // 'promotion_launch' | 'cost_investigation' | 'remove_item'

    linkedRecommendationId: uuid('linked_recommendation_id').references(
      () => aiRecommendations.id
    ),

    assigneeName: varchar('assignee_name', { length: 200 }),
    dueDate: date('due_date'),
    priority: varchar('priority', { length: 10 }).notNull().default('medium'),
    // 'low' | 'medium' | 'high' | 'critical'

    status: varchar('status', { length: 20 }).notNull().default('New'),
    // 'New' | 'Approved' | 'In Progress' | 'Done' | 'Cancelled'

    notes: text('notes'),

    linkedType: varchar('linked_type', { length: 20 }),
    // 'recipe' | 'ingredient' | 'supplier' | 'promotion'
    linkedId: uuid('linked_id'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    restaurantStatusIdx: index('idx_actions_restaurant').on(
      table.restaurantId,
      table.status,
      table.priority
    ),
    dueIdx: index('idx_actions_due').on(table.restaurantId, table.dueDate),
  })
);

export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RESTAURANT RELATIONS
// ═══════════════════════════════════════════════════════════

export const restaurantSettingsRelations = relations(restaurantSettings, ({ one }) => ({
  project: one(projects, {
    fields: [restaurantSettings.restaurantId],
    references: [projects.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  project: one(projects, {
    fields: [suppliers.restaurantId],
    references: [projects.id],
  }),
  ingredients: many(restaurantIngredients),
}));

export const restaurantIngredientsRelations = relations(
  restaurantIngredients,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [restaurantIngredients.restaurantId],
      references: [projects.id],
    }),
    supplier: one(suppliers, {
      fields: [restaurantIngredients.supplierId],
      references: [suppliers.id],
    }),
    priceHistory: many(ingredientPriceHistory),
    alerts: many(ingredientAlerts),
    recipeIngredients: many(recipeIngredients),
  })
);

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  project: one(projects, {
    fields: [recipes.restaurantId],
    references: [projects.id],
  }),
  ingredients: many(recipeIngredients),
  kitchenSettings: one(recipeKitchenSettings, {
    fields: [recipes.id],
    references: [recipeKitchenSettings.recipeId],
  }),
  competitorItems: many(competitorMenuItems),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(restaurantIngredients, {
    fields: [recipeIngredients.ingredientId],
    references: [restaurantIngredients.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  project: one(projects, {
    fields: [aiRecommendations.restaurantId],
    references: [projects.id],
  }),
  action: one(actions, {
    fields: [aiRecommendations.actionId],
    references: [actions.id],
  }),
}));

export const actionsRelations = relations(actions, ({ one }) => ({
  project: one(projects, {
    fields: [actions.restaurantId],
    references: [projects.id],
  }),
  recommendation: one(aiRecommendations, {
    fields: [actions.linkedRecommendationId],
    references: [aiRecommendations.id],
  }),
}));
