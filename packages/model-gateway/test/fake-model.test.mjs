import assert from 'node:assert/strict';
import test from 'node:test';

import { FakeModelError, FakeModelProvider } from '../dist/index.js';

test('emits configured fixed chunks and records a completed call', async () => {
  const provider = new FakeModelProvider({ chunks: ['雾', '港', '来信'] });
  const chunks = [];

  for await (const chunk of provider.streamText({ input: 'write chapter one' })) {
    chunks.push(chunk);
  }

  assert.deepEqual(
    chunks.map((chunk) => chunk.text),
    ['雾', '港', '来信'],
  );
  const call = provider.getCall(chunks[0].callId);
  assert.equal(call.status, 'completed');
  assert.equal(call.chunksEmitted, 3);
  assert.equal(call.text, '雾港来信');
});

test('splits a response into deterministic Unicode chunks and collects text', async () => {
  const provider = new FakeModelProvider({ responseText: '春风入梦', chunkSize: 2 });
  const result = await provider.generateText({ input: 'continue' });

  assert.equal(result.text, '春风入梦');
  assert.equal(result.usage.usageKind, 'estimated');
  assert.equal(provider.getCall(result.callId).status, 'completed');
});

test('fails after the configured number of chunks', async () => {
  const provider = new FakeModelProvider({
    chunks: ['one', 'two', 'three'],
    failAfterChunks: 2,
    failureMessage: 'planned failure',
  });
  const iterator = provider.streamText({ input: 'fail' });
  const first = await iterator.next();
  const second = await iterator.next();

  assert.equal(first.value.text, 'one');
  assert.equal(second.value.text, 'two');
  await assert.rejects(
    () => iterator.next(),
    (error) => {
      assert.equal(error instanceof FakeModelError, true);
      assert.equal(error.code, 'MODEL_FAILURE');
      assert.equal(error.message, 'planned failure');
      return true;
    },
  );
  assert.equal(provider.getCall(first.value.callId).status, 'failed');
});

test('cancels an active stream and records partial output', async () => {
  const provider = new FakeModelProvider({ chunks: ['first', 'second'], delayMs: 1 });
  const iterator = provider.streamText({ input: 'cancel' });
  const first = await iterator.next();

  assert.equal(provider.cancel(first.value.callId), true);
  await assert.rejects(
    () => iterator.next(),
    (error) => {
      assert.equal(error instanceof FakeModelError, true);
      assert.equal(error.code, 'CANCELLED');
      return true;
    },
  );
  const call = provider.getCall(first.value.callId);
  assert.equal(call.status, 'cancelled');
  assert.equal(call.text, 'first');
});
