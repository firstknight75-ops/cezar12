import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { projects } from './projects.js';

// ═══════════════════════════════════════════════════════════
// ASSETS TABLE
// ═══════════════════════════════════════════════════════════

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    originalFilename: varchar('original_filename', { length: 255 }).notNull(),
    storedKey: varchar('stored_key', { length: 500 }).notNull(),
    processedKey: varchar('processed_key', { length: 500 }),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(), // bytes
    assetType: varchar('asset_type', { length: 50 }).notNull(),
    // 'logo' | 'product' | 'brand' | 'other'
    status: varchar('status', { length: 20 }).notNull().default('processing'),
    // 'processing' | 'ready' | 'failed'
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index('idx_assets_project').on(table.projectId, table.isDeleted),
    userIdx: index('idx_assets_user').on(table.userId),
    storedKeyIdx: index('idx_assets_stored_key').on(table.storedKey),
  })
);

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

// ═══════════════════════════════════════════════════════════
// PERFORMANCE REPORTS TABLE
// ═══════════════════════════════════════════════════════════

export const performanceReports = pgTable(
  'performance_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    actualData: jsonb('actual_data').notNull(),
    analysis: jsonb('analysis'),
    deviations: jsonb('deviations'),
    recommendations: jsonb('recommendations'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    // 'pending' | 'analyzing' | 'completed' | 'failed'
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index('idx_reports_project').on(
      table.projectId,
      table.periodStart
    ),
  })
);

export type PerformanceReport = typeof performanceReports.$inferSelect;
export type NewPerformanceReport = typeof performanceReports.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════

export const assetsRelations = relations(assets, ({ one }) => ({
  project: one(projects, {
    fields: [assets.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
  }),
}));

export const performanceReportsRelations = relations(performanceReports, ({ one }) => ({
  project: one(projects, {
    fields: [performanceReports.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [performanceReports.userId],
    references: [users.id],
  }),
}));
