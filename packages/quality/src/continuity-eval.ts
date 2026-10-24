export interface ContinuityStateChange {
  entityId: string;
  field: string;
  value: string;
}

export interface ContinuityChapterFixture {
  chapterNumber: number;
  storyDay: number;
  text: string;
  stateChanges: readonly ContinuityStateChange[];
  events: readonly { id: string; kind: 'planted' | 'resolved' }[];
}

export interface ContinuitySecretFixture {
  text: string;
  revealChapter: number;
}

export interface ContinuitySampleFixture {
  chapters: readonly ContinuityChapterFixture[];
  secrets: readonly ContinuitySecretFixture[];
}

export interface ContinuityEvalReport {
  chapterCount: number;
  recall: readonly { query: string; chapters: readonly number[] }[];
  stateChecks: readonly { chapter: number; entityId: string; field: string; value: string }[];
  timelineIssues: readonly string[];
  leakageIssues: readonly { secret: string; chapter: number }[];
  passed: boolean;
}

export function evaluateContinuitySample(sample: ContinuitySampleFixture): ContinuityEvalReport {
  const chapters = [...sample.chapters].sort((left, right) => left.chapterNumber - right.chapterNumber);
  const timelineIssues: string[] = [];
  const leakageIssues: { secret: string; chapter: number }[] = [];
  const state = new Map<string, string>();
  const stateChecks: { chapter: number; entityId: string; field: string; value: string }[] = [];
  const recall = new Map<string, number[]>();
  let previousDay = Number.NEGATIVE_INFINITY;
  const openEvents = new Set<string>();

  for (const chapter of chapters) {
    if (chapter.storyDay < previousDay) {
      timelineIssues.push(`chapter ${chapter.chapterNumber} moves backward in story time`);
    }
    previousDay = chapter.storyDay;
    for (const change of chapter.stateChanges) {
      state.set(`${change.entityId}:${change.field}`, change.value);
      stateChecks.push({
        chapter: chapter.chapterNumber,
        entityId: change.entityId,
        field: change.field,
        value: change.value,
      });
    }
    for (const event of chapter.events) {
      if (event.kind === 'planted') {
        if (openEvents.has(event.id)) timelineIssues.push(`event ${event.id} planted twice`);
        openEvents.add(event.id);
      } else if (!openEvents.delete(event.id)) {
        timelineIssues.push(`event ${event.id} resolved before planting`);
      }
    }
    for (const secret of sample.secrets) {
      if (chapter.chapterNumber < secret.revealChapter && chapter.text.includes(secret.text)) {
        leakageIssues.push({ secret: secret.text, chapter: chapter.chapterNumber });
      }
    }
    for (const query of collectTerms(chapter)) {
      const matches = recall.get(query) ?? [];
      matches.push(chapter.chapterNumber);
      recall.set(query, matches);
    }
  }

  return {
    chapterCount: chapters.length,
    recall: [...recall.entries()].map(([query, matchedChapters]) => ({
      query,
      chapters: matchedChapters,
    })),
    stateChecks,
    timelineIssues,
    leakageIssues,
    passed:
      chapters.length >= 20 &&
      timelineIssues.length === 0 &&
      leakageIssues.length === 0 &&
      openEvents.size === 0,
  };
}

export function stateAt(
  sample: ContinuitySampleFixture,
  chapterNumber: number,
  entityId: string,
  field: string,
): string | null {
  const state = new Map<string, string>();
  for (const chapter of [...sample.chapters].sort((left, right) => left.chapterNumber - right.chapterNumber)) {
    if (chapter.chapterNumber > chapterNumber) break;
    for (const change of chapter.stateChanges) {
      state.set(`${change.entityId}:${change.field}`, change.value);
    }
  }
  return state.get(`${entityId}:${field}`) ?? null;
}

function collectTerms(chapter: ContinuityChapterFixture): readonly string[] {
  return chapter.stateChanges.map((change) => change.value);
}
