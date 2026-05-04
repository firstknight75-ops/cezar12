import { Queue, QueueEvents } from "bullmq"
import { redis } from "./db/redis.js"
import type { QueueName, WorkerJobData } from "@cezar12/shared"

export const QUEUE_CONCURRENCY: Record<QueueName, number> = {
  "plan-generation": 3,
  "content-generation": 3,
  "kitchen-analysis": 2,
  "image-processing": 5,
}

const QUEUE_NAMES: QueueName[] = [
  "plan-generation",
  "content-generation",
  "kitchen-analysis",
  "image-processing",
]

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "custom" as const,
  },
  removeOnComplete: 100,
  removeOnFail: false,
}

export const queues: Record<QueueName, Queue<WorkerJobData>> = Object.fromEntries(
  QUEUE_NAMES.map((name) => [
    name,
    new Queue<WorkerJobData>(name, {
      connection: redis,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
  ]),
) as Record<QueueName, Queue<WorkerJobData>>

// ─── Global AI semaphore — caps total concurrent AI calls across all queues ───

export class Semaphore {
  private count = 0
  private waiters: Array<() => void> = []

  constructor(readonly max: number) {}

  async acquire(): Promise<void> {
    if (this.count < this.max) {
      this.count++
      return
    }
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve)
    })
  }

  release(): void {
    const next = this.waiters.shift()
    if (next) {
      next()
    } else {
      this.count--
    }
  }
}

export const aiSemaphore = new Semaphore(10)
