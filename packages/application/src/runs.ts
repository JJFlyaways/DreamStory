import type {
  ContentHash,
  IsoUtcDateTime,
  SourceFingerprint,
  SourceManifest,
  StableId,
  StepStatus,
  RunIntent,
  RunStatus,
} from '@dreamstory/contracts';
import type { RunRecord } from './repositories.js';

export type RunArtifactKind = 'proposal' | 'draft_candidate' | 'review' | 'revision_candidate';
export type ModelCallStatus = 'reserved' | 'dispatched' | 'completed' | 'failed' | 'unknown';

export interface RunStepRecord {
  id: StableId;
  runId: StableId;
  sequence: number;
  name: string;
  status: StepStatus;
  attempt: number;
  inputSnapshotId: StableId | null;
  artifactId: StableId | null;
  error: unknown | null;
  startedAt: IsoUtcDateTime | null;
  completedAt: IsoUtcDateTime | null;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface RunStepChanges {
  status?: StepStatus;
  attempt?: number;
  inputSnapshotId?: StableId | null;
  artifactId?: StableId | null;
  error?: unknown | null;
  startedAt?: IsoUtcDateTime | null;
  completedAt?: IsoUtcDateTime | null;
  updatedAt: IsoUtcDateTime;
}

export interface RunEventRecord {
  runId: StableId;
  sequence: number;
  eventType: string;
  payload: unknown;
  createdAt: IsoUtcDateTime;
}

export interface InputSnapshotRecord {
  id: StableId;
  bookId: StableId;
  manifest: SourceManifest;
  contextText: string;
  sourceFingerprint: SourceFingerprint;
  executionFingerprint: string;
  promptVersion: string;
  createdAt: IsoUtcDateTime;
}

export interface RunArtifactRecord {
  id: StableId;
  runId: StableId;
  kind: RunArtifactKind;
  revision: number;
  content: string;
  contentHash: ContentHash;
  complete: boolean;
  createdAt: IsoUtcDateTime;
}

export interface ModelCallRecord {
  id: StableId;
  runId: StableId;
  stepId: StableId;
  provider: string;
  model: string;
  status: ModelCallStatus;
  inputTokens: number | null;
  outputTokens: number | null;
  usageKind: 'reported' | 'estimated' | 'unknown';
  error: unknown | null;
  createdAt: IsoUtcDateTime;
  completedAt: IsoUtcDateTime | null;
}

export interface BookLeaseRecord {
  bookId: StableId;
  ownerId: StableId;
  expiresAt: IsoUtcDateTime;
  heartbeatAt: IsoUtcDateTime;
}

export interface RunCreateInput {
  id: StableId;
  bookId: StableId;
  intent: RunIntent;
  scope: unknown;
  status: RunStatus;
  inputSnapshotId: StableId | null;
  lease?: unknown | null;
  attempt?: number;
  error?: unknown | null;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface RunPersistenceRepository {
  create(run: RunCreateInput): Promise<void>;
  get(id: StableId): Promise<RunRecord | null>;
  list(bookId: StableId): Promise<readonly RunRecord[]>;
  updateStatus(id: StableId, status: RunStatus, error?: unknown): Promise<void>;
  createStep(step: RunStepRecord): Promise<void>;
  updateStep(id: StableId, changes: RunStepChanges): Promise<RunStepRecord | null>;
  getStep(id: StableId): Promise<RunStepRecord | null>;
  listSteps(runId: StableId): Promise<readonly RunStepRecord[]>;
  appendEvent(event: Omit<RunEventRecord, 'sequence'>): Promise<RunEventRecord>;
  listEvents(runId: StableId, afterSequence?: number): Promise<readonly RunEventRecord[]>;
  saveInputSnapshot(snapshot: InputSnapshotRecord): Promise<void>;
  getInputSnapshot(id: StableId): Promise<InputSnapshotRecord | null>;
  saveArtifact(artifact: RunArtifactRecord): Promise<void>;
  getArtifact(id: StableId): Promise<RunArtifactRecord | null>;
  listArtifacts(runId: StableId): Promise<readonly RunArtifactRecord[]>;
  reserveModelCall(call: ModelCallRecord): Promise<void>;
  updateModelCall(id: StableId, changes: Partial<ModelCallRecord>): Promise<void>;
  getModelCall(id: StableId): Promise<ModelCallRecord | null>;
  acquireLease(lease: BookLeaseRecord): Promise<boolean>;
  heartbeatLease(
    bookId: StableId,
    ownerId: StableId,
    expiresAt: IsoUtcDateTime,
    heartbeatAt: IsoUtcDateTime,
  ): Promise<boolean>;
  releaseLease(bookId: StableId, ownerId: StableId): Promise<void>;
  recoverExpiredLeases(now: IsoUtcDateTime): Promise<readonly BookLeaseRecord[]>;
}

export interface RunDefinition {
  intent: RunIntent;
  steps: readonly { name: string; terminal: boolean }[];
}

export const RUN_DEFINITIONS: Readonly<Record<RunIntent, RunDefinition>> = {
  plan_book: {
    intent: 'plan_book',
    steps: [
      { name: 'build_context', terminal: false },
      { name: 'generate_proposal', terminal: true },
    ],
  },
  plan_volume: {
    intent: 'plan_volume',
    steps: [
      { name: 'build_context', terminal: false },
      { name: 'generate_proposal', terminal: true },
    ],
  },
  plan_arc: {
    intent: 'plan_arc',
    steps: [
      { name: 'build_context', terminal: false },
      { name: 'generate_proposal', terminal: true },
    ],
  },
  plan_chapter: {
    intent: 'plan_chapter',
    steps: [
      { name: 'build_context', terminal: false },
      { name: 'generate_proposal', terminal: true },
    ],
  },
  draft_chapter: {
    intent: 'draft_chapter',
    steps: [
      { name: 'build_context', terminal: false },
      { name: 'generate_draft', terminal: true },
    ],
  },
  review_chapter: {
    intent: 'review_chapter',
    steps: [
      { name: 'build_context', terminal: false },
      { name: 'generate_review', terminal: true },
    ],
  },
  revise_chapter: {
    intent: 'revise_chapter',
    steps: [
      { name: 'build_context', terminal: false },
      { name: 'generate_revision', terminal: true },
    ],
  },
};
