import { describe, it, expect, vi, beforeEach } from "vitest"
import jwt from "jsonwebtoken"
import { createAdminGuard } from "../server/middleware/admin-guard"
import { strictObject, validateBody, formatZodError } from "../server/middleware/validate-body"
import { injectDisclaimer, disclaimerMiddleware, DISCLAIMER_AR } from "../server/middleware/disclaimer"
import {
  validateUpload,
  FileSizeError,
  FileTypeError,
  MAX_FILE_SIZE,
} from "../server/middleware/file-upload"
import { slidingWindowCount } from "../server/middleware/rate-limit"
import { z } from "zod"

const JWT_SECRET = "test-secret"
process.env.JWT_SECRET = JWT_SECRET

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeToken(payload: object, secret = JWT_SECRET) {
  return jwt.sign(payload, secret, { expiresIn: "1h" })
}

function mockReq(overrides: Record<string, unknown> = {}) {
  return {
    headers: {},
    method: "GET",
    path: "/api/admin/users/00000000-0000-4000-8000-000000000001",
    originalUrl: "/api/admin/users/00000000-0000-4000-8000-000000000001",
    ip: "127.0.0.1",
    params: { id: "00000000-0000-4000-8000-000000000001" },
    query: {},
    body: {},
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  }
}

function mockRes() {
  const res: Record<string, unknown> = { _body: null, _status: 200, _headers: {} }
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockImplementation((b: unknown) => { res._body = b; return res })
  res.set = vi.fn().mockReturnValue(res)
  return res as ReturnType<typeof mockRes>
}

// ─── Admin Guard ──────────────────────────────────────────────────────────────

describe("adminGuard", () => {
  const mockDb = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([]),
  }

  const guard = createAdminGuard(mockDb as never)

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.insert.mockReturnThis()
    mockDb.values.mockResolvedValue([])
  })

  it("rejects request with no authorization header", async () => {
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn()

    await guard(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects invalid token", async () => {
    const req = mockReq({ headers: { authorization: "Bearer bad.token.here" } })
    const res = mockRes()
    const next = vi.fn()

    await guard(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it("rejects token signed with wrong secret", async () => {
    const token = makeToken({ sub: "user-1", role: "admin" }, "wrong-secret")
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } })
    const res = mockRes()
    const next = vi.fn()

    await guard(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it("rejects user with non-admin role", async () => {
    const token = makeToken({ sub: "user-1", role: "user" })
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } })
    const res = mockRes()
    const next = vi.fn()

    await guard(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it("allows admin role and calls next", async () => {
    const token = makeToken({ sub: "admin-1", role: "admin" })
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } }) as never
    const res = mockRes()
    const next = vi.fn()

    await guard(req, res as never, next)

    expect(next).toHaveBeenCalled()
    expect((req as never as { adminUser: { role: string } }).adminUser.role).toBe("admin")
  })

  it("sets readOnly=false for admin role", async () => {
    const token = makeToken({ sub: "admin-1", role: "admin" })
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } }) as never
    const res = mockRes()
    const next = vi.fn()

    await guard(req, res as never, next)

    expect((req as never as { readOnly: boolean }).readOnly).toBe(false)
  })

  it("sets readOnly=true for support role", async () => {
    const token = makeToken({ sub: "support-1", role: "support" })
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } }) as never
    const res = mockRes()
    const next = vi.fn()

    await guard(req, res as never, next)

    expect(next).toHaveBeenCalled()
    expect((req as never as { readOnly: boolean }).readOnly).toBe(true)
  })

  it("writes audit log on successful auth", async () => {
    const token = makeToken({ sub: "admin-1", role: "admin" })
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } }) as never
    const next = vi.fn()

    await guard(req, mockRes() as never, next)

    expect(mockDb.insert).toHaveBeenCalled()
    expect(mockDb.values).toHaveBeenCalled()
  })

  it("still calls next if audit log write fails", async () => {
    mockDb.values.mockRejectedValueOnce(new Error("DB error"))
    const token = makeToken({ sub: "admin-1", role: "admin" })
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } }) as never
    const next = vi.fn()

    await guard(req, mockRes() as never, next)

    expect(next).toHaveBeenCalled()
  })
})

// ─── Zod strict validateBody ──────────────────────────────────────────────────

