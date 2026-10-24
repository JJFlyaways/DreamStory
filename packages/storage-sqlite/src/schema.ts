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
export const runStepStatuses = ['pending', 'running', 'completed', 'failed', 'unknown'] as const;
export const modelCallStatuses = [
  'reserved',
  'dispatched',
  'completed',
  'failed',
  'unknown',
] as const;
export const runArtifactKinds = [
  'proposal',
  'draft_candidate',
  'review',
  'revision_candidate',
] as const;
export const usageKinds = ['reported', 'estimated', 'unknown'] as const;
export const proposalKinds = ['plan', 'fact', 'revision'] as const;
export const proposalStatuses = ['pending', 'accepted', 'rejected', 'stale'] as const;
export const reviewFindingKinds = ['continuity', 'style', 'plot', 'fact'] as const;
export const reviewSeverities = ['info', 'minor', 'major'] as const;
export const reviewDispositions = ['open', 'accept', 'ignore', 'intentional'] as const;
export const entityKinds = ['character', 'location', 'organization', 'item', 'world'] as const;
export const factSourceKinds = ['author', 'finalization', 'import'] as const;
export const revelationVisibilities = ['author_truth', 'character_known', 'reader_known'] as const;
export const threadKinds = ['storyline', 'foreshadow'] as const;
export const threadStatuses = ['open', 'resolved', 'dropped', 'superseded'] as const;
export const threadEventKinds = ['planted', 'advanced', 'resolved', 'dropped'] as const;
export const threadEvidenceKinds = ['author', 'finalization'] as const;
export const invalidationObjectKinds = [
  'chapter_projection',
  'search_index',
  'input_snapshot',
  'run',
  'run_artifact',
  'proposal',
  'review',
  'fact',
  'fact_revelation',
  'thread_event',
] as const;
export const invalidationStatuses = ['pending', 'cleared'] as const;

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

export const entities = sqliteTable(
  'entities',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    kind: text('kind', { enum: entityKinds }).notNull(),
    name: text('name').notNull(),
    aliasesJson: text('aliases_json').notNull().default('[]'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    unique('entities_book_name_unique').on(table.bookId, table.name),
    index('entities_book_kind_idx').on(table.bookId, table.kind, table.name),
  ],
);

export const facts = sqliteTable(
  'facts',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    entityId: text('entity_id').notNull(),
    predicate: text('predicate').notNull(),
    valueJson: text('value_json').notNull(),
    validFromChapter: integer('valid_from_chapter').notNull(),
    validToChapter: integer('valid_to_chapter'),
    sourceKind: text('source_kind', { enum: factSourceKinds }).notNull(),
    sourceId: text('source_id').notNull(),
    sourceHash: text('source_hash').notNull(),
    revision: integer('revision').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    unique('facts_entity_predicate_revision_unique').on(
      table.entityId,
      table.predicate,
      table.revision,
    ),
    index('facts_book_entity_predicate_idx').on(
      table.bookId,
      table.entityId,
      table.predicate,
      table.validFromChapter,
    ),
    index('facts_book_validity_idx').on(table.bookId, table.validFromChapter, table.validToChapter),
  ],
);

export const factRevelations = sqliteTable(
  'fact_revelations',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    factId: text('fact_id').notNull(),
    chapterId: text('chapter_id').notNull(),
    sourceHash: text('source_hash').notNull(),
    textRangeJson: text('text_range_json'),
    visibility: text('visibility', { enum: revelationVisibilities }).notNull(),
    knownToEntityId: text('known_to_entity_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('fact_revelations_book_chapter_idx').on(table.bookId, table.chapterId),
    index('fact_revelations_book_visibility_idx').on(table.bookId, table.visibility),
    index('fact_revelations_fact_idx').on(table.bookId, table.factId),
  ],
);

export const storyThreads = sqliteTable(
  'story_threads',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    kind: text('kind', { enum: threadKinds }).notNull(),
    name: text('name').notNull(),
    plannedPayoff: text('planned_payoff').notNull(),
    status: text('status', { enum: threadStatuses }).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    unique('story_threads_book_name_unique').on(table.bookId, table.name),
    index('story_threads_book_status_idx').on(table.bookId, table.status, table.updatedAt),
  ],
);

export const threadEvents = sqliteTable(
  'thread_events',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    threadId: text('thread_id').notNull(),
    kind: text('kind', { enum: threadEventKinds }).notNull(),
    chapterId: text('chapter_id'),
    evidenceKind: text('evidence_kind', { enum: threadEvidenceKinds }).notNull(),
    sourceId: text('source_id').notNull(),
    sourceHash: text('source_hash').notNull(),
    textRangeJson: text('text_range_json'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('thread_events_book_thread_idx').on(table.bookId, table.threadId, table.createdAt),
    index('thread_events_book_chapter_idx').on(table.bookId, table.chapterId),
  ],
);

