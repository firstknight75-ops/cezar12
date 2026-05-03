import { eq, and, sql } from "drizzle-orm"
import { type Db } from "@/db/client"
import { aiJobs, projects, subscriptions, ubo } from "@/db/schema"
import { getTokenService } from "@/lib/token-service"
import { promptBuilder } from "@/lib/prompt-builder"
import { getQueue, type QueueName } from "@/server/queues"
import type { Domain } from "@/lib/prompt-builder"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceType =
  | "plan_90day"
  | "weekly_content"
  | "market_research"
  | "buyer_persona"
  | "visual_identity"
  | "seo_plan"
  | "ad_campaign"
  | "performance_report"
  | "lead_generation"
  | "kitchen_cost_analysis"
  | "recipe_costing"
  | "promotion_optimizer"
  | "data_edit_light"
  | "data_edit_heavy"
  | "pdf_export"
  | "initial_assessment"

export type JobStatus = {
  id: string
  status:
    | "queued"
    | "processing"
    | "completed"
    | "failed"
    | "approved"
    | "rejected"
    | "deferred"
  resultContent: string | null
  tokensDeducted: number
  tokensRefunded: number
  startedAt: Date | null
  completedAt: Date | null
  approvedAt: Date | null
  expiresAt: Date | null
}

export type WorkerJobData = {
  dbJobId: string
  userId: string
  projectId: string
  serviceType: ServiceType
  prompt: string
  anonymizeValues: {
    company_name?: string
    city?: string
    phone?: string
    website_url?: string
  }
}

// ─── Routing tables ───────────────────────────────────────────────────────────

const QUEUE_FOR_SERVICE: Record<ServiceType, QueueName> = {
  plan_90day: "plan-generation",
  seo_plan: "plan-generation",
  ad_campaign: "plan-generation",
  performance_report: "plan-generation",
  lead_generation: "plan-generation",
  initial_assessment: "plan-generation",
  weekly_content: "content-generation",
  market_research: "content-generation",
  buyer_persona: "content-generation",
  visual_identity: "content-generation",
  kitchen_cost_analysis: "kitchen-analysis",
  recipe_costing: "kitchen-analysis",
  promotion_optimizer: "kitchen-analysis",
  data_edit_light: "image-processing",
  data_edit_heavy: "image-processing",
  pdf_export: "image-processing",
}

const ESTIMATED_SECONDS: Record<QueueName, number> = {
  "plan-generation": 30,
  "content-generation": 25,
  "kitchen-analysis": 15,
  "image-processing": 10,
}

// ─── ServiceOrchestrator ──────────────────────────────────────────────────────

export class ServiceOrchestrator {
  constructor(private readonly db: Db) {}

  async requestService(params: {
    userId: string
    projectId: string
    serviceType: ServiceType
    extraData?: Record<string, unknown>
  }): Promise<{ jobId: string; estimatedSeconds: number }> {
    const { userId, projectId, serviceType, extraData } = params

    // 1. Load project + UBO
    const [project] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1)

    if (!project) {
      throw new Error(`Project ${projectId} not found for user ${userId}`)
    }
    if (project.blocking) {
      throw new Error(
        `Project ${projectId} is currently locked and cannot accept new jobs.`,
      )
    }

    const [uboRow] = await this.db
      .select()
      .from(ubo)
      .where(eq(ubo.projectId, projectId))
      .limit(1)

    // 2. Get plan type (required for token deduction)
    const [sub] = await this.db
      .select()
      .from(subscriptions)
      .where(
        and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")),
      )
      .limit(1)

    if (!sub) {
      throw new Error(`No active subscription found for user ${userId}`)
    }

    // 3. Deduct tokens (throws InsufficientTokensError / ServiceNotAvailableError)
    const tokenSvc = getTokenService(this.db)
    const { deducted } = await tokenSvc.deductTokens(userId, serviceType, projectId)

    // 4. Insert ai_jobs record
    const [inserted] = await this.db
      .insert(aiJobs)
      .values({
        userId,
        projectId,
        serviceType,
        status: "queued",
        tokensDeducted: deducted,
      })
      .returning({ id: aiJobs.id })

    const jobId = inserted.id

    // 5. Build prompt
    const domain = (project.domain.toUpperCase()) as Domain
    const uboSnapshot = uboRow
      ? {
          riskLevel: uboRow.riskLevel as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
          financialScore: uboRow.financialScore,
          metrics: uboRow.metrics as Record<string, unknown> | null,
          recommendations: uboRow.recommendations as Record<string, unknown> | null,
        }
      : { riskLevel: "HIGH" as const, financialScore: 50, metrics: null, recommendations: null }

