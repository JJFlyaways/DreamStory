import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';

import {
  BookCommandError,
  BookService,
  ChapterService,
  DraftService,
  PlanService,
  WritingCommandError,
  renderBookExport,
  type CreateBookCommand,
  type CreateChapterCommand,
  type ExportFormat,
  type BookRecord,
  type PlanNodeCommand,
  type RestoreDraftCommand,
  type SaveDraftCommand,
  type UpdateBookCommand,
} from '@dreamstory/application';
import {
  CONTRACT_VERSION,
  parseClientRequestId,
  parseStableId,
  parseUtcDateTime,
  type BookRevision,
  type ErrorCode,
  type PlanContent,
  type PlanKind,
  type PlanNodeStatus,
  type ServerConfig,
  type StableId,
} from '@dreamstory/contracts';
import {
  createConsistentBackup,
  createMigrationBackupPath,
  initializeProjectDatabase,
  probeProjectDatabase,
  type InitializedProjectDatabase,
  type ProjectDatabaseProbe,
} from '@dreamstory/storage-sqlite';

import { parseServerConfig } from './config.js';
import { SESSION_COOKIE_NAME, SessionManager } from './session.js';

export interface HealthResponse {
  status: 'ok';
  contractVersion: typeof CONTRACT_VERSION;
  database: {
    available: boolean;
    status: ProjectDatabaseProbe['status'] | 'not_selected';
    schemaVersion: number | null;
  };
}

export interface BookShelfEntry {
  bookId: StableId;
  status: 'ready' | 'invalid';
  schemaVersion: number | null;
  book: BookRecord | null;
}

export interface BackupResult {
  fileName: string;
  relativePath: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ExportResult {
  format: ExportFormat;
  fileName: string;
  characterCount: number;
  contentHash: string;
  updatedAt: string;
}

export class BookProjectManager {
  private readonly openProjects = new Map<string, InitializedProjectDatabase>();

  private readonly root: string;

  constructor(libraryRoot: string) {
    this.root = resolve(libraryRoot);
  }

  async createBook(command: CreateBookCommand) {
    const existing = this.openProjects.get(command.bookId);
    if (existing !== undefined) {
      return new BookService(
        existing.repositories.books,
        existing.repositories.commandReceipts,
      ).createBook(command);
    }

    const initialized = await initializeProjectDatabase(this.projectRoot(command.bookId));
    try {
      const result = await new BookService(
        initialized.repositories.books,
        initialized.repositories.commandReceipts,
      ).createBook(command);
      this.openProjects.set(command.bookId, initialized);
      return result;
    } catch (error) {
      initialized.connection.close();
      throw error;
    }
  }

  async getBook(bookId: StableId) {
    const initialized = await this.openBook(bookId);
    return initialized.repositories.books.get(bookId);
  }

  async listBooks(): Promise<readonly BookShelfEntry[]> {
    let entries;
    try {
      entries = await readdir(this.root, { withFileTypes: true });
    } catch (error) {
      if (isNodeError(error, 'ENOENT')) {
        return [];
      }
      throw error;
    }

    const books: BookShelfEntry[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^book_[0-9a-f-]+$/i.test(entry.name)) {
        continue;
      }
      const bookId = parseBookId(entry.name);
      const probe = this.probe(bookId);
      if (probe.status !== 'ready') {
        books.push({
          bookId,
          status: 'invalid',
          schemaVersion: probe.schemaVersion,
          book: null,
        });
        continue;
      }
      try {
        books.push({
          bookId,
          status: 'ready',
          schemaVersion: probe.schemaVersion,
          book: await this.getBook(bookId),
        });
      } catch {
        books.push({
          bookId,
          status: 'invalid',
          schemaVersion: probe.schemaVersion,
          book: null,
        });
      }
    }

    return books.sort((left, right) => {
      const leftTime = left.book?.updatedAt ?? '';
      const rightTime = right.book?.updatedAt ?? '';
      return rightTime.localeCompare(leftTime);
    });
  }

