import type { Redis } from "ioredis"

// ─── TTL constants (seconds) ──────────────────────────────────────────────────

export const CACHE_TTL = {
  UBO: 300,       // 5 min — invalidated on approve/update
  RATES: 3600,    // 1 hour — exchange rates change slowly
  SUB: 600,       // 10 min — subscription/token balance
  FLAG: 60,       // 1 min — feature flags must propagate quickly
} as const

// ─── Key builders ─────────────────────────────────────────────────────────────

export const cacheKey = {
  ubo: (projectId: string) => `ubo:${projectId}`,
  rate: (from: string, to: string) => `rates:${from}:${to}`,
  sub: (userId: string) => `sub:${userId}`,
  flag: (name: string) => `flag:${name}`,
}

// ─── Cache class ──────────────────────────────────────────────────────────────

export class RedisCache {
  constructor(private readonly redis: Redis) {}

  // ── UBO ──────────────────────────────────────────────────────────────────

  async getUbo<T = unknown>(projectId: string): Promise<T | null> {
    return this.get<T>(cacheKey.ubo(projectId))
  }

  async setUbo<T>(projectId: string, data: T): Promise<void> {
    await this.set(cacheKey.ubo(projectId), data, CACHE_TTL.UBO)
  }

  async invalidateUbo(projectId: string): Promise<void> {
    await this.redis.del(cacheKey.ubo(projectId))
  }

  // ── Exchange rates ────────────────────────────────────────────────────────

  async getRate(from: string, to: string): Promise<number | null> {
    return this.get<number>(cacheKey.rate(from, to))
  }

  async setRate(from: string, to: string, rate: number): Promise<void> {
    await this.set(cacheKey.rate(from, to), rate, CACHE_TTL.RATES)
  }

  // ── User subscription ─────────────────────────────────────────────────────

  async getSubscription<T = unknown>(userId: string): Promise<T | null> {
    return this.get<T>(cacheKey.sub(userId))
  }

  async setSubscription<T>(userId: string, data: T): Promise<void> {
    await this.set(cacheKey.sub(userId), data, CACHE_TTL.SUB)
  }

  async invalidateSubscription(userId: string): Promise<void> {
    await this.redis.del(cacheKey.sub(userId))
  }

  // ── Feature flags ─────────────────────────────────────────────────────────

  async getFlag(name: string): Promise<string | null> {
    const raw = await this.redis.get(cacheKey.flag(name))
    return raw
  }

  async setFlag(name: string, value: string): Promise<void> {
    await this.redis.setex(cacheKey.flag(name), CACHE_TTL.FLAG, value)
  }

  async invalidateFlag(name: string): Promise<void> {
    await this.redis.del(cacheKey.flag(name))
  }

  // ── Generic helpers ───────────────────────────────────────────────────────

  private async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  private async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(data))
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _cache: RedisCache | null = null

export function getCache(redis?: Redis): RedisCache {
  if (redis) return new RedisCache(redis)
  if (!_cache) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("ioredis") as typeof import("ioredis")
    const r = new Redis({
      host: process.env.REDIS_HOST ?? "localhost",
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD ?? undefined,
      maxRetriesPerRequest: null,
    })
    _cache = new RedisCache(r)
  }
  return _cache
}