    const prompt = promptBuilder.build({ domain, ubo: uboSnapshot, serviceType, extraData })

    // 6. Extract anonymizable values from domainData
    const domainData = (project.domainData ?? {}) as Record<string, unknown>
    const anonymizeValues = {
      company_name: domainData.company_name as string | undefined,
      city: domainData.city as string | undefined,
      phone: domainData.phone as string | undefined,
      website_url: domainData.website_url as string | undefined,
    }

    // 7. Enqueue
    const queueName = QUEUE_FOR_SERVICE[serviceType]
    const queue = getQueue(queueName)
    const workerData: WorkerJobData = {
      dbJobId: jobId,
      userId,
      projectId,
      serviceType,
      prompt,
      anonymizeValues,
    }
    await queue.add(serviceType, workerData, { jobId })

    return { jobId, estimatedSeconds: ESTIMATED_SECONDS[queueName] }
  }

  // ── getJobStatus ─────────────────────────────────────────────────────────

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const [job] = await this.db
      .select()
      .from(aiJobs)
      .where(eq(aiJobs.id, jobId))
      .limit(1)

    if (!job) throw new Error(`AI job ${jobId} not found`)

    return {
      id: job.id,
      status: job.status as JobStatus["status"],
      resultContent: job.resultContent,
      tokensDeducted: job.tokensDeducted,
      tokensRefunded: job.tokensRefunded,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      approvedAt: job.approvedAt,
      expiresAt: job.expiresAt,
    }
  }

  // ── approveResult ────────────────────────────────────────────────────────

  async approveResult(jobId: string, userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [job] = await tx
        .select()
        .from(aiJobs)
        .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
        .limit(1)

      if (!job) throw new Error(`AI job ${jobId} not found for user ${userId}`)
      if (job.status !== "completed") {
        throw new Error(`Job ${jobId} is not in 'completed' state (got '${job.status}')`)
      }

      await tx
        .update(aiJobs)
        .set({ status: "approved", approvedAt: new Date() })
        .where(eq(aiJobs.id, jobId))

      // Merge AI result into UBO
      let parsed: Record<string, unknown> = {}
      if (job.resultContent) {
        try {
          parsed = JSON.parse(job.resultContent)
        } catch {
          parsed = { summary: job.resultContent }
        }
      }

      const [existing] = await tx
        .select()
        .from(ubo)
        .where(eq(ubo.projectId, job.projectId))
        .limit(1)

      if (existing) {
        const mergedMetrics = {
          ...(existing.metrics as Record<string, unknown> ?? {}),
          ...(parsed.metrics as Record<string, unknown> ?? {}),
        }
        const mergedRecs = {
          ...(existing.recommendations as Record<string, unknown> ?? {}),
          ...(parsed.recommendations as Record<string, unknown> ?? {}),
        }
        await tx
          .update(ubo)
          .set({
            metrics: mergedMetrics,
            recommendations: mergedRecs,
            version: existing.version + 1,
            updatedAt: new Date(),
          })
          .where(eq(ubo.projectId, job.projectId))
      }
    })
  }

  // ── rejectResult ─────────────────────────────────────────────────────────

  async rejectResult(jobId: string, userId: string): Promise<void> {
    const [job] = await this.db
      .select()
      .from(aiJobs)
      .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
      .limit(1)

    if (!job) throw new Error(`AI job ${jobId} not found for user ${userId}`)

    await this.db
      .update(aiJobs)
      .set({ status: "rejected" })
      .where(eq(aiJobs.id, jobId))

    const tokenSvc = getTokenService(this.db)
    await tokenSvc.refundTokens(userId, jobId, 50)
  }

  // ── deferResult ──────────────────────────────────────────────────────────

  async deferResult(jobId: string, userId: string): Promise<void> {
    const [job] = await this.db
      .select()
      .from(aiJobs)
      .where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId)))
      .limit(1)

    if (!job) throw new Error(`AI job ${jobId} not found for user ${userId}`)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await this.db
      .update(aiJobs)
      .set({ status: "deferred", expiresAt })
      .where(eq(aiJobs.id, jobId))
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _instance: ServiceOrchestrator | null = null

export function getServiceOrchestrator(db?: Db): ServiceOrchestrator {
  if (db) return new ServiceOrchestrator(db)
  if (!_instance) {
    const { db: realDb } = require("@/db/client") as { db: Db }
    _instance = new ServiceOrchestrator(realDb)
  }
  return _instance
}
