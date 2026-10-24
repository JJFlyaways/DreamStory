import { createHash } from 'node:crypto';

import {
  parseContentHash,
  type BookRevision,
  type ClientRequestId,
  type IsoUtcDateTime,
  type StableId,
  type StoryThreadRecord,
  type TextRange,
  type ThreadEventRecord,
} from '@dreamstory/contracts';

import type {
  CommandReceiptRepository,
  FinalizationRepository,
  RepositorySet,
  ThreadRepository,
} from './repositories.js';

const CREATE_THREAD_COMMAND = 'create_story_thread';
const APPEND_THREAD_EVENT_COMMAND = 'append_thread_event';

export interface CreateThreadCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  thread: Omit<StoryThreadRecord, 'createdAt' | 'updatedAt'>;
  now: IsoUtcDateTime;
}

export interface AppendThreadEventCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  event: Omit<ThreadEventRecord, 'createdAt' | 'updatedAt'>;
  now: IsoUtcDateTime;
}

export interface ThreadWriteResult<T> {
  value: T;
  bookRevision: BookRevision;
  replayed: boolean;
}

export class ThreadCommandError extends Error {
  readonly code: 'NOT_FOUND' | 'REVISION_CONFLICT' | 'VALIDATION_ERROR' | 'ALREADY_EXISTS';

  constructor(
    code: ThreadCommandError['code'],
    message: string,
  ) {
    super(message);
    this.name = 'ThreadCommandError';
    this.code = code;
  }
}

export class ThreadService {
  private readonly threads: ThreadRepository;

  private readonly finalizations: FinalizationRepository;

  private readonly receipts: CommandReceiptRepository;

  constructor(
    repositories: Pick<RepositorySet, 'threads' | 'finalizations' | 'commandReceipts'>,
  ) {
    this.threads = repositories.threads;
    this.finalizations = repositories.finalizations;
    this.receipts = repositories.commandReceipts;
  }

  async create(command: CreateThreadCommand): Promise<ThreadWriteResult<StoryThreadRecord>> {
    const replay = await this.receipts.find(
      command.bookId,
      CREATE_THREAD_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) return parseThreadWriteResult<StoryThreadRecord>(replay.result, true);

    const thread = normalizeThread(command.thread);
    const existing = (await this.threads.list(command.bookId)).find(
      (candidate) => candidate.name === thread.name,
    );
    if (existing !== undefined) {
      throw new ThreadCommandError('ALREADY_EXISTS', 'A story thread with this name exists.');
    }
    const saved = await this.threads.create(
      { ...thread, createdAt: command.now, updatedAt: command.now },
      command.expectedBookRevision,
    );
    if (saved === null) {
      throw new ThreadCommandError('REVISION_CONFLICT', 'The book revision has changed.');
    }
    const result = { value: saved.thread, bookRevision: saved.bookRevision, replayed: false };
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: CREATE_THREAD_COMMAND,
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.now,
    });
    return result;
  }

  async appendEvent(command: AppendThreadEventCommand): Promise<ThreadWriteResult<ThreadEventRecord>> {
    const replay = await this.receipts.find(
      command.bookId,
      APPEND_THREAD_EVENT_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) return parseThreadWriteResult<ThreadEventRecord>(replay.result, true);

    const thread = await this.threads.get(command.bookId, command.event.threadId);
    if (thread === null) {
      throw new ThreadCommandError('NOT_FOUND', 'The story thread does not exist.');
    }
    if (thread.status !== 'open') {
      throw new ThreadCommandError('VALIDATION_ERROR', 'A closed story thread cannot receive events.');
    }
    const event = {
      ...(await validateEvent(command.event, this.finalizations)),
      createdAt: command.now,
      updatedAt: command.now,
    };
    const nextStatus = event.kind === 'resolved' ? 'resolved' : event.kind === 'dropped' ? 'dropped' : 'open';
    const saved = await this.threads.appendEvent(event, nextStatus, command.expectedBookRevision);
    if (saved === null) {
      throw new ThreadCommandError('REVISION_CONFLICT', 'The book revision has changed.');
    }
    const result = { value: saved.event, bookRevision: saved.bookRevision, replayed: false };
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: APPEND_THREAD_EVENT_COMMAND,
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.now,
    });
    return result;
  }

  async list(bookId: StableId): Promise<readonly StoryThreadRecord[]> {
    return this.threads.list(bookId);
  }

  async listEvents(bookId: StableId, threadId: StableId): Promise<readonly ThreadEventRecord[]> {
    return this.threads.listEvents(bookId, threadId);
  }
}

function normalizeThread(thread: CreateThreadCommand['thread']): CreateThreadCommand['thread'] {
  if (thread.name.trim() === '' || thread.plannedPayoff.trim() === '') {
    throw new ThreadCommandError('VALIDATION_ERROR', 'Thread name and planned payoff are required.');
  }
  if (thread.kind !== 'storyline' && thread.kind !== 'foreshadow') {
    throw new ThreadCommandError('VALIDATION_ERROR', 'Thread kind is invalid.');
  }
  if (thread.status !== 'open') {
    throw new ThreadCommandError('VALIDATION_ERROR', 'New threads must start open.');
  }
  return { ...thread, name: thread.name.trim(), plannedPayoff: thread.plannedPayoff.trim() };
}

async function validateEvent(
  event: AppendThreadEventCommand['event'],
  finalizations: FinalizationRepository,
): Promise<AppendThreadEventCommand['event']> {
  if (!['planted', 'advanced', 'resolved', 'dropped'].includes(event.kind)) {
    throw new ThreadCommandError('VALIDATION_ERROR', 'Thread event kind is invalid.');
  }
  const sourceHash = parseContentHash(event.sourceHash);
  if (event.evidenceKind === 'author') {
    if (event.textRange !== null) {
      throw new ThreadCommandError('VALIDATION_ERROR', 'Author-confirmed events do not need text ranges.');
    }
    return { ...event, sourceHash };
  }
  if (event.evidenceKind !== 'finalization' || event.chapterId === null || event.textRange === null) {
    throw new ThreadCommandError(
      'VALIDATION_ERROR',
      'Finalization-backed events require a chapter and text range.',
    );
  }
  const finalization = await finalizations.get(event.sourceId);
  if (
    finalization === null ||
    finalization.chapterId !== event.chapterId ||
    finalization.contentHash !== sourceHash
  ) {
    throw new ThreadCommandError('VALIDATION_ERROR', 'Thread event finalization evidence is stale.');
  }
  validateTextRange(event.textRange, finalization.content);
  return { ...event, sourceHash };
}

function validateTextRange(range: TextRange, content: string): void {
  const characters = Array.from(content);
  if (
    !Number.isSafeInteger(range.start) ||
    !Number.isSafeInteger(range.end) ||
    range.start < 0 ||
    range.end <= range.start ||
    range.end > characters.length
  ) {
    throw new ThreadCommandError('VALIDATION_ERROR', 'Thread event text range is invalid.');
  }
  const actual = contentHash(characters.slice(range.start, range.end).join(''));
  if (actual !== range.quoteHash) {
    throw new ThreadCommandError('VALIDATION_ERROR', 'Thread event quote hash is stale.');
  }
}

function contentHash(value: string) {
  return parseContentHash(`sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`);
}

function parseThreadWriteResult<T>(value: unknown, replayed: boolean): ThreadWriteResult<T> {
  if (!isRecord(value) || !isRecord(value['value']) || typeof value['bookRevision'] !== 'number') {
    throw new Error('Thread idempotency receipt contains an invalid result.');
  }
  return { value: value['value'] as T, bookRevision: value['bookRevision'], replayed };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
