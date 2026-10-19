import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ConfigurationError,
  DEFAULT_PORT,
  DEFAULT_SESSION_TTL_SECONDS,
  LOOPBACK_HOST,
  parseServerConfig,
} from '../dist/index.js';

test('uses safe local defaults', () => {
  const config = parseServerConfig({
    env: {},
    platform: 'linux',
    homeDirectory: '/home/tester',
    workingDirectory: '/workspace',
  });

  assert.equal(config.listen.host, LOOPBACK_HOST);
  assert.equal(config.listen.port, DEFAULT_PORT);
  assert.deepEqual(config.listen.allowedOrigins, ['http://127.0.0.1:3000']);
  assert.equal(config.session.ttlSeconds, DEFAULT_SESSION_TTL_SECONDS);
  assert.equal(config.dataDirectory, '/home/tester/.local/share/DreamStory');
  assert.equal(config.libraryRoot, '/home/tester/.local/share/DreamStory/library');
  assert.equal(config.log.path, '/home/tester/.local/share/DreamStory/logs/server.log');
  assert.deepEqual(config.modelProfiles, []);
});

test('parses custom paths, origins, session settings, and model references', () => {
  const config = parseServerConfig({
    env: {
      DREAMSTORY_HOST: '127.0.0.1',
      DREAMSTORY_PORT: '4123',
      DREAMSTORY_LIBRARY_ROOT: './books',
      DREAMSTORY_LOG_PATH: './logs/server.log',
      DREAMSTORY_LOG_LEVEL: 'debug',
      DREAMSTORY_ALLOWED_ORIGINS: 'http://127.0.0.1:5173, http://127.0.0.1:4123',
      DREAMSTORY_SESSION_TTL_SECONDS: '7200',
      DREAMSTORY_MODEL_PROFILES: JSON.stringify([
        {
          id: 'writer_primary',
          protocol: 'openai-compatible',
          endpoint: 'https://model.example.test/v1',
          model: 'writer-model',
          capabilities: ['stream_text', 'structured_output'],
          purposes: ['writing', 'revision'],
          credentialRef: { kind: 'environment', name: 'DREAMSTORY_MODEL_KEY' },
        },
      ]),
    },
    platform: 'linux',
    homeDirectory: '/home/tester',
    workingDirectory: '/workspace',
  });

  assert.equal(config.listen.port, 4123);
  assert.deepEqual(config.listen.allowedOrigins, [
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4123',
  ]);
  assert.equal(config.libraryRoot, '/workspace/books');
  assert.equal(config.log.path, '/workspace/logs/server.log');
  assert.equal(config.log.level, 'debug');
  assert.equal(config.session.ttlSeconds, 7200);
  assert.deepEqual(config.modelProfiles[0], {
    id: 'writer_primary',
    protocol: 'openai-compatible',
    endpoint: 'https://model.example.test/v1',
    model: 'writer-model',
    capabilities: ['stream_text', 'structured_output'],
    purposes: ['writing', 'revision'],
    credentialRef: { kind: 'environment', name: 'DREAMSTORY_MODEL_KEY' },
  });
});

test('rejects non-loopback hosts and malformed configuration', () => {
  assert.throws(
    () => parseServerConfig({ env: { DREAMSTORY_HOST: '0.0.0.0' } }),
    ConfigurationError,
  );
  assert.throws(() => parseServerConfig({ env: { DREAMSTORY_PORT: '70000' } }), ConfigurationError);
  assert.throws(
    () => parseServerConfig({ env: { DREAMSTORY_ALLOWED_ORIGINS: 'https://127.0.0.1:3000' } }),
    ConfigurationError,
  );
  assert.throws(
    () =>
      parseServerConfig({
        env: {
          DREAMSTORY_MODEL_PROFILES: JSON.stringify([
            {
              id: 'writer_primary',
              protocol: 'openai-compatible',
              endpoint: 'https://model.example.test/v1?key=secret',
              model: 'writer-model',
              capabilities: ['stream_text'],
              purposes: ['writing'],
            },
          ]),
        },
      }),
    ConfigurationError,
  );
});
