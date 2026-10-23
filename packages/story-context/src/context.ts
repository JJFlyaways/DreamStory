import { createHash } from 'node:crypto';

import {
  parseContentHash,
  parseSourceFingerprint,
  type SourceManifest,
  type SourceRef,
} from '@dreamstory/contracts';
import type {
  BookRecord,
  ChapterRecord,
  DraftVersionRecord,
  PlanNodeRecord,
} from '@dreamstory/application';

import { getPromptTemplate, type AgentRole } from './prompts.js';

export interface ContextBuildInput {
  book: BookRecord;
  plans: readonly PlanNodeRecord[];
  chapters: readonly ChapterRecord[];
  draftsByChapter: ReadonlyMap<string, DraftVersionRecord | null>;
  targetPlanId: string;
  targetChapterNumber?: number;
  role: AgentRole;
  modelProfileId: string;
  maxInputTokens: number;
  promptVersion?: string;
}

export interface ContextBlock {
  kind: 'conventions' | 'plan' | 'previous_chapter' | 'active_plan' | 'prompt';
  label: string;
  text: string;
  priority: number;
  estimatedTokens: number;
  source: SourceRef;
  included: boolean;
  reason: string;
}

export interface ContextPreview {
  role: AgentRole;
  promptVersion: string;
  modelProfileId: string;
  contextText: string;
  blocks: readonly ContextBlock[];
  sourceManifest: SourceManifest;
  sourceFingerprint: string;
  executionFingerprint: string;
  estimatedInputTokens: number;
  budget: number;
}

export function buildChapterContext(input: ContextBuildInput): ContextPreview {
  if (!Number.isSafeInteger(input.maxInputTokens) || input.maxInputTokens <= 0) {
    throw new Error('maxInputTokens must be a positive integer.');
  }

  const activePlan = input.plans.find((plan) => plan.id === input.targetPlanId);
  if (activePlan === undefined) {
    throw new Error('The target plan does not exist.');
  }
  const prompt = getPromptTemplate(input.role, input.promptVersion);
  const promptVersion = prompt.version;
  const blocks = createBlocks(input, activePlan, prompt);
  let remaining = input.maxInputTokens;
  const selected: ContextBlock[] = [];
  const resolvedBlocks = blocks.map((block) => {
    if (block.estimatedTokens <= remaining) {
      remaining -= block.estimatedTokens;
      const selectedBlock = {
        ...block,
        included: true,
        reason: 'within budget and required for this task',
      };
      selected.push(selectedBlock);
      return selectedBlock;
    }
    return { ...block, included: false, reason: 'trimmed by input budget' };
  });

  const sourceRefs = resolvedBlocks.map((block) => block.source);
  const sourceFingerprint = fingerprint(sourceRefs);
  const executionFingerprint = fingerprint([
    ...sourceRefs,
    sourceRef('author_fact', input.modelProfileId, null, `prompt:${promptVersion}:${input.role}`),
  ]);
  const contextText = resolvedBlocks
    .filter((block) => block.included)
    .map((block) => `## ${block.label}\n${block.text}`)
    .join('\n\n');

  return {
    role: input.role,
    promptVersion,
    modelProfileId: input.modelProfileId,
    contextText,
    blocks: resolvedBlocks,
    sourceManifest: {
      sources: resolvedBlocks.map((block) => ({
        source: block.source,
        included: block.included,
        reason: block.reason,
      })),
      sourceFingerprint: parseSourceFingerprint(sourceFingerprint),
    },
    sourceFingerprint,
    executionFingerprint,
    estimatedInputTokens: resolvedBlocks
      .filter((block) => block.included)
      .reduce((sum, block) => sum + block.estimatedTokens, 0),
    budget: input.maxInputTokens,
  };
}

function createBlocks(
  input: ContextBuildInput,
  activePlan: PlanNodeRecord,
  prompt: ReturnType<typeof getPromptTemplate>,
): ContextBlock[] {
  const blocks: ContextBlock[] = [];
  const conventionsText = JSON.stringify(input.book.conventions, null, 2);
  blocks.push({
    kind: 'conventions',
    label: '作者创作约定',
    text: conventionsText,
    priority: 100,
    estimatedTokens: estimateTokens(conventionsText),
    source: sourceRef('author_fact', input.book.id, input.book.bookRevision, conventionsText),
    included: false,
    reason: '',
  });

  const planText = JSON.stringify(activePlan.content, null, 2);
  blocks.push({
    kind: 'active_plan',
    label: '当前确认章计划',
    text: planText,
    priority: 100,
    estimatedTokens: estimateTokens(planText),
    source: sourceRef('plan', activePlan.id, activePlan.version, planText),
    included: false,
    reason: '',
  });

  const chapterNumber =
    input.targetChapterNumber ?? findChapterNumber(input.chapters, activePlan.id);
  if (chapterNumber !== undefined && chapterNumber > 1) {
    const previousChapter = input.chapters.find(
      (chapter) => chapter.chapterNumber === chapterNumber - 1,
    );
    const previousDraft = previousChapter ? input.draftsByChapter.get(previousChapter.id) : null;
    if (previousChapter && previousDraft) {
      blocks.push({
        kind: 'previous_chapter',
        label: `上一章：${previousChapter.displayTitle}`,
        text: previousDraft.content,
        priority: 80,
        estimatedTokens: estimateTokens(previousDraft.content),
        source: sourceRef(
          'draft',
          previousDraft.id,
          previousDraft.revision,
          previousDraft.content,
          chapterNumber - 1,
        ),
        included: false,
        reason: '',
      });
    }
  }

  blocks.push({
    kind: 'prompt',
    label: '任务边界',
    text: `${prompt.system}\n停止条件：${prompt.stopCondition}`,
    priority: 100,
    estimatedTokens: estimateTokens(prompt.system) + estimateTokens(prompt.stopCondition),
    source: sourceRef('author_fact', `prompt_${prompt.version}`, null, prompt.system),
    included: false,
    reason: '',
  });
  return blocks.sort((left, right) => right.priority - left.priority);
}

function findChapterNumber(chapters: readonly ChapterRecord[], planId: string): number | undefined {
  return chapters.find((chapter) => chapter.planNodeId === planId)?.chapterNumber;
}

function sourceRef(
  kind: SourceRef['kind'],
  id: string,
  version: number | null,
  text: string,
  chapterNumber?: number,
): SourceRef {
  return {
    kind,
    id: id as SourceRef['id'],
    version,
    contentHash: parseContentHash(hash(text)),
    ...(chapterNumber === undefined ? {} : { chapterNumber }),
  };
}

function fingerprint(sources: readonly SourceRef[]): string {
  return hash(JSON.stringify(sources));
}

function hash(value: string): string {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(Array.from(value).length / 4));
}
