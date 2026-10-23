import {
  ModelProviderError,
  type ModelProvider,
  type ModelTextChunk,
  type ModelTextRequest,
  type ModelTextResponse,
  type ModelUsage,
  type StructuredModelRequest,
  type StructuredModelResponse,
} from './provider.js';

export interface OpenAICompatibleProviderOptions {
  endpoint: string;
  model: string;
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

interface OpenAIStreamEvent {
  id?: string;
  choices?: Array<{ delta?: { content?: string | null } }>;
  usage?: OpenAIUsage | null;
}

interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number };
}

interface OpenAIResponse {
  id?: string;
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: OpenAIUsage | null;
}

export class OpenAICompatibleProvider implements ModelProvider {
  readonly capabilities = ['stream_text', 'structured_output', 'cancel', 'usage'] as const;

  private readonly endpoint: string;

  private readonly model: string;

  private readonly apiKey: string | undefined;

  private readonly timeoutMs: number;

  private readonly fetchImpl: typeof fetch;

  private readonly controllers = new Map<string, AbortController>();

  constructor(options: OpenAICompatibleProviderOptions) {
    this.endpoint = options.endpoint.replace(/\/$/, '');
    this.model = options.model;
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 120_000;
    this.fetchImpl = options.fetchImpl ?? fetch;

    if (this.endpoint.length === 0 || this.model.length === 0) {
      throw new Error('Model endpoint and model are required.');
    }
    if (!Number.isSafeInteger(this.timeoutMs) || this.timeoutMs <= 0) {
      throw new Error('Model timeout must be a positive integer.');
    }
  }