  async updateBook(command: UpdateBookCommand) {
    const initialized = await this.openBook(command.bookId);
    return new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    ).updateBook(command);
  }

  async listPlans(bookId: StableId, includeSuperseded = false) {
    const initialized = await this.openBook(bookId);
    return initialized.repositories.plans.list(bookId, includeSuperseded);
  }

  async getPlanHistory(bookId: StableId, planId: StableId) {
    const initialized = await this.openBook(bookId);
    return initialized.repositories.plans.history(bookId, planId);
  }

  async savePlan(command: PlanNodeCommand) {
    const initialized = await this.openBook(command.bookId);
    return new PlanService(
      initialized.repositories.plans,
      initialized.repositories.commandReceipts,
    ).saveNode(command);
  }

  async listChapters(bookId: StableId) {
    const initialized = await this.openBook(bookId);
    return initialized.repositories.chapters.list(bookId);
  }

  async getChapter(bookId: StableId, chapterId: StableId) {
    const initialized = await this.openBook(bookId);
    return initialized.repositories.chapters.get(bookId, chapterId);
  }

  async createChapter(command: CreateChapterCommand) {
    const initialized = await this.openBook(command.bookId);
    return new ChapterService(
      initialized.repositories.chapters,
      initialized.repositories.plans,
      initialized.repositories.commandReceipts,
    ).create(command);
  }

  async listDrafts(bookId: StableId, chapterId: StableId) {
    const initialized = await this.openBook(bookId);
    const chapter = await initialized.repositories.chapters.get(bookId, chapterId);
    if (chapter === null) {
      throw new BookCommandError('NOT_FOUND', 'The chapter does not exist.');
    }
    return initialized.repositories.drafts.list(chapterId);
  }

  async getDraft(bookId: StableId, chapterId: StableId, draftId: StableId) {
    const initialized = await this.openBook(bookId);
    const chapter = await initialized.repositories.chapters.get(bookId, chapterId);
    if (chapter === null) {
      throw new BookCommandError('NOT_FOUND', 'The chapter does not exist.');
    }
    const draft = await initialized.repositories.drafts.get(draftId);
    if (draft === null || draft.chapterId !== chapterId) {
      throw new BookCommandError('NOT_FOUND', 'The draft does not exist.');
    }
    return draft;
  }

  async saveDraft(command: SaveDraftCommand) {
    const initialized = await this.openBook(command.bookId);
    return new DraftService(
      initialized.repositories.chapters,
      initialized.repositories.drafts,
      initialized.repositories.commandReceipts,
    ).save(command);
  }

  async restoreDraft(command: RestoreDraftCommand) {
    const initialized = await this.openBook(command.bookId);
    return new DraftService(
      initialized.repositories.chapters,
      initialized.repositories.drafts,
      initialized.repositories.commandReceipts,
    ).restore(command);
  }

  async createBackup(bookId: StableId): Promise<BackupResult> {
    const initialized = await this.openBook(bookId);
    const databasePath = initialized.connection.databasePath;
    const backupDirectory = join(dirname(databasePath), 'backups');
    const backupPath = createMigrationBackupPath(databasePath, { backupDirectory });
    await createConsistentBackup(initialized.connection.db, backupPath);
    const backupStats = await stat(backupPath);
    return {
      fileName: basename(backupPath),
      relativePath: `backups/${basename(backupPath)}`,
      sizeBytes: backupStats.size,
      createdAt: nowUtc(),
    };
  }

  async exportBook(bookId: StableId, format: ExportFormat): Promise<ExportResult> {
    const initialized = await this.openBook(bookId);
    const book = await initialized.repositories.books.get(bookId);
    if (book === null) {
      throw new BookCommandError('NOT_FOUND', 'The book does not exist.');
    }
    const plans = await initialized.repositories.plans.list(bookId);
    const chapters = await initialized.repositories.chapters.list(bookId);
    const draftsByChapter = new Map();
    for (const chapter of chapters) {
      draftsByChapter.set(chapter.id, await initialized.repositories.drafts.current(chapter.id));
    }
    const content = renderBookExport({ book, plans, chapters, draftsByChapter }, format);
    const exportDirectory = join(this.projectRoot(bookId), 'exports');
    await mkdir(exportDirectory, { recursive: true });
    const fileName = `${bookId}.${format === 'markdown' ? 'md' : 'txt'}`;
    const exportPath = join(exportDirectory, fileName);
    const temporaryPath = join(exportDirectory, `.${fileName}.${randomUUID()}.tmp`);
    await writeFile(temporaryPath, content, 'utf8');
    await rename(temporaryPath, exportPath);
    return {
      format,
      fileName,
      characterCount: Array.from(content).length,
      contentHash: `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`,
      updatedAt: nowUtc(),
    };
  }

  async readExport(bookId: StableId, format: ExportFormat): Promise<string> {
    const fileName = `${bookId}.${format === 'markdown' ? 'md' : 'txt'}`;
    try {
      return await readFile(join(this.projectRoot(bookId), 'exports', fileName), 'utf8');
    } catch (error) {
      if (isNodeError(error, 'ENOENT')) {
        throw new BookCommandError('NOT_FOUND', 'The export does not exist.');
      }
      throw error;
    }
  }

  probe(bookId: StableId): ProjectDatabaseProbe {
    return probeProjectDatabase(this.projectRoot(bookId));
  }

  async closeBook(bookId: StableId): Promise<void> {
    const initialized = this.openProjects.get(bookId);
    if (initialized === undefined) {
      return;
    }

    initialized.connection.close();
    this.openProjects.delete(bookId);
  }

  async closeAll(): Promise<void> {
    for (const initialized of this.openProjects.values()) {
      initialized.connection.close();
    }
    this.openProjects.clear();
  }

  private async openBook(bookId: StableId): Promise<InitializedProjectDatabase> {
    const existing = this.openProjects.get(bookId);
    if (existing !== undefined) {
      return existing;
    }

    const probe = this.probe(bookId);
    if (probe.status === 'missing') {
      throw new BookCommandError('NOT_FOUND', 'The book does not exist.');
    }
    if (probe.status === 'invalid') {
      throw new Error('The project database is invalid.');
    }

    const initialized = await initializeProjectDatabase(this.projectRoot(bookId));
    const book = await initialized.repositories.books.get(bookId);
    if (book === null) {
      initialized.connection.close();
      throw new BookCommandError('NOT_FOUND', 'The book does not exist.');
    }

    this.openProjects.set(bookId, initialized);
    return initialized;
  }

  private projectRoot(bookId: StableId): string {
    const candidate = resolve(this.root, bookId);
    const pathFromRoot = relative(this.root, candidate);
    if (candidate === this.root || pathFromRoot.startsWith('..') || isAbsolute(pathFromRoot)) {
      throw new Error('The book ID resolves outside the configured library root.');
    }

    return candidate;
  }
}

