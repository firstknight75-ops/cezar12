import { describe, it, expect, vi, beforeEach } from "vitest"
import { ServiceOrchestrator } from "../lib/service-orchestrator"

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockTokenSvc = {
  deductTokens: vi.fn().mockResolvedValue({ deducted: 40, source: "plan", balance_after: 960 }),
  refundTokens: vi.fn().mockResolvedValue(undefined),
}

vi.mock("../lib/token-service", () => ({
  getTokenService: () => mockTokenSvc,
}))

vi.mock("../server/queues", () => ({
  getQueue: () => ({ add: vi.fn().mockResolvedValue({ id: "bullmq-job-1" }) }),
}))

vi.mock("../lib/prompt-builder", () => ({
  promptBuilder: { build: vi.fn().mockReturnValue("mock prompt") },
  anonymizePrompt: vi.fn((p: string) => p),
  PromptBuilder: class {
    build() { return "mock prompt" }
  },
}))

// ─── Mock DB factory ──────────────────────────────────────────────────────────

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: "proj-1",
    userId: "user-1",
    domain: "ecommerce",
    domainData: { company_name: "Acme", city: "Dubai" },
    status: "strategy_ready",
    blocking: false,
    lockedAt: null,
    lockedBy: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeUbo(overrides: Record<string, unknown> = {}) {
  return {
    id: "ubo-1",
    projectId: "proj-1",
    riskLevel: "MEDIUM",
    financialScore: 65,
    metrics: {},
    recommendations: {},
    version: 1,
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeSub(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub-1",
    userId: "user-1",
    plan: "gold",
    status: "active",
    planTokenBalance: 1000,
    addonTokenBalance: 0,
    ...overrides,
  }
}

function makeJob(overrides: Record<string, unknown> = {}) {
  return {
    id: "job-1",
    userId: "user-1",
    projectId: "proj-1",
    serviceType: "weekly_content",
    status: "completed",
    resultContent: JSON.stringify({ metrics: { views: 100 }, recommendations: { post: "daily" } }),
    tokensDeducted: 40,
    tokensRefunded: 0,
    startedAt: new Date(),
    completedAt: new Date(),
    approvedAt: null,
    expiresAt: null,
    ...overrides,
  }
}

function makeMockDb(rows: unknown[][] = []) {
  const queue = [...rows]

  function makeSelectCursor(): Record<string, unknown> {
    return {
      then(resolve: (v: unknown[]) => void, reject: (e: unknown) => void) {
        Promise.resolve(queue.shift() ?? []).then(resolve, reject)
      },
      limit: vi.fn().mockImplementation(() => Promise.resolve(queue.shift() ?? [])),
      orderBy: vi.fn().mockImplementation(() => makeSelectCursor()),
    }
  }

  const voidTerminal = {
    then(resolve: (v: undefined) => void) {
      Promise.resolve(undefined).then(resolve)
    },
  }

  let mode: "select" | "mutation" = "select"

  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockImplementation(() => { mode = "select"; return chain }),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation(() =>
      mode === "select" ? makeSelectCursor() : voidTerminal,
    ),
    limit: vi.fn().mockImplementation(() => Promise.resolve(queue.shift() ?? [])),
    update: vi.fn().mockImplementation(() => { mode = "mutation"; return chain }),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation(() => { mode = "mutation"; return chain }),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => Promise.resolve([{ id: "job-1" }])),
    delete: vi.fn().mockImplementation(() => { mode = "mutation"; return chain }),
  }

  const db = {
    ...chain,
    transaction: vi.fn().mockImplementation((fn: (tx: unknown) => unknown) => fn(chain)),
  }

  return { db, chain }
}

// ─── requestService ───────────────────────────────────────────────────────────

