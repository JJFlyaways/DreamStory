import type {
  BookRevision,
  ClientRequestId,
  ContentHash,
  DraftCreatedBy,
  IsoUtcDateTime,
  PlanContent,
  PlanKind,
  PlanNodeStatus,
  RunIntent,
  RunStatus,
  StableId,
} from '@dreamstory/contracts';

export type OutboxJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CommandReceiptRecord {
  bookId: StableId;
  commandKind: string;
  clientRequestId: ClientRequestId;
  result: unknown;
  createdAt: IsoUtcDateTime;
}

export interface CommandReceiptRepository {
  find(
    bookId: StableId,
    commandKind: string,
    clientRequestId: ClientRequestId,
  ): Promise<CommandReceiptRecord | null>;
  save(receipt: CommandReceiptRecord): Promise<void>;
}

export interface BookRecord {
  id: StableId;
  title: string;
  language: string;
  genre: string;
  premise: string;
  conventions: Record<string, unknown>;
  bookRevision: BookRevision;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface BookChanges {
  title?: string;
  language?: string;
  genre?: string;
  premise?: string;
  conventions?: Record<string, unknown>;
}

export interface BookRepository {
  create(book: BookRecord): Promise<void>;
  get(id: StableId): Promise<BookRecord | null>;
  updateIfRevisionMatches(
    id: StableId,
    expectedBookRevision: BookRevision,
    changes: BookChanges,
    updatedAt: IsoUtcDateTime,
  ): Promise<BookRecord | null>;
}

export interface PlanNodeRecord {
  id: StableId;
  bookId: StableId;
  parentId: StableId | null;
  kind: PlanKind;
  sortKey: string;
  content: PlanContent;
  version: number;
  status: PlanNodeStatus;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface PlanNodeSaveResult {
  node: PlanNodeRecord;
  bookRevision: BookRevision;
}

export interface PlanRepository {
  get(bookId: StableId, id: StableId): Promise<PlanNodeRecord | null>;
  list(bookId: StableId, includeSuperseded?: boolean): Promise<readonly PlanNodeRecord[]>;
  history(bookId: StableId, id: StableId): Promise<readonly PlanNodeRecord[]>;
  save(
    node: Omit<PlanNodeRecord, 'version'>,
    expectedBookRevision: BookRevision,
  ): Promise<PlanNodeSaveResult | null>;
}

export interface ChapterRecord {
  id: StableId;
  bookId: StableId;
  chapterNumber: number;
  displayTitle: string;
  planNodeId: StableId;
  currentDraftId: StableId | null;
  currentFinalizationId: StableId | null;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface ChapterRepository {
  get(bookId: StableId, id: StableId): Promise<ChapterRecord | null>;
  list(bookId: StableId): Promise<readonly ChapterRecord[]>;
  create(
    chapter: ChapterRecord,
    expectedBookRevision: BookRevision,
  ): Promise<{ chapter: ChapterRecord; bookRevision: BookRevision } | null>;
}

export interface DraftVersionRecord {
  id: StableId;
  chapterId: StableId;
  parentId: StableId | null;
  revision: number;
  content: string;
  complete: boolean;
  sourceRunId: StableId | null;
  createdBy: DraftCreatedBy;
  createdAt: IsoUtcDateTime;
}

export interface DraftSaveInput {
  id: StableId;
  chapterId: StableId;
  content: string;
  complete: boolean;
  sourceRunId: StableId | null;
  createdBy: DraftCreatedBy;
  createdAt: IsoUtcDateTime;
}

export interface DraftSaveResult {
  draft: DraftVersionRecord;
  draftRevision: number;
}

export interface DraftRepository {
  get(id: StableId): Promise<DraftVersionRecord | null>;
  list(chapterId: StableId): Promise<readonly DraftVersionRecord[]>;
  current(chapterId: StableId): Promise<DraftVersionRecord | null>;
  save(input: DraftSaveInput, expectedDraftRevision: number): Promise<DraftSaveResult | null>;
}

export interface OutboxJobRecord {
  id: StableId;
  kind: string;
  sourceId: StableId;
  sourceHash: ContentHash | null;
  status: OutboxJobStatus;
  attempts: number;
  lastError: string | null;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface OutboxJobRepository {
  enqueue(job: OutboxJobRecord): Promise<void>;
  listPending(limit: number): Promise<readonly OutboxJobRecord[]>;
  markProcessing(id: StableId): Promise<void>;
  markCompleted(id: StableId): Promise<void>;
  markFailed(id: StableId, error: string): Promise<void>;
}

export interface RunRecord {
  id: StableId;
  bookId: StableId;
  intent: RunIntent;
  scope: unknown;
  status: RunStatus;
  inputSnapshotId: StableId | null;
  lease: unknown | null;
  attempt: number;
  error: unknown | null;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface RunRepository {
  create(run: RunRecord): Promise<void>;
  get(id: StableId): Promise<RunRecord | null>;
  updateStatus(id: StableId, status: RunStatus, error?: unknown): Promise<void>;
}

export interface RepositorySet {
  books: BookRepository;
  plans: PlanRepository;
  chapters: ChapterRepository;
  drafts: DraftRepository;
  commandReceipts: CommandReceiptRepository;
  outboxJobs: OutboxJobRepository;
  runs: RunRepository;
}

export interface BookRevisionContext {
  bookRevision: BookRevision;
}
