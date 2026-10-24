import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  BookService,
  ContinuitySearchService,
  ContinuityService,
} from '../../application/dist/index.js';
import { initializeProjectDatabase } from '../dist/index.js';

const timestamp = '2026-10-24T12:00:00.000Z';

function hash(value) {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

async function createDirectory() {
  return mkdtemp(join(tmpdir(), 'dreamstory-search-'));
}

test('rebuilds current finalizations into FTS and exact entity mentions', async () => {
  const directory = await createDirectory();
  try {
    const initialized = await initializeProjectDatabase(directory);
    const books = new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    );
    await books.createBook({
      bookId: 'book_search_01',
      clientRequestId: 'c6595f8b-2583-4ccc-9569-62d273282eb9',
      title: '检索测试',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证全文和实体召回。',
      createdAt: timestamp,
    });
    const continuity = new ContinuityService(initialized.repositories);
    await continuity.createEntity({
      bookId: 'book_search_01',
      clientRequestId: 'b3b241cc-6f6e-4d98-a8e3-3e94d4e5c5dd',
      expectedBookRevision: 1,
      entity: {
        id: 'entity_lan',
        bookId: 'book_search_01',
        kind: 'character',
        name: '林澜',
        aliases: ['澜姐'],
      },
      now: timestamp,
    });

    const oldContent = '旧章里只有废弃邮局。';
    const content = '澜姐走进雾港，旧邮戳落在信封上。';
    initialized.connection.db
      .prepare(
        `INSERT INTO chapters (
          id, book_id, chapter_number, display_title, plan_node_id,
          current_draft_id, current_finalization_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
      )
      .run('chapter_search_01', 'book_search_01', 1, '第一章', 'plan_search_01', 'final_search_02', timestamp, timestamp);
    initialized.connection.db
      .prepare(
        `INSERT INTO finalizations (
          id, chapter_id, draft_version_id, content, content_hash,
          supersedes_id, committed_at
        ) VALUES (?, ?, ?, ?, ?, NULL, ?)`,
      )
      .run(
        'final_search_01',
        'chapter_search_01',
        'draft_search_01',
        oldContent,
        hash(oldContent),
        timestamp,
      );
    initialized.connection.db
      .prepare(
        `INSERT INTO finalizations (
          id, chapter_id, draft_version_id, content, content_hash,
          supersedes_id, committed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        'final_search_02',
        'chapter_search_01',
        'draft_search_02',
        content,
        hash(content),
        'final_search_01',
        timestamp,
      );

    const search = new ContinuitySearchService(initialized.repositories);
    assert.deepEqual(await search.rebuild('book_search_01'), {
      indexedChapters: 1,
      indexedEntityMentions: 1,
    });

    const aliasHits = await search.search('book_search_01', '澜姐');
    assert.equal(aliasHits[0].reason, 'entity_alias');
    assert.equal(aliasHits[0].chapterNumber, 1);
    assert.deepEqual(aliasHits[0].position, { start: 0, end: 2 });

    const fullTextHits = await search.search('book_search_01', '邮戳');
    assert.equal(fullTextHits[0].kind, 'chapter');
    assert.equal(fullTextHits[0].reason, 'full_text');
    assert.deepEqual(fullTextHits[0].position, { start: 8, end: 10 });

    assert.equal((await search.search('book_search_01', '废弃邮局')).length, 0);
    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
