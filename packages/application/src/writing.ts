import type {
  BookRevision,
  ClientRequestId,
  DraftCreatedBy,
  IsoUtcDateTime,
  PlanContent,
  PlanKind,
  StableId,
} from '@dreamstory/contracts';

import type {
  ChapterRecord,
  ChapterRepository,
  CommandReceiptRepository,
  DraftRepository,
  DraftSaveResult,
  PlanNodeRecord,
  PlanNodeSaveResult,
  PlanRepository,
} from './repositories.js';

const SAVE_PLAN_NODE_COMMAND = 'save_plan_node';
const CREATE_CHAPTER_COMMAND = 'create_chapter';
const SAVE_DRAFT_COMMAND = 'save_draft';
const RESTORE_DRAFT_COMMAND = 'restore_draft';

export interface PlanNodeCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  node: Omit<PlanNodeRecord, 'version' | 'createdAt' | 'updatedAt'>;
  now: IsoUtcDateTime;
}

export interface PlanNodeCommandResult extends PlanNodeSaveResult {
  replayed: boolean;
}

export interface CreateChapterCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  chapter: Omit<ChapterRecord, 'createdAt' | 'updatedAt'>;
  now: IsoUtcDateTime;
}

export interface CreateChapterResult {
  chapter: ChapterRecord;
  bookRevision: BookRevision;
  replayed: boolean;
}

export interface SaveDraftCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  chapterId: StableId;
  draftId: StableId;
  expectedDraftRevision: number;
  content: string;
  complete: boolean;
  createdBy: Extract<DraftCreatedBy, 'author' | 'restore'>;
  now: IsoUtcDateTime;
}

export interface SaveDraftResult extends DraftSaveResult {
  replayed: boolean;
}

export interface RestoreDraftCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  chapterId: StableId;
  sourceDraftId: StableId;
  draftId: StableId;
  expectedDraftRevision: number;
  now: IsoUtcDateTime;
}

export class WritingCommandError extends Error {
  readonly code:
    'NOT_FOUND' | 'REVISION_CONFLICT' | 'DRAFT_CONFLICT' | 'VALIDATION_ERROR' | 'ALREADY_EXISTS';

  readonly currentBookRevision: BookRevision | undefined;

  readonly currentDraftRevision: number | undefined;

  constructor(
    code: WritingCommandError['code'],
    message: string,
    details: { currentBookRevision?: BookRevision; currentDraftRevision?: number } = {},
  ) {
    super(message);
    this.name = 'WritingCommandError';
    this.code = code;
    this.currentBookRevision = details.currentBookRevision;
    this.currentDraftRevision = details.currentDraftRevision;
  }
}

export class PlanService {
  constructor(
    private readonly plans: PlanRepository,
    private readonly receipts: CommandReceiptRepository,
  ) {}

  async saveNode(command: PlanNodeCommand): Promise<PlanNodeCommandResult> {
    const replay = await this.receipts.find(
      command.bookId,
      SAVE_PLAN_NODE_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) {
      return { ...parsePlanResult(replay.result), replayed: true };
    }

    await validatePlanNode(this.plans, command.bookId, command.node);
    const saved = await this.plans.save(
      {
        ...command.node,
        createdAt: command.now,
        updatedAt: command.now,
      },
      command.expectedBookRevision,
    );
    if (saved === null) {
      throw new WritingCommandError('REVISION_CONFLICT', 'The book revision has changed.');
    }

    await this.receipts.save({
      bookId: command.bookId,
      commandKind: SAVE_PLAN_NODE_COMMAND,
      clientRequestId: command.clientRequestId,
      result: saved,
      createdAt: command.now,
    });
    return { ...saved, replayed: false };
  }
}

export class ChapterService {
  constructor(
    private readonly chapters: ChapterRepository,
    private readonly plans: PlanRepository,
    private readonly receipts: CommandReceiptRepository,
  ) {}

  async create(command: CreateChapterCommand): Promise<CreateChapterResult> {
    const replay = await this.receipts.find(
      command.bookId,
      CREATE_CHAPTER_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) {
      return { ...parseChapterResult(replay.result), replayed: true };
    }

    const plan = await this.plans.get(command.bookId, command.chapter.planNodeId);
    if (plan === null) {
      throw new WritingCommandError('NOT_FOUND', 'The chapter plan does not exist.');
    }
    if (plan.kind !== 'chapter') {
      throw new WritingCommandError(
        'VALIDATION_ERROR',
        'A chapter must reference a chapter plan node.',
      );
    }

    const existing = await this.chapters.get(command.bookId, command.chapter.id);
    if (existing !== null) {
      throw new WritingCommandError('ALREADY_EXISTS', 'The chapter already exists.');
    }

    const chapter: ChapterRecord = {
      ...command.chapter,
      createdAt: command.now,
      updatedAt: command.now,
    };
    const saved = await this.chapters.create(chapter, command.expectedBookRevision);
    if (saved === null) {
      throw new WritingCommandError('REVISION_CONFLICT', 'The book revision has changed.');
    }

    const result = { chapter: saved.chapter, bookRevision: saved.bookRevision };
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: CREATE_CHAPTER_COMMAND,
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.now,
    });
    return { ...result, replayed: false };
  }
}

