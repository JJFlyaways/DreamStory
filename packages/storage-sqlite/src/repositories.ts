import {
  parseClientRequestId,
  parseContentHash,
  parseStableId,
  parseUtcDateTime,
} from '@dreamstory/contracts';
import type { ClientRequestId, IsoUtcDateTime, StableId } from '@dreamstory/contracts';
import type {
  BookChanges,
  BookRecord,
  BookRepository,
  ChapterRecord,
  ChapterRepository,
  CommandReceiptRecord,
  CommandReceiptRepository,
  DraftRepository,
  DraftSaveInput,
  DraftSaveResult,
  DraftVersionRecord,
  OutboxJobRecord,
  OutboxJobRepository,
  PlanNodeRecord,
  PlanNodeSaveResult,
  PlanRepository,
  RepositorySet,
  RunRecord,
  RunRepository,
} from '@dreamstory/application';
import { and, asc, desc, eq } from 'drizzle-orm';

import type { StoryDatabase } from './drizzle.js';
import {
  books,
  chapters,
  commandReceipts,
  draftVersions,
  outboxJobs,
  planNodeVersions,
  planNodes,
  runs,
} from './schema.js';

export function createSqliteRepositories(database: StoryDatabase): RepositorySet {
  return {
    books: new SqliteBookRepository(database),
    plans: new SqlitePlanRepository(database),
    chapters: new SqliteChapterRepository(database),
    drafts: new SqliteDraftRepository(database),
    commandReceipts: new SqliteCommandReceiptRepository(database),
    outboxJobs: new SqliteOutboxJobRepository(database),
    runs: new SqliteRunRepository(database),
  };
}

export class SqliteBookRepository implements BookRepository {
  constructor(private readonly database: StoryDatabase) {}

  async create(book: BookRecord): Promise<void> {
    this.database
      .insert(books)
      .values({
        id: book.id,
        title: book.title,
        language: book.language,
        genre: book.genre,
        premise: book.premise,
        conventionsJson: stringifyJson(book.conventions),
        bookRevision: book.bookRevision,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      })
      .run();
  }

  async get(id: StableId): Promise<BookRecord | null> {
    const row = this.database.select().from(books).where(eq(books.id, id)).get();
    return row === undefined ? null : mapBook(row);
  }

  async updateIfRevisionMatches(
    id: StableId,
    expectedBookRevision: BookRecord['bookRevision'],
    changes: BookChanges,
    updatedAt: BookRecord['updatedAt'],
  ): Promise<BookRecord | null> {
    const values: {
      title?: string;
      language?: string;
      genre?: string;
      premise?: string;
      conventionsJson?: string;
      bookRevision: number;
      updatedAt: string;
    } = {
      bookRevision: expectedBookRevision + 1,
      updatedAt,
    };

    if (changes.title !== undefined) values.title = changes.title;
    if (changes.language !== undefined) values.language = changes.language;
    if (changes.genre !== undefined) values.genre = changes.genre;
    if (changes.premise !== undefined) values.premise = changes.premise;
    if (changes.conventions !== undefined) {
      values.conventionsJson = stringifyJson(changes.conventions);
    }

    const result = this.database
      .update(books)
      .set(values)
      .where(and(eq(books.id, id), eq(books.bookRevision, expectedBookRevision)))
      .run();

    if (result.changes !== 1) {
      return null;
    }

    return this.get(id);
  }
}

