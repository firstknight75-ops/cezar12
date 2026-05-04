-- Cezar 12 — PostgreSQL initialisation
-- Runs once when the container is first created.
-- Actual schema migrations are managed by drizzle-kit.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for future full-text search on company names

-- Ensure the default database exists (it's created by POSTGRES_DB env var,
-- but this guard prevents errors if the script runs again).
SELECT 1;
