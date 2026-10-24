import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  BookService,
  ThreadCommandError,
  ThreadService,
} from '../../application/dist/index.js';
import { initializeProjectDatabase } from '../dist/index.js';

const timestamp = '2026-10-24T12:00:00.000Z';

function hash(value) {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

async function createDirectory() {
  return mkdtemp(join(tmpdir(), 'dreamstory-threads-'));
}

test('tracks story thread events and requires finalization evidence', async () => {
  const directory = await createDirectory();
  try {
    const initialized = await initializeProjectDatabase(directory);
    const books = new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    );
    await books.createBook({
      bookId: 'book_threads_01',
      clientRequestId: 'c6595f8b-2583-4ccc-9569-62d273282eb9',
      title: '伏笔测试',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证故事线事件。',
      createdAt: timestamp,
    });
    const service = new ThreadService(initialized.repositories);
    const created = await service.create({
      bookId: 'book_threads_01',
      clientRequestId: 'b3b241cc-6f6e-4d98-a8e3-3e94d4e5c5dd',
      expectedBookRevision: 1,
      thread: {
        id: 'thread_old_postmark',
        bookId: 'book_threads_01',
        kind: 'foreshadow',
        name: '旧邮戳的秘密',
        plannedPayoff: '在第三章揭示邮戳对应的转运站。',
        status: 'open',
      },
      now: timestamp,
    });
    assert.equal(created.bookRevision, 2);

    const planted = await service.appendEvent({
      bookId: 'book_threads_01',
      clientRequestId: 'd74e7b8e-80f0-4c20-8f9c-b1b82f9a6d5b',
      expectedBookRevision: 2,
      event: {
        id: 'thread_event_planted_01',
        bookId: 'book_threads_01',
        threadId: 'thread_old_postmark',
        kind: 'planted',
        chapterId: null,
        evidenceKind: 'author',
        sourceId: 'author_thread_01',
        sourceHash: hash('author-confirmed-thread'),
        textRange: null,
      },
      now: timestamp,
    });
    assert.equal(planted.bookRevision, 3);

    const finalContent = '林澜看见北站的旧邮戳。';
    const finalHash = hash(finalContent);
    initialized.connection.db
      .prepare(
        `INSERT INTO finalizations (
          id, chapter_id, draft_version_id, content, content_hash,
          supersedes_id, committed_at
        ) VALUES (?, ?, ?, ?, ?, NULL, ?)`,
      )
      .run(
        'finalization_thread_01',
        'chapter_03',
        'draft_thread_01',
        finalContent,
        finalHash,
        timestamp,
      );

    const resolved = await service.appendEvent({
      bookId: 'book_threads_01',
      clientRequestId: 'f1c22d4b-cf76-46c2-bc03-e4a4d794caf1',
      expectedBookRevision: 3,
      event: {
        id: 'thread_event_resolved_01',
        bookId: 'book_threads_01',
        threadId: 'thread_old_postmark',
        kind: 'resolved',
        chapterId: 'chapter_03',
        evidenceKind: 'finalization',
        sourceId: 'finalization_thread_01',
        sourceHash: finalHash,
        textRange: { start: 0, end: 2, quoteHash: hash('林澜') },
      },
      now: timestamp,
    });
    assert.equal(resolved.bookRevision, 4);
    assert.equal(resolved.value.kind, 'resolved');
    assert.equal((await service.list('book_threads_01'))[0].status, 'resolved');
    assert.equal((await service.listEvents('book_threads_01', 'thread_old_postmark')).length, 2);

    await assert.rejects(
      () =>
        service.appendEvent({
          bookId: 'book_threads_01',
          clientRequestId: 'a4a0f5f8-7a7d-4dc7-ae84-b9c96d0f55c1',
          expectedBookRevision: 4,
          event: {
            id: 'thread_event_after_resolve',
            bookId: 'book_threads_01',
            threadId: 'thread_old_postmark',
            kind: 'advanced',
            chapterId: 'chapter_03',
            evidenceKind: 'finalization',
            sourceId: 'finalization_thread_01',
            sourceHash: finalHash,
            textRange: { start: 0, end: 2, quoteHash: hash('错误') },
          },
          now: timestamp,
        }),
      (error) => {
        assert.equal(error instanceof ThreadCommandError, true);
        assert.equal(error.code, 'VALIDATION_ERROR');
        return true;
      },
    );

    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
