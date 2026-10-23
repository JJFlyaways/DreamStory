import { createHash } from 'node:crypto';

import {
  parseContentHash,
  parseStableId,
  type IsoUtcDateTime,
  type ProposalStatus,
  type ReviewDisposition,
  type ReviewFindingInput,
  type StableId,
} from '@dreamstory/contracts';

import type {
  DraftRepository,
  ProposalRecord,
  ProposalRepository,
  ReviewFindingRecord,
  ReviewRecord,
  ReviewRepository,
} from './repositories.js';

export interface SaveReviewCommand {
  reviewId: StableId;
  chapterId: StableId;
  draftVersionId: StableId;
  findings: readonly ReviewFindingInput[];
  createdAt: IsoUtcDateTime;
}

export class ReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewValidationError';
  }
}

export class ReviewService {
  constructor(
    private readonly drafts: DraftRepository,
    private readonly reviews: ReviewRepository,
  ) {}

  async save(command: SaveReviewCommand): Promise<ReviewRecord> {
    const draft = await this.drafts.get(command.draftVersionId);
    if (draft === null || draft.chapterId !== command.chapterId) {
      throw new ReviewValidationError('The review draft does not exist.');
    }
    const draftHash = contentHash(draft.content);
    const findings: ReviewFindingRecord[] = command.findings.map((input) => {
      validateFinding(input, command.draftVersionId, draftHash, draft.content);
      return {
        id: parseStableId(input.id),
        reviewId: command.reviewId,
        chapterId: command.chapterId,
        draftVersionId: command.draftVersionId,
        draftHash,
        revision: 1,
        kind: input.kind,
        severity: input.severity,
        claim: input.claim,
        evidence: input.evidence,
        suggestion: input.suggestion,
        disposition: 'open',
        createdAt: command.createdAt,
        updatedAt: command.createdAt,
      };
    });
    const review: ReviewRecord = {
      id: command.reviewId,
      chapterId: command.chapterId,
      draftVersionId: command.draftVersionId,
      draftHash,
      revision: 1,
      createdAt: command.createdAt,
    };
    await this.reviews.save(review, findings);
    return review;
  }

  async setDisposition(
    findingId: StableId,
    expectedRevision: number,
    disposition: ReviewDisposition,
    updatedAt: IsoUtcDateTime,
  ): Promise<ReviewFindingRecord> {
    const finding = await this.reviews.updateFindingDisposition(
      findingId,
      expectedRevision,
      disposition,
      updatedAt,
    );
    if (finding === null) {
      throw new ReviewValidationError('The review finding revision has changed.');
    }
    return finding;
  }
}

export class ProposalService {
  constructor(private readonly proposals: ProposalRepository) {}

  async save(proposal: ProposalRecord): Promise<ProposalRecord> {
    await this.proposals.save(proposal);
    return proposal;
  }

  async setStatus(
    bookId: StableId,
    proposalId: StableId,
    status: ProposalStatus,
    updatedAt: IsoUtcDateTime,
  ): Promise<ProposalRecord> {
    const proposal = await this.proposals.updateStatus(bookId, proposalId, status, updatedAt);
    if (proposal === null) throw new ReviewValidationError('The proposal does not exist.');
    return proposal;
  }
}

function validateFinding(
  finding: ReviewFindingInput,
  draftVersionId: StableId,
  draftHash: ReturnType<typeof parseContentHash>,
  content: string,
): void {
  if (finding.evidence.id !== draftVersionId) {
    throw new ReviewValidationError('Review evidence points to another draft.');
  }
  if (finding.evidence.contentHash !== draftHash) {
    throw new ReviewValidationError('Review evidence draft hash is stale.');
  }
  const range = finding.evidence.textRange;
  if (
    range === undefined ||
    !Number.isSafeInteger(range.start) ||
    !Number.isSafeInteger(range.end)
  ) {
    throw new ReviewValidationError('Review evidence must contain a Unicode text range.');
  }
  const characters = Array.from(content);
  if (range.start < 0 || range.end <= range.start || range.end > characters.length) {
    throw new ReviewValidationError('Review evidence range is outside the draft.');
  }
  const quoteHash = contentHash(characters.slice(range.start, range.end).join(''));
  if (quoteHash !== range.quoteHash) {
    throw new ReviewValidationError('Review evidence quote hash is stale.');
  }
}

function contentHash(content: string) {
  return parseContentHash(`sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`);
}
