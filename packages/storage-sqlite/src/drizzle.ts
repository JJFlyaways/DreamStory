import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import type { SqliteConnection } from './connection.js';
import * as schema from './schema.js';

export type StoryDatabase = BetterSQLite3Database<typeof schema>;

export function createDrizzleDatabase(connection: SqliteConnection): StoryDatabase {
  return drizzle(connection.db, { schema });
}
