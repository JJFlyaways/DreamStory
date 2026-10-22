import assert from 'node:assert/strict';
import test from 'node:test';

import { renderBookExport } from '../dist/index.js';

const book = {
  id: 'book_01',
  title: '雾港来信',
  language: 'zh-CN',
  genre: '悬疑',
  premise: '一封旧信改变了主角的调查方向。',
  conventions: { viewpoint: '第三人称限知' },
  bookRevision: 4,
  createdAt: '2026-10-22T12:00:00.000Z',
  updatedAt: '2026-10-22T12:00:00.000Z',
};

const plans = [
  {
    id: 'plan_book',
    bookId: 'book_01',
    parentId: null,
    kind: 'book',
    sortKey: '0001',
    content: {
      title: '雾港来信',
      goal: '确认旧信的来源',
      conflict: '主角不相信寄件人仍然活着',
      startState: '主角没有线索',
      endState: '主角决定追查邮戳',
      requiredBeats: ['收到旧信'],
      avoid: [],
    },
    version: 1,
    status: 'confirmed',
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  },
];

const chapters = [
  {
    id: 'chapter_01',
    bookId: 'book_01',
    chapterNumber: 1,
    displayTitle: '第一章：旧信',
    planNodeId: 'plan_book',
    currentDraftId: 'draft_01',
    currentFinalizationId: null,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  },
];

test('renders authoritative book data as markdown and text', () => {
  const draftsByChapter = new Map([
    [
      'chapter_01',
      {
        id: 'draft_01',
        chapterId: 'chapter_01',
        parentId: null,
        revision: 1,
        content: '雨停时，信才送到她手上。',
        complete: true,
        sourceRunId: null,
        createdBy: 'author',
        createdAt: book.createdAt,
      },
    ],
  ]);
  const input = { book, plans, chapters, draftsByChapter };

  const markdown = renderBookExport(input, 'markdown');
  assert.match(markdown, /# 雾港来信/);
  assert.match(markdown, /第三人称限知/);
  assert.match(markdown, /雨停时，信才送到她手上/);

  const text = renderBookExport(input, 'txt');
  assert.match(text, /【正文】/);
  assert.match(text, /第一章：旧信/);
});
