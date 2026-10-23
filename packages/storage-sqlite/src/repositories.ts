import {
  parseClientRequestId,
  parseContentHash,
  parseSourceFingerprint,
  parseStableId,
  parseUtcDateTime,
} from '@dreamstory/contracts';
import type { ClientRequestId, IsoUtcDateTime, StableId } from '@dreamstory/contracts';
import type {
  BookChanges,
  BookLeaseRecord,
  BookRecord,
  BookRepository,
  ChapterRecord,
  ChapterRepository,
  CommandReceiptRecord,
  CommandReceiptRepository,
  DraftRepository,
  DraftSaveInput,
  DraftSaveResult,
  DraftVersionRecord,
  InputSnapshotRecord,
  ModelCallRecord,
  OutboxJobRecord,
  OutboxJobRepository,
  PlanNodeRecord,
  PlanNodeSaveResult,
  PlanRepository,
  ProposalRecord,
  ProposalRepository,
  ReviewFindingRecord,
  ReviewRecord,
  ReviewRepository,
  RepositorySet,
  RunArtifactRecord,
  RunCreateInput,
  RunEventRecord,
  RunStepChanges,
  RunStepRecord,
  RunRecord,
  RunPersistenceRepository,
} from '@dreamstory/application';
import { and, asc, desc, eq, lte } from 'drizzle-orm';

import type { StoryDatabase } from './drizzle.js';
import {
  books,
  chapters,
  commandReceipts,
  draftVersions,
  outboxJobs,
  planNodeVersions,
  planNodes,
  runs,
  runArtifacts,
  runEvents,
  runSteps,
  inputSnapshots,
  modelCalls,
  bookLeases,
  proposals,
  reviews,
  reviewFindings,
} from './schema.js';

export function createSqliteRepositories(database: StoryDatabase): RepositorySet {
  return {
    books: new SqliteBookRepository(database),
    plans: new SqlitePlanRepository(database),
    chapters: new SqliteChapterRepository(database),
    drafts: new SqliteDraftRepository(database),
    proposals: new SqliteProposalRepository(database),
    reviews: new SqliteReviewRepository(database),
    commandReceipts: new SqliteCommandReceiptRepository(database),
    outboxJobs: new SqliteOutboxJobRepository(database),
    runs: new SqliteRunRepository(database),
  };
}

export class SqliteBookRepository implements BookRepository {
  constructor(private readonly database: StoryDatabase) {}

  async create(book: BookRecord): Promise<void> {
    this.database
      .insert(books)
      .values({
        id: book.id,
        title: book.title,
        language: book.language,
        genre: book.genre,
        premise: book.premise,
        conventionsJson: stringifyJson(book.conventions),
        bookRevision: book.bookRevision,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      })
      .run();
  }

  async get(id: StableId): Promise<BookRecord | null> {
    const row = this.database.select().from(books).where(eq(books.id, id)).get();
    return row === undefined ? null : mapBook(row);
  }

  async updateIfRevisionMatches(
    id: StableId,
    expectedBookRevision: BookRecord['bookRevision'],
    changes: BookChanges,
    updatedAt: BookRecord['updatedAt'],
  ): Promise<BookRecord | null> {
    const values: {
      title?: string;
      language?: string;
      genre?: string;
      premise?: string;
      conventionsJson?: string;
      bookRevision: number;
      updatedAt: string;
    } = {
      bookRevision: expectedBookRevision + 1,
      updatedAt,
    };

    if (changes.title !== undefined) values.title = changes.title;
    if (changes.language !== undefined) values.language = changes.language;
    if (changes.genre !== undefined) values.genre = changes.genre;
    if (changes.premise !== undefined) values.premise = changes.premise;
    if (changes.conventions !== undefined) {
      values.conventionsJson = stringifyJson(changes.conventions);
    }

    const result = this.database
      .update(books)
      .set(values)
      .where(and(eq(books.id, id), eq(books.bookRevision, expectedBookRevision)))
      .run();

    if (result.changes !== 1) {
      return null;
    }

    return this.get(id);
  }
}

