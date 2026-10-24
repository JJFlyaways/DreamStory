import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ApiError,
  cancelRun,
  createBackup,
  createBook,
  createChapter,
  downloadExport,
  finalizeChapter,
  getBook,
  getRun,
  hashContent,
  listBooks,
  listChapters,
  listDrafts,
  listModelProfiles,
  listPlans,
  listReviewFindings,
  listReviews,
  listRunArtifacts,
  newRequestId,
  restoreDraft,
  saveDraft,
  savePlan,
  setReviewFindingDisposition,
  startRun,
  updateBook,
} from './api';
import { CodeMirrorEditor } from './CodeMirrorEditor';
import { HarnessRunPanel, ReviewPanel } from './HarnessRunPanel';
import type {
  Book,
  Chapter,
  DraftVersion,
  PlanKind,
  PlanNode,
  ReviewDisposition,
  ReviewFinding,
  RunArtifact,
} from './types';
import './styles.css';
import './harness-layout.css';

const planLabels: Record<PlanKind, string> = {
  book: '故事核心',
  volume: '卷',
  arc: '故事弧',
  chapter: '章节',
};

export function App() {
  const queryClient = useQueryClient();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const booksQuery = useQuery({ queryKey: ['books'], queryFn: listBooks });
  const readyBooks =
    booksQuery.data?.filter((entry) => entry.status === 'ready' && entry.book) ?? [];
  const activeBookId = selectedBookId ?? readyBooks[0]?.bookId ?? null;

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: async (book) => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      setSelectedBookId(book.id);
    },
  });

  if (booksQuery.isPending) {
    return <LoadingScreen />;
  }

  if (booksQuery.isError) {
    return <ErrorScreen message={booksQuery.error.message} />;
  }

  return (
    <div className="app-frame">
      <header className="masthead">
        <div className="wordmark">
          <span className="wordmark-mark">DS</span>
          <span>DreamStory</span>
        </div>
        <div className="masthead-note">本地优先 · 写作中的每一页都可回到手里</div>
        <div className="masthead-status">
          <span className="status-dot" />
          离线可写
        </div>
      </header>

      {activeBookId === null ? (
        <EmptyShelf
          isCreating={createMutation.isPending}
          error={createMutation.error}
          onCreate={(input) => createMutation.mutate(input)}
        />
      ) : (
        <BookWorkspace
          bookId={activeBookId}
          books={readyBooks.map((entry) => entry.book as Book)}
          onSelectBook={setSelectedBookId}
          onCreateBook={(input) => createMutation.mutate(input)}
          isCreatingBook={createMutation.isPending}
        />
      )}
    </div>
  );
}

