import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('builds the pinned Harness web template', async () => {
  const html = await readFile(new globalThis.URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(html, /DreamStory/);
  assert.match(html, /__DSH_BOOT__/);
  assert.match(html, /harness-fixture\.js/);
  assert.match(html, /plugins\/application\.js/);
  assert.doesNotMatch(html, /src="\/src\/index\.tsx"/);
});
