import {
  parseContentHash,
  type BookRevision,
  type ClientRequestId,
  type EntityRecord,
  type EntityStateProjection,
  type FactRecord,
  type FactSourceKind,
  type IsoUtcDateTime,
  type StableId,
} from '@dreamstory/contracts';

import type {
  CommandReceiptRepository,
  EntityRepository,
  FactRepository,
  RepositorySet,
} from './repositories.js';

const CREATE_ENTITY_COMMAND = 'create_entity';
const UPDATE_ENTITY_ALIASES_COMMAND = 'update_entity_aliases';
const APPEND_FACT_COMMAND = 'append_fact';

export interface CreateEntityCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  entity: Omit<EntityRecord, 'createdAt' | 'updatedAt'>;
  now: IsoUtcDateTime;
}

export interface UpdateEntityAliasesCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  entityId: StableId;
  expectedBookRevision: BookRevision;
  aliases: readonly string[];
  now: IsoUtcDateTime;
}

export interface AppendFactCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  fact: {
    id: StableId;
    entityId: StableId;
    predicate: string;
    value: unknown;
    validFromChapter: number;
    sourceKind: FactSourceKind;
    sourceId: StableId;
    sourceHash: string;
  };
  now: IsoUtcDateTime;
}

export interface ContinuityWriteResult<T> {
  value: T;
  bookRevision: BookRevision;
  replayed: boolean;
}

export class ContinuityCommandError extends Error {
  readonly code: 'NOT_FOUND' | 'REVISION_CONFLICT' | 'VALIDATION_ERROR' | 'ALREADY_EXISTS';

  constructor(
    code: ContinuityCommandError['code'],
    message: string,
  ) {
    super(message);
    this.name = 'ContinuityCommandError';
    this.code = code;
  }
}

export class ContinuityService {
  private readonly entities: EntityRepository;

  private readonly facts: FactRepository;

  private readonly receipts: CommandReceiptRepository;

  constructor(repositories: Pick<RepositorySet, 'entities' | 'facts' | 'commandReceipts'>) {
    this.entities = repositories.entities;
    this.facts = repositories.facts;
    this.receipts = repositories.commandReceipts;
  }

