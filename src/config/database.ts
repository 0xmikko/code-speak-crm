import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

// Import all schemas
import * as authSchema from '@/domains/auth/schema';
import * as usersSchema from '@/domains/users/schema';
import * as curatorsSchema from '@/domains/curators/schema';
import * as assetsSchema from '@/domains/assets/schema';
import * as protocolsSchema from '@/domains/protocols/schema';
import * as lpsSchema from '@/domains/lps/schema';

const schema = {
  ...authSchema,
  ...usersSchema,
  ...curatorsSchema,
  ...assetsSchema,
  ...protocolsSchema,
  ...lpsSchema,
};

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });