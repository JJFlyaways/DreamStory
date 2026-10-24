import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateContinuitySample, stateAt } from '../dist/index.js';

function buildSample() {
  return {
    chapters: Array.from({ length: 20 }, (_, index) => {
      const chapterNumber = index + 1;
      return {
        chapterNumber,
        storyDay: chapterNumber,
        text:
          chapterNumber >= 12
            ? `第${chapterNumber}章，沈默者留下新的线索。`
            : `第${chapterNumber}章，主角继续追查。`,
        stateChanges:
          chapterNumber === 1
            ? [{ entityId: 'mira', field: 'location', value: '雾港' }]
            : chapterNumber === 8
              ? [{ entityId: 'mira', field: 'location', value: '北站' }]
              : chapterNumber === 15
                ? [{ entityId: 'mira', field: 'location', value: '旧塔' }]
                : [],
        events:
          chapterNumber === 2
            ? [{ id: 'old-postmark', kind: 'planted' }]
            : chapterNumber === 17
              ? [{ id: 'old-postmark', kind: 'resolved' }]
              : [],
      };
    }),
    secrets: [{ text: '沈默者', revealChapter: 12 }],
  };
}

test('evaluates a deliberate twenty-chapter continuity sample', () => {
  const sample = buildSample();
  const report = evaluateContinuitySample(sample);

  assert.equal(report.chapterCount, 20);
  assert.equal(report.passed, true);
  assert.deepEqual(report.timelineIssues, []);
  assert.deepEqual(report.leakageIssues, []);
  assert.equal(stateAt(sample, 7, 'mira', 'location'), '雾港');
  assert.equal(stateAt(sample, 9, 'mira', 'location'), '北站');
  assert.equal(stateAt(sample, 20, 'mira', 'location'), '旧塔');
  assert.deepEqual(
    report.recall.find((item) => item.query === '北站')?.chapters,
    [8],
  );
});

test('detects future information leakage and unresolved events', () => {
  const sample = buildSample();
  sample.chapters[5].text = '第六章，沈默者提前出现。';
  sample.chapters[16].events = [];
  const report = evaluateContinuitySample(sample);

  assert.equal(report.passed, false);
  assert.deepEqual(report.leakageIssues, [{ secret: '沈默者', chapter: 6 }]);
  assert.deepEqual(report.timelineIssues, []);
  assert.equal(report.passed, false);
});
