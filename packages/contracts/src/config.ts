import type { StableId } from './ids.js';

export type LoopbackHost = '127.0.0.1';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type CredentialReferenceKind = 'environment' | 'process';

export interface CredentialReference {
  kind: CredentialReferenceKind;
  name: string;
}

export interface ModelProfile {
  id: StableId;
  protocol: string;
  endpoint: string;
  model: string;
  capabilities: readonly string[];
  purposes: readonly string[];
  credentialRef?: CredentialReference;
}

export interface ListenConfig {
  host: LoopbackHost;
  port: number;
  allowedOrigins: readonly string[];
}

export interface LogConfig {
  path: string;
  level: LogLevel;
}

export interface SessionConfig {
  ttlSeconds: number;
}

export interface ServerConfig {
  dataDirectory: string;
  libraryRoot: string;
  listen: ListenConfig;
  log: LogConfig;
  modelProfiles: readonly ModelProfile[];
  session: SessionConfig;
}