export class SqlitePlanRepository implements PlanRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: StableId, id: StableId): Promise<PlanNodeRecord | null> {
    const row = this.database
      .select()
      .from(planNodes)
      .where(and(eq(planNodes.bookId, bookId), eq(planNodes.id, id)))
      .get();
    return row === undefined ? null : mapPlanNode(row);
  }

  async list(bookId: StableId, includeSuperseded = false): Promise<readonly PlanNodeRecord[]> {
    const where = includeSuperseded
      ? eq(planNodes.bookId, bookId)
      : and(eq(planNodes.bookId, bookId), eq(planNodes.status, 'confirmed'));
    return this.database
      .select()
      .from(planNodes)
      .where(where)
      .orderBy(asc(planNodes.sortKey), asc(planNodes.id))
      .all()
      .map(mapPlanNode);
  }

  async history(bookId: StableId, id: StableId): Promise<readonly PlanNodeRecord[]> {
    return this.database
      .select()
      .from(planNodeVersions)
      .where(and(eq(planNodeVersions.bookId, bookId), eq(planNodeVersions.planId, id)))
      .orderBy(asc(planNodeVersions.version))
      .all()
      .map(mapPlanNodeVersion);
  }

  async save(
    node: Omit<PlanNodeRecord, 'version'>,
    expectedBookRevision: PlanNodeRecord['version'],
  ): Promise<PlanNodeSaveResult | null> {
    return this.database.transaction((tx) => {
      const book = tx.select().from(books).where(eq(books.id, node.bookId)).get();
      if (book === undefined || book.bookRevision !== expectedBookRevision) {
        return null;
      }

      const current = tx
        .select()
        .from(planNodes)
        .where(and(eq(planNodes.bookId, node.bookId), eq(planNodes.id, node.id)))
        .get();
      const version = current === undefined ? 1 : current.version + 1;
      const bookRevision = expectedBookRevision + 1;

      tx.update(books)
        .set({ bookRevision, updatedAt: node.updatedAt })
        .where(and(eq(books.id, node.bookId), eq(books.bookRevision, expectedBookRevision)))
        .run();

      const values = {
        id: node.id,
        bookId: node.bookId,
        parentId: node.parentId,
        kind: node.kind,
        sortKey: node.sortKey,
        contentJson: stringifyJson(node.content),
        version,
        status: node.status,
        createdAt: current?.createdAt ?? node.createdAt,
        updatedAt: node.updatedAt,
      };
      if (current === undefined) {
        tx.insert(planNodes).values(values).run();
      } else {
        tx.update(planNodes)
          .set({
            parentId: values.parentId,
            kind: values.kind,
            sortKey: values.sortKey,
            contentJson: values.contentJson,
            version: values.version,
            status: values.status,
            updatedAt: values.updatedAt,
          })
          .where(and(eq(planNodes.bookId, node.bookId), eq(planNodes.id, node.id)))
          .run();
      }

      tx.insert(planNodeVersions)
        .values({
          planId: node.id,
          version,
          bookId: node.bookId,
          parentId: values.parentId,
          kind: values.kind,
          sortKey: values.sortKey,
          contentJson: values.contentJson,
          status: values.status,
          createdAt: values.createdAt,
          updatedAt: values.updatedAt,
        })
        .run();

      const saved = tx
        .select()
        .from(planNodes)
        .where(and(eq(planNodes.bookId, node.bookId), eq(planNodes.id, node.id)))
        .get();
      if (saved === undefined) {
        throw new Error('Plan node was not saved.');
      }

      return { node: mapPlanNode(saved), bookRevision };
    });
  }
}

export class SqliteChapterRepository implements ChapterRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: StableId, id: StableId): Promise<ChapterRecord | null> {
    const row = this.database
      .select()
      .from(chapters)
      .where(and(eq(chapters.bookId, bookId), eq(chapters.id, id)))
      .get();
    return row === undefined ? null : mapChapter(row);
  }

  async list(bookId: StableId): Promise<readonly ChapterRecord[]> {
    return this.database
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookId))
      .orderBy(asc(chapters.chapterNumber))
      .all()
      .map(mapChapter);
  }

  async create(
    chapter: ChapterRecord,
    expectedBookRevision: ChapterRecord['chapterNumber'],
  ): Promise<{ chapter: ChapterRecord; bookRevision: number } | null> {
    return this.database.transaction((tx) => {
      const book = tx.select().from(books).where(eq(books.id, chapter.bookId)).get();
      if (book === undefined || book.bookRevision !== expectedBookRevision) {
        return null;
      }

      const bookRevision = expectedBookRevision + 1;
      tx.update(books)
        .set({ bookRevision, updatedAt: chapter.updatedAt })
        .where(and(eq(books.id, chapter.bookId), eq(books.bookRevision, expectedBookRevision)))
        .run();
      tx.insert(chapters)
        .values({
          id: chapter.id,
          bookId: chapter.bookId,
          chapterNumber: chapter.chapterNumber,
          displayTitle: chapter.displayTitle,
          planNodeId: chapter.planNodeId,
          currentDraftId: chapter.currentDraftId,
          currentFinalizationId: chapter.currentFinalizationId,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        })
        .run();

      return { chapter, bookRevision };
    });
  }
}

