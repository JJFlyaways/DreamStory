import type Database from 'better-sqlite3';

import type { Migration } from '../migration-runner.js';

const CONTINUITY_SQL = `
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('character', 'location', 'organization', 'item', 'world')),
  name TEXT NOT NULL,
  aliases_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (book_id, name)
);

CREATE INDEX IF NOT EXISTS entities_book_kind_idx
  ON entities (book_id, kind, name);

CREATE TABLE IF NOT EXISTS facts (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  predicate TEXT NOT NULL,
  value_json TEXT NOT NULL,
  valid_from_chapter INTEGER NOT NULL CHECK (valid_from_chapter >= 1),
  valid_to_chapter INTEGER,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('author', 'finalization', 'import')),
  source_id TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (entity_id, predicate, revision),
  CHECK (valid_to_chapter IS NULL OR valid_to_chapter >= valid_from_chapter)
);

CREATE INDEX IF NOT EXISTS facts_book_entity_predicate_idx
  ON facts (book_id, entity_id, predicate, valid_from_chapter);

CREATE INDEX IF NOT EXISTS facts_book_validity_idx
  ON facts (book_id, valid_from_chapter, valid_to_chapter);
`;

export const continuityMigration: Migration = {
  version: 7,
  name: 'continuity',
  up(database: Database.Database): void {
    database.exec(CONTINUITY_SQL);
  },
};
