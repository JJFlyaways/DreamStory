import type {
  Book,
  Chapter,
  DraftSaveResult,
  DraftVersion,
  PlanNode,
  PlanSaveResult,
  ModelProfile,
  ReviewDisposition,
  ReviewFinding,
  ReviewRecord,
  RunArtifact,
  RunEventRecord,
  RunRecord,
  ShelfEntry,
} from './types';

const API_BASE = import.meta.env['VITE_API_BASE_URL'] ?? '/api/v1';

let csrfToken: string | null = null;

export class ApiError extends Error {
  readonly payload: ApiErrorPayload;

  readonly status: number;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

interface ApiErrorPayload {
  code: string;
  message: string;
  details: Record<string, unknown>;
  requestId: string;
}

export async function listBooks(): Promise<ShelfEntry[]> {
  return request<ShelfEntry[]>('/books');
}

export async function getBook(bookId: string): Promise<Book> {
  return request<Book>(`/books/${bookId}`);
}

export async function createBook(input: {
  clientRequestId: string;
  title: string;
  language: string;
  genre: string;
  premise: string;
  conventions?: Record<string, unknown>;
}): Promise<Book> {
  return request<Book>('/books', { method: 'POST', body: input });
}

export async function updateBook(
  bookId: string,
  input: {
    clientRequestId: string;
    expectedBookRevision: number;
    title?: string;
    language?: string;
    genre?: string;
    premise?: string;
    conventions?: Record<string, unknown>;
  },
): Promise<Book> {
  return request<Book>(`/books/${bookId}`, { method: 'PATCH', body: input });
}

export async function listPlans(bookId: string): Promise<PlanNode[]> {
  return request<PlanNode[]>(`/books/${bookId}/plans`);
}

export async function savePlan(
  bookId: string,
  planId: string,
  input: {
    clientRequestId: string;
    expectedBookRevision: number;
    parentId: string | null;
    kind: PlanNode['kind'];
    sortKey: string;
    content: PlanNode['content'];
  },
): Promise<PlanSaveResult> {
  return request<PlanSaveResult>(`/books/${bookId}/plans/${planId}`, {
    method: 'PUT',
    body: input,
  });
}

export async function getPlanHistory(bookId: string, planId: string): Promise<PlanNode[]> {
  return request<PlanNode[]>(`/books/${bookId}/plans/${planId}/history`);
}

export async function listChapters(bookId: string): Promise<Chapter[]> {
  return request<Chapter[]>(`/books/${bookId}/chapters`);
}

export async function getChapter(bookId: string, chapterId: string): Promise<Chapter> {
  return request<Chapter>(`/books/${bookId}/chapters/${chapterId}`);
}

export async function listModelProfiles(): Promise<ModelProfile[]> {
  return request<ModelProfile[]>('/model-profiles');
}

export async function startRun(
  bookId: string,
  input: {
    intent: string;
    expectedBookRevision: number;
    target: { planId: string; chapterNumber: number };
    modelProfileId: string;
    scope: { chapterNumbers: number[] };
  },
): Promise<RunRecord> {
  return request<RunRecord>(`/books/${bookId}/runs`, { method: 'POST', body: input });
}

export async function getRun(bookId: string, runId: string): Promise<RunRecord> {
  return request<RunRecord>(`/books/${bookId}/runs/${runId}`);
}

export async function listRunArtifacts(bookId: string, runId: string): Promise<RunArtifact[]> {
  return request<RunArtifact[]>(`/books/${bookId}/runs/${runId}/artifacts`);
}

const runEventNames = [
  'run.started',
  'step.started',
  'output.delta',
  'output.snapshot',
  'step.completed',
  'run.awaiting_author',
  'run.paused',
  'run.completed',
  'run.failed',
  'run.cancelled',
] as const;

export function subscribeRunEvents(
  bookId: string,
  runId: string,
  onEvent: (event: RunEventRecord) => void,
): () => void {
  const source = new EventSource(`${API_BASE}/books/${bookId}/runs/${runId}/events`, {
    withCredentials: true,
  });
  const listeners = runEventNames.map((eventName) => {
    const listener = (event: Event) => {
      const message = event as MessageEvent<string>;
      let payload: unknown;
      try {
        payload = JSON.parse(message.data) as unknown;
      } catch {
        return;
      }
      const sequence = Number(message.lastEventId);
      onEvent({
        runId,
        ...(Number.isSafeInteger(sequence) && sequence > 0 ? { sequence } : {}),
        eventType: eventName,
        payload,
      });
    };
    source.addEventListener(eventName, listener);
    return { eventName, listener };
  });
  return () => {
    for (const { eventName, listener } of listeners) {
      source.removeEventListener(eventName, listener);
    }
    source.close();
  };
}

export async function cancelRun(bookId: string, runId: string): Promise<{ cancelled: boolean }> {
  return request<{ cancelled: boolean }>(`/books/${bookId}/runs/${runId}/cancel`, {
    method: 'POST',
  });
}

export async function listReviews(bookId: string, chapterId: string): Promise<ReviewRecord[]> {
  return request<ReviewRecord[]>(`/books/${bookId}/chapters/${chapterId}/reviews`);
}

export async function listReviewFindings(
  bookId: string,
  reviewId: string,
): Promise<ReviewFinding[]> {
  return request<ReviewFinding[]>(`/books/${bookId}/reviews/${reviewId}/findings`);
}

export async function setReviewFindingDisposition(
  bookId: string,
  findingId: string,
  input: { expectedFindingRevision: number; decision: Exclude<ReviewDisposition, 'open'> },
): Promise<ReviewFinding> {
  return request<ReviewFinding>(`/books/${bookId}/reviews/findings/${findingId}/disposition`, {
    method: 'POST',
    body: input,
  });
}

export async function finalizeChapter(
  bookId: string,
  chapterId: string,
  input: {
    clientRequestId: string;
    expectedBookRevision: number;
    expectedDraftRevision: number;
    draftVersionId: string;
    contentHash: string;
  },
): Promise<{ finalization: unknown; bookRevision: number; replayed: boolean }> {
  return request(`/books/${bookId}/chapters/${chapterId}/finalizations`, {
    method: 'POST',
    body: input,
  });
}

export async function createChapter(
  bookId: string,
  input: {
    clientRequestId: string;
    expectedBookRevision: number;
    id: string;
    chapterNumber: number;
    displayTitle: string;
    planNodeId: string;
  },
): Promise<{ chapter: Chapter; bookRevision: number; replayed: boolean }> {
  return request(`/books/${bookId}/chapters`, { method: 'POST', body: input });
}

export async function listDrafts(bookId: string, chapterId: string): Promise<DraftVersion[]> {
  return request<DraftVersion[]>(`/books/${bookId}/chapters/${chapterId}/drafts`);
}

export async function saveDraft(
  bookId: string,
  chapterId: string,
  draftId: string,
  input: {
    clientRequestId: string;
    expectedDraftRevision: number;
    content: string;
    complete: boolean;
  },
): Promise<DraftSaveResult> {
  return request<DraftSaveResult>(`/books/${bookId}/chapters/${chapterId}/drafts/${draftId}`, {
    method: 'PUT',
    body: input,
  });
}

export async function restoreDraft(
  bookId: string,
  chapterId: string,
  sourceDraftId: string,
  input: { clientRequestId: string; expectedDraftRevision: number },
): Promise<DraftSaveResult> {
  return request<DraftSaveResult>(
    `/books/${bookId}/chapters/${chapterId}/drafts/${sourceDraftId}/restore`,
    { method: 'POST', body: input },
  );
}

export async function exportBook(bookId: string, format: 'markdown' | 'txt') {
  return request<{
    format: 'markdown' | 'txt';
    fileName: string;
    characterCount: number;
    contentHash: string;
    updatedAt: string;
  }>(`/books/${bookId}/exports`, { method: 'POST', body: { format } });
}

export async function createBackup(bookId: string) {
  return request<{
    fileName: string;
    relativePath: string;
    sizeBytes: number;
    createdAt: string;
  }>(`/books/${bookId}/backups`, { method: 'POST' });
}

export async function downloadExport(bookId: string, format: 'markdown' | 'txt'): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${bookId}/exports/${format}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const payload = (await response.json()) as { error: ApiErrorPayload };
    throw new ApiError(response.status, payload.error);
  }
  const blob = new Blob([await response.text()], {
    type: format === 'markdown' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${bookId}.${format === 'markdown' ? 'md' : 'txt'}`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function hashContent(content: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(content),
  );
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

async function ensureSession(): Promise<void> {
  if (csrfToken !== null) {
    return;
  }
  const response = await fetch(`${API_BASE}/session`, { credentials: 'include' });
  const payload = await parseResponse<{ csrfToken: string }>(response);
  csrfToken = payload.csrfToken;
}

interface ClientRequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
}

async function request<T>(path: string, options: ClientRequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    await ensureSession();
  }

  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
  }
  if (csrfToken !== null && method !== 'GET' && method !== 'HEAD') {
    headers.set('x-story-csrf', csrfToken);
  }
  const init: RequestInit = { method, headers, credentials: 'include' };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }
  const response = await fetch(`${API_BASE}${path}`, init);
  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok) {
    const payload = (await response.json()) as { error: ApiErrorPayload };
    throw new ApiError(response.status, payload.error);
  }
  if (contentType.includes('text/')) {
    return (await response.text()) as T;
  }
  const payload = (await response.json()) as { data: T };
  return payload.data;
}

function requestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random()}`;
}

export function newRequestId(): string {
  return requestId();
}
