import assert from 'node:assert/strict';
import test from 'node:test';

import { ModelProviderError, OpenAICompatibleProvider } from '../dist/index.js';

function createProvider(fetchImpl, options = {}) {
  return new OpenAICompatibleProvider({
    endpoint: 'https://model.example.test/v1',
    model: 'writer-primary',
    apiKey: 'test-key',
    fetchImpl,
    ...options,
  });
}

test('normalizes OpenAI-compatible streamed SSE text and reported usage', async () => {
  const fetchImpl = async (_input, init) => {
    assert.equal(init.headers.authorization, 'Bearer test-key');
    assert.equal(JSON.parse(init.body).stream, true);
    return new globalThis.Response(
      [
        'data: {"id":"provider-call","choices":[{"delta":{"content":"雾港"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"来信"}}]}\n\n',
        'data: {"usage":{"prompt_tokens":12,"completion_tokens":4}}\n\n',
        'data: [DONE]\n\n',
      ].join(''),
      { status: 200, headers: { 'content-type': 'text/event-stream' } },
    );
  };
  const provider = createProvider(fetchImpl);
  const chunks = [];
  for await (const chunk of provider.streamText({ input: 'write chapter' })) {
    chunks.push(chunk);
  }

  assert.deepEqual(
    chunks.map((chunk) => chunk.text),
    ['雾港', '来信'],
  );
  assert.match(chunks[0].callId, /^openai_call_/);
  assert.deepEqual(provider.capabilities, ['stream_text', 'structured_output', 'cancel', 'usage']);
});

test('normalizes structured JSON responses and unknown usage', async () => {
  const provider = createProvider(async (_input, init) => {
    const body = JSON.parse(init.body);
    assert.equal(body.response_format.type, 'json_object');
    return new globalThis.Response(
      JSON.stringify({ choices: [{ message: { content: '{"title":"第一章"}' } }] }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  });

  const result = await provider.generateStructured({
    input: 'return a chapter plan',
    schema: { type: 'object', properties: { title: { type: 'string' } } },
  });
  assert.deepEqual(result.value, { title: '第一章' });
  assert.equal(result.usage.usageKind, 'unknown');
});

test('classifies authentication, rate limit, and provider failures', async () => {
  for (const [status, code] of [
    [401, 'AUTHENTICATION'],
    [429, 'RATE_LIMITED'],
    [503, 'UNAVAILABLE'],
  ]) {
    const provider = createProvider(
      async () => new globalThis.Response('{"error":{"message":"nope"}}', { status }),
    );
    await assert.rejects(
      () => provider.generateText({ input: 'test' }),
      (error) => {
        assert.equal(error instanceof ModelProviderError, true);
        assert.equal(error.code, code);
        return true;
      },
    );
  }
});

test('normalizes a caller cancellation as a cancelled provider error', async () => {
  const provider = createProvider(
    (_input, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () =>
          reject(new globalThis.DOMException('Aborted', 'AbortError')),
        );
      }),
  );
  const controller = new globalThis.AbortController();
  const cancelled = provider.generateText({ input: 'cancel me', signal: controller.signal });
  await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
  controller.abort();
  const error = await cancelled.catch((value) => value);
  assert.equal(error instanceof ModelProviderError, true);
  assert.equal(error.code, 'CANCELLED');
});
