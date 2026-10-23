export type ModelCapability = 'stream_text' | 'structured_output' | 'cancel' | 'usage';

export type UsageKind = 'reported' | 'estimated' | 'unknown';

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  usageKind: UsageKind;
}

export interface ModelTextRequest {
  input: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  requestId?: string;
  signal?: AbortSignal;
}

export interface ModelTextChunk {
  callId: string;
  index: number;
  text: string;
}

export interface ModelTextResponse {
  callId: string;
  text: string;
  usage: ModelUsage;
}

export interface StructuredModelRequest extends ModelTextRequest {
  schema: unknown;
}

export interface StructuredModelResponse<T> {
  callId: string;
  value: T;
  usage: ModelUsage;
}

export type ModelProviderErrorCode =
  | 'AUTHENTICATION'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

export class ModelProviderError extends Error {
  readonly code: ModelProviderErrorCode;

  readonly retryable: boolean;

  readonly status: number | undefined;

  readonly providerRequestId: string | undefined;

  constructor(
    code: ModelProviderErrorCode,
    message: string,
    options: {
      retryable?: boolean;
      status?: number;
      providerRequestId?: string;
    } = {},
  ) {
    super(message);
    this.name = 'ModelProviderError';
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.status = options.status;
    this.providerRequestId = options.providerRequestId;
  }
}

export interface ModelProvider {
  readonly capabilities: readonly ModelCapability[];
  streamText(request: ModelTextRequest): AsyncGenerator<ModelTextChunk>;
  generateText(request: ModelTextRequest): Promise<ModelTextResponse>;
  generateStructured<T>(request: StructuredModelRequest): Promise<StructuredModelResponse<T>>;
  cancel(callId: string): boolean;
}
