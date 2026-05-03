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
