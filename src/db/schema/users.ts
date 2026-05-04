import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  decimal,
  jsonb,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════
// USERS TABLE
// ═══════════════════════════════════════════════════════════

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: varchar('tenant_id', { length: 50 }).notNull().default('cezar12'),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 200 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    countryCode: varchar('country_code', { length: 5 }).notNull().default('US'),
    currency: varchar('currency', { length: 5 }).notNull().default('USD'),
    timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
    preferredLang: varchar('preferred_lang', { length: 5 }).notNull().default('ar'),
    isVerified: boolean('is_verified').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    tenantIdx: index('idx_users_tenant').on(table.tenantId),
    countryIdx: index('idx_users_country').on(table.countryCode),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ═══════════════════════════════════════════════════════════
// COMPANY PROFILES TABLE
// ═══════════════════════════════════════════════════════════

export const companyProfiles = pgTable(
  'company_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // ── Section A: Basic Info ─────────────────────────────
    companyName: varchar('company_name', { length: 200 }).notNull(),
    companyNameEn: varchar('company_name_en', { length: 200 }),
    industry: varchar('industry', { length: 100 }).notNull(),
    subIndustry: varchar('sub_industry', { length: 100 }),
    companySize: varchar('company_size', { length: 20 }).notNull(),
    businessModel: varchar('business_model', { length: 20 }).notNull(),
    foundedYear: integer('founded_year'),

    // ── Section B: Location ───────────────────────────────
    countryCode: varchar('country_code', { length: 5 }).notNull(),
    currency: varchar('currency', { length: 5 }).notNull(),
    timezone: varchar('timezone', { length: 50 }).notNull(),
    targetCities: jsonb('target_cities').notNull().default([]),

    // ── Section C: Digital Presence ───────────────────────
    websiteUrl: varchar('website_url', { length: 500 }),
    instagramUrl: varchar('instagram_url', { length: 500 }),
    tiktokUrl: varchar('tiktok_url', { length: 500 }),
    twitterUrl: varchar('twitter_url', { length: 500 }),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    facebookUrl: varchar('facebook_url', { length: 500 }),
    snapchatUrl: varchar('snapchat_url', { length: 500 }),
    youtubeUrl: varchar('youtube_url', { length: 500 }),
    googleBusinessUrl: varchar('google_business_url', { length: 500 }),

    // ── Section D: Business Description ───────────────────
    description: text('description'),
    uniqueValueProp: text('unique_value_prop'),
    mainProducts: jsonb('main_products').notNull().default([]),
    priceRange: varchar('price_range', { length: 20 }),
    competitors: jsonb('competitors').notNull().default([]),
    challenges: jsonb('challenges').notNull().default([]),

    // ── Section E: Marketing Status ───────────────────────
    hasMarketingTeam: boolean('has_marketing_team').default(false),
    monthlyMktBudgetUsd: decimal('monthly_mkt_budget_usd', {
      precision: 10,
      scale: 2,
    }),
    currentChannels: jsonb('current_channels').notNull().default([]),
    biggestPain: text('biggest_pain'),
    targetMonthlyRevenueUsd: decimal('target_monthly_revenue_usd', {
      precision: 10,
      scale: 2,
    }),

    // ── Section F: Auto-Analysis Results ──────────────────
    digitalPresenceScore: integer('digital_presence_score'),
    digitalPresenceData: jsonb('digital_presence_data'),
    lastAnalyzedAt: timestamp('last_analyzed_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex('idx_company_profiles_user').on(table.userId),
  })
);

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type NewCompanyProfile = typeof companyProfiles.$inferInsert;

// ═══════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ one, many }) => ({
  companyProfile: one(companyProfiles, {
    fields: [users.id],
    references: [companyProfiles.userId],
  }),
}));

export const companyProfilesRelations = relations(companyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [companyProfiles.userId],
    references: [users.id],
  }),
}));