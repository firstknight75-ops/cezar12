import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { eq, and, sql } from "drizzle-orm"
import { db } from "../db/client.js"
import { TokenService } from "../lib/token-service.js"
import { subscriptions, addonPurchases } from "@cezar12/shared"

const PurchaseBody = z.object({
  packageType: z.enum(["starter", "growth", "scale"]),
}).strict()

const ADDON_PACKAGES = {
  starter: { tokens: 100, price: 49 },
  growth:  { tokens: 300, price: 129 },
  scale:   { tokens: 700, price: 249 },
}

export const tokensRoutes: FastifyPluginAsync = async (app) => {
  const tokenService = new TokenService(db)

  // GET /api/tokens/balance
  app.get("/balance", async (req, reply) => {
    const balance = await tokenService.getBalance(req.user!.id)
    return reply.send({ data: balance })
  })

  // POST /api/tokens/purchase — mock payment, adds tokens immediately
  app.post("/purchase", async (req, reply) => {
    const { packageType } = PurchaseBody.parse(req.body)
    const userId = req.user!.id
    const pkg = ADDON_PACKAGES[packageType]

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .limit(1)

    if (!sub) return reply.status(402).send({ error: "No active subscription" })

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    await db.transaction(async (tx) => {
      await tx.insert(addonPurchases).values({
        userId,
        subscriptionId: sub.id,
        packageType,
        tokens: pkg.tokens,
        price: pkg.price.toString(),
        tokensRemaining: pkg.tokens,
        expiresAt,
      })

      await tx
        .update(subscriptions)
        .set({ addonTokenBalance: sql`${subscriptions.addonTokenBalance} + ${pkg.tokens}` })
        .where(eq(subscriptions.id, sub.id))
    })

    return reply.status(201).send({
      data: { packageType, tokensAdded: pkg.tokens, expiresAt },
    })
  })
}
