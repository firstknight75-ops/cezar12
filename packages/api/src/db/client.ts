import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@cezar12/shared/db/schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required")
}

// Disable prefetch for Supabase transaction pooler (port 6543).
// Use direct connection (port 5432) for transactions.
const client = postgres(process.env.DATABASE_URL, { prepare: false })

export const db = drizzle(client, { schema })
export type Db = typeof db
