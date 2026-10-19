import { randomBytes, timingSafeEqual } from 'node:crypto';

import { parseUtcDateTime, type IsoUtcDateTime } from '@dreamstory/contracts';

export const SESSION_COOKIE_NAME = 'dreamstory_session';

export interface SessionCookie {
  name: typeof SESSION_COOKIE_NAME;
  value: string;
  httpOnly: true;
  sameSite: 'strict';
  secure: false;
  path: '/';
  maxAge: number;
}

export interface SessionView {
  csrfToken: string;
  expiresAt: IsoUtcDateTime;
}

export interface IssuedSession {
  session: SessionView;
  cookie: SessionCookie;
}

export interface SessionManagerOptions {
  ttlSeconds: number;
  allowedOrigins: readonly string[];
  now?: () => number;
  tokenFactory?: () => string;
}

export interface WriteRequestSecurity {
  origin?: string;
  sessionCookie?: string;
  csrfToken?: string;
}

export type SessionValidationResult =
  | { ok: true; session: SessionView }
  | {
      ok: false;
      reason:
        | 'origin_not_allowed'
        | 'session_missing'
        | 'session_expired'
        | 'csrf_missing'
        | 'csrf_mismatch';
    };

interface StoredSession {
  sessionId: string;
  csrfToken: string;
  expiresAtMs: number;
  expiresAt: IsoUtcDateTime;
}

export class SessionManager {
  private readonly sessions = new Map<string, StoredSession>();

  private readonly now: () => number;

  private readonly tokenFactory: () => string;

  private readonly ttlSeconds: number;

  private readonly allowedOrigins: ReadonlySet<string>;

  constructor(options: SessionManagerOptions) {
    if (!Number.isSafeInteger(options.ttlSeconds) || options.ttlSeconds < 60) {
      throw new Error('Session TTL must be an integer of at least 60 seconds.');
    }

    if (options.allowedOrigins.length === 0) {
      throw new Error('At least one allowed origin is required.');
    }

    this.ttlSeconds = options.ttlSeconds;
    this.allowedOrigins = new Set(options.allowedOrigins);
    this.now = options.now ?? Date.now;
    this.tokenFactory = options.tokenFactory ?? (() => randomBytes(32).toString('base64url'));
  }

  issueSession(): IssuedSession {
    this.removeExpiredSessions();

    const sessionId = this.createToken();
    const csrfToken = this.createToken();
    const expiresAtMs = this.now() + this.ttlSeconds * 1000;
    const expiresAt = parseUtcDateTime(new Date(expiresAtMs).toISOString());
    const storedSession: StoredSession = {
      sessionId,
      csrfToken,
      expiresAtMs,
      expiresAt,
    };

    this.sessions.set(sessionId, storedSession);

    return {
      session: this.toSessionView(storedSession),
      cookie: {
        name: SESSION_COOKIE_NAME,
        value: sessionId,
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        path: '/',
        maxAge: this.ttlSeconds,
      },
    };
  }

  rotateSession(sessionCookie: string | undefined): IssuedSession | undefined {
    if (sessionCookie !== undefined) {
      this.sessions.delete(sessionCookie);
    }

    return this.issueSession();
  }

  validateWriteRequest(request: WriteRequestSecurity): SessionValidationResult {
    if (request.origin === undefined || !this.allowedOrigins.has(request.origin)) {
      return { ok: false, reason: 'origin_not_allowed' };
    }

    if (request.sessionCookie === undefined) {
      return { ok: false, reason: 'session_missing' };
    }

    const storedSession = this.sessions.get(request.sessionCookie);
    if (storedSession === undefined) {
      return { ok: false, reason: 'session_missing' };
    }

    if (storedSession.expiresAtMs <= this.now()) {
      this.sessions.delete(request.sessionCookie);
      return { ok: false, reason: 'session_expired' };
    }

    if (request.csrfToken === undefined) {
      return { ok: false, reason: 'csrf_missing' };
    }

    if (!secureEqual(storedSession.csrfToken, request.csrfToken)) {
      return { ok: false, reason: 'csrf_mismatch' };
    }

    return { ok: true, session: this.toSessionView(storedSession) };
  }

  private createToken(): string {
    const token = this.tokenFactory();
    if (token.length === 0) {
      throw new Error('Session token factory returned an empty token.');
    }

    return token;
  }

  private removeExpiredSessions(): void {
    const now = this.now();
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAtMs <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private toSessionView(session: StoredSession): SessionView {
    return {
      csrfToken: session.csrfToken,
      expiresAt: session.expiresAt,
    };
  }
}

function secureEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
