import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  BookService,
  FinalizationService,
} from '../../application/dist/index.js';
import { initializeProjectDatabase } from '../dist/index.js';

const timestamp = '2026-10-24T12:00:00.000Z';
const hash = (value) => `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;

test('marks derived objects stale when a chapter finalization is superseded', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dreamstory-invalidations-'));
  try {
    const initialized = await initializeProjectDatabase(directory);
    const books = new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    );
    await books.createBook({
      bookId: 'book_invalidation_01',
      clientRequestId: 'c6595f8b-2583-4ccc-9569-62d273282eb9',
      title: '失效测试书',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证旧定稿影响传播。',
      createdAt: timestamp,
    });
    const plan = await initialized.repositories.plans.save(
      {
        id: 'plan_invalidation_01',
        bookId: 'book_invalidation_01',
        parentId: null,
        kind: 'book',
        sortKey: '0001',
        content: {
          title: '第一章',
          goal: '验证失效',
          conflict: '来源会变化',
          startState: '有旧定稿',
          endState: '有新定稿',
          requiredBeats: ['重定稿'],
          avoid: [],
        },
        status: 'confirmed',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      1,
    );
    await initialized.repositories.chapters.create(
      {
        id: 'chapter_invalidation_01',
        bookId: 'book_invalidation_01',
        chapterNumber: 1,
        displayTitle: '第一章',
        planNodeId: plan.node.id,
        currentDraftId: null,
        currentFinalizationId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      2,
    );
    const oldContent = '旧版本正文。';
    await initialized.repositories.drafts.save(
      {
        id: 'draft_invalidation_01',
        chapterId: 'chapter_invalidation_01',
        content: oldContent,
        complete: true,
        sourceRunId: null,
        createdBy: 'author',
        createdAt: timestamp,
      },
      0,
    );
    const oldHash = hash(oldContent);
    const finalizationService = new FinalizationService(
      initialized.repositories.books,
      initialized.repositories.chapters,
      initialized.repositories.drafts,
      initialized.repositories.finalizations,
      initialized.repositories.commandReceipts,
    );
    const first = await finalizationService.finalize({
      bookId: 'book_invalidation_01',
      chapterId: 'chapter_invalidation_01',
      clientRequestId: 'b3b241cc-6f6e-4d98-a8e3-3e94d4e5c5dd',
      expectedBookRevision: 3,
      expectedDraftRevision: 1,
      draftVersionId: 'draft_invalidation_01',
      contentHash: oldHash,
      committedAt: timestamp,
    });

    const runId = 'run_invalidation_01';
    await initialized.repositories.runs.saveInputSnapshot({
      id: 'snapshot_invalidation_01',
      bookId: 'book_invalidation_01',
      manifest: {
        sources: [
          {
            source: {
              kind: 'finalization',
              id: first.finalization.id,
              version: null,
              contentHash: oldHash,
              chapterNumber: 1,
            },
            included: true,
            reason: 'previous chapter',
          },
        ],
        sourceFingerprint: oldHash,
      },
      contextText: 'old context',
      sourceFingerprint: oldHash,
      executionFingerprint: oldHash,
      promptVersion: 'writer-v1',
      createdAt: timestamp,
    });
    await initialized.repositories.runs.create({
      id: runId,
      bookId: 'book_invalidation_01',
      intent: 'draft_chapter',
      scope: { chapterNumbers: [1] },
      status: 'awaiting_author',
      inputSnapshotId: 'snapshot_invalidation_01',
      lease: null,
      attempt: 1,
      error: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await initialized.repositories.runs.saveArtifact({
      id: 'artifact_invalidation_01',
      runId,
      kind: 'draft_candidate',
      revision: 1,
      content: oldContent,
      contentHash: oldHash,
      complete: true,
      createdAt: timestamp,
    });
    await initialized.repositories.proposals.save({
      id: 'proposal_invalidation_01',
      bookId: 'book_invalidation_01',
      kind: 'plan',
      payload: { content: { title: '旧候选' } },
      revision: 1,
      sourceFingerprint: oldHash,
      status: 'pending',
      sourceRunId: runId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const newContent = '新版本正文。';
    initialized.connection.db
      .prepare(
        `INSERT INTO draft_versions (
          id, chapter_id, parent_id, revision, content, complete,
          source_run_id, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, 1, ?, 'author', ?)`,
      )
      .run(
        'draft_invalidation_02',
        'chapter_invalidation_01',
        'draft_invalidation_01',
        2,
        newContent,
        runId,
        timestamp,
      );
    initialized.connection.db
      .prepare('UPDATE chapters SET current_draft_id = ? WHERE id = ?')
      .run('draft_invalidation_02', 'chapter_invalidation_01');
    initialized.connection.db
      .prepare(
        `INSERT INTO reviews (
          id, chapter_id, draft_version_id, draft_hash, revision, created_at
        ) VALUES (?, ?, ?, ?, 1, ?)`,
      )
      .run(
        'review_invalidation_01',
        'chapter_invalidation_01',
        'draft_invalidation_02',
        hash(newContent),
        timestamp,
      );
    initialized.connection.db
      .prepare(
        `INSERT INTO facts (
          id, book_id, entity_id, predicate, value_json, valid_from_chapter,
          valid_to_chapter, source_kind, source_id, source_hash, revision,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 1, NULL, 'finalization', ?, ?, 1, ?, ?)`,
      )
      .run(
        'fact_invalidation_01',
        'book_invalidation_01',
        'entity_invalidation_01',
        'state',
        JSON.stringify('old'),
        first.finalization.id,
        oldHash,
        timestamp,
        timestamp,
      );
    initialized.connection.db
      .prepare(
        `INSERT INTO fact_revelations (
          id, book_id, fact_id, chapter_id, source_hash, text_range_json,
          visibility, known_to_entity_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, 'author_truth', NULL, ?, ?)`,
      )
      .run(
        'revelation_invalidation_01',
        'book_invalidation_01',
        'fact_invalidation_01',
        'chapter_invalidation_01',
        oldHash,
        timestamp,
        timestamp,
      );
    initialized.connection.db
      .prepare(
        `INSERT INTO thread_events (
          id, book_id, thread_id, kind, chapter_id, evidence_kind,
          source_id, source_hash, text_range_json, created_at, updated_at
        ) VALUES (?, ?, ?, 'planted', ?, 'finalization', ?, ?, NULL, ?, ?)`,
      )
      .run(
        'thread_event_invalidation_01',
        'book_invalidation_01',
        'thread_invalidation_01',
        'chapter_invalidation_01',
        first.finalization.id,
        oldHash,
        timestamp,
        timestamp,
      );

    const finalization = await finalizationService.finalize({
      bookId: 'book_invalidation_01',
      chapterId: 'chapter_invalidation_01',
      clientRequestId: 'f1c22d4b-cf76-46c2-bc03-e4a4d794caf1',
      expectedBookRevision: 4,
      expectedDraftRevision: 2,
      draftVersionId: 'draft_invalidation_02',
      contentHash: hash(newContent),
      committedAt: timestamp,
    });
    assert.equal(finalization.bookRevision, 5);
    assert.equal((await initialized.repositories.runs.get(runId)).status, 'stale');
    assert.equal((await initialized.repositories.proposals.get('book_invalidation_01', 'proposal_invalidation_01')).status, 'stale');

    const invalidations = await initialized.repositories.invalidations.list('book_invalidation_01');
    assert.deepEqual(
      new Set(invalidations.map((item) => item.objectKind)),
      new Set([
        'chapter_projection',
        'search_index',
        'input_snapshot',
        'run',
        'run_artifact',
        'proposal',
        'review',
        'fact',
        'fact_revelation',
        'thread_event',
      ]),
    );
    const cleared = await initialized.repositories.invalidations.clear(
      invalidations[0].id,
      timestamp,
    );
    assert.equal(cleared.status, 'cleared');
    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
