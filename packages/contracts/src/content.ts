import type { PlanKind } from './runs.js';

export type PlanNodeStatus = 'confirmed' | 'superseded';

export interface PlanTargetLength {
  min: number;
  max: number;
}

export interface PlanContent {
  title: string;
  goal: string;
  conflict: string;
  startState: string;
  endState: string;
  requiredBeats: string[];
  avoid: string[];
  targetLength?: PlanTargetLength;
}

export interface PlanNodeDraft {
  id: string;
  bookId: string;
  parentId: string | null;
  kind: PlanKind;
  sortKey: string;
  content: PlanContent;
  status: PlanNodeStatus;
}

export type DraftCreatedBy = 'author' | 'restore' | 'import' | 'agent';