export class SqliteDraftRepository implements DraftRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(id: StableId): Promise<DraftVersionRecord | null> {
    const row = this.database.select().from(draftVersions).where(eq(draftVersions.id, id)).get();
    return row === undefined ? null : mapDraft(row);
  }

  async list(chapterId: StableId): Promise<readonly DraftVersionRecord[]> {
    return this.database
      .select()
      .from(draftVersions)
      .where(eq(draftVersions.chapterId, chapterId))
      .orderBy(desc(draftVersions.revision))
      .all()
      .map(mapDraft);
  }

  async current(chapterId: StableId): Promise<DraftVersionRecord | null> {
    const chapter = this.database.select().from(chapters).where(eq(chapters.id, chapterId)).get();
    if (chapter?.currentDraftId === null || chapter?.currentDraftId === undefined) {
      return null;
    }
    return this.get(parseStableId(chapter.currentDraftId));
  }

  async save(
    input: DraftSaveInput,
    expectedDraftRevision: number,
  ): Promise<DraftSaveResult | null> {
    return this.database.transaction((tx) => {
      const chapter = tx.select().from(chapters).where(eq(chapters.id, input.chapterId)).get();
      if (chapter === undefined) {
        return null;
      }

      const current =
        chapter.currentDraftId === null
          ? undefined
          : tx
              .select()
              .from(draftVersions)
              .where(eq(draftVersions.id, chapter.currentDraftId))
              .get();
      const currentRevision = current?.revision ?? 0;
      if (currentRevision !== expectedDraftRevision) {
        return null;
      }

      const draft = {
        id: input.id,
        chapterId: input.chapterId,
        parentId: current?.id ?? null,
        revision: currentRevision + 1,
        content: input.content,
        complete: input.complete,
        sourceRunId: input.sourceRunId,
        createdBy: input.createdBy,
        createdAt: input.createdAt,
      };
      tx.insert(draftVersions).values(draft).run();
      tx.update(chapters)
        .set({ currentDraftId: input.id, updatedAt: input.createdAt })
        .where(eq(chapters.id, input.chapterId))
        .run();

      return {
        draft: mapDraft(draft),
        draftRevision: draft.revision,
      };
    });
  }
}

export class SqliteCommandReceiptRepository implements CommandReceiptRepository {
  constructor(private readonly database: StoryDatabase) {}

  async find(
    bookId: StableId,
    commandKind: string,
    clientRequestId: ClientRequestId,
  ): Promise<CommandReceiptRecord | null> {
    const row = this.database
      .select()
      .from(commandReceipts)
      .where(
        and(
          eq(commandReceipts.bookId, bookId),
          eq(commandReceipts.commandKind, commandKind),
          eq(commandReceipts.clientRequestId, clientRequestId),
        ),
      )
      .get();

    return row === undefined ? null : mapCommandReceipt(row);
  }

  async save(receipt: CommandReceiptRecord): Promise<void> {
    this.database
      .insert(commandReceipts)
      .values({
        bookId: receipt.bookId,
        commandKind: receipt.commandKind,
        clientRequestId: receipt.clientRequestId,
        resultJson: stringifyJson(receipt.result),
        createdAt: receipt.createdAt,
      })
      .onConflictDoNothing()
      .run();
  }
}

export class SqliteOutboxJobRepository implements OutboxJobRepository {
  constructor(private readonly database: StoryDatabase) {}

  async enqueue(job: OutboxJobRecord): Promise<void> {
    this.database
      .insert(outboxJobs)
      .values({
        id: job.id,
        kind: job.kind,
        sourceId: job.sourceId,
        sourceHash: job.sourceHash,
        status: job.status,
        attempts: job.attempts,
        lastError: job.lastError,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })
      .run();
  }

  async listPending(limit: number): Promise<readonly OutboxJobRecord[]> {
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      throw new Error('Outbox list limit must be a positive integer.');
    }

    const rows = this.database
      .select()
      .from(outboxJobs)
      .where(eq(outboxJobs.status, 'pending'))
      .orderBy(asc(outboxJobs.createdAt))
      .limit(limit)
      .all();

    return rows.map(mapOutboxJob);
  }

  async markProcessing(id: StableId): Promise<void> {
    const row = this.database.select().from(outboxJobs).where(eq(outboxJobs.id, id)).get();
    if (row === undefined) {
      throw new Error(`Outbox job not found: ${id}`);
    }

    this.database
      .update(outboxJobs)
      .set({ status: 'processing', attempts: row.attempts + 1, updatedAt: utcNow() })
      .where(eq(outboxJobs.id, id))
      .run();
  }

  async markCompleted(id: StableId): Promise<void> {
    this.database
      .update(outboxJobs)
      .set({ status: 'completed', updatedAt: utcNow(), lastError: null })
      .where(eq(outboxJobs.id, id))
      .run();
  }

  async markFailed(id: StableId, error: string): Promise<void> {
    this.database
      .update(outboxJobs)
      .set({ status: 'failed', updatedAt: utcNow(), lastError: error })
      .where(eq(outboxJobs.id, id))
      .run();
  }
}

