import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const INVALIDATIONS_SQL = `
CREATE TABLE IF NOT EXISTS derived_invalidations (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  object_kind TEXT NOT NULL CHECK (object_kind IN (
    'chapter_projection', 'search_index', 'input_snapshot', 'run', 'run_artifact',
    'proposal', 'review', 'fact', 'fact_revelation', 'thread_event'
  )),
  object_id TEXT NOT NULL,
  superseded_finalization_id TEXT NOT NULL,
  replacement_finalization_id TEXT NOT NULL,
  old_source_hash TEXT NOT NULL,
  new_source_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'cleared')),
  created_at TEXT NOT NULL,
  cleared_at TEXT,
  UNIQUE (object_kind, object_id, superseded_finalization_id)
);

CREATE INDEX IF NOT EXISTS derived_invalidations_book_status_idx
  ON derived_invalidations (book_id, status, created_at);
`;

export const invalidationsMigration: Migration = {
  version: 11,
  name: 'invalidations',
  up(database: Database.Database): void {
    database.exec(INVALIDATIONS_SQL);
  },
};
