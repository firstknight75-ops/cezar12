# Cezar 12 — Monorepo Guide for Claude

## Overview

Cezar 12 is a Gulf-region bilingual (AR/EN) business intelligence SaaS. It
analyses a company's financial data and generates AI-powered growth plans,
marketing content, and kitchen intelligence reports.

## Monorepo Structure

```
cezar12/
├── packages/
│   ├── web/      Vite + React 18 frontend (port 8080)
│   ├── api/      Fastify 5 REST backend   (port 3000)
│   ├── worker/   BullMQ AI job workers
│   └── shared/   Drizzle schema + shared TypeScript types
├── docker-compose.yml   PostgreSQL 16 · Redis 7 · MinIO
├── turbo.json
└── pnpm-workspace.yaml
```

## Package Responsibilities

| Package | Purpose | Key deps |
|---------|---------|----------|
| `@cezar12/web` | React SPA — pages, components, hooks, financial engine, UI | React, Vite, Tailwind, Recharts |
| `@cezar12/api` | REST API — auth, projects, services, tokens, admin | Fastify, Drizzle, ioredis |
| `@cezar12/worker` | BullMQ workers — AI job processing (Anthropic + OpenAI) | BullMQ, ioredis, @anthropic-ai/sdk, openai |
| `@cezar12/shared` | DB schema (Drizzle), shared TS types, queue constants | drizzle-orm, zod |

## Common Commands

```bash
# Start everything
pnpm dev              # all packages in parallel via turbo

# Individual packages
pnpm --filter @cezar12/api dev
pnpm --filter @cezar12/worker dev
pnpm --filter @cezar12/web dev

# Tests
pnpm test             # all packages
pnpm --filter @cezar12/web test

# Type-check
pnpm type-check       # all packages

# Infrastructure
docker compose up -d  # start postgres, redis, minio
```

## Design System (packages/web)

- **Oxblood** `hsl(354 65% 28%)` — primary, CTAs
- **Cream** `hsl(38 38% 94%)` — backgrounds
- **Ember** `hsl(28 85% 55%)` — accents, tokens
- **Ink** `hsl(0 35% 12%)` — text
- **font-display** — Fraunces (editorial headings)
- **font-mono-ed** — JetBrains Mono (numbers, labels)
- RTL-ready: use `dir="rtl"` and logical properties (`start`/`end`)
- No `<form>` tags — all wizard/form UIs use React state only

## Domain Model

Four business domains: `ECOMMERCE | SERVICES | RESTAURANT | REAL_ESTATE`

Risk bands: `CRITICAL (0–24) | HIGH (25–54) | MEDIUM (55–84) | LOW (85–100)`

## AI Pipeline

```
POST /api/projects/:id/services/:type
  → TokenService.deductTokens()
  → BullMQ job enqueued
  → Worker picks up job
  → PromptBuilder.build() → anonymizeForAI()
  → Anthropic claude-opus-4-6 (or OpenAI gpt-4o via feature flag)
  → disclaimerMiddleware injects Arabic disclaimer
  → ai_jobs.status = "completed", result_content saved
  → User approves / rejects / defers via API
```

Feature flag `feature:ai_provider` in Redis selects provider.

## Token Economy

| Plan | Monthly tokens | Overage |
|------|---------------|---------|
| Silver | 500 | Addon packs |
| Gold | 1 000 | Addon packs |
| Platinum | 2 500 | Addon packs |

Service costs are defined in `packages/shared/src/service-catalog.ts`.
Server-side costs are in `packages/api/src/lib/token-service.ts`.

## Database

PostgreSQL via Drizzle ORM. Schema lives in `packages/shared/src/db/schema.ts`.

Key tables: `users`, `companies`, `subscriptions`, `addon_purchases`,
`projects`, `ubo`, `token_transactions`, `ai_jobs`, `audit_log`.

Migrations: `packages/api/drizzle/` managed by `drizzle-kit`.

## Security

- JWT auth (`HS256`), verified by `packages/api/src/plugins/auth.ts`
- Admin routes: role must be `admin` or `support` (support = readOnly)
- All admin actions logged to `audit_log`
- Rate limiting: 100 req/min general, 10 req/hr register, 20 req/hr AI per user
- File uploads: MIME detected from magic bytes via `file-type`
- All AI output appends Arabic disclaimer (idempotent)

## Arabic Disclaimer

Every AI response must end with:

> تنبيه: هذه النتائج مقدمة لأغراض إرشادية فقط ولا تُعدّ استشارة مالية أو
> قانونية أو ضريبية. يُرجى الاستعانة بمستشار مختص قبل اتخاذ أي قرارات.

## Environment

Copy `.env.example` → `.env` and fill in values.
Run `docker compose up -d` before starting any package.
