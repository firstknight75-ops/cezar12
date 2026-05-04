import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  text,
  date,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { projects } from './projects';

// ═══════════════════════════════════════════════════════════
// DAILY RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════

export const dailyRecommendations = pgTable(
  'daily_recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: varchar('type', { length: 30 }).notNull(),
    // 'content' | 'performance' | 'risk' | 'opportunity' |
    // 'improvement' | 'timing'

    priority: varchar('priority', { length: 10 }).notNull().default('medium'),
    // 'critical' | 'high' | 'medium' | 'low'

    title: text('title').notNull(),
    message: text('message').notNull(),
    rationale: text('rationale'),

    actionLabel: varchar('action_label', { length: 100 }),
    actionType: varchar('action_type', { length: 50 }),
    // 'generate_content' | 'view_report' | 'update_settings' |
    // 'navigate' | 'external_link' | 'dismiss'

    actionData: jsonb('action_data').notNull().default({}),

    wasActedOn: boolean('was_acted_on').notNull().default(false),
    actedAt: timestamp('acted_at'),
    dismissedAt: timestamp('dismissed_at'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userDateIdx: index('idx_daily_recs_user').on(
      table.userId,
      table.createdAt
    ),
    projectIdx: index('idx_daily_recs_project').on(
      table.projectId,
      table.expiresAt
    ),
    typeIdx: index('idx_daily_recs_type').on(table.type, table.priority),
  })
);

export type DailyRecommendation = typeof dailyRecommendations.$inferSelect;
export type NewDailyRecommendation = typeof dailyRecommendations.$inferInsert;

// ═══════════════════════════════════════════════════════════
// MARKET EVENTS (holidays, seasons, etc.)
// ═══════════════════════════════════════════════════════════

export const marketEvents = pgTable(
  'market_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    // 'holiday' | 'season' | 'sale_event' | 'national_day' | 'religious'
    countries: jsonb('countries').notNull(),
    // ['SA', 'AE', 'ALL']
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    relevantSectors: jsonb('relevant_sectors').notNull().default([]),
    // ['ecommerce', 'restaurant', 'ALL']
    isAnnual: boolean('is_annual').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index('idx_market_events_date').on(table.startDate, table.endDate),
  })
);

export type MarketEvent = typeof marketEvents.$inferSelect;
export type NewMarketEvent = typeof marketEvents.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════

export const dailyRecommendationsRelations = relations(
  dailyRecommendations,
  ({ one }) => ({
    project: one(projects, {
      fields: [dailyRecommendations.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [dailyRecommendations.userId],
      references: [users.id],
    }),
  })
);