import type { StableId } from '@dreamstory/contracts';

export type AgentToolName =
  | 'read_plan'
  | 'read_chapter'
  | 'get_entity_state'
  | 'search_story'
  | 'save_plan_proposal'
  | 'append_draft_candidate'
  | 'save_review'
  | 'propose_fact_change';

export type ToolWriteKind = 'read' | 'candidate';

export interface ToolInvocationContext {
  runId: StableId;
  bookId: StableId;
  authorizedChapterNumbers: readonly number[];
}

export interface ToolInvocation {
  tool: AgentToolName;
  runId: StableId;
  bookId: StableId;
  chapterNumber?: number;
}

const TOOL_KINDS: Readonly<Record<AgentToolName, ToolWriteKind>> = {
  read_plan: 'read',
  read_chapter: 'read',
  get_entity_state: 'read',
  search_story: 'read',
  save_plan_proposal: 'candidate',
  append_draft_candidate: 'candidate',
  save_review: 'candidate',
  propose_fact_change: 'candidate',
};

export class ToolPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolPolicyError';
  }
}

export function assertToolAllowed(
  context: ToolInvocationContext,
  invocation: ToolInvocation,
): ToolWriteKind {
  if (invocation.runId !== context.runId) {
    throw new ToolPolicyError('The tool invocation belongs to another run.');
  }
  if (invocation.bookId !== context.bookId) {
    throw new ToolPolicyError('The tool invocation belongs to another book.');
  }
  if (
    invocation.chapterNumber !== undefined &&
    !context.authorizedChapterNumbers.includes(invocation.chapterNumber)
  ) {
    throw new ToolPolicyError('The tool invocation exceeds the authorized chapter scope.');
  }
  return TOOL_KINDS[invocation.tool];
}

export function isAuthoritativeTool(tool: string): boolean {
  return tool === 'accept_proposal' || tool === 'accept_fact' || tool === 'finalize_chapter';
}

export function listModelTools(): readonly AgentToolName[] {
  return Object.keys(TOOL_KINDS) as AgentToolName[];
}
