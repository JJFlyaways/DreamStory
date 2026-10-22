import { index, integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

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
export const planNodeKinds = ['book', 'volume', 'arc', 'chapter'] as const;
export const planNodeStatuses = ['confirmed', 'superseded'] as const;
export const draftCreatedByValues = ['author', 'restore', 'import', 'agent'] as const;

export const books = sqliteTable(
  'books',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    language: text('language').notNull(),
    genre: text('genre').notNull(),
    premise: text('premise').notNull(),
    conventionsJson: text('conventions_json').notNull().default('{}'),
    bookRevision: integer('book_revision').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('books_updated_at_idx').on(table.updatedAt)],
);

export const planNodes = sqliteTable(
  'plan_nodes',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    parentId: text('parent_id'),
    kind: text('kind', { enum: planNodeKinds }).notNull(),
    sortKey: text('sort_key').notNull(),
    contentJson: text('content_json').notNull(),
    version: integer('version').notNull().default(1),
    status: text('status', { enum: planNodeStatuses }).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('plan_nodes_book_sort_idx').on(table.bookId, table.sortKey, table.id),
    index('plan_nodes_parent_idx').on(table.bookId, table.parentId, table.sortKey),
  ],
);

export const planNodeVersions = sqliteTable(
  'plan_node_versions',
  {
    planId: text('plan_id').notNull(),
    version: integer('version').notNull(),
    bookId: text('book_id').notNull(),
    parentId: text('parent_id'),
    kind: text('kind', { enum: planNodeKinds }).notNull(),
    sortKey: text('sort_key').notNull(),
    contentJson: text('content_json').notNull(),
    status: text('status', { enum: planNodeStatuses }).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.planId, table.version] }),
    index('plan_node_versions_book_plan_idx').on(table.bookId, table.planId, table.version),
  ],
);

export const chapters = sqliteTable(
  'chapters',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    chapterNumber: integer('chapter_number').notNull(),
    displayTitle: text('display_title').notNull(),
    planNodeId: text('plan_node_id').notNull(),
    currentDraftId: text('current_draft_id'),
    currentFinalizationId: text('current_finalization_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    unique('chapters_book_number_unique').on(table.bookId, table.chapterNumber),
    index('chapters_book_number_idx').on(table.bookId, table.chapterNumber),
  ],
);

export const draftVersions = sqliteTable(
  'draft_versions',
  {
    id: text('id').primaryKey(),
    chapterId: text('chapter_id').notNull(),
    parentId: text('parent_id'),
    revision: integer('revision').notNull(),
    content: text('content').notNull(),
    complete: integer('complete', { mode: 'boolean' }).notNull(),
    sourceRunId: text('source_run_id'),
    createdBy: text('created_by', { enum: draftCreatedByValues }).notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    unique('draft_versions_chapter_revision_unique').on(table.chapterId, table.revision),
    index('draft_versions_chapter_revision_idx').on(table.chapterId, table.revision),
  ],
);

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
  books,
  planNodes,
  planNodeVersions,
  chapters,
  draftVersions,
  commandReceipts,
  outboxJobs,
  runs,
};
