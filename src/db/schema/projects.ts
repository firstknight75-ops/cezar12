import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// ═══════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════

export const domainIdEnum = pgEnum('domain_id', [
  'ecommerce',
  'services',
  'restaurant',
  'real_estate',
]);

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'diagnosed',
  'strategy_ready',
  'producing',
  'monitoring',
]);

// ═══════════════════════════════════════════════════════════
// PROJECTS TABLE
// ═══════════════════════════════════════════════════════════

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: varchar('tenant_id', { length: 50 }).notNull().default('cezar12'),
    domainId: domainIdEnum('domain_id').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    status: projectStatusEnum('status').notNull().default('draft'),

    // ── Domain-specific data ──────────────────────────────
    domainData: jsonb('domain_data').notNull().default({}),

    // ── UBO (Universal Business Object) ───────────────────
    ubo: jsonb('ubo').notNull().default({}),

    // ── Financial Analysis Result ─────────────────────────
    financialAnalysis: jsonb('financial_analysis'),

    // ── Concurrency Lock ──────────────────────────────────
    lockedAt: timestamp('locked_at'),
    lockedBy: uuid('locked_by'), // task_id that holds the lock

    // ── Soft Delete ───────────────────────────────────────
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('idx_projects_user').on(table.userId, table.isDeleted),
    tenantUserIdx: index('idx_projects_tenant').on(table.tenantId, table.userId),
    statusIdx: index('idx_projects_status').on(table.status),
    lockedIdx: index('idx_projects_locked').on(table.lockedAt),
    domainIdx: index('idx_projects_domain').on(table.domainId),
  })
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// ═══════════════════════════════════════════════════════════
// UBO VERSIONS TABLE
// ═══════════════════════════════════════════════════════════

export const uboVersions = pgTable(
  'ubo_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    uboSnapshot: jsonb('ubo_snapshot').notNull(),
    triggerEvent: varchar('trigger_event', { length: 100 }).notNull(),
    // project_created | data_updated | plan_generated |
    // content_produced | report_analyzed | campaign_built
    triggeredBy: varchar('triggered_by', { length: 50 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    projectVersionIdx: index('idx_ubo_versions_project').on(
      table.projectId,
      table.version
    ),
    projectVersionUnique: unique('ubo_versions_project_version').on(
      table.projectId,
      table.version
    ),
  })
);

export type UboVersion = typeof uboVersions.$inferSelect;
export type NewUboVersion = typeof uboVersions.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  uboVersions: many(uboVersions),
}));

export const uboVersionsRelations = relations(uboVersions, ({ one }) => ({
  project: one(projects, {
    fields: [uboVersions.projectId],
    references: [projects.id],
  }),
}));