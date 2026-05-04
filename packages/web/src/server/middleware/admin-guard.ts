import jwt from "jsonwebtoken"
import { eq, and } from "drizzle-orm"
import { type Db } from "@/db/client"
import { auditLog, users } from "@/db/schema"
import type { Request, Response, NextFunction } from "express"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminRequest extends Request {
  adminUser: { id: string; role: "admin" | "support" }
  readOnly: boolean
}

// Nil UUID used when a target ID cannot be extracted from the path
const NIL_UUID = "00000000-0000-0000-0000-000000000000"

// UUID v4 regex for safe extraction
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function extractTarget(req: Request): { targetType: string; targetId: string } {
  const parts = (req.path ?? "").split("/").filter(Boolean)
  // e.g. /api/admin/users/uuid → ['api','admin','users','uuid']
  const resourceIdx = parts.indexOf("admin") + 1
  const targetType = parts[resourceIdx] ?? "unknown"
  const rawId = parts[resourceIdx + 1] ?? ""
  const targetId = UUID_RE.test(rawId) ? rawId : NIL_UUID
  return { targetType, targetId }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createAdminGuard(db: Db) {
  return async function adminGuard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    // 1. Extract bearer token
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing bearer token" })
      return
    }

    const token = authHeader.slice(7)
    let payload: jwt.JwtPayload

    // 2. Verify signature
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_SECRET ?? "dev-secret",
      ) as jwt.JwtPayload
    } catch {
      res.status(401).json({ error: "Invalid or expired token" })
      return
    }

    // 3. Role check
    const role = payload.role as string
    if (!["admin", "support"].includes(role)) {
      res.status(403).json({ error: "Insufficient permissions" })
      return
    }

    // 4. Attach to request
    const adminReq = req as AdminRequest
    adminReq.adminUser = { id: payload.sub!, role: role as "admin" | "support" }
    adminReq.readOnly = role === "support"

    // 5. Await audit log write — this is intentionally blocking so the record
    //    is guaranteed to exist before the route handler runs.
    const { targetType, targetId } = extractTarget(req)
    const action = `${req.method} ${req.path}`
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
      req.ip ??
      req.socket?.remoteAddress ??
      "unknown"

    try {
      await db.insert(auditLog).values({
        actorId: payload.sub!,
        actorRole: role as "admin" | "support",
        action: action.slice(0, 100),
        targetType: targetType.slice(0, 100),
        targetId,
        metadata: {
          query: req.query as Record<string, unknown>,
          userAgent: req.headers["user-agent"],
        },
        ip,
      })
    } catch (err) {
      // Audit failure must not block the admin request — log and continue
      console.error("[adminGuard] audit log write failed:", err)
    }

    next()
  }
}
