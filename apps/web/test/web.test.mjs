import assert from 'node:assert/strict';
import test from 'node:test';

import { createWebServer } from '../dist/index.js';

test('serves the local DreamStory web shell on loopback', async () => {
  const server = createWebServer({ port: 0 });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.equal(typeof address, 'object');
  const response = await globalThis.fetch(`http://127.0.0.1:${address.port}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /DreamStory/);
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});