  async *streamText(request: ModelTextRequest): AsyncGenerator<ModelTextChunk> {
    const callId = `openai_call_${globalThis.crypto.randomUUID()}`;
    const controller = new AbortController();
    this.controllers.set(callId, controller);
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const removeExternalAbort = connectAbort(request.signal, controller);

    try {
      const response = await this.fetchImpl(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(this.requestBody(request, true)),
        signal: controller.signal,
      });
      await assertResponse(response);
      if (!response.body) {
        throw new ModelProviderError('INVALID_RESPONSE', 'The model response has no stream body.');
      }

      let index = 0;
      for await (const event of readSseEvents(response.body)) {
        if (event === '[DONE]') {
          break;
        }
        const parsed = parseJsonEvent<OpenAIStreamEvent>(event);
        const text = parsed.choices?.[0]?.delta?.content ?? '';
        if (text.length > 0) {
          yield { callId, index, text };
          index += 1;
        }
      }
    } catch (error) {
      throw normalizeProviderError(error, controller.signal);
    } finally {
      clearTimeout(timeout);
      removeExternalAbort();
      this.controllers.delete(callId);
    }
  }

  async generateText(request: ModelTextRequest): Promise<ModelTextResponse> {
    const result = await this.generateJsonResponse(request, false);
    return {
      callId: result.callId,
      text: result.text,
      usage: result.usage,
    };
  }

  async generateStructured<T>(
    request: StructuredModelRequest,
  ): Promise<StructuredModelResponse<T>> {
    const result = await this.generateJsonResponse(request, false);
    let value: T;
    try {
      value = JSON.parse(result.text) as T;
    } catch (error) {
      throw new ModelProviderError(
        'INVALID_RESPONSE',
        `The model returned invalid JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
    return { callId: result.callId, value, usage: result.usage };
  }

  cancel(callId: string): boolean {
    const controller = this.controllers.get(callId);
    if (!controller) {
      return false;
    }
    controller.abort();
    return true;
  }

  private async generateJsonResponse(
    request: ModelTextRequest | StructuredModelRequest,
    stream: boolean,
  ): Promise<{ callId: string; text: string; usage: ModelUsage }> {
    const callId = `openai_call_${globalThis.crypto.randomUUID()}`;
    const controller = new AbortController();
    this.controllers.set(callId, controller);
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const removeExternalAbort = connectAbort(request.signal, controller);

    try {
      const response = await this.fetchImpl(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(this.requestBody(request, stream)),
        signal: controller.signal,
      });
      await assertResponse(response);
      const payload = (await response.json()) as OpenAIResponse;
      const text = payload.choices?.[0]?.message?.content;
      if (typeof text !== 'string') {
        throw new ModelProviderError('INVALID_RESPONSE', 'The model response has no text content.');
      }
      return {
        callId,
        text,
        usage: normalizeUsage(payload.usage),
      };
    } catch (error) {
      throw normalizeProviderError(error, controller.signal);
    } finally {
      clearTimeout(timeout);
      removeExternalAbort();
      this.controllers.delete(callId);
    }
  }

  private headers(): HeadersInit {
    return {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
    };
  }

  private requestBody(request: ModelTextRequest | StructuredModelRequest, stream: boolean) {
    const structured = 'schema' in request;
    const userContent = structured
      ? `${request.input}\n\nReturn only valid JSON matching this schema:\n${JSON.stringify(request.schema)}`
      : request.input;
    return {
      model: this.model,
      messages: [
        ...(request.system ? [{ role: 'system', content: request.system }] : []),
        { role: 'user', content: userContent },
      ],
      ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
      ...(request.maxOutputTokens === undefined ? {} : { max_tokens: request.maxOutputTokens }),
      ...(structured ? { response_format: { type: 'json_object' } } : {}),
      stream,
      ...(stream ? { stream_options: { include_usage: true } } : {}),
    };
  }
}

async function assertResponse(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }
  const text = await response.text();
  let message = text || `Provider returned HTTP ${response.status}.`;
  try {
    const payload = JSON.parse(text) as { error?: { message?: string } };
    message = payload.error?.message ?? message;
  } catch {
    // Keep the response text when the provider did not return JSON.
  }
  throw new ModelProviderError(classifyStatus(response.status), message, {
    retryable: response.status === 408 || response.status === 429 || response.status >= 500,
    status: response.status,
    ...(response.headers.get('x-request-id') === null
      ? {}
      : { providerRequestId: response.headers.get('x-request-id') as string }),
  });
}

function classifyStatus(status: number): ModelProviderError['code'] {
  if (status === 401 || status === 403) return 'AUTHENTICATION';
  if (status === 408 || status === 504) return 'TIMEOUT';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'UNAVAILABLE';
  return 'UNKNOWN';
}

function normalizeProviderError(error: unknown, signal: AbortSignal): ModelProviderError {
  if (error instanceof ModelProviderError) {
    return error;
  }
  if (signal.aborted) {
    return new ModelProviderError('CANCELLED', 'The model call was cancelled.', {
      retryable: false,
    });
  }
  return new ModelProviderError(
    'UNAVAILABLE',
    error instanceof Error ? error.message : 'The model provider is unavailable.',
    { retryable: true },
  );
}

function normalizeUsage(usage: OpenAIUsage | null | undefined): ModelUsage {
  if (usage?.prompt_tokens !== undefined && usage.completion_tokens !== undefined) {
    return {
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      ...(usage.prompt_tokens_details?.cached_tokens === undefined
        ? {}
        : { cachedInputTokens: usage.prompt_tokens_details.cached_tokens }),
      usageKind: 'reported',
    };
  }
  return { inputTokens: 0, outputTokens: 0, usageKind: 'unknown' };
}

function parseJsonEvent<T>(event: string): T {
  try {
    return JSON.parse(event) as T;
  } catch (error) {
    throw new ModelProviderError(
      'INVALID_RESPONSE',
      `The provider returned invalid SSE JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
    );
  }
}

async function* readSseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const result = await reader.read();
      buffer += decoder.decode(result.value ?? new Uint8Array(), { stream: !result.done });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const data = frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n')
          .trim();
        if (data) yield data;
      }
      if (result.done) {
        const data = buffer
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n')
          .trim();
        if (data) yield data;
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function connectAbort(signal: AbortSignal | undefined, controller: AbortController): () => void {
  if (!signal) return () => undefined;
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort, { once: true });
  return () => signal.removeEventListener('abort', onAbort);
}
