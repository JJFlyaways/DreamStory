import type {
  BookRevision,
  ClientRequestId,
  IsoUtcDateTime,
  StableId,
} from '@dreamstory/contracts';

import type {
  BookChanges,
  BookRecord,
  BookRepository,
  CommandReceiptRepository,
} from './repositories.js';

const CREATE_BOOK_COMMAND = 'create_book';
const UPDATE_BOOK_COMMAND = 'update_book';

export interface CreateBookCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  title: string;
  language: string;
  genre: string;
  premise: string;
  createdAt: IsoUtcDateTime;
}

export interface UpdateBookCommand {
  bookId: StableId;
  clientRequestId: ClientRequestId;
  expectedBookRevision: BookRevision;
  changes: BookChanges;
  updatedAt: IsoUtcDateTime;
}

export interface BookCommandResult {
  book: BookRecord;
  replayed: boolean;
}

export class BookCommandError extends Error {
  readonly code: 'NOT_FOUND' | 'REVISION_CONFLICT' | 'ALREADY_EXISTS';

  readonly currentBookRevision: BookRevision | undefined;

  constructor(code: BookCommandError['code'], message: string, currentBookRevision?: BookRevision) {
    super(message);
    this.name = 'BookCommandError';
    this.code = code;
    this.currentBookRevision = currentBookRevision;
  }
}

export class BookService {
  constructor(
    private readonly books: BookRepository,
    private readonly receipts: CommandReceiptRepository,
  ) {}

  async createBook(command: CreateBookCommand): Promise<BookCommandResult> {
    const replay = await this.receipts.find(
      command.bookId,
      CREATE_BOOK_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) {
      return { book: parseBookResult(replay.result), replayed: true };
    }

    if ((await this.books.get(command.bookId)) !== null) {
      throw new BookCommandError('ALREADY_EXISTS', 'The book already exists.');
    }

    const book: BookRecord = {
      id: command.bookId,
      title: command.title,
      language: command.language,
      genre: command.genre,
      premise: command.premise,
      bookRevision: 1,
      createdAt: command.createdAt,
      updatedAt: command.createdAt,
    };

    await this.books.create(book);
    await this.receipts.save({
      bookId: command.bookId,
      commandKind: CREATE_BOOK_COMMAND,
      clientRequestId: command.clientRequestId,
      result: book,
      createdAt: command.createdAt,
    });

    return { book, replayed: false };
  }

  async updateBook(command: UpdateBookCommand): Promise<BookCommandResult> {
    const replay = await this.receipts.find(
      command.bookId,
      UPDATE_BOOK_COMMAND,
      command.clientRequestId,
    );
    if (replay !== null) {
      return { book: parseBookResult(replay.result), replayed: true };
    }

    const current = await this.books.get(command.bookId);
    if (current === null) {
      throw new BookCommandError('NOT_FOUND', 'The book does not exist.');
    }

    if (current.bookRevision !== command.expectedBookRevision) {
      throw new BookCommandError(
        'REVISION_CONFLICT',
        'The book revision has changed.',
        current.bookRevision,
      );
    }

    const updated = await this.books.updateIfRevisionMatches(
      command.bookId,
      command.expectedBookRevision,
      command.changes,
      command.updatedAt,
    );
    if (updated === null) {
      const latest = await this.books.get(command.bookId);
      throw new BookCommandError(
        'REVISION_CONFLICT',
        'The book revision has changed.',
        latest?.bookRevision,
      );
    }

    await this.receipts.save({
      bookId: command.bookId,
      commandKind: UPDATE_BOOK_COMMAND,
      clientRequestId: command.clientRequestId,
      result: updated,
      createdAt: command.updatedAt,
    });

    return { book: updated, replayed: false };
  }
}

function parseBookResult(value: unknown): BookRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('The idempotency receipt contains an invalid book result.');
  }

  return value as BookRecord;
}
