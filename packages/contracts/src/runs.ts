export type RunIntent =
  | 'plan_book'
  | 'plan_volume'
  | 'plan_arc'
  | 'plan_chapter'
  | 'draft_chapter'
  | 'review_chapter'
  | 'revise_chapter';

export type RunStatus =
  | 'queued'
  | 'running'
  | 'awaiting_author'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'stale';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'unknown';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'stale';

export type PlanKind = 'book' | 'volume' | 'arc' | 'chapter';
