import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CONTRACT_VERSION,
  parseClientRequestId,
  parseContentHash,
  parseSourceFingerprint,
  parseStableId,
  parseUtcDateTime,
} from '../dist/index.js';

test('exports the initial contract version', () => {
  assert.equal(CONTRACT_VERSION, 'v1');
});

test('parses contract scalar values', () => {
  assert.equal(parseStableId('chapter_12'), 'chapter_12');
  assert.equal(
    parseClientRequestId('c6595f8b-2583-4ccc-9569-62d273282eb9'),
    'c6595f8b-2583-4ccc-9569-62d273282eb9',
  );
  assert.equal(parseContentHash(`sha256:${'a'.repeat(64)}`), `sha256:${'a'.repeat(64)}`);
  assert.equal(parseSourceFingerprint(`sha256:${'b'.repeat(64)}`), `sha256:${'b'.repeat(64)}`);
  assert.equal(parseUtcDateTime('2026-10-19T12:34:56.000Z'), '2026-10-19T12:34:56.000Z');
});

test('rejects malformed contract scalar values', () => {
  assert.throws(() => parseStableId('../book'));
  assert.throws(() => parseClientRequestId('request_01'));
  assert.throws(() => parseContentHash('sha256:not-a-hash'));
  assert.throws(() => parseUtcDateTime('2026-10-19T12:34:56-04:00'));
});

test('preserves an SSE event through JSON serialization', () => {
  const event = {
    id: 17,
    event: 'output.snapshot',
    data: {
      runId: 'run_01',
      artifactId: 'artifact_01',
      revision: 4,
      complete: false,
    },
  };

  assert.deepEqual(JSON.parse(JSON.stringify(event)), event);
});