export class SqlitePlanRepository implements PlanRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: StableId, id: StableId): Promise<PlanNodeRecord | null> {
    const row = this.database
      .select()
      .from(planNodes)
      .where(and(eq(planNodes.bookId, bookId), eq(planNodes.id, id)))
      .get();
    return row === undefined ? null : mapPlanNode(row);
  }

  async list(bookId: StableId, includeSuperseded = false): Promise<readonly PlanNodeRecord[]> {
    const where = includeSuperseded
      ? eq(planNodes.bookId, bookId)
      : and(eq(planNodes.bookId, bookId), eq(planNodes.status, 'confirmed'));
    return this.database
      .select()
      .from(planNodes)
      .where(where)
      .orderBy(asc(planNodes.sortKey), asc(planNodes.id))
      .all()
      .map(mapPlanNode);
  }

  async history(bookId: StableId, id: StableId): Promise<readonly PlanNodeRecord[]> {
    return this.database
      .select()
      .from(planNodeVersions)
      .where(and(eq(planNodeVersions.bookId, bookId), eq(planNodeVersions.planId, id)))
      .orderBy(asc(planNodeVersions.version))
      .all()
      .map(mapPlanNodeVersion);
  }

  async save(
    node: Omit<PlanNodeRecord, 'version'>,
    expectedBookRevision: PlanNodeRecord['version'],
  ): Promise<PlanNodeSaveResult | null> {
    return this.database.transaction((tx) => {
      const book = tx.select().from(books).where(eq(books.id, node.bookId)).get();
      if (book === undefined || book.bookRevision !== expectedBookRevision) {
        return null;
      }

      const current = tx
        .select()
        .from(planNodes)
        .where(and(eq(planNodes.bookId, node.bookId), eq(planNodes.id, node.id)))
        .get();
      const version = current === undefined ? 1 : current.version + 1;
      const bookRevision = expectedBookRevision + 1;

      tx.update(books)
        .set({ bookRevision, updatedAt: node.updatedAt })
        .where(and(eq(books.id, node.bookId), eq(books.bookRevision, expectedBookRevision)))
        .run();

      const values = {
        id: node.id,
        bookId: node.bookId,
        parentId: node.parentId,
        kind: node.kind,
        sortKey: node.sortKey,
        contentJson: stringifyJson(node.content),
        version,
        status: node.status,
        createdAt: current?.createdAt ?? node.createdAt,
        updatedAt: node.updatedAt,
      };
      if (current === undefined) {
        tx.insert(planNodes).values(values).run();
      } else {
        tx.update(planNodes)
          .set({
            parentId: values.parentId,
            kind: values.kind,
            sortKey: values.sortKey,
            contentJson: values.contentJson,
            version: values.version,
            status: values.status,
            updatedAt: values.updatedAt,
          })
          .where(and(eq(planNodes.bookId, node.bookId), eq(planNodes.id, node.id)))
          .run();
      }

      tx.insert(planNodeVersions)
        .values({
          planId: node.id,
          version,
          bookId: node.bookId,
          parentId: values.parentId,
          kind: values.kind,
          sortKey: values.sortKey,
          contentJson: values.contentJson,
          status: values.status,
          createdAt: values.createdAt,
          updatedAt: values.updatedAt,
        })
        .run();

      const saved = tx
        .select()
        .from(planNodes)
        .where(and(eq(planNodes.bookId, node.bookId), eq(planNodes.id, node.id)))
        .get();
      if (saved === undefined) {
        throw new Error('Plan node was not saved.');
      }

      return { node: mapPlanNode(saved), bookRevision };
    });
  }
}

export class SqliteChapterRepository implements ChapterRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: StableId, id: StableId): Promise<ChapterRecord | null> {
    const row = this.database
      .select()
      .from(chapters)
      .where(and(eq(chapters.bookId, bookId), eq(chapters.id, id)))
      .get();
    return row === undefined ? null : mapChapter(row);
  }

  async list(bookId: StableId): Promise<readonly ChapterRecord[]> {
    return this.database
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookId))
      .orderBy(asc(chapters.chapterNumber))
      .all()
      .map(mapChapter);
  }

  async create(
    chapter: ChapterRecord,
    expectedBookRevision: ChapterRecord['chapterNumber'],
  ): Promise<{ chapter: ChapterRecord; bookRevision: number } | null> {
    return this.database.transaction((tx) => {
      const book = tx.select().from(books).where(eq(books.id, chapter.bookId)).get();
      if (book === undefined || book.bookRevision !== expectedBookRevision) {
        return null;
      }

      const bookRevision = expectedBookRevision + 1;
      tx.update(books)
        .set({ bookRevision, updatedAt: chapter.updatedAt })
        .where(and(eq(books.id, chapter.bookId), eq(books.bookRevision, expectedBookRevision)))
        .run();
      tx.insert(chapters)
        .values({
          id: chapter.id,
          bookId: chapter.bookId,
          chapterNumber: chapter.chapterNumber,
          displayTitle: chapter.displayTitle,
          planNodeId: chapter.planNodeId,
          currentDraftId: chapter.currentDraftId,
          currentFinalizationId: chapter.currentFinalizationId,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        })
        .run();

      return { chapter, bookRevision };
    });
  }
}

