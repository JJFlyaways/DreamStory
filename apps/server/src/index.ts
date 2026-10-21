export * from './config.js';
export * from './session.js';
export * from './server.js';

import { fileURLToPath } from 'node:url';

import { startServer } from './server.js';

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
