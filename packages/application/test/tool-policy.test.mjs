import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertToolAllowed,
  isAuthoritativeTool,
  listModelTools,
  ToolPolicyError,
} from '../dist/index.js';

const context = {
  runId: 'run_01',
  bookId: 'book_01',
  authorizedChapterNumbers: [3],
};

test('allows read and candidate tools only within the current run scope', () => {
  assert.equal(
    assertToolAllowed(context, {
      tool: 'read_plan',
      runId: 'run_01',
      bookId: 'book_01',
      chapterNumber: 3,
    }),
    'read',
  );
  assert.equal(
    assertToolAllowed(context, {
      tool: 'append_draft_candidate',
      runId: 'run_01',
      bookId: 'book_01',
      chapterNumber: 3,
    }),
    'candidate',
  );
  assert.throws(
    () =>
      assertToolAllowed(context, {
        tool: 'append_draft_candidate',
        runId: 'run_01',
        bookId: 'book_01',
        chapterNumber: 4,
      }),
    ToolPolicyError,
  );
  assert.throws(
    () =>
      assertToolAllowed(context, {
        tool: 'read_plan',
        runId: 'run_02',
        bookId: 'book_01',
      }),
    ToolPolicyError,
  );
});

test('keeps authoritative commands out of the model tool registry', () => {
  assert.equal(isAuthoritativeTool('finalize_chapter'), true);
  assert.equal(isAuthoritativeTool('read_plan'), false);
  assert.equal(listModelTools().includes('finalize_chapter'), false);
});
