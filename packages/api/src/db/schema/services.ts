import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  text,
  pgEnum,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { projects } from './projects.js';

// ═══════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════

export const executionStatusEnum = pgEnum('execution_status', [
  'queued',
  'processing',
  'completed',
  'failed',
  'dead_letter',
]);

// ═══════════════════════════════════════════════════════════
// PLANS TABLE
// ═══════════════════════════════════════════════════════════

export const plans = pgTable(
  'plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    tenantId: varchar('tenant_id', { length: 50 }).notNull().default('cezar12'),
    version: integer('version').notNull().default(1),
    content: jsonb('content').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    // 'active' | 'archived'
    tokensCost: integer('tokens_cost').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index('idx_plans_project').on(table.projectId, table.status),
    projectVersionUnique: unique('plans_project_version').on(
      table.projectId,
      table.version
    ),
  })
);

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

// ═══════════════════════════════════════════════════════════
// SERVICE EXECUTIONS TABLE
// ═══════════════════════════════════════════════════════════

export const serviceExecutions = pgTable(
  'service_executions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id').notNull(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: varchar('tenant_id', { length: 50 }).notNull().default('cezar12'),
    serviceType: varchar('service_type', { length: 50 }).notNull(),
    // plan_generation | weekly_content | ad_campaign |
    // market_research | buyer_persona | branding |
    // seo_strategy | lead_generation | performance_report |
    // kitchen_analysis | recipe_costing | promotion_optimization

    status: executionStatusEnum('status').notNull().default('queued'),
    tokensCost: integer('tokens_cost').notNull().default(0),
    tokensRefunded: boolean('tokens_refunded').notNull().default(false),

    // ── AI Usage Tracking ─────────────────────────────────
    aiTokensUsed: integer('ai_tokens_used'),
    aiCostUsd: decimal('ai_cost_usd', { precision: 10, scale: 6 }),
    modelUsed: varchar('model_used', { length: 100 }),

    // ── Error Handling ────────────────────────────────────
    errorMessage: text('error_message'),
    errorCode: varchar('error_code', { length: 50 }),
    attempts: integer('attempts').notNull().default(0),

    // ── Governance ────────────────────────────────────────
    governanceViolations: jsonb('governance_violations'),

    // ── Timestamps ────────────────────────────────────────
    queuedAt: timestamp('queued_at').notNull().defaultNow(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    taskIdx: unique('idx_executions_task').on(table.taskId),
    projectIdx: index('idx_executions_project').on(
      table.projectId,
      table.status
    ),
    statusIdx: index('idx_executions_status').on(table.status),
    userIdx: index('idx_executions_user').on(table.userId),
  })
);

export type ServiceExecution = typeof serviceExecutions.$inferSelect;
export type NewServiceExecution = typeof serviceExecutions.$inferInsert;

// ═══════════════════════════════════════════════════════════
// CONTENTS TABLE
// ═══════════════════════════════════════════════════════════

export const contents = pgTable(
  'contents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    tenantId: varchar('tenant_id', { length: 50 }).notNull().default('cezar12'),
    executionId: uuid('execution_id').references(() => serviceExecutions.id),
    contentType: varchar('content_type', { length: 50 }).notNull(),
    // weekly | campaign | corrective | product_profile | branding
    weekNumber: integer('week_number'),
    rawOutput: jsonb('raw_output').notNull(),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index('idx_contents_project').on(
      table.projectId,
      table.createdAt
    ),
    typeIdx: index('idx_contents_type').on(table.contentType),
  })
);

export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;

// ═══════════════════════════════════════════════════════════
// SERVICE SELECTIONS TABLE (Bundles)
// ═══════════════════════════════════════════════════════════

export const serviceSelections = pgTable('service_selections', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  serviceCodes: jsonb('service_codes').notNull(), // ['S1', 'S2', 'S4']
  isBundle: boolean('is_bundle').notNull().default(false),
  bundleName: varchar('bundle_name', { length: 100 }),
  totalCostTokens: integer('total_cost_tokens').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  // 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type ServiceSelection = typeof serviceSelections.$inferSelect;
export type NewServiceSelection = typeof serviceSelections.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════

export const plansRelations = relations(plans, ({ one }) => ({
  project: one(projects, {
    fields: [plans.projectId],
    references: [projects.id],
  }),
}));

export const serviceExecutionsRelations = relations(serviceExecutions, ({ one }) => ({
  project: one(projects, {
    fields: [serviceExecutions.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [serviceExecutions.userId],
    references: [users.id],
  }),
}));

export const contentsRelations = relations(contents, ({ one }) => ({
  project: one(projects, {
    fields: [contents.projectId],
    references: [projects.id],
  }),
  execution: one(serviceExecutions, {
    fields: [contents.executionId],
    references: [serviceExecutions.id],
  }),
}));
