import type { ContentHash, IsoUtcDateTime, StableId } from './ids.js';
import type { TextRange } from './source-ref.js';

export type ThreadKind = 'storyline' | 'foreshadow';

export type ThreadStatus = 'open' | 'resolved' | 'dropped' | 'superseded';

export type ThreadEventKind = 'planted' | 'advanced' | 'resolved' | 'dropped';

export type ThreadEvidenceKind = 'author' | 'finalization';

export interface StoryThreadRecord {
  id: StableId;
  bookId: StableId;
  kind: ThreadKind;
  name: string;
  plannedPayoff: string;
  status: ThreadStatus;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface ThreadEventRecord {
  id: StableId;
  bookId: StableId;
  threadId: StableId;
  kind: ThreadEventKind;
  chapterId: StableId | null;
  evidenceKind: ThreadEvidenceKind;
  sourceId: StableId;
  sourceHash: ContentHash;
  textRange: TextRange | null;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}
