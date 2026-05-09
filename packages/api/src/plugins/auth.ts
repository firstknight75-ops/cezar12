import type { FastifyPluginAsync, FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import jwt from "jsonwebtoken"
import { db } from "../db/client.js"
import { auditLog } from "@cezar12/shared/db/schema"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: { id: string; role: "user" | "admin" | "support" }
  }
}

declare module "fastify" {
  interface FastifyRequest {
    readOnly?: boolean
  }
}

export const authPlugin: FastifyPluginAsync = fp(async (app) => {
  app.decorateRequest("user", null)
  app.decorateRequest("readOnly", false)

  const jwtSecret = process.env.JWT_SECRET ?? "cezar12-local-development-secret"

  app.addHook("preHandler", async (req, reply) => {
    // Routes marked public skip auth
    if ((req.routeOptions as unknown as { config?: { public?: boolean } }).config?.public) return

    const header = req.headers.authorization
    if (!header?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing authorization header" })
    }

    const token = header.slice(7)
    let payload: { sub: string; role: string }

    try {
      payload = jwt.verify(token, jwtSecret) as typeof payload
    } catch {
      return reply.status(401).send({ error: "Invalid or expired token" })
    }

    const role = payload.role as "user" | "admin" | "support"
    req.user = { id: payload.sub, role }
    req.readOnly = role === "support"
  })
})

// Admin-only guard — register on admin route prefix
export const adminGuard: FastifyPluginAsync = fp(async (app) => {
  app.addHook("preHandler", async (req: FastifyRequest, reply) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "support")) {
      return reply.status(403).send({ error: "Forbidden" })
    }

    // Fire-and-forget audit log
    db.insert(auditLog)
      .values({
        actorId: req.user.id,
        actorRole: req.user.role,
        action: `${req.method} ${req.url}`,
        targetType: "route",
        targetId: "00000000-0000-0000-0000-000000000000",
        ip: req.ip,
      })
      .catch((err) => req.log.warn({ err }, "audit log write failed"))
  })
})