  async createEntity(command: CreateEntityCommand): Promise<ContinuityWriteResult<EntityRecord>> {
    const replay = await this.receipts.find(
      command.bookId,
      CREATE_ENTITY_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) return parseWriteResult<EntityRecord>(replay.result, true);

    const entity = normalizeEntity(command.entity);
    const existing = (await this.entities.list(command.bookId)).find(
      (candidate) => candidate.name === entity.name,
    );
    if (existing !== undefined) {
      throw new ContinuityCommandError('ALREADY_EXISTS', 'An entity with this name already exists.');
    }

    const saved = await this.entities.create(
      { ...entity, createdAt: command.now, updatedAt: command.now },
      command.expectedBookRevision,
    );
    if (saved === null) {
      throw new ContinuityCommandError('REVISION_CONFLICT', 'The book revision has changed.');
    }

    const result = { value: saved.entity, bookRevision: saved.bookRevision, replayed: false };
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: CREATE_ENTITY_COMMAND,
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.now,
    });
    return result;
  }

  async updateAliases(
    command: UpdateEntityAliasesCommand,
  ): Promise<ContinuityWriteResult<EntityRecord>> {
    const replay = await this.receipts.find(
      command.bookId,
      UPDATE_ENTITY_ALIASES_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) return parseWriteResult<EntityRecord>(replay.result, true);

    const entity = await this.entities.get(command.bookId, command.entityId);
    if (entity === null) {
      throw new ContinuityCommandError('NOT_FOUND', 'The entity does not exist.');
    }
    const aliases = normalizeAliases(entity.name, command.aliases);
    const saved = await this.entities.updateAliases(
      command.bookId,
      command.entityId,
      aliases,
      command.expectedBookRevision,
      command.now,
    );
    if (saved === null) {
      throw new ContinuityCommandError('REVISION_CONFLICT', 'The book revision has changed.');
    }

    const result = { value: saved.entity, bookRevision: saved.bookRevision, replayed: false };
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: UPDATE_ENTITY_ALIASES_COMMAND,
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.now,
    });
    return result;
  }

  async appendFact(command: AppendFactCommand): Promise<ContinuityWriteResult<FactRecord>> {
    const replay = await this.receipts.find(
      command.bookId,
      APPEND_FACT_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) return parseWriteResult(replay.result, true);

    const entity = await this.entities.get(command.bookId, command.fact.entityId);
    if (entity === null) {
      throw new ContinuityCommandError('NOT_FOUND', 'The fact entity does not exist.');
    }
    validateFact(command.fact.predicate, command.fact.value, command.fact.validFromChapter);
    const saved = await this.facts.appendVersion(
      {
        ...command.fact,
        bookId: command.bookId,
        sourceHash: parseContentHash(command.fact.sourceHash),
        createdAt: command.now,
        updatedAt: command.now,
      },
      command.expectedBookRevision,
    );
    if (saved === null) {
      throw new ContinuityCommandError('REVISION_CONFLICT', 'The fact could not be appended.');
    }

    const result = { value: saved.fact, bookRevision: saved.bookRevision, replayed: false };
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: APPEND_FACT_COMMAND,
      clientRequestId: command.clientRequestId,
      result,
      createdAt: command.now,
    });
    return result;
  }

  async project(bookId: StableId, chapterNumber: number): Promise<readonly EntityStateProjection[]> {
    if (!Number.isSafeInteger(chapterNumber) || chapterNumber < 1) {
      throw new ContinuityCommandError('VALIDATION_ERROR', 'chapterNumber must be positive.');
    }
    return this.facts.project(bookId, chapterNumber);
  }
}

function normalizeEntity(entity: CreateEntityCommand['entity']): CreateEntityCommand['entity'] {
  if (entity.name.trim() === '') {
    throw new ContinuityCommandError('VALIDATION_ERROR', 'Entity name must not be empty.');
  }
  if (!['character', 'location', 'organization', 'item', 'world'].includes(entity.kind)) {
    throw new ContinuityCommandError('VALIDATION_ERROR', 'Entity kind is invalid.');
  }
  return { ...entity, name: entity.name.trim(), aliases: normalizeAliases(entity.name, entity.aliases) };
}

function normalizeAliases(name: string, aliases: readonly string[]): readonly string[] {
  const unique = new Set<string>();
  for (const alias of aliases) {
    const normalized = alias.trim();
    if (normalized === '' || normalized === name.trim()) {
      throw new ContinuityCommandError('VALIDATION_ERROR', 'Entity aliases must be distinct names.');
    }
    unique.add(normalized);
  }
  return [...unique];
}

function validateFact(predicate: string, value: unknown, validFromChapter: number): void {
  if (predicate.trim() === '') {
    throw new ContinuityCommandError('VALIDATION_ERROR', 'Fact predicate must not be empty.');
  }
  if (!Number.isSafeInteger(validFromChapter) || validFromChapter < 1) {
    throw new ContinuityCommandError('VALIDATION_ERROR', 'Fact validFromChapter must be positive.');
  }
  try {
    if (JSON.stringify(value) === undefined) throw new Error('undefined');
  } catch {
    throw new ContinuityCommandError('VALIDATION_ERROR', 'Fact value must be JSON serializable.');
  }
}

function parseWriteResult<T>(value: unknown, replayed: boolean): ContinuityWriteResult<T> {
  if (!isRecord(value) || !isRecord(value['value']) || typeof value['bookRevision'] !== 'number') {
    throw new Error('Continuity idempotency receipt contains an invalid result.');
  }
  return {
    value: value['value'] as T,
    bookRevision: value['bookRevision'],
    replayed,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
