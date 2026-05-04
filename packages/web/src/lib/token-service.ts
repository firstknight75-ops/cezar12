import { and, desc, eq, lt, sql } from "drizzle-orm"
import { type Db } from "@/db/client"
import {
  addonPurchases,
  aiJobs,
  subscriptions,
  tokenTransactions,
} from "@/db/schema"

// ─── Service cost table ───────────────────────────────────────────────────────
// Index: 0 = silver, 1 = gold, 2 = platinum. null = not available on that plan.

const SERVICE_COSTS: Record<string, [number | null, number | null, number | null]> = {
  plan_90day:            [80,   60,  45],
  weekly_content:        [50,   40,  30],
  market_research:       [60,   50,  35],
  buyer_persona:         [40,   30,  25],
  visual_identity:       [50,   40,  30],
  seo_plan:              [60,   45,  35],
  ad_campaign:           [70,   55,  40],
  performance_report:    [30,   25,  20],
  lead_generation:       [50,   40,  30],
  kitchen_cost_analysis: [null, 40,  25],
  recipe_costing:        [null, 20,  10],
  promotion_optimizer:   [null, 30,  20],
  data_edit_light:       [2,    2,   1],
  data_edit_heavy:       [5,    4,   3],
  pdf_export:            [2,    1,   0],
  initial_assessment:    [0,    0,   0],
}

const PLAN_INDEX: Record<string, 0 | 1 | 2> = {
  silver: 0,
  gold: 1,
  platinum: 2,
}

const PLAN_MONTHLY_TOKENS: Record<string, number> = {
  silver: 500,
  gold: 1500,
  platinum: 5000,
}

// ─── Addon package catalogue ──────────────────────────────────────────────────

const ADDON_PACKAGES: Record<string, { tokens: number; price: number }> = {
  micro:      { tokens: 200,   price: 15  },
  small:      { tokens: 500,   price: 35  },
  medium:     { tokens: 1500,  price: 99  },
  large:      { tokens: 5000,  price: 299 },
  enterprise: { tokens: 15000, price: 799 },
}

// ─── Custom errors ────────────────────────────────────────────────────────────

export class ServiceNotAvailableError extends Error {
  readonly serviceType: string
  readonly planType: string

  constructor(serviceType: string, planType: string) {
    const upgrade =
      planType === "silver"
        ? "Upgrade to Gold or Platinum to unlock this service."
        : "Upgrade to Platinum to unlock this service."
    super(
      `Service '${serviceType}' is not available on the ${planType} plan. ${upgrade}`,
    )
    this.name = "ServiceNotAvailableError"
    this.serviceType = serviceType
    this.planType = planType
  }
}

export class InsufficientTokensError extends Error {
  readonly needed: number
  readonly available: number

  constructor(needed: number, available: number) {
    super(
      `Insufficient tokens. Needed: ${needed}, Available: ${available}. Purchase add-on tokens to continue.`,
    )
    this.name = "InsufficientTokensError"
    this.needed = needed
    this.available = available
  }
}

// ─── Return types ─────────────────────────────────────────────────────────────

export type TokenBalance = {
  plan_tokens: number
  addon_tokens: number
  total: number
  plan_type: string
}

