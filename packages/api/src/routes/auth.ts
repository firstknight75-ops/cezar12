import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { eq, and } from "drizzle-orm"
import { db } from "../db/client.js"
import { subscriptions, users } from "@cezar12/shared/db/schema"

const RegisterBody = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(8),
  country: z.string().min(2).max(100),
  phone: z.string().min(8).max(50),
}).strict()

const LoginBody = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
  remember: z.boolean().default(true),
}).strict()

const ChangePasswordBody = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
}).strict()

const ResetPasswordBody = z.object({
  token: z.string().optional(),
  newPassword: z.string().min(8),
}).strict()

function signAccessToken(user: { id: string; role: "user" | "admin" | "support" }, remember = false) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: remember ? "30d" : "1h",
  })
}

async function sessionPayload(userId: string, remember = true) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return null

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "active")))
    .limit(1)

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      countryCode: user.country ?? "",
      currency: "SAR",
      preferredLang: "ar",
      isVerified: user.isVerified,
      hasCompanyProfile: false,
    },
    subscription: sub
      ? {
          id: sub.id,
          plan: sub.plan,
          billingCycle: sub.cycle,
          status: sub.status,
          tokensPerCycle: sub.planTokenMonthly,
          tokensRemaining: sub.planTokenBalance + sub.addonTokenBalance,
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        }
      : {
          id: "",
          plan: "silver" as const,
          billingCycle: "monthly",
          status: "active",
          tokensPerCycle: 500,
          tokensRemaining: 500,
          currentPeriodEnd: new Date().toISOString(),
        },
    tokenBalance: {
      subscription_tokens: sub?.planTokenBalance ?? 500,
      addon_tokens: sub?.addonTokenBalance ?? 0,
      total_available: (sub?.planTokenBalance ?? 500) + (sub?.addonTokenBalance ?? 0),
      plan: sub?.plan ?? "silver",
      period_end: sub?.currentPeriodEnd.toISOString() ?? new Date().toISOString(),
    },
    accessToken: signAccessToken({ id: user.id, role: user.role }, remember),
    refreshToken: crypto.randomUUID(),
  }
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (req, reply) => {
    const payload = await sessionPayload(req.user!.id)
    if (!payload) return reply.status(404).send({ error: "User not found" })
    return reply.send({ data: { ...payload.user, phone: "", country: payload.user.countryCode } })
  })

  app.post("/register", { config: { public: true } } as never, async (req, reply) => {
    const body = RegisterBody.parse(req.body)
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1)
    if (existing) return reply.status(409).send({ error: "Email already registered" })

    const passwordHash = await bcrypt.hash(body.password, 12)
    const [user] = await db.insert(users).values({
      fullName: body.fullName,
      email: body.email,
      passwordHash,
      country: body.country,
      phone: body.phone,
      isVerified: true,
    }).returning()

    const now = new Date()
    await db.insert(subscriptions).values({
      userId: user.id,
      plan: "silver",
      cycle: "monthly",
      status: "active",
      planTokenBalance: 500,
      planTokenMonthly: 500,
      addonTokenBalance: 0,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    })

    return reply.status(201).send({ userId: user.id, message: "Account created" })
  })

  app.post("/login", { config: { public: true } } as never, async (req, reply) => {
    const body = LoginBody.parse(req.body)
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.status(401).send({ error: "Invalid credentials" })
    }
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))
    const payload = await sessionPayload(user.id, body.remember)
    return reply.send({ data: payload })
  })

  app.post("/logout", async (_req, reply) => reply.status(204).send())
  app.post("/forgot-password", { config: { public: true } } as never, async (_req, reply) => reply.status(204).send())
  app.post("/reset-password", { config: { public: true } } as never, async (req, reply) => {
    ResetPasswordBody.parse(req.body)
    return reply.status(204).send()
  })

  app.post("/change-password", async (req, reply) => {
    const body = ChangePasswordBody.parse(req.body)
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1)
    if (!user || !(await bcrypt.compare(body.currentPassword, user.passwordHash))) {
      return reply.status(401).send({ error: "Current password is incorrect" })
    }
    await db.update(users).set({ passwordHash: await bcrypt.hash(body.newPassword, 12) }).where(eq(users.id, user.id))
    return reply.status(204).send()
  })

  app.delete("/account", async (req, reply) => {
    await db.delete(users).where(eq(users.id, req.user!.id))
    return reply.status(204).send()
  })
}