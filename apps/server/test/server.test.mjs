import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
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
      schemaVersion: 3,
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

test('manages plan hierarchy, chapters, draft versions, conflicts, and restore', async () => {
  const directory = await createTestDirectory();
  const config = createConfig(directory);
  const app = createServer(config, new BookProjectManager(config.libraryRoot));
  try {
    const session = await app.inject({ method: 'GET', url: '/api/v1/session' });
    const sessionBody = session.json();
    const headers = {
      origin: config.listen.allowedOrigins[0],
      cookie: getCookie(session),
      'x-story-csrf': sessionBody.data.csrfToken,
    };
    const create = await app.inject({
      method: 'POST',
      url: '/api/v1/books',
      headers,
      payload: {
        clientRequestId: '3b4ef4a8-8a4c-4b7e-91d9-6ad5b899b20d',
        title: '规划与草稿测试',
        language: 'zh-CN',
        genre: '悬疑',
        premise: '验证 P1 写作基础。',
      },
    });
    const bookId = create.json().data.id;

    const planContent = (title) => ({
      title,
      goal: '推动故事进入下一阶段',
      conflict: '主角必须面对未知线索',
      startState: '主角还没有证据',
      endState: '主角决定继续追查',
      requiredBeats: ['发现线索'],
      avoid: ['提前揭示真相'],
    });
    const savePlan = async (planId, expectedBookRevision, parentId, kind, title) =>
      app.inject({
        method: 'PUT',
        url: `/api/v1/books/${bookId}/plans/${planId}`,
        headers,
        payload: {
          clientRequestId: randomUUID(),
          expectedBookRevision,
          parentId,
          kind,
          sortKey: `000${expectedBookRevision}`,
          content: planContent(title),
        },
      });

    const root = await savePlan('plan_book', 1, null, 'book', '测试作品');
    assert.equal(root.statusCode, 201);
    const volume = await savePlan('plan_volume', 2, 'plan_book', 'volume', '第一卷');
    assert.equal(volume.statusCode, 201);
    const arc = await savePlan('plan_arc', 3, 'plan_volume', 'arc', '第一弧');
    assert.equal(arc.statusCode, 201);
    const chapterPlan = await savePlan('plan_chapter_01', 4, 'plan_arc', 'chapter', '第一章：旧信');
    assert.equal(chapterPlan.statusCode, 201);

    const plans = await app.inject({ method: 'GET', url: `/api/v1/books/${bookId}/plans` });
    assert.equal(plans.statusCode, 200);
    assert.equal(plans.json().data.length, 4);

    const history = await app.inject({
      method: 'GET',
      url: `/api/v1/books/${bookId}/plans/plan_chapter_01/history`,
    });
    assert.equal(history.statusCode, 200);
    assert.equal(history.json().data.length, 1);

    const chapter = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/chapters`,
      headers,
      payload: {
        clientRequestId: '6fe8d6bc-6c19-4c2d-8b4a-866b23474e26',
        expectedBookRevision: 5,
        id: 'chapter_01',
        chapterNumber: 1,
        displayTitle: '第一章：旧信',
        planNodeId: 'plan_chapter_01',
      },
    });
    assert.equal(chapter.statusCode, 201);

    const firstDraft = await app.inject({
      method: 'PUT',
      url: `/api/v1/books/${bookId}/chapters/chapter_01/drafts/draft_01`,
      headers,
      payload: {
        clientRequestId: 'cbf378dd-0d26-44f9-9b1d-3f44db01af66',
        expectedDraftRevision: 0,
        content: '雨停时，信才送到她手上。',
        complete: false,
      },
    });
    assert.equal(firstDraft.statusCode, 201);
    assert.equal(firstDraft.json().data.draftRevision, 1);

    const secondDraft = await app.inject({
      method: 'PUT',
      url: `/api/v1/books/${bookId}/chapters/chapter_01/drafts/draft_02`,
      headers,
      payload: {
        clientRequestId: '8fbeb9e2-279c-44b5-8bca-5f86ac97d245',
        expectedDraftRevision: 1,
        content: '雨停时，信才送到她手上。她看见了旧邮戳。',
        complete: true,
      },
    });
    assert.equal(secondDraft.statusCode, 201);
    assert.equal(secondDraft.json().data.draftRevision, 2);

    const conflict = await app.inject({
      method: 'PUT',
      url: `/api/v1/books/${bookId}/chapters/chapter_01/drafts/draft_stale`,
      headers,
      payload: {
        clientRequestId: 'f1c22d4b-cf76-46c2-bc03-e4a4d794caf1',
        expectedDraftRevision: 1,
        content: '旧客户端的文本',
        complete: true,
      },
    });
    assert.equal(conflict.statusCode, 409);
    assert.equal(conflict.json().error.details.currentDraftRevision, 2);

    const restore = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/chapters/chapter_01/drafts/draft_01/restore`,
      headers,
      payload: {
        clientRequestId: '6a11b2f5-2f98-4c30-b4c6-6018f2fcf4a6',
        expectedDraftRevision: 2,
      },
    });
    assert.equal(restore.statusCode, 201);
    assert.equal(restore.json().data.draftRevision, 3);
    assert.equal(restore.json().data.draft.content, '雨停时，信才送到她手上。');

    const drafts = await app.inject({
      method: 'GET',
      url: `/api/v1/books/${bookId}/chapters/chapter_01/drafts`,
    });
    assert.equal(drafts.statusCode, 200);
    assert.equal(drafts.json().data.length, 3);
  } finally {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  }
});
