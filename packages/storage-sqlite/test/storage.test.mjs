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

    assert.equal(initialized.migration.currentVersion, 10);
    assert.deepEqual(
      initialized.connection.db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .pluck()
        .all(),
      [
        'book_leases',
        'books',
        'chapter_fts',
        'chapter_fts_config',
        'chapter_fts_content',
        'chapter_fts_data',
        'chapter_fts_docsize',
        'chapter_fts_idx',
        'chapters',
        'command_receipts',
        'draft_versions',
        'entities',
        'entity_mentions',
        'fact_revelations',
        'facts',
        'finalizations',
        'input_snapshots',
        'model_calls',
        'outbox_jobs',
        'plan_node_versions',
        'plan_nodes',
        'proposals',
        'review_findings',
        'reviews',
        'run_artifacts',
        'run_events',
        'run_steps',
        'runs',
        'sqlite_sequence',
        'story_threads',
        'thread_events',
      ],
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

    const writingService = new BookService(
      reopened.repositories.books,
      reopened.repositories.commandReceipts,
    );
    const writingBook = await writingService.createBook({
      bookId: 'book_03',
      clientRequestId: 'a57d7460-1b24-4b19-91c9-879fa8f28e4f',
      title: '规划测试书',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证规划、章节和草稿版本。',
      createdAt,
    });
    const rootPlan = {
      id: 'plan_book_03',
      bookId: writingBook.book.id,
      parentId: null,
      kind: 'book',
      sortKey: '0001',
      content: {
        title: '规划测试书',
        goal: '建立完整故事方向',
        conflict: '主角必须面对过去',
        startState: '主角仍在逃避',
        endState: '主角决定调查真相',
        requiredBeats: ['收到线索'],
        avoid: ['提前揭示真相'],
      },
      status: 'confirmed',
      createdAt,
      updatedAt: createdAt,
    };
    const savedRoot = await reopened.repositories.plans.save(rootPlan, 1);
    assert.equal(savedRoot.bookRevision, 2);
    assert.equal(savedRoot.node.version, 1);
    const savedRootAgain = await reopened.repositories.plans.save(
      { ...rootPlan, content: { ...rootPlan.content, goal: '建立可执行故事方向' } },
      2,
    );
    assert.equal(savedRootAgain.bookRevision, 3);
    assert.equal((await reopened.repositories.plans.history('book_03', 'plan_book_03')).length, 2);

    const chapterPlan = await reopened.repositories.plans.save(
      {
        id: 'plan_chapter_01',
        bookId: 'book_03',
        parentId: 'plan_book_03',
        kind: 'chapter',
        sortKey: '0001',
        content: {
          title: '第一章：旧信',
          goal: '让主角收到关键线索',
          conflict: '主角不相信寄件人仍然活着',
          startState: '主角认为母亲已经失踪十年',
          endState: '主角决定追查邮戳',
          requiredBeats: ['收到旧信'],
          avoid: ['揭示寄件人身份'],
        },
        status: 'confirmed',
        createdAt,
        updatedAt: createdAt,
      },
      3,
    );
    assert.equal(chapterPlan.bookRevision, 4);
    const chapter = await reopened.repositories.chapters.create(
      {
        id: 'chapter_01',
        bookId: 'book_03',
        chapterNumber: 1,
        displayTitle: '第一章：旧信',
        planNodeId: 'plan_chapter_01',
        currentDraftId: null,
        currentFinalizationId: null,
        createdAt,
        updatedAt: createdAt,
      },
      4,
    );
    assert.equal(chapter.bookRevision, 5);
    const firstDraft = await reopened.repositories.drafts.save(
      {
        id: 'draft_01',
        chapterId: 'chapter_01',
        content: '雨停时，信才送到她手上。',
        complete: false,
        sourceRunId: null,
        createdBy: 'author',
        createdAt,
      },
      0,
    );
    assert.equal(firstDraft.draft.revision, 1);
    const secondDraft = await reopened.repositories.drafts.save(
      {
        id: 'draft_02',
        chapterId: 'chapter_01',
        content: '雨停时，信才送到她手上。她看见了旧邮戳。',
        complete: true,
        sourceRunId: null,
        createdBy: 'author',
        createdAt: '2026-10-20T12:36:00.000Z',
      },
      1,
    );
    assert.equal(secondDraft.draft.revision, 2);
    assert.equal((await reopened.repositories.drafts.current('chapter_01')).id, 'draft_02');
    assert.equal((await reopened.repositories.drafts.list('chapter_01')).length, 2);
    reopened.connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});

test('persists recoverable run state, artifacts, model calls, and leases', async () => {
  const directory = await createTestDirectory();
  try {
    const initialized = await initializeProjectDatabase(directory);
    const createdAt = '2026-10-23T12:00:00.000Z';
    const run = {
      id: 'run_p2_01',
      bookId: 'book_01',
      intent: 'draft_chapter',
      scope: { chapterNumbers: [1] },
      status: 'queued',
      inputSnapshotId: 'snapshot_01',
      lease: null,
      attempt: 0,
      error: null,
      createdAt,
      updatedAt: createdAt,
    };
    await initialized.repositories.runs.create(run);
    await initialized.repositories.runs.createStep({
      id: 'step_p2_01',
      runId: run.id,
      sequence: 0,
      name: 'build_context',
      status: 'pending',
      attempt: 0,
      inputSnapshotId: null,
      artifactId: null,
      error: null,
      startedAt: null,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    });
    await initialized.repositories.runs.updateStep('step_p2_01', {
      status: 'completed',
      completedAt: createdAt,
      updatedAt: createdAt,
    });
    assert.equal((await initialized.repositories.runs.listSteps(run.id))[0].status, 'completed');

    const event = await initialized.repositories.runs.appendEvent({
      runId: run.id,
      eventType: 'run.started',
      payload: { status: 'running' },
      createdAt,
    });
    const secondEvent = await initialized.repositories.runs.appendEvent({
      runId: run.id,
      eventType: 'step.completed',
      payload: { stepId: 'step_p2_01' },
      createdAt,
    });
    assert.equal(event.sequence, 1);
    assert.equal(secondEvent.sequence, 2);

    await initialized.repositories.runs.saveInputSnapshot({
      id: 'snapshot_01',
      bookId: 'book_01',
      manifest: { sources: [], sourceFingerprint: `sha256:${'a'.repeat(64)}` },
      contextText: 'context',
      sourceFingerprint: `sha256:${'a'.repeat(64)}`,
      executionFingerprint: `sha256:${'b'.repeat(64)}`,
      promptVersion: 'writer-v1',
      createdAt,
    });
    assert.equal(
      (await initialized.repositories.runs.getInputSnapshot('snapshot_01')).contextText,
      'context',
    );

    await initialized.repositories.runs.saveArtifact({
      id: 'artifact_p2_01',
      runId: run.id,
      kind: 'draft_candidate',
      revision: 1,
      content: '候选正文',
      contentHash: `sha256:${'c'.repeat(64)}`,
      complete: false,
      createdAt,
    });
    assert.equal((await initialized.repositories.runs.listArtifacts(run.id)).length, 1);

    await initialized.repositories.runs.reserveModelCall({
      id: 'call_p2_01',
      runId: run.id,
      stepId: 'step_p2_01',
      provider: 'openai-compatible',
      model: 'writer-primary',
      status: 'reserved',
      inputTokens: null,
      outputTokens: null,
      usageKind: 'unknown',
      error: null,
      createdAt,
      completedAt: null,
    });
    await initialized.repositories.runs.updateModelCall('call_p2_01', {
      status: 'completed',
      inputTokens: 10,
      outputTokens: 20,
      usageKind: 'reported',
      completedAt: createdAt,
    });
    assert.equal(
      (await initialized.repositories.runs.getModelCall('call_p2_01')).status,
      'completed',
    );

    const lease = {
      bookId: 'book_01',
      ownerId: 'worker_01',
      expiresAt: '2026-10-23T12:05:00.000Z',
      heartbeatAt: createdAt,
    };
    assert.equal(await initialized.repositories.runs.acquireLease(lease), true);
    assert.equal(
      await initialized.repositories.runs.acquireLease({ ...lease, ownerId: 'worker_02' }),
      false,
    );
    assert.equal(
      await initialized.repositories.runs.heartbeatLease(
        lease.bookId,
        lease.ownerId,
        '2026-10-23T12:06:00.000Z',
        '2026-10-23T12:01:00.000Z',
      ),
      true,
    );
    await initialized.repositories.runs.releaseLease(lease.bookId, lease.ownerId);
    assert.deepEqual(await initialized.repositories.runs.recoverExpiredLeases(createdAt), []);

    initialized.connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});
