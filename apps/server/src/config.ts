import { homedir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';

import {
  parseStableId,
  type CredentialReference,
  type LogLevel,
  type LoopbackHost,
  type ModelProfile,
  type ServerConfig,
} from '@dreamstory/contracts';

export const LOOPBACK_HOST: LoopbackHost = '127.0.0.1';
export const DEFAULT_PORT = 3000;
export const DEFAULT_SESSION_TTL_SECONDS = 3600;

const DEFAULT_LOG_LEVEL: LogLevel = 'info';
const MODEL_PROFILES_ENV = 'DREAMSTORY_MODEL_PROFILES';

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export interface ConfigParseOptions {
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  homeDirectory?: string;
  workingDirectory?: string;
}

export function parseServerConfig(options: ConfigParseOptions = {}): ServerConfig {
  const env = options.env ?? process.env;
  const platform = options.platform ?? process.platform;
  const homeDirectory = options.homeDirectory ?? homedir();
  const workingDirectory = options.workingDirectory ?? process.cwd();
  const dataDirectory = getDefaultDataDirectory(platform, homeDirectory, env);
  const port = parseIntegerEnv(env, 'DREAMSTORY_PORT', DEFAULT_PORT, 1, 65535);
  const host = parseHost(env['DREAMSTORY_HOST']);
  const allowedOrigins = parseAllowedOrigins(env['DREAMSTORY_ALLOWED_ORIGINS'], port);
  const sessionTtlSeconds = parseIntegerEnv(
    env,
    'DREAMSTORY_SESSION_TTL_SECONDS',
    DEFAULT_SESSION_TTL_SECONDS,
    60,
    86_400,
  );

  return {
    dataDirectory,
    libraryRoot: resolveConfiguredPath(
      env['DREAMSTORY_LIBRARY_ROOT'],
      join(dataDirectory, 'library'),
      workingDirectory,
      'DREAMSTORY_LIBRARY_ROOT',
    ),
    listen: {
      host,
      port,
      allowedOrigins,
    },
    log: {
      path: resolveConfiguredPath(
        env['DREAMSTORY_LOG_PATH'],
        join(dataDirectory, 'logs', 'server.log'),
        workingDirectory,
        'DREAMSTORY_LOG_PATH',
      ),
      level: parseLogLevel(env['DREAMSTORY_LOG_LEVEL']),
    },
    modelProfiles: parseModelProfiles(env[MODEL_PROFILES_ENV]),
    session: {
      ttlSeconds: sessionTtlSeconds,
    },
  };
}

export function getDefaultDataDirectory(
  platform: NodeJS.Platform,
  homeDirectory: string,
  env: NodeJS.ProcessEnv,
): string {
  const baseDirectory =
    platform === 'win32'
      ? env['APPDATA'] || join(homeDirectory, 'AppData', 'Roaming')
      : platform === 'darwin'
        ? join(homeDirectory, 'Library', 'Application Support')
        : env['XDG_DATA_HOME'] || join(homeDirectory, '.local', 'share');

  return resolve(join(baseDirectory, 'DreamStory'));
}

function parseHost(value: string | undefined): LoopbackHost {
  if (value !== undefined && value !== LOOPBACK_HOST) {
    throw new ConfigurationError('DREAMSTORY_HOST must be 127.0.0.1.');
  }

  return LOOPBACK_HOST;
}

function parseIntegerEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const value = env[name];
  if (value === undefined) {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    throw new ConfigurationError(`${name} must be an integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new ConfigurationError(`${name} must be between ${minimum} and ${maximum}.`);
  }

  return parsed;
}

function parseLogLevel(value: string | undefined): LogLevel {
  const level = value ?? DEFAULT_LOG_LEVEL;
  if (level !== 'debug' && level !== 'info' && level !== 'warn' && level !== 'error') {
    throw new ConfigurationError('DREAMSTORY_LOG_LEVEL must be debug, info, warn, or error.');
  }

  return level;
}

function parseAllowedOrigins(value: string | undefined, port: number): readonly string[] {
  const rawOrigins = value === undefined ? [`http://${LOOPBACK_HOST}:${port}`] : value.split(',');
  const origins = rawOrigins.map((rawOrigin) => rawOrigin.trim());

  if (origins.length === 0 || origins.some((origin) => origin.length === 0)) {
    throw new ConfigurationError('DREAMSTORY_ALLOWED_ORIGINS must contain non-empty origins.');
  }

  return origins.map((origin) => parseAllowedOrigin(origin));
}

function parseAllowedOrigin(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ConfigurationError('DREAMSTORY_ALLOWED_ORIGINS contains an invalid URL.');
  }

  if (
    parsed.protocol !== 'http:' ||
    parsed.hostname !== LOOPBACK_HOST ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.pathname !== '/' ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    throw new ConfigurationError(
      'DREAMSTORY_ALLOWED_ORIGINS must use http://127.0.0.1 origins without paths or credentials.',
    );
  }

  return parsed.origin;
}

function resolveConfiguredPath(
  configuredPath: string | undefined,
  fallback: string,
  workingDirectory: string,
  variableName: string,
): string {
  if (configuredPath === undefined) {
    return resolve(fallback);
  }

  if (configuredPath.trim() === '') {
    throw new ConfigurationError(`${variableName} must not be empty.`);
  }

  return isAbsolute(configuredPath)
    ? resolve(configuredPath)
    : resolve(workingDirectory, configuredPath);
}

function parseModelProfiles(value: string | undefined): readonly ModelProfile[] {
  if (value === undefined) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new ConfigurationError(`${MODEL_PROFILES_ENV} must contain valid JSON.`);
  }

  if (!Array.isArray(parsed)) {
    throw new ConfigurationError(`${MODEL_PROFILES_ENV} must contain a JSON array.`);
  }

  return parsed.map((item, index) => parseModelProfile(item, index));
}

