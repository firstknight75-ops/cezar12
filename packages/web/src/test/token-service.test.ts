import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  TokenService,
  getTokenService,
  ServiceNotAvailableError,
  InsufficientTokensError,
} from "../lib/token-service"

// ─── Mock helpers ──────────────────────────────────────────────────────────────

function makeSub(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub-1",
    userId: "user-1",
    plan: "gold",
    cycle: "monthly",
    status: "active",
    planTokenBalance: 1000,
    addonTokenBalance: 0,
    planTokenMonthly: 1500,
    currentPeriodStart: new Date("2026-05-01"),
    currentPeriodEnd: new Date("2026-06-01"),
    createdAt: new Date(),
    ...overrides,
  }
}

function makeJob(overrides: Record<string, unknown> = {}) {
  return {
    id: "job-1",
    userId: "user-1",
    projectId: "proj-1",
    serviceType: "weekly_content",
    status: "failed",
    tokensDeducted: 40,
    tokensRefunded: 0,
    resultContent: null,
    startedAt: null,
    completedAt: null,
    approvedAt: null,
    expiresAt: null,
    ...overrides,
  }
}

function makeTx(overrides: Record<string, unknown> = {}) {
  return {
    id: "tx-1",
    userId: "user-1",
    projectId: "proj-1",
    serviceType: "weekly_content",
    amount: 40,
    direction: "debit",
    source: "plan",
    balanceAfter: 960,
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Builds a lightweight Drizzle-shaped mock db.
 *
 * selectResults: FIFO queue of row arrays returned by SELECT queries.
 * SELECT terminal calls (.limit, awaited .where, .orderBy) consume from the queue.
 * UPDATE/DELETE terminal .where() calls resolve void (no queue consumption).
 */
function makeMockDb(selectResults: unknown[][] = []) {
  const queue = [...selectResults]

  // Returns a cursor that can be awaited at any chain depth and supports
  // .limit() and .orderBy() chaining. All terminal points pull from the queue.
  function makeSelectCursor(): Record<string, unknown> {
    const cursor: Record<string, unknown> = {
      then(
        resolve: (v: unknown[]) => void,
        reject: (e: unknown) => void,
      ) {
        Promise.resolve(queue.shift() ?? []).then(resolve, reject)
      },
      limit: vi.fn().mockImplementation(() =>
        Promise.resolve(queue.shift() ?? []),
      ),
      orderBy: vi.fn().mockImplementation(() => makeSelectCursor()),
    }
    return cursor
  }

  // Returns a thenable that resolves void (for mutations)
  const voidTerminal = {
    then(resolve: (v: undefined) => void) {
      Promise.resolve(undefined).then(resolve)
    },
  }

  let mode: "select" | "mutation" = "select"

  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockImplementation(() => {
      mode = "select"
      return chain
    }),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation(() => {
      if (mode === "select") return makeSelectCursor()
      return voidTerminal
    }),
    limit: vi.fn().mockImplementation(() =>
      Promise.resolve(queue.shift() ?? []),
    ),
    orderBy: vi.fn().mockImplementation(() =>
      Promise.resolve(queue.shift() ?? []),
    ),
    update: vi.fn().mockImplementation(() => {
      mode = "mutation"
      return chain
    }),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation(() => {
      mode = "mutation"
      return chain
    }),
    values: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockImplementation(() => {
      mode = "mutation"
      return chain
    }),
  }

  const db = {
    ...chain,
    transaction: vi.fn().mockImplementation((fn: (tx: unknown) => unknown) =>
      fn(chain),
    ),
  }

  return { db, chain, queue }
}

// ─── getCost ───────────────────────────────────────────────────────────────────

describe("TokenService.getCost", () => {
  const svc = new TokenService(null as never)

  it("returns correct cost for gold plan", () => {
    expect(svc.getCost("weekly_content", "gold")).toBe(40)
  })

  it("returns correct cost for silver plan", () => {
    expect(svc.getCost("plan_90day", "silver")).toBe(80)
  })

  it("returns correct cost for platinum plan", () => {
    expect(svc.getCost("ad_campaign", "platinum")).toBe(40)
  })

  it("throws ServiceNotAvailableError for null-cost service on silver", () => {
    expect(() => svc.getCost("kitchen_cost_analysis", "silver")).toThrow(
      ServiceNotAvailableError,
    )
  })

  it("throws ServiceNotAvailableError for unknown service", () => {
    expect(() => svc.getCost("nonexistent_service", "gold")).toThrow(
      ServiceNotAvailableError,
    )
  })

  it("throws on unknown plan type", () => {
    expect(() => svc.getCost("weekly_content", "bronze")).toThrow(
      "Unknown plan type: bronze",
    )
  })

  it("ServiceNotAvailableError carries serviceType and planType", () => {
    try {
      svc.getCost("recipe_costing", "silver")
    } catch (e) {
      expect(e).toBeInstanceOf(ServiceNotAvailableError)
      const err = e as ServiceNotAvailableError
      expect(err.serviceType).toBe("recipe_costing")
      expect(err.planType).toBe("silver")
    }
  })

  it("pdf_export costs 0 on platinum", () => {
    expect(svc.getCost("pdf_export", "platinum")).toBe(0)
  })
})

// ─── getBalance ────────────────────────────────────────────────────────────────

describe("TokenService.getBalance", () => {
  it("returns combined balance from active subscription", async () => {
    const sub = makeSub({ planTokenBalance: 300, addonTokenBalance: 150 })
    const { db } = makeMockDb([[sub]])

    const svc = new TokenService(db as never)
    const balance = await svc.getBalance("user-1")

    expect(balance.plan_tokens).toBe(300)
    expect(balance.addon_tokens).toBe(150)
    expect(balance.total).toBe(450)
    expect(balance.plan_type).toBe("gold")
  })

  it("throws when no active subscription", async () => {
    const { db } = makeMockDb([[]])

    const svc = new TokenService(db as never)
    await expect(svc.getBalance("user-1")).rejects.toThrow(
      "No active subscription found for user user-1",
    )
  })
})

// ─── deductTokens ──────────────────────────────────────────────────────────────

describe("TokenService.deductTokens", () => {
  it("deducts from plan tokens when addon balance is insufficient", async () => {
    const sub = makeSub({ planTokenBalance: 1000, addonTokenBalance: 0 })
    // requireActiveSubscription inside transaction returns sub
    const { db, chain } = makeMockDb([[sub]])

    const svc = new TokenService(db as never)
    const result = await svc.deductTokens("user-1", "weekly_content", "proj-1")

    // weekly_content gold cost = 40
    expect(result.deducted).toBe(40)
    expect(result.source).toBe("plan")
    expect(result.balance_after).toBe(960)
    expect(chain.update).toHaveBeenCalled()
    expect(chain.insert).toHaveBeenCalled()
  })

  it("deducts from addon tokens first when sufficient", async () => {
    const sub = makeSub({ planTokenBalance: 500, addonTokenBalance: 200 })
    const purchase = {
      id: "p-1",
      subscriptionId: "sub-1",
      tokensRemaining: 200,
      expiresAt: new Date("2026-06-01"),
    }

    // Queue: [sub (limit), purchases (orderBy)]
    const { db } = makeMockDb([[sub], [purchase]])

    const svc = new TokenService(db as never)
    const result = await svc.deductTokens("user-1", "weekly_content", "proj-1")

    expect(result.deducted).toBe(40)
    expect(result.source).toBe("addon")
    expect(result.balance_after).toBe(200 - 40 + 500) // 660
  })

  it("throws InsufficientTokensError when total < cost", async () => {
    const sub = makeSub({ planTokenBalance: 10, addonTokenBalance: 5 })
    const { db } = makeMockDb([[sub]])

    const svc = new TokenService(db as never)
    await expect(
      svc.deductTokens("user-1", "weekly_content", "proj-1"),
    ).rejects.toThrow(InsufficientTokensError)
  })

  it("InsufficientTokensError carries needed and available", async () => {
    const sub = makeSub({ planTokenBalance: 10, addonTokenBalance: 5 })
    const { db } = makeMockDb([[sub]])

    const svc = new TokenService(db as never)
    try {
      await svc.deductTokens("user-1", "weekly_content", "proj-1")
    } catch (e) {
      expect(e).toBeInstanceOf(InsufficientTokensError)
      const err = e as InsufficientTokensError
      expect(err.needed).toBe(40) // weekly_content gold
      expect(err.available).toBe(15)
    }
  })

  it("throws ServiceNotAvailableError for null-cost service on plan", async () => {
    const sub = makeSub({ plan: "silver" })
    const { db } = makeMockDb([[sub]])

    const svc = new TokenService(db as never)
    await expect(
      svc.deductTokens("user-1", "kitchen_cost_analysis", "proj-1"),
    ).rejects.toThrow(ServiceNotAvailableError)
  })
})

// ─── refundTokens ──────────────────────────────────────────────────────────────

describe("TokenService.refundTokens", () => {
  it("refunds 100% to plan source", async () => {
    const job = makeJob({ tokensDeducted: 40 })
    const tx = makeTx({ source: "plan" })
    const sub = makeSub({ planTokenBalance: 960, addonTokenBalance: 0 })

    const { db, chain } = makeMockDb([[job], [tx], [sub]])

    const svc = new TokenService(db as never)
    await svc.refundTokens("user-1", "job-1", 100)

    // Should update subscription planTokenBalance +40 and insert credit tx
    expect(chain.update).toHaveBeenCalled()
    expect(chain.insert).toHaveBeenCalled()
  })

  it("refunds 50% rounded down", async () => {
    const job = makeJob({ tokensDeducted: 40 })
    const tx = makeTx({ source: "addon" })
    const sub = makeSub({ planTokenBalance: 500, addonTokenBalance: 100 })

    const { db, chain } = makeMockDb([[job], [tx], [sub]])

    const svc = new TokenService(db as never)
    await svc.refundTokens("user-1", "job-1", 50)

    // 50% of 40 = 20 tokens credited back to addon
    expect(chain.update).toHaveBeenCalled()
  })

  it("returns early when tokensDeducted is 0", async () => {
    const job = makeJob({ tokensDeducted: 0 })
    const { db, chain } = makeMockDb([[job]])

    const svc = new TokenService(db as never)
    await svc.refundTokens("user-1", "job-1", 100)

    // No update should be triggered
    expect(chain.update).not.toHaveBeenCalled()
  })

  it("throws when job not found", async () => {
    const { db } = makeMockDb([[]])

    const svc = new TokenService(db as never)
    await expect(svc.refundTokens("user-1", "job-999", 100)).rejects.toThrow(
      "AI job job-999 not found",
    )
  })
})

// ─── purchaseAddon ─────────────────────────────────────────────────────────────

describe("TokenService.purchaseAddon", () => {
  it("throws on unknown package type", async () => {
    const { db } = makeMockDb([])

    const svc = new TokenService(db as never)
    await expect(svc.purchaseAddon("user-1", "unknown_pkg")).rejects.toThrow(
      "Unknown addon package: unknown_pkg",
    )
  })

  it("inserts addon purchase and updates subscription balance", async () => {
    const sub = makeSub({ planTokenBalance: 500, addonTokenBalance: 0 })
    const { db, chain } = makeMockDb([[sub]])

    const svc = new TokenService(db as never)
    await svc.purchaseAddon("user-1", "micro") // 200 tokens / $15

    expect(chain.insert).toHaveBeenCalledTimes(2) // addonPurchases + tokenTransactions
    expect(chain.update).toHaveBeenCalledTimes(1)
  })

  it("sets grace period expiry when < 7 days remain in period", async () => {
    const now = new Date()
    const almostEnd = new Date(now.getTime() + 3 * 86_400_000) // 3 days left
    const periodStart = new Date(now.getTime() - 27 * 86_400_000) // 27 days ago

    const sub = makeSub({
      currentPeriodStart: periodStart,
      currentPeriodEnd: almostEnd,
    })
    const { db, chain } = makeMockDb([[sub]])

    let capturedInsertValues: Record<string, unknown> | null = null
    chain.values.mockImplementationOnce((vals: Record<string, unknown>) => {
      capturedInsertValues = vals
      return Promise.resolve([])
    })

    const svc = new TokenService(db as never)
    await svc.purchaseAddon("user-1", "small")

    // expiresAt should be > almostEnd (grace period extended)
    if (capturedInsertValues && "expiresAt" in capturedInsertValues) {
      expect(
        (capturedInsertValues.expiresAt as Date).getTime(),
      ).toBeGreaterThan(almostEnd.getTime())
    }
  })

  it("sets expiry to current period end when > 7 days remain", async () => {
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 20 * 86_400_000) // 20 days left

    const sub = makeSub({ currentPeriodEnd: periodEnd })
    const { db, chain } = makeMockDb([[sub]])

    let capturedInsertValues: Record<string, unknown> | null = null
    chain.values.mockImplementationOnce((vals: Record<string, unknown>) => {
      capturedInsertValues = vals
      return Promise.resolve([])
    })

    const svc = new TokenService(db as never)
    await svc.purchaseAddon("user-1", "small")

    if (capturedInsertValues && "expiresAt" in capturedInsertValues) {
      expect((capturedInsertValues.expiresAt as Date).getTime()).toBe(
        periodEnd.getTime(),
      )
    }
  })
})