export class SqliteDraftRepository implements DraftRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(id: StableId): Promise<DraftVersionRecord | null> {
    const row = this.database.select().from(draftVersions).where(eq(draftVersions.id, id)).get();
    return row === undefined ? null : mapDraft(row);
  }

  async list(chapterId: StableId): Promise<readonly DraftVersionRecord[]> {
    return this.database
      .select()
      .from(draftVersions)
      .where(eq(draftVersions.chapterId, chapterId))
      .orderBy(desc(draftVersions.revision))
      .all()
      .map(mapDraft);
  }

  async current(chapterId: StableId): Promise<DraftVersionRecord | null> {
    const chapter = this.database.select().from(chapters).where(eq(chapters.id, chapterId)).get();
    if (chapter?.currentDraftId === null || chapter?.currentDraftId === undefined) {
      return null;
    }
    return this.get(parseStableId(chapter.currentDraftId));
  }

  async save(
    input: DraftSaveInput,
    expectedDraftRevision: number,
  ): Promise<DraftSaveResult | null> {
    return this.database.transaction((tx) => {
      const chapter = tx.select().from(chapters).where(eq(chapters.id, input.chapterId)).get();
      if (chapter === undefined) {
        return null;
      }

      const current =
        chapter.currentDraftId === null
          ? undefined
          : tx
              .select()
              .from(draftVersions)
              .where(eq(draftVersions.id, chapter.currentDraftId))
              .get();
      const currentRevision = current?.revision ?? 0;
      if (currentRevision !== expectedDraftRevision) {
        return null;
      }

      const draft = {
        id: input.id,
        chapterId: input.chapterId,
        parentId: current?.id ?? null,
        revision: currentRevision + 1,
        content: input.content,
        complete: input.complete,
        sourceRunId: input.sourceRunId,
        createdBy: input.createdBy,
        createdAt: input.createdAt,
      };
      tx.insert(draftVersions).values(draft).run();
      tx.update(chapters)
        .set({ currentDraftId: input.id, updatedAt: input.createdAt })
        .where(eq(chapters.id, input.chapterId))
        .run();

      return {
        draft: mapDraft(draft),
        draftRevision: draft.revision,
      };
    });
  }
}

export class SqliteCommandReceiptRepository implements CommandReceiptRepository {
  constructor(private readonly database: StoryDatabase) {}

  async find(
    bookId: StableId,
    commandKind: string,
    clientRequestId: ClientRequestId,
  ): Promise<CommandReceiptRecord | null> {
    const row = this.database
      .select()
      .from(commandReceipts)
      .where(
        and(
          eq(commandReceipts.bookId, bookId),
          eq(commandReceipts.commandKind, commandKind),
          eq(commandReceipts.clientRequestId, clientRequestId),
        ),
      )
      .get();

    return row === undefined ? null : mapCommandReceipt(row);
  }

  async save(receipt: CommandReceiptRecord): Promise<void> {
    this.database
      .insert(commandReceipts)
      .values({
        bookId: receipt.bookId,
        commandKind: receipt.commandKind,
        clientRequestId: receipt.clientRequestId,
        resultJson: stringifyJson(receipt.result),
        createdAt: receipt.createdAt,
      })
      .onConflictDoNothing()
      .run();
  }
}

export class SqliteProposalRepository implements ProposalRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: StableId, id: StableId): Promise<ProposalRecord | null> {
    const row = this.database
      .select()
      .from(proposals)
      .where(and(eq(proposals.bookId, bookId), eq(proposals.id, id)))
      .get();
    return row === undefined ? null : mapProposal(row);
  }

  async list(bookId: StableId): Promise<readonly ProposalRecord[]> {
    return this.database
      .select()
      .from(proposals)
      .where(eq(proposals.bookId, bookId))
      .orderBy(desc(proposals.updatedAt))
      .all()
      .map(mapProposal);
  }

  async save(proposal: ProposalRecord): Promise<void> {
    this.database
      .insert(proposals)
      .values({
        id: proposal.id,
        bookId: proposal.bookId,
        kind: proposal.kind,
        payloadJson: stringifyJson(proposal.payload),
        revision: proposal.revision,
        sourceFingerprint: proposal.sourceFingerprint,
        status: proposal.status,
        sourceRunId: proposal.sourceRunId,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt,
      })
      .onConflictDoUpdate({
        target: proposals.id,
        set: {
          payloadJson: stringifyJson(proposal.payload),
          revision: proposal.revision,
          sourceFingerprint: proposal.sourceFingerprint,
          status: proposal.status,
          sourceRunId: proposal.sourceRunId,
          updatedAt: proposal.updatedAt,
        },
      })
      .run();
  }

  async updateStatus(
    bookId: StableId,
    id: StableId,
    status: ProposalRecord['status'],
    updatedAt: IsoUtcDateTime,
  ): Promise<ProposalRecord | null> {
    const current = this.database
      .select()
      .from(proposals)
      .where(and(eq(proposals.bookId, bookId), eq(proposals.id, id)))
      .get();
    if (current === undefined) return null;
    this.database
      .update(proposals)
      .set({ status, updatedAt, revision: current.revision + 1 })
      .where(and(eq(proposals.bookId, bookId), eq(proposals.id, id)))
      .run();
    return this.get(bookId, id);
  }
}

