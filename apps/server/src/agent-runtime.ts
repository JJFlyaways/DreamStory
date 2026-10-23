import { randomUUID } from 'node:crypto';

import { AgentRunCoordinator, type RunEventHub, type RunRecord } from '@dreamstory/application';
import {
  FakeModelProvider,
  OpenAICompatibleProvider,
  type ModelProvider,
} from '@dreamstory/model-gateway';
import {
  parseStableId,
  parseUtcDateTime,
  type IsoUtcDateTime,
  type RunIntent,
  type ServerConfig,
  type StableId,
} from '@dreamstory/contracts';
import type {
  RunArtifactRecord,
  RunEventRecord,
  RunPersistenceRepository,
} from '@dreamstory/application';

import type { BookProjectManager } from './server.js';

export interface StartAgentRunInput {
  intent: RunIntent;
  expectedBookRevision: number;
  targetPlanId: StableId;
  targetChapterNumber?: number;
  modelProfileId: StableId;
  scope: unknown;
}

interface RunHandle {
  bookId: string;
  repository: RunPersistenceRepository;
  coordinator: AgentRunCoordinator;
  eventHub: RunEventHub;
}

export class AgentRuntime {
  private readonly handles = new Map<string, RunHandle>();

  constructor(
    private readonly projects: BookProjectManager,
    private readonly config: ServerConfig,
  ) {}

  async start(bookId: StableId, input: StartAgentRunInput): Promise<RunRecord> {
    const book = await this.projects.getBook(bookId);
    if (book === null) throw new Error('The book does not exist.');
    if (book.bookRevision !== input.expectedBookRevision) {
      throw new Error('The book revision has changed.');
    }
    const profile = this.config.modelProfiles.find((item) => item.id === input.modelProfileId);
    if (profile === undefined) {
      throw new Error(`Model profile not found: ${input.modelProfileId}`);
    }
    const role = intentRole(input.intent);
    const context = await this.projects.previewContext(bookId, {
      role,
      targetPlanId: input.targetPlanId,
      ...(input.targetChapterNumber === undefined
        ? {}
        : { targetChapterNumber: input.targetChapterNumber }),
      modelProfileId: profile.id,
      maxInputTokens: 12_000,
    });
    const repository = await this.projects.runRepository(bookId);
    const provider = createProvider(profile);
    const runId = parseStableId(`run_${randomUUID()}`);
    const ownerId = parseStableId(`worker_${randomUUID()}`);
    const coordinator = new AgentRunCoordinator(repository);
    const command = {
      runId,
      bookId,
      ownerId,
      intent: input.intent,
      scope: mergeRunScope(input.scope, {
        modelProfileId: input.modelProfileId,
        targetPlanId: input.targetPlanId,
        ...(input.targetChapterNumber === undefined
          ? {}
          : { targetChapterNumber: input.targetChapterNumber }),
      }),
      inputSnapshot: {
        id: parseStableId(`snapshot_${runId}`),
        bookId,
        manifest: context.sourceManifest,
        contextText: context.contextText,
        sourceFingerprint: context.sourceManifest.sourceFingerprint,
        executionFingerprint: context.executionFingerprint,
        promptVersion: context.promptVersion,
        createdAt: nowUtc(),
      },
      provider,
      providerName: profile.protocol,
      model: profile.model,
      modelInput: context.contextText,
      now: nowUtc(),
      snapshotEveryCharacters: 120,
    } as const;
    const run = await coordinator.start(command);
    this.handles.set(runId, {
      bookId,
      repository,
      coordinator,
      eventHub: coordinator.eventHub,
    });
    void coordinator.execute(runId);
    return run;
  }