export const derivedInvalidations = sqliteTable(
  'derived_invalidations',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    objectKind: text('object_kind', { enum: invalidationObjectKinds }).notNull(),
    objectId: text('object_id').notNull(),
    supersededFinalizationId: text('superseded_finalization_id').notNull(),
    replacementFinalizationId: text('replacement_finalization_id').notNull(),
    oldSourceHash: text('old_source_hash').notNull(),
    newSourceHash: text('new_source_hash').notNull(),
    reason: text('reason').notNull(),
    status: text('status', { enum: invalidationStatuses }).notNull(),
    createdAt: text('created_at').notNull(),
    clearedAt: text('cleared_at'),
  },
  (table) => [
    unique('derived_invalidations_object_source_unique').on(
      table.objectKind,
      table.objectId,
      table.supersededFinalizationId,
    ),
    index('derived_invalidations_book_status_idx').on(table.bookId, table.status, table.createdAt),
  ],
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

export const runSteps = sqliteTable(
  'run_steps',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    sequence: integer('sequence').notNull(),
    name: text('name').notNull(),
    status: text('status', { enum: runStepStatuses }).notNull(),
    attempt: integer('attempt').notNull().default(0),
    inputSnapshotId: text('input_snapshot_id'),
    artifactId: text('artifact_id'),
    errorJson: text('error_json'),
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    unique('run_steps_run_sequence_unique').on(table.runId, table.sequence),
    index('run_steps_run_sequence_idx').on(table.runId, table.sequence),
  ],
);

export const runEvents = sqliteTable(
  'run_events',
  {
    runId: text('run_id').notNull(),
    sequence: integer('sequence').notNull(),
    eventType: text('event_type').notNull(),
    payloadJson: text('payload_json').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.runId, table.sequence] })],
);

export const inputSnapshots = sqliteTable('input_snapshots', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull(),
  manifestJson: text('manifest_json').notNull(),
  contextText: text('context_text').notNull(),
  sourceFingerprint: text('source_fingerprint').notNull(),
  executionFingerprint: text('execution_fingerprint').notNull(),
  promptVersion: text('prompt_version').notNull(),
  createdAt: text('created_at').notNull(),
});

export const runArtifacts = sqliteTable(
  'run_artifacts',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    kind: text('kind', { enum: runArtifactKinds }).notNull(),
    revision: integer('revision').notNull(),
    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(),
    complete: integer('complete', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('run_artifacts_run_revision_idx').on(table.runId, table.revision)],
);

export const modelCalls = sqliteTable(
  'model_calls',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    stepId: text('step_id').notNull(),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    status: text('status', { enum: modelCallStatuses }).notNull(),
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    usageKind: text('usage_kind', { enum: usageKinds }).notNull(),
    errorJson: text('error_json'),
    createdAt: text('created_at').notNull(),
    completedAt: text('completed_at'),
  },
  (table) => [index('model_calls_run_created_idx').on(table.runId, table.createdAt)],
);

export const bookLeases = sqliteTable('book_leases', {
  bookId: text('book_id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  expiresAt: text('expires_at').notNull(),
  heartbeatAt: text('heartbeat_at').notNull(),
});

export const proposals = sqliteTable(
  'proposals',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id').notNull(),
    kind: text('kind', { enum: proposalKinds }).notNull(),
    payloadJson: text('payload_json').notNull(),
    revision: integer('revision').notNull(),
    sourceFingerprint: text('source_fingerprint').notNull(),
    status: text('status', { enum: proposalStatuses }).notNull(),
    sourceRunId: text('source_run_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('proposals_book_status_idx').on(table.bookId, table.status, table.updatedAt)],
);

export const reviews = sqliteTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    chapterId: text('chapter_id').notNull(),
    draftVersionId: text('draft_version_id').notNull(),
    draftHash: text('draft_hash').notNull(),
    revision: integer('revision').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('reviews_chapter_created_idx').on(table.chapterId, table.createdAt)],
);

export const reviewFindings = sqliteTable(
  'review_findings',
  {
    id: text('id').primaryKey(),
    reviewId: text('review_id').notNull(),
    chapterId: text('chapter_id').notNull(),
    draftVersionId: text('draft_version_id').notNull(),
    draftHash: text('draft_hash').notNull(),
    revision: integer('revision').notNull(),
    kind: text('kind', { enum: reviewFindingKinds }).notNull(),
    severity: text('severity', { enum: reviewSeverities }).notNull(),
    claim: text('claim').notNull(),
    evidenceJson: text('evidence_json').notNull(),
    suggestion: text('suggestion').notNull(),
    disposition: text('disposition', { enum: reviewDispositions }).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('review_findings_review_idx').on(table.reviewId, table.revision)],
);

export const finalizations = sqliteTable(
  'finalizations',
  {
    id: text('id').primaryKey(),
    chapterId: text('chapter_id').notNull(),
    draftVersionId: text('draft_version_id').notNull(),
    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(),
    supersedesId: text('supersedes_id'),
    committedAt: text('committed_at').notNull(),
  },
  (table) => [index('finalizations_chapter_committed_idx').on(table.chapterId, table.committedAt)],
);

export const schema = {
  books,
  entities,
  facts,
  factRevelations,
  storyThreads,
  threadEvents,
  derivedInvalidations,
  planNodes,
  planNodeVersions,
  chapters,
  draftVersions,
  runSteps,
  runEvents,
  inputSnapshots,
  runArtifacts,
  modelCalls,
  bookLeases,
  proposals,
  reviews,
  reviewFindings,
  finalizations,
  commandReceipts,
  outboxJobs,
  runs,
};
