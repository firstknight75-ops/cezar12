import { defineConfig } from "drizzle-kit"
import 'dotenv/config';

export default defineConfig({
  schema: "./packages/shared/src/db/schema.ts",
  out: "./packages/api/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://cezar12:dev_password_change_in_prod@localhost:5432/cezar12_dev',
  },
  verbose: true,
  strict: true,
})
