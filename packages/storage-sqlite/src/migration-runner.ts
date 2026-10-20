import type Database from 'better-sqlite3';

import { createConsistentBackup, createMigrationBackupPath } from './backup.js';
import type { SqliteConnection } from './connection.js';

export interface Migration {
  version: number;
  name: string;
  up: (database: Database.Database) => void;
}

export interface MigrationRunnerOptions {
  backupDirectory?: string;
  now?: Date;
}

export interface MigrationResult {
  previousVersion: number;
  currentVersion: number;
  appliedVersions: readonly number[];
  backupPath: string | null;
}

export class MigrationError extends Error {
  readonly backupPath: string | null;

  constructor(message: string, backupPath: string | null, cause?: unknown) {
    super(message);
    this.name = 'MigrationError';
    this.backupPath = backupPath;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

export function readSchemaVersion(database: Database.Database): number {
  const version = Number(database.pragma('user_version', { simple: true }));
  if (!Number.isSafeInteger(version) || version < 0) {
    throw new Error('SQLite schema version is invalid.');
  }

  return version;
}

export async function runMigrations(
  connection: SqliteConnection,
  migrations: readonly Migration[],
  options: MigrationRunnerOptions = {},
): Promise<MigrationResult> {
  validateMigrations(migrations);

  const previousVersion = readSchemaVersion(connection.db);
  const pendingMigrations = migrations.filter((migration) => migration.version > previousVersion);

  if (pendingMigrations.length === 0) {
    return {
      previousVersion,
      currentVersion: previousVersion,
      appliedVersions: [],
      backupPath: null,
    };
  }

  validatePendingVersions(previousVersion, pendingMigrations);
  const backupPath = createMigrationBackupPath(connection.databasePath, options);

  try {
    await createConsistentBackup(connection.db, backupPath);
  } catch (error) {
    throw new MigrationError('Could not create the pre-migration backup.', null, error);
  }

  try {
    const applyMigrations = connection.db.transaction(() => {
      for (const migration of pendingMigrations) {
        migration.up(connection.db);
        connection.db.pragma(`user_version = ${migration.version}`);
      }
    });

    applyMigrations();
  } catch (error) {
    throw new MigrationError(
      'Migration failed; the original database was left unchanged. Restore from the backup if required.',
      backupPath,
      error,
    );
  }

  return {
    previousVersion,
    currentVersion: readSchemaVersion(connection.db),
    appliedVersions: pendingMigrations.map((migration) => migration.version),
    backupPath,
  };
}

function validateMigrations(migrations: readonly Migration[]): void {
  let previousVersion = 0;
  for (const migration of migrations) {
    if (!Number.isSafeInteger(migration.version) || migration.version <= previousVersion) {
      throw new Error('Migrations must have strictly increasing positive versions.');
    }
    if (migration.name.trim() === '') {
      throw new Error('Migrations must have non-empty names.');
    }
    previousVersion = migration.version;
  }
}

function validatePendingVersions(previousVersion: number, migrations: readonly Migration[]): void {
  let expectedVersion = previousVersion + 1;
  for (const migration of migrations) {
    if (migration.version !== expectedVersion) {
      throw new Error(`Missing SQLite migration version ${expectedVersion}.`);
    }
    expectedVersion += 1;
  }
}
