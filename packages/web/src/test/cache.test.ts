import { describe, it, expect, vi, beforeEach } from "vitest"
import { RedisCache, CACHE_TTL, cacheKey } from "../server/cache"

// ─── Mock Redis ───────────────────────────────────────────────────────────────

function makeMockRedis() {
  const store = new Map<string, { value: string; ttl: number }>()

  return {
    get: vi.fn().mockImplementation((key: string) => {
      const entry = store.get(key)
      return Promise.resolve(entry?.value ?? null)
    }),
    setex: vi.fn().mockImplementation((key: string, ttl: number, value: string) => {
      store.set(key, { value, ttl })
      return Promise.resolve("OK")
    }),
    del: vi.fn().mockImplementation((key: string) => {
      const existed = store.has(key)
      store.delete(key)
      return Promise.resolve(existed ? 1 : 0)
    }),
    store,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("RedisCache", () => {
  let redis: ReturnType<typeof makeMockRedis>
  let cache: RedisCache

  beforeEach(() => {
    redis = makeMockRedis()
    cache = new RedisCache(redis as never)
  })

  // ── UBO ──────────────────────────────────────────────────────────────────

  it("setUbo stores serialized data with TTL 300", async () => {
    await cache.setUbo("proj-1", { riskLevel: "MEDIUM" })
    expect(redis.setex).toHaveBeenCalledWith(
      cacheKey.ubo("proj-1"),
      CACHE_TTL.UBO,
      JSON.stringify({ riskLevel: "MEDIUM" }),
    )
  })

  it("getUbo returns deserialized data", async () => {
    await cache.setUbo("proj-1", { riskLevel: "LOW" })
    const result = await cache.getUbo("proj-1")
    expect(result).toEqual({ riskLevel: "LOW" })
  })

  it("getUbo returns null on cache miss", async () => {
    const result = await cache.getUbo("proj-missing")
    expect(result).toBeNull()
  })

  it("invalidateUbo deletes the key", async () => {
    await cache.setUbo("proj-1", { riskLevel: "HIGH" })
    await cache.invalidateUbo("proj-1")
    expect(redis.del).toHaveBeenCalledWith(cacheKey.ubo("proj-1"))
    expect(await cache.getUbo("proj-1")).toBeNull()
  })

  // ── Exchange rates ────────────────────────────────────────────────────────

  it("setRate stores rate with TTL 3600", async () => {
    await cache.setRate("USD", "SAR", 3.75)
    expect(redis.setex).toHaveBeenCalledWith(
      cacheKey.rate("USD", "SAR"),
      CACHE_TTL.RATES,
      JSON.stringify(3.75),
    )
  })

  it("getRate returns the stored rate", async () => {
    await cache.setRate("USD", "AED", 3.67)
    const rate = await cache.getRate("USD", "AED")
    expect(rate).toBe(3.67)
  })

  it("getRate returns null on cache miss", async () => {
    const rate = await cache.getRate("EUR", "KWD")
    expect(rate).toBeNull()
  })

  // ── Subscription ──────────────────────────────────────────────────────────

  it("setSubscription stores with TTL 600", async () => {
    await cache.setSubscription("user-1", { plan: "gold", tokens: 1000 })
    expect(redis.setex).toHaveBeenCalledWith(
      cacheKey.sub("user-1"),
      CACHE_TTL.SUB,
      JSON.stringify({ plan: "gold", tokens: 1000 }),
    )
  })

  it("getSubscription returns cached data", async () => {
    await cache.setSubscription("user-1", { plan: "platinum" })
    const sub = await cache.getSubscription("user-1")
    expect(sub).toEqual({ plan: "platinum" })
  })

  it("invalidateSubscription removes the key", async () => {
    await cache.setSubscription("user-1", { plan: "silver" })
    await cache.invalidateSubscription("user-1")
    expect(await cache.getSubscription("user-1")).toBeNull()
  })

  // ── Feature flags ─────────────────────────────────────────────────────────

  it("setFlag stores with TTL 60", async () => {
    await cache.setFlag("ai_provider", "anthropic")
    expect(redis.setex).toHaveBeenCalledWith(
      cacheKey.flag("ai_provider"),
      CACHE_TTL.FLAG,
      "anthropic",
    )
  })

  it("getFlag returns raw string value", async () => {
    await cache.setFlag("ai_provider", "openai")
    const flag = await cache.getFlag("ai_provider")
    expect(flag).toBe("openai")
  })

  it("getFlag returns null on miss", async () => {
    const flag = await cache.getFlag("nonexistent_flag")
    expect(flag).toBeNull()
  })

  it("invalidateFlag removes the key", async () => {
    await cache.setFlag("ai_provider", "openai")
    await cache.invalidateFlag("ai_provider")
    expect(redis.del).toHaveBeenCalledWith(cacheKey.flag("ai_provider"))
    expect(await cache.getFlag("ai_provider")).toBeNull()
  })
})
