import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  jsonb,
  timestamp,
  inet,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "support"]);

export const industryEnum = pgEnum("industry", [
  "ecommerce",
  "services",
  "restaurant",
  "real_estate",
]);

export const companySizeEnum = pgEnum("company_size", [
  "1-10",
  "11-50",
  "51-200",
  "200+",
]);

export const businessModelEnum = pgEnum("business_model", [
  "B2B",
  "B2C",
  "B2B2C",
  "Marketplace",
]);

export const priceRangeEnum = pgEnum("price_range", [
  "budget",
  "mid-range",
  "premium",
  "luxury",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "silver",
  "gold",
  "platinum",
]);

export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "quarterly",
  "annual",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "suspended",
  "cancelled",
]);

export const projectDomainEnum = pgEnum("project_domain", [
  "ecommerce",
  "services",
  "restaurant",
  "real_estate",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "diagnosed",
  "strategy_ready",
  "producing",
  "monitoring",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
]);

export const tokenDirectionEnum = pgEnum("token_direction", [
  "debit",
  "credit",
]);

export const tokenSourceEnum = pgEnum("token_source", [
  "plan",
  "addon",
  "refund",
  "grant",
]);

export const aiJobStatusEnum = pgEnum("ai_job_status", [
  "queued",
  "processing",
  "completed",
  "failed",
  "approved",
  "rejected",
  "deferred",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  country: varchar("country", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  isVerified: boolean("is_verified").notNull().default(false),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    companyNameEn: varchar("company_name_en", { length: 255 }),
    industry: industryEnum("industry").notNull(),
    subIndustry: varchar("sub_industry", { length: 100 }),
    companySize: companySizeEnum("company_size").notNull(),
    businessModel: businessModelEnum("business_model").notNull(),
    foundedYear: integer("founded_year"),
    country: varchar("country", { length: 100 }),
    targetCities: jsonb("target_cities"),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    socialLinks: jsonb("social_links"),
    description: text("description"),
    uniqueValueProp: text("unique_value_prop"),
    mainProducts: jsonb("main_products"),
    priceRange: priceRangeEnum("price_range"),
    mainCompetitors: jsonb("main_competitors"),
    monthlyMarketingBudget: numeric("monthly_marketing_budget", {
      precision: 14,
      scale: 2,
    }),
    hasMarketingTeam: boolean("has_marketing_team").notNull().default(false),
    currentChannels: jsonb("current_channels"),
    targetMonthlyRevenue: numeric("target_monthly_revenue", {
      precision: 14,
      scale: 2,
    }),
    isComplete: boolean("is_complete").notNull().default(false),
    digitalPresenceScore: integer("digital_presence_score"),
    digitalAnalysis: jsonb("digital_analysis"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    companiesUserIdIdx: index("companies_user_id_idx").on(t.userId),
    companiesDigitalPresenceScoreRange: check(
      "companies_digital_presence_score_range",
      sql`${t.digitalPresenceScore} between 0 and 100`
    ),
  })
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: subscriptionPlanEnum("plan").notNull(),
  cycle: billingCycleEnum("cycle").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  planTokenBalance: integer("plan_token_balance").notNull().default(0),
  planTokenMonthly: integer("plan_token_monthly").notNull().default(0),
  addonTokenBalance: integer("addon_token_balance").notNull().default(0),
  currentPeriodStart: timestamp("current_period_start", {
    withTimezone: true,
  }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const addonPurchases = pgTable(
  "addon_purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    packageType: varchar("package_type", { length: 20 }).notNull(),
    tokens: integer("tokens").notNull(),
    price: numeric("price", { precision: 8, scale: 2 }).notNull(),
    tokensRemaining: integer("tokens_remaining").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    addonPurchasesSubIdIdx: index("addon_purchases_sub_id_idx").on(t.subscriptionId),
    addonPurchasesExpiresAtIdx: index("addon_purchases_expires_at_idx").on(t.expiresAt),
  })
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    domain: projectDomainEnum("domain").notNull(),
    domainData: jsonb("domain_data"),
    status: projectStatusEnum("status").notNull().default("draft"),
    blocking: boolean("blocking").notNull().default(false),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lockedBy: uuid("locked_by"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectsUserIdIdx: index("projects_user_id_idx").on(t.userId),
  })
);

export const ubo = pgTable(
  "ubo",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .unique()
      .references(() => projects.id, { onDelete: "cascade" }),
    riskLevel: riskLevelEnum("risk_level").notNull(),
    financialScore: integer("financial_score").notNull(),
    metrics: jsonb("metrics"),
    recommendations: jsonb("recommendations"),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uboProjectIdIdx: index("ubo_project_id_idx").on(t.projectId),
    uboFinancialScoreRange: check(
      "ubo_financial_score_range",
      sql`${t.financialScore} between 0 and 100`
    ),
  })
);

export const tokenTransactions = pgTable(
  "token_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    serviceType: varchar("service_type", { length: 100 }).notNull(),
    amount: integer("amount").notNull(),
    direction: tokenDirectionEnum("direction").notNull(),
    source: tokenSourceEnum("source").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tokenTransactionsUserCreatedIdx: index("token_transactions_user_id_created_at_idx").on(
      t.userId,
      t.createdAt
    ),
  })
);

export const aiJobs = pgTable(
  "ai_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    serviceType: varchar("service_type", { length: 100 }).notNull(),
    status: aiJobStatusEnum("status").notNull().default("queued"),
    resultContent: text("result_content"),
    tokensDeducted: integer("tokens_deducted").notNull().default(0),
    tokensRefunded: integer("tokens_refunded").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => ({
    aiJobsUserStatusIdx: index("ai_jobs_user_id_status_idx").on(t.userId, t.status),
  })
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorRole: userRoleEnum("actor_role"),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 100 }).notNull(),
    targetId: uuid("target_id").notNull(),
    metadata: jsonb("metadata"),
    ip: inet("ip"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    auditLogCreatedAtIdx: index("audit_log_created_at_idx").on(t.createdAt),
  })
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
  subscriptions: many(subscriptions),
  projects: many(projects),
  tokenTransactions: many(tokenTransactions),
  aiJobs: many(aiJobs),
  auditLogs: many(auditLog),
}));

export const companiesRelations = relations(companies, ({ one }) => ({
  user: one(users, { fields: [companies.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  addonPurchases: many(addonPurchases),
}));

export const addonPurchasesRelations = relations(addonPurchases, ({ one }) => ({
  user: one(users, { fields: [addonPurchases.userId], references: [users.id] }),
  subscription: one(subscriptions, {
    fields: [addonPurchases.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  ubo: one(ubo, { fields: [projects.id], references: [ubo.projectId] }),
  tokenTransactions: many(tokenTransactions),
  aiJobs: many(aiJobs),
}));

export const uboRelations = relations(ubo, ({ one }) => ({
  project: one(projects, {
    fields: [ubo.projectId],
    references: [projects.id],
  }),
}));

export const tokenTransactionsRelations = relations(
  tokenTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [tokenTransactions.userId],
      references: [users.id],
    }),
    project: one(projects, {
      fields: [tokenTransactions.projectId],
      references: [projects.id],
    }),
  })
);

export const aiJobsRelations = relations(aiJobs, ({ one }) => ({
  user: one(users, { fields: [aiJobs.userId], references: [users.id] }),
  project: one(projects, {
    fields: [aiJobs.projectId],
    references: [projects.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actorId],
    references: [users.id],
  }),
}));