  async resume(
    bookId: StableId,
    runId: StableId,
    expectedBookRevision: number,
    retryUnknownModelCall: boolean,
  ): Promise<RunRecord> {
    const book = await this.projects.getBook(bookId);
    if (book === null) throw new Error('The book does not exist.');
    if (book.bookRevision !== expectedBookRevision)
      throw new Error('The book revision has changed.');
    const repository = await this.projects.runRepository(bookId);
    const run = await repository.get(runId);
    if (run === null) throw new Error('The run does not exist.');
    const snapshot = run.inputSnapshotId
      ? await repository.getInputSnapshot(run.inputSnapshotId)
      : null;
    if (snapshot === null) throw new Error('The run input snapshot is missing.');
    const scope = isRecord(run.scope) ? run.scope : {};
    const modelProfileId = parseStableId(
      requiredScopeString(scope['modelProfileId'], 'modelProfileId'),
    );
    const profile = this.config.modelProfiles.find((item) => item.id === modelProfileId);
    if (profile === undefined) throw new Error(`Model profile not found: ${modelProfileId}`);
    const coordinator = new AgentRunCoordinator(repository);
    const command = {
      runId,
      bookId,
      ownerId: parseStableId(`worker_${randomUUID()}`),
      intent: run.intent,
      scope: run.scope,
      inputSnapshot: snapshot,
      provider: createProvider(profile),
      providerName: profile.protocol,
      model: profile.model,
      modelInput: snapshot.contextText,
      now: nowUtc(),
      snapshotEveryCharacters: 120,
    } as const;
    this.handles.set(runId, { bookId, repository, coordinator, eventHub: coordinator.eventHub });
    void coordinator.resume(command, retryUnknownModelCall);
    return run;
  }

  async getRun(bookId: StableId, runId: StableId): Promise<RunRecord | null> {
    return (await this.projects.runRepository(bookId)).get(runId);
  }

  async listRuns(bookId: StableId): Promise<readonly RunRecord[]> {
    return (await this.projects.runRepository(bookId)).list(bookId);
  }

  async listArtifacts(bookId: StableId, runId: StableId): Promise<readonly RunArtifactRecord[]> {
    return (await this.projects.runRepository(bookId)).listArtifacts(runId);
  }

  async listEvents(
    bookId: StableId,
    runId: StableId,
    afterSequence = 0,
  ): Promise<readonly RunEventRecord[]> {
    return (await this.projects.runRepository(bookId)).listEvents(runId, afterSequence);
  }

  cancel(runId: StableId): boolean {
    return this.handles.get(runId)?.coordinator.cancel(runId) ?? false;
  }

  subscribe(
    runId: StableId,
    listener: Parameters<RunEventHub['subscribe']>[1],
  ): (() => void) | null {
    return this.handles.get(runId)?.eventHub.subscribe(runId, listener) ?? null;
  }
}

function createProvider(profile: ServerConfig['modelProfiles'][number]): ModelProvider {
  if (profile.protocol === 'fake') {
    return new FakeModelProvider({ responseText: '这是一个可审阅的假模型正文候选。' });
  }
  if (profile.protocol !== 'openai-compatible') {
    throw new Error(`Unsupported model protocol: ${profile.protocol}`);
  }
  const credentialName = profile.credentialRef?.name;
  const apiKey = credentialName ? configValue(credentialName) : undefined;
  return new OpenAICompatibleProvider({
    endpoint: profile.endpoint,
    model: profile.model,
    ...(apiKey === undefined ? {} : { apiKey }),
  });
}

function configValue(name: string): string | undefined {
  return process.env[name];
}

function intentRole(intent: string): 'planner' | 'writer' | 'reviewer' {
  if (intent.startsWith('plan_')) return 'planner';
  if (intent === 'review_chapter') return 'reviewer';
  return 'writer';
}

function nowUtc(): IsoUtcDateTime {
  return parseUtcDateTime(new Date().toISOString());
}

function mergeRunScope(scope: unknown, additions: Record<string, unknown>): unknown {
  return { ...(isRecord(scope) ? scope : {}), ...additions };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredScopeString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '')
    throw new Error(`${name} is missing from run scope.`);
  return value;
}
