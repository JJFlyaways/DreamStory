import {
  parseClientRequestId,
  parseContentHash,
  parseSourceFingerprint,
  parseStableId,
  parseUtcDateTime,
} from '@dreamstory/contracts';
import type {
  ClientRequestId,
  InvalidationObjectKind,
  IsoUtcDateTime,
  StableId,
} from '@dreamstory/contracts';
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
  EntityRepository,
  FactRevelationRepository,
  FinalizationRecord,
  FinalizationRepository,
  FactAppendInput,
  FactRepository,
  InputSnapshotRecord,
  InvalidationRepository,
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
  SearchRepository,
  ThreadRepository,
} from '@dreamstory/application';
import { and, asc, desc, eq, lte } from 'drizzle-orm';

import type { StoryDatabase } from './drizzle.js';
import {
  books,
  chapters,
  commandReceipts,
  draftVersions,
  entities,
  facts,
  factRevelations,
  storyThreads,
  threadEvents,
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
  finalizations,
  derivedInvalidations,
} from './schema.js';

export function createSqliteRepositories(database: StoryDatabase): RepositorySet {
  return {
    books: new SqliteBookRepository(database),
    plans: new SqlitePlanRepository(database),
    chapters: new SqliteChapterRepository(database),
    drafts: new SqliteDraftRepository(database),
    entities: new SqliteEntityRepository(database),
    facts: new SqliteFactRepository(database),
    factRevelations: new SqliteFactRevelationRepository(database),
    threads: new SqliteThreadRepository(database),
    search: new SqliteSearchRepository(database),
    invalidations: new SqliteInvalidationRepository(database),
    proposals: new SqliteProposalRepository(database),
    reviews: new SqliteReviewRepository(database),
    finalizations: new SqliteFinalizationRepository(database),
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

export class SqliteEntityRepository implements EntityRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: string, id: string) {
    const row = this.database
      .select()
      .from(entities)
      .where(and(eq(entities.bookId, bookId), eq(entities.id, id)))
      .get();
    return row === undefined ? null : mapEntity(row);
  }

  async list(bookId: string) {
    return this.database
      .select()
      .from(entities)
      .where(eq(entities.bookId, bookId))
      .orderBy(asc(entities.name))
      .all()
      .map(mapEntity);
  }

  async create(entity: Parameters<EntityRepository['create']>[0], expectedBookRevision: number) {
    try {
      return this.database.transaction((tx) => {
        const book = tx.select().from(books).where(eq(books.id, entity.bookId)).get();
        if (book === undefined || book.bookRevision !== expectedBookRevision) return null;
        const duplicate = tx
          .select()
          .from(entities)
          .where(and(eq(entities.bookId, entity.bookId), eq(entities.name, entity.name)))
          .get();
        if (duplicate !== undefined) return null;

        tx.insert(entities)
          .values({
            id: entity.id,
            bookId: entity.bookId,
            kind: entity.kind,
            name: entity.name,
            aliasesJson: stringifyJson(entity.aliases),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
          })
          .run();
        const updated = tx
          .update(books)
          .set({ bookRevision: expectedBookRevision + 1, updatedAt: entity.updatedAt })
          .where(and(eq(books.id, entity.bookId), eq(books.bookRevision, expectedBookRevision)))
          .run();
        if (updated.changes !== 1) throw new RevisionRaceError();
        return { entity, bookRevision: expectedBookRevision + 1 };
      });
    } catch (error) {
      if (error instanceof RevisionRaceError) return null;
      throw error;
    }
  }

  async updateAliases(
    bookId: string,
    id: string,
    aliases: readonly string[],
    expectedBookRevision: number,
    updatedAt: string,
  ) {
    try {
      return this.database.transaction((tx) => {
        const book = tx.select().from(books).where(eq(books.id, bookId)).get();
        const entity = tx
          .select()
          .from(entities)
          .where(and(eq(entities.bookId, bookId), eq(entities.id, id)))
          .get();
        if (book === undefined || entity === undefined || book.bookRevision !== expectedBookRevision) {
          return null;
        }
        tx.update(entities)
          .set({ aliasesJson: stringifyJson(aliases), updatedAt })
          .where(and(eq(entities.bookId, bookId), eq(entities.id, id)))
          .run();
        const updated = tx
          .update(books)
          .set({ bookRevision: expectedBookRevision + 1, updatedAt })
          .where(and(eq(books.id, bookId), eq(books.bookRevision, expectedBookRevision)))
          .run();
        if (updated.changes !== 1) throw new RevisionRaceError();
        return {
          entity: mapEntity({ ...entity, aliasesJson: stringifyJson(aliases), updatedAt }),
          bookRevision: expectedBookRevision + 1,
        };
      });
    } catch (error) {
      if (error instanceof RevisionRaceError) return null;
      throw error;
    }
  }
}

export class SqliteFactRepository implements FactRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(bookId: string, id: string) {
    const row = this.database
      .select()
      .from(facts)
      .where(and(eq(facts.bookId, bookId), eq(facts.id, id)))
      .get();
    return row === undefined ? null : mapFact(row);
  }

  async listByEntity(bookId: string, entityId: string) {
    return this.database
      .select()
      .from(facts)
      .where(and(eq(facts.bookId, bookId), eq(facts.entityId, entityId)))
      .orderBy(asc(facts.predicate), asc(facts.validFromChapter), asc(facts.revision))
      .all()
      .map(mapFact);
  }

  async appendVersion(fact: FactAppendInput, expectedBookRevision: number) {
    try {
      return this.database.transaction((tx) => {
        const book = tx.select().from(books).where(eq(books.id, fact.bookId)).get();
        const entity = tx
          .select()
          .from(entities)
          .where(and(eq(entities.bookId, fact.bookId), eq(entities.id, fact.entityId)))
          .get();
        if (book === undefined || entity === undefined || book.bookRevision !== expectedBookRevision) {
          return null;
        }

        const history = tx
          .select()
          .from(facts)
          .where(and(eq(facts.entityId, fact.entityId), eq(facts.predicate, fact.predicate)))
          .orderBy(desc(facts.validFromChapter), desc(facts.revision))
          .all();
        if (history.some((row) => row.validFromChapter >= fact.validFromChapter)) return null;
        const previous = history.find(
          (row) =>
            row.validFromChapter < fact.validFromChapter &&
            (row.validToChapter === null || row.validToChapter >= fact.validFromChapter),
        );
        if (previous !== undefined) {
          tx.update(facts)
            .set({ validToChapter: fact.validFromChapter - 1, updatedAt: fact.updatedAt })
            .where(eq(facts.id, previous.id))
            .run();
        }
        const revision = history.reduce((highest, row) => Math.max(highest, row.revision), 0) + 1;
        const row = {
          id: fact.id,
          bookId: fact.bookId,
          entityId: fact.entityId,
          predicate: fact.predicate,
          valueJson: stringifyJson(fact.value),
          validFromChapter: fact.validFromChapter,
          validToChapter: null,
          sourceKind: fact.sourceKind,
          sourceId: fact.sourceId,
          sourceHash: fact.sourceHash,
          revision,
          createdAt: fact.createdAt,
          updatedAt: fact.updatedAt,
        };
        tx.insert(facts).values(row).run();
        const updated = tx
          .update(books)
          .set({ bookRevision: expectedBookRevision + 1, updatedAt: fact.updatedAt })
          .where(and(eq(books.id, fact.bookId), eq(books.bookRevision, expectedBookRevision)))
          .run();
        if (updated.changes !== 1) throw new RevisionRaceError();
        return { fact: mapFact(row), bookRevision: expectedBookRevision + 1 };
      });
    } catch (error) {
      if (error instanceof RevisionRaceError) return null;
      throw error;
    }
  }

  async project(bookId: string, chapterNumber: number) {
    const entityRows = await new SqliteEntityRepository(this.database).list(bookId);
    const factRows = this.database
      .select()
      .from(facts)
      .where(eq(facts.bookId, bookId))
      .all()
      .map(mapFact);
    return entityRows.map((entity) => ({
      entity,
      facts: factRows.filter(
        (fact) =>
          fact.entityId === entity.id &&
          fact.validFromChapter <= chapterNumber &&
          (fact.validToChapter === null || fact.validToChapter >= chapterNumber),
      ),
    }));
  }
}

export class SqliteFactRevelationRepository implements FactRevelationRepository {
  constructor(private readonly database: StoryDatabase) {}

