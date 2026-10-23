import type { SourceRef } from './source-ref.js';

export type ProposalKind = 'plan' | 'fact' | 'revision';
export type ReviewFindingKind = 'continuity' | 'style' | 'plot' | 'fact';
export type ReviewSeverity = 'info' | 'minor' | 'major';
export type ReviewDisposition = 'open' | 'accept' | 'ignore' | 'intentional';

export interface ReviewFindingEvidence extends SourceRef {
  kind: 'draft';
}

export interface ReviewFindingInput {
  id: string;
  kind: ReviewFindingKind;
  severity: ReviewSeverity;
  claim: string;
  evidence: ReviewFindingEvidence;
  suggestion: string;
}

export interface ProposalPayload {
  title?: string;
  summary?: string;
  content: unknown;
}
