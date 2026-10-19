import type { ClientRequestId } from './ids.js';

export type Revision = number;
export type BookRevision = Revision;
export type DraftRevision = Revision;
export type ProposalRevision = Revision;

export interface IdempotentCommandMetadata {
  clientRequestId: ClientRequestId;
}

export interface ExpectedBookRevision {
  expectedBookRevision: BookRevision;
}

export interface ExpectedDraftRevision {
  expectedDraftRevision: DraftRevision;
}

export interface ExpectedProposalRevision {
  expectedProposalRevision: ProposalRevision;
}

export type BookRevisionCommand = IdempotentCommandMetadata & ExpectedBookRevision;

export type DraftRevisionCommand = IdempotentCommandMetadata & ExpectedDraftRevision;

export type ProposalRevisionCommand = IdempotentCommandMetadata & ExpectedProposalRevision;
