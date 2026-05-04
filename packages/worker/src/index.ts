import { createAllWorkers } from "./workers/ai-worker.js"
import { redis } from "./db/redis.js"

// ─── Stale lock cron ──────────────────────────────────────────────────────────
// Runs every 60s: unlock projects stuck in "producing" > 5 minutes

import { db } from "./db/client.js"
import { projects } from "@cezar12/shared"
import { eq, and, lt, sql } from "drizzle-orm"

function startStaleLockCron() {
  const run = async () => {
    try {
      await db
        .update(projects)
        .set({
          status: "strategy_ready",
          lockedAt: null,
          lockedBy: null,
        })
        .where(
          and(
            eq(projects.status, "producing"),
            lt(projects.lockedAt!, sql`now() - interval '5 minutes'`),
          ),
        )
    } catch (err) {
      console.error("[cron:stale-lock]", err)
    }
  }

  setInterval(run, 60_000)
  console.log("[cron] stale-lock cleanup started (60s interval)")
}

// ─── Audit log cleanup cron ───────────────────────────────────────────────────
// Runs daily at 02:00 UTC: delete audit_log rows older than 180 days

import { auditLog } from "@cezar12/shared"

function startAuditLogCleanup() {
  const run = async () => {
    try {
      const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      const deleted = await db
        .delete(auditLog)
        .where(lt(auditLog.createdAt, cutoff))
        .returning({ id: auditLog.id })
      if (deleted.length > 0) {
        console.log(`[cron:audit-cleanup] deleted ${deleted.length} rows older than 180 days`)
      }
    } catch (err) {
      console.error("[cron:audit-cleanup]", err)
    }
  }

  // Schedule next 02:00 UTC
  const now = new Date()
  const next2am = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 2, 0, 0))
  const msUntil2am = next2am.getTime() - Date.now()

  setTimeout(() => {
    run()
    setInterval(run, 24 * 60 * 60 * 1000)
  }, msUntil2am)

  console.log(`[cron] audit-log cleanup scheduled (next run in ${Math.round(msUntil2am / 3600_000)}h)`)
}

// ─── Startup ──────────────────────────────────────────────────────────────────

const workers = createAllWorkers()
startStaleLockCron()
startAuditLogCleanup()

console.log(`[worker] ${workers.length} queues active`)

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown() {
  console.log("[worker] shutting down…")
  await Promise.all(workers.map((w) => w.close()))
  await redis.quit()
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
