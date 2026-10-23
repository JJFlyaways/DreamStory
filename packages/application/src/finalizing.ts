import { createHash } from 'node:crypto';

import {
  parseContentHash,
  parseStableId,
  type BookRevision,
  type ClientRequestId,
  type IsoUtcDateTime,
  type StableId,
} from '@dreamstory/contracts';

import type {
  BookRepository,
  ChapterRepository,
  CommandReceiptRepository,
  DraftRepository,
  FinalizationRecord,
  FinalizationRepository,
  OutboxJobRecord,
} from './repositories.js';

export interface FinalizeChapterCommand {
  bookId: StableId;
  chapterId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  expectedDraftRevision: number;
  draftVersionId: StableId;
  contentHash: string;
  committedAt: IsoUtcDateTime;
}

export interface FinalizeChapterResult {
  finalization: FinalizationRecord;
  bookRevision: BookRevision;
  replayed: boolean;
}

export class FinalizationError extends Error {
  readonly code: 'NOT_FOUND' | 'PRECONDITION_FAILED' | 'REVISION_CONFLICT' | 'SOURCE_STALE';

  readonly currentBookRevision: BookRevision | undefined;

  constructor(
    code: FinalizationError['code'],
    message: string,
    currentBookRevision?: BookRevision,
  ) {
    super(message);
    this.name = 'FinalizationError';
    this.code = code;
    this.currentBookRevision = currentBookRevision;
  }
}

export class FinalizationService {
  constructor(
    private readonly books: BookRepository,
    private readonly chapters: ChapterRepository,
    private readonly drafts: DraftRepository,
    private readonly finalizations: FinalizationRepository,
    private readonly receipts: CommandReceiptRepository,
  ) {}

  async finalize(command: FinalizeChapterCommand): Promise<FinalizeChapterResult> {
    const replay = await this.receipts.find(
      command.bookId,
      'finalize_chapter',
      command.clientRequestId,
    );
    if (replay !== null) {
      return { ...(replay.result as Omit<FinalizeChapterResult, 'replayed'>), replayed: true };
    }
    const chapter = await this.chapters.get(command.bookId, command.chapterId);
    if (chapter === null) throw new FinalizationError('NOT_FOUND', 'The chapter does not exist.');
    const draft = await this.drafts.get(command.draftVersionId);
    if (draft === null || draft.chapterId !== command.chapterId) {
      throw new FinalizationError('NOT_FOUND', 'The draft does not exist.');
    }
    if (draft.revision !== command.expectedDraftRevision || !draft.complete) {
      throw new FinalizationError(
        'PRECONDITION_FAILED',
        'The draft is not a complete current version.',
      );
    }
    const actualHash = contentHash(draft.content);
    if (actualHash !== command.contentHash) {
      throw new FinalizationError('SOURCE_STALE', 'The draft content hash has changed.');
    }
    const book = await this.books.get(command.bookId);
    if (book === null) throw new FinalizationError('NOT_FOUND', 'The book does not exist.');
    if (book.bookRevision !== command.expectedBookRevision) {
      throw new FinalizationError(
        'REVISION_CONFLICT',
        'The book revision has changed.',
        book.bookRevision,
      );
    }
    const finalization: FinalizationRecord = {
      id: parseStableId(`finalization_${command.clientRequestId}`),
      chapterId: command.chapterId,
      draftVersionId: draft.id,
      content: draft.content,
      contentHash: actualHash,
      supersedesId: chapter.currentFinalizationId,
      committedAt: command.committedAt,
    };
    const outboxJobs = createOutboxJobs(finalization, command.committedAt);
    const saved = await this.finalizations.finalize(
      finalization,
      command.expectedBookRevision,
      outboxJobs,
    );
    if (saved === null) {
      const latest = await this.books.get(command.bookId);
      throw new FinalizationError(
        'REVISION_CONFLICT',
        'The book revision has changed.',
        latest?.bookRevision,
      );
    }
    const result = { finalization: saved.finalization, bookRevision: saved.bookRevision };
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: 'finalize_chapter',
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.committedAt,
    });
    return { ...result, replayed: false };
  }
}

function createOutboxJobs(
  finalization: FinalizationRecord,
  createdAt: IsoUtcDateTime,
): readonly OutboxJobRecord[] {
  return ['refresh_export', 'refresh_search', 'extract_facts'].map((kind) => ({
    id: parseStableId(`job_${finalization.id}_${kind}`),
    kind,
    sourceId: finalization.id,
    sourceHash: finalization.contentHash,
    status: 'pending',
    attempts: 0,
    lastError: null,
    createdAt,
    updatedAt: createdAt,
  }));
}

function contentHash(content: string) {
  return parseContentHash(`sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`);
}
