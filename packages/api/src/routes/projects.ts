import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { eq, and, isNull } from "drizzle-orm"
import { db } from "../db/client.js"
import { projects, ubo } from "@cezar12/shared/db/schema"

const CreateProjectBody = z.object({
  name: z.string().min(1).max(255),
  domain: z.enum(["ecommerce", "services", "restaurant", "real_estate"]),
  domainData: z.record(z.unknown()).optional(),
})

const UpdateProjectBody = z.object({
  name: z.string().min(1).max(255).optional(),
  domainData: z.record(z.unknown()).optional(),
}).strict()

export const projectsRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/projects
  app.get("/", async (req, reply) => {
    const userId = req.user!.id
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        domain: projects.domain,
        status: projects.status,
        createdAt: projects.createdAt,
        riskLevel: ubo.riskLevel,
        financialScore: ubo.financialScore,
      })
      .from(projects)
      .leftJoin(ubo, eq(ubo.projectId, projects.id))
      .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))

    return reply.send({ data: rows })
  })

  // POST /api/projects
  app.post("/", async (req, reply) => {
    const userId = req.user!.id
    const body = CreateProjectBody.parse(req.body)

    const [project] = await db
      .insert(projects)
      .values({ userId, ...body })
      .returning()

    return reply.status(201).send({ data: project })
  })

  // GET /api/projects/:id
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.user!.id

    const [row] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)))
      .limit(1)

    if (!row) return reply.status(404).send({ error: "Project not found" })
    return reply.send({ data: row })
  })

  // PATCH /api/projects/:id
  app.patch("/:id", async (req, reply) => {
    if (req.readOnly) return reply.status(403).send({ error: "Read-only mode" })
    const { id } = req.params as { id: string }
    const userId = req.user!.id
    const body = UpdateProjectBody.parse(req.body)

    const [updated] = await db
      .update(projects)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning()

    if (!updated) return reply.status(404).send({ error: "Project not found" })
    return reply.send({ data: updated })
  })

  // DELETE /api/projects/:id (soft delete)
  app.delete("/:id", async (req, reply) => {
    if (req.readOnly) return reply.status(403).send({ error: "Read-only mode" })
    const { id } = req.params as { id: string }
    const userId = req.user!.id

    await db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))

    return reply.status(204).send()
  })
}
