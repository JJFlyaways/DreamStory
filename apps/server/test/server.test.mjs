import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { BookProjectManager, createServer, parseServerConfig } from '../dist/index.js';

async function createTestDirectory() {
  return mkdtemp(join(tmpdir(), 'dreamstory-server-'));
}

function createConfig(libraryRoot) {
  return parseServerConfig({
    env: {
      DREAMSTORY_LIBRARY_ROOT: libraryRoot,
      DREAMSTORY_ALLOWED_ORIGINS: 'http://127.0.0.1:3000',
    },
    platform: 'linux',
    homeDirectory: libraryRoot,
    workingDirectory: libraryRoot,
  });
}

function getCookie(response) {
  const header = response.headers['set-cookie'];
  const value = Array.isArray(header) ? header[0] : header;
  assert.ok(value);
  return value.split(';', 1)[0];
}

test('starts on loopback and exposes health information', async () => {
  const directory = await createTestDirectory();
  const config = createConfig(directory);
  const app = createServer(config);
  try {
    const address = await app.listen({ host: '127.0.0.1', port: 0 });
    assert.match(address, /^http:\/\/127\.0\.0\.1:/);
    const response = await globalThis.fetch(`${address}/api/v1/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      data: {
        status: 'ok',
        contractVersion: 'v1',
        database: {
          available: false,
          status: 'not_selected',
          schemaVersion: null,
        },
      },
    });
  } finally {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('creates, reopens, idempotently retries, and protects book revisions', async () => {
  const directory = await createTestDirectory();
  const config = createConfig(directory);
  const firstApp = createServer(config, new BookProjectManager(config.libraryRoot));
  const origin = config.listen.allowedOrigins[0];
  try {
    const session = await firstApp.inject({ method: 'GET', url: '/api/v1/session' });
    const sessionBody = session.json();
    const cookie = getCookie(session);
    const headers = {
      origin,
      cookie,
      'x-story-csrf': sessionBody.data.csrfToken,
    };
    const createPayload = {
      clientRequestId: 'c6595f8b-2583-4ccc-9569-62d273282eb9',
      title: '雾港来信',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证 P0 作品生命周期。',
    };

    const created = await firstApp.inject({
      method: 'POST',
      url: '/api/v1/books',
      headers,
      payload: createPayload,
    });
    assert.equal(created.statusCode, 201);
    assert.equal(created.json().data.bookRevision, 1);
    const bookId = created.json().data.id;

    const replay = await firstApp.inject({
      method: 'POST',
      url: '/api/v1/books',
      headers,
      payload: { ...createPayload, title: '不应覆盖' },
    });
    assert.equal(replay.statusCode, 200);
    assert.equal(replay.json().data.title, '雾港来信');

    const health = await firstApp.inject({
      method: 'GET',
      url: `/api/v1/health?bookId=${bookId}`,
    });
    assert.equal(health.statusCode, 200);
    assert.deepEqual(health.json().data.database, {
      available: true,
      status: 'ready',
      schemaVersion: 2,
    });

    const updates = await Promise.all([
      firstApp.inject({
        method: 'PATCH',
        url: `/api/v1/books/${bookId}`,
        headers,
        payload: {
          clientRequestId: 'a4a0f5f8-7a7d-4dc7-ae84-b9c96d0f55c1',
          expectedBookRevision: 1,
          title: '并发更新 A',
        },
      }),
      firstApp.inject({
        method: 'PATCH',
        url: `/api/v1/books/${bookId}`,
        headers,
        payload: {
          clientRequestId: '18b8654e-c799-4bf1-9999-838e356e79f1',
          expectedBookRevision: 1,
          title: '并发更新 B',
        },
      }),
    ]);
    assert.equal(updates.filter((response) => response.statusCode === 200).length, 1);
    assert.equal(updates.filter((response) => response.statusCode === 409).length, 1);
    assert.equal(
      updates.find((response) => response.statusCode === 409).json().error.code,
      'REVISION_CONFLICT',
    );
  } finally {
    await firstApp.close();
  }

  const secondApp = createServer(config, new BookProjectManager(config.libraryRoot));
  try {
    const bookId = 'book_c6595f8b-2583-4ccc-9569-62d273282eb9';
    const reopened = await secondApp.inject({
      method: 'GET',
      url: `/api/v1/books/${bookId}`,
    });
    assert.equal(reopened.statusCode, 200);
    assert.equal(reopened.json().data.bookRevision, 2);
  } finally {
    await secondApp.close();
    await rm(directory, { recursive: true, force: true });
  }
});
