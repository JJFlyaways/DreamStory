import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { BookCommandError, BookService } from '../../application/dist/index.js';
import {
  getProjectDatabasePath,
  initializeProjectDatabase,
  MigrationError,
  openProjectDatabase,
  openSqliteDatabase,
  probeProjectDatabase,
  readSchemaVersion,
  runMigrations,
} from '../dist/index.js';

async function createTestDirectory() {
  return mkdtemp(join(tmpdir(), 'dreamstory-storage-'));
}

async function removeTestDirectory(directory) {
  await rm(directory, { recursive: true, force: true });
}

test('opens a WAL database with foreign keys and a busy timeout', async () => {
  const directory = await createTestDirectory();
  try {
    const connection = openSqliteDatabase(join(directory, '.dreamstory', 'story.sqlite'));

    assert.deepEqual(connection.pragmas, {
      foreignKeysEnabled: true,
      journalMode: 'wal',
      busyTimeoutMs: 5000,
    });
    connection.db.exec(
      'CREATE TABLE parent (id INTEGER PRIMARY KEY); CREATE TABLE child (parent_id INTEGER REFERENCES parent(id));',
    );
    assert.throws(() => connection.db.prepare('INSERT INTO child (parent_id) VALUES (1)').run());
    connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});

test('creates a consistent backup before applying migrations', async () => {
  const directory = await createTestDirectory();
  try {
    const connection = openSqliteDatabase(join(directory, '.dreamstory', 'story.sqlite'));
    const result = await runMigrations(
      connection,
      [
        {
          version: 1,
          name: 'create_fixture',
          up: (database) => database.exec('CREATE TABLE fixture (value TEXT NOT NULL);'),
        },
        {
          version: 2,
          name: 'seed_fixture',
          up: (database) => database.prepare('INSERT INTO fixture (value) VALUES (?)').run('ready'),
        },
      ],
      {
        backupDirectory: join(directory, '.dreamstory', 'backups'),
        now: new Date('2026-10-20T12:34:56.789Z'),
      },
    );

    assert.equal(result.previousVersion, 0);
    assert.equal(result.currentVersion, 2);
    assert.deepEqual(result.appliedVersions, [1, 2]);
    assert.ok(result.backupPath);
    assert.equal(readSchemaVersion(connection.db), 2);
    assert.equal(connection.db.prepare('SELECT value FROM fixture').pluck().get(), 'ready');
    assert.equal(await readFile(result.backupPath, { encoding: 'utf8' }).then(() => true), true);
    const backup = openSqliteDatabase(result.backupPath);
    assert.equal(readSchemaVersion(backup.db), 0);
    assert.throws(() => backup.db.prepare('SELECT * FROM fixture').all());
    backup.close();
    connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});

test('rolls back all migrations when one migration fails', async () => {
  const directory = await createTestDirectory();
  try {
    const databasePath = join(directory, '.dreamstory', 'story.sqlite');
    const connection = openSqliteDatabase(databasePath);

    await assert.rejects(
      () =>
        runMigrations(
          connection,
          [
            {
              version: 1,
              name: 'create_fixture',
              up: (database) => database.exec('CREATE TABLE fixture (value TEXT NOT NULL);'),
            },
            {
              version: 2,
              name: 'fail_fixture',
              up: () => {
                throw new Error('fixture failure');
              },
            },
          ],
          { backupDirectory: join(directory, '.dreamstory', 'backups') },
        ),
      (error) => {
        assert.equal(error instanceof MigrationError, true);
        assert.ok(error.backupPath);
        return true;
      },
    );

    assert.equal(readSchemaVersion(connection.db), 0);
    assert.throws(() => connection.db.prepare('SELECT * FROM fixture').all());
    connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});

test('probes missing, ready, and invalid project databases', async () => {
  const directory = await createTestDirectory();
  try {
    const missing = probeProjectDatabase(directory);
    assert.equal(missing.status, 'missing');
    assert.equal(missing.databasePath, getProjectDatabasePath(directory));

    const connection = openProjectDatabase(directory);
    connection.close();
    const ready = probeProjectDatabase(directory);
    assert.equal(ready.status, 'ready');
    assert.equal(ready.schemaVersion, 0);
    assert.equal(ready.journalMode, 'wal');

    await writeFile(ready.databasePath, 'not a sqlite database');
    const invalid = probeProjectDatabase(directory);
    assert.equal(invalid.status, 'invalid');
  } finally {
    await removeTestDirectory(directory);
  }
});

test('initializes the operational schema and provides repository adapters', async () => {
  const directory = await createTestDirectory();
  try {
    const initialized = await initializeProjectDatabase(directory, {
      backupDirectory: join(directory, '.dreamstory', 'backups'),
      now: new Date('2026-10-20T12:34:56.789Z'),
    });

    assert.equal(initialized.migration.currentVersion, 2);
    assert.deepEqual(
      initialized.connection.db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .pluck()
        .all(),
      ['books', 'command_receipts', 'outbox_jobs', 'runs'],
    );

    const createdAt = '2026-10-20T12:34:56.000Z';
    const receipt = {
      bookId: 'book_01',
      commandKind: 'create_book',
      clientRequestId: 'c6595f8b-2583-4ccc-9569-62d273282eb9',
      result: { bookId: 'book_01' },
      createdAt,
    };
    await initialized.repositories.commandReceipts.save(receipt);
    await initialized.repositories.commandReceipts.save({ ...receipt, result: { changed: true } });
    assert.deepEqual(
      await initialized.repositories.commandReceipts.find(
        receipt.bookId,
        receipt.commandKind,
        receipt.clientRequestId,
      ),
      receipt,
    );

    const outboxJob = {
      id: 'job_01',
      kind: 'refresh_export',
      sourceId: 'finalization_01',
      sourceHash: `sha256:${'a'.repeat(64)}`,
      status: 'pending',
      attempts: 0,
      lastError: null,
      createdAt,
      updatedAt: createdAt,
    };
    await initialized.repositories.outboxJobs.enqueue(outboxJob);
    assert.deepEqual(await initialized.repositories.outboxJobs.listPending(10), [outboxJob]);
    await initialized.repositories.outboxJobs.markProcessing(outboxJob.id);
    await initialized.repositories.outboxJobs.markFailed(outboxJob.id, 'temporary failure');
    assert.deepEqual(
      initialized.connection.db
        .prepare('SELECT status, attempts, last_error FROM outbox_jobs WHERE id = ?')
        .get(outboxJob.id),
      { status: 'failed', attempts: 1, last_error: 'temporary failure' },
    );

    const run = {
      id: 'run_01',
      bookId: 'book_01',
      intent: 'draft_chapter',
      scope: { chapterNumbers: [1] },
      status: 'queued',
      inputSnapshotId: null,
      lease: null,
      attempt: 0,
      error: null,
      createdAt,
      updatedAt: createdAt,
    };
    await initialized.repositories.runs.create(run);
    assert.deepEqual(await initialized.repositories.runs.get(run.id), run);
    await initialized.repositories.runs.updateStatus(run.id, 'failed', { code: 'TEST_FAILURE' });
    assert.deepEqual((await initialized.repositories.runs.get(run.id)).error, {
      code: 'TEST_FAILURE',
    });

    const service = new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    );
    const created = await service.createBook({
      bookId: 'book_02',
      clientRequestId: 'b3b241cc-6f6e-4d98-a8e3-3e94d4e5c5dd',
      title: '测试作品',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证作品生命周期。',
      createdAt,
    });
    assert.equal(created.book.bookRevision, 1);
    const replay = await service.createBook({
      bookId: 'book_02',
      clientRequestId: 'b3b241cc-6f6e-4d98-a8e3-3e94d4e5c5dd',
      title: '不同标题',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '不应覆盖原结果。',
      createdAt,
    });
    assert.equal(replay.replayed, true);
    assert.deepEqual(replay.book, created.book);

    const updates = await Promise.allSettled([
      service.updateBook({
        bookId: 'book_02',
        clientRequestId: 'a4a0f5f8-7a7d-4dc7-ae84-b9c96d0f55c1',
        expectedBookRevision: 1,
        changes: { title: '并发更新 A' },
        updatedAt: '2026-10-20T12:35:00.000Z',
      }),
      service.updateBook({
        bookId: 'book_02',
        clientRequestId: '18b8654e-c799-4bf1-9999-838e356e79f1',
        expectedBookRevision: 1,
        changes: { title: '并发更新 B' },
        updatedAt: '2026-10-20T12:35:01.000Z',
      }),
    ]);
    assert.equal(updates.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(updates.filter((result) => result.status === 'rejected').length, 1);
    const rejection = updates.find((result) => result.status === 'rejected');
    assert.equal(rejection.reason instanceof BookCommandError, true);
    assert.equal(rejection.reason.code, 'REVISION_CONFLICT');

    initialized.connection.close();
    const reopened = await initializeProjectDatabase(directory);
    const persisted = await reopened.repositories.books.get('book_02');
    assert.equal(persisted.bookRevision, 2);
    assert.equal(persisted.title === '并发更新 A' || persisted.title === '并发更新 B', true);
    reopened.connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});
