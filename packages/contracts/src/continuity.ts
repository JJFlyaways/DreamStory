import type { ContentHash, IsoUtcDateTime, StableId } from './ids.js';

export type EntityKind = 'character' | 'location' | 'organization' | 'item' | 'world';

export type FactSourceKind = 'author' | 'finalization' | 'import';

export interface EntityRecord {
  id: StableId;
  bookId: StableId;
  kind: EntityKind;
  name: string;
  aliases: readonly string[];
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface FactRecord {
  id: StableId;
  bookId: StableId;
  entityId: StableId;
  predicate: string;
  value: unknown;
  validFromChapter: number;
  validToChapter: number | null;
  sourceKind: FactSourceKind;
  sourceId: StableId;
  sourceHash: ContentHash;
  revision: number;
  createdAt: IsoUtcDateTime;
  updatedAt: IsoUtcDateTime;
}

export interface EntityStateProjection {
  entity: EntityRecord;
  facts: readonly FactRecord[];
}
