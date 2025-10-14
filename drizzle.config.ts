import type { Config } from 'drizzle-kit';
import { env } from '@/config/env';

export default {
  schema: [
    './src/domains/auth/schema.ts',
    './src/domains/users/schema.ts',
    './src/domains/curators/schema.ts',
    './src/domains/assets/schema.ts',
    './src/domains/protocols/schema.ts',
    './src/domains/lps/schema.ts',
  ],
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config;