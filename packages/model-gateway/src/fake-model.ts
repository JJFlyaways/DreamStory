import type { ModelProvider, ModelTextRequest } from './provider.js';

export type FakeCallStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export type FakeModelErrorCode = 'MODEL_FAILURE' | 'CANCELLED' | 'INVALID_RESPONSE';

export interface FakeModelUsage {
  inputTokens: number;
  outputTokens: number;
  usageKind: 'reported' | 'estimated' | 'unknown';
}

export type FakeTextRequest = ModelTextRequest;

export interface FakeTextChunk {
  callId: string;
  index: number;
  text: string;
}

export interface FakeTextResponse {
  callId: string;
  text: string;
  usage: FakeModelUsage;
}

export interface FakeModelProviderOptions {
  responseText?: string;
  chunks?: readonly string[];
  chunkSize?: number;
  delayMs?: number;
  failAfterChunks?: number;
  failureMessage?: string;
  usage?: Partial<FakeModelUsage>;
}

export interface FakeModelCall {
  id: string;
  requestId: string | null;
  input: string;
  status: FakeCallStatus;
  chunksEmitted: number;
  text: string;
  usage: FakeModelUsage;
  error?: string;
}

export class FakeModelError extends Error {
  readonly code: FakeModelErrorCode;

  readonly callId: string;

  constructor(code: FakeModelErrorCode, callId: string, message: string) {
    super(message);
    this.name = 'FakeModelError';
    this.code = code;
    this.callId = callId;
  }
}

interface StoredFakeModelCall {
  id: string;
  requestId: string | null;
  input: string;
  status: FakeCallStatus;
  chunksEmitted: number;
  text: string;
  usage: FakeModelUsage;
  error?: string;
}

export class FakeModelProvider implements ModelProvider {
  readonly capabilities = ['stream_text', 'structured_output', 'cancel', 'usage'] as const;

  private readonly chunks: readonly string[];

  private readonly delayMs: number;

  private readonly failAfterChunks: number | undefined;

  private readonly failureMessage: string;

  private readonly usageOverrides: Partial<FakeModelUsage>;

  private readonly activeControllers = new Map<string, AbortController>();

  private readonly calls = new Map<string, StoredFakeModelCall>();

  private nextCallNumber = 1;

  constructor(options: FakeModelProviderOptions = {}) {
    this.chunks = createChunks(options);
    this.delayMs = options.delayMs ?? 0;
    this.failAfterChunks = options.failAfterChunks;
    this.failureMessage = options.failureMessage ?? 'Fake model failure.';
    this.usageOverrides = options.usage ?? {};

    if (!Number.isSafeInteger(this.delayMs) || this.delayMs < 0) {
      throw new Error('Fake model delayMs must be a non-negative integer.');
    }

    if (
      this.failAfterChunks !== undefined &&
      (!Number.isSafeInteger(this.failAfterChunks) || this.failAfterChunks < 0)
    ) {
      throw new Error('Fake model failAfterChunks must be a non-negative integer.');
    }
  }

  async *streamText(request: FakeTextRequest): AsyncGenerator<FakeTextChunk> {
    const callId = `fake_call_${this.nextCallNumber}`;
    this.nextCallNumber += 1;
    const controller = new AbortController();
    const call: StoredFakeModelCall = {
      id: callId,
      requestId: request.requestId ?? null,
      input: request.input,
      status: 'running',
      chunksEmitted: 0,
      text: '',
      usage: {
        inputTokens: this.usageOverrides.inputTokens ?? estimateTokens(request.input),
        outputTokens: this.usageOverrides.outputTokens ?? 0,
        usageKind: this.usageOverrides.usageKind ?? 'estimated',
      },
    };

    this.calls.set(callId, call);
    this.activeControllers.set(callId, controller);

    try {
      for (const [index, text] of this.chunks.entries()) {
        await waitForChunk(this.delayMs, callId, request.signal, controller.signal);

        if (this.failAfterChunks !== undefined && index >= this.failAfterChunks) {
          throw new FakeModelError('MODEL_FAILURE', callId, this.failureMessage);
        }

        call.chunksEmitted += 1;
        call.text += text;
        call.usage.outputTokens = this.usageOverrides.outputTokens ?? estimateTokens(call.text);
        yield { callId, index, text };
      }

      call.status = 'completed';
    } catch (error) {
      if (error instanceof FakeModelError) {
        call.status = error.code === 'CANCELLED' ? 'cancelled' : 'failed';
        call.error = error.message;
        throw error;
      }

      call.status = 'failed';
      call.error = 'Unexpected fake model failure.';
      throw new FakeModelError('MODEL_FAILURE', callId, call.error);
    } finally {
      if (call.status === 'running') {
        call.status = 'cancelled';
      }
      this.activeControllers.delete(callId);
    }
  }

  async generateText(request: FakeTextRequest): Promise<FakeTextResponse> {
    const chunks: string[] = [];
    let callId = '';

    for await (const chunk of this.streamText(request)) {
      callId = chunk.callId;
      chunks.push(chunk.text);
    }

    const call = this.calls.get(callId);
    if (call === undefined) {
      throw new Error('Fake model call was not recorded.');
    }

    return {
      callId,
      text: chunks.join(''),
      usage: { ...call.usage },
    };
  }

  async generateStructured<T>(request: FakeTextRequest & { schema?: unknown }): Promise<{
    callId: string;
    value: T;
    usage: FakeModelUsage;
  }> {
    const result = await this.generateText(request);
    try {
      return {
        callId: result.callId,
        value: JSON.parse(result.text) as T,
        usage: result.usage,
      };
    } catch (error) {
      throw new FakeModelError(
        'INVALID_RESPONSE',
        result.callId,
        `Fake model returned invalid JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  cancel(callId: string): boolean {
    const controller = this.activeControllers.get(callId);
    if (controller === undefined) {
      return false;
    }

    controller.abort();
    return true;
  }

  getCall(callId: string): FakeModelCall | null {
    const call = this.calls.get(callId);
    if (call === undefined) {
      return null;
    }

    return copyCall(call);
  }

  listCalls(): readonly FakeModelCall[] {
    return [...this.calls.values()].map(copyCall);
  }
}

function createChunks(options: FakeModelProviderOptions): readonly string[] {
  if (options.chunks !== undefined) {
    if (options.chunks.some((chunk) => typeof chunk !== 'string')) {
      throw new Error('Fake model chunks must contain only strings.');
    }
    return [...options.chunks];
  }

  const responseText = options.responseText ?? '';
  const chunkSize = (options.chunkSize ?? responseText.length) || 1;
  if (!Number.isSafeInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('Fake model chunkSize must be a positive integer.');
  }

  const characters = Array.from(responseText);
  const chunks: string[] = [];
  for (let start = 0; start < characters.length; start += chunkSize) {
    chunks.push(characters.slice(start, start + chunkSize).join(''));
  }
  return chunks;
}

async function waitForChunk(
  delayMs: number,
  callId: string,
  externalSignal: AbortSignal | undefined,
  internalSignal: AbortSignal,
): Promise<void> {
  throwIfCancelled(callId, externalSignal, internalSignal);

  if (delayMs === 0) {
    await Promise.resolve();
    throwIfCancelled(callId, externalSignal, internalSignal);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);
    const onAbort = () => {
      cleanup();
      reject(new FakeModelError('CANCELLED', callId, 'Fake model call cancelled.'));
    };
    const signals = [externalSignal, internalSignal].filter(
      (signal): signal is AbortSignal => signal !== undefined,
    );

    const cleanup = () => {
      clearTimeout(timer);
      for (const signal of signals) {
        signal.removeEventListener('abort', onAbort);
      }
    };

    for (const signal of signals) {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });

  throwIfCancelled(callId, externalSignal, internalSignal);
}

function throwIfCancelled(callId: string, ...signals: (AbortSignal | undefined)[]): void {
  if (signals.some((signal) => signal?.aborted === true)) {
    throw new FakeModelError('CANCELLED', callId, 'Fake model call cancelled.');
  }
}

function estimateTokens(value: string): number {
  return Math.ceil(Array.from(value).length / 4);
}

function copyCall(call: StoredFakeModelCall): FakeModelCall {
  const copy: FakeModelCall = {
    id: call.id,
    requestId: call.requestId,
    input: call.input,
    status: call.status,
    chunksEmitted: call.chunksEmitted,
    text: call.text,
    usage: { ...call.usage },
  };

  if (call.error !== undefined) {
    copy.error = call.error;
  }

  return copy;
}
