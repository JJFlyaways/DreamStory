import type { ContentHash, SourceFingerprint, StableId } from './ids.js';

export type SourceKind = 'author_fact' | 'plan' | 'draft' | 'finalization' | 'import';

export interface TextRange {
  start: number;
  end: number;
  quoteHash: ContentHash;
}

export interface SourceRef {
  kind: SourceKind;
  id: StableId;
  version: number | null;
  contentHash: ContentHash;
  chapterNumber?: number;
  textRange?: TextRange;
}

export interface SourceManifestEntry {
  source: SourceRef;
  included: boolean;
  reason: string;
}

export interface SourceManifest {
  sources: SourceManifestEntry[];
  sourceFingerprint: SourceFingerprint;
}
