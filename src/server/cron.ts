import { sql } from "drizzle-orm"
import { type Db } from "@/db/client"

// ─── Stale lock cron ──────────────────────────────────────────────────────────
// Runs every 60 seconds. Releases producing-state projects whose lock is older
// than 5 minutes (e.g. worker crashed mid-job).

export function startStaleLockCron(db: Db): ReturnType<typeof setInterval> {
  return setInterval(async () => {
    await db.execute(sql`
      UPDATE projects
      SET status = 'strategy_ready',
          locked_at = NULL,
          locked_by = NULL
      WHERE status = 'producing'
        AND locked_at < now() - interval '5 minutes'
    `)
  }, 60_000)
}

// ─── Audit log cleanup cron ───────────────────────────────────────────────────
// Deletes audit_log rows older than 180 days.
// Runs once daily at 02:00 UTC. The first run is scheduled via a one-shot
// setTimeout; subsequent runs use a 24-hour setInterval.

export function startAuditLogCleanup(db: Db): ReturnType<typeof setTimeout> {
  async function runCleanup(): Promise<void> {
    await db.execute(sql`
      DELETE FROM audit_log
      WHERE created_at < now() - interval '180 days'
    `)
  }

  // Calculate milliseconds until next 02:00 UTC
  function msUntilNextRun(): number {
    const now = new Date()
    const next = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      2, 0, 0, 0,
    ))
    if (next.getTime() <= now.getTime()) {
      next.setUTCDate(next.getUTCDate() + 1)
    }
    return next.getTime() - now.getTime()
  }

  const initialDelay = setTimeout(() => {
    void runCleanup()
    setInterval(() => void runCleanup(), 24 * 60 * 60_000)
  }, msUntilNextRun())

  return initialDelay
}
