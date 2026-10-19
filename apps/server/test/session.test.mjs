import assert from 'node:assert/strict';
import test from 'node:test';

import { SessionManager } from '../dist/index.js';

const ORIGIN = 'http://127.0.0.1:3000';

function createManager(clock) {
  let tokenNumber = 0;
  return new SessionManager({
    ttlSeconds: 60,
    allowedOrigins: [ORIGIN],
    now: clock,
    tokenFactory: () => `token_${++tokenNumber}`,
  });
}

test('issues a strict loopback session cookie and validates a write request', () => {
  const manager = createManager(() => 1_000_000);
  const issued = manager.issueSession();

  assert.equal(issued.cookie.name, 'dreamstory_session');
  assert.equal(issued.cookie.httpOnly, true);
  assert.equal(issued.cookie.sameSite, 'strict');
  assert.equal(issued.cookie.secure, false);
  assert.equal(issued.cookie.maxAge, 60);
  assert.match(issued.session.expiresAt, /Z$/);

  const result = manager.validateWriteRequest({
    origin: ORIGIN,
    sessionCookie: issued.cookie.value,
    csrfToken: issued.session.csrfToken,
  });

  assert.equal(result.ok, true);
});

test('rejects missing, mismatched, or cross-origin write credentials', () => {
  const manager = createManager(() => 1_000_000);
  const issued = manager.issueSession();

  assert.deepEqual(manager.validateWriteRequest({}), {
    ok: false,
    reason: 'origin_not_allowed',
  });
  assert.deepEqual(manager.validateWriteRequest({ origin: ORIGIN }), {
    ok: false,
    reason: 'session_missing',
  });
  assert.deepEqual(
    manager.validateWriteRequest({
      origin: ORIGIN,
      sessionCookie: issued.cookie.value,
    }),
    { ok: false, reason: 'csrf_missing' },
  );
  assert.deepEqual(
    manager.validateWriteRequest({
      origin: ORIGIN,
      sessionCookie: issued.cookie.value,
      csrfToken: 'wrong-token',
    }),
    { ok: false, reason: 'csrf_mismatch' },
  );
  assert.deepEqual(
    manager.validateWriteRequest({
      origin: 'http://127.0.0.1:5173',
      sessionCookie: issued.cookie.value,
      csrfToken: issued.session.csrfToken,
    }),
    { ok: false, reason: 'origin_not_allowed' },
  );
});

test('expires and rotates sessions', () => {
  let now = 1_000_000;
  const manager = createManager(() => now);
  const first = manager.issueSession();

  now += 60_001;
  assert.deepEqual(
    manager.validateWriteRequest({
      origin: ORIGIN,
      sessionCookie: first.cookie.value,
      csrfToken: first.session.csrfToken,
    }),
    { ok: false, reason: 'session_expired' },
  );

  const second = manager.rotateSession(first.cookie.value);
  assert.notEqual(second.cookie.value, first.cookie.value);
  assert.notEqual(second.session.csrfToken, first.session.csrfToken);
});
