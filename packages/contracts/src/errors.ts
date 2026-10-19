import type { RequestId } from './ids.js';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'PATH_NOT_GRANTED'
  | 'NOT_FOUND'
  | 'REVISION_CONFLICT'
  | 'SOURCE_STALE'
  | 'RUN_ALREADY_ACTIVE'
  | 'SCOPE_EXCEEDED'
  | 'PRECONDITION_FAILED'
  | 'BUDGET_EXCEEDED'
  | 'PROVIDER_UNAVAILABLE'
  | 'STORAGE_ERROR';

export interface ErrorDetails {
  [key: string]: unknown;
}

export interface ErrorBody {
  code: ErrorCode;
  message: string;
  details: ErrorDetails;
  requestId: RequestId;
}

export interface ErrorResponse {
  error: ErrorBody;
}
