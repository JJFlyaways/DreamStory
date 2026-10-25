/* global URL, process, console */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, 'source-manifest.json'), 'utf8'));
const sourceRoot = process.argv[2];
if (sourceRoot === undefined) {
  throw new Error('Usage: node apps/web/harness/import-built.mjs <built-pinned-harness>');
}

const root = resolve(sourceRoot);
const destination = join(here, 'runtime');
assert.ok(!existsSync(destination), 'Refusing to overwrite an existing Harness runtime');
const record = JSON.parse(
  readFileSync(join(root, '.dsh-build/client-build-environment.json'), 'utf8'),
);
assert.equal(record.environment.DSH_CLIENT_COMMIT_HASH, manifest.commit.slice(0, 7));
assert.equal(record.environment.DSH_CLIENT_VERSION, manifest.releaseVersion);

const packagePaths = new Map();
for (const group of readdirSync(join(root, 'packages'), { withFileTypes: true })) {
  if (!group.isDirectory()) continue;
  for (const directory of readdirSync(join(root, 'packages', group.name), {
    withFileTypes: true,
  })) {
    if (!directory.isDirectory()) continue;
    const path = join(root, 'packages', group.name, directory.name, 'package.json');
    if (!existsSync(path)) continue;
    const pkg = JSON.parse(readFileSync(path, 'utf8'));
    packagePaths.set(pkg.name, { path: join(root, 'packages', group.name, directory.name), pkg });
  }
}

const modulesId = '@deepseek-ai/dsh-client-modules';
const pluginNames = manifest.clientPlugins;
const entries = [];
const bodies = new Map();
for (const name of pluginNames) {
  const found = packagePaths.get(name);
  assert.ok(found, `Missing package ${name}`);
  const clientExport = found.pkg.exports?.['./client'];
  const relativeBundle =
    typeof clientExport === 'string'
      ? clientExport
      : (clientExport?.browser ?? clientExport?.default);
  assert.ok(relativeBundle, `Missing browser bundle export for ${name}`);
  const bundle = join(found.path, relativeBundle);
  const body =
    name === '@deepseek-ai/dsh-client-ui-brand-official'
      ? readFileSync(join(here, 'neutral-brand.js'), 'utf8')
      : readFileSync(bundle, 'utf8');
  const revision = createHash('sha256').update(body).digest('hex').slice(0, 16);
  const declaration = found.pkg.dsh.client;
  assert.equal(declaration.platform, 'web', `Unexpected platform for ${name}`);
  entries.push({
    id: name,
    url: `./plugins/${name}/client.js`,
    rev: revision,
    ...(declaration.inject === undefined ? {} : { inject: declaration.inject }),
    ...(declaration.external === undefined ? {} : { external: declaration.external }),
    ...(declaration.immediately === true ? { immediately: true } : {}),
  });
  bodies.set(name, body);
}

const bootstrap = entries.find((row) => row.id === modulesId);
assert.ok(bootstrap, 'Module-loader bootstrap is missing');
const application = entries.filter((row) => row.id !== modulesId);
const applicationScript = application.map((row) => bodies.get(row.id)).join('\n;\n');
const applicationRevision = createHash('sha256')
  .update(applicationScript)
  .digest('hex')
  .slice(0, 16);
const graph = {
  rev: manifest.commit.slice(0, 7),
  release: { version: manifest.releaseVersion, commit: manifest.commit.slice(0, 7) },
  entries,
  batches: [
    {
      phase: 'bootstrap',
      url: bootstrap.url,
      rev: bootstrap.rev,
      entries: [modulesId],
    },
    {
      phase: 'application',
      url: './plugins/application.js',
      rev: applicationRevision,
      entries: application.map((row) => row.id),
    },
  ],
};

const modulesUrl = pathToFileURL(join(root, 'packages/client/modules/lib/index.js')).href;
const { bootInjections } = await import(modulesUrl);
const injectionHtml = bootInjections(graph)
  .map((row) => {
    switch (row.kind) {
      case 'script':
        return `<script>${row.text}</script>`;
      case 'script-preload':
        return `<link rel="preload" as="script" href="${row.src}">`;
      case 'script-src':
        return `<script src="${row.src}"></script>`;
      case 'global':
        return `<script>globalThis[${JSON.stringify(row.name)}] = ${JSON.stringify(row.value)}</script>`;
      default:
        throw new Error(`Unexpected injection ${row.kind}`);
    }
  })
  .join('\n    ');

const originalHtml = readFileSync(join(root, 'apps/web/dist/index.html'), 'utf8');
const cleanHtml = originalHtml
  .replace(
    /^.*(?:rel="manifest"|rel="apple-touch-icon"|rel="icon"|name="apple-mobile-web-app-title").*\n/gm,
    '',
  )
  .replace('<title>DSH Local Build</title>', '<title>DreamStory</title>');
assert.ok(cleanHtml.includes('<script type="module"'), 'Shell module entry missing');
const html = cleanHtml.replace(
  '<script type="module"',
  `${injectionHtml}\n    <script src="./harness-fixture.js"></script>\n    <script type="module"`,
);

mkdirSync(destination, { recursive: true });
cpSync(join(root, 'apps/web/dist/assets'), join(destination, 'assets'), {
  recursive: true,
  filter: (path) => !path.endsWith('.map'),
});
mkdirSync(join(destination, 'plugins'), { recursive: true });
for (const row of entries) {
  const found = packagePaths.get(row.id);
  const target = join(destination, 'plugins', row.id);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, 'client.js'), bodies.get(row.id));
  const assets = join(found.path, 'lib/assets');
  // Official whale and account-onboarding illustrations are not redistributed.
  if (
    existsSync(assets) &&
    row.id !== '@deepseek-ai/dsh-client-ui-chat' &&
    row.id !== '@deepseek-ai/dsh-client-ui-settings-account'
  ) {
    cpSync(assets, join(target, 'assets'), { recursive: true });
  }
}
writeFileSync(join(destination, 'plugins/application.js'), applicationScript);
writeFileSync(join(destination, 'boot-graph.json'), JSON.stringify(graph, null, 2));
writeFileSync(join(destination, 'index.html'), html);
copyFileSync(join(root, 'LICENSE'), join(destination, 'DEEPSEEK-HARNESS-LICENSE'));
copyFileSync(join(here, 'fixture-transport.js'), join(destination, 'harness-fixture.js'));
console.log(`Imported ${entries.length} pinned client bundles into ${destination}`);