export class SqliteReviewRepository implements ReviewRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: StableId, reviewId: StableId): Promise<ReviewRecord | null> {
    const review = this.database.select().from(reviews).where(eq(reviews.id, reviewId)).get();
    if (review === undefined) return null;
    const chapter = this.database
      .select()
      .from(chapters)
      .where(and(eq(chapters.id, review.chapterId), eq(chapters.bookId, bookId)))
      .get();
    return chapter === undefined ? null : mapReview(review);
  }

  async listByChapter(bookId: StableId, chapterId: StableId): Promise<readonly ReviewRecord[]> {
    const chapter = this.database
      .select()
      .from(chapters)
      .where(and(eq(chapters.id, chapterId), eq(chapters.bookId, bookId)))
      .get();
    if (chapter === undefined) return [];
    return this.database
      .select()
      .from(reviews)
      .where(eq(reviews.chapterId, chapterId))
      .orderBy(desc(reviews.createdAt))
      .all()
      .map(mapReview);
  }

  async listFindings(reviewId: StableId): Promise<readonly ReviewFindingRecord[]> {
    return this.database
      .select()
      .from(reviewFindings)
      .where(eq(reviewFindings.reviewId, reviewId))
      .orderBy(asc(reviewFindings.id))
      .all()
      .map(mapReviewFinding);
  }

  async save(review: ReviewRecord, findings: readonly ReviewFindingRecord[]): Promise<void> {
    this.database.transaction((tx) => {
      tx.insert(reviews)
        .values({
          id: review.id,
          chapterId: review.chapterId,
          draftVersionId: review.draftVersionId,
          draftHash: review.draftHash,
          revision: review.revision,
          createdAt: review.createdAt,
        })
        .run();
      if (findings.length > 0) {
        tx.insert(reviewFindings)
          .values(
            findings.map((finding) => ({
              id: finding.id,
              reviewId: finding.reviewId,
              chapterId: finding.chapterId,
              draftVersionId: finding.draftVersionId,
              draftHash: finding.draftHash,
              revision: finding.revision,
              kind: finding.kind,
              severity: finding.severity,
              claim: finding.claim,
              evidenceJson: stringifyJson(finding.evidence),
              suggestion: finding.suggestion,
              disposition: finding.disposition,
              createdAt: finding.createdAt,
              updatedAt: finding.updatedAt,
            })),
          )
          .run();
      }
    });
  }

  async updateFindingDisposition(
    findingId: StableId,
    expectedRevision: number,
    disposition: ReviewFindingRecord['disposition'],
    updatedAt: IsoUtcDateTime,
  ): Promise<ReviewFindingRecord | null> {
    const result = this.database
      .update(reviewFindings)
      .set({ disposition, revision: expectedRevision + 1, updatedAt })
      .where(and(eq(reviewFindings.id, findingId), eq(reviewFindings.revision, expectedRevision)))
      .run();
    if (result.changes !== 1) return null;
    const row = this.database
      .select()
      .from(reviewFindings)
      .where(eq(reviewFindings.id, findingId))
      .get();
    return row === undefined ? null : mapReviewFinding(row);
  }
}

export class SqliteOutboxJobRepository implements OutboxJobRepository {
  constructor(private readonly database: StoryDatabase) {}

  async enqueue(job: OutboxJobRecord): Promise<void> {
    this.database
      .insert(outboxJobs)
      .values({
        id: job.id,
        kind: job.kind,
        sourceId: job.sourceId,
        sourceHash: job.sourceHash,
        status: job.status,
        attempts: job.attempts,
        lastError: job.lastError,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })
      .run();
  }

  async listPending(limit: number): Promise<readonly OutboxJobRecord[]> {
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      throw new Error('Outbox list limit must be a positive integer.');
    }

