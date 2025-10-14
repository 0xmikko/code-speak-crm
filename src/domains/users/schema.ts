import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  image: text('image'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  isValidUser: boolean('is_valid_user').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});