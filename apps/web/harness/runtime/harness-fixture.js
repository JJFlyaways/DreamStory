// Isolated Gate A fixture. No DreamStory API request or model call is made here.
(() => {
  const success = (value) => ({ ok: true, value });
  const replies = {
    'session/list': success({ items: [] }),
    'workspace/initializeDefault': success(undefined),
    'settings/describe': success({
      writable: true,
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
    }),
    'session/modelCatalog': success({
      default: { provider: 'deepseek-official', model: 'deepseek-v4-flash' },
      routableProviders: [],
      groups: [],
      failures: [],
    }),
    'agentPresets/list': success({ presets: [] }),
    'dynamicCordisRunner/syncInspectManifest': success(null),
    'dynamicCordisRunner/inventory': success([]),
    'credentials/describe': success({}),
    'permissionPresets/catalog': success({ options: [] }),
    'account/getProfile': success(null),
    'account/getBalance': success(null),
    'account/getUnnotifiedBonuses': success(null),
    'account/ackBonusNotified': success(true),
    'schedule/catalog': success([]),
    'schedule/list': success([]),
    'commands/list': success([]),
  };
  const frames = {
    $events: [{ type: 'ready', clientId: 'dreamstory-gate-a', host: { home: '/tmp/fixture' } }],
    'session/control': [{ type: 'baseline', value: { projections: {} } }],
    'account/watch': [
      { status: 'signed-out', attempt: null, links: { usageUrl: '', topUpUrl: '' } },
    ],
    'workspace/follow': [
      { type: 'baseline', value: { items: [], archivedSessionIds: [], pinnedSessionIds: [] } },
    ],
    'remoteAccess/follow': [{ type: 'baseline', owner: true }],
  };
  const pending = new Promise(() => {});
  const pageFetch = globalThis.fetch.bind(globalThis);
  const fixtureFetch = async (input, init) => {
    const url = new URL(String(input), globalThis.location.href);
    if (url.pathname === '/open-in-app/apps') {
      return new Response(JSON.stringify({ apps: [] }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.pathname === '/plugins/events') {
      return new Response(new ReadableStream(), {
        headers: { 'content-type': 'text/event-stream' },
      });
    }
    return pageFetch(input, init);
  };
  globalThis.fetch = fixtureFetch;
  globalThis.__DSH_TRANSPORT__ = {
    ownsHost: true,
    fetch: fixtureFetch,
    rpc: {
      async call(_channel, endpoint) {
        if (!(endpoint in replies)) throw new Error(`Harness fixture: missing ${endpoint}`);
        return structuredClone(replies[endpoint]);
      },
      async *open(_channel, endpoint) {
        if (!(endpoint in frames)) throw new Error(`Harness fixture: missing stream ${endpoint}`);
        for (const frame of frames[endpoint]) yield structuredClone(frame);
        await pending;
      },
    },
  };
})();