  async create(
    revelation: Parameters<FactRevelationRepository['create']>[0],
    expectedBookRevision: number,
  ) {
    try {
      return this.database.transaction((tx) => {
        const book = tx.select().from(books).where(eq(books.id, revelation.bookId)).get();
        const fact = tx
          .select()
          .from(facts)
          .where(and(eq(facts.bookId, revelation.bookId), eq(facts.id, revelation.factId)))
          .get();
        const chapter = tx
          .select()
          .from(chapters)
          .where(and(eq(chapters.bookId, revelation.bookId), eq(chapters.id, revelation.chapterId)))
          .get();
        const duplicate = tx
          .select()
          .from(factRevelations)
          .where(eq(factRevelations.id, revelation.id))
          .get();
        if (
          book === undefined ||
          fact === undefined ||
          chapter === undefined ||
          duplicate !== undefined ||
          book.bookRevision !== expectedBookRevision
        ) {
          return null;
        }
        const row = {
          id: revelation.id,
          bookId: revelation.bookId,
          factId: revelation.factId,
          chapterId: revelation.chapterId,
          sourceHash: revelation.sourceHash,
          textRangeJson:
            revelation.textRange === null ? null : stringifyJson(revelation.textRange),
          visibility: revelation.visibility,
          knownToEntityId: revelation.knownToEntityId,
          createdAt: revelation.createdAt,
          updatedAt: revelation.updatedAt,
        };
        tx.insert(factRevelations).values(row).run();
        const updated = tx
          .update(books)
          .set({ bookRevision: expectedBookRevision + 1, updatedAt: revelation.updatedAt })
          .where(and(eq(books.id, revelation.bookId), eq(books.bookRevision, expectedBookRevision)))
          .run();
        if (updated.changes !== 1) throw new RevisionRaceError();
        return { revelation: mapFactRevelation(row), bookRevision: expectedBookRevision + 1 };
      });
    } catch (error) {
      if (error instanceof RevisionRaceError) return null;
      throw error;
    }
  }

  async listByFact(bookId: string, factId: string) {
    return this.database
      .select()
      .from(factRevelations)
      .where(and(eq(factRevelations.bookId, bookId), eq(factRevelations.factId, factId)))
      .orderBy(asc(factRevelations.createdAt))
      .all()
      .map(mapFactRevelation);
  }

  async listForChapter(bookId: string, chapterId: string) {
    return this.database
      .select()
      .from(factRevelations)
      .where(and(eq(factRevelations.bookId, bookId), eq(factRevelations.chapterId, chapterId)))
      .orderBy(asc(factRevelations.createdAt))
      .all()
      .map(mapFactRevelation);
  }

  async listByVisibility(bookId: string, visibility: Parameters<FactRevelationRepository['listByVisibility']>[1]) {
    return this.database
      .select()
      .from(factRevelations)
      .where(and(eq(factRevelations.bookId, bookId), eq(factRevelations.visibility, visibility)))
      .orderBy(asc(factRevelations.createdAt))
      .all()
      .map(mapFactRevelation);
  }
}

export class SqliteThreadRepository implements ThreadRepository {
  constructor(private readonly database: StoryDatabase) {}

  async create(
    thread: Parameters<ThreadRepository['create']>[0],
    expectedBookRevision: number,
  ) {
    try {
      return this.database.transaction((tx) => {
        const book = tx.select().from(books).where(eq(books.id, thread.bookId)).get();
        const duplicate = tx
          .select()
          .from(storyThreads)
          .where(and(eq(storyThreads.bookId, thread.bookId), eq(storyThreads.name, thread.name)))
          .get();
        if (book === undefined || duplicate !== undefined || book.bookRevision !== expectedBookRevision) {
          return null;
        }
        tx.insert(storyThreads)
          .values({
            id: thread.id,
            bookId: thread.bookId,
            kind: thread.kind,
            name: thread.name,
            plannedPayoff: thread.plannedPayoff,
            status: thread.status,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
          })
          .run();
        const updated = tx
          .update(books)
          .set({ bookRevision: expectedBookRevision + 1, updatedAt: thread.updatedAt })
          .where(and(eq(books.id, thread.bookId), eq(books.bookRevision, expectedBookRevision)))
          .run();
        if (updated.changes !== 1) throw new RevisionRaceError();
        return { thread, bookRevision: expectedBookRevision + 1 };
      });
    } catch (error) {
      if (error instanceof RevisionRaceError) return null;
      throw error;
    }
  }

