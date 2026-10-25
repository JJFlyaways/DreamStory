/* global URL, Response, ReadableStream, structuredClone, console, TextEncoder, TextDecoderStream */

// P3.6-4: translate DreamStory's persisted read model into Harness read surfaces.
// This adapter owns no visible components and exposes no authoring command.
(() => {
  const success = (value) => ({ ok: true, value });
  const readonlyFailure = (endpoint) => ({
    ok: false,
    error: {
      code: 'dreamstory/readonly-adapter',
      message: `${endpoint} is read-only until P3.6-5 author commands are connected`,
      details: {},
    },
  });
  const apiBase = String(globalThis.__DREAMSTORY_API_BASE__ ?? '/api/v1').replace(/\/$/u, '');
  const nativeFetch = globalThis.fetch.bind(globalThis);
  const pending = new Promise(() => {});
  const catalog = {
    loaded: false,
    loading: undefined,
    books: [],
    workspaces: [],
    sessions: [],
    projections: new Map(),
    snapshots: new Map(),
    queues: new Map(),
    activeRuns: new Map(),
  };
  let csrfToken;

  async function getJson(path) {
    const response = await nativeFetch(`${apiBase}${path}`, { credentials: 'include' });
    if (!response.ok)
      throw new Error(`DreamStory read ${path} returned HTTP ${String(response.status)}`);
    const payload = await response.json();
    return payload.data;
  }

  async function writeJson(path, body) {
    if (csrfToken === undefined) {
      const sessionResponse = await nativeFetch(`${apiBase}/session`, { credentials: 'include' });
      const sessionPayload = await sessionResponse.json();
      csrfToken = sessionPayload.data.csrfToken;
    }
    const response = await nativeFetch(`${apiBase}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-story-csrf': csrfToken },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? `DreamStory write ${path} failed`);
    return payload.data;
  }

  function firstArgument(payload) {
    const args = payload?.args;
    if (Array.isArray(args)) return args[0] ?? {};
    if (args !== null && typeof args === 'object') return args;
    return {};
  }

  function requestOf(payload) {
    const value = firstArgument(payload);
    return value?.request !== null && typeof value?.request === 'object' ? value.request : value;
  }

  function sessionIdOf(payload) {
    const request = requestOf(payload);
    if (typeof request?.sessionId === 'string') return request.sessionId;
    if (request?.address?.kind === 'session' && typeof request.address.sessionId === 'string') {
      return request.address.sessionId;
    }
    if (typeof request?.address?.childSessionId === 'string') return request.address.childSessionId;
    return undefined;
  }

  function bookForSession(sessionId) {
    return catalog.books.find((item) => item.sessionId === sessionId);
  }

  function queueForSession(sessionId) {
    let queue = catalog.queues.get(sessionId);
    if (queue === undefined) {
      queue = { items: [], waiters: [] };
      catalog.queues.set(sessionId, queue);
    }
    return queue;
  }

  function pushSessionEvent(sessionId, record) {
    const item = bookForSession(sessionId);
    if (item !== undefined) {
      item.records.push(record);
      item.snapshot.records = item.records;
      item.snapshot.cursor = record.event.seq;
    }
    const queue = queueForSession(sessionId);
    const waiter = queue.waiters.shift();
    if (waiter === undefined) queue.items.push(record);
    else waiter(record);
  }

  function nextSessionEvent(sessionId) {
    const queue = queueForSession(sessionId);
    const item = queue.items.shift();
    if (item !== undefined) return Promise.resolve(item);
    return new Promise((resolve) => {
      queue.waiters.push(resolve);
    });
  }

  function stringId(prefix, value) {
    return `${prefix}-${String(value).replace(/[^a-zA-Z0-9_-]/gu, '-')}`;
  }

  function emptyProjection(book, chapters, records) {
    return {
      kind: 'sequenced',
      asOfSeq: records.at(-1)?.event?.seq ?? -1,
      values: {
        modelSelection: { lastUsed: null, next: null },
        title: book.title,
        todos: chapters.map((chapter) => ({
          content: `第${String(chapter.chapterNumber)}章 ${chapter.displayTitle}`,
          status: chapter.currentFinalizationId === null ? 'pending' : 'completed',
        })),
        permissions: {
          options: [
            {
              value: 'workspace-write',
              name: 'workspace-write',
              description: 'Write through DreamStory author commands within the current book.',
            },
          ],
          currentValue: 'workspace-write',
        },
        plan: { active: false, pending: false },
        goal: null,
        tokenUsage: {
          uncachedInputTokens: 0,
          outputTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        },
        contextPressure: {},
        contextBreakdown: { systemTokens: 0, toolsTokens: 0, messageTokens: 0 },
        sessionStats: {
          turns: records.filter((record) => record.event.type === 'turn/start').length,
          steps: records.filter((record) => record.event.type === 'step/start').length,
          llmMs: 0,
          toolMs: 0,
          ttftMs: 0,
          ttftSteps: 0,
          decodeMs: 0,
          decodeTokens: 0,
        },
        imageLimits: {
          maxImageBytes: 5242880,
          maxImagesPerMessage: 20,
          maxMessageImageBytes: 104857600,
          maxImagePixels: 40000000,
          maxImageDimension: 2000,
          mediaTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        },
      },
    };
  }

  function event(seq, type, data, time, surfaceOp) {
    return {
      type: 'event',
      event: {
        seq,
        time,
        type,
        data,
        ...(surfaceOp === undefined ? {} : { surfaceOp }),
      },
    };
  }

  async function readBook(entry) {
    const book = entry.book;
    if (book === null || entry.status !== 'ready') return undefined;
    const [plans, chapters] = await Promise.all([
      getJson(`/books/${encodeURIComponent(entry.bookId)}/plans`),
      getJson(`/books/${encodeURIComponent(entry.bookId)}/chapters`),
    ]);
    const planById = new Map(plans.map((plan) => [plan.id, plan]));
    const records = [];
    let seq = 0;
    for (const chapter of chapters) {
      const plan = planById.get(chapter.planNodeId);
      const planText = plan?.content?.goal === undefined ? '' : `\n目标：${plan.content.goal}`;
      const time = Date.parse(chapter.updatedAt) || Date.now();
      records.push(event(seq++, 'turn/start', { turn: seq }, time));
      records.push(
        event(
          seq++,
          'user/message',
          {
            content: [
              {
                type: 'text',
                text: `第${String(chapter.chapterNumber)}章：${chapter.displayTitle}${planText}`,
              },
            ],
            source: { kind: 'user' },
            role: 'user',
            id: stringId('chapter-user', chapter.id),
          },
          time,
          'append',
        ),
      );
      records.push(
        event(
          seq++,
          'assistant/message',
          {
            turn: seq,
            step: 0,
            message: {
              role: 'assistant',
              content: [
                {
                  type: 'text',
                  text:
                    chapter.currentFinalizationId === null
                      ? '本章尚未定稿。正文草稿将在 DreamStory 编辑器中接入。'
                      : '本章已定稿。正文阅读与版本对照将在 DreamStory 编辑器中接入。',
                },
              ],
              source: { kind: 'model', provider: 'dreamstory', model: 'readonly-adapter' },
              id: stringId('chapter-assistant', chapter.id),
            },
          },
          time,
          'append',
        ),
      );
      records.push(
        event(seq++, 'turn/end', { turn: seq - 1, reason: { kind: 'completed' } }, time),
      );
    }
    const sessionId = stringId('dreamstory-session', book.id);
    const workspaceId = stringId('dreamstory-workspace', book.id);
    const projection = emptyProjection(book, chapters, records);
    const summary = {
      sessionId,
      updatedAt: Date.parse(book.updatedAt) || Date.now(),
      running: false,
      blank: chapters.length === 0,
      cwd: `/dreamstory/${book.id}`,
      projections: projection,
    };
    return {
      book,
      chapters,
      sessionId,
      workspace: {
        workspaceId,
        path: `/dreamstory/${book.id}`,
        title: book.title,
        sessionIds: [sessionId],
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      },
      summary,
      projection,
      records,
      snapshot: {
        type: 'snapshot',
        header: {
          version: 3,
          id: sessionId,
          createdAt: summary.updatedAt,
          cwd: summary.cwd,
          isSeeded: true,
        },
        cursor: records.at(-1)?.event?.seq ?? -1,
        records,
        hasMore: false,
        projections: projection,
        assistantStream: { revision: 0 },
      },
    };
  }

  async function loadCatalog() {
    if (catalog.loaded) return;
    if (catalog.loading !== undefined) return catalog.loading;
    catalog.loading = (async () => {
      try {
        const entries = await getJson('/books');
        const books = (await Promise.all(entries.map(readBook))).filter(Boolean);
        catalog.books = books;
        catalog.workspaces = books.map((item) => item.workspace);
        catalog.sessions = books.map((item) => item.summary);
        for (const item of books) {
          catalog.projections.set(item.sessionId, item.projection);
          catalog.snapshots.set(item.sessionId, item.snapshot);
        }
      } catch (error) {
        console.warn('DreamStory read-only adapter could not load the book shelf:', error);
        catalog.books = [];
        catalog.workspaces = [];
        catalog.sessions = [];
      } finally {
        catalog.loaded = true;
      }
    })();
    await catalog.loading;
  }

  function newRequestId() {
    return globalThis.crypto?.randomUUID?.() ?? `dreamstory-${String(Date.now())}`;
  }

  function textContent(content) {
    return content
      .filter((part) => part?.type === 'text')
      .map((part) => part.text)
      .join('\n')
      .trim();
  }

  function appendPromptEvents(item, text, assistantText) {
    const time = Date.now();
    let seq = item.records.at(-1)?.event?.seq ?? -1;
    const turn = item.records.filter((record) => record.event.type === 'turn/start').length;
    pushSessionEvent(item.sessionId, event(++seq, 'turn/start', { turn }, time));
    pushSessionEvent(
      item.sessionId,
      event(
        ++seq,
        'user/message',
        {
          content: [{ type: 'text', text }],
          source: { kind: 'user' },
          role: 'user',
          id: stringId('prompt-user', `${item.sessionId}-${String(seq)}`),
        },
        time,
        'append',
      ),
    );
    if (assistantText !== undefined) {
      pushSessionEvent(
        item.sessionId,
        event(
          ++seq,
          'assistant/message',
          {
            turn,
            step: 0,
            message: {
              role: 'assistant',
              content: [{ type: 'text', text: assistantText }],
              source: { kind: 'model', provider: 'dreamstory', model: 'adapter' },
              id: stringId('prompt-assistant', `${item.sessionId}-${String(seq)}`),
            },
          },
          time,
          'append',
        ),
      );
    }
    pushSessionEvent(
      item.sessionId,
      event(
        seq + 1,
        'turn/end',
        {
          turn,
          reason: { kind: 'completed' },
        },
        time,
      ),
    );
  }

  function commandOf(text) {
    const match = /^\/(plan|write|review|revise|context|finalize|export)\b(?:\s+(.*))?$/iu.exec(
      text,
    );
    return match === null
      ? undefined
      : { name: match[1].toLowerCase(), argument: match[2]?.trim() ?? '' };
  }

  async function modelProfile() {
    const profiles = await getJson('/model-profiles');
    return profiles.find((profile) => profile.credentialStatus !== 'missing') ?? profiles[0];
  }

  async function currentDraft(item) {
    const chapter = item.chapters[0];
    if (chapter?.currentDraftId === null || chapter?.currentDraftId === undefined) return undefined;
    return getJson(
      `/books/${encodeURIComponent(item.book.id)}/chapters/${encodeURIComponent(chapter.id)}/drafts/${encodeURIComponent(chapter.currentDraftId)}`,
    );
  }

  async function contentHash(value) {
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(value),
    );
    return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  }

  async function streamRun(item, runId, intent) {
    try {
      const response = await nativeFetch(
        `${apiBase}/books/${encodeURIComponent(item.book.id)}/runs/${encodeURIComponent(runId)}/events`,
        { credentials: 'include' },
      );
      if (!response.ok || response.body === null)
        throw new Error(`run event stream returned HTTP ${String(response.status)}`);
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let output = '';
      const consume = (chunk) => {
        buffer += chunk;
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';
        for (const frame of frames) {
          const eventName = /^event: ?([^\n]+)/mu.exec(frame)?.[1] ?? '';
          const data = /^data: ?([^\n]+)/mu.exec(frame)?.[1];
          if (data === undefined) continue;
          let payload;
          try {
            payload = JSON.parse(data);
          } catch {
            continue;
          }
          if (eventName === 'output.delta' && typeof payload.text === 'string')
            output += payload.text;
          if (eventName === 'run.failed') output += `\n运行失败：${payload.message ?? '未知错误'}`;
        }
      };
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        consume(next.value);
      }
      appendPromptEvents(
        item,
        `/${intent}`,
        output || '运行已结束，候选产物可在 DreamStory 业务面板中查看。',
      );
    } catch (error) {
      appendPromptEvents(
        item,
        `/${intent}`,
        `运行事件读取失败：${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      catalog.activeRuns.delete(item.sessionId);
    }
  }

  async function startRunForPrompt(item, intent, text) {
    const chapter = item.chapters[0];
    const profile = await modelProfile();
    if (chapter === undefined) throw new Error('当前作品还没有章节计划。');
    if (profile === undefined) throw new Error('DreamStory 尚未配置可用模型档案。');
    const run = await writeJson(`/books/${encodeURIComponent(item.book.id)}/runs`, {
      clientRequestId: newRequestId(),
      expectedBookRevision: item.book.bookRevision,
      intent,
      target: { planId: chapter.planNodeId, chapterNumber: chapter.chapterNumber },
      scope: { chapterNumbers: [chapter.chapterNumber] },
      modelProfileId: profile.id,
    });
    appendPromptEvents(item, text, `已启动 ${intent} 运行：${run.id}`);
    catalog.activeRuns.set(item.sessionId, run.id);
    void streamRun(item, run.id, intent);
    return success({ accepted: true });
  }

  async function exportForPrompt(item, text) {
    const result = await writeJson(`/books/${encodeURIComponent(item.book.id)}/exports`, {
      format: 'markdown',
    });
    appendPromptEvents(item, text, `导出任务已完成：${result.fileName}`);
    return success({ accepted: true });
  }

  async function finalizeForPrompt(item, text) {
    const chapter = item.chapters[0];
    const draft = await currentDraft(item);
    if (chapter === undefined || draft === undefined)
      throw new Error('当前作品没有可定稿的完整草稿。');
    const result = await writeJson(
      `/books/${encodeURIComponent(item.book.id)}/chapters/${encodeURIComponent(chapter.id)}/finalizations`,
      {
        clientRequestId: newRequestId(),
        expectedBookRevision: item.book.bookRevision,
        expectedDraftRevision: draft.revision,
        draftVersionId: draft.id,
        contentHash: await contentHash(draft.content),
      },
    );
    appendPromptEvents(item, text, `定稿已提交：${result.finalization?.id ?? '已保存'}`);
    return success({ accepted: true });
  }

  async function contextForPrompt(item, text) {
    const chapter = item.chapters[0];
    const profile = await modelProfile();
    if (chapter === undefined || profile === undefined)
      throw new Error('上下文预览缺少章节或模型档案。');
    const preview = await writeJson(`/books/${encodeURIComponent(item.book.id)}/context/preview`, {
      expectedBookRevision: item.book.bookRevision,
      intent: 'draft_chapter',
      target: { planId: chapter.planNodeId, chapterNumber: chapter.chapterNumber },
      modelProfileId: profile.id,
      maxInputTokens: 12000,
    });
    appendPromptEvents(
      item,
      text,
      `上下文已检查：${preview.sourceManifest?.sourceCount ?? preview.sourceManifest?.length ?? 0} 个来源。`,
    );
    return success({ accepted: true });
  }

  async function promptForSession(payload) {
    await loadCatalog();
    const sessionId = sessionIdOf(payload);
    const item = bookForSession(sessionId);
    const request = requestOf(payload);
    const text = textContent(request?.content ?? []);
    if (item === undefined || text.length === 0) return readonlyFailure('session/prompt');
    const command = commandOf(text);
    if (command === undefined) return readonlyFailure('session/prompt');
    if (command.name === 'export') return exportForPrompt(item, text);
    if (command.name === 'finalize') return finalizeForPrompt(item, text);
    if (command.name === 'context') return contextForPrompt(item, text);
    const intent = {
      plan: 'plan_chapter',
      write: 'draft_chapter',
      review: 'review_chapter',
      revise: 'revise_chapter',
    }[command.name];
    if (intent === undefined) return readonlyFailure('session/prompt');
    return startRunForPrompt(item, intent, text);
  }

  function stream(value) {
    return (async function* () {
      yield structuredClone(value);
      await pending;
    })();
  }

  async function call(endpoint, payload) {
    await loadCatalog();
    switch (endpoint) {
      case 'session/list':
        return success({ items: structuredClone(catalog.sessions) });
      case 'workspace/initializeDefault':
        return success(undefined);
      case 'session/projections': {
        const id = sessionIdOf(payload);
        return success(structuredClone(catalog.projections.get(id) ?? null));
      }
      case 'session/prompt':
        return promptForSession(payload);
      case 'session/cancel': {
        const id = sessionIdOf(payload);
        const runId = catalog.activeRuns.get(id);
        if (runId === undefined) return success({ cancelled: false });
        const item = bookForSession(id);
        if (item === undefined) return readonlyFailure('session/cancel');
        await writeJson(
          `/books/${encodeURIComponent(item.book.id)}/runs/${encodeURIComponent(runId)}/cancel`,
          {},
        );
        catalog.activeRuns.delete(id);
        return success({ cancelled: true });
      }
      case 'settings/describe':
        return success({
          writable: false,
          hasDocument: false,
          namespaces: [
            {
              ns: 'ui-settings-general',
              schema: {},
              value: { welcomeNoticeVersion: '2026-09-28.1' },
              base: {},
              user: {},
              autoGenerate: true,
              applies: 'live',
              secrets: [],
              revision: 0,
            },
          ],
        });
      case 'session/modelCatalog':
        return success({
          default: { provider: 'dreamstory-readonly', model: 'read-only' },
          routableProviders: [],
          groups: [],
          failures: [],
        });
      case 'agentPresets/list':
        return success({ presets: [] });
      case 'dynamicCordisRunner/syncInspectManifest':
      case 'dynamicCordisRunner/inventory':
        return success(endpoint.endsWith('inventory') ? [] : null);
      case 'credentials/describe':
        return success({});
      case 'permissionPresets/catalog':
      case 'account/getProfile':
      case 'account/getBalance':
      case 'account/getUnnotifiedBonuses':
        return success(endpoint === 'permissionPresets/catalog' ? { options: [] } : null);
      case 'account/ackBonusNotified':
      case 'schedule/catalog':
      case 'schedule/list':
      case 'skills/list':
      case 'commands/list':
        return success(
          endpoint === 'account/ackBonusNotified'
            ? true
            : endpoint === 'skills/list'
              ? { skills: [] }
              : [],
        );
      case 'session/create':
      case 'workspace/create':
      case 'commands/execute':
        return readonlyFailure(endpoint);
      default:
        return readonlyFailure(endpoint);
    }
  }

  async function* open(endpoint, payload) {
    await loadCatalog();
    if (endpoint === '$events') {
      yield* stream({
        type: 'ready',
        clientId: 'dreamstory-readonly',
        host: { home: '/dreamstory' },
      });
      return;
    }
    if (endpoint === 'workspace/follow') {
      yield* stream({
        type: 'baseline',
        value: {
          items: structuredClone(catalog.workspaces),
          archivedSessionIds: [],
          pinnedSessionIds: [],
        },
      });
      return;
    }
    if (endpoint === 'session/control') {
      const projections = Object.fromEntries(
        catalog.sessions.map((session) => [
          session.sessionId,
          catalog.projections.get(session.sessionId),
        ]),
      );
      yield* stream({ type: 'baseline', value: { projections } });
      return;
    }
    if (endpoint === 'session/follow') {
      const id = sessionIdOf(payload);
      yield structuredClone(
        catalog.snapshots.get(id) ?? {
          type: 'snapshot',
          header: { version: 3, id, createdAt: Date.now(), cwd: '', isSeeded: true },
          cursor: -1,
          records: [],
          hasMore: false,
          projections: {},
          assistantStream: { revision: 0 },
        },
      );
      for (;;) yield structuredClone(await nextSessionEvent(id));
    }
    if (endpoint === 'account/watch') {
      yield* stream({ status: 'signed-out', attempt: null, links: { usageUrl: '', topUpUrl: '' } });
      return;
    }
    if (endpoint === 'remoteAccess/follow') {
      yield* stream({ type: 'baseline', owner: true });
      return;
    }
    yield* stream({ type: 'baseline', value: {} });
  }

  const pageFetch = globalThis.fetch.bind(globalThis);
  const transportFetch = async (input, init) => {
    const url = new URL(String(input), globalThis.location.href);
    if (url.pathname === '/open-in-app/apps') {
      return new Response(JSON.stringify({ apps: [] }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.pathname === '/plugins/events')
      return new Response(new ReadableStream(), {
        headers: { 'content-type': 'text/event-stream' },
      });
    return pageFetch(input, init);
  };
  globalThis.fetch = transportFetch;
  globalThis.__DSH_TRANSPORT__ = {
    ownsHost: true,
    fetch: transportFetch,
    rpc: {
      call: (channel, endpoint, payload) => call(endpoint, payload),
      open: (channel, endpoint, payload) => open(endpoint, payload),
    },
  };
})();
