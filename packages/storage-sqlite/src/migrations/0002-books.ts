import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const BOOKS_SQL = `
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  genre TEXT NOT NULL,
  premise TEXT NOT NULL,
  book_revision INTEGER NOT NULL DEFAULT 1 CHECK (book_revision >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS books_updated_at_idx
  ON books (updated_at);
`;

export const booksMigration: Migration = {
  version: 2,
  name: 'books',
  up(database: Database.Database): void {
    database.exec(BOOKS_SQL);
  },
};
