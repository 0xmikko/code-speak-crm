import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { assetStageEnum, assetSourceEnum, buildStatusEnum } from '@/lib/db-types';
import { users } from '@/domains/users/schema';
import { protocols } from '@/domains/protocols/schema';
import { curators } from '@/domains/curators/schema';

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  assetSymbol: text('asset_symbol').notNull(),
  assetAddress: text('asset_address').notNull(),
  chainId: integer('chain_id').notNull(),
  protocolId: uuid('protocol_id').references(() => protocols.id),
  source: text('source', { enum: assetSourceEnum }).notNull(),
  currentStage: text('current_stage', { enum: assetStageEnum }).default('request').notNull(),
  ownerUserId: uuid('owner_user_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const assetStageTransitions = pgTable('asset_stage_transitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assetId: uuid('asset_id')
    .references(() => assets.id, { onDelete: 'cascade' })
    .notNull(),
  fromStage: text('from_stage', { enum: assetStageEnum }).notNull(),
  toStage: text('to_stage', { enum: assetStageEnum }).notNull(),
  movedByUserId: uuid('moved_by_user_id')
    .references(() => users.id)
    .notNull(),
  movedAt: timestamp('moved_at', { withTimezone: true }).defaultNow().notNull(),
});

export const assetRequestFields = pgTable('asset_request_fields', {
  assetId: uuid('asset_id')
    .references(() => assets.id, { onDelete: 'cascade' })
    .primaryKey(),
  assetSymbol: text('asset_symbol').notNull(),
  assetAddress: text('asset_address').notNull(),
  chainId: integer('chain_id').notNull(),
  protocolId: uuid('protocol_id').references(() => protocols.id),
  source: text('source', { enum: assetSourceEnum }).notNull(),
});

export const assetBusinessDD = pgTable('asset_business_dd', {
  assetId: uuid('asset_id')
    .references(() => assets.id, { onDelete: 'cascade' })
    .primaryKey(),
  interestedCuratorIds: uuid('interested_curator_ids').array(),
  notes: text('notes'),
});

export const assetTechDD = pgTable('asset_tech_dd', {
  assetId: uuid('asset_id')
    .references(() => assets.id, { onDelete: 'cascade' })
    .primaryKey(),
  priceOracleNeeded: boolean('price_oracle_needed').default(false).notNull(),
  adapterNeeded: boolean('adapter_needed').default(false).notNull(),
  phantomTokenNeeded: boolean('phantom_token_needed').default(false).notNull(),
  developerUserId: uuid('developer_user_id').references(() => users.id),
  auditEta: timestamp('audit_eta', { withTimezone: true }),
});

export const assetIntegrationBuild = pgTable('asset_integration_build', {
  assetId: uuid('asset_id')
    .references(() => assets.id, { onDelete: 'cascade' })
    .primaryKey(),
  buildStatus: text('build_status', { enum: buildStatusEnum }).default('not_started').notNull(),
  aiAuditStatus: text('ai_audit_status', { enum: buildStatusEnum }).default('not_started').notNull(),
  internalAuditStatus: text('internal_audit_status', { enum: buildStatusEnum }).default('not_started').notNull(),
});