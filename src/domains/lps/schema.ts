import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
} from 'drizzle-orm/pg-core';
import { lpStatusEnum } from '@/lib/db-types';

export const lps = pgTable('lps', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  contactEmail: text('contact_email'),
  status: text('status', { enum: lpStatusEnum }).default('unknown').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lpContacts = pgTable('lp_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  lpId: uuid('lp_id')
    .references(() => lps.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  role: text('role'),
  phone: text('phone'),
  telegram: text('telegram'),
  github: text('github'),
  avatarUrl: text('avatar_url'),
});

export const lpChainAddresses = pgTable('lp_chain_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  lpId: uuid('lp_id')
    .references(() => lps.id, { onDelete: 'cascade' })
    .notNull(),
  chainId: integer('chain_id').notNull(),
  address: text('address').notNull(),
  label: text('label'),
});