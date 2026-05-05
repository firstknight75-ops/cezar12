import { Worker } from "bullmq"
import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { eq } from "drizzle-orm"
import { db } from "../db/client.js"
import { redis } from "../db/redis.js"
import { aiSemaphore, QUEUE_CONCURRENCY } from "../queues.js"
import { aiJobs } from "@cezar12/shared/db/schema"
import type { QueueName, WorkerJobData } from "@cezar12/shared"

// ─── Arabic disclaimer ────────────────────────────────────────────────────────

const DISCLAIMER_AR =
  "\n\n---\nتنبيه: هذه النتائج مقدمة لأغراض إرشادية فقط ولا تُعدّ استشارة مالية أو قانونية أو ضريبية. يُرجى الاستعانة بمستشار مختص قبل اتخاذ أي قرارات."

function injectDisclaimer(content: string): string {
  if (content.includes(DISCLAIMER_AR.trim())) return content
  return content + DISCLAIMER_AR
}

// ─── Prompt anonymisation ─────────────────────────────────────────────────────

function anonymizePrompt(
  prompt: string,
  values: WorkerJobData["anonymizeValues"],
): string {
  let out = prompt
  if (values.company_name?.trim()) {
    out = out.replaceAll(values.company_name, "the business")
  }
  if (values.phone?.trim()) {
    out = out.replaceAll(values.phone, "[REDACTED]")
  }
  if (values.website_url?.trim()) {
    out = out.replaceAll(values.website_url, "[REDACTED]")
  }
  if (values.city?.trim()) {
    out = out.replaceAll(values.city, "[REDACTED]")
  }
  return out
}

// ─── Custom backoff: 1s → 4s → 16s ──────────────────────────────────────────

const BACKOFF_MS = [1_000, 4_000, 16_000]

// ─── AI call ──────────────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  const provider = (await redis.get("feature:ai_provider")) ?? process.env.AI_PROVIDER_DEFAULT ?? "anthropic"

  if (provider === "openai") {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    })
    return response.choices[0]?.message?.content ?? ""
  }

  // Default: Anthropic
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  })
  const block = message.content[0]
  return block.type === "text" ? block.text : ""
}

// ─── Worker factory ───────────────────────────────────────────────────────────

function createWorker(queueName: QueueName) {
  return new Worker<WorkerJobData>(
    queueName,
    async (job) => {
      const { dbJobId, prompt, anonymizeValues } = job.data

      // Mark as processing
      await db
        .update(aiJobs)
        .set({ status: "processing", startedAt: new Date() })
        .where(eq(aiJobs.id, dbJobId))

      const safePrompt = anonymizePrompt(prompt, anonymizeValues)

      // Global AI concurrency cap
      await aiSemaphore.acquire()
      let resultContent: string

      try {
        resultContent = await callAI(safePrompt)
      } finally {
        aiSemaphore.release()
      }

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      await db
        .update(aiJobs)
        .set({
          status: "completed",
          resultContent: injectDisclaimer(resultContent),
          completedAt: new Date(),
          expiresAt,
        })
        .where(eq(aiJobs.id, dbJobId))
    },
    {
      connection: redis,
      concurrency: QUEUE_CONCURRENCY[queueName],
      settings: {
        backoffStrategy: (attemptsMade: number) =>
          BACKOFF_MS[Math.min(attemptsMade, BACKOFF_MS.length - 1)] ?? 16_000,
      },
    },
  )
}

// ─── Failure handler ──────────────────────────────────────────────────────────

function attachFailureHandler(worker: Worker<WorkerJobData>) {
  worker.on("failed", async (job, err) => {
    if (!job) return
    const { dbJobId } = job.data
    const isExhausted = (job.attemptsMade ?? 0) >= (job.opts.attempts ?? 3)
    if (isExhausted) {
      await db
        .update(aiJobs)
        .set({ status: "failed" })
        .where(eq(aiJobs.id, dbJobId))
        .catch(() => undefined)
    }
    console.error(`[worker:${worker.name}] job ${job.id} failed (attempt ${job.attemptsMade}):`, err.message)
  })
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export function createAllWorkers() {
  const queueNames: QueueName[] = [
    "plan-generation",
    "content-generation",
    "kitchen-analysis",
    "image-processing",
  ]

  return queueNames.map((name) => {
    const worker = createWorker(name)
    attachFailureHandler(worker)
    console.log(`[worker] ${name} started (concurrency=${QUEUE_CONCURRENCY[name]})`)
    return worker
  })
}