export class DraftService {
  constructor(
    private readonly chapters: ChapterRepository,
    private readonly drafts: DraftRepository,
    private readonly receipts: CommandReceiptRepository,
  ) {}

  async save(command: SaveDraftCommand): Promise<SaveDraftResult> {
    const replay = await this.receipts.find(
      command.bookId,
      SAVE_DRAFT_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) {
      return { ...parseDraftResult(replay.result), replayed: true };
    }

    const chapter = await this.chapters.get(command.bookId, command.chapterId);
    if (chapter === null) {
      throw new WritingCommandError('NOT_FOUND', 'The chapter does not exist.');
    }

    const saved = await this.drafts.save(
      {
        id: command.draftId,
        chapterId: command.chapterId,
        content: command.content,
        complete: command.complete,
        sourceRunId: null,
        createdBy: command.createdBy,
        createdAt: command.now,
      },
      command.expectedDraftRevision,
    );
    if (saved === null) {
      const current = await this.drafts.current(command.chapterId);
      throw new WritingCommandError('DRAFT_CONFLICT', 'The draft revision has changed.', {
        currentDraftRevision: current?.revision ?? 0,
      });
    }

    await this.receipts.save({
      bookId: command.bookId,
      commandKind: SAVE_DRAFT_COMMAND,
      clientRequestId: command.clientRequestId,
      result: saved,
      createdAt: command.now,
    });
    return { ...saved, replayed: false };
  }

  async restore(command: RestoreDraftCommand): Promise<SaveDraftResult> {
    const replay = await this.receipts.find(
      command.bookId,
      RESTORE_DRAFT_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) {
      return { ...parseDraftResult(replay.result), replayed: true };
    }

    const source = await this.drafts.get(command.sourceDraftId);
    if (source === null || source.chapterId !== command.chapterId) {
      throw new WritingCommandError('NOT_FOUND', 'The source draft does not exist.');
    }

    const result = await this.save({
      bookId: command.bookId,
      clientRequestId: command.clientRequestId,
      chapterId: command.chapterId,
      draftId: command.draftId,
      expectedDraftRevision: command.expectedDraftRevision,
      content: source.content,
      complete: source.complete,
      createdBy: 'restore',
      now: command.now,
    });
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: RESTORE_DRAFT_COMMAND,
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.now,
    });
    return result;
  }
}

async function validatePlanNode(
  plans: PlanRepository,
  bookId: StableId,
  node: PlanNodeCommand['node'],
): Promise<void> {
  if (node.bookId !== bookId) {
    throw new WritingCommandError('VALIDATION_ERROR', 'The plan node belongs to another book.');
  }
  if (node.sortKey.trim() === '') {
    throw new WritingCommandError('VALIDATION_ERROR', 'sortKey must not be empty.');
  }
  validatePlanContent(node.content);

  const current = await plans.get(bookId, node.id);
  if (current !== null && current.kind !== node.kind) {
    throw new WritingCommandError('VALIDATION_ERROR', 'A plan node kind cannot change.');
  }

  if (node.parentId === null) {
    if (node.kind !== 'book') {
      throw new WritingCommandError('VALIDATION_ERROR', 'Only a book plan can be a root node.');
    }
    return;
  }

  if (node.parentId === node.id) {
    throw new WritingCommandError('VALIDATION_ERROR', 'A plan node cannot be its own parent.');
  }

  const parent = await plans.get(bookId, node.parentId);
  if (parent === null) {
    throw new WritingCommandError('NOT_FOUND', 'The parent plan node does not exist.');
  }
  const expectedParent: Record<PlanKind, PlanKind | null> = {
    book: null,
    volume: 'book',
    arc: 'volume',
    chapter: 'arc',
  };
  if (parent.kind !== expectedParent[node.kind]) {
    throw new WritingCommandError('VALIDATION_ERROR', 'The plan node has an invalid parent kind.');
  }
}

function validatePlanContent(content: PlanContent): void {
  for (const value of [
    content.title,
    content.goal,
    content.conflict,
    content.startState,
    content.endState,
  ]) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new WritingCommandError('VALIDATION_ERROR', 'Plan content contains an empty field.');
    }
  }
  if (
    !Array.isArray(content.requiredBeats) ||
    content.requiredBeats.some((beat) => typeof beat !== 'string') ||
    !Array.isArray(content.avoid) ||
    content.avoid.some((item) => typeof item !== 'string')
  ) {
    throw new WritingCommandError(
      'VALIDATION_ERROR',
      'Plan beats and avoid lists must be strings.',
    );
  }
}

function parsePlanResult(value: unknown): PlanNodeSaveResult {
  if (!isRecord(value) || !isRecord(value['node'])) {
    throw new Error('The plan idempotency receipt contains an invalid result.');
  }
  return value as unknown as PlanNodeSaveResult;
}

function parseChapterResult(value: unknown): Omit<CreateChapterResult, 'replayed'> {
  if (!isRecord(value) || !isRecord(value['chapter'])) {
    throw new Error('The chapter idempotency receipt contains an invalid result.');
  }
  return value as Omit<CreateChapterResult, 'replayed'>;
}

function parseDraftResult(value: unknown): DraftSaveResult {
  if (!isRecord(value) || !isRecord(value['draft'])) {
    throw new Error('The draft idempotency receipt contains an invalid result.');
  }
  return value as unknown as DraftSaveResult;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
