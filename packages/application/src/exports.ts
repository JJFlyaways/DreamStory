import type {
  BookRecord,
  ChapterRecord,
  DraftVersionRecord,
  PlanNodeRecord,
} from './repositories.js';

export type ExportFormat = 'markdown' | 'txt';

export interface BookExportInput {
  book: BookRecord;
  plans: readonly PlanNodeRecord[];
  chapters: readonly ChapterRecord[];
  draftsByChapter: ReadonlyMap<string, DraftVersionRecord | null>;
}

export function renderBookExport(input: BookExportInput, format: ExportFormat): string {
  return format === 'markdown' ? renderMarkdown(input) : renderText(input);
}

function renderMarkdown(input: BookExportInput): string {
  const lines = [`# ${input.book.title}`, '', `> ${input.book.genre} · ${input.book.language}`, ''];
  lines.push('## 创作约定', '');
  lines.push(renderConventions(input.book.conventions), '');
  lines.push('## 规划', '');
  for (const plan of input.plans) {
    const level = Math.min(planDepth(plan, input.plans) + 2, 6);
    lines.push(`${'#'.repeat(level)} ${plan.content.title}`);
    lines.push('', plan.content.goal, '');
  }
  lines.push('## 正文', '');
  for (const chapter of input.chapters) {
    lines.push(`### ${chapter.displayTitle}`, '');
    const draft = input.draftsByChapter.get(chapter.id);
    lines.push(draft?.content ?? '（尚无草稿）', '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function renderText(input: BookExportInput): string {
  const lines = [input.book.title, `${input.book.genre} · ${input.book.language}`, ''];
  lines.push('【创作约定】', renderConventions(input.book.conventions), '');
  lines.push('【规划】');
  for (const plan of input.plans) {
    lines.push(`${'  '.repeat(planDepth(plan, input.plans))}${plan.content.title}`);
    lines.push(`${'  '.repeat(planDepth(plan, input.plans) + 1)}${plan.content.goal}`);
  }
  lines.push('', '【正文】');
  for (const chapter of input.chapters) {
    lines.push('', chapter.displayTitle);
    const draft = input.draftsByChapter.get(chapter.id);
    lines.push(draft?.content ?? '（尚无草稿）');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function renderConventions(conventions: Record<string, unknown>): string {
  const entries = Object.entries(conventions);
  if (entries.length === 0) {
    return '暂无已确认创作约定。';
  }
  return entries.map(([key, value]) => `- ${key}: ${String(value)}`).join('\n');
}

function planDepth(plan: PlanNodeRecord, plans: readonly PlanNodeRecord[]): number {
  let depth = 0;
  let parentId = plan.parentId;
  const seen = new Set<string>();
  while (parentId !== null && !seen.has(parentId)) {
    seen.add(parentId);
    depth += 1;
    parentId = plans.find((candidate) => candidate.id === parentId)?.parentId ?? null;
  }
  return depth;
}
