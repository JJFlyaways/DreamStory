export type PlanKind = 'book' | 'volume' | 'arc' | 'chapter';
export type PlanNodeStatus = 'confirmed' | 'superseded';

export interface Book {
  id: string;
  title: string;
  language: string;
  genre: string;
  premise: string;
  conventions: Record<string, unknown>;
  bookRevision: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfEntry {
  bookId: string;
  status: 'ready' | 'invalid';
  schemaVersion: number | null;
  book: Book | null;
}

export interface PlanContent {
  title: string;
  goal: string;
  conflict: string;
  startState: string;
  endState: string;
  requiredBeats: string[];
  avoid: string[];
  targetLength?: { min: number; max: number };
}

export interface PlanNode {
  id: string;
  bookId: string;
  parentId: string | null;
  kind: PlanKind;
  sortKey: string;
  content: PlanContent;
  version: number;
  status: PlanNodeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  displayTitle: string;
  planNodeId: string;
  currentDraftId: string | null;
  currentFinalizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DraftVersion {
  id: string;
  chapterId: string;
  parentId: string | null;
  revision: number;
  content: string;
  complete: boolean;
  sourceRunId: string | null;
  createdBy: 'author' | 'restore' | 'import' | 'agent';
  createdAt: string;
}

export interface PlanSaveResult {
  node: PlanNode;
  bookRevision: number;
  replayed: boolean;
}

export interface DraftSaveResult {
  draft: DraftVersion;
  draftRevision: number;
  replayed: boolean;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details: Record<string, unknown>;
  requestId: string;
}

export type RunStatus =
  | 'queued'
  | 'running'
  | 'awaiting_author'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'stale';

export interface RunRecord {
  id: string;
  bookId: string;
  intent: string;
  scope: unknown;
  status: RunStatus;
  inputSnapshotId: string | null;
  attempt: number;
  error: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunArtifact {
  id: string;
  runId: string;
  kind: 'proposal' | 'draft_candidate' | 'review' | 'revision_candidate';
  revision: number;
  content: string;
  contentHash: string;
  complete: boolean;
  createdAt: string;
}

export type ReviewFindingKind = 'continuity' | 'style' | 'plot' | 'fact';
export type ReviewSeverity = 'info' | 'minor' | 'major';
export type ReviewDisposition = 'open' | 'accept' | 'ignore' | 'intentional';

export interface ReviewRecord {
  id: string;
  chapterId: string;
  draftVersionId: string;
  draftHash: string;
  revision: number;
  createdAt: string;
}

export interface ReviewFinding {
  id: string;
  reviewId: string;
  chapterId: string;
  draftVersionId: string;
  draftHash: string;
  revision: number;
  kind: ReviewFindingKind;
  severity: ReviewSeverity;
  claim: string;
  evidence: {
    kind: 'draft';
    id: string;
    version: number | null;
    contentHash: string;
    chapterNumber?: number;
    textRange: {
      start: number;
      end: number;
      quoteHash: string;
    };
  };
  suggestion: string;
  disposition: ReviewDisposition;
  createdAt: string;
  updatedAt: string;
}

export interface RunEventRecord {
  runId: string;
  sequence?: number;
  eventType: string;
  payload: unknown;
  createdAt?: string;
}

export interface ModelProfile {
  id: string;
  protocol: string;
  model: string;
  capabilities: readonly string[];
  purposes: readonly string[];
  credentialStatus: 'configured' | 'missing';
}
