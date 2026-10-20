import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import type Database from 'better-sqlite3';

export interface MigrationBackupPathOptions {
  backupDirectory?: string;
  now?: Date;
}

export function createMigrationBackupPath(
  databasePath: string,
  options: MigrationBackupPathOptions = {},
): string {
  const backupDirectory = options.backupDirectory ?? join(dirname(databasePath), 'backups');
  const timestamp = formatBackupTimestamp(options.now ?? new Date());
  const databaseName = basename(databasePath, '.sqlite');
  const basePath = join(backupDirectory, `${databaseName}.${timestamp}.sqlite`);

  let candidate = basePath;
  let suffix = 1;
  while (existsSync(candidate)) {
    candidate = join(backupDirectory, `${databaseName}.${timestamp}.${suffix}.sqlite`);
    suffix += 1;
  }

  return candidate;
}

export async function createConsistentBackup(
  database: Database.Database,
  backupPath: string,
): Promise<void> {
  mkdirSync(dirname(backupPath), { recursive: true });

  try {
    await database.backup(backupPath);
  } catch (error) {
    if (existsSync(backupPath)) {
      unlinkSync(backupPath);
    }
    throw error;
  }
}

function formatBackupTimestamp(value: Date): string {
  return value.toISOString().replace(/[-:.]/g, '').replace('Z', 'Z');
}
