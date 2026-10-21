import { isAbsolute, relative, resolve } from 'node:path';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';

import {
  BookCommandError,
  BookService,
  type CreateBookCommand,
  type UpdateBookCommand,
} from '@dreamstory/application';
import {
  CONTRACT_VERSION,
  parseClientRequestId,
  parseStableId,
  parseUtcDateTime,
  type BookRevision,
  type ErrorCode,
  type ServerConfig,
  type StableId,
} from '@dreamstory/contracts';
import {
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

  async updateBook(command: UpdateBookCommand) {
    const initialized = await this.openBook(command.bookId);
    return new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    ).updateBook(command);
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
} {
  const record = asRecord(value);
  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    title: requiredString(record['title']),
    language: requiredString(record['language']),
    genre: requiredString(record['genre']),
    premise: requiredString(record['premise']),
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

  if (Object.keys(changes).length === 0) {
    throw new Error('At least one book field must be changed.');
  }

  return {
    clientRequestId: parseClientRequestId(requiredString(record['clientRequestId'])),
    expectedBookRevision,
    changes,
  };
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

function nowUtc() {
  return parseUtcDateTime(new Date().toISOString());
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