    const rows = this.database
      .select()
      .from(outboxJobs)
      .where(eq(outboxJobs.status, 'pending'))
      .orderBy(asc(outboxJobs.createdAt))
      .limit(limit)
      .all();

    return rows.map(mapOutboxJob);
  }

  async markProcessing(id: StableId): Promise<void> {
    const row = this.database.select().from(outboxJobs).where(eq(outboxJobs.id, id)).get();
    if (row === undefined) {
      throw new Error(`Outbox job not found: ${id}`);
    }

    this.database
      .update(outboxJobs)
      .set({ status: 'processing', attempts: row.attempts + 1, updatedAt: utcNow() })
      .where(eq(outboxJobs.id, id))
      .run();
  }

  async markCompleted(id: StableId): Promise<void> {
    this.database
      .update(outboxJobs)
      .set({ status: 'completed', updatedAt: utcNow(), lastError: null })
      .where(eq(outboxJobs.id, id))
      .run();
  }

  async markFailed(id: StableId, error: string): Promise<void> {
    this.database
      .update(outboxJobs)
      .set({ status: 'failed', updatedAt: utcNow(), lastError: error })
      .where(eq(outboxJobs.id, id))
      .run();
  }
}

export class SqliteRunRepository implements RunPersistenceRepository {
  constructor(private readonly database: StoryDatabase) {}

  async create(run: RunCreateInput): Promise<void> {
    this.database
      .insert(runs)
      .values({
        id: run.id,
        bookId: run.bookId,
        intent: run.intent,
        scopeJson: stringifyJson(run.scope),
        status: run.status,
        inputSnapshotId: run.inputSnapshotId,
        leaseJson: stringifyNullableJson(run.lease ?? null),
        attempt: run.attempt ?? 0,
        errorJson: stringifyNullableJson(run.error ?? null),
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
      })
      .run();
  }

  async get(id: StableId): Promise<RunRecord | null> {
    const row = this.database.select().from(runs).where(eq(runs.id, id)).get();
    return row === undefined ? null : mapRun(row);
  }

  async list(bookId: StableId): Promise<readonly RunRecord[]> {
    return this.database
      .select()
      .from(runs)
      .where(eq(runs.bookId, bookId))
      .orderBy(desc(runs.createdAt))
      .all()
      .map(mapRun);
  }

  async updateStatus(id: StableId, status: RunRecord['status'], error?: unknown): Promise<void> {
    this.database
      .update(runs)
      .set({
        status,
        errorJson: error === undefined ? null : stringifyNullableJson(error),
        updatedAt: utcNow(),
      })
      .where(eq(runs.id, id))
      .run();
  }

  async createStep(step: RunStepRecord): Promise<void> {
    this.database
      .insert(runSteps)
      .values({
        id: step.id,
        runId: step.runId,
        sequence: step.sequence,
        name: step.name,
        status: step.status,
        attempt: step.attempt,
        inputSnapshotId: step.inputSnapshotId,
        artifactId: step.artifactId,
        errorJson: stringifyNullableJson(step.error),
        startedAt: step.startedAt,
        completedAt: step.completedAt,
        createdAt: step.createdAt,
        updatedAt: step.updatedAt,
      })
      .run();
  }

  async updateStep(id: StableId, changes: RunStepChanges): Promise<RunStepRecord | null> {
    const values: {
      status?: RunStepChanges['status'];
      attempt?: number;
      inputSnapshotId?: string | null;
      artifactId?: string | null;
      errorJson?: string | null;
      startedAt?: string | null;
      completedAt?: string | null;
      updatedAt: string;
    } = { updatedAt: changes.updatedAt };
    if (changes.status !== undefined) values.status = changes.status;
    if (changes.attempt !== undefined) values.attempt = changes.attempt;
    if (changes.inputSnapshotId !== undefined) values.inputSnapshotId = changes.inputSnapshotId;
    if (changes.artifactId !== undefined) values.artifactId = changes.artifactId;
    if (changes.error !== undefined) values['errorJson'] = stringifyNullableJson(changes.error);
    if (changes.startedAt !== undefined) values.startedAt = changes.startedAt;
    if (changes.completedAt !== undefined) values.completedAt = changes.completedAt;
    this.database.update(runSteps).set(values).where(eq(runSteps.id, id)).run();
    return this.getStep(id);
  }

  async getStep(id: StableId): Promise<RunStepRecord | null> {
    const row = this.database.select().from(runSteps).where(eq(runSteps.id, id)).get();
    return row === undefined ? null : mapRunStep(row);
  }

