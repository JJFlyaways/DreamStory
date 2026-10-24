import { useEffect, useState } from 'react';

import { subscribeRunEvents } from './api';
import type {
  ModelProfile,
  ReviewDisposition,
  ReviewFinding,
  ReviewRecord,
  RunArtifact,
  RunEventRecord,
  RunRecord,
} from './types';

const activeRunStatuses = new Set(['queued', 'running']);

const runIntentLabels: Record<string, string> = {
  draft_chapter: '生成候选正文',
  review_chapter: '审阅当前草稿',
  revise_chapter: '生成修订候选',
};

const stepLabels: Record<string, string> = {
  build_context: '读取工作上下文',
  generate_draft: '生成候选正文',
  generate_review: '整理审稿意见',
  generate_revision: '生成修订候选',
};

type StepState = 'pending' | 'running' | 'completed';

export function HarnessRunPanel({
  bookId,
  profiles,
  selectedProfileId,
  onSelectProfile,
  run,
  artifacts,
  canReview,
  onStart,
  onStartReview,
  onCancel,
  onApplyCandidate,
  onFinalize,
  isStarting,
  isReviewing,
  isCancelling,
  isApplying,
  isFinalizing,
  error,
}: {
  bookId: string;
  profiles: ModelProfile[];
  selectedProfileId: string;
  onSelectProfile: (value: string) => void;
  run: RunRecord | null;
  artifacts: RunArtifact[];
  canReview: boolean;
  onStart: () => void;
  onStartReview: () => void;
  onCancel: () => void;
  onApplyCandidate: (artifact: RunArtifact) => void;
  onFinalize: () => void;
  isStarting: boolean;
  isReviewing: boolean;
  isCancelling: boolean;
  isApplying: boolean;
  isFinalizing: boolean;
  error: unknown;
}) {
  const [events, setEvents] = useState<RunEventRecord[]>([]);
  const [streamedOutput, setStreamedOutput] = useState('');
  const candidateArtifacts = artifacts.filter(
    (artifact) => artifact.kind === 'draft_candidate' || artifact.kind === 'revision_candidate',
  );
  const reviewArtifacts = artifacts.filter((artifact) => artifact.kind === 'review');
  const latestCandidate = candidateArtifacts[candidateArtifacts.length - 1] ?? null;
  const latestReview = reviewArtifacts[reviewArtifacts.length - 1] ?? null;
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    latestCandidate?.id ?? null,
  );
  const selectedCandidate =
    candidateArtifacts.find((artifact) => artifact.id === selectedCandidateId) ?? latestCandidate;
  const active = run !== null && activeRunStatuses.has(run.status);

  useEffect(() => {
    setEvents([]);
    setStreamedOutput('');
    setSelectedCandidateId(null);
  }, [run?.id]);

  useEffect(() => {
    if (latestCandidate === null) {
      setSelectedCandidateId(null);
      return;
    }
    setSelectedCandidateId((current) =>
      current !== null && candidateArtifacts.some((artifact) => artifact.id === current)
        ? current
        : latestCandidate.id,
    );
  }, [candidateArtifacts.length, latestCandidate?.id]);

  useEffect(() => {
    if (run === null || !active) return;
    return subscribeRunEvents(bookId, run.id, (event) => {
      if (event.eventType === 'output.delta') {
        const payload = asRecord(event.payload);
        const text = payload?.['text'];
        if (typeof text === 'string') {
          setStreamedOutput((current) => `${current}${text}`.slice(-5_000));
        }
        return;
      }
      setEvents((current) => {
        const key = eventKey(event);
        if (current.some((item) => eventKey(item) === key)) return current;
        return [...current, event].slice(-80);
      });
    });
  }, [active, bookId, run?.id]);

  return (
    <section className="run-panel">
      <div className="run-panel-heading">
        <div>
          <p className="eyebrow">执行流</p>
          <h3>{run ? runIntentLabels[run.intent] ?? run.intent : '候选与审稿'}</h3>
        </div>
        {run && <span className={`run-state run-state-${run.status}`}>{runStateLabel(run.status)}</span>}
      </div>

      <RunTimeline run={run} events={events} />
      {streamedOutput && active && (
        <pre className="run-stream-preview" aria-live="polite">
          {streamedOutput}
        </pre>
      )}

      {profiles.length === 0 ? (
        <p className="muted-copy">尚未配置模型档案。先在服务环境中配置一个 fake 或真实档案。</p>
      ) : (
        <label className="run-profile-label">
          模型档案
          <select
            value={selectedProfileId}
            onChange={(event) => onSelectProfile(event.target.value)}
            disabled={active}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.id} · {profile.protocol}
                {profile.credentialStatus === 'missing' ? '（缺少凭据）' : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="run-actions">
        {!active && (
          <>
            <button
              className="primary-button"
              onClick={onStart}
              disabled={isStarting || profiles.length === 0 || selectedProfileId === ''}
            >
              {isStarting ? '正在排队…' : '生成候选'}
            </button>
            <button
              className="quiet-button"
              onClick={onStartReview}
              disabled={
                isReviewing || !canReview || profiles.length === 0 || selectedProfileId === ''
              }
              title={canReview ? '使用当前完整草稿启动审阅' : '先保存完整草稿'}
            >
              {isReviewing ? '正在审阅…' : '审阅当前草稿'}
            </button>
          </>
        )}
        {active && (
          <button className="quiet-button" onClick={onCancel} disabled={isCancelling}>
            {isCancelling ? '正在取消…' : '取消运行'}
          </button>
        )}
      </div>

      {run && <p className="run-detail">运行 {run.id} · 已尝试 {run.attempt} 次</p>}

      {latestReview && (
        <div className="run-review-output">
          <div className="candidate-meta">
            <span>审稿产物 · v{latestReview.revision}</span>
            <span>{latestReview.complete ? '完整' : '流式中'}</span>
          </div>
          <pre>{latestReview.content || '（暂无审稿文本）'}</pre>
        </div>
      )}

      {selectedCandidate && (
        <div className="candidate-box">
          <div className="candidate-box-heading">
            <div>
              <p className="eyebrow">候选快照</p>
              <div className="candidate-meta">
                <span>
                  {selectedCandidate.kind === 'revision_candidate' ? '修订候选' : '正文候选'} · v
                  {selectedCandidate.revision}
                </span>
                <span>{selectedCandidate.complete ? '完整' : '流式中'}</span>
              </div>
            </div>
            <span className="section-count">{candidateArtifacts.length.toString().padStart(2, '0')}</span>
          </div>
          {candidateArtifacts.length > 1 && (
            <div className="candidate-list" role="list" aria-label="候选快照">
              {candidateArtifacts.map((artifact) => (
                <button
                  className={`candidate-list-item ${artifact.id === selectedCandidate.id ? 'is-active' : ''}`}
                  key={artifact.id}
                  onClick={() => setSelectedCandidateId(artifact.id)}
                >
                  <span>版本 {artifact.revision}</span>
                  <span>{artifact.complete ? '完整' : '生成中'}</span>
                </button>
              ))}
            </div>
          )}
          <pre>{selectedCandidate.content || '（候选正文为空）'}</pre>
          <div className="run-actions">
            <button
              className="quiet-button"
              onClick={() => onApplyCandidate(selectedCandidate)}
              disabled={isApplying || !selectedCandidate.complete}
            >
              {isApplying ? '正在复制…' : '复制为草稿'}
            </button>
            <button
              className="primary-button"
              onClick={onFinalize}
              disabled={isFinalizing || run?.status !== 'awaiting_author'}
            >
              {isFinalizing ? '正在定稿…' : '定稿当前草稿'}
            </button>
          </div>
        </div>
      )}

      {artifacts.length > 0 && <p className="run-detail">已保存 {artifacts.length} 个产物快照</p>}
      {error !== null && error !== undefined && (
        <p className="inline-error">{errorMessage(error)}</p>
      )}
    </section>
  );
}

function RunTimeline({ run, events }: { run: RunRecord | null; events: RunEventRecord[] }) {
  const stepNames = ['build_context', runStepName(run?.intent)];
  return (
    <div className="run-timeline" aria-label="运行步骤">
      {stepNames.map((name) => {
        const started = hasStepEvent(events, 'step.started', name);
        const completed = hasStepEvent(events, 'step.completed', name);
        const state: StepState = completed ? 'completed' : started ? 'running' : 'pending';
        return (
          <div className={`run-step run-step-${state}`} key={name}>
            <span className="run-step-marker" />
            <span className="run-step-label">{stepLabels[name] ?? name}</span>
            <span className="run-step-state">{stepStateLabel(state)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewPanel({
  reviews,
  findings,
  draftId,
  draftContent,
  isLoading,
  isUpdating,
  error,
  onDisposition,
}: {
  reviews: ReviewRecord[];
  findings: ReviewFinding[];
  draftId: string | null;
  draftContent: string;
  isLoading: boolean;
  isUpdating: boolean;
  error: unknown;
  onDisposition: (
    finding: ReviewFinding,
    decision: Exclude<ReviewDisposition, 'open'>,
  ) => void;
}) {
  const latestReview = reviews[reviews.length - 1] ?? null;
  return (
    <section className="review-panel">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">来源检查</p>
          <h3>审稿发现</h3>
        </div>
        <span className="section-count">{findings.length.toString().padStart(2, '0')}</span>
      </div>
      {isLoading && <p className="muted-copy">正在读取审稿证据…</p>}
      {!isLoading && latestReview === null && (
        <p className="muted-copy">完整草稿启动审阅后，审稿发现会出现在这里。</p>
      )}
      {!isLoading && latestReview !== null && findings.length === 0 && (
        <p className="muted-copy">这次审稿没有记录结构化发现。</p>
      )}
      <div className="review-finding-list">
        {findings.map((finding) => (
          <ReviewFindingRow
            draftContent={draftContent}
            draftId={draftId}
            finding={finding}
            isUpdating={isUpdating}
            key={finding.id}
            onDisposition={onDisposition}
          />
        ))}
      </div>
      {error !== null && error !== undefined && (
        <p className="inline-error">{errorMessage(error)}</p>
      )}
    </section>
  );
}

function ReviewFindingRow({
  finding,
  draftId,
  draftContent,
  isUpdating,
  onDisposition,
}: {
  finding: ReviewFinding;
  draftId: string | null;
  draftContent: string;
  isUpdating: boolean;
  onDisposition: (
    finding: ReviewFinding,
    decision: Exclude<ReviewDisposition, 'open'>,
  ) => void;
}) {
  const range = finding.evidence.textRange;
  const characters = Array.from(draftContent);
  const quote = characters.slice(range.start, range.end).join('');
  const sourceCurrent = finding.draftVersionId === draftId;
  return (
    <article className={`review-finding review-finding-${finding.severity}`}>
      <div className="review-finding-heading">
        <span>{finding.kind}</span>
        <span>{finding.severity}</span>
        <span className={sourceCurrent ? 'review-source-current' : 'review-source-stale'}>
          {sourceCurrent ? '来源当前' : '来源已变更'}
        </span>
      </div>
      <p className="review-finding-claim">{finding.claim}</p>
      <blockquote>{quote || '（当前正文中无法定位原引文）'}</blockquote>
      <p className="review-finding-suggestion">建议：{finding.suggestion}</p>
      {finding.disposition === 'open' ? (
        <div className="review-finding-actions">
          <button
            className="quiet-button"
            onClick={() => onDisposition(finding, 'accept')}
            disabled={isUpdating}
          >
            接受
          </button>
          <button
            className="quiet-button"
            onClick={() => onDisposition(finding, 'ignore')}
            disabled={isUpdating}
          >
            忽略
          </button>
          <button
            className="text-button"
            onClick={() => onDisposition(finding, 'intentional')}
            disabled={isUpdating}
          >
            标记为有意
          </button>
        </div>
      ) : (
        <p className="review-finding-disposition">已标记：{dispositionLabel(finding.disposition)}</p>
      )}
    </article>
  );
}

function hasStepEvent(events: RunEventRecord[], eventType: string, name: string): boolean {
  return events.some((event) => {
    if (event.eventType !== eventType) return false;
    const payload = asRecord(event.payload);
    return payload?.['name'] === name;
  });
}

function runStepName(intent: string | undefined): string {
  if (intent === 'review_chapter') return 'generate_review';
  if (intent === 'revise_chapter') return 'generate_revision';
  return 'generate_draft';
}

function runStateLabel(status: RunRecord['status']): string {
  const labels: Record<RunRecord['status'], string> = {
    queued: '排队中',
    running: '运行中',
    awaiting_author: '待作者确认',
    paused: '已暂停',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
    stale: '已过期',
  };
  return labels[status];
}

function stepStateLabel(state: StepState): string {
  if (state === 'completed') return '完成';
  if (state === 'running') return '进行中';
  return '等待';
}

function dispositionLabel(disposition: Exclude<ReviewDisposition, 'open'>): string {
  const labels: Record<Exclude<ReviewDisposition, 'open'>, string> = {
    accept: '接受',
    ignore: '忽略',
    intentional: '作者有意',
  };
  return labels[disposition];
}

function eventKey(event: RunEventRecord): string {
  if (event.sequence !== undefined) return `sequence:${event.sequence}`;
  return `${event.eventType}:${JSON.stringify(event.payload)}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败，请稍后重试。';
}