function BookWorkspace({
  bookId,
  books,
  onSelectBook,
  onCreateBook,
  isCreatingBook,
}: {
  bookId: string;
  books: Book[];
  onSelectBook: (bookId: string) => void;
  onCreateBook: (input: Parameters<typeof createBook>[0]) => void;
  isCreatingBook: boolean;
}) {
  const queryClient = useQueryClient();
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [bookFilter, setBookFilter] = useState('');
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const bookQuery = useQuery({ queryKey: ['book', bookId], queryFn: () => getBook(bookId) });
  const plansQuery = useQuery({ queryKey: ['plans', bookId], queryFn: () => listPlans(bookId) });
  const chaptersQuery = useQuery({
    queryKey: ['chapters', bookId],
    queryFn: () => listChapters(bookId),
  });

  const book = bookQuery.data;
  const plans = plansQuery.data ?? [];
  const chapters = chaptersQuery.data ?? [];
  const visibleBooks = books.filter((item) => {
    const needle = bookFilter.trim().toLocaleLowerCase();
    return needle === '' || `${item.title} ${item.genre}`.toLocaleLowerCase().includes(needle);
  });
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? null;

  useEffect(() => {
    if (
      selectedChapterId !== null &&
      !chapters.some((chapter) => chapter.id === selectedChapterId)
    ) {
      setSelectedChapterId(null);
    }
  }, [chapters, selectedChapterId]);

  const refreshBook = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['book', bookId] }),
      queryClient.invalidateQueries({ queryKey: ['plans', bookId] }),
      queryClient.invalidateQueries({ queryKey: ['chapters', bookId] }),
      queryClient.invalidateQueries({ queryKey: ['books'] }),
    ]);
  };

  if (
    bookQuery.isPending ||
    plansQuery.isPending ||
    chaptersQuery.isPending ||
    book === undefined
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="workbench">
      <aside className="left-rail" aria-label="作品导航">
        <div className="rail-heading">
          <span>作品架</span>
          <button className="icon-button" onClick={() => setShowCreateBook(true)} title="新建作品">
            ＋
          </button>
        </div>
        <input
          className="rail-search"
          value={bookFilter}
          onChange={(event) => setBookFilter(event.target.value)}
          placeholder="搜索作品"
          aria-label="搜索作品"
        />
        <div className="book-list">
          {visibleBooks.map((item) => (
            <button
              className={`book-list-item ${item.id === bookId ? 'is-active' : ''}`}
              key={item.id}
              onClick={() => {
                onSelectBook(item.id);
                setSelectedChapterId(null);
              }}
            >
              <span className="book-list-title">{item.title}</span>
              <span className="book-list-meta">{item.genre || '未定题材'}</span>
            </button>
          ))}
        </div>

        <div className="rail-divider" />
        <div className="rail-section-heading">
          <span>章节目录</span>
          <span className="muted-number">{chapters.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="chapter-list">
          {chapters.length === 0 ? (
            <p className="rail-empty">确认章计划后，在这里开始第一章。</p>
          ) : (
            chapters.map((chapter) => (
              <button
                className={`chapter-list-item ${chapter.id === selectedChapterId ? 'is-active' : ''}`}
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
              >
                <span className="chapter-number">
                  {String(chapter.chapterNumber).padStart(2, '0')}
                </span>
                <span>{chapter.displayTitle}</span>
              </button>
            ))
          )}
        </div>
        <div className="rail-footer">书库位于本机 · 自动保存受版本保护</div>
      </aside>

      <main className="main-stage">
        <div className="stage-header">
          <div>
            <p className="eyebrow">正在创作</p>
            <h1>{book.title}</h1>
          </div>
          <div className="stage-actions">
            <button
              className="quiet-button"
              onClick={() => {
                setActionStatus('正在准备 Markdown…');
                void downloadExport(book.id, 'markdown')
                  .then(() => setActionStatus('Markdown 已下载'))
                  .catch((error: unknown) =>
                    setActionStatus(error instanceof Error ? error.message : '导出失败'),
                  );
              }}
            >
              导出 Markdown
            </button>
            <button
              className="quiet-button"
              onClick={() => {
                setActionStatus('正在准备 TXT…');
                void downloadExport(book.id, 'txt')
                  .then(() => setActionStatus('TXT 已下载'))
                  .catch((error: unknown) =>
                    setActionStatus(error instanceof Error ? error.message : '导出失败'),
                  );
              }}
            >
              导出 TXT
            </button>
            <button
              className="quiet-button"
              onClick={() => {
                setActionStatus('正在创建备份…');
                void createBackup(book.id)
                  .then((result) => setActionStatus(`备份已保存 · ${result.relativePath}`))
                  .catch((error: unknown) =>
                    setActionStatus(error instanceof Error ? error.message : '备份失败'),
                  );
              }}
            >
              备份
            </button>
          </div>
        </div>
        {actionStatus && (
          <p className="action-status" role="status">
            {actionStatus}
          </p>
        )}

        {selectedChapter === null ? (
          <Overview
            book={book}
            plans={plans}
            chapters={chapters}
            expectedBookRevision={book.bookRevision}
            onRefresh={refreshBook}
            onSelectChapter={setSelectedChapterId}
          />
        ) : (
          <WritingWorkspace
            book={book}
            chapter={selectedChapter}
            plans={plans}
            onRefresh={refreshBook}
          />
        )}
      </main>

      <aside className="right-rail" aria-label="当前作品信息">
        <section className="right-section">
          <p className="eyebrow">作品坐标</p>
          <div className="coordinate-row">
            <span>修订号</span>
            <strong>{book.bookRevision}</strong>
          </div>
          <div className="coordinate-row">
            <span>语言</span>
            <strong>{book.language}</strong>
          </div>
          <div className="coordinate-row">
            <span>题材</span>
            <strong>{book.genre || '未定'}</strong>
          </div>
        </section>
        <ConventionsEditor book={book} onSaved={refreshBook} />
        <section className="right-section right-callout">
          <span className="callout-line" />
          <p>先把事实写在这里。模型以后只能提出候选，定稿始终由你决定。</p>
        </section>
      </aside>

      {showCreateBook && (
        <Dialog title="开一本新书" onClose={() => setShowCreateBook(false)}>
          <NewBookForm
            compact
            isCreating={isCreatingBook}
            error={null}
            onSubmit={(input) => {
              onCreateBook(input);
              setShowCreateBook(false);
            }}
          />
        </Dialog>
      )}
    </div>
  );
}

