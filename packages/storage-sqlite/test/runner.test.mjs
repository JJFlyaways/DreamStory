import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { AgentRunCoordinator } from '../../application/dist/index.js';
import { FakeModelProvider } from '../../model-gateway/dist/index.js';
import { initializeProjectDatabase } from '../dist/index.js';

const timestamp = '2026-10-23T12:00:00.000Z';

async function createDirectory() {
  return mkdtemp(join(tmpdir(), 'dreamstory-runner-'));
}

function snapshot(id = 'snapshot_runner_01') {
  return {
    id,
    bookId: 'book_01',
    manifest: { sources: [], sourceFingerprint: `sha256:${'a'.repeat(64)}` },
    contextText: 'writer context',
    sourceFingerprint: `sha256:${'a'.repeat(64)}`,
    executionFingerprint: `sha256:${'b'.repeat(64)}`,
    promptVersion: 'writer-v1',
    createdAt: timestamp,
  };
}

function command(provider, runId = 'run_runner_01') {
  return {
    runId,
    bookId: 'book_01',
    ownerId: 'worker_runner_01',
    intent: 'draft_chapter',
    scope: { chapterNumbers: [1] },
    inputSnapshot: snapshot(`snapshot_${runId}`),
    provider,
    providerName: 'fake',
    model: 'fake-writer',
    modelInput: 'write the chapter candidate',
    now: timestamp,
    snapshotEveryCharacters: 1,
  };
}

test('runs deterministic steps, persists snapshots, and stops for author review', async () => {
  const directory = await createDirectory();
  try {
    const initialized = await initializeProjectDatabase(directory);
    const provider = new FakeModelProvider({ chunks: ['第一段', '第二段'] });
    const coordinator = new AgentRunCoordinator(
      initialized.repositories.runs,
      undefined,
      () => timestamp,
    );
    const result = await coordinator.run(command(provider));

    assert.equal(result.status, 'awaiting_author');
    const steps = await initialized.repositories.runs.listSteps(result.id);
    assert.deepEqual(
      steps.map((step) => step.status),
      ['completed', 'completed'],
    );
    const artifacts = await initialized.repositories.runs.listArtifacts(result.id);
    assert.equal(artifacts[0].complete, true);
    assert.equal(artifacts[0].content, '第一段第二段');
    assert.equal((await initialized.repositories.runs.listEvents(result.id)).length >= 4, true);
    assert.equal(
      (await initialized.repositories.runs.getModelCall('call_run_runner_01_1_1')).status,
      'completed',
    );
    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('cancels a streaming run and preserves the partial candidate', async () => {
  const directory = await createDirectory();
  try {
    const initialized = await initializeProjectDatabase(directory);
    const provider = new FakeModelProvider({ chunks: ['第一段', '第二段'], delayMs: 5 });
    const coordinator = new AgentRunCoordinator(
      initialized.repositories.runs,
      undefined,
      () => timestamp,
    );
    const runCommand = command(provider, 'run_runner_cancel');
    await coordinator.start(runCommand);
    const execution = coordinator.execute(runCommand.runId);
    await new Promise((resolve) => globalThis.setTimeout(resolve, 8));
    coordinator.cancel(runCommand.runId);
    await execution;

    const result = await initialized.repositories.runs.get(runCommand.runId);
    assert.equal(result.status, 'cancelled');
    const artifacts = await initialized.repositories.runs.listArtifacts(runCommand.runId);
    assert.equal(artifacts.length >= 1, true);
    assert.equal(artifacts[0].complete, false);
    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
