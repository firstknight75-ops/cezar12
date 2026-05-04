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
  date,
  inet,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { projects } from './projects';

// ═══════════════════════════════════════════════════════════
// ADMIN USERS (separate from regular users)
// ═══════════════════════════════════════════════════════════

export const adminUsers = pgTable(
  'admin_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('support'),
    // 'owner' | 'admin' | 'support'
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_admin_users_email').on(table.email),
  })
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

// ═══════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    flagName: varchar('flag_name', { length: 100 }).notNull(),
    description: text('description'),
    enabledFor: varchar('enabled_for', { length: 20 }).notNull().default('all'),
    // 'all' | 'silver' | 'gold' | 'platinum' | 'none' | 'specific'
    enabledTenants: jsonb('enabled_tenants').notNull().default([]),
    isEnabled: boolean('is_enabled').notNull().default(true),
    updatedBy: uuid('updated_by').references(() => adminUsers.id),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    flagNameIdx: uniqueIndex('idx_feature_flags_name').on(table.flagName),
  })
);

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;

// ═══════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    projectId: uuid('project_id').references(() => projects.id),
    action: varchar('action', { length: 100 }).notNull(),
    // 'project.created' | 'project.status_changed' | 'plan.generated' |
    // 'tokens.deducted' | 'tokens.refunded' | 'user.login' |
    // 'user.login_failed' | 'recipe.created' | 'price.updated' etc.

    entityType: varchar('entity_type', { length: 50 }).notNull(),
    // 'project' | 'user' | 'plan' | 'recipe' | 'ingredient' | 'subscription'
    entityId: uuid('entity_id'),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    requestId: uuid('request_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    entityIdx: index('idx_audit_entity').on(
      table.entityType,
      table.entityId,
      table.createdAt
    ),
    userIdx: index('idx_audit_user').on(table.userId, table.createdAt),
    actionIdx: index('idx_audit_action').on(table.action),
  })
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;

// ═══════════════════════════════════════════════════════════
// ADMIN AUDIT LOG (admin-only actions)
// ═══════════════════════════════════════════════════════════

export const adminAuditLog = pgTable(
  'admin_audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id')
      .notNull()
      .references(() => adminUsers.id),
    action: varchar('action', { length: 100 }).notNull(),
    // 'tenant.suspended' | 'tenant.restored' | 'tokens.granted' |
    // 'plan.changed' | 'feature_flag.toggled' | 'tenant.viewed'
    tenantId: varchar('tenant_id', { length: 50 }),
    details: jsonb('details'),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    adminIdx: index('idx_admin_audit_admin').on(table.adminId),
    tenantIdx: index('idx_admin_audit_tenant').on(table.tenantId),
  })
);

export type AdminAuditLogEntry = typeof adminAuditLog.$inferSelect;
export type NewAdminAuditLogEntry = typeof adminAuditLog.$inferInsert;

// ═══════════════════════════════════════════════════════════
// PLATFORM METRICS (daily aggregated)
// ═══════════════════════════════════════════════════════════

export const platformMetricsDaily = pgTable('platform_metrics_daily', {
  date: date('date').primaryKey(),
  activeUsers: integer('active_users').notNull().default(0),
  newSignups: integer('new_signups').notNull().default(0),
  aiRequests: integer('ai_requests').notNull().default(0),
  tokensConsumed: integer('tokens_consumed').notNull().default(0),
  revenueUsd: decimal('revenue_usd', { precision: 12, scale: 2 })
    .notNull()
    .default('0'),
  newSubscriptions: integer('new_subscriptions').notNull().default(0),
  cancellations: integer('cancellations').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type PlatformMetric = typeof platformMetricsDaily.$inferSelect;
export type NewPlatformMetric = typeof platformMetricsDaily.$inferInsert;
