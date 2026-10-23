import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { BookService, ReviewService, ReviewValidationError } from '../../application/dist/index.js';
import { initializeProjectDatabase } from '../dist/index.js';

const timestamp = '2026-10-23T12:00:00.000Z';
const hash = (value) => `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;

test('validates review evidence and persists author dispositions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dreamstory-review-'));
  try {
    const initialized = await initializeProjectDatabase(directory);
    const bookService = new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    );
    await bookService.createBook({
      bookId: 'book_review_01',
      clientRequestId: '2ea4df09-cb27-48d0-83ea-f3c1d6e3f1bc',
      title: '审稿测试书',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证引文边界。',
      createdAt: timestamp,
    });
    const plan = await initialized.repositories.plans.save(
      {
        id: 'plan_review_chapter',
        bookId: 'book_review_01',
        parentId: null,
        kind: 'book',
        sortKey: '0001',
        content: {
          title: '第一章',
          goal: '留下线索',
          conflict: '线索真假未明',
          startState: '没有证据',
          endState: '决定追查',
          requiredBeats: ['看见邮戳'],
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
        id: 'chapter_review_01',
        bookId: 'book_review_01',
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
    const content = '她看见旧邮戳。';
    await initialized.repositories.drafts.save(
      {
        id: 'draft_review_01',
        chapterId: 'chapter_review_01',
        content,
        complete: true,
        sourceRunId: null,
        createdBy: 'author',
        createdAt: timestamp,
      },
      0,
    );

    const service = new ReviewService(
      initialized.repositories.drafts,
      initialized.repositories.reviews,
    );
    const review = await service.save({
      reviewId: 'review_01',
      chapterId: 'chapter_review_01',
      draftVersionId: 'draft_review_01',
      findings: [
        {
          id: 'finding_01',
          kind: 'continuity',
          severity: 'major',
          claim: '这里需要核对邮戳时间。',
          evidence: {
            kind: 'draft',
            id: 'draft_review_01',
            version: 1,
            contentHash: hash(content),
            chapterNumber: 1,
            textRange: { start: 0, end: 2, quoteHash: hash('她看') },
          },
          suggestion: '补充邮戳与当前时间的关系。',
        },
      ],
      createdAt: timestamp,
    });
    assert.equal(review.draftHash, hash(content));
    const findings = await initialized.repositories.reviews.listFindings(review.id);
    assert.equal(findings[0].disposition, 'open');
    const accepted = await service.setDisposition('finding_01', 1, 'accept', timestamp);
    assert.equal(accepted.disposition, 'accept');
    assert.equal(accepted.revision, 2);

    await assert.rejects(
      () => service.setDisposition('finding_01', 1, 'ignore', timestamp),
      ReviewValidationError,
    );
    await assert.rejects(
      () =>
        service.save({
          reviewId: 'review_02',
          chapterId: 'chapter_review_01',
          draftVersionId: 'draft_review_01',
          findings: [
            {
              id: 'finding_02',
              kind: 'style',
              severity: 'minor',
              claim: '过期引文',
              evidence: {
                kind: 'draft',
                id: 'draft_review_01',
                version: 1,
                contentHash: hash('wrong'),
                textRange: { start: 0, end: 2, quoteHash: hash('她看') },
              },
              suggestion: '重新定位。',
            },
          ],
          createdAt: timestamp,
        }),
      ReviewValidationError,
    );
    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
