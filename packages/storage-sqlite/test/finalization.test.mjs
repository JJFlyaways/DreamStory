import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  BookService,
  FinalizationError,
  FinalizationService,
} from '../../application/dist/index.js';
import { initializeProjectDatabase } from '../dist/index.js';

const timestamp = '2026-10-23T12:00:00.000Z';
const hash = (value) => `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;

test('atomically finalizes a complete draft and enqueues derived work', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dreamstory-finalization-'));
  try {
    const initialized = await initializeProjectDatabase(directory);
    const books = new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    );
    await books.createBook({
      bookId: 'book_finalize_01',
      clientRequestId: 'bd6157e1-d1c7-4d0e-bd5a-70b14680c1b9',
      title: '定稿测试书',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证不可变定稿。',
      createdAt: timestamp,
    });
    const plan = await initialized.repositories.plans.save(
      {
        id: 'plan_finalize_01',
        bookId: 'book_finalize_01',
        parentId: null,
        kind: 'book',
        sortKey: '0001',
        content: {
          title: '第一章',
          goal: '完成定稿测试',
          conflict: '正文必须保留',
          startState: '有草稿',
          endState: '已定稿',
          requiredBeats: ['提交正文'],
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
        id: 'chapter_finalize_01',
        bookId: 'book_finalize_01',
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
    const content = '她把信收进了抽屉。';
    await initialized.repositories.drafts.save(
      {
        id: 'draft_finalize_01',
        chapterId: 'chapter_finalize_01',
        content,
        complete: true,
        sourceRunId: null,
        createdBy: 'author',
        createdAt: timestamp,
      },
      0,
    );
    const service = new FinalizationService(
      initialized.repositories.books,
      initialized.repositories.chapters,
      initialized.repositories.drafts,
      initialized.repositories.finalizations,
      initialized.repositories.commandReceipts,
    );
    const result = await service.finalize({
      bookId: 'book_finalize_01',
      chapterId: 'chapter_finalize_01',
      clientRequestId: 'c5ed9f6d-28a5-4c0e-bf40-1c263b6c0980',
      expectedBookRevision: 3,
      expectedDraftRevision: 1,
      draftVersionId: 'draft_finalize_01',
      contentHash: hash(content),
      committedAt: timestamp,
    });
    assert.equal(result.replayed, false);
    assert.equal(result.bookRevision, 4);
    assert.equal(
      (await initialized.repositories.finalizations.list('chapter_finalize_01')).length,
      1,
    );
    assert.equal((await initialized.repositories.outboxJobs.listPending(10)).length, 3);
    assert.equal(
      (await initialized.repositories.chapters.get('book_finalize_01', 'chapter_finalize_01'))
        .currentFinalizationId,
      result.finalization.id,
    );

    const replay = await service.finalize({
      bookId: 'book_finalize_01',
      chapterId: 'chapter_finalize_01',
      clientRequestId: 'c5ed9f6d-28a5-4c0e-bf40-1c263b6c0980',
      expectedBookRevision: 3,
      expectedDraftRevision: 1,
      draftVersionId: 'draft_finalize_01',
      contentHash: hash(content),
      committedAt: timestamp,
    });
    assert.equal(replay.replayed, true);
    assert.equal(replay.finalization.id, result.finalization.id);

    await assert.rejects(
      () =>
        service.finalize({
          bookId: 'book_finalize_01',
          chapterId: 'chapter_finalize_01',
          clientRequestId: '7f669ea8-bc46-4f8f-89d5-7cdd39f5bc75',
          expectedBookRevision: 4,
          expectedDraftRevision: 1,
          draftVersionId: 'draft_finalize_01',
          contentHash: hash('stale'),
          committedAt: timestamp,
        }),
      FinalizationError,
    );
    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
