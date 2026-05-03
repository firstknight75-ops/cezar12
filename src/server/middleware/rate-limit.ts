import type { Redis } from "ioredis"
import type { Request, Response, NextFunction } from "express"

// ─── Types ────────────────────────────────────────────────────────────────────

export type RateLimitConfig = {
  redis: Redis
  /** Key prefix, e.g. "rl:ip:general" */
  keyPrefix: string
  /** Maximum allowed requests in the window. */
  max: number
  /** Sliding window duration in milliseconds. */
  windowMs: number
  /**
   * Returns the identifier to rate-limit on (IP, userId, etc.).
   * Defaults to req.ip.
   */
  identifier?: (req: Request) => string
}

// ─── Core sliding-window counter ─────────────────────────────────────────────
// Uses a Redis sorted-set where each member encodes the timestamp of the
// request. Expired members (older than windowMs) are purged on every call.

export async function slidingWindowCount(
  redis: Redis,
  key: string,
  windowMs: number,
): Promise<number> {
  const now = Date.now()
  const windowStart = now - windowMs
  // Unique member prevents duplicate scores from colliding
  const member = `${now}:${Math.random().toString(36).slice(2)}`

  const pipe = redis.pipeline()
  pipe.zremrangebyscore(key, 0, windowStart)
  pipe.zadd(key, now, member)
  pipe.zcard(key)
  pipe.pexpire(key, windowMs)

  const results = await pipe.exec()
  // result[2] is ZCARD → [null, count]
  return (results?.[2]?.[1] as number) ?? 0
}

// ─── Middleware factory ───────────────────────────────────────────────────────

export function rateLimiter(config: RateLimitConfig) {
  const { redis, keyPrefix, max, windowMs, identifier } = config

  return async function rateLimit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const id = identifier ? identifier(req) : (req.ip ?? "unknown")
    const key = `${keyPrefix}:${id}`

    const count = await slidingWindowCount(redis, key, windowMs)

    if (count > max) {
      const retryAfterSeconds = Math.ceil(windowMs / 1000)
      res.set("Retry-After", String(retryAfterSeconds))
      res.status(429).json({
        error: "Too Many Requests",
        retryAfter: retryAfterSeconds,
      })
      return
    }

    next()
  }
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────
// Call these factories with a Redis instance to get ready-to-use middleware.

/** 100 requests / minute per IP — applied to all /api/* routes. */
export function generalIpLimiter(redis: Redis) {
  return rateLimiter({
    redis,
    keyPrefix: "rl:ip:general",
    max: 100,
    windowMs: 60_000,
  })
}

/** 10 requests / hour per IP — applied to /api/auth/register. */
export function registerLimiter(redis: Redis) {
  return rateLimiter({
    redis,
    keyPrefix: "rl:ip:register",
    max: 10,
    windowMs: 60 * 60_000,
  })
}

/** 20 AI service requests / hour per authenticated user. */
export function aiServiceLimiter(redis: Redis, getUserId: (req: Request) => string) {
  return rateLimiter({
    redis,
    keyPrefix: "rl:user:ai",
    max: 20,
    windowMs: 60 * 60_000,
    identifier: getUserId,
  })
}
