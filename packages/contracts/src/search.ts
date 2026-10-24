import type { StableId } from './ids.js';

export type SearchHitKind = 'chapter' | 'entity';

export type SearchMatchReason = 'full_text' | 'entity_exact' | 'entity_alias';

export interface SearchPosition {
  start: number;
  end: number;
}

export interface SearchHit {
  kind: SearchHitKind;
  score: number;
  reason: SearchMatchReason;
  entityId: StableId | null;
  finalizationId: StableId | null;
  chapterId: StableId | null;
  chapterNumber: number | null;
  position: SearchPosition | null;
  excerpt: string;
}

export interface SearchRebuildResult {
  indexedChapters: number;
  indexedEntityMentions: number;
}