export function createServer(
  config: ServerConfig = parseServerConfig(),
  projectManager = new BookProjectManager(config.libraryRoot),
): FastifyInstance {
  const app = Fastify({ logger: false });
  const sessions = new SessionManager({
    ttlSeconds: config.session.ttlSeconds,
    allowedOrigins: config.listen.allowedOrigins,
  });

  app.get('/api/v1/health', async (request) => {
    const query = request.query as { bookId?: string };
    const database =
      query.bookId === undefined
        ? { available: false, status: 'not_selected' as const, schemaVersion: null }
        : getDatabaseHealth(projectManager, query.bookId);

    const response: HealthResponse = {
      status: 'ok',
      contractVersion: CONTRACT_VERSION,
      database,
    };
    return { data: response };
  });

  app.get('/api/v1/session', async (_request, reply) => {
    const issued = sessions.issueSession();
    reply.header('set-cookie', serializeSessionCookie(issued.cookie));
    return { data: issued.session };
  });

  app.get('/api/v1/books', async (_request, reply) => {
    try {
      return { data: await projectManager.listBooks() };
    } catch (error) {
      return sendCommandError(reply, _request, error);
    }
  });

  app.post('/api/v1/books', async (request, reply) => {
    if (!requireWriteSecurity(request, reply, sessions)) {
      return;
    }

    try {
      const body = parseCreateBookBody(request.body);
      const bookId = parseStableId(`book_${body.clientRequestId}`);
      const command: CreateBookCommand = {
        bookId,
        clientRequestId: body.clientRequestId,
        title: body.title,
        language: body.language,
        genre: body.genre,
        premise: body.premise,
        ...(body.conventions === undefined ? {} : { conventions: body.conventions }),
        createdAt: nowUtc(),
      };
      const result = await projectManager.createBook(command);
      return reply.code(result.replayed ? 200 : 201).send({ data: result.book });
    } catch (error) {
      return sendCommandError(reply, request, error);
    }
  });

  app.get<{ Params: { bookId: string } }>('/api/v1/books/:bookId', async (request, reply) => {
    try {
      const book = await projectManager.getBook(parseBookId(request.params.bookId));
      if (book === null) {
        return sendError(reply, request, 404, 'NOT_FOUND', 'The book does not exist.');
      }
      return { data: book };
    } catch (error) {
      return sendCommandError(reply, request, error);
    }
  });

  app.patch<{ Params: { bookId: string } }>('/api/v1/books/:bookId', async (request, reply) => {
    if (!requireWriteSecurity(request, reply, sessions)) {
      return;
    }

    try {
      const body = parseUpdateBookBody(request.body);
      const command: UpdateBookCommand = {
        bookId: parseBookId(request.params.bookId),
        clientRequestId: body.clientRequestId,
        expectedBookRevision: body.expectedBookRevision,
        changes: body.changes,
        updatedAt: nowUtc(),
      };
      const result = await projectManager.updateBook(command);
      return { data: result.book };
    } catch (error) {
      return sendCommandError(reply, request, error);
    }
  });

  app.post<{ Params: { bookId: string } }>(
    '/api/v1/books/:bookId/backups',
    async (request, reply) => {
      if (!requireWriteSecurity(request, reply, sessions)) {
        return;
      }
      try {
        const result = await projectManager.createBackup(parseBookId(request.params.bookId));
        return reply.code(201).send({ data: result });
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.post<{ Params: { bookId: string } }>(
    '/api/v1/books/:bookId/exports',
    async (request, reply) => {
      if (!requireWriteSecurity(request, reply, sessions)) {
        return;
      }
      try {
        const format = parseExportFormat(asRecord(request.body)['format']);
        const result = await projectManager.exportBook(parseBookId(request.params.bookId), format);
        return reply.code(201).send({ data: result });
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.get<{ Params: { bookId: string; format: string } }>(
    '/api/v1/books/:bookId/exports/:format',
    async (request, reply) => {
      try {
        const format = parseExportFormat(request.params.format);
        const content = await projectManager.readExport(parseBookId(request.params.bookId), format);
        reply.type(
          format === 'markdown' ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8',
        );
        return reply.send(content);
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.get<{ Params: { bookId: string }; Querystring: { includeSuperseded?: string } }>(
    '/api/v1/books/:bookId/plans',
    async (request, reply) => {
      try {
        const bookId = parseBookId(request.params.bookId);
        const plans = await projectManager.listPlans(
          bookId,
          request.query.includeSuperseded === 'true',
        );
        return { data: plans };
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.get<{ Params: { bookId: string; planId: string } }>(
    '/api/v1/books/:bookId/plans/:planId/history',
    async (request, reply) => {
      try {
        const history = await projectManager.getPlanHistory(
          parseBookId(request.params.bookId),
          parseStableId(request.params.planId),
        );
        return { data: history };
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.put<{ Params: { bookId: string; planId: string } }>(
    '/api/v1/books/:bookId/plans/:planId',
    async (request, reply) => {
      if (!requireWriteSecurity(request, reply, sessions)) {
        return;
      }

      try {
        const bookId = parseBookId(request.params.bookId);
        const body = parsePlanBody(request.body);
        const result = await projectManager.savePlan({
          bookId,
          clientRequestId: body.clientRequestId,
          expectedBookRevision: body.expectedBookRevision,
          node: {
            id: parseStableId(request.params.planId),
            bookId,
            parentId: body.parentId,
            kind: body.kind,
            sortKey: body.sortKey,
            content: body.content,
            status: body.status,
          },
          now: nowUtc(),
        });
        return reply.code(result.replayed ? 200 : 201).send({ data: result });
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.get<{ Params: { bookId: string } }>(
    '/api/v1/books/:bookId/chapters',
    async (request, reply) => {
      try {
        const chapters = await projectManager.listChapters(parseBookId(request.params.bookId));
        return { data: chapters };
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.post<{ Params: { bookId: string } }>(
    '/api/v1/books/:bookId/chapters',
    async (request, reply) => {
      if (!requireWriteSecurity(request, reply, sessions)) {
        return;
      }

      try {
        const bookId = parseBookId(request.params.bookId);
        const body = parseChapterBody(request.body);
        const result = await projectManager.createChapter({
          bookId,
          clientRequestId: body.clientRequestId,
          expectedBookRevision: body.expectedBookRevision,
          chapter: {
            id: body.id,
            bookId,
            chapterNumber: body.chapterNumber,
            displayTitle: body.displayTitle,
            planNodeId: body.planNodeId,
            currentDraftId: null,
            currentFinalizationId: null,
          },
          now: nowUtc(),
        });
        return reply.code(result.replayed ? 200 : 201).send({ data: result });
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.get<{ Params: { bookId: string; chapterId: string } }>(
    '/api/v1/books/:bookId/chapters/:chapterId',
    async (request, reply) => {
      try {
        const chapter = await projectManager.getChapter(
          parseBookId(request.params.bookId),
          parseStableId(request.params.chapterId),
        );
        if (chapter === null) {
          return sendError(reply, request, 404, 'NOT_FOUND', 'The chapter does not exist.');
        }
        return { data: chapter };
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.get<{ Params: { bookId: string; chapterId: string } }>(
    '/api/v1/books/:bookId/chapters/:chapterId/drafts',
    async (request, reply) => {
      try {
        const drafts = await projectManager.listDrafts(
          parseBookId(request.params.bookId),
          parseStableId(request.params.chapterId),
        );
        return { data: drafts };
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.get<{ Params: { bookId: string; chapterId: string; draftId: string } }>(
    '/api/v1/books/:bookId/chapters/:chapterId/drafts/:draftId',
    async (request, reply) => {
      try {
        const draft = await projectManager.getDraft(
          parseBookId(request.params.bookId),
          parseStableId(request.params.chapterId),
          parseStableId(request.params.draftId),
        );
        return { data: draft };
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.put<{
    Params: { bookId: string; chapterId: string; draftId: string };
  }>('/api/v1/books/:bookId/chapters/:chapterId/drafts/:draftId', async (request, reply) => {
    if (!requireWriteSecurity(request, reply, sessions)) {
      return;
    }

    try {
      const body = parseDraftBody(request.body);
      const result = await projectManager.saveDraft({
        bookId: parseBookId(request.params.bookId),
        clientRequestId: body.clientRequestId,
        chapterId: parseStableId(request.params.chapterId),
        draftId: parseStableId(request.params.draftId),
        expectedDraftRevision: body.expectedDraftRevision,
        content: body.content,
        complete: body.complete,
        createdBy: 'author',
        now: nowUtc(),
      });
      return reply.code(result.replayed ? 200 : 201).send({ data: result });
    } catch (error) {
      return sendCommandError(reply, request, error);
    }
  });

  app.post<{
    Params: { bookId: string; chapterId: string; draftId: string };
  }>(
    '/api/v1/books/:bookId/chapters/:chapterId/drafts/:draftId/restore',
    async (request, reply) => {
      if (!requireWriteSecurity(request, reply, sessions)) {
        return;
      }

      try {
        const body = parseDraftRestoreBody(request.body);
        const clientRequestId = body.clientRequestId;
        const result = await projectManager.restoreDraft({
          bookId: parseBookId(request.params.bookId),
          clientRequestId,
          chapterId: parseStableId(request.params.chapterId),
          sourceDraftId: parseStableId(request.params.draftId),
          draftId: parseStableId(`draft_${clientRequestId}`),
          expectedDraftRevision: body.expectedDraftRevision,
          now: nowUtc(),
        });
        return reply.code(result.replayed ? 200 : 201).send({ data: result });
      } catch (error) {
        return sendCommandError(reply, request, error);
      }
    },
  );

  app.addHook('onClose', async () => {
    await projectManager.closeAll();
  });

  return app;
}

export async function startServer(
  config: ServerConfig = parseServerConfig(),
): Promise<FastifyInstance> {
  const app = createServer(config);
  await app.listen({ host: config.listen.host, port: config.listen.port });
  return app;
}

function getDatabaseHealth(manager: BookProjectManager, value: string): HealthResponse['database'] {
  try {
    const probe = manager.probe(parseBookId(value));
    return {
      available: probe.status === 'ready',
      status: probe.status,
      schemaVersion: probe.schemaVersion,
    };
  } catch {
    return { available: false, status: 'invalid', schemaVersion: null };
  }
}

function parseCreateBookBody(value: unknown): {
  clientRequestId: ReturnType<typeof parseClientRequestId>;
  title: string;
  language: string;
  genre: string;
  premise: string;
  conventions?: Record<string, unknown>;
} {
  const record = asRecord(value);
  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    title: requiredString(record['title']),
    language: requiredString(record['language']),
    genre: requiredString(record['genre']),
    premise: requiredString(record['premise']),
    ...(record['conventions'] === undefined
      ? {}
      : { conventions: objectValue(record['conventions'], 'conventions') }),
  };
}

function parseUpdateBookBody(value: unknown): {
  clientRequestId: ReturnType<typeof parseClientRequestId>;
  expectedBookRevision: BookRevision;
  changes: UpdateBookCommand['changes'];
} {
  const record = asRecord(value);
  const expectedBookRevision = record['expectedBookRevision'];
  if (
    typeof expectedBookRevision !== 'number' ||
    !Number.isSafeInteger(expectedBookRevision) ||
    expectedBookRevision < 1
  ) {
    throw new Error('expectedBookRevision must be a positive integer.');
  }

  const changes: UpdateBookCommand['changes'] = {};
  for (const field of ['title', 'language', 'genre', 'premise'] as const) {
    if (record[field] !== undefined) {
      changes[field] = requiredString(record[field]);
    }
  }
  if (record['conventions'] !== undefined) {
    changes.conventions = objectValue(record['conventions'], 'conventions');
  }

  if (Object.keys(changes).length === 0) {
    throw new Error('At least one book field must be changed.');
  }

  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    expectedBookRevision,
    changes,
  };
}

function parsePlanBody(value: unknown): {
  clientRequestId: ReturnType<typeof parseClientRequestId>;
  expectedBookRevision: BookRevision;
  parentId: StableId | null;
  kind: PlanKind;
  sortKey: string;
  content: PlanContent;
  status: PlanNodeStatus;
} {
  const record = asRecord(value);
  const expectedBookRevision = parsePositiveInteger(
    record['expectedBookRevision'],
    'expectedBookRevision',
  );
  const parentValue = record['parentId'];
  const parentId = parentValue === null ? null : parseStableId(requiredString(parentValue));
  const kind = parsePlanKind(record['kind']);
  const status = record['status'] === undefined ? 'confirmed' : parsePlanStatus(record['status']);

  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    expectedBookRevision,
    parentId,
    kind,
    sortKey: requiredString(record['sortKey']),
    content: parsePlanContent(record['content']),
    status,
  };
}

function parseChapterBody(value: unknown): {
  clientRequestId: ReturnType<typeof parseClientRequestId>;
  expectedBookRevision: BookRevision;
  id: StableId;
  chapterNumber: number;
  displayTitle: string;
  planNodeId: StableId;
} {
  const record = asRecord(value);
  const chapterNumber = parsePositiveInteger(record['chapterNumber'], 'chapterNumber');
  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    expectedBookRevision: parsePositiveInteger(
      record['expectedBookRevision'],
      'expectedBookRevision',
    ),
    id: parseStableId(requiredString(record['id'])),
    chapterNumber,
    displayTitle: requiredString(record['displayTitle']),
    planNodeId: parseStableId(requiredString(record['planNodeId'])),
  };
}

function parseDraftBody(value: unknown): {
  clientRequestId: ReturnType<typeof parseClientRequestId>;
  expectedDraftRevision: number;
  content: string;
  complete: boolean;
} {
  const record = asRecord(value);
  const expectedDraftRevision = parseNonNegativeInteger(
    record['expectedDraftRevision'],
    'expectedDraftRevision',
  );
  const complete = record['complete'] ?? false;
  if (typeof complete !== 'boolean') {
    throw new Error('complete must be a boolean.');
  }
  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    expectedDraftRevision,
    content: stringValue(record['content']),
    complete,
  };
}

function parseDraftRestoreBody(value: unknown): {
  clientRequestId: ReturnType<typeof parseClientRequestId>;
  expectedDraftRevision: number;
} {
  const record = asRecord(value);
  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    expectedDraftRevision: parseNonNegativeInteger(
      record['expectedDraftRevision'],
      'expectedDraftRevision',
    ),
  };
}

function parseExportFormat(value: unknown): ExportFormat {
  if (value === 'markdown' || value === 'txt') {
    return value;
  }
  throw new Error('format must be markdown or txt.');
}

function parsePlanContent(value: unknown): PlanContent {
  const record = asRecord(value);
  const targetLength = record['targetLength'];
  return {
    title: requiredString(record['title']),
    goal: requiredString(record['goal']),
    conflict: requiredString(record['conflict']),
    startState: requiredString(record['startState']),
    endState: requiredString(record['endState']),
    requiredBeats: stringArray(record['requiredBeats'], 'requiredBeats'),
    avoid: stringArray(record['avoid'], 'avoid'),
    ...(targetLength === undefined
      ? {}
      : {
          targetLength: {
            min: parseNonNegativeInteger(asRecord(targetLength)['min'], 'targetLength.min'),
            max: parseNonNegativeInteger(asRecord(targetLength)['max'], 'targetLength.max'),
          },
        }),
  };
}

function parsePlanKind(value: unknown): PlanKind {
  if (value === 'book' || value === 'volume' || value === 'arc' || value === 'chapter') {
    return value;
  }
  throw new Error('kind must be book, volume, arc, or chapter.');
}

function parsePlanStatus(value: unknown): PlanNodeStatus {
  if (value === 'confirmed' || value === 'superseded') {
    return value;
  }
  throw new Error('status must be confirmed or superseded.');
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} must be an array of strings.`);
  }
  return value.map((item) => item.trim());
}

function parsePositiveInteger(value: unknown, label: string): number {
  const parsed = parseNonNegativeInteger(value, label);
  if (parsed < 1) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
}

function parseNonNegativeInteger(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return value;
}

function parseBookId(value: string): StableId {
  if (!/^book_[0-9a-f-]+$/i.test(value)) {
    throw new Error('Book ID must be generated by the book creation command.');
  }
  return parseStableId(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Request body must be an object.');
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Required fields must be non-empty strings.');
  }
  return value.trim();
}

function stringValue(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('content must be a string.');
  }
  return value;
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function nowUtc() {
  return parseUtcDateTime(new Date().toISOString());
}

function isNodeError(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && error.code === code;
}

function requireWriteSecurity(
  request: FastifyRequest,
  reply: FastifyReply,
  sessions: SessionManager,
): boolean {
  const security: {
    origin?: string;
    sessionCookie?: string;
    csrfToken?: string;
  } = {};
  const origin = headerValue(request.headers.origin);
  const sessionCookie = readCookie(request.headers.cookie, SESSION_COOKIE_NAME);
  const csrfToken = headerValue(request.headers['x-story-csrf']);
  if (origin !== undefined) security.origin = origin;
  if (sessionCookie !== undefined) security.sessionCookie = sessionCookie;
  if (csrfToken !== undefined) security.csrfToken = csrfToken;

  const result = sessions.validateWriteRequest(security);
  if (result.ok) {
    return true;
  }

  sendError(reply, request, 403, 'VALIDATION_ERROR', 'Write request security validation failed.', {
    reason: result.reason,
  });
  return false;
}

function sendCommandError(reply: FastifyReply, request: FastifyRequest, error: unknown) {
  if (error instanceof BookCommandError) {
    if (error.code === 'NOT_FOUND') {
      return sendError(reply, request, 404, 'NOT_FOUND', error.message);
    }
    if (error.code === 'REVISION_CONFLICT') {
      return sendError(reply, request, 409, 'REVISION_CONFLICT', error.message, {
        currentBookRevision: error.currentBookRevision,
      });
    }
    return sendError(reply, request, 409, 'REVISION_CONFLICT', error.message);
  }

  if (error instanceof WritingCommandError) {
    if (error.code === 'NOT_FOUND') {
      return sendError(reply, request, 404, 'NOT_FOUND', error.message);
    }
    if (error.code === 'REVISION_CONFLICT') {
      return sendError(reply, request, 409, 'REVISION_CONFLICT', error.message, {
        currentBookRevision: error.currentBookRevision,
      });
    }
    if (error.code === 'DRAFT_CONFLICT') {
      return sendError(reply, request, 409, 'REVISION_CONFLICT', error.message, {
        currentDraftRevision: error.currentDraftRevision,
      });
    }
    return sendError(reply, request, 400, 'VALIDATION_ERROR', error.message);
  }

  const message = error instanceof Error ? error.message : 'Request could not be completed.';
  return sendError(reply, request, 400, 'VALIDATION_ERROR', message);
}

function sendError(
  reply: FastifyReply,
  request: FastifyRequest,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details: Record<string, unknown> = {},
) {
  return reply.code(statusCode).send({
    error: {
      code,
      message,
      details,
      requestId: request.id,
    },
  });
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readCookie(header: string | undefined, name: string): string | undefined {
  if (header === undefined) {
    return undefined;
  }

  for (const item of header.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) {
      continue;
    }
    const key = item.slice(0, separator).trim();
    if (key === name) {
      return item.slice(separator + 1).trim();
    }
  }

  return undefined;
}

function serializeSessionCookie(cookie: {
  name: string;
  value: string;
  path: string;
  maxAge: number;
  httpOnly: boolean;
  sameSite: string;
}): string {
  return [
    `${cookie.name}=${cookie.value}`,
    `Path=${cookie.path}`,
    'HttpOnly',
    `Max-Age=${cookie.maxAge}`,
    `SameSite=${cookie.sameSite.charAt(0).toUpperCase()}${cookie.sameSite.slice(1)}`,
  ].join('; ');
}