  async get(bookId: string, id: string) {
    const row = this.database
      .select()
      .from(storyThreads)
      .where(and(eq(storyThreads.bookId, bookId), eq(storyThreads.id, id)))
      .get();
    return row === undefined ? null : mapThread(row);
  }

  async list(bookId: string) {
    return this.database
      .select()
      .from(storyThreads)
      .where(eq(storyThreads.bookId, bookId))
      .orderBy(asc(storyThreads.updatedAt), asc(storyThreads.id))
      .all()
      .map(mapThread);
  }

  async appendEvent(
    event: Parameters<ThreadRepository['appendEvent']>[0],
    nextStatus: Parameters<ThreadRepository['appendEvent']>[1],
    expectedBookRevision: number,
  ) {
    try {
      return this.database.transaction((tx) => {
        const book = tx.select().from(books).where(eq(books.id, event.bookId)).get();
        const thread = tx
          .select()
          .from(storyThreads)
          .where(and(eq(storyThreads.bookId, event.bookId), eq(storyThreads.id, event.threadId)))
          .get();
        const duplicate = tx
          .select()
          .from(threadEvents)
          .where(eq(threadEvents.id, event.id))
          .get();
        if (
          book === undefined ||
          thread === undefined ||
          duplicate !== undefined ||
          thread.status !== 'open' ||
          book.bookRevision !== expectedBookRevision
        ) {
          return null;
        }
        const row = {
          id: event.id,
          bookId: event.bookId,
          threadId: event.threadId,
          kind: event.kind,
          chapterId: event.chapterId,
          evidenceKind: event.evidenceKind,
          sourceId: event.sourceId,
          sourceHash: event.sourceHash,
          textRangeJson: event.textRange === null ? null : stringifyJson(event.textRange),
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        };
        tx.insert(threadEvents).values(row).run();
        tx.update(storyThreads)
          .set({ status: nextStatus, updatedAt: event.updatedAt })
          .where(eq(storyThreads.id, event.threadId))
          .run();
        const updated = tx
          .update(books)
          .set({ bookRevision: expectedBookRevision + 1, updatedAt: event.updatedAt })
          .where(and(eq(books.id, event.bookId), eq(books.bookRevision, expectedBookRevision)))
          .run();
        if (updated.changes !== 1) throw new RevisionRaceError();
        return {
          event,
          thread: { ...mapThread(thread), status: nextStatus, updatedAt: event.updatedAt },
          bookRevision: expectedBookRevision + 1,
        };
      });
    } catch (error) {
      if (error instanceof RevisionRaceError) return null;
      throw error;
    }
  }

  async listEvents(bookId: string, threadId: string) {
    return this.database
      .select()
      .from(threadEvents)
      .where(and(eq(threadEvents.bookId, bookId), eq(threadEvents.threadId, threadId)))
      .orderBy(asc(threadEvents.createdAt), asc(threadEvents.id))
      .all()
      .map(mapThreadEvent);
  }
}

export class SqliteSearchRepository implements SearchRepository {
  constructor(private readonly database: StoryDatabase) {}

