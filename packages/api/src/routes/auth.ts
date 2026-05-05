import type { FastifyInstance } from "fastify"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { db } from "../db/client.js"
import { users, subscriptions } from "@cezar12/shared/db/schema"

const SALT_ROUNDS = 10

interface RegisterBody {
  fullName: string
  email: string
  password: string
  country: string
  phone: string
}

interface LoginBody {
  email: string
  password: string
  remember?: boolean
}

interface RefreshBody {
  refresh_token: string
}

function signTokens(app: FastifyInstance, userId: string, role: "user" | "admin" | "support") {
  const accessToken = app.jwt.sign(
    { sub: userId, role },
    { expiresIn: "1h" }
  )
  const refreshToken = app.jwt.sign(
    { sub: userId, role, type: "refresh" },
    { expiresIn: "30d" }
  )
  return { accessToken, refreshToken }
}

function buildTokenBalance(sub: typeof subscriptions.$inferSelect | null) {
  if (!sub) return { plan: 0, addon: 0, total: 0 }
  return {
    plan: sub.planTokenBalance,
    addon: sub.addonTokenBalance,
    total: sub.planTokenBalance + sub.addonTokenBalance,
  }
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post<{ Body: RegisterBody }>(
    "/register",
    { config: { public: true } } as object,
    async (req, reply) => {
      const { fullName, email, password, country, phone } = req.body

      if (!fullName?.trim() || !email?.trim() || !password || !country) {
        return reply.status(400).send({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Missing required fields" },
        })
      }

      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1)
      if (existing.length > 0) {
        return reply.status(409).send({
          success: false,
          error: { code: "EMAIL_TAKEN", message: "Email already registered" },
        })
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
      const [user] = await db
        .insert(users)
        .values({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          passwordHash,
          country,
          phone: phone?.trim() ?? null,
          isVerified: false,
          role: "user",
        })
        .returning()

      return reply.status(201).send({
        success: true,
        data: { message: "Account created. Please verify your email.", userId: user.id },
        meta: { request_id: req.id, timestamp: new Date().toISOString() },
      })
    }
  )

  // POST /auth/login
  app.post<{ Body: LoginBody }>(
    "/login",
    { config: { public: true } } as object,
    async (req, reply) => {
      const { email, password } = req.body

      if (!email?.trim() || !password) {
        return reply.status(400).send({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Email and password required" },
        })
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1)

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return reply.status(401).send({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        })
      }

      if (!user.isVerified) {
        return reply.status(403).send({
          success: false,
          error: { code: "EMAIL_NOT_VERIFIED", message: "Please verify your email address" },
        })
      }

      // Update last login
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))

      // Fetch subscription (may not exist for new users)
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .limit(1)

      const { accessToken, refreshToken } = signTokens(app, user.id, user.role)

      return reply.status(200).send({
        success: true,
        data: {
          accessToken,
          refreshToken,
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
            : null,
          tokenBalance: buildTokenBalance(sub ?? null),
        },
        meta: { request_id: req.id, timestamp: new Date().toISOString() },
      })
    }
  )

  // POST /auth/refresh
  app.post<{ Body: RefreshBody }>(
    "/refresh",
    { config: { public: true } } as object,
    async (req, reply) => {
      const { refresh_token } = req.body
      if (!refresh_token) {
        return reply.status(400).send({
          success: false,
          error: { code: "MISSING_TOKEN", message: "refresh_token is required" },
        })
      }

      let payload: { sub: string; role: "user" | "admin" | "support"; type?: string }
      try {
        payload = app.jwt.verify(refresh_token) as typeof payload
      } catch {
        return reply.status(401).send({
          success: false,
          error: { code: "INVALID_TOKEN", message: "Invalid or expired refresh token" },
        })
      }

      if (payload.type !== "refresh") {
        return reply.status(401).send({
          success: false,
          error: { code: "INVALID_TOKEN", message: "Token is not a refresh token" },
        })
      }

      const userId = payload.sub
      const { accessToken, refreshToken } = signTokens(app, userId, payload.role)

      return reply.status(200).send({
        success: true,
        data: { access_token: accessToken, refresh_token: refreshToken },
        meta: { request_id: req.id, timestamp: new Date().toISOString() },
      })
    }
  )

  // POST /auth/resend-verification
  app.post<{ Body: { email: string } }>(
    "/resend-verification",
    { config: { public: true } } as object,
    async (req, reply) => {
      // Always respond 200 to prevent email enumeration
      return reply.status(200).send({
        success: true,
        data: { message: "If that email exists, a verification link has been sent." },
        meta: { request_id: req.id, timestamp: new Date().toISOString() },
      })
    }
  )
}