function Overview({
  book,
  plans,
  chapters,
  expectedBookRevision,
  onRefresh,
  onSelectChapter,
}: {
  book: Book;
  plans: PlanNode[];
  chapters: Chapter[];
  expectedBookRevision: number;
  onRefresh: () => Promise<void>;
  onSelectChapter: (chapterId: string) => void;
}) {
  return (
    <div className="overview-grid">
      <section className="manuscript-intro">
        <p className="eyebrow">故事核心</p>
        <p className="premise">
          {book.premise || '从一个想法开始，给它一个可以继续走下去的方向。'}
        </p>
        <div className="intro-rule" />
        <div className="intro-stats">
          <div>
            <strong>{plans.length}</strong>
            <span>个确认节点</span>
          </div>
          <div>
            <strong>{chapters.length}</strong>
            <span>章写作空间</span>
          </div>
          <div>
            <strong>{book.bookRevision}</strong>
            <span>作品修订</span>
          </div>
        </div>
      </section>

      <section className="plan-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">规划航线</p>
            <h2>从故事核心走到下一章</h2>
          </div>
          <span className="section-count">{plans.length.toString().padStart(2, '0')}</span>
        </div>
        <PlanTree plans={plans} />
        <PlanComposer
          bookId={book.id}
          plans={plans}
          expectedBookRevision={expectedBookRevision}
          onSaved={onRefresh}
        />
      </section>

      <section className="chapter-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">写作入口</p>
            <h2>章节目录</h2>
          </div>
          <span className="section-count">{chapters.length.toString().padStart(2, '0')}</span>
        </div>
        {chapters.length > 0 && (
          <div className="chapter-overview-list">
            {chapters.map((chapter) => (
              <button key={chapter.id} onClick={() => onSelectChapter(chapter.id)}>
                <span>{String(chapter.chapterNumber).padStart(2, '0')}</span>
                <strong>{chapter.displayTitle}</strong>
                <em>{chapter.currentDraftId ? '有草稿' : '待开始'}</em>
              </button>
            ))}
          </div>
        )}
        <ChapterComposer
          plans={plans}
          expectedBookRevision={expectedBookRevision}
          nextChapterNumber={chapters.length + 1}
          onCreated={onRefresh}
        />
      </section>
    </div>
  );
}

