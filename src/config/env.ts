import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  AUTH_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(1).optional(),
});

// During build time, we might not have all env vars, so provide defaults
const processedEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy',
  AUTH_SECRET: process.env.AUTH_SECRET || 'dummy-secret-for-build',
};

export const env = envSchema.parse(processedEnv);

export type Env = z.infer<typeof envSchema>;