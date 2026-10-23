import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const FINALIZATIONS_SQL = `
CREATE TABLE IF NOT EXISTS finalizations (
  id TEXT PRIMARY KEY NOT NULL,
  chapter_id TEXT NOT NULL,
  draft_version_id TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  supersedes_id TEXT,
  committed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS finalizations_chapter_committed_idx
  ON finalizations (chapter_id, committed_at DESC);
`;

export const finalizationsMigration: Migration = {
  version: 6,
  name: 'finalizations',
  up(database: Database.Database): void {
    database.exec(FINALIZATIONS_SQL);
  },
};
