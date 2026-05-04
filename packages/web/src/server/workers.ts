import { Worker } from "bullmq"
import { eq } from "drizzle-orm"
import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { Redis } from "ioredis"
import { type Db } from "@/db/client"
import { aiJobs } from "@/db/schema"
import { anonymizePrompt } from "@/lib/prompt-builder"
import type { WorkerJobData } from "@/lib/service-orchestrator"
import {
  aiSemaphore,
  getConnection,
  QUEUE_CONCURRENCY,
  type QueueName,
} from "@/server/queues"

// ─── Retry delays: 1 s, 4 s, 16 s ───────────────────────────────────────────

const RETRY_DELAYS_MS = [1_000, 4_000, 16_000]

function backoffStrategy(attemptsMade: number): number {
  return RETRY_DELAYS_MS[Math.min(attemptsMade - 1, RETRY_DELAYS_MS.length - 1)]
}

// ─── AI caller ────────────────────────────────────────────────────────────────

async function callAI(
  provider: "openai" | "anthropic",
  prompt: string,
): Promise<string> {
  if (provider === "anthropic") {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    })
    const block = msg.content[0]
    return block.type === "text" ? block.text : ""
  }

  // Default: OpenAI
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  })
  return res.choices[0]?.message?.content ?? ""
}

// ─── Worker factory ───────────────────────────────────────────────────────────

function createWorker(queueName: QueueName, db: Db, redis: Redis): Worker {
  return new Worker<WorkerJobData>(
    queueName,
    async (job) => {
      const data = job.data
      const { dbJobId, prompt, anonymizeValues } = data

      // Mark as processing
      await db
        .update(aiJobs)
        .set({ status: "processing", startedAt: new Date() })
        .where(eq(aiJobs.id, dbJobId))

      // Read provider feature flag from Redis
      const flagValue = await redis.get("feature:ai_provider")
      const provider: "openai" | "anthropic" =
        flagValue === "anthropic" ? "anthropic" : "openai"

      // Anonymize prompt before sending to any AI provider
      const cleanPrompt = anonymizePrompt(prompt, anonymizeValues)

      // Acquire global AI semaphore
      await aiSemaphore.acquire()
      let result: string
      try {
        result = await callAI(provider, cleanPrompt)
      } finally {
        aiSemaphore.release()
      }

      // Save result
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      await db
        .update(aiJobs)
        .set({
          status: "completed",
          resultContent: result,
          completedAt: new Date(),
          expiresAt,
        })
        .where(eq(aiJobs.id, dbJobId))
    },
    {
      connection: getConnection(),
      concurrency: QUEUE_CONCURRENCY[queueName],
      settings: {
        backoffStrategy,
      },
    },
  )
}

// ─── Worker error handlers ────────────────────────────────────────────────────

function attachErrorHandlers(worker: Worker, db: Db): void {
  worker.on("failed", async (job, err) => {
    if (!job) return
    const data = job.data as WorkerJobData
    const isExhausted = (job.attemptsMade ?? 0) >= (job.opts?.attempts ?? 4)

    if (isExhausted) {
      // All retries exhausted — mark as failed (job stays in DLQ via removeOnFail:false)
      await db
        .update(aiJobs)
        .set({ status: "failed" })
        .where(eq(aiJobs.id, data.dbJobId))
        .catch(() => undefined)
    }
  })
}

// ─── Start all workers ────────────────────────────────────────────────────────

const QUEUE_NAMES: QueueName[] = [
  "plan-generation",
  "content-generation",
  "kitchen-analysis",
  "image-processing",
]

export function startWorkers(db: Db): { workers: Worker[]; redis: Redis } {
  const { host, port, password, maxRetriesPerRequest } = getConnection() as { host: string; port: number; password?: string; maxRetriesPerRequest: null }
  const redis = new Redis({ host, port, password, maxRetriesPerRequest })

  const workers = QUEUE_NAMES.map((name) => {
    const w = createWorker(name, db, redis)
    attachErrorHandlers(w, db)
    return w
  })

  return { workers, redis }
}
