/* global URL, console, process */

import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const runtime = join(here, 'runtime');
const output = fileURLToPath(new URL('../dist/', import.meta.url));
const mode = process.env.DREAMSTORY_WEB_MODE ?? 'business';
const transportName = mode === 'gate-a' ? 'fixture-transport.js' : 'dreamstory-readonly-adapter.js';
if (mode !== 'gate-a' && mode !== 'business') {
  throw new Error(`Unknown DREAMSTORY_WEB_MODE: ${mode}`);
}
if (!existsSync(join(runtime, 'index.html'))) {
  throw new Error('Pinned Harness runtime is missing; run the pinned import before building');
}
if (!existsSync(join(runtime, 'boot-graph.json'))) {
  throw new Error('Pinned Harness boot graph is missing');
}
if (!existsSync(join(runtime, 'harness-fixture.js'))) {
  throw new Error('Gate A fixture transport is missing');
}
if (!existsSync(join(here, transportName))) {
  throw new Error(`Transport adapter is missing: ${transportName}`);
}
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const entry of readdirSync(runtime)) {
  cpSync(join(runtime, entry), join(output, entry), { recursive: true, force: true });
}
copyFileSync(join(here, transportName), join(output, 'harness-fixture.js'));
console.log(`Built DreamStory Harness ${mode} runtime into ${output}`);
