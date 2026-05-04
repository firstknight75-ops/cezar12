import { eq, and, sql, desc } from "drizzle-orm"
import type { Db } from "../db/client.js"
import {
  subscriptions,
  addonPurchases,
  tokenTransactions,
} from "@cezar12/shared"
import { SERVICE_COSTS } from "@cezar12/shared"
import type { PlanName } from "@cezar12/shared"

export class TokenService {
  constructor(private readonly db: Db) {}

  async getBalance(userId: string): Promise<{
    planUsed: number
    planTotal: number
    addonBalance: number
    totalRemaining: number
  }> {
    const [sub] = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .limit(1)

    if (!sub) throw new Error("No active subscription")

    const planUsed = sub.planTokenMonthly - sub.planTokenBalance
    const totalRemaining = sub.planTokenBalance + sub.addonTokenBalance

    return {
      planUsed: Math.max(0, planUsed),
      planTotal: sub.planTokenMonthly,
      addonBalance: sub.addonTokenBalance,
      totalRemaining,
    }
  }

  getCost(serviceType: string, plan: PlanName): number | null {
    return SERVICE_COSTS[serviceType]?.[plan] ?? null
  }

  async deductTokens(
    userId: string,
    projectId: string,
    serviceType: string,
  ): Promise<{ deducted: number; jobId?: string }> {
    const [sub] = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .limit(1)

    if (!sub) throw new Error("No active subscription")

    const cost = this.getCost(serviceType, sub.plan as PlanName)
    if (cost === null) throw new Error(`Service '${serviceType}' not available on ${sub.plan} plan`)

    const totalRemaining = sub.planTokenBalance + sub.addonTokenBalance
    if (totalRemaining < cost) throw new Error("Insufficient token balance")

    // Deduct from plan first, overflow to addon
    let planDebit = 0
    let addonDebit = 0

    if (sub.planTokenBalance >= cost) {
      planDebit = cost
    } else {
      planDebit = sub.planTokenBalance
      addonDebit = cost - planDebit
    }

    const balanceAfter = totalRemaining - cost

    await this.db.transaction(async (tx) => {
      await tx
        .update(subscriptions)
        .set({
          planTokenBalance: sql`${subscriptions.planTokenBalance} - ${planDebit}`,
          addonTokenBalance: sql`${subscriptions.addonTokenBalance} - ${addonDebit}`,
        })
        .where(eq(subscriptions.id, sub.id))

      await tx.insert(tokenTransactions).values({
        userId,
        projectId,
        serviceType,
        amount: cost,
        direction: "debit",
        source: planDebit > 0 ? "plan" : "addon",
        balanceAfter,
      })
    })

    return { deducted: cost }
  }

  async refundTokens(userId: string, jobId: string, amount: number): Promise<void> {
    const [sub] = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .limit(1)

    if (!sub) return

    const balanceAfter = sub.planTokenBalance + sub.addonTokenBalance + amount

    await this.db.transaction(async (tx) => {
      await tx
        .update(subscriptions)
        .set({ addonTokenBalance: sql`${subscriptions.addonTokenBalance} + ${amount}` })
        .where(eq(subscriptions.id, sub.id))

      await tx.insert(tokenTransactions).values({
        userId,
        projectId: null,
        serviceType: "refund",
        amount,
        direction: "credit",
        source: "refund",
        balanceAfter,
      })
    })
  }
}
