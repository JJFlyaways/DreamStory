import { initialOperationalTablesMigration } from './0001-initial-operational-tables.js';
import { booksMigration } from './0002-books.js';

export const INITIAL_MIGRATIONS = [initialOperationalTablesMigration, booksMigration] as const;
