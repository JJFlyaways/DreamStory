import type {
  Book,
  Chapter,
  DraftSaveResult,
  DraftVersion,
  PlanNode,
  PlanSaveResult,
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
