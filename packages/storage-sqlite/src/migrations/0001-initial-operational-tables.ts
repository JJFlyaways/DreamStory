import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const INITIAL_OPERATIONAL_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS command_receipts (
  book_id TEXT NOT NULL,
  command_kind TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (book_id, command_kind, client_request_id)
);

CREATE TABLE IF NOT EXISTS outbox_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS outbox_jobs_status_created_at_idx
  ON outbox_jobs (status, created_at);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN (
    'plan_book',
    'plan_volume',
    'plan_arc',
    'plan_chapter',
    'draft_chapter',
    'review_chapter',
    'revise_chapter'
  )),
  scope_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued',
    'running',
    'awaiting_author',
    'paused',
    'completed',
    'failed',
    'cancelled',
    'stale'
  )),
  input_snapshot_id TEXT,
  lease_json TEXT,
  attempt INTEGER NOT NULL DEFAULT 0 CHECK (attempt >= 0),
  error_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS runs_book_status_idx
  ON runs (book_id, status);
`;

export const initialOperationalTablesMigration: Migration = {
  version: 1,
  name: 'initial_operational_tables',
  up(database: Database.Database): void {
    database.exec(INITIAL_OPERATIONAL_TABLES_SQL);
  },
};
