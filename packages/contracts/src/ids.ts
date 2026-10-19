export type Branded<T, Brand extends string> = T & {
  readonly __brand: Brand;
};

export type StableId = Branded<string, 'StableId'>;
export type ClientRequestId = Branded<string, 'ClientRequestId'>;
export type RequestId = Branded<string, 'RequestId'>;
export type ContentHash = Branded<string, 'ContentHash'>;
export type SourceFingerprint = Branded<string, 'SourceFingerprint'>;
export type IsoUtcDateTime = Branded<string, 'IsoUtcDateTime'>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/i;
const UTC_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;

export function parseStableId(value: string): StableId {
  if (value.length === 0 || value !== value.trim() || /[\\/]/.test(value)) {
    throw new Error('Stable ID must be non-empty and must not contain path separators.');
  }

  return value as StableId;
}

export function parseClientRequestId(value: string): ClientRequestId {
  if (!UUID_PATTERN.test(value)) {
    throw new Error('clientRequestId must be an RFC 4122 UUID.');
  }

  return value as ClientRequestId;
}

export function parseRequestId(value: string): RequestId {
  return parseStableId(value) as unknown as RequestId;
}

export function parseContentHash(value: string): ContentHash {
  if (!SHA256_PATTERN.test(value)) {
    throw new Error('Content hash must use the sha256:<64-hex-chars> format.');
  }

  return value.toLowerCase() as ContentHash;
}

export function parseSourceFingerprint(value: string): SourceFingerprint {
  if (!SHA256_PATTERN.test(value)) {
    throw new Error('Source fingerprint must use the sha256:<64-hex-chars> format.');
  }

  return value.toLowerCase() as SourceFingerprint;
}

export function parseUtcDateTime(value: string): IsoUtcDateTime {
  if (!UTC_DATE_TIME_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error('Timestamp must be a valid ISO 8601 UTC datetime ending in Z.');
  }

  return value as IsoUtcDateTime;
}
