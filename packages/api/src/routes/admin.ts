import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { eq, desc, sql, lt } from "drizzle-orm"
import { db } from "../db/client.js"
import { users, subscriptions, auditLog } from "@cezar12/shared/db/schema"
import { adminGuard } from "../plugins/auth.js"

export const adminRoutes: FastifyPluginAsync = async (app) => {
  // Apply admin guard to all routes in this plugin
  await app.register(adminGuard)

  // GET /api/admin/users
  app.get("/users", async (_req, reply) => {
    const rows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100)

    return reply.send({ data: rows })
  })

  // GET /api/admin/users/:id
  app.get("/users/:id", async (req, reply) => {
    const { id } = req.params as { id: string }
    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) return reply.status(404).send({ error: "User not found" })
    return reply.send({ data: user })
  })

  // PATCH /api/admin/users/:id — update role or verification status
  app.patch("/users/:id", async (req, reply) => {
    if (req.readOnly) return reply.status(403).send({ error: "Read-only mode" })

    const { id } = req.params as { id: string }
    const body = z.object({
      role: z.enum(["user", "admin", "support"]).optional(),
      isVerified: z.boolean().optional(),
    }).strict().parse(req.body)

    const [updated] = await db
      .update(users)
      .set(body)
      .where(eq(users.id, id))
      .returning({ id: users.id, role: users.role, isVerified: users.isVerified })

    if (!updated) return reply.status(404).send({ error: "User not found" })
    return reply.send({ data: updated })
  })

  // GET /api/admin/audit-log
  app.get("/audit-log", async (_req, reply) => {
    const rows = await db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(200)

    return reply.send({ data: rows })
  })

  // DELETE /api/admin/audit-log/cleanup — manual trigger for 180-day cleanup
  app.delete("/audit-log/cleanup", async (_req, reply) => {
    if (_req.readOnly) return reply.status(403).send({ error: "Read-only mode" })

    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    const result = await db
      .delete(auditLog)
      .where(lt(auditLog.createdAt, cutoff))
      .returning({ id: auditLog.id })

    return reply.send({ data: { deleted: result.length } })
  })
}
