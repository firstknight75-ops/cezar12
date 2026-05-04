import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigrations(): Promise<void> {
  console.log('[Migrate] Starting database migrations...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  const db = drizzle(pool);

  try {
    await migrate(db, {
      migrationsFolder: './src/db/migrations',
    });
    console.log('[Migrate] ✅ Migrations completed successfully');
  } catch (error) {
    console.error('[Migrate] ❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
