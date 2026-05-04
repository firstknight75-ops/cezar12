import Redis from "ioredis"

if (!process.env.REDIS_HOST) {
  throw new Error("REDIS_HOST is required")
}

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  lazyConnect: true,
})

redis.on("error", (err) => {
  console.error("[redis] connection error:", err.message)
})
