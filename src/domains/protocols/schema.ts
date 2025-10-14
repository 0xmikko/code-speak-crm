import {
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const protocols = pgTable('protocols', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').unique().notNull(),
  logoUrl: text('logo_url'),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const protocolContacts = pgTable('protocol_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  protocolId: uuid('protocol_id')
    .references(() => protocols.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  role: text('role'),
  phone: text('phone'),
  telegram: text('telegram'),
  github: text('github'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});