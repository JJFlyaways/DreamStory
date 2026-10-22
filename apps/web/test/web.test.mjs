import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('builds the DreamStory React web shell', async () => {
  const html = await readFile(new globalThis.URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(html, /DreamStory/);
  assert.match(html, /src="\/assets\//);
});
