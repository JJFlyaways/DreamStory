import { initialOperationalTablesMigration } from './0001-initial-operational-tables.js';
import { booksMigration } from './0002-books.js';
import { writingModelMigration } from './0003-writing-model.js';
import { agentRuntimeMigration } from './0004-agent-runtime.js';
import { reviewProposalMigration } from './0005-review-proposals.js';
import { finalizationsMigration } from './0006-finalizations.js';
import { continuityMigration } from './0007-continuity.js';
import { factRevelationsMigration } from './0008-fact-revelations.js';
import { threadsMigration } from './0009-threads.js';

export const INITIAL_MIGRATIONS = [
  initialOperationalTablesMigration,
  booksMigration,
  writingModelMigration,
  agentRuntimeMigration,
  reviewProposalMigration,
  finalizationsMigration,
  continuityMigration,
  factRevelationsMigration,
  threadsMigration,
] as const;
