import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const runIntents = [
  'plan_book',
  'plan_volume',
  'plan_arc',
  'plan_chapter',
  'draft_chapter',
  'review_chapter',
  'revise_chapter',
] as const;

export const runStatuses = [
  'queued',
  'running',
  'awaiting_author',
  'paused',
  'completed',
  'failed',
  'cancelled',
  'stale',
] as const;

export const outboxJobStatuses = ['pending', 'processing', 'completed', 'failed'] as const;

export const commandReceipts = sqliteTable(
  'command_receipts',
  {
    bookId: text('book_id').notNull(),
    commandKind: text('command_kind').notNull(),
    clientRequestId: text('client_request_id').notNull(),
    resultJson: text('result_json').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.bookId, table.commandKind, table.clientRequestId] })],
);

export const outboxJobs = sqliteTable(
  'outbox_jobs',
  {
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    sourceId: text('source_id').notNull(),
    sourceHash: text('source_hash'),
    status: text('status', { enum: outboxJobStatuses }).notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('outbox_jobs_status_created_at_idx').on(table.status, table.createdAt)],
);

export const runs = sqliteTable(
  'runs',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    intent: text('intent', { enum: runIntents }).notNull(),
    scopeJson: text('scope_json').notNull(),
    status: text('status', { enum: runStatuses }).notNull().default('queued'),
    inputSnapshotId: text('input_snapshot_id'),
    leaseJson: text('lease_json'),
    attempt: integer('attempt').notNull().default(0),
    errorJson: text('error_json'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('runs_book_status_idx').on(table.bookId, table.status)],
);

export const schema = {
  commandReceipts,
  outboxJobs,
  runs,
};
