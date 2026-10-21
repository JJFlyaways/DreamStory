import {
  parseClientRequestId,
  parseContentHash,
  parseStableId,
  parseUtcDateTime,
} from '@dreamstory/contracts';
import type { ClientRequestId, IsoUtcDateTime, StableId } from '@dreamstory/contracts';
import type {
  BookRecord,
  BookRepository,
  CommandReceiptRecord,
  CommandReceiptRepository,
  OutboxJobRecord,
  OutboxJobRepository,
  RepositorySet,
  RunRecord,
  RunRepository,
} from '@dreamstory/application';
import { and, asc, eq } from 'drizzle-orm';

import type { StoryDatabase } from './drizzle.js';
import { books, commandReceipts, outboxJobs, runs } from './schema.js';

export function createSqliteRepositories(database: StoryDatabase): RepositorySet {
  return {
    books: new SqliteBookRepository(database),
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
    changes: Parameters<BookRepository['updateIfRevisionMatches']>[2],
    updatedAt: BookRecord['updatedAt'],
  ): Promise<BookRecord | null> {
    const values: {
      title?: string;
      language?: string;
      genre?: string;
      premise?: string;
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
    bookRevision: row.bookRevision,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
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

function parseNullableJson(value: string | null): unknown | null {
  return value === null ? null : parseJson(value);
}

function utcNow(): IsoUtcDateTime {
  return parseUtcDateTime(new Date().toISOString());
}
