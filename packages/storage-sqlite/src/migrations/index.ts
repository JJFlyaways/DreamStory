import { initialOperationalTablesMigration } from './0001-initial-operational-tables.js';
import { booksMigration } from './0002-books.js';
import { writingModelMigration } from './0003-writing-model.js';

export const INITIAL_MIGRATIONS = [
  initialOperationalTablesMigration,
  booksMigration,
  writingModelMigration,
] as const;
