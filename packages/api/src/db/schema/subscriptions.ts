import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users.js';

// ═══════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'silver',
  'gold',
  'platinum',
]);

export const billingCycleEnum = pgEnum('billing_cycle', [
  'monthly',
  'quarterly',
  'annual',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'expired',
  'past_due',
  'trial',
]);

// ═══════════════════════════════════════════════════════════
// SUBSCRIPTIONS TABLE
// ═══════════════════════════════════════════════════════════

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plan: subscriptionPlanEnum('plan').notNull(),
    billingCycle: billingCycleEnum('billing_cycle').notNull(),
    status: subscriptionStatusEnum('status').notNull().default('active'),

    // ── Pricing ───────────────────────────────────────────
    priceUsd: decimal('price_usd', { precision: 10, scale: 2 }).notNull(),
    discountPct: decimal('discount_pct', { precision: 5, scale: 2 })
      .notNull()
      .default('0'),
    finalPriceUsd: decimal('final_price_usd', { precision: 10, scale: 2 }).notNull(),

    // ── Tokens ────────────────────────────────────────────
    tokensPerCycle: integer('tokens_per_cycle').notNull(),
    tokensRemaining: integer('tokens_remaining').notNull(),

    // ── Period ────────────────────────────────────────────
    startedAt: timestamp('started_at').notNull().defaultNow(),
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    cancelledAt: timestamp('cancelled_at'),

    // ── Stripe ────────────────────────────────────────────
    stripeSubId: varchar('stripe_sub_id', { length: 255 }),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userStatusIdx: index('idx_subscriptions_user_status').on(
      table.userId,
      table.status
    ),
    statusIdx: index('idx_subscriptions_status').on(table.status),
  })
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

// ═══════════════════════════════════════════════════════════
// TOKEN ADD-ONS TABLE
// ═══════════════════════════════════════════════════════════

export const tokenAddons = pgTable(
  'token_addons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),

    tokensPurchased: integer('tokens_purchased').notNull(),
    tokensUsed: integer('tokens_used').notNull().default(0),
    // tokensRemaining is calculated: tokens_purchased - tokens_used

    priceUsd: decimal('price_usd', { precision: 10, scale: 2 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    purchasedAt: timestamp('purchased_at').notNull().defaultNow(),
    paymentRef: varchar('payment_ref', { length: 255 }),
  },
  (table) => ({
    userIdx: index('idx_token_addons_user').on(table.userId),
    expiresIdx: index('idx_token_addons_expires').on(table.expiresAt),
  })
);

export type TokenAddon = typeof tokenAddons.$inferSelect;
export type NewTokenAddon = typeof tokenAddons.$inferInsert;

// ═══════════════════════════════════════════════════════════
// TOKEN TRANSACTIONS TABLE (Ledger)
// ═══════════════════════════════════════════════════════════

export const tokenTransactions = pgTable(
  'token_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    sourceType: varchar('source_type', { length: 20 }).notNull(),
    // 'subscription' | 'addon' | 'deduction' | 'refund' | 'admin_grant'

    sourceId: uuid('source_id').notNull(),
    amount: integer('amount').notNull(), // positive = credit, negative = debit
    serviceType: varchar('service_type', { length: 50 }),
    projectId: uuid('project_id'),
    taskId: uuid('task_id'),
    isFree: boolean('is_free').notNull().default(false),
    notes: varchar('notes', { length: 500 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userDateIdx: index('idx_token_transactions_user_date').on(
      table.userId,
      table.createdAt
    ),
    taskIdx: index('idx_token_transactions_task').on(table.taskId),
  })
);

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type NewTokenTransaction = typeof tokenTransactions.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  addons: many(tokenAddons),
}));

export const tokenAddonsRelations = relations(tokenAddons, ({ one }) => ({
  user: one(users, {
    fields: [tokenAddons.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [tokenAddons.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const tokenTransactionsRelations = relations(tokenTransactions, ({ one }) => ({
  user: one(users, {
    fields: [tokenTransactions.userId],
    references: [users.id],
  }),
}));
