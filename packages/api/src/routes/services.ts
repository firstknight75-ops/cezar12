import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { db } from "../db/client.js"
import { redis } from "../db/redis.js"
import { TokenService } from "../lib/token-service.js"
import { injectDisclaimer } from "../lib/disclaimer.js"
import { aiJobs, projects, subscriptions } from "@cezar12/shared"
import { QUEUE_FOR_SERVICE } from "@cezar12/shared"
import type { ServiceType } from "@cezar12/shared"
import { Queue } from "bullmq"

const serviceQueues: Partial<Record<string, Queue>> = {}

function getQueue(name: string): Queue {
  if (!serviceQueues[name]) {
    serviceQueues[name] = new Queue(name, {
      connection: redis,
      defaultJobOptions: { removeOnComplete: 100, removeOnFail: false },
    })
  }
  return serviceQueues[name]!
}

const SERVICE_TYPE_VALUES = [
  "plan_90day", "weekly_content", "market_research", "buyer_persona",
  "visual_identity", "seo_plan", "ad_campaign", "performance_report",
  "lead_generation", "kitchen_cost_analysis", "recipe_costing",
  "promotion_optimizer", "initial_assessment",
] as const

const ApproveRejectBody = z.object({ jobId: z.string().uuid() }).strict()

export const servicesRoutes: FastifyPluginAsync = async (app) => {
  const tokenService = new TokenService(db)

  // POST /api/projects/:projectId/services/:serviceType — request AI service
  app.post("/projects/:projectId/services/:serviceType", async (req, reply) => {
    const { projectId, serviceType } = req.params as {
      projectId: string
      serviceType: string
    }
    const userId = req.user!.id

    if (!SERVICE_TYPE_VALUES.includes(serviceType as ServiceType)) {
      return reply.status(400).send({ error: "Unknown service type" })
    }

    // Verify project ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1)

    if (!project) return reply.status(404).send({ error: "Project not found" })
    if (project.blocking) return reply.status(409).send({ error: "Project is blocked" })

    // Get subscription for plan
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .limit(1)

    if (!sub) return reply.status(402).send({ error: "No active subscription" })

    // Deduct tokens
    try {
      await tokenService.deductTokens(userId, projectId, serviceType)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Token deduction failed"
      return reply.status(402).send({ error: msg })
    }

    // Insert ai_job record
    const [job] = await db
      .insert(aiJobs)
      .values({
        userId,
        projectId,
        serviceType,
        status: "queued",
        tokensDeducted: tokenService.getCost(serviceType, sub.plan as "silver" | "gold" | "platinum") ?? 0,
      })
      .returning()

    // Enqueue BullMQ job
    const queueName = QUEUE_FOR_SERVICE[serviceType as ServiceType] ?? "plan-generation"
    await getQueue(queueName).add(serviceType, {
      dbJobId: job.id,
      userId,
      projectId,
      serviceType,
      prompt: "", // Worker builds prompt from project data
      anonymizeValues: {},
    })

    return reply.status(202).send({
      data: { jobId: job.id, status: "queued", estimatedSeconds: 30 },
    })
  })

  // GET /api/jobs/:jobId
  app.get("/jobs/:jobId", async (req, reply) => {
    const { jobId } = req.params as { jobId: string }
    const userId = req.user!.id

    const [job] = await db
      .select()
      .from(aiJobs)
      .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
      .limit(1)

    if (!job) return reply.status(404).send({ error: "Job not found" })
    return reply.send({ data: job })
  })

  // POST /api/jobs/:jobId/approve
  app.post("/jobs/:jobId/approve", async (req, reply) => {
    const { jobId } = req.params as { jobId: string }
    const userId = req.user!.id

    const [job] = await db
      .select()
      .from(aiJobs)
      .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
      .limit(1)

    if (!job) return reply.status(404).send({ error: "Job not found" })
    if (job.status !== "completed") return reply.status(409).send({ error: "Job not in completed state" })

    await db
      .update(aiJobs)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(aiJobs.id, jobId))

    return reply.send({ data: { jobId, status: "approved" } })
  })

  // POST /api/jobs/:jobId/reject
  app.post("/jobs/:jobId/reject", async (req, reply) => {
    const { jobId } = req.params as { jobId: string }
    const userId = req.user!.id

    const [job] = await db
      .select()
      .from(aiJobs)
      .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
      .limit(1)

    if (!job) return reply.status(404).send({ error: "Job not found" })
    if (job.status !== "completed") return reply.status(409).send({ error: "Job not in completed state" })

    await db
      .update(aiJobs)
      .set({ status: "rejected" })
      .where(eq(aiJobs.id, jobId))

    // Refund 50 tokens on rejection
    await tokenService.refundTokens(userId, jobId, 50)

    return reply.send({ data: { jobId, status: "rejected", refunded: 50 } })
  })

  // POST /api/jobs/:jobId/defer
  app.post("/jobs/:jobId/defer", async (req, reply) => {
    const { jobId } = req.params as { jobId: string }
    const userId = req.user!.id

    const [job] = await db
      .select()
      .from(aiJobs)
      .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
      .limit(1)

    if (!job) return reply.status(404).send({ error: "Job not found" })
    if (job.status !== "completed") return reply.status(409).send({ error: "Job not in completed state" })

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db
      .update(aiJobs)
      .set({ status: "deferred", expiresAt })
      .where(eq(aiJobs.id, jobId))

    return reply.send({ data: { jobId, status: "deferred", expiresAt } })
  })
}