export class SqliteRunRepository implements RunRepository {
  constructor(private readonly database: StoryDatabase) {}

  async create(run: RunRecord): Promise<void> {
    this.database
      .insert(runs)
      .values({
        id: run.id,
        bookId: run.bookId,
        intent: run.intent,
        scopeJson: stringifyJson(run.scope),
        status: run.status,
        inputSnapshotId: run.inputSnapshotId,
        leaseJson: stringifyNullableJson(run.lease),
        attempt: run.attempt,
        errorJson: stringifyNullableJson(run.error),
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
      })
      .run();
  }

  async get(id: StableId): Promise<RunRecord | null> {
    const row = this.database.select().from(runs).where(eq(runs.id, id)).get();
    return row === undefined ? null : mapRun(row);
  }

  async updateStatus(id: StableId, status: RunRecord['status'], error?: unknown): Promise<void> {
    this.database
      .update(runs)
      .set({
        status,
        errorJson: error === undefined ? null : stringifyNullableJson(error),
        updatedAt: utcNow(),
      })
      .where(eq(runs.id, id))
      .run();
  }
}

function mapCommandReceipt(row: typeof commandReceipts.$inferSelect): CommandReceiptRecord {
  return {
    bookId: parseStableId(row.bookId),
    commandKind: row.commandKind,
    clientRequestId: parseClientRequestId(row.clientRequestId),
    result: parseJson(row.resultJson),
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapBook(row: typeof books.$inferSelect): BookRecord {
  return {
    id: parseStableId(row.id),
    title: row.title,
    language: row.language,
    genre: row.genre,
    premise: row.premise,
    conventions: parseJsonObject(row.conventionsJson),
    bookRevision: row.bookRevision,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapPlanNode(row: typeof planNodes.$inferSelect): PlanNodeRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    parentId: row.parentId === null ? null : parseStableId(row.parentId),
    kind: row.kind,
    sortKey: row.sortKey,
    content: parseJsonObject(row.contentJson) as unknown as PlanNodeRecord['content'],
    version: row.version,
    status: row.status,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapPlanNodeVersion(row: typeof planNodeVersions.$inferSelect): PlanNodeRecord {
  return {
    id: parseStableId(row.planId),
    bookId: parseStableId(row.bookId),
    parentId: row.parentId === null ? null : parseStableId(row.parentId),
    kind: row.kind,
    sortKey: row.sortKey,
    content: parseJsonObject(row.contentJson) as unknown as PlanNodeRecord['content'],
    version: row.version,
    status: row.status,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapChapter(row: typeof chapters.$inferSelect): ChapterRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    chapterNumber: row.chapterNumber,
    displayTitle: row.displayTitle,
    planNodeId: parseStableId(row.planNodeId),
    currentDraftId: row.currentDraftId === null ? null : parseStableId(row.currentDraftId),
    currentFinalizationId:
      row.currentFinalizationId === null ? null : parseStableId(row.currentFinalizationId),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapDraft(row: typeof draftVersions.$inferSelect): DraftVersionRecord {
  return {
    id: parseStableId(row.id),
    chapterId: parseStableId(row.chapterId),
    parentId: row.parentId === null ? null : parseStableId(row.parentId),
    revision: row.revision,
    content: row.content,
    complete: row.complete,
    sourceRunId: row.sourceRunId === null ? null : parseStableId(row.sourceRunId),
    createdBy: row.createdBy,
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapOutboxJob(row: typeof outboxJobs.$inferSelect): OutboxJobRecord {
  return {
    id: parseStableId(row.id),
    kind: row.kind,
    sourceId: parseStableId(row.sourceId),
    sourceHash: row.sourceHash === null ? null : parseContentHash(row.sourceHash),
    status: row.status,
    attempts: row.attempts,
    lastError: row.lastError,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapRun(row: typeof runs.$inferSelect): RunRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    intent: row.intent,
    scope: parseJson(row.scopeJson),
    status: row.status,
    inputSnapshotId: row.inputSnapshotId === null ? null : parseStableId(row.inputSnapshotId),
    lease: parseNullableJson(row.leaseJson),
    attempt: row.attempt,
    error: parseNullableJson(row.errorJson),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value) ?? 'null';
}

function stringifyNullableJson(value: unknown | null): string | null {
  return value === null ? null : stringifyJson(value);
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = parseJson(value);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Expected a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

function parseNullableJson(value: string | null): unknown | null {
  return value === null ? null : parseJson(value);
}

function utcNow(): IsoUtcDateTime {
  return parseUtcDateTime(new Date().toISOString());
}
