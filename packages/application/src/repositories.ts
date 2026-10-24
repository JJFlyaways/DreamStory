import type {
  BookRevision,
  ClientRequestId,
  ContentHash,
  DraftCreatedBy,
  EntityRecord,
  EntityStateProjection,
  FactRecord,
  FactRevelationRecord,
  FactSourceKind,
  IsoUtcDateTime,
  PlanContent,
  PlanKind,
  PlanNodeStatus,
  ProposalKind,
  ProposalStatus,
  RevelationVisibility,
  ReviewDisposition,
  ReviewFindingEvidence,
  ReviewFindingKind,
  ReviewSeverity,
  SourceFingerprint,
  RunIntent,
  RunStatus,
  StableId,
} from '@dreamstory/contracts';
import type { RunPersistenceRepository } from './runs.js';

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

export interface EntityRepository {
  get(bookId: StableId, id: StableId): Promise<EntityRecord | null>;
  list(bookId: StableId): Promise<readonly EntityRecord[]>;
  create(
    entity: EntityRecord,
    expectedBookRevision: BookRevision,
  ): Promise<{ entity: EntityRecord; bookRevision: BookRevision } | null>;
  updateAliases(
    bookId: StableId,
    id: StableId,
    aliases: readonly string[],
    expectedBookRevision: BookRevision,
    updatedAt: IsoUtcDateTime,
  ): Promise<{ entity: EntityRecord; bookRevision: BookRevision } | null>;
}

export interface FactAppendInput {
  id: StableId;
  bookId: StableId;
  entityId: StableId;
  predicate: string;
  value: unknown;
  validFromChapter: number;
  sourceKind: FactSourceKind;
  sourceId: StableId;
  sourceHash: ContentHash;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface FactRepository {
  get(bookId: StableId, id: StableId): Promise<FactRecord | null>;
  listByEntity(bookId: StableId, entityId: StableId): Promise<readonly FactRecord[]>;
  appendVersion(
    fact: FactAppendInput,
    expectedBookRevision: BookRevision,
  ): Promise<{ fact: FactRecord; bookRevision: BookRevision } | null>;
  project(bookId: StableId, chapterNumber: number): Promise<readonly EntityStateProjection[]>;
}

export interface FactRevelationRepository {
  create(
    revelation: FactRevelationRecord,
    expectedBookRevision: BookRevision,
  ): Promise<{ revelation: FactRevelationRecord; bookRevision: BookRevision } | null>;
  listByFact(bookId: StableId, factId: StableId): Promise<readonly FactRevelationRecord[]>;
  listForChapter(bookId: StableId, chapterId: StableId): Promise<readonly FactRevelationRecord[]>;
  listByVisibility(
    bookId: StableId,
    visibility: RevelationVisibility,
  ): Promise<readonly FactRevelationRecord[]>;
}

export interface ProposalRecord {
  id: StableId;
  bookId: StableId;
  kind: ProposalKind;
  payload: unknown;
  revision: number;
  sourceFingerprint: SourceFingerprint;
  status: ProposalStatus;
  sourceRunId: StableId | null;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface ProposalRepository {
  get(bookId: StableId, id: StableId): Promise<ProposalRecord | null>;
  list(bookId: StableId): Promise<readonly ProposalRecord[]>;
  save(proposal: ProposalRecord): Promise<void>;
  updateStatus(
    bookId: StableId,
    id: StableId,
    status: ProposalStatus,
    updatedAt: IsoUtcDateTime,
  ): Promise<ProposalRecord | null>;
}

export interface ReviewRecord {
  id: StableId;
  chapterId: StableId;
  draftVersionId: StableId;
  draftHash: ContentHash;
  revision: number;
  createdAt: IsoUtcDateTime;
}

export interface ReviewFindingRecord {
  id: StableId;
  reviewId: StableId;
  chapterId: StableId;
  draftVersionId: StableId;
  draftHash: ContentHash;
  revision: number;
  kind: ReviewFindingKind;
  severity: ReviewSeverity;
  claim: string;
  evidence: ReviewFindingEvidence;
  suggestion: string;
  disposition: ReviewDisposition;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface ReviewRepository {
  get(bookId: StableId, reviewId: StableId): Promise<ReviewRecord | null>;
  listByChapter(bookId: StableId, chapterId: StableId): Promise<readonly ReviewRecord[]>;
  listFindings(reviewId: StableId): Promise<readonly ReviewFindingRecord[]>;
  getFinding(findingId: StableId): Promise<ReviewFindingRecord | null>;
  save(review: ReviewRecord, findings: readonly ReviewFindingRecord[]): Promise<void>;
  updateFindingDisposition(
    findingId: StableId,
    expectedRevision: number,
    disposition: ReviewDisposition,
    updatedAt: IsoUtcDateTime,
  ): Promise<ReviewFindingRecord | null>;
}

export interface FinalizationRecord {
  id: StableId;
  chapterId: StableId;
  draftVersionId: StableId;
  content: string;
  contentHash: ContentHash;
  supersedesId: StableId | null;
  committedAt: IsoUtcDateTime;
}

export interface FinalizationRepository {
  get(id: StableId): Promise<FinalizationRecord | null>;
  list(chapterId: StableId): Promise<readonly FinalizationRecord[]>;
  finalize(
    finalization: FinalizationRecord,
    expectedBookRevision: BookRevision,
    outboxJobs: readonly OutboxJobRecord[],
  ): Promise<{ finalization: FinalizationRecord; bookRevision: BookRevision } | null>;
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

export interface RepositorySet {
  books: BookRepository;
  plans: PlanRepository;
  chapters: ChapterRepository;
  drafts: DraftRepository;
  entities: EntityRepository;
  facts: FactRepository;
  factRevelations: FactRevelationRepository;
  proposals: ProposalRepository;
  reviews: ReviewRepository;
  finalizations: FinalizationRepository;
  commandReceipts: CommandReceiptRepository;
  outboxJobs: OutboxJobRepository;
  runs: RunPersistenceRepository;
}

export interface BookRevisionContext {
  bookRevision: BookRevision;
}
