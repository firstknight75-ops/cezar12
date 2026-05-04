CREATE TYPE "public"."ai_job_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'approved', 'rejected', 'deferred');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'quarterly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."business_model" AS ENUM('B2B', 'B2C', 'B2B2C', 'Marketplace');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '200+');--> statement-breakpoint
CREATE TYPE "public"."industry" AS ENUM('ecommerce', 'services', 'restaurant', 'real_estate');--> statement-breakpoint
CREATE TYPE "public"."price_range" AS ENUM('budget', 'mid-range', 'premium', 'luxury');--> statement-breakpoint
CREATE TYPE "public"."project_domain" AS ENUM('ecommerce', 'services', 'restaurant', 'real_estate');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'diagnosed', 'strategy_ready', 'producing', 'monitoring');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'suspended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."token_direction" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."token_source" AS ENUM('plan', 'addon', 'refund', 'grant');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'support');--> statement-breakpoint
CREATE TABLE "addon_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"package_type" varchar(20) NOT NULL,
	"tokens" integer NOT NULL,
	"price" numeric(8, 2) NOT NULL,
	"tokens_remaining" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"service_type" varchar(100) NOT NULL,
	"status" "ai_job_status" DEFAULT 'queued' NOT NULL,
	"result_content" text,
	"tokens_deducted" integer DEFAULT 0 NOT NULL,
	"tokens_refunded" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_role" "user_role",
	"action" varchar(100) NOT NULL,
	"target_type" varchar(100) NOT NULL,
	"target_id" uuid NOT NULL,
	"metadata" jsonb,
	"ip" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"company_name_en" varchar(255),
	"industry" "industry" NOT NULL,
	"sub_industry" varchar(100),
	"company_size" "company_size" NOT NULL,
	"business_model" "business_model" NOT NULL,
	"founded_year" integer,
	"country" varchar(100),
	"target_cities" jsonb,
	"logo_url" text,
	"website_url" text,
	"social_links" jsonb,
	"description" text,
	"unique_value_prop" text,
	"main_products" jsonb,
	"price_range" "price_range",
	"main_competitors" jsonb,
	"monthly_marketing_budget" numeric(14, 2),
	"has_marketing_team" boolean DEFAULT false NOT NULL,
	"current_channels" jsonb,
	"target_monthly_revenue" numeric(14, 2),
	"is_complete" boolean DEFAULT false NOT NULL,
	"digital_presence_score" integer,
	"digital_analysis" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_digital_presence_score_range" CHECK ("companies"."digital_presence_score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" "project_domain" NOT NULL,
	"domain_data" jsonb,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"blocking" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp with time zone,
	"locked_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "subscription_plan" NOT NULL,
	"cycle" "billing_cycle" NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"plan_token_balance" integer DEFAULT 0 NOT NULL,
	"plan_token_monthly" integer DEFAULT 0 NOT NULL,
	"addon_token_balance" integer DEFAULT 0 NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"service_type" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"direction" "token_direction" NOT NULL,
	"source" "token_source" NOT NULL,
	"balance_after" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ubo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"financial_score" integer NOT NULL,
	"metrics" jsonb,
	"recommendations" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ubo_project_id_unique" UNIQUE("project_id"),
	CONSTRAINT "ubo_financial_score_range" CHECK ("ubo"."financial_score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"country" varchar(100),
	"phone" varchar(50),
	"is_verified" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addon_purchases" ADD CONSTRAINT "addon_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addon_purchases" ADD CONSTRAINT "addon_purchases_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ubo" ADD CONSTRAINT "ubo_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addon_purchases_sub_id_idx" ON "addon_purchases" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "addon_purchases_expires_at_idx" ON "addon_purchases" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "ai_jobs_user_id_status_idx" ON "ai_jobs" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "companies_user_id_idx" ON "companies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_transactions_user_id_created_at_idx" ON "token_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ubo_project_id_idx" ON "ubo" USING btree ("project_id");