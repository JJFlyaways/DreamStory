/* global URL, console */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const runtime = join(here, 'runtime');
const output = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(join(runtime, 'index.html'))) {
  throw new Error('Pinned Harness runtime is missing; run the pinned import before building');
}
if (!existsSync(join(runtime, 'boot-graph.json'))) {
  throw new Error('Pinned Harness boot graph is missing');
}
if (!existsSync(join(runtime, 'harness-fixture.js'))) {
  throw new Error('Gate A fixture transport is missing');
}
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const entry of readdirSync(runtime)) {
  cpSync(join(runtime, entry), join(output, entry), { recursive: true, force: true });
}
console.log(`Built DreamStory Harness template into ${output}`);
