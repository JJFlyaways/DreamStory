import type { ErrorBody } from './errors.js';
import type { IsoUtcDateTime, StableId } from './ids.js';
import type { RunIntent, RunStatus, StepStatus } from './runs.js';

export type EventSequence = number;

export interface RunEventDataMap {
  'run.started': {
    runId: StableId;
    intent: RunIntent;
    status: Extract<RunStatus, 'queued' | 'running'>;
  };
  'step.started': {
    runId: StableId;
    stepId: StableId;
    name: string;
  };
  'output.delta': {
    runId: StableId;
    artifactId: StableId;
    text: string;
  };
  'output.snapshot': {
    runId: StableId;
    artifactId: StableId;
    revision: number;
    complete: boolean;
  };
  'step.completed': {
    runId: StableId;
    stepId: StableId;
    name: string;
    status: Extract<StepStatus, 'completed'>;
  };
  'run.awaiting_author': {
    runId: StableId;
    artifactId?: StableId;
  };
  'run.paused': {
    runId: StableId;
    reason?: string;
  };
  'run.completed': {
    runId: StableId;
  };
  'run.failed': {
    runId: StableId;
    error: ErrorBody;
  };
  'run.cancelled': {
    runId: StableId;
  };
  heartbeat: {
    at: IsoUtcDateTime;
  };
}

export type RunEventName = keyof RunEventDataMap;
export type PersistedRunEventName = Exclude<RunEventName, 'output.delta' | 'heartbeat'>;
export type TransientRunEventName = Extract<RunEventName, 'output.delta' | 'heartbeat'>;

export type PersistedRunEvent = {
  [Name in PersistedRunEventName]: {
    id: EventSequence;
    event: Name;
    data: RunEventDataMap[Name];
  };
}[PersistedRunEventName];

export type TransientRunEvent = {
  [Name in TransientRunEventName]: {
    event: Name;
    data: RunEventDataMap[Name];
  };
}[TransientRunEventName];

export type RunEvent = PersistedRunEvent | TransientRunEvent;