  async listSteps(runId: StableId): Promise<readonly RunStepRecord[]> {
    return this.database
      .select()
      .from(runSteps)
      .where(eq(runSteps.runId, runId))
      .orderBy(asc(runSteps.sequence))
      .all()
      .map(mapRunStep);
  }

  async appendEvent(event: Omit<RunEventRecord, 'sequence'>): Promise<RunEventRecord> {
    return this.database.transaction((tx) => {
      const last = tx
        .select()
        .from(runEvents)
        .where(eq(runEvents.runId, event.runId))
        .orderBy(desc(runEvents.sequence))
        .limit(1)
        .get();
      const record = {
        ...event,
        sequence: (last?.sequence ?? 0) + 1,
      };
      tx.insert(runEvents)
        .values({
          runId: record.runId,
          sequence: record.sequence,
          eventType: record.eventType,
          payloadJson: stringifyJson(record.payload),
          createdAt: record.createdAt,
        })
        .run();
      return record;
    });
  }

  async listEvents(runId: StableId, afterSequence = 0): Promise<readonly RunEventRecord[]> {
    return this.database
      .select()
      .from(runEvents)
      .where(eq(runEvents.runId, runId))
      .orderBy(asc(runEvents.sequence))
      .all()
      .filter((row) => row.sequence > afterSequence)
      .map(mapRunEvent);
  }

  async saveInputSnapshot(snapshot: InputSnapshotRecord): Promise<void> {
    this.database
      .insert(inputSnapshots)
      .values({
        id: snapshot.id,
        bookId: snapshot.bookId,
        manifestJson: stringifyJson(snapshot.manifest),
        contextText: snapshot.contextText,
        sourceFingerprint: snapshot.sourceFingerprint,
        executionFingerprint: snapshot.executionFingerprint,
        promptVersion: snapshot.promptVersion,
        createdAt: snapshot.createdAt,
      })
      .run();
  }

  async getInputSnapshot(id: StableId): Promise<InputSnapshotRecord | null> {
    const row = this.database.select().from(inputSnapshots).where(eq(inputSnapshots.id, id)).get();
    return row === undefined ? null : mapInputSnapshot(row);
  }

  async saveArtifact(artifact: RunArtifactRecord): Promise<void> {
    this.database
      .insert(runArtifacts)
      .values({
        id: artifact.id,
        runId: artifact.runId,
        kind: artifact.kind,
        revision: artifact.revision,
        content: artifact.content,
        contentHash: artifact.contentHash,
        complete: artifact.complete,
        createdAt: artifact.createdAt,
      })
      .run();
  }

  async getArtifact(id: StableId): Promise<RunArtifactRecord | null> {
    const row = this.database.select().from(runArtifacts).where(eq(runArtifacts.id, id)).get();
    return row === undefined ? null : mapArtifact(row);
  }

  async listArtifacts(runId: StableId): Promise<readonly RunArtifactRecord[]> {
    return this.database
      .select()
      .from(runArtifacts)
      .where(eq(runArtifacts.runId, runId))
      .orderBy(desc(runArtifacts.revision))
      .all()
      .map(mapArtifact);
  }

  async reserveModelCall(call: ModelCallRecord): Promise<void> {
    this.database.insert(modelCalls).values(mapModelCallInsert(call)).run();
  }

  async updateModelCall(id: StableId, changes: Partial<ModelCallRecord>): Promise<void> {
    const values: Record<string, unknown> = {};
    for (const field of [
      'provider',
      'model',
      'status',
      'inputTokens',
      'outputTokens',
      'usageKind',
      'completedAt',
    ] as const) {
      if (changes[field] !== undefined) values[field] = changes[field];
    }
    if (changes.error !== undefined) values['errorJson'] = stringifyNullableJson(changes.error);
    this.database.update(modelCalls).set(values).where(eq(modelCalls.id, id)).run();
  }

  async getModelCall(id: StableId): Promise<ModelCallRecord | null> {
    const row = this.database.select().from(modelCalls).where(eq(modelCalls.id, id)).get();
    return row === undefined ? null : mapModelCall(row);
  }

  async acquireLease(lease: BookLeaseRecord): Promise<boolean> {
    return this.database.transaction((tx) => {
      const current = tx.select().from(bookLeases).where(eq(bookLeases.bookId, lease.bookId)).get();
      if (current && current.ownerId !== lease.ownerId && current.expiresAt > lease.heartbeatAt) {
        return false;
      }
      tx.insert(bookLeases)
        .values(lease)
        .onConflictDoUpdate({
          target: bookLeases.bookId,
          set: {
            ownerId: lease.ownerId,
            expiresAt: lease.expiresAt,
            heartbeatAt: lease.heartbeatAt,
          },
        })
        .run();
      return true;
    });
  }

