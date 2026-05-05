import type { FastifyPluginAsync, FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import { db } from "../db/client.js"
import { auditLog } from "@cezar12/shared/db/schema"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: "user" | "admin" | "support"; type?: string }
    user: { id: string; role: "user" | "admin" | "support" }
  }
}

declare module "fastify" {
  interface FastifyRequest {
    readOnly?: boolean
  }
}

export const authPlugin: FastifyPluginAsync = fp(async (app) => {
  app.decorateRequest("readOnly", false)

  app.addHook("preHandler", async (req, reply) => {
    // Routes marked public skip auth
    if ((req.routeOptions as unknown as { config?: { public?: boolean } }).config?.public) return

    try {
      await req.jwtVerify()
      req.readOnly = req.user.role === "support"
    } catch {
      return reply.status(401).send({ error: "Invalid or expired token" })
    }
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
