import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const WRITING_MODEL_SQL = `
ALTER TABLE books ADD COLUMN conventions_json TEXT NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS plan_nodes (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  parent_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('book', 'volume', 'arc', 'chapter')),
  sort_key TEXT NOT NULL,
  content_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'superseded')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS plan_nodes_book_sort_idx
  ON plan_nodes (book_id, sort_key, id);

CREATE INDEX IF NOT EXISTS plan_nodes_parent_idx
  ON plan_nodes (book_id, parent_id, sort_key);

CREATE TABLE IF NOT EXISTS plan_node_versions (
  plan_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  book_id TEXT NOT NULL,
  parent_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('book', 'volume', 'arc', 'chapter')),
  sort_key TEXT NOT NULL,
  content_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'superseded')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (plan_id, version)
);

CREATE INDEX IF NOT EXISTS plan_node_versions_book_plan_idx
  ON plan_node_versions (book_id, plan_id, version);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL CHECK (chapter_number >= 1),
  display_title TEXT NOT NULL,
  plan_node_id TEXT NOT NULL,
  current_draft_id TEXT,
  current_finalization_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (book_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS chapters_book_number_idx
  ON chapters (book_id, chapter_number);

CREATE TABLE IF NOT EXISTS draft_versions (
  id TEXT PRIMARY KEY NOT NULL,
  chapter_id TEXT NOT NULL,
  parent_id TEXT,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  content TEXT NOT NULL,
  complete INTEGER NOT NULL CHECK (complete IN (0, 1)),
  source_run_id TEXT,
  created_by TEXT NOT NULL CHECK (created_by IN ('author', 'restore', 'import', 'agent')),
  created_at TEXT NOT NULL,
  UNIQUE (chapter_id, revision)
);

CREATE INDEX IF NOT EXISTS draft_versions_chapter_revision_idx
  ON draft_versions (chapter_id, revision DESC);
`;

export const writingModelMigration: Migration = {
  version: 3,
  name: 'writing_model',
  up(database: Database.Database): void {
    database.exec(WRITING_MODEL_SQL);
  },
};
