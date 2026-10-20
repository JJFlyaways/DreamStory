import type {
  BookRevision,
  ClientRequestId,
  ContentHash,
  IsoUtcDateTime,
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
  commandReceipts: CommandReceiptRepository;
  outboxJobs: OutboxJobRepository;
  runs: RunRepository;
}

export interface BookRevisionContext {
  bookRevision: BookRevision;
}
