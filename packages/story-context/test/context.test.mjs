import assert from 'node:assert/strict';
import test from 'node:test';

import { buildChapterContext, getPromptTemplate } from '../dist/index.js';

const timestamp = '2026-10-23T12:00:00.000Z';
const book = {
  id: 'book_01',
  title: '雾港来信',
  language: 'zh-CN',
  genre: '悬疑',
  premise: '一封旧信改变了调查方向。',
  conventions: { viewpoint: '第三人称限知', tone: '克制' },
  bookRevision: 8,
  createdAt: timestamp,
  updatedAt: timestamp,
};

const plan = {
  id: 'plan_chapter_02',
  bookId: 'book_01',
  parentId: 'plan_arc_01',
  kind: 'chapter',
  sortKey: '0002',
  content: {
    title: '第二章：回信',
    goal: '让主角确认旧信来自近期',
    conflict: '邮戳和记忆互相矛盾',
    startState: '主角刚读完旧信',
    endState: '主角决定回到雾港',
    requiredBeats: ['发现近期邮戳'],
    avoid: ['揭示寄件人身份'],
  },
  version: 2,
  status: 'confirmed',
  createdAt: timestamp,
  updatedAt: timestamp,
};

test('builds a budgeted context with source fingerprints', () => {
  const result = buildChapterContext({
    book,
    plans: [plan],
    chapters: [
      {
        id: 'chapter_01',
        bookId: 'book_01',
        chapterNumber: 1,
        displayTitle: '第一章：旧信',
        planNodeId: 'plan_chapter_01',
        currentDraftId: 'draft_01',
        currentFinalizationId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    draftsByChapter: new Map([
      [
        'chapter_01',
        {
          id: 'draft_01',
          chapterId: 'chapter_01',
          parentId: null,
          revision: 2,
          content: '她把信翻到背面，看到一个近期的邮戳。',
          complete: true,
          sourceRunId: null,
          createdBy: 'author',
          createdAt: timestamp,
        },
      ],
    ]),
    targetPlanId: 'plan_chapter_02',
    targetChapterNumber: 2,
    role: 'writer',
    modelProfileId: 'writer_primary',
    maxInputTokens: 80,
  });

  assert.equal(result.role, 'writer');
  assert.equal(result.promptVersion, 'writer-v1');
  assert.match(result.sourceFingerprint, /^sha256:[0-9a-f]{64}$/);
  assert.match(result.executionFingerprint, /^sha256:[0-9a-f]{64}$/);
  assert.equal(result.estimatedInputTokens <= 80, true);
  assert.equal(result.sourceManifest.sources.length, 4);
  assert.match(result.contextText, /第二章：回信/);
});

test('rejects unsupported prompt versions', () => {
  assert.throws(() => getPromptTemplate('writer', 'writer-v0'));
});
