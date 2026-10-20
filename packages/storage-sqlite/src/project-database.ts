import { existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

import Database from 'better-sqlite3';

import {
  openSqliteDatabase,
  type SqliteConnection,
  type SqliteConnectionOptions,
} from './connection.js';
import { readSchemaVersion } from './migration-runner.js';

export const PROJECT_DIRECTORY_NAME = '.dreamstory';
export const DATABASE_FILE_NAME = 'story.sqlite';

export type ProjectDatabaseStatus = 'missing' | 'ready' | 'invalid';

export interface ProjectDatabaseProbe {
  projectRoot: string;
  databasePath: string;
  status: ProjectDatabaseStatus;
  schemaVersion: number | null;
  journalMode: 'wal' | 'unknown';
  reason?: 'not_a_file' | 'open_failed' | 'integrity_failed' | 'not_wal';
}

export function getProjectDatabasePath(projectRoot: string): string {
  return join(resolve(projectRoot), PROJECT_DIRECTORY_NAME, DATABASE_FILE_NAME);
}

export function openProjectDatabase(
  projectRoot: string,
  options: SqliteConnectionOptions = {},
): SqliteConnection {
  return openSqliteDatabase(getProjectDatabasePath(projectRoot), options);
}

export function probeProjectDatabase(projectRoot: string): ProjectDatabaseProbe {
  const resolvedProjectRoot = resolve(projectRoot);
  const databasePath = getProjectDatabasePath(resolvedProjectRoot);

  if (!existsSync(databasePath)) {
    return {
      projectRoot: resolvedProjectRoot,
      databasePath,
      status: 'missing',
      schemaVersion: null,
      journalMode: 'unknown',
    };
  }

  if (!statSync(databasePath).isFile()) {
    return {
      projectRoot: resolvedProjectRoot,
      databasePath,
      status: 'invalid',
      schemaVersion: null,
      journalMode: 'unknown',
      reason: 'not_a_file',
    };
  }

  let database: Database.Database | undefined;
  try {
    database = new Database(databasePath, { readonly: true, fileMustExist: true });
    const journalMode = String(database.pragma('journal_mode', { simple: true })).toLowerCase();
    const integrity = String(database.pragma('quick_check', { simple: true })).toLowerCase();
    const schemaVersion = readSchemaVersion(database);

    if (integrity !== 'ok') {
      return {
        projectRoot: resolvedProjectRoot,
        databasePath,
        status: 'invalid',
        schemaVersion,
        journalMode: journalMode === 'wal' ? 'wal' : 'unknown',
        reason: 'integrity_failed',
      };
    }

    if (journalMode !== 'wal') {
      return {
        projectRoot: resolvedProjectRoot,
        databasePath,
        status: 'invalid',
        schemaVersion,
        journalMode: 'unknown',
        reason: 'not_wal',
      };
    }

    return {
      projectRoot: resolvedProjectRoot,
      databasePath,
      status: 'ready',
      schemaVersion,
      journalMode: 'wal',
    };
  } catch {
    return {
      projectRoot: resolvedProjectRoot,
      databasePath,
      status: 'invalid',
      schemaVersion: null,
      journalMode: 'unknown',
      reason: 'open_failed',
    };
  } finally {
    database?.close();
  }
}