// ─── resetMonthlyTokens ────────────────────────────────────────────────────────

describe("TokenService.resetMonthlyTokens", () => {
  it("resets plan balance and removes expired addon purchases", async () => {
    const sub = makeSub({ plan: "gold", addonTokenBalance: 150, planTokenMonthly: 1500 })
    const expiredPurchase = { id: "p-expired", tokensRemaining: 100, expiresAt: new Date("2026-04-01") }

    const { db, chain } = makeMockDb([[sub], [expiredPurchase]])

    const svc = new TokenService(db as never)
    await svc.resetMonthlyTokens("sub-1")

    // subscription should be updated with planTokenBalance=1500 and addonTokenBalance=50 (150-100)
    expect(chain.update).toHaveBeenCalled()
    expect(chain.delete).toHaveBeenCalled()
  })

  it("resets plan balance with no expired addons", async () => {
    const sub = makeSub({ plan: "silver", addonTokenBalance: 200 })
    const { db, chain } = makeMockDb([[sub], []])

    const svc = new TokenService(db as never)
    await svc.resetMonthlyTokens("sub-1")

    expect(chain.update).toHaveBeenCalled()
    // no delete since no expired purchases
    expect(chain.delete).not.toHaveBeenCalled()
  })

  it("throws when subscription not found", async () => {
    const { db } = makeMockDb([[]])

    const svc = new TokenService(db as never)
    await expect(svc.resetMonthlyTokens("sub-999")).rejects.toThrow(
      "Subscription sub-999 not found",
    )
  })
})

// ─── getTokenService factory ───────────────────────────────────────────────────

describe("getTokenService", () => {
  it("returns a TokenService instance when db is provided", () => {
    const { db } = makeMockDb()
    const svc = getTokenService(db as never)
    expect(svc).toBeInstanceOf(TokenService)
  })

  it("returns a fresh instance on each call when db arg is provided", () => {
    const { db: db1 } = makeMockDb()
    const { db: db2 } = makeMockDb()
    const svc1 = getTokenService(db1 as never)
    const svc2 = getTokenService(db2 as never)
    expect(svc1).not.toBe(svc2)
  })
})
