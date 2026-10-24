import type Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import type { SqliteConnection } from './connection.js';
import * as schema from './schema.js';

export type StoryDatabase = BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
};

export function createDrizzleDatabase(connection: SqliteConnection): StoryDatabase {
  return drizzle(connection.db, { schema });
}
