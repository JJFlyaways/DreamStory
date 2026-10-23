import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const REVIEW_PROPOSAL_SQL = `
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('plan', 'fact', 'revision')),
  payload_json TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  source_fingerprint TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'stale')),
  source_run_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS proposals_book_status_idx
  ON proposals (book_id, status, updated_at);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY NOT NULL,
  chapter_id TEXT NOT NULL,
  draft_version_id TEXT NOT NULL,
  draft_hash TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS reviews_chapter_created_idx
  ON reviews (chapter_id, created_at DESC);

CREATE TABLE IF NOT EXISTS review_findings (
  id TEXT PRIMARY KEY NOT NULL,
  review_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  draft_version_id TEXT NOT NULL,
  draft_hash TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  kind TEXT NOT NULL CHECK (kind IN ('continuity', 'style', 'plot', 'fact')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'minor', 'major')),
  claim TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  disposition TEXT NOT NULL CHECK (disposition IN ('open', 'accept', 'ignore', 'intentional')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS review_findings_review_idx
  ON review_findings (review_id, revision);
`;

export const reviewProposalMigration: Migration = {
  version: 5,
  name: 'review_proposals',
  up(database: Database.Database): void {
    database.exec(REVIEW_PROPOSAL_SQL);
  },
};