  async heartbeatLease(
    bookId: StableId,
    ownerId: StableId,
    expiresAt: IsoUtcDateTime,
    heartbeatAt: IsoUtcDateTime,
  ): Promise<boolean> {
    const result = this.database
      .update(bookLeases)
      .set({ expiresAt, heartbeatAt })
      .where(and(eq(bookLeases.bookId, bookId), eq(bookLeases.ownerId, ownerId)))
      .run();
    return result.changes === 1;
  }

  async releaseLease(bookId: StableId, ownerId: StableId): Promise<void> {
    this.database
      .delete(bookLeases)
      .where(and(eq(bookLeases.bookId, bookId), eq(bookLeases.ownerId, ownerId)))
      .run();
  }

  async recoverExpiredLeases(now: IsoUtcDateTime): Promise<readonly BookLeaseRecord[]> {
    const expired = this.database
      .select()
      .from(bookLeases)
      .where(lte(bookLeases.expiresAt, now))
      .all();
    for (const lease of expired) {
      this.database.delete(bookLeases).where(eq(bookLeases.bookId, lease.bookId)).run();
    }
    return expired.map(mapLease);
  }
}

function mapRunStep(row: typeof runSteps.$inferSelect): RunStepRecord {
  return {
    id: parseStableId(row.id),
    runId: parseStableId(row.runId),
    sequence: row.sequence,
    name: row.name,
    status: row.status,
    attempt: row.attempt,
    inputSnapshotId: row.inputSnapshotId === null ? null : parseStableId(row.inputSnapshotId),
    artifactId: row.artifactId === null ? null : parseStableId(row.artifactId),
    error: parseNullableJson(row.errorJson),
    startedAt: row.startedAt === null ? null : parseUtcDateTime(row.startedAt),
    completedAt: row.completedAt === null ? null : parseUtcDateTime(row.completedAt),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapRunEvent(row: typeof runEvents.$inferSelect): RunEventRecord {
  return {
    runId: parseStableId(row.runId),
    sequence: row.sequence,
    eventType: row.eventType,
    payload: parseJson(row.payloadJson),
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapInputSnapshot(row: typeof inputSnapshots.$inferSelect): InputSnapshotRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    manifest: parseJson(row.manifestJson) as InputSnapshotRecord['manifest'],
    contextText: row.contextText,
    sourceFingerprint: parseSourceFingerprint(row.sourceFingerprint),
    executionFingerprint: row.executionFingerprint,
    promptVersion: row.promptVersion,
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapArtifact(row: typeof runArtifacts.$inferSelect): RunArtifactRecord {
  return {
    id: parseStableId(row.id),
    runId: parseStableId(row.runId),
    kind: row.kind,
    revision: row.revision,
    content: row.content,
    contentHash: parseContentHash(row.contentHash),
    complete: row.complete,
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapModelCallInsert(call: ModelCallRecord) {
  return {
    id: call.id,
    runId: call.runId,
    stepId: call.stepId,
    provider: call.provider,
    model: call.model,
    status: call.status,
    inputTokens: call.inputTokens,
    outputTokens: call.outputTokens,
    usageKind: call.usageKind,
    errorJson: stringifyNullableJson(call.error),
    createdAt: call.createdAt,
    completedAt: call.completedAt,
  };
}

function mapModelCall(row: typeof modelCalls.$inferSelect): ModelCallRecord {
  return {
    id: parseStableId(row.id),
    runId: parseStableId(row.runId),
    stepId: parseStableId(row.stepId),
    provider: row.provider,
    model: row.model,
    status: row.status,
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    usageKind: row.usageKind,
    error: parseNullableJson(row.errorJson),
    createdAt: parseUtcDateTime(row.createdAt),
    completedAt: row.completedAt === null ? null : parseUtcDateTime(row.completedAt),
  };
}

function mapLease(row: typeof bookLeases.$inferSelect): BookLeaseRecord {
  return {
    bookId: parseStableId(row.bookId),
    ownerId: parseStableId(row.ownerId),
    expiresAt: parseUtcDateTime(row.expiresAt),
    heartbeatAt: parseUtcDateTime(row.heartbeatAt),
  };
}

function mapProposal(row: typeof proposals.$inferSelect): ProposalRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    kind: row.kind,
    payload: parseJson(row.payloadJson),
    revision: row.revision,
    sourceFingerprint: parseSourceFingerprint(row.sourceFingerprint),
    status: row.status,
    sourceRunId: row.sourceRunId === null ? null : parseStableId(row.sourceRunId),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapReview(row: typeof reviews.$inferSelect): ReviewRecord {
  return {
    id: parseStableId(row.id),
    chapterId: parseStableId(row.chapterId),
    draftVersionId: parseStableId(row.draftVersionId),
    draftHash: parseContentHash(row.draftHash),
    revision: row.revision,
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapReviewFinding(row: typeof reviewFindings.$inferSelect): ReviewFindingRecord {
  return {
    id: parseStableId(row.id),
    reviewId: parseStableId(row.reviewId),
    chapterId: parseStableId(row.chapterId),
    draftVersionId: parseStableId(row.draftVersionId),
    draftHash: parseContentHash(row.draftHash),
    revision: row.revision,
    kind: row.kind,
    severity: row.severity,
    claim: row.claim,
    evidence: parseJson(row.evidenceJson) as ReviewFindingRecord['evidence'],
    suggestion: row.suggestion,
    disposition: row.disposition,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapCommandReceipt(row: typeof commandReceipts.$inferSelect): CommandReceiptRecord {
  return {
    bookId: parseStableId(row.bookId),
    commandKind: row.commandKind,
    clientRequestId: parseClientRequestId(row.clientRequestId),
    result: parseJson(row.resultJson),
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapBook(row: typeof books.$inferSelect): BookRecord {
  return {
    id: parseStableId(row.id),
    title: row.title,
    language: row.language,
    genre: row.genre,
    premise: row.premise,
    conventions: parseJsonObject(row.conventionsJson),
    bookRevision: row.bookRevision,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapPlanNode(row: typeof planNodes.$inferSelect): PlanNodeRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    parentId: row.parentId === null ? null : parseStableId(row.parentId),
    kind: row.kind,
    sortKey: row.sortKey,
    content: parseJsonObject(row.contentJson) as unknown as PlanNodeRecord['content'],
    version: row.version,
    status: row.status,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapPlanNodeVersion(row: typeof planNodeVersions.$inferSelect): PlanNodeRecord {
  return {
    id: parseStableId(row.planId),
    bookId: parseStableId(row.bookId),
    parentId: row.parentId === null ? null : parseStableId(row.parentId),
    kind: row.kind,
    sortKey: row.sortKey,
    content: parseJsonObject(row.contentJson) as unknown as PlanNodeRecord['content'],
    version: row.version,
    status: row.status,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapChapter(row: typeof chapters.$inferSelect): ChapterRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    chapterNumber: row.chapterNumber,
    displayTitle: row.displayTitle,
    planNodeId: parseStableId(row.planNodeId),
    currentDraftId: row.currentDraftId === null ? null : parseStableId(row.currentDraftId),
    currentFinalizationId:
      row.currentFinalizationId === null ? null : parseStableId(row.currentFinalizationId),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapDraft(row: typeof draftVersions.$inferSelect): DraftVersionRecord {
  return {
    id: parseStableId(row.id),
    chapterId: parseStableId(row.chapterId),
    parentId: row.parentId === null ? null : parseStableId(row.parentId),
    revision: row.revision,
    content: row.content,
    complete: row.complete,
    sourceRunId: row.sourceRunId === null ? null : parseStableId(row.sourceRunId),
    createdBy: row.createdBy,
    createdAt: parseUtcDateTime(row.createdAt),
  };
}

function mapOutboxJob(row: typeof outboxJobs.$inferSelect): OutboxJobRecord {
  return {
    id: parseStableId(row.id),
    kind: row.kind,
    sourceId: parseStableId(row.sourceId),
    sourceHash: row.sourceHash === null ? null : parseContentHash(row.sourceHash),
    status: row.status,
    attempts: row.attempts,
    lastError: row.lastError,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapRun(row: typeof runs.$inferSelect): RunRecord {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    intent: row.intent,
    scope: parseJson(row.scopeJson),
    status: row.status,
    inputSnapshotId: row.inputSnapshotId === null ? null : parseStableId(row.inputSnapshotId),
    lease: parseNullableJson(row.leaseJson),
    attempt: row.attempt,
    error: parseNullableJson(row.errorJson),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value) ?? 'null';
}

function stringifyNullableJson(value: unknown | null): string | null {
  return value === null ? null : stringifyJson(value);
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = parseJson(value);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Expected a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

function parseNullableJson(value: string | null): unknown | null {
  return value === null ? null : parseJson(value);
}

function utcNow(): IsoUtcDateTime {
  return parseUtcDateTime(new Date().toISOString());
}
