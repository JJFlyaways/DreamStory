import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const SEARCH_SQL = `
CREATE VIRTUAL TABLE IF NOT EXISTS chapter_fts USING fts5(
  finalization_id UNINDEXED,
  book_id UNINDEXED,
  chapter_id UNINDEXED,
  chapter_number UNINDEXED,
  content,
  tokenize = 'unicode61'
);

CREATE TABLE IF NOT EXISTS entity_mentions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  term TEXT NOT NULL,
  match_kind TEXT NOT NULL CHECK (match_kind IN ('name', 'alias')),
  finalization_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  start_char INTEGER NOT NULL,
  end_char INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS entity_mentions_exact_idx
  ON entity_mentions (book_id, term, chapter_number);

CREATE INDEX IF NOT EXISTS entity_mentions_entity_idx
  ON entity_mentions (book_id, entity_id, chapter_number);
`;

export const searchMigration: Migration = {
  version: 10,
  name: 'search',
  up(database: Database.Database): void {
    database.exec(SEARCH_SQL);
  },
};
