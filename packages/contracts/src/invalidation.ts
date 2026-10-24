import type { ContentHash, IsoUtcDateTime, StableId } from './ids.js';

export type InvalidationObjectKind =
  | 'chapter_projection'
  | 'search_index'
  | 'input_snapshot'
  | 'run'
  | 'run_artifact'
  | 'proposal'
  | 'review'
  | 'fact'
  | 'fact_revelation'
  | 'thread_event';

export type InvalidationStatus = 'pending' | 'cleared';

export interface DerivedInvalidationRecord {
  id: StableId;
  bookId: StableId;
  objectKind: InvalidationObjectKind;
  objectId: StableId;
  supersededFinalizationId: StableId;
  replacementFinalizationId: StableId;
  oldSourceHash: ContentHash;
  newSourceHash: ContentHash;
  reason: string;
  status: InvalidationStatus;
  createdAt: IsoUtcDateTime;
  clearedAt: IsoUtcDateTime | null;
}
