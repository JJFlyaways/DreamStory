import { createHash } from 'node:crypto';

import {
  parseContentHash,
  parseStableId,
  parseUtcDateTime,
  type IsoUtcDateTime,
  type RunIntent,
  type StableId,
} from '@dreamstory/contracts';
import type { ModelProvider, ModelProviderError } from '@dreamstory/model-gateway';

import {
  RUN_DEFINITIONS,
  type InputSnapshotRecord,
  type RunArtifactKind,
  type RunEventRecord,
  type RunPersistenceRepository,
  type RunStepRecord,
} from './runs.js';
import type { RunRecord } from './repositories.js';

export interface AgentRunCommand {
  runId: StableId;
  bookId: StableId;
  ownerId: StableId;
  intent: RunIntent;
  scope: unknown;
  inputSnapshot: InputSnapshotRecord;
  provider: ModelProvider;
  providerName: string;
  model: string;
  modelInput: string;
  now: IsoUtcDateTime;
  snapshotEveryCharacters?: number;
}

export interface TransientRunEvent {
  runId: StableId;
  event: 'output.delta' | 'output.snapshot';
  data: Record<string, unknown>;
}

export type RunEventListener = (event: RunEventRecord | TransientRunEvent) => void;

export class RunEventHub {
  private readonly listeners = new Map<string, Set<RunEventListener>>();

  subscribe(runId: StableId, listener: RunEventListener): () => void {
    const listeners = this.listeners.get(runId) ?? new Set<RunEventListener>();
    listeners.add(listener);
    this.listeners.set(runId, listeners);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.listeners.delete(runId);
    };
  }

  publish(event: RunEventRecord | TransientRunEvent): void {
    const listeners = this.listeners.get(event.runId);
    if (!listeners) return;
    for (const listener of listeners) listener(event);
  }
}

export class AgentRunCoordinator {
  private readonly commands = new Map<string, AgentRunCommand>();

  private readonly cancelRequests = new Set<string>();

  private readonly activeCalls = new Map<
    string,
    { provider: ModelProvider; callId: string | null; controller: AbortController }
  >();

  constructor(
    private readonly runs: RunPersistenceRepository,
    private readonly events = new RunEventHub(),
    private readonly now: () => IsoUtcDateTime = () => parseUtcDateTime(new Date().toISOString()),
  ) {}

  get eventHub(): RunEventHub {
    return this.events;
  }

  async start(command: AgentRunCommand): Promise<RunRecord> {
    const definition = RUN_DEFINITIONS[command.intent];
    const run: RunRecord = {
      id: command.runId,
      bookId: command.bookId,
      intent: command.intent,
      scope: command.scope,
      status: 'queued',
      inputSnapshotId: command.inputSnapshot.id,
      lease: null,
      attempt: 0,
      error: null,
      createdAt: command.now,
      updatedAt: command.now,
    };
    await this.runs.create(run);
    await this.runs.saveInputSnapshot(command.inputSnapshot);
    for (const [sequence, step] of definition.steps.entries()) {
      await this.runs.createStep({
        id: parseStableId(`step_${command.runId}_${sequence}`),
        runId: command.runId,
        sequence,
        name: step.name,
        status: 'pending',
        attempt: 0,
        inputSnapshotId: command.inputSnapshot.id,
        artifactId: null,
        error: null,
        startedAt: null,
        completedAt: null,
        createdAt: command.now,
        updatedAt: command.now,
      });
    }
    this.commands.set(command.runId, command);
    return run;
  }

  async run(command: AgentRunCommand): Promise<RunRecord> {
    await this.start(command);
    await this.execute(command.runId);
    const result = await this.runs.get(command.runId);
    if (result === null) throw new Error('Run disappeared during execution.');
    return result;
  }

  async execute(runId: StableId): Promise<void> {
    const command = this.commands.get(runId);
    if (command === undefined) throw new Error(`Run command is not available: ${runId}`);
    const acquired = await this.runs.acquireLease({
      bookId: command.bookId,
      ownerId: command.ownerId,
      expiresAt: addSeconds(command.now, 300),
      heartbeatAt: command.now,
    });
    if (!acquired) {
      throw new Error('The book already has an active writing lease.');
    }

    await this.runs.updateStatus(runId, 'running');
    await this.emitPersistent(runId, 'run.started', {
      runId,
      intent: command.intent,
      status: 'running',
    });
    const steps = await this.runs.listSteps(runId);
    try {
      for (const step of steps) {
        if (this.cancelRequests.has(runId)) {
          await this.finishCancelled(command, step);
          return;
        }
        await this.executeStep(command, step);
      }
      await this.runs.updateStatus(runId, 'awaiting_author');
      await this.emitPersistent(runId, 'run.awaiting_author', { runId });
    } catch (error) {
      const cancelled = this.cancelRequests.has(runId) || isCancelled(error);
      await this.runs.updateStatus(runId, cancelled ? 'cancelled' : 'failed', {
        code: cancelled ? 'CANCELLED' : 'RUN_FAILED',
        message: error instanceof Error ? error.message : 'Run failed.',
      });
      await this.emitPersistent(runId, cancelled ? 'run.cancelled' : 'run.failed', {
        runId,
        error: error instanceof Error ? error.message : 'Run failed.',
      });
    } finally {
      await this.runs.releaseLease(command.bookId, command.ownerId);
      this.commands.delete(runId);
      this.cancelRequests.delete(runId);
      this.activeCalls.delete(runId);
    }
  }

  cancel(runId: StableId): boolean {
    this.cancelRequests.add(runId);
    const active = this.activeCalls.get(runId);
    if (!active) return true;
    active.controller.abort();
    if (active.callId !== null) active.provider.cancel(active.callId);
    return true;
  }

