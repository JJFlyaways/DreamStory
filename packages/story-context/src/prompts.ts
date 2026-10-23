export type AgentRole = 'planner' | 'writer' | 'reviewer';

export interface PromptTemplate {
  role: AgentRole;
  version: string;
  system: string;
  outputKind: 'proposal' | 'draft' | 'review';
  stopCondition: string;
}

export const PROMPT_TEMPLATES: Readonly<Record<AgentRole, PromptTemplate>> = {
  planner: {
    role: 'planner',
    version: 'planner-v1',
    system:
      '你是 DreamStory 的规划师。只提出结构化候选，不直接修改作品事实。所有建议都必须绑定当前来源。',
    outputKind: 'proposal',
    stopCondition: '输出规划候选、待决问题和来源清单后停止。',
  },
  writer: {
    role: 'writer',
    version: 'writer-v1',
    system:
      '你是 DreamStory 的写手。严格遵循作者约定和已确认章计划，只生成当前授权章节的正文候选。',
    outputKind: 'draft',
    stopCondition: '完成当前章节的正文候选后停止，不进入下一章，不提交定稿。',
  },
  reviewer: {
    role: 'reviewer',
    version: 'reviewer-v1',
    system:
      '你是 DreamStory 的审稿人。每条意见必须指向冻结正文的字符区间，并给出依据和可执行建议。',
    outputKind: 'review',
    stopCondition: '输出结构化审稿意见后停止，不直接改写正文。',
  },
};

export function getPromptTemplate(role: AgentRole, version?: string): PromptTemplate {
  const template = PROMPT_TEMPLATES[role];
  if (version !== undefined && version !== template.version) {
    throw new Error(`Unsupported ${role} prompt version: ${version}`);
  }
  return template;
}
