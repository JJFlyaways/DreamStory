import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const THREADS_SQL = `
CREATE TABLE IF NOT EXISTS story_threads (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('storyline', 'foreshadow')),
  name TEXT NOT NULL,
  planned_payoff TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'resolved', 'dropped', 'superseded')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (book_id, name)
);

CREATE INDEX IF NOT EXISTS story_threads_book_status_idx
  ON story_threads (book_id, status, updated_at);

CREATE TABLE IF NOT EXISTS thread_events (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('planted', 'advanced', 'resolved', 'dropped')),
  chapter_id TEXT,
  evidence_kind TEXT NOT NULL CHECK (evidence_kind IN ('author', 'finalization')),
  source_id TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  text_range_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS thread_events_book_thread_idx
  ON thread_events (book_id, thread_id, created_at);

CREATE INDEX IF NOT EXISTS thread_events_book_chapter_idx
  ON thread_events (book_id, chapter_id);
`;

export const threadsMigration: Migration = {
  version: 9,
  name: 'threads',
  up(database: Database.Database): void {
    database.exec(THREADS_SQL);
  },
};
