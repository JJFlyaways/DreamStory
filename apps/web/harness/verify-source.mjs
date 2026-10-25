/* global URL, process, console */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const manifestPath = fileURLToPath(new URL('./source-manifest.json', import.meta.url));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const sourceRoot = process.argv[2];

if (sourceRoot === undefined) {
  throw new Error('Usage: node apps/web/harness/verify-source.mjs <pinned-harness-checkout>');
}

const root = resolve(sourceRoot);
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
assert.equal(commit, manifest.commit, 'Harness checkout must match the pinned commit');

for (const path of [...manifest.entryFiles, ...Object.values(manifest.licenses)]) {
  assert.ok(existsSync(join(root, path)), `Missing source file: ${path}`);
}

const packagePaths = new Map();
for (const group of readdirSync(join(root, 'packages'), { withFileTypes: true })) {
  if (!group.isDirectory()) continue;
  for (const directory of readdirSync(join(root, 'packages', group.name), {
    withFileTypes: true,
  })) {
    if (!directory.isDirectory()) continue;
    const relative = `packages/${group.name}/${directory.name}`;
    const path = join(root, relative, 'package.json');
    if (!existsSync(path)) continue;
    const pkg = JSON.parse(readFileSync(path, 'utf8'));
    packagePaths.set(pkg.name, { path: relative, pkg });
  }
}
for (const directory of readdirSync(join(root, 'vendor'), { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const relative = `vendor/${directory.name}`;
  const path = join(root, relative, 'package.json');
  if (!existsSync(path)) continue;
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  packagePaths.set(pkg.name, { path: relative, pkg });
}

const expected = new Set([...manifest.clientPlugins, ...manifest.staticPackages]);
assert.equal(expected.size, manifest.clientPlugins.length + manifest.staticPackages.length);
for (const name of expected) {
  const found = packagePaths.get(name);
  assert.ok(found, `Missing package: ${name}`);
  assert.equal(found.pkg.license, 'MIT', `Unexpected license for ${name}`);
  if (name.startsWith('@deepseek-ai/dsh-')) {
    assert.equal(found.pkg.version, manifest.releaseVersion, `Unexpected version for ${name}`);
  }
  if (manifest.specialPaths[name] !== undefined) {
    assert.equal(found.path, manifest.specialPaths[name], `Unexpected path for ${name}`);
  }
}

const patchPaths = [
  'packages/bundle/base/cordis.patch.yml',
  'packages/bundle/web-app/cordis.patch.yml',
  ...readdirSync(join(root, 'packages/bundle/web-app/presets'))
    .filter((name) => name.endsWith('.patch.yml'))
    .map((name) => `packages/bundle/web-app/presets/${name}`),
];
const patch = patchPaths.map((path) => readFileSync(join(root, path), 'utf8')).join('\n');
const inPatch = new Set(
  [...patch.matchAll(/^\s+name: '(@deepseek-ai\/[^']+)'/gm)]
    .map((match) => match[1])
    .filter((name) => packagePaths.get(name)?.pkg.dsh?.client?.platform === 'web'),
);
assert.deepEqual([...inPatch].sort(), [...manifest.clientPlugins].sort(), 'Client graph differs');

const seed = readFileSync(join(root, 'packages/client/web/src/seed.ts'), 'utf8');
for (const name of manifest.platformModules) {
  assert.ok(seed.includes(`'${name}'`), `Missing platform singleton: ${name}`);
}

console.log(
  `Verified ${manifest.clientPlugins.length} client plugin rows, ${manifest.staticPackages.length} static packages, and source commit ${commit}`,
);