describe("ServiceOrchestrator.requestService", () => {
  it("returns jobId and estimatedSeconds", async () => {
    const { db } = makeMockDb([[makeProject()], [makeUbo()], [makeSub()]])
    const svc = new ServiceOrchestrator(db as never)

    const result = await svc.requestService({
      userId: "user-1",
      projectId: "proj-1",
      serviceType: "weekly_content",
    })

    expect(result.jobId).toBe("job-1")
    expect(result.estimatedSeconds).toBe(25) // content-generation queue
  })

  it("throws when project is blocking", async () => {
    const { db } = makeMockDb([[makeProject({ blocking: true })]])
    const svc = new ServiceOrchestrator(db as never)

    await expect(
      svc.requestService({ userId: "user-1", projectId: "proj-1", serviceType: "plan_90day" }),
    ).rejects.toThrow("locked and cannot accept")
  })

  it("throws when project not found", async () => {
    const { db } = makeMockDb([[]])
    const svc = new ServiceOrchestrator(db as never)

    await expect(
      svc.requestService({ userId: "user-1", projectId: "proj-missing", serviceType: "plan_90day" }),
    ).rejects.toThrow("not found")
  })

  it("throws when no active subscription", async () => {
    const { db } = makeMockDb([[makeProject()], [makeUbo()], []])
    const svc = new ServiceOrchestrator(db as never)

    await expect(
      svc.requestService({ userId: "user-1", projectId: "proj-1", serviceType: "plan_90day" }),
    ).rejects.toThrow("No active subscription")
  })

  it("returns 30s estimate for plan-generation services", async () => {
    const { db } = makeMockDb([[makeProject()], [makeUbo()], [makeSub()]])
    const svc = new ServiceOrchestrator(db as never)

    const result = await svc.requestService({
      userId: "user-1",
      projectId: "proj-1",
      serviceType: "plan_90day",
    })
    expect(result.estimatedSeconds).toBe(30)
  })

  it("returns 15s estimate for kitchen-analysis services", async () => {
    const { db } = makeMockDb([[makeProject()], [makeUbo()], [makeSub()]])
    const svc = new ServiceOrchestrator(db as never)

    const result = await svc.requestService({
      userId: "user-1",
      projectId: "proj-1",
      serviceType: "kitchen_cost_analysis",
    })
    expect(result.estimatedSeconds).toBe(15)
  })
})

// ─── getJobStatus ─────────────────────────────────────────────────────────────

describe("ServiceOrchestrator.getJobStatus", () => {
  it("returns job status fields", async () => {
    const { db } = makeMockDb([[makeJob()]])
    const svc = new ServiceOrchestrator(db as never)

    const status = await svc.getJobStatus("job-1")
    expect(status.id).toBe("job-1")
    expect(status.status).toBe("completed")
    expect(status.tokensDeducted).toBe(40)
  })

  it("throws when job not found", async () => {
    const { db } = makeMockDb([[]])
    const svc = new ServiceOrchestrator(db as never)

    await expect(svc.getJobStatus("job-missing")).rejects.toThrow("not found")
  })
})

// ─── approveResult ────────────────────────────────────────────────────────────

describe("ServiceOrchestrator.approveResult", () => {
  it("updates job status to approved and merges UBO", async () => {
    const { db, chain } = makeMockDb([
      [makeJob()],         // load job in transaction
      [makeUbo()],         // load existing UBO
    ])
    const svc = new ServiceOrchestrator(db as never)

    await svc.approveResult("job-1", "user-1")

    expect(chain.update).toHaveBeenCalled()
  })

  it("throws when job not found", async () => {
    const { db } = makeMockDb([[]])
    const svc = new ServiceOrchestrator(db as never)

    await expect(svc.approveResult("job-missing", "user-1")).rejects.toThrow("not found")
  })

  it("throws when job is not in completed state", async () => {
    const { db } = makeMockDb([[makeJob({ status: "queued" })]])
    const svc = new ServiceOrchestrator(db as never)

    await expect(svc.approveResult("job-1", "user-1")).rejects.toThrow("not in 'completed' state")
  })
})

// ─── rejectResult ─────────────────────────────────────────────────────────────

describe("ServiceOrchestrator.rejectResult", () => {
  it("updates status to rejected and triggers 50% refund", async () => {
    const { db, chain } = makeMockDb([[makeJob({ status: "completed" })]])
    mockTokenSvc.refundTokens.mockClear()

    const svc = new ServiceOrchestrator(db as never)
    await svc.rejectResult("job-1", "user-1")

    expect(chain.update).toHaveBeenCalled()
    expect(mockTokenSvc.refundTokens).toHaveBeenCalledWith("user-1", "job-1", 50)
  })

  it("throws when job not found", async () => {
    const { db } = makeMockDb([[]])
    const svc = new ServiceOrchestrator(db as never)

    await expect(svc.rejectResult("job-missing", "user-1")).rejects.toThrow("not found")
  })
})

// ─── deferResult ──────────────────────────────────────────────────────────────

describe("ServiceOrchestrator.deferResult", () => {
  it("sets status to deferred with 30-day expiry", async () => {
    const { db, chain } = makeMockDb([[makeJob({ status: "completed" })]])
    const svc = new ServiceOrchestrator(db as never)

    await svc.deferResult("job-1", "user-1")

    expect(chain.update).toHaveBeenCalled()
    const setArgs = chain.set.mock.calls[0][0] as Record<string, unknown>
    expect(setArgs.status).toBe("deferred")
    const expiry = setArgs.expiresAt as Date
    const thirtyDaysFromNow = Date.now() + 30 * 86_400_000
    expect(expiry.getTime()).toBeGreaterThan(thirtyDaysFromNow - 5000)
    expect(expiry.getTime()).toBeLessThan(thirtyDaysFromNow + 5000)
  })

  it("throws when job not found", async () => {
    const { db } = makeMockDb([[]])
    const svc = new ServiceOrchestrator(db as never)

    await expect(svc.deferResult("job-missing", "user-1")).rejects.toThrow("not found")
  })
})