describe("strictObject + validateBody", () => {
  const schema = strictObject({ name: z.string(), age: z.number() })

  it("passes valid body and calls next", () => {
    const req = mockReq({ body: { name: "Alice", age: 30 } })
    const res = mockRes()
    const next = vi.fn()

    validateBody(schema)(req as never, res as never, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it("rejects extra fields (strict mode)", () => {
    const req = mockReq({ body: { name: "Alice", age: 30, extra: "bad" } })
    const res = mockRes()
    const next = vi.fn()

    validateBody(schema)(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects missing required field", () => {
    const req = mockReq({ body: { name: "Alice" } })
    const res = mockRes()
    const next = vi.fn()

    validateBody(schema)(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it("rejects wrong type", () => {
    const req = mockReq({ body: { name: 123, age: 30 } })
    const res = mockRes()
    const next = vi.fn()

    validateBody(schema)(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it("formatZodError returns structured issues", () => {
    const result = schema.safeParse({ name: "x", age: "bad", extra: 1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const formatted = formatZodError(result.error)
      expect(formatted.error).toBe("Validation failed")
      expect(formatted.issues.length).toBeGreaterThan(0)
      expect(formatted.issues[0]).toHaveProperty("path")
      expect(formatted.issues[0]).toHaveProperty("message")
    }
  })
})

// ─── Disclaimer ───────────────────────────────────────────────────────────────

describe("disclaimer", () => {
  it("injectDisclaimer appends Arabic disclaimer", () => {
    const result = injectDisclaimer("Here is the analysis.")
    expect(result).toContain(DISCLAIMER_AR)
    expect(result.startsWith("Here is the analysis.")).toBe(true)
  })

  it("injectDisclaimer is idempotent", () => {
    const once = injectDisclaimer("content")
    const twice = injectDisclaimer(once)
    expect(once).toBe(twice)
  })

  it("disclaimerMiddleware injects into result_content field", () => {
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn()

    disclaimerMiddleware(req as never, res as never, next)
    res.json({ result_content: "AI output here." })

    const body = (res._body as Record<string, unknown>)
    expect((body.result_content as string)).toContain(DISCLAIMER_AR)
  })

  it("disclaimerMiddleware leaves non-AI fields untouched", () => {
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn()

    disclaimerMiddleware(req as never, res as never, next)
    res.json({ id: "abc", status: "completed" })

    const body = res._body as Record<string, unknown>
    expect(body.id).toBe("abc")
    expect(body.status).toBe("completed")
  })

  it("disclaimerMiddleware calls next", () => {
    const next = vi.fn()
    disclaimerMiddleware(mockReq() as never, mockRes() as never, next)
    expect(next).toHaveBeenCalled()
  })
})

// ─── File upload ──────────────────────────────────────────────────────────────

vi.mock("file-type", () => ({
  fileTypeFromBuffer: vi.fn(),
}))

import { fileTypeFromBuffer } from "file-type"

describe("validateUpload", () => {
  const pngBuffer = Buffer.alloc(100) // mock buffer (file-type is mocked)

  beforeEach(() => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ mime: "image/png", ext: "png" } as never)
  })

  it("accepts PNG in logo context", async () => {
    const result = await validateUpload(pngBuffer, "logo")
    expect(result.mime).toBe("image/png")
  })

  it("accepts JPEG in logo context", async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValueOnce({ mime: "image/jpeg", ext: "jpg" } as never)
    const result = await validateUpload(pngBuffer, "logo")
    expect(result.mime).toBe("image/jpeg")
  })

  it("rejects GIF in logo context", async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValueOnce({ mime: "image/gif", ext: "gif" } as never)
    await expect(validateUpload(pngBuffer, "logo")).rejects.toThrow(FileTypeError)
  })

  it("accepts PDF in document context", async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValueOnce({ mime: "application/pdf", ext: "pdf" } as never)
    const result = await validateUpload(pngBuffer, "document")
    expect(result.mime).toBe("application/pdf")
  })

  it("rejects executable MIME unconditionally", async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValueOnce({
      mime: "application/x-executable",
      ext: "elf",
    } as never)
    await expect(validateUpload(pngBuffer, "document")).rejects.toThrow(FileTypeError)
  })

  it("rejects text/javascript unconditionally", async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValueOnce({
      mime: "text/javascript",
      ext: "js",
    } as never)
    await expect(validateUpload(pngBuffer, "document")).rejects.toThrow(FileTypeError)
  })

  it("rejects file exceeding 10 MB", async () => {
    const big = Buffer.alloc(MAX_FILE_SIZE + 1)
    await expect(validateUpload(big, "document")).rejects.toThrow(FileSizeError)
  })

  it("FileSizeError carries readable message", async () => {
    const big = Buffer.alloc(MAX_FILE_SIZE + 1)
    try {
      await validateUpload(big, "document")
    } catch (e) {
      expect((e as FileSizeError).message).toContain("MB")
    }
  })

  it("FileTypeError carries detectedMime", async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValueOnce({ mime: "text/javascript", ext: "js" } as never)
    try {
      await validateUpload(pngBuffer, "document")
    } catch (e) {
      expect((e as FileTypeError).detectedMime).toBe("text/javascript")
    }
  })
})

// ─── Rate limiter ─────────────────────────────────────────────────────────────

describe("slidingWindowCount", () => {
  it("increments counter and returns current count", async () => {
    let card = 0
    const mockRedis = {
      pipeline: () => ({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        pexpire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          [null, 1],  // zremrangebyscore
          [null, 1],  // zadd
          [null, ++card],  // zcard
          [null, 1],  // pexpire
        ]),
      }),
    }

    const count = await slidingWindowCount(mockRedis as never, "test:key", 60_000)
    expect(count).toBe(1)
  })

  it("rateLimiter returns 429 when limit exceeded", async () => {
    const { rateLimiter } = await import("../server/middleware/rate-limit")
    const calls = 0
    const mockRedis = {
      pipeline: () => ({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        pexpire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          [null, 0], [null, 1], [null, 101], [null, 1],
        ]),
      }),
    }

    const limiter = rateLimiter({ redis: mockRedis as never, keyPrefix: "test", max: 100, windowMs: 60_000 })
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn()

    await limiter(req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.set).toHaveBeenCalledWith("Retry-After", "60")
    expect(next).not.toHaveBeenCalled()
  })

  it("rateLimiter calls next when under limit", async () => {
    const { rateLimiter } = await import("../server/middleware/rate-limit")
    const mockRedis = {
      pipeline: () => ({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        pexpire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          [null, 0], [null, 1], [null, 50], [null, 1],
        ]),
      }),
    }

    const limiter = rateLimiter({ redis: mockRedis as never, keyPrefix: "test", max: 100, windowMs: 60_000 })
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn()

    await limiter(req as never, res as never, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
