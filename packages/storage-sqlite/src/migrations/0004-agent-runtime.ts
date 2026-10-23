import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const AGENT_RUNTIME_SQL = `
CREATE TABLE IF NOT EXISTS run_steps (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  sequence INTEGER NOT NULL CHECK (sequence >= 0),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'unknown')),
  attempt INTEGER NOT NULL DEFAULT 0 CHECK (attempt >= 0),
  input_snapshot_id TEXT,
  artifact_id TEXT,
  error_json TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (run_id, sequence)
);

CREATE INDEX IF NOT EXISTS run_steps_run_sequence_idx
  ON run_steps (run_id, sequence);

CREATE TABLE IF NOT EXISTS run_events (
  run_id TEXT NOT NULL,
  sequence INTEGER NOT NULL CHECK (sequence >= 0),
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (run_id, sequence)
);

CREATE TABLE IF NOT EXISTS input_snapshots (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  context_text TEXT NOT NULL,
  source_fingerprint TEXT NOT NULL,
  execution_fingerprint TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS run_artifacts (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('proposal', 'draft_candidate', 'review', 'revision_candidate')),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  complete INTEGER NOT NULL CHECK (complete IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS run_artifacts_run_revision_idx
  ON run_artifacts (run_id, revision DESC);

CREATE TABLE IF NOT EXISTS model_calls (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'dispatched', 'completed', 'failed', 'unknown')),
  input_tokens INTEGER,
  output_tokens INTEGER,
  usage_kind TEXT NOT NULL CHECK (usage_kind IN ('reported', 'estimated', 'unknown')),
  error_json TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS model_calls_run_created_idx
  ON model_calls (run_id, created_at);

CREATE TABLE IF NOT EXISTS book_leases (
  book_id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  heartbeat_at TEXT NOT NULL
);
`;

export const agentRuntimeMigration: Migration = {
  version: 4,
  name: 'agent_runtime',
  up(database: Database.Database): void {
    database.exec(AGENT_RUNTIME_SQL);
  },
};