  private async executeStep(command: AgentRunCommand, step: RunStepRecord): Promise<void> {
    const startedAt = this.now();
    await this.runs.updateStep(step.id, {
      status: 'running',
      attempt: step.attempt + 1,
      startedAt,
      updatedAt: startedAt,
    });
    await this.emitPersistent(command.runId, 'step.started', {
      runId: command.runId,
      stepId: step.id,
      name: step.name,
    });

    if (step.name === 'build_context') {
      await this.completeStep(command.runId, step, startedAt);
      return;
    }

    const artifactKind = artifactKindFor(command.intent);
    const controller = new AbortController();
    this.activeCalls.set(command.runId, { provider: command.provider, callId: null, controller });
    const callId = parseStableId(`call_${command.runId}_${step.sequence}_${step.attempt + 1}`);
    await this.runs.reserveModelCall({
      id: callId,
      runId: command.runId,
      stepId: step.id,
      provider: command.providerName,
      model: command.model,
      status: 'reserved',
      inputTokens: null,
      outputTokens: null,
      usageKind: 'unknown',
      error: null,
      createdAt: startedAt,
      completedAt: null,
    });

    const chunks: string[] = [];
    let artifactRevision = 0;
    let lastSnapshotLength = 0;
    try {
      for await (const chunk of command.provider.streamText({
        input: command.modelInput,
        requestId: callId,
        signal: controller.signal,
      })) {
        this.activeCalls.set(command.runId, {
          provider: command.provider,
          callId: chunk.callId,
          controller,
        });
        chunks.push(chunk.text);
        this.events.publish({
          runId: command.runId,
          event: 'output.delta',
          data: { runId: command.runId, artifactId: `artifact_${command.runId}`, text: chunk.text },
        });
        const content = chunks.join('');
        const threshold = command.snapshotEveryCharacters ?? 120;
        if (content.length - lastSnapshotLength >= threshold) {
          artifactRevision += 1;
          await this.saveArtifact(command, artifactKind, artifactRevision, content, false);
          lastSnapshotLength = content.length;
        }
      }
      const content = chunks.join('');
      artifactRevision += 1;
      const artifact = await this.saveArtifact(
        command,
        artifactKind,
        artifactRevision,
        content,
        true,
      );
      await this.runs.updateModelCall(callId, { status: 'completed', completedAt: this.now() });
      await this.runs.updateStep(step.id, {
        status: 'completed',
        artifactId: artifact.id,
        completedAt: this.now(),
        updatedAt: this.now(),
      });
      await this.emitPersistent(command.runId, 'step.completed', {
        runId: command.runId,
        stepId: step.id,
        name: step.name,
        status: 'completed',
      });
    } catch (error) {
      await this.runs.updateModelCall(callId, {
        status: isCancelled(error) ? 'unknown' : 'failed',
        error,
        completedAt: this.now(),
      });
      const content = chunks.join('');
      if (content.length > 0) {
        await this.saveArtifact(command, artifactKind, artifactRevision + 1, content, false);
      }
      throw error;
    }
  }

  private async completeStep(
    runId: StableId,
    step: RunStepRecord,
    now: IsoUtcDateTime,
  ): Promise<void> {
    await this.runs.updateStep(step.id, { status: 'completed', completedAt: now, updatedAt: now });
    await this.emitPersistent(runId, 'step.completed', {
      runId,
      stepId: step.id,
      name: step.name,
      status: 'completed',
    });
  }

  private async finishCancelled(command: AgentRunCommand, step: RunStepRecord): Promise<void> {
    await this.runs.updateStep(step.id, {
      status: 'failed',
      error: { code: 'CANCELLED' },
      updatedAt: this.now(),
    });
    await this.runs.updateStatus(command.runId, 'cancelled');
    await this.emitPersistent(command.runId, 'run.cancelled', { runId: command.runId });
    await this.runs.releaseLease(command.bookId, command.ownerId);
    this.commands.delete(command.runId);
    this.cancelRequests.delete(command.runId);
  }

  private async saveArtifact(
    command: AgentRunCommand,
    kind: RunArtifactKind,
    revision: number,
    content: string,
    complete: boolean,
  ) {
    const artifact = {
      id: parseStableId(`artifact_${command.runId}_${revision}`),
      runId: command.runId,
      kind,
      revision,
      content,
      contentHash: parseContentHash(hash(content)),
      complete,
      createdAt: this.now(),
    };
    await this.runs.saveArtifact(artifact);
    this.events.publish({
      runId: command.runId,
      event: 'output.snapshot',
      data: { runId: command.runId, artifactId: artifact.id, revision, complete },
    });
    await this.emitPersistent(command.runId, 'output.snapshot', {
      runId: command.runId,
      artifactId: artifact.id,
      revision,
      complete,
    });
    return artifact;
  }

  private async emitPersistent(
    runId: StableId,
    eventType: string,
    payload: unknown,
  ): Promise<void> {
    const event = await this.runs.appendEvent({ runId, eventType, payload, createdAt: this.now() });
    this.events.publish(event);
  }
}

function artifactKindFor(intent: RunIntent): RunArtifactKind {
  if (intent.startsWith('plan_')) return 'proposal';
  if (intent === 'draft_chapter') return 'draft_candidate';
  if (intent === 'review_chapter') return 'review';
  return 'revision_candidate';
}

function isCancelled(error: unknown): boolean {
  return (error as ModelProviderError | undefined)?.code === 'CANCELLED';
}

function addSeconds(value: IsoUtcDateTime, seconds: number): IsoUtcDateTime {
  return parseUtcDateTime(new Date(Date.parse(value) + seconds * 1000).toISOString());
}

function hash(value: string): string {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;
}
