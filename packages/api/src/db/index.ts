import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// ── Schema Imports ────────────────────────────────────────
import * as usersSchema from './schema/users.js';
import * as subscriptionsSchema from './schema/subscriptions.js';
import * as projectsSchema from './schema/projects.js';
import * as servicesSchema from './schema/services.js';
import * as assetsSchema from './schema/assets.js';
import * as restaurantSchema from './schema/restaurant.js';
import * as recommendationsSchema from './schema/recommendations.js';
import * as adminSchema from './schema/admin.js';

// ── Merge All Schemas ─────────────────────────────────────
const schema = {
  ...usersSchema,
  ...subscriptionsSchema,
  ...projectsSchema,
  ...servicesSchema,
  ...assetsSchema,
  ...restaurantSchema,
  ...recommendationsSchema,
  ...adminSchema,
};

// ── Connection Pool ───────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                      // maximum connections
  idleTimeoutMillis: 30_000,    // close idle connections after 30s
  connectionTimeoutMillis: 5_000, // fail connection after 5s
});

// ── Log pool errors ───────────────────────────────────────
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// ── Drizzle Instance ──────────────────────────────────────
export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });

// ── Type Export ────────────────────────────────────────────
export type DB = typeof db;

// ── Health Check ──────────────────────────────────────────
export async function checkDatabaseHealth(): Promise<{
  status: 'connected' | 'error';
  latencyMs: number;
  message?: string;
}> {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return {
      status: 'connected',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ── Graceful Shutdown ─────────────────────────────────────
export async function closeDatabase(): Promise<void> {
  await pool.end();
}

// ── Re-export all schemas for convenience ─────────────────
export { schema };
export * from './schema/users.js';
export * from './schema/subscriptions.js';
export * from './schema/projects.js';
export * from './schema/services.js';
export * from './schema/assets.js';
export * from './schema/restaurant.js';
export * from './schema/recommendations.js';
export * from './schema/admin.js';
