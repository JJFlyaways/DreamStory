import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import Database from 'better-sqlite3';

export const DEFAULT_BUSY_TIMEOUT_MS = 5_000;

export interface SqliteConnectionOptions {
  busyTimeoutMs?: number;
}

export interface SqlitePragmaState {
  foreignKeysEnabled: true;
  journalMode: 'wal';
  busyTimeoutMs: number;
}

export class SqliteConnection {
  readonly databasePath: string;

  readonly db: Database.Database;

  readonly pragmas: SqlitePragmaState;

  constructor(databasePath: string, db: Database.Database, pragmas: SqlitePragmaState) {
    this.databasePath = databasePath;
    this.db = db;
    this.pragmas = pragmas;
  }

  close(): void {
    if (this.db.open) {
      this.db.close();
    }
  }
}

export function openSqliteDatabase(
  databasePath: string,
  options: SqliteConnectionOptions = {},
): SqliteConnection {
  const absolutePath = resolve(databasePath);
  const busyTimeoutMs = options.busyTimeoutMs ?? DEFAULT_BUSY_TIMEOUT_MS;

  if (!Number.isSafeInteger(busyTimeoutMs) || busyTimeoutMs < 0) {
    throw new Error('SQLite busy timeout must be a non-negative integer.');
  }

  mkdirSync(dirname(absolutePath), { recursive: true });
  const db = new Database(absolutePath);

  try {
    db.pragma('foreign_keys = ON');
    db.pragma(`busy_timeout = ${busyTimeoutMs}`);
    const journalMode = String(db.pragma('journal_mode = WAL', { simple: true })).toLowerCase();
    const foreignKeysEnabled = Number(db.pragma('foreign_keys', { simple: true }));
    const configuredBusyTimeout = Number(db.pragma('busy_timeout', { simple: true }));

    if (foreignKeysEnabled !== 1) {
      throw new Error('SQLite foreign key enforcement could not be enabled.');
    }

    if (journalMode !== 'wal') {
      throw new Error('SQLite WAL mode could not be enabled.');
    }

    if (configuredBusyTimeout !== busyTimeoutMs) {
      throw new Error('SQLite busy timeout was not applied.');
    }

    return new SqliteConnection(absolutePath, db, {
      foreignKeysEnabled: true,
      journalMode: 'wal',
      busyTimeoutMs: configuredBusyTimeout,
    });
  } catch (error) {
    db.close();
    throw error;
  }
}
