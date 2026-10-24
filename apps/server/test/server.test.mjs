import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

function contentHash(value) {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;
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
      schemaVersion: 11,
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

    const contextPreview = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/context/preview`,
      payload: {
        intent: 'draft_chapter',
        target: { planId: 'plan_chapter_01', chapterNumber: 1 },
        modelProfileId: 'writer_primary',
        expectedBookRevision: 5,
        maxInputTokens: 2_000,
      },
    });
    assert.equal(contextPreview.statusCode, 200);
    assert.equal(contextPreview.json().data.role, 'writer');
    assert.match(contextPreview.json().data.sourceFingerprint, /^sha256:[0-9a-f]{64}$/);
    assert.match(contextPreview.json().data.contextText, /第一章：旧信/);

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

    const reviewedContent = secondDraft.json().data.draft.content;
    const review = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/chapters/chapter_01/reviews`,
      headers,
      payload: {
        reviewId: 'review_api_01',
        draftVersionId: 'draft_02',
        findings: [
          {
            id: 'finding_api_01',
            kind: 'continuity',
            severity: 'major',
            claim: '这里需要确认邮戳时间。',
            evidence: {
              kind: 'draft',
              id: 'draft_02',
              version: 2,
              contentHash: contentHash(reviewedContent),
              chapterNumber: 1,
              textRange: { start: 0, end: 2, quoteHash: contentHash('雨停') },
            },
            suggestion: '补充时间关系。',
          },
        ],
      },
    });
    assert.equal(review.statusCode, 201);
    const findings = await app.inject({
      method: 'GET',
      url: `/api/v1/books/${bookId}/reviews/review_api_01/findings`,
    });
    assert.equal(findings.statusCode, 200);
    assert.equal(findings.json().data[0].disposition, 'open');
    const disposition = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/reviews/findings/finding_api_01/disposition`,
      headers,
      payload: { expectedFindingRevision: 1, decision: 'intentional' },
    });
    assert.equal(disposition.statusCode, 200);
    assert.equal(disposition.json().data.disposition, 'intentional');

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

test('lists books and rebuilds Markdown/TXT exports with consistent backups', async () => {
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
        clientRequestId: 'b3ef4e3c-23d6-4c4e-9ed4-5d7fba70f04c',
        title: '导出测试书',
        language: 'zh-CN',
        genre: '现实情感',
        premise: '验证导出和备份。',
        conventions: { viewpoint: '第一人称', tone: '克制' },
      },
    });
    assert.equal(create.statusCode, 201);
    const bookId = create.json().data.id;

    const settingsUpdate = await app.inject({
      method: 'PATCH',
      url: `/api/v1/books/${bookId}`,
      headers,
      payload: {
        clientRequestId: 'd74e7b8e-80f0-4c20-8f9c-b1b82f9a6d5b',
        expectedBookRevision: 1,
        conventions: { viewpoint: '第一人称', tone: '克制' },
      },
    });
    assert.equal(settingsUpdate.statusCode, 200);
    assert.deepEqual(settingsUpdate.json().data.conventions, {
      viewpoint: '第一人称',
      tone: '克制',
    });

    const shelf = await app.inject({ method: 'GET', url: '/api/v1/books' });
    assert.equal(shelf.statusCode, 200);
    assert.equal(shelf.json().data.length, 1);
    assert.equal(shelf.json().data[0].book.title, '导出测试书');
    assert.deepEqual(shelf.json().data[0].book.conventions, {
      viewpoint: '第一人称',
      tone: '克制',
    });

    const markdownExport = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/exports`,
      headers,
      payload: { format: 'markdown' },
    });
    assert.equal(markdownExport.statusCode, 201);
    assert.match(markdownExport.json().data.contentHash, /^sha256:[0-9a-f]{64}$/);
    assert.equal(markdownExport.json().data.fileName, `${bookId}.md`);

    const markdown = await app.inject({
      method: 'GET',
      url: `/api/v1/books/${bookId}/exports/markdown`,
    });
    assert.equal(markdown.statusCode, 200);
    assert.match(markdown.body, /# 导出测试书/);
    assert.match(markdown.body, /第一人称/);

    const textExport = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/exports`,
      headers,
      payload: { format: 'txt' },
    });
    assert.equal(textExport.statusCode, 201);
    assert.equal(textExport.json().data.fileName, `${bookId}.txt`);

    const backup = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/backups`,
      headers,
    });
    assert.equal(backup.statusCode, 201);
    assert.match(backup.json().data.relativePath, /^backups\/story\.\d+T\d+Z\.sqlite$/);
    assert.equal(backup.json().data.relativePath.includes(directory), false);
    assert.equal(backup.json().data.sizeBytes > 0, true);
  } finally {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('starts a fake-model run and persists author-review artifacts', async () => {
  const directory = await createTestDirectory();
  const config = parseServerConfig({
    env: {
      DREAMSTORY_LIBRARY_ROOT: directory,
      DREAMSTORY_ALLOWED_ORIGINS: 'http://127.0.0.1:3000',
      DREAMSTORY_MODEL_PROFILES: JSON.stringify([
        {
          id: 'fake_writer',
          protocol: 'fake',
          endpoint: 'http://127.0.0.1:9999',
          model: 'fake-writer',
          capabilities: ['stream_text', 'structured_output'],
          purposes: ['writing'],
        },
      ]),
    },
    platform: 'linux',
    homeDirectory: directory,
    workingDirectory: directory,
  });
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
        clientRequestId: 'd6c53a6b-e3af-42b1-898a-7a9d5d6a4229',
        title: '运行测试书',
        language: 'zh-CN',
        genre: '悬疑',
        premise: '验证 Agent 运行持久化。',
      },
    });
    const bookId = create.json().data.id;
    const plan = await app.inject({
      method: 'PUT',
      url: `/api/v1/books/${bookId}/plans/plan_book`,
      headers,
      payload: {
        clientRequestId: 'a3e779dd-65c7-4ab0-b53b-80e5dc0b87d5',
        expectedBookRevision: 1,
        parentId: null,
        kind: 'book',
        sortKey: '0001',
        content: {
          title: '运行测试书',
          goal: '生成一个可审阅候选',
          conflict: '测试模型需要遵守边界',
          startState: '尚未生成',
          endState: '候选已保存',
          requiredBeats: ['输出正文'],
          avoid: ['越界写下一章'],
        },
      },
    });
    assert.equal(plan.statusCode, 201);

    const started = await app.inject({
      method: 'POST',
      url: `/api/v1/books/${bookId}/runs`,
      headers,
      payload: {
        intent: 'draft_chapter',
        expectedBookRevision: 2,
        target: { planId: 'plan_book' },
        modelProfileId: 'fake_writer',
        scope: { chapterNumbers: [1] },
      },
    });
    assert.equal(started.statusCode, 202);
    const runId = started.json().data.id;
    let run;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/books/${bookId}/runs/${runId}`,
      });
      run = response.json().data;
      if (run.status === 'awaiting_author' || run.status === 'failed') break;
      await new Promise((resolve) => globalThis.setTimeout(resolve, 5));
    }
    assert.equal(run.status, 'awaiting_author');
    const artifacts = await app.inject({
      method: 'GET',
      url: `/api/v1/books/${bookId}/runs/${runId}/artifacts`,
    });
    assert.equal(artifacts.statusCode, 200);
    assert.equal(artifacts.json().data.at(-1).complete, true);
  } finally {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  }
});
