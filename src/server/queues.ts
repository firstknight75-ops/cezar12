import { Queue } from "bullmq"
import type { ConnectionOptions } from "bullmq"

// ─── Types ────────────────────────────────────────────────────────────────────

export type QueueName =
  | "plan-generation"
  | "content-generation"
  | "kitchen-analysis"
  | "image-processing"

// ─── Redis connection ─────────────────────────────────────────────────────────

export function getConnection(): ConnectionOptions {
  return {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? undefined,
    maxRetriesPerRequest: null, // required by BullMQ
  }
}

// ─── Concurrency limits ───────────────────────────────────────────────────────

export const QUEUE_CONCURRENCY: Record<QueueName, number> = {
  "plan-generation": 3,
  "content-generation": 3,
  "kitchen-analysis": 2,
  "image-processing": 5,
}

// ─── Queue singletons ─────────────────────────────────────────────────────────

const _queues = new Map<QueueName, Queue>()

export function getQueue(name: QueueName): Queue {
  if (!_queues.has(name)) {
    _queues.set(
      name,
      new Queue(name, {
        connection: getConnection(),
        defaultJobOptions: {
          attempts: 4, // 1 original + 3 retries
          backoff: { type: "custom" },
          removeOnComplete: { age: 86_400 }, // keep 24 h
          removeOnFail: false,              // send to DLQ
        },
      }),
    )
  }
  return _queues.get(name)!
}

export async function closeQueues(): Promise<void> {
  await Promise.all([..._queues.values()].map((q) => q.close()))
  _queues.clear()
}

// ─── Global AI semaphore (max 10 simultaneous AI calls) ───────────────────────

export class Semaphore {
  private _count = 0
  private _waiting: Array<() => void> = []

  constructor(readonly max: number) {}

  get count(): number {
    return this._count
  }

  async acquire(): Promise<void> {
    if (this._count < this.max) {
      this._count++
      return
    }
    return new Promise<void>((resolve) =>
      this._waiting.push(() => {
        this._count++
        resolve()
      }),
    )
  }

  release(): void {
    this._count = Math.max(0, this._count - 1)
    const next = this._waiting.shift()
    if (next) next()
  }
}

export const aiSemaphore = new Semaphore(10)