  async rebuild(bookId: string) {
    const client = this.database.$client;
    const chapterRows = this.database
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookId))
      .all();
    const currentChapters = new Map(
      chapterRows.map((chapter) => [chapter.id, chapter]),
    );
    const finalizationRows = this.database.select().from(finalizations).all();
    const entitiesByBook = this.database
      .select()
      .from(entities)
      .where(eq(entities.bookId, bookId))
      .all()
      .map((entity) => ({
        id: entity.id,
        name: entity.name,
        aliases: parseStringArray(entity.aliasesJson),
      }));
    const currentFinalizations = finalizationRows.flatMap((finalization) => {
      const chapter = currentChapters.get(finalization.chapterId);
      if (chapter === undefined || chapter.currentFinalizationId !== finalization.id) return [];
      return [{ finalization, chapter }];
    });

    const rebuild = client.transaction(() => {
      client.prepare('DELETE FROM chapter_fts WHERE book_id = ?').run(bookId);
      client.prepare('DELETE FROM entity_mentions WHERE book_id = ?').run(bookId);
      const insertChapter = client.prepare(
        `INSERT INTO chapter_fts (
          finalization_id, book_id, chapter_id, chapter_number, content
        ) VALUES (?, ?, ?, ?, ?)`,
      );
      const insertMention = client.prepare(
        `INSERT INTO entity_mentions (
          book_id, entity_id, term, match_kind, finalization_id,
          chapter_id, chapter_number, start_char, end_char
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      let mentionCount = 0;
      for (const { finalization, chapter } of currentFinalizations) {
        insertChapter.run(
          finalization.id,
          bookId,
          chapter.id,
          chapter.chapterNumber,
          finalization.content,
        );
        for (const entity of entitiesByBook) {
          const terms = new Map<string, 'name' | 'alias'>();
          terms.set(entity.name, 'name');
          for (const alias of entity.aliases) {
            if (!terms.has(alias)) terms.set(alias, 'alias');
          }
          for (const [term, matchKind] of terms) {
            for (const position of findOccurrences(finalization.content, term)) {
              insertMention.run(
                bookId,
                entity.id,
                term,
                matchKind,
                finalization.id,
                chapter.id,
                chapter.chapterNumber,
                position.start,
                position.end,
              );
              mentionCount += 1;
            }
          }
        }
      }
      return { indexedChapters: currentFinalizations.length, indexedEntityMentions: mentionCount };
    });
    return rebuild();
  }

  async search(bookId: string, query: string, limit: number) {
    const client = this.database.$client;
    const exactRows = client
      .prepare(
        `SELECT entity_id, match_kind, finalization_id, chapter_id, chapter_number,
                start_char, end_char, term
         FROM entity_mentions
         WHERE book_id = ? AND term = ?
         ORDER BY CASE match_kind WHEN 'name' THEN 0 ELSE 1 END, chapter_number, id
         LIMIT ?`,
      )
      .all(bookId, query, limit) as readonly EntityMentionRow[];
    const exactHits = exactRows.map((row) => ({
      kind: 'entity' as const,
      score: row.match_kind === 'name' ? 3 : 2.5,
      reason: row.match_kind === 'name' ? ('entity_exact' as const) : ('entity_alias' as const),
      entityId: parseStableId(row.entity_id),
      finalizationId: parseStableId(row.finalization_id),
      chapterId: parseStableId(row.chapter_id),
      chapterNumber: row.chapter_number,
      position: { start: row.start_char, end: row.end_char },
      excerpt: row.term,
    }));

    const ftsHits = this.searchFts(client, bookId, query, limit);
    return [...exactHits, ...ftsHits]
      .sort(
        (left, right) =>
          right.score - left.score ||
          (left.chapterNumber ?? Number.MAX_SAFE_INTEGER) -
            (right.chapterNumber ?? Number.MAX_SAFE_INTEGER),
      )
      .slice(0, limit);
  }

  private searchFts(
    client: StoryDatabase['$client'],
    bookId: string,
    query: string,
    limit: number,
  ) {
    const rows = this.runFtsQuery(client, bookId, query, limit);
    const candidates = rows.length > 0 ? rows : this.runSubstringQuery(client, bookId, query, limit);
    return candidates.map((row) => {
      const position = findOccurrences(row.content, query)[0] ?? null;
      return {
        kind: 'chapter' as const,
        score: 1,
        reason: 'full_text' as const,
        entityId: null,
        finalizationId: parseStableId(row.finalization_id),
        chapterId: parseStableId(row.chapter_id),
        chapterNumber: row.chapter_number,
        position,
        excerpt: row.excerpt || makeExcerpt(row.content, query),
      };
    });
  }

  private runFtsQuery(
    client: StoryDatabase['$client'],
    bookId: string,
    query: string,
    limit: number,
  ): readonly ChapterSearchRow[] {
    try {
      return client
        .prepare(
          `SELECT finalization_id, chapter_id, chapter_number, content,
                  snippet(chapter_fts, 4, '', '', '…', 24) AS excerpt,
                  bm25(chapter_fts) AS rank
           FROM chapter_fts
           WHERE book_id = ? AND chapter_fts MATCH ?
           ORDER BY rank
           LIMIT ?`,
        )
        .all(bookId, quoteFtsQuery(query), limit) as readonly ChapterSearchRow[];
    } catch {
      return [];
    }
  }

  private runSubstringQuery(
    client: StoryDatabase['$client'],
    bookId: string,
    query: string,
    limit: number,
  ): readonly ChapterSearchRow[] {
    return client
      .prepare(
        `SELECT finalization_id, chapter_id, chapter_number, content,
                '' AS excerpt, 0 AS rank
         FROM chapter_fts
         WHERE book_id = ? AND instr(content, ?) > 0
         ORDER BY chapter_number
         LIMIT ?`,
      )
      .all(bookId, query, limit) as readonly ChapterSearchRow[];
  }
}

export class SqliteInvalidationRepository implements InvalidationRepository {
  constructor(private readonly database: StoryDatabase) {}

  async list(
    bookId: string,
    status?: Parameters<InvalidationRepository['list']>[1],
  ) {
    const rows =
      status === undefined
        ? this.database
            .select()
            .from(derivedInvalidations)
            .where(eq(derivedInvalidations.bookId, bookId))
            .orderBy(asc(derivedInvalidations.createdAt))
            .all()
        : this.database
            .select()
            .from(derivedInvalidations)
            .where(
              and(
                eq(derivedInvalidations.bookId, bookId),
                eq(derivedInvalidations.status, status),
              ),
            )
            .orderBy(asc(derivedInvalidations.createdAt))
            .all();
    return rows.map(mapInvalidation);
  }

  async clear(id: string, clearedAt: string) {
    const result = this.database
      .update(derivedInvalidations)
      .set({ status: 'cleared', clearedAt })
      .where(and(eq(derivedInvalidations.id, id), eq(derivedInvalidations.status, 'pending')))
      .run();
    if (result.changes !== 1) return null;
    const row = this.database
      .select()
      .from(derivedInvalidations)
      .where(eq(derivedInvalidations.id, id))
      .get();
    return row === undefined ? null : mapInvalidation(row);
  }
}

interface EntityMentionRow {
  entity_id: string;
  match_kind: 'name' | 'alias';
  finalization_id: string;
  chapter_id: string;
  chapter_number: number;
  start_char: number;
  end_char: number;
  term: string;
}

interface ChapterSearchRow {
  finalization_id: string;
  chapter_id: string;
  chapter_number: number;
  content: string;
  excerpt: string;
  rank: number;
}

function parseStringArray(value: string): readonly string[] {
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
}

function findOccurrences(content: string, term: string): readonly { start: number; end: number }[] {
  if (term === '') return [];
  const characters = Array.from(content);
  const needle = Array.from(term);
  const positions: { start: number; end: number }[] = [];
  for (let start = 0; start <= characters.length - needle.length; start += 1) {
    if (needle.every((character, offset) => characters[start + offset] === character)) {
      positions.push({ start, end: start + needle.length });
    }
  }
  return positions;
}

function makeExcerpt(content: string, query: string): string {
  const position = findOccurrences(content, query)[0];
  if (position === undefined) return content.slice(0, 120);
  const characters = Array.from(content);
  const start = Math.max(0, position.start - 40);
  const end = Math.min(characters.length, position.end + 80);
  return `${start > 0 ? '…' : ''}${characters.slice(start, end).join('')}${
    end < characters.length ? '…' : ''
  }`;
}

function quoteFtsQuery(query: string): string {
  return `"${query.replaceAll('"', '""')}"`;
}

class RevisionRaceError extends Error {}

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

  async getFinding(findingId: StableId): Promise<ReviewFindingRecord | null> {
    const row = this.database
      .select()
      .from(reviewFindings)
      .where(eq(reviewFindings.id, findingId))
      .get();
    return row === undefined ? null : mapReviewFinding(row);
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

export class SqliteFinalizationRepository implements FinalizationRepository {
  constructor(private readonly database: StoryDatabase) {}

  async get(id: StableId): Promise<FinalizationRecord | null> {
    const row = this.database.select().from(finalizations).where(eq(finalizations.id, id)).get();
    return row === undefined ? null : mapFinalization(row);
  }

  async list(chapterId: StableId): Promise<readonly FinalizationRecord[]> {
    return this.database
      .select()
      .from(finalizations)
      .where(eq(finalizations.chapterId, chapterId))
      .orderBy(desc(finalizations.committedAt))
      .all()
      .map(mapFinalization);
  }

  async finalize(
    finalization: FinalizationRecord,
    expectedBookRevision: number,
    outbox: readonly OutboxJobRecord[],
  ): Promise<{ finalization: FinalizationRecord; bookRevision: number } | null> {
    return this.database.transaction((tx) => {
      const chapter = tx
        .select()
        .from(chapters)
        .where(eq(chapters.id, finalization.chapterId))
        .get();
      if (chapter === undefined) return null;
      const book = tx.select().from(books).where(eq(books.id, chapter.bookId)).get();
      if (book === undefined || book.bookRevision !== expectedBookRevision) return null;
      const bookRevision = expectedBookRevision + 1;
      tx.update(books)
        .set({ bookRevision, updatedAt: finalization.committedAt })
        .where(and(eq(books.id, chapter.bookId), eq(books.bookRevision, expectedBookRevision)))
        .run();
      tx.insert(finalizations)
        .values({
          id: finalization.id,
          chapterId: finalization.chapterId,
          draftVersionId: finalization.draftVersionId,
          content: finalization.content,
          contentHash: finalization.contentHash,
          supersedesId: finalization.supersedesId,
          committedAt: finalization.committedAt,
        })
        .run();
      tx.update(chapters)
        .set({ currentFinalizationId: finalization.id, updatedAt: finalization.committedAt })
        .where(eq(chapters.id, finalization.chapterId))
        .run();
      for (const job of outbox) {
        tx.insert(outboxJobs)
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
      if (finalization.supersedesId !== null) {
        const superseded = tx
          .select()
          .from(finalizations)
          .where(eq(finalizations.id, finalization.supersedesId))
          .get();
        if (superseded !== undefined) {
          const addInvalidation = (objectKind: InvalidationObjectKind, objectId: string) => {
            tx.insert(derivedInvalidations)
              .values({
                id: `invalidate_${objectKind}_${objectId}_${superseded.id}`,
                bookId: chapter.bookId,
                objectKind,
                objectId,
                supersededFinalizationId: superseded.id,
                replacementFinalizationId: finalization.id,
                oldSourceHash: superseded.contentHash,
                newSourceHash: finalization.contentHash,
                reason: 'superseded_finalization',
                status: 'pending',
                createdAt: finalization.committedAt,
                clearedAt: null,
              })
              .onConflictDoNothing()
              .run();
          };

          addInvalidation('chapter_projection', chapter.id);
          addInvalidation('search_index', chapter.id);

          const snapshots = tx
            .select()
            .from(inputSnapshots)
            .where(eq(inputSnapshots.bookId, chapter.bookId))
            .all()
            .filter(
              (snapshot) =>
                snapshot.manifestJson.includes(superseded.id) ||
                snapshot.manifestJson.includes(superseded.contentHash),
            );
          for (const snapshot of snapshots) {
            addInvalidation('input_snapshot', snapshot.id);
            const affectedRuns = tx
              .select()
              .from(runs)
              .where(eq(runs.inputSnapshotId, snapshot.id))
              .all();
            for (const run of affectedRuns) {
              addInvalidation('run', run.id);
              tx.update(runs)
                .set({ status: 'stale', updatedAt: finalization.committedAt })
                .where(eq(runs.id, run.id))
                .run();
              for (const artifact of tx
                .select()
                .from(runArtifacts)
                .where(eq(runArtifacts.runId, run.id))
                .all()) {
                addInvalidation('run_artifact', artifact.id);
              }
              for (const proposal of tx
                .select()
                .from(proposals)
                .where(and(eq(proposals.bookId, chapter.bookId), eq(proposals.sourceRunId, run.id)))
                .all()) {
                if (proposal.status === 'pending') {
                  tx.update(proposals)
                    .set({
                      status: 'stale',
                      revision: proposal.revision + 1,
                      updatedAt: finalization.committedAt,
                    })
                    .where(eq(proposals.id, proposal.id))
                    .run();
                  addInvalidation('proposal', proposal.id);
                }
              }
              const affectedDrafts = tx
                .select()
                .from(draftVersions)
                .where(eq(draftVersions.sourceRunId, run.id))
                .all();
              for (const draft of affectedDrafts) {
                for (const review of tx
                  .select()
                  .from(reviews)
                  .where(eq(reviews.draftVersionId, draft.id))
                  .all()) {
                  addInvalidation('review', review.id);
                }
              }
            }
          }

          for (const fact of tx
            .select()
            .from(facts)
            .where(
              and(
                eq(facts.bookId, chapter.bookId),
                eq(facts.sourceKind, 'finalization'),
                eq(facts.sourceId, superseded.id),
              ),
            )
            .all()) {
            addInvalidation('fact', fact.id);
          }
          for (const revelation of tx
            .select()
            .from(factRevelations)
            .where(
              and(
                eq(factRevelations.bookId, chapter.bookId),
                eq(factRevelations.sourceHash, superseded.contentHash),
              ),
            )
            .all()) {
            addInvalidation('fact_revelation', revelation.id);
          }
          for (const event of tx
            .select()
            .from(threadEvents)
            .where(
              and(eq(threadEvents.bookId, chapter.bookId), eq(threadEvents.sourceId, superseded.id)),
            )
            .all()) {
            addInvalidation('thread_event', event.id);
          }
        }
      }
      return { finalization, bookRevision };
    });
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

  async listModelCalls(runId: StableId): Promise<readonly ModelCallRecord[]> {
    return this.database
      .select()
      .from(modelCalls)
      .where(eq(modelCalls.runId, runId))
      .orderBy(desc(modelCalls.createdAt))
      .all()
      .map(mapModelCall);
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

function mapEntity(row: typeof entities.$inferSelect) {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    kind: row.kind,
    name: row.name,
    aliases: parseJson(row.aliasesJson) as readonly string[],
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapFact(row: typeof facts.$inferSelect) {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    entityId: parseStableId(row.entityId),
    predicate: row.predicate,
    value: parseJson(row.valueJson),
    validFromChapter: row.validFromChapter,
    validToChapter: row.validToChapter,
    sourceKind: row.sourceKind,
    sourceId: parseStableId(row.sourceId),
    sourceHash: parseContentHash(row.sourceHash),
    revision: row.revision,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapFactRevelation(row: typeof factRevelations.$inferSelect) {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    factId: parseStableId(row.factId),
    chapterId: parseStableId(row.chapterId),
    sourceHash: parseContentHash(row.sourceHash),
    textRange:
      row.textRangeJson === null
        ? null
        : (parseJson(row.textRangeJson) as {
            start: number;
            end: number;
            quoteHash: ReturnType<typeof parseContentHash>;
          }),
    visibility: row.visibility,
    knownToEntityId: row.knownToEntityId === null ? null : parseStableId(row.knownToEntityId),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapThread(row: typeof storyThreads.$inferSelect) {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    kind: row.kind,
    name: row.name,
    plannedPayoff: row.plannedPayoff,
    status: row.status,
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapThreadEvent(row: typeof threadEvents.$inferSelect) {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    threadId: parseStableId(row.threadId),
    kind: row.kind,
    chapterId: row.chapterId === null ? null : parseStableId(row.chapterId),
    evidenceKind: row.evidenceKind,
    sourceId: parseStableId(row.sourceId),
    sourceHash: parseContentHash(row.sourceHash),
    textRange:
      row.textRangeJson === null
        ? null
        : (parseJson(row.textRangeJson) as {
            start: number;
            end: number;
            quoteHash: ReturnType<typeof parseContentHash>;
          }),
    createdAt: parseUtcDateTime(row.createdAt),
    updatedAt: parseUtcDateTime(row.updatedAt),
  };
}

function mapInvalidation(row: typeof derivedInvalidations.$inferSelect) {
  return {
    id: parseStableId(row.id),
    bookId: parseStableId(row.bookId),
    objectKind: row.objectKind,
    objectId: parseStableId(row.objectId),
    supersededFinalizationId: parseStableId(row.supersededFinalizationId),
    replacementFinalizationId: parseStableId(row.replacementFinalizationId),
    oldSourceHash: parseContentHash(row.oldSourceHash),
    newSourceHash: parseContentHash(row.newSourceHash),
    reason: row.reason,
    status: row.status,
    createdAt: parseUtcDateTime(row.createdAt),
    clearedAt: row.clearedAt === null ? null : parseUtcDateTime(row.clearedAt),
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

function mapFinalization(row: typeof finalizations.$inferSelect): FinalizationRecord {
  return {
    id: parseStableId(row.id),
    chapterId: parseStableId(row.chapterId),
    draftVersionId: parseStableId(row.draftVersionId),
    content: row.content,
    contentHash: parseContentHash(row.contentHash),
    supersedesId: row.supersedesId === null ? null : parseStableId(row.supersedesId),
    committedAt: parseUtcDateTime(row.committedAt),
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