function parseModelProfile(value: unknown, index: number): ModelProfile {
  const label = `${MODEL_PROFILES_ENV}[${index}]`;
  const record = asRecord(value, label);
  const id = requiredString(record['id'], `${label}.id`);
  const protocol = requiredString(record['protocol'], `${label}.protocol`);
  const endpoint = requiredString(record['endpoint'], `${label}.endpoint`);
  const model = requiredString(record['model'], `${label}.model`);
  const capabilities = stringArray(record['capabilities'], `${label}.capabilities`);
  const purposes = stringArray(record['purposes'], `${label}.purposes`);

  validateEndpoint(endpoint, `${label}.endpoint`);

  const profile: ModelProfile = {
    id: parseStableIdForConfig(id, `${label}.id`),
    protocol,
    endpoint,
    model,
    capabilities,
    purposes,
  };

  if (record['credentialRef'] !== undefined) {
    profile.credentialRef = parseCredentialReference(
      record['credentialRef'],
      `${label}.credentialRef`,
    );
  }

  return profile;
}

function parseCredentialReference(value: unknown, label: string): CredentialReference {
  const record = asRecord(value, label);
  const kind = requiredString(record['kind'], `${label}.kind`);
  const name = requiredString(record['name'], `${label}.name`);

  if (kind !== 'environment' && kind !== 'process') {
    throw new ConfigurationError(`${label}.kind must be environment or process.`);
  }

  if (kind === 'environment' && !/^[A-Z][A-Z0-9_]*$/.test(name)) {
    throw new ConfigurationError(`${label}.name must be a valid environment variable name.`);
  }

  return { kind, name };
}

function validateEndpoint(value: string, label: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ConfigurationError(`${label} must be a valid URL.`);
  }

  if (
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    throw new ConfigurationError(
      `${label} must not contain credentials, query parameters, or fragments.`,
    );
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ConfigurationError(`${label} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ConfigurationError(`${label} must be a non-empty string.`);
  }

  return value;
}

function stringArray(value: unknown, label: string): readonly string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    throw new ConfigurationError(`${label} must be a non-empty string array.`);
  }

  return value;
}

function parseStableIdForConfig(value: string, label: string) {
  try {
    return parseStableId(value);
  } catch {
    throw new ConfigurationError(`${label} must be a valid stable ID.`);
  }
}