function ConventionsEditor({ book, onSaved }: { book: Book; onSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [entries, setEntries] = useState<[string, string][]>(() =>
    Object.entries(book.conventions).map(([key, value]) => [key, String(value)]),
  );
  const mutation = useMutation({
    mutationFn: () =>
      updateBook(book.id, {
        clientRequestId: newRequestId(),
        expectedBookRevision: book.bookRevision,
        conventions: Object.fromEntries(
          entries.filter(([key, value]) => key.trim() !== '' && value.trim() !== ''),
        ),
      }),
    onSuccess: async () => {
      setEditing(false);
      await onSaved();
    },
  });

  useEffect(() => {
    if (!editing) {
      setEntries(Object.entries(book.conventions).map(([key, value]) => [key, String(value)]));
    }
  }, [book.bookRevision, editing]);

  return (
    <section className="right-section right-note">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">设定台</p>
          <h3>角色与世界设定</h3>
        </div>
        <button className="text-button" onClick={() => setEditing((value) => !value)}>
          {editing ? '收起' : '编辑'}
        </button>
      </div>
      <p>{book.premise || '还没有写下故事的第一句话。'}</p>
      {!editing && Object.entries(book.conventions).length === 0 && (
        <p className="muted-copy">把视角、人物身份、世界规则写成几条短句，后续每一步都能回看。</p>
      )}
      {!editing && Object.entries(book.conventions).length > 0 && (
        <dl className="convention-list">
          {Object.entries(book.conventions).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
      {editing && (
        <div className="convention-editor">
          {entries.map(([key, value], index) => (
            <div className="convention-edit-row" key={`${index}-${key}`}>
              <input
                value={key}
                onChange={(event) => {
                  const next = [...entries];
                  next[index] = [event.target.value, value];
                  setEntries(next);
                }}
                placeholder="设定名"
                aria-label="设定名"
              />
              <input
                value={value}
                onChange={(event) => {
                  const next = [...entries];
                  next[index] = [key, event.target.value];
                  setEntries(next);
                }}
                placeholder="设定内容"
                aria-label="设定内容"
              />
              <button
                className="icon-button"
                onClick={() => setEntries(entries.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="删除这条设定"
              >
                ×
              </button>
            </div>
          ))}
          <button className="inline-action" onClick={() => setEntries([...entries, ['', '']])}>
            ＋ 添加设定
          </button>
          {mutation.error && <InlineError error={mutation.error} />}
          <button
            className="primary-button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            保存设定
          </button>
        </div>
      )}
    </section>
  );
}

function PlanTree({ plans }: { plans: PlanNode[] }) {
  if (plans.length === 0) {
    return <div className="empty-line">还没有规划节点。先写下故事核心。</div>;
  }
  const byParent = new Map<string | null, PlanNode[]>();
  for (const plan of plans) {
    const siblings = byParent.get(plan.parentId) ?? [];
    siblings.push(plan);
    byParent.set(plan.parentId, siblings);
  }

  const render = (parentId: string | null, depth = 0): ReactNode[] =>
    (byParent.get(parentId) ?? []).flatMap((plan) => [
      <div className="plan-row" key={plan.id} style={{ '--plan-depth': depth } as CSSProperties}>
        <span className="plan-kind">{planLabels[plan.kind]}</span>
        <strong>{plan.content.title}</strong>
        <span className="plan-version">v{plan.version}</span>
      </div>,
      ...render(plan.id, depth + 1),
    ]);

  return <div className="plan-tree">{render(null)}</div>;
}

function PlanComposer({
  bookId,
  plans,
  expectedBookRevision,
  onSaved,
}: {
  bookId: string;
  plans: PlanNode[];
  expectedBookRevision: number;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(plans.length === 0);
  const [kind, setKind] = useState<PlanKind>(plans.length === 0 ? 'book' : 'volume');
  const [parentId, setParentId] = useState<string | null>(
    plans.find((plan) => plan.kind === 'book')?.id ?? null,
  );
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [conflict, setConflict] = useState('');
  const [startState, setStartState] = useState('');
  const [endState, setEndState] = useState('');
  const [beats, setBeats] = useState('');
  const [avoid, setAvoid] = useState('');
  const allowedParents: Record<PlanKind, PlanKind[]> = {
    book: [],
    volume: ['book'],
    arc: ['volume'],
    chapter: ['arc'],
  };
  const parentOptions = plans.filter((plan) => allowedParents[kind].includes(plan.kind));
  const mutation = useMutation({
    mutationFn: () => {
      if (bookId === undefined) {
        throw new Error('请先创建故事核心。');
      }
      return savePlan(bookId, `plan_${newRequestId()}`, {
        clientRequestId: newRequestId(),
        expectedBookRevision,
        parentId: kind === 'book' ? null : parentId,
        kind,
        sortKey: String(plans.length + 1).padStart(4, '0'),
        content: {
          title,
          goal,
          conflict,
          startState,
          endState,
          requiredBeats: beats
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          avoid: avoid
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });
    },
    onSuccess: async () => {
      setTitle('');
      setGoal('');
      setConflict('');
      setStartState('');
      setEndState('');
      setBeats('');
      setAvoid('');
      await onSaved();
      setOpen(false);
    },
  });

  if (!open) {
    return (
      <button className="inline-action" onClick={() => setOpen(true)}>
        ＋ 添加规划节点
      </button>
    );
  }

  return (
    <form
      className="inline-form"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="form-line">
        <label>
          层级
          <select value={kind} onChange={(event) => setKind(event.target.value as PlanKind)}>
            {(plans.length === 0 ? ['book'] : ['volume', 'arc', 'chapter']).map((value) => (
              <option key={value} value={value}>
                {planLabels[value as PlanKind]}
              </option>
            ))}
          </select>
        </label>
        {kind !== 'book' && (
          <label>
            上级
            <select
              value={parentId ?? ''}
              onChange={(event) => setParentId(event.target.value || null)}
            >
              {parentOptions.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.content.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <input
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="节点标题"
      />
      <input
        required
        value={goal}
        onChange={(event) => setGoal(event.target.value)}
        placeholder="这一层要完成什么"
      />
      <div className="form-line">
        <input
          required
          value={startState}
          onChange={(event) => setStartState(event.target.value)}
          placeholder="起始状态"
        />
        <input
          required
          value={endState}
          onChange={(event) => setEndState(event.target.value)}
          placeholder="结束状态"
        />
      </div>
      <input
        required
        value={conflict}
        onChange={(event) => setConflict(event.target.value)}
        placeholder="核心冲突"
      />
      <div className="form-line">
        <textarea
          value={beats}
          onChange={(event) => setBeats(event.target.value)}
          placeholder="必须发生的事，每行一项"
          rows={2}
        />
        <textarea
          value={avoid}
          onChange={(event) => setAvoid(event.target.value)}
          placeholder="避免发生的事，每行一项"
          rows={2}
        />
      </div>
      {mutation.error && <InlineError error={mutation.error} />}
      <div className="form-actions">
        <button type="button" className="quiet-button" onClick={() => setOpen(false)}>
          收起
        </button>
        <button type="submit" className="primary-button" disabled={mutation.isPending}>
          确认节点
        </button>
      </div>
    </form>
  );
}

function ChapterComposer({
  plans,
  expectedBookRevision,
  nextChapterNumber,
  onCreated,
}: {
  plans: PlanNode[];
  expectedBookRevision: number;
  nextChapterNumber: number;
  onCreated: () => Promise<void>;
}) {
  const chapterPlans = plans.filter((plan) => plan.kind === 'chapter');
  const [open, setOpen] = useState(false);
  const [planNodeId, setPlanNodeId] = useState(chapterPlans[0]?.id ?? '');
  const mutation = useMutation({
    mutationFn: () => {
      const plan = chapterPlans.find((item) => item.id === planNodeId);
      if (plan === undefined) throw new Error('请先选择章节计划。');
      return createChapter(plan.bookId, {
        clientRequestId: newRequestId(),
        expectedBookRevision,
        id: `chapter_${String(nextChapterNumber).padStart(2, '0')}`,
        chapterNumber: nextChapterNumber,
        displayTitle: plan.content.title,
        planNodeId,
      });
    },
    onSuccess: async () => {
      await onCreated();
      setOpen(false);
    },
  });

  if (chapterPlans.length === 0) {
    return <div className="empty-line">先添加一个章节层级的规划节点，才能开写章节。</div>;
  }
  if (!open) {
    return (
      <button className="inline-action" onClick={() => setOpen(true)}>
        ＋ 从章节计划开稿
      </button>
    );
  }
  return (
    <div className="inline-form compact-form">
      <label>
        章节计划
        <select value={planNodeId} onChange={(event) => setPlanNodeId(event.target.value)}>
          {chapterPlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.content.title}
            </option>
          ))}
        </select>
      </label>
      {mutation.error && <InlineError error={mutation.error} />}
      <div className="form-actions">
        <button className="quiet-button" onClick={() => setOpen(false)}>
          收起
        </button>
        <button
          className="primary-button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          创建第 {nextChapterNumber} 章
        </button>
      </div>
    </div>
  );
}

function WritingWorkspace({
  book,
  chapter,
  plans,
  onRefresh,
}: {
  book: Book;
  chapter: Chapter;
  plans: PlanNode[];
  onRefresh: () => Promise<void>;
}) {
  const plan = plans.find((item) => item.id === chapter.planNodeId);
  const draftsQuery = useQuery({
    queryKey: ['drafts', book.id, chapter.id],
    queryFn: () => listDrafts(book.id, chapter.id),
  });
  const drafts = draftsQuery.data ?? [];
  const current = drafts[0] ?? null;
  const [content, setContent] = useState(current?.content ?? '');
  const [complete, setComplete] = useState(current?.complete ?? false);
  const [saveState, setSaveState] = useState<'未保存' | '保存中' | '已保存' | '冲突' | '失败'>(
    '已保存',
  );
  const [previewDraft, setPreviewDraft] = useState<DraftVersion | null>(null);
  const loadedChapterRef = useRef<string | null>(null);
  const draftRevisionRef = useRef(current?.revision ?? 0);
  const lastSavedContentRef = useRef(current?.content ?? '');
  const lastSavedCompleteRef = useRef(current?.complete ?? false);
  const saveMutation = useMutation({
    mutationFn: () =>
      saveDraft(book.id, chapter.id, `draft_${newRequestId()}`, {
        clientRequestId: newRequestId(),
        expectedDraftRevision: draftRevisionRef.current,
        content,
        complete,
      }),
    onMutate: () => setSaveState('保存中'),
    onSuccess: async (result) => {
      draftRevisionRef.current = result.draftRevision;
      lastSavedContentRef.current = result.draft.content;
      lastSavedCompleteRef.current = result.draft.complete;
      setSaveState('已保存');
      await onRefresh();
      await draftsQuery.refetch();
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        const revision = error.payload.details['currentDraftRevision'];
        if (typeof revision === 'number') {
          draftRevisionRef.current = revision;
        }
        setSaveState('冲突');
      } else {
        setSaveState('失败');
      }
    },
  });

  useEffect(() => {
    if (draftsQuery.isPending || loadedChapterRef.current === chapter.id) {
      return;
    }
    loadedChapterRef.current = chapter.id;
    draftRevisionRef.current = current?.revision ?? 0;
    lastSavedContentRef.current = current?.content ?? '';
    lastSavedCompleteRef.current = current?.complete ?? false;
    setContent(current?.content ?? '');
    setComplete(current?.complete ?? false);
    setSaveState('已保存');
  }, [chapter.id, current?.id, draftsQuery.isPending]);

  useEffect(() => {
    if (loadedChapterRef.current !== chapter.id || saveMutation.isPending) {
      return;
    }
    if (content === lastSavedContentRef.current && complete === lastSavedCompleteRef.current) {
      return;
    }
    setSaveState('未保存');
    const timer = window.setTimeout(() => saveMutation.mutate(), 900);
    return () => window.clearTimeout(timer);
  }, [chapter.id, complete, content, saveMutation.isPending]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (saveState !== '已保存') {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveState]);

  const restoreMutation = useMutation({
    mutationFn: (sourceDraftId: string) =>
      restoreDraft(book.id, chapter.id, sourceDraftId, {
        clientRequestId: newRequestId(),
        expectedDraftRevision: draftRevisionRef.current,
      }),
    onSuccess: async (result) => {
      draftRevisionRef.current = result.draftRevision;
      lastSavedContentRef.current = result.draft.content;
      lastSavedCompleteRef.current = result.draft.complete;
      setContent(result.draft.content);
      setComplete(result.draft.complete);
      await draftsQuery.refetch();
      setSaveState('已保存');
    },
    onError: () => setSaveState('失败'),
  });

  const profilesQuery = useQuery({ queryKey: ['model-profiles'], queryFn: listModelProfiles });
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [runId, setRunId] = useState<string | null>(null);
  const profiles = profilesQuery.data ?? [];
  useEffect(() => {
    if (selectedProfileId === '' && profiles[0] !== undefined) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);
  const runQuery = useQuery({
    queryKey: ['run', book.id, runId],
    queryFn: () => getRun(book.id, runId as string),
    enabled: runId !== null,
    refetchInterval: (query) =>
      query.state.data?.status === 'queued' || query.state.data?.status === 'running'
        ? 1_000
        : false,
  });
  const artifactsQuery = useQuery({
    queryKey: ['run-artifacts', book.id, runId],
    queryFn: () => listRunArtifacts(book.id, runId as string),
    enabled: runId !== null,
    refetchInterval: () =>
      runQuery.data?.status === 'queued' || runQuery.data?.status === 'running' ? 1_000 : false,
  });
  const reviewsQuery = useQuery({
    queryKey: ['reviews', book.id, chapter.id],
    queryFn: () => listReviews(book.id, chapter.id),
  });
  const latestReview = reviewsQuery.data?.[reviewsQuery.data.length - 1] ?? null;
  const reviewFindingsQuery = useQuery({
    queryKey: ['review-findings', book.id, latestReview?.id],
    queryFn: () => listReviewFindings(book.id, latestReview?.id ?? ''),
    enabled: latestReview !== null,
  });
  const startRunMutation = useMutation({
    mutationFn: () =>
      startRun(book.id, {
        intent: 'draft_chapter',
        expectedBookRevision: book.bookRevision,
        target: { planId: chapter.planNodeId, chapterNumber: chapter.chapterNumber },
        modelProfileId: selectedProfileId,
        scope: { chapterNumbers: [chapter.chapterNumber] },
    }),
    onSuccess: (run) => setRunId(run.id),
  });
  const startReviewMutation = useMutation({
    mutationFn: () =>
      startRun(book.id, {
        intent: 'review_chapter',
        expectedBookRevision: book.bookRevision,
        target: { planId: chapter.planNodeId, chapterNumber: chapter.chapterNumber },
        modelProfileId: selectedProfileId,
        scope: { chapterNumbers: [chapter.chapterNumber] },
      }),
    onSuccess: (run) => setRunId(run.id),
  });
  const cancelRunMutation = useMutation({
    mutationFn: () => cancelRun(book.id, runId as string),
    onSuccess: () => void runQuery.refetch(),
  });
  const applyCandidateMutation = useMutation({
    mutationFn: (artifact: RunArtifact) =>
      saveDraft(book.id, chapter.id, `draft_${newRequestId()}`, {
        clientRequestId: newRequestId(),
        expectedDraftRevision: draftRevisionRef.current,
        content: artifact.content,
        complete: artifact.complete,
      }),
    onSuccess: async (result) => {
      draftRevisionRef.current = result.draftRevision;
      lastSavedContentRef.current = result.draft.content;
      lastSavedCompleteRef.current = result.draft.complete;
      setContent(result.draft.content);
      setComplete(result.draft.complete);
      await draftsQuery.refetch();
      setSaveState('已保存');
    },
  });
  const reviewDispositionMutation = useMutation({
    mutationFn: (input: {
      finding: ReviewFinding;
      decision: Exclude<ReviewDisposition, 'open'>;
    }) =>
      setReviewFindingDisposition(book.id, input.finding.id, {
        expectedFindingRevision: input.finding.revision,
        decision: input.decision,
      }),
    onSuccess: async () => {
      await reviewFindingsQuery.refetch();
    },
  });
  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (current === null || !current.complete) throw new Error('请先保存完整草稿。');
      return finalizeChapter(book.id, chapter.id, {
        clientRequestId: newRequestId(),
        expectedBookRevision: book.bookRevision,
        expectedDraftRevision: current.revision,
        draftVersionId: current.id,
        contentHash: await hashContent(current.content),
      });
    },
    onSuccess: async () => {
      await onRefresh();
      await draftsQuery.refetch();
    },
  });

  return (
    <div className="writing-layout">
      <section className="editor-column">
        <div className="chapter-heading">
          <div>
            <p className="eyebrow">第 {String(chapter.chapterNumber).padStart(2, '0')} 章</p>
            <h2>{chapter.displayTitle}</h2>
          </div>
          <div className={`save-status save-status-${saveState}`}>
            <span />
            {saveState}
          </div>
        </div>
        <div className="editor-placeholder">
          <CodeMirrorEditor value={content} onChange={setContent} ariaLabel="正文编辑器" />
          <div className="editor-footer">
            <label className="check-label">
              <input
                type="checkbox"
                checked={complete}
                onChange={(event) => setComplete(event.target.checked)}
              />{' '}
              标记为完整草稿
            </label>
            <span>{Array.from(content).length} 字</span>
            <button
              className="primary-button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              保存草稿
            </button>
          </div>
        </div>
        <DraftHistory
          drafts={drafts}
          currentDraftId={current?.id ?? null}
          onPreview={setPreviewDraft}
          onRestore={(draftId) => restoreMutation.mutate(draftId)}
          isRestoring={restoreMutation.isPending}
        />
        {previewDraft && (
          <Dialog
            title={`只读预览 · 版本 ${previewDraft.revision}`}
            onClose={() => setPreviewDraft(null)}
          >
            <pre className="draft-preview">{previewDraft.content || '（空草稿）'}</pre>
          </Dialog>
        )}
      </section>
      <aside className="writing-context">
        <HarnessRunPanel
          bookId={book.id}
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelectProfile={setSelectedProfileId}
          run={runQuery.data ?? null}
          artifacts={artifactsQuery.data ?? []}
          canReview={current?.complete === true}
          onStart={() => startRunMutation.mutate()}
          onStartReview={() => startReviewMutation.mutate()}
          onCancel={() => cancelRunMutation.mutate()}
          onApplyCandidate={(artifact) => applyCandidateMutation.mutate(artifact)}
          onFinalize={() => finalizeMutation.mutate()}
          isStarting={startRunMutation.isPending}
          isReviewing={startReviewMutation.isPending}
          isCancelling={cancelRunMutation.isPending}
          isApplying={applyCandidateMutation.isPending}
          isFinalizing={finalizeMutation.isPending}
          error={
            startRunMutation.error ??
            startReviewMutation.error ??
            applyCandidateMutation.error ??
            finalizeMutation.error
          }
        />
        <ReviewPanel
          reviews={reviewsQuery.data ?? []}
          findings={reviewFindingsQuery.data ?? []}
          draftId={current?.id ?? null}
          draftContent={content}
          isLoading={reviewsQuery.isPending || reviewFindingsQuery.isPending}
          isUpdating={reviewDispositionMutation.isPending}
          error={reviewsQuery.error ?? reviewFindingsQuery.error ?? reviewDispositionMutation.error}
          onDisposition={(finding, decision) =>
            reviewDispositionMutation.mutate({ finding, decision })
          }
        />
        <p className="eyebrow">本章航线</p>
        {plan ? (
          <>
            <h3>{plan.content.title}</h3>
            <ContextRow label="目标" value={plan.content.goal} />
            <ContextRow label="冲突" value={plan.content.conflict} />
            <ContextRow label="起点" value={plan.content.startState} />
            <ContextRow label="终点" value={plan.content.endState} />
            <div className="context-list">
              <span>必须发生</span>
              {plan.content.requiredBeats.map((item) => (
                <p key={item}>· {item}</p>
              ))}
            </div>
            <div className="context-list">
              <span>避免发生</span>
              {plan.content.avoid.map((item) => (
                <p key={item}>· {item}</p>
              ))}
            </div>
          </>
        ) : (
          <p className="muted-copy">这章还没有绑定规划。</p>
        )}
        <div className="context-footnote">当前是手工编辑模式。模型连接不影响本地保存。</div>
      </aside>
    </div>
  );
}

function DraftHistory({
  drafts,
  currentDraftId,
  onPreview,
  onRestore,
  isRestoring,
}: {
  drafts: DraftVersion[];
  currentDraftId: string | null;
  onPreview: (draft: DraftVersion) => void;
  onRestore: (draftId: string) => void;
  isRestoring: boolean;
}) {
  return (
    <section className="history-section">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">版本轨迹</p>
          <h3>草稿历史</h3>
        </div>
        <span className="section-count">{drafts.length.toString().padStart(2, '0')}</span>
      </div>
      {drafts.length === 0 ? (
        <p className="muted-copy">第一次保存后，这里会留下可回看的版本。</p>
      ) : (
        <div className="history-list">
          {drafts.map((draft) => (
            <div
              className={`history-row ${draft.id === currentDraftId ? 'is-current' : ''}`}
              key={draft.id}
            >
              <div>
                <strong>版本 {draft.revision}</strong>
                <span>
                  {draft.createdBy === 'restore' ? '恢复' : '作者保存'} ·{' '}
                  {draft.complete ? '完整' : '进行中'}
                </span>
              </div>
              <div className="history-actions">
                <button className="text-button" onClick={() => onPreview(draft)}>
                  预览
                </button>
                {draft.id !== currentDraftId && (
                  <button
                    className="text-button"
                    disabled={isRestoring}
                    onClick={() => onRestore(draft.id)}
                  >
                    恢复
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="context-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function EmptyShelf({
  isCreating,
  error,
  onCreate,
}: {
  isCreating: boolean;
  error: Error | null;
  onCreate: (input: Parameters<typeof createBook>[0]) => void;
}) {
  return (
    <main className="empty-shelf">
      <div className="empty-shelf-copy">
        <p className="eyebrow">一张空白书桌</p>
        <h1>让故事先拥有一个地方。</h1>
        <p>DreamStory 把规划、设定、正文和版本放在同一本书里。没有模型，也可以从第一句话开始。</p>
      </div>
      <NewBookForm isCreating={isCreating} error={error} onSubmit={onCreate} />
    </main>
  );
}

function NewBookForm({
  compact = false,
  isCreating,
  error,
  onSubmit,
}: {
  compact?: boolean;
  isCreating: boolean;
  error: Error | null;
  onSubmit: (input: Parameters<typeof createBook>[0]) => void;
}) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [premise, setPremise] = useState('');
  const [viewpoint, setViewpoint] = useState('');
  const [tone, setTone] = useState('');
  return (
    <form
      className={`new-book-form ${compact ? 'is-compact' : ''}`}
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        const conventions = Object.fromEntries(
          Object.entries({ viewpoint, tone }).filter(([, value]) => value.trim() !== ''),
        );
        onSubmit({
          clientRequestId: newRequestId(),
          title: title.trim(),
          language: 'zh-CN',
          genre: genre.trim(),
          premise: premise.trim(),
          conventions,
        });
      }}
    >
      <label>
        书名
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例如：雾港来信"
        />
      </label>
      <div className="form-line">
        <label>
          题材
          <input
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            placeholder="悬疑 / 现实 / 奇幻"
          />
        </label>
        <label>
          视角
          <input
            value={viewpoint}
            onChange={(event) => setViewpoint(event.target.value)}
            placeholder="第三人称限知"
          />
        </label>
      </div>
      <label>
        故事想法
        <textarea
          required
          value={premise}
          onChange={(event) => setPremise(event.target.value)}
          placeholder="谁在什么地方，遇到了什么无法绕开的事？"
          rows={4}
        />
      </label>
      <label>
        写作气质
        <input
          value={tone}
          onChange={(event) => setTone(event.target.value)}
          placeholder="克制、潮湿、慢热……"
        />
      </label>
      {error && <InlineError error={error} />}
      <button className="primary-button wide-button" disabled={isCreating}>
        {isCreating ? '正在建立书库…' : '建立这本书'}
      </button>
    </form>
  );
}

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-heading">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function InlineError({ error }: { error: unknown }) {
  return (
    <p className="inline-error">
      {error instanceof Error ? error.message : '操作没有完成，请稍后再试。'}
    </p>
  );
}

function LoadingScreen() {
  return (
    <main className="center-message">
      <span className="loading-mark" />
      正在打开书桌…
    </main>
  );
}
function ErrorScreen({ message }: { message: string }) {
  return <main className="center-message error-message">{message}</main>;
}