export type DeductResult = {
  deducted: number
  source: "addon" | "plan"
  balance_after: number
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class TokenService {
  constructor(private readonly db: Db) {}

  // ── getBalance ─────────────────────────────────────────────────────────────

  async getBalance(userId: string): Promise<TokenBalance> {
    const sub = await this.requireActiveSubscription(userId)
    return {
      plan_tokens: sub.planTokenBalance,
      addon_tokens: sub.addonTokenBalance,
      total: sub.planTokenBalance + sub.addonTokenBalance,
      plan_type: sub.plan,
    }
  }

  // ── getCost ────────────────────────────────────────────────────────────────

  getCost(serviceType: string, planType: string): number {
    const row = SERVICE_COSTS[serviceType]
    if (!row) throw new ServiceNotAvailableError(serviceType, planType)

    const idx = PLAN_INDEX[planType]
    if (idx === undefined) throw new Error(`Unknown plan type: ${planType}`)

    const cost = row[idx]
    if (cost === null) throw new ServiceNotAvailableError(serviceType, planType)

    return cost
  }

  // ── deductTokens ───────────────────────────────────────────────────────────

  async deductTokens(
    userId: string,
    serviceType: string,
    projectId: string,
  ): Promise<DeductResult> {
    return this.db.transaction(async (tx) => {
      const sub = await this.requireActiveSubscription(userId, tx)
      const cost = this.getCost(serviceType, sub.plan)

      const total = sub.planTokenBalance + sub.addonTokenBalance
      if (total < cost) {
        throw new InsufficientTokensError(cost, total)
      }

      let source: "addon" | "plan"
      let balanceAfter: number

      if (sub.addonTokenBalance >= cost) {
        // Deduct from addon first
        source = "addon"
        const newAddon = sub.addonTokenBalance - cost
        await tx
          .update(subscriptions)
          .set({ addonTokenBalance: newAddon })
          .where(eq(subscriptions.id, sub.id))

        // Also decrement oldest addon purchase(s) in FIFO order
        const purchases = await tx
          .select()
          .from(addonPurchases)
          .where(
            and(
              eq(addonPurchases.subscriptionId, sub.id),
              sql`${addonPurchases.tokensRemaining} > 0`,
            ),
          )
          .orderBy(addonPurchases.expiresAt)

        let remaining = cost
        for (const p of purchases) {
          if (remaining <= 0) break
          const deductFromThis = Math.min(p.tokensRemaining, remaining)
          await tx
            .update(addonPurchases)
            .set({ tokensRemaining: p.tokensRemaining - deductFromThis })
            .where(eq(addonPurchases.id, p.id))
          remaining -= deductFromThis
        }

        balanceAfter = newAddon + sub.planTokenBalance
      } else {
        // Deduct from plan tokens
        source = "plan"
        const newPlan = sub.planTokenBalance - cost
        await tx
          .update(subscriptions)
          .set({ planTokenBalance: newPlan })
          .where(eq(subscriptions.id, sub.id))
        balanceAfter = newPlan + sub.addonTokenBalance
      }

      await tx.insert(tokenTransactions).values({
        userId,
        projectId,
        serviceType,
        amount: cost,
        direction: "debit",
        source,
        balanceAfter,
      })

      return { deducted: cost, source, balance_after: balanceAfter }
    })
  }

  // ── refundTokens ───────────────────────────────────────────────────────────

  async refundTokens(userId: string, jobId: string, pct: 50 | 100): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Load the job to get serviceType + tokensDeducted
      const [job] = await tx
        .select()
        .from(aiJobs)
        .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
        .limit(1)

      if (!job) throw new Error(`AI job ${jobId} not found for user ${userId}`)
      if (job.tokensDeducted === 0) return // nothing to refund

      // Find the original debit transaction (most recent for this project+service)
      const [origTx] = await tx
        .select()
        .from(tokenTransactions)
        .where(
          and(
            eq(tokenTransactions.userId, userId),
            eq(tokenTransactions.projectId, job.projectId),
            eq(tokenTransactions.serviceType, job.serviceType),
            eq(tokenTransactions.direction, "debit"),
          ),
        )
        .orderBy(desc(tokenTransactions.createdAt))
        .limit(1)

      const refundAmount = Math.floor(job.tokensDeducted * (pct / 100))
      if (refundAmount === 0) return

      const source = (origTx?.source ?? "plan") as "plan" | "addon"
      const sub = await this.requireActiveSubscription(userId, tx)

      let balanceAfter: number

      if (source === "addon") {
        const newAddon = sub.addonTokenBalance + refundAmount
        await tx
          .update(subscriptions)
          .set({ addonTokenBalance: newAddon })
          .where(eq(subscriptions.id, sub.id))
        balanceAfter = sub.planTokenBalance + newAddon
      } else {
        const newPlan = sub.planTokenBalance + refundAmount
        await tx
          .update(subscriptions)
          .set({ planTokenBalance: newPlan })
          .where(eq(subscriptions.id, sub.id))
        balanceAfter = newPlan + sub.addonTokenBalance
      }

      await tx.insert(tokenTransactions).values({
        userId,
        projectId: job.projectId,
        serviceType: job.serviceType,
        amount: refundAmount,
        direction: "credit",
        source: "refund",
        balanceAfter,
      })

      await tx
        .update(aiJobs)
        .set({ tokensRefunded: job.tokensRefunded + refundAmount })
        .where(eq(aiJobs.id, jobId))
    })
  }

  // ── purchaseAddon ──────────────────────────────────────────────────────────

  async purchaseAddon(userId: string, packageType: string): Promise<void> {
    const pkg = ADDON_PACKAGES[packageType]
    if (!pkg) throw new Error(`Unknown addon package: ${packageType}`)

    await this.db.transaction(async (tx) => {
      const sub = await this.requireActiveSubscription(userId, tx)

      // Grace period: < 7 days left → next period end (another period's length away)
      const now = new Date()
      const periodEnd = new Date(sub.currentPeriodEnd)
      const daysLeft = (periodEnd.getTime() - now.getTime()) / 86_400_000
      let expiresAt: Date

      if (daysLeft < 7) {
        // Extend by one more period length from current period end
        const periodLength =
          new Date(sub.currentPeriodEnd).getTime() -
          new Date(sub.currentPeriodStart).getTime()
        expiresAt = new Date(periodEnd.getTime() + periodLength)
      } else {
        expiresAt = periodEnd
      }

      await tx.insert(addonPurchases).values({
        userId,
        subscriptionId: sub.id,
        packageType,
        tokens: pkg.tokens,
        price: String(pkg.price),
        tokensRemaining: pkg.tokens,
        expiresAt,
      })

      const newAddon = sub.addonTokenBalance + pkg.tokens
      await tx
        .update(subscriptions)
        .set({ addonTokenBalance: newAddon })
        .where(eq(subscriptions.id, sub.id))

      await tx.insert(tokenTransactions).values({
        userId,
        projectId: null,
        serviceType: `addon_purchase_${packageType}`,
        amount: pkg.tokens,
        direction: "credit",
        source: "addon",
        balanceAfter: sub.planTokenBalance + newAddon,
      })
    })
  }

  // ── resetMonthlyTokens ─────────────────────────────────────────────────────

  async resetMonthlyTokens(subscriptionId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [sub] = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1)

      if (!sub) throw new Error(`Subscription ${subscriptionId} not found`)

      const monthlyAllowance =
        PLAN_MONTHLY_TOKENS[sub.plan] ?? sub.planTokenMonthly

      // Find expired addon purchases
      const now = new Date()
      const expired = await tx
        .select()
        .from(addonPurchases)
        .where(
          and(
            eq(addonPurchases.subscriptionId, subscriptionId),
            lt(addonPurchases.expiresAt, now),
          ),
        )

      const expiredTokens = expired.reduce((sum, p) => sum + p.tokensRemaining, 0)
      const newAddon = Math.max(0, sub.addonTokenBalance - expiredTokens)

      await tx
        .update(subscriptions)
        .set({
          planTokenBalance: monthlyAllowance,
          addonTokenBalance: newAddon,
        })
        .where(eq(subscriptions.id, subscriptionId))

      if (expired.length > 0) {
        await tx
          .delete(addonPurchases)
          .where(
            and(
              eq(addonPurchases.subscriptionId, subscriptionId),
              lt(addonPurchases.expiresAt, now),
            ),
          )
      }
    })
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private async requireActiveSubscription(userId: string, tx?: Parameters<Db['transaction']>[0] extends (tx: infer T) => unknown ? T : never) {
    const db = tx ?? this.db
    const [sub] = await (db as Db)
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
        ),
      )
      .limit(1)

    if (!sub) throw new Error(`No active subscription found for user ${userId}`)
    return sub
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Lazily initialised so the module can be imported in test environments
// that inject a mock db.

let _instance: TokenService | null = null

export function getTokenService(db?: Db): TokenService {
  if (db) return new TokenService(db)
  if (!_instance) {
    // Dynamically import to avoid loading the DB client at module parse time
    // (keeps unit tests fast — they pass their own mock db via the argument)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { db: realDb } = require("@/db/client") as { db: Db }
    _instance = new TokenService(realDb)
  }
  return _instance
}
