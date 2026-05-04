import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './packages/api/src/db/schema',
  out: './packages/api/src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;