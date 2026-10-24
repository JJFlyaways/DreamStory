import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const FACT_REVELATIONS_SQL = `
CREATE TABLE IF NOT EXISTS fact_revelations (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  fact_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  text_range_json TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('author_truth', 'character_known', 'reader_known')),
  known_to_entity_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS fact_revelations_book_chapter_idx
  ON fact_revelations (book_id, chapter_id);

CREATE INDEX IF NOT EXISTS fact_revelations_book_visibility_idx
  ON fact_revelations (book_id, visibility);

CREATE INDEX IF NOT EXISTS fact_revelations_fact_idx
  ON fact_revelations (book_id, fact_id);
`;

export const factRevelationsMigration: Migration = {
  version: 8,
  name: 'fact_revelations',
  up(database: Database.Database): void {
    database.exec(FACT_REVELATIONS_SQL);
  },
};
