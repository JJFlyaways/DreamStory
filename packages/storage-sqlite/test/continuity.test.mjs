import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  BookService,
  ContinuityCommandError,
  ContinuityService,
} from '../../application/dist/index.js';
import { initializeProjectDatabase } from '../dist/index.js';

const timestamp = '2026-10-24T12:00:00.000Z';
const sourceHash = `sha256:${'a'.repeat(64)}`;

async function createDirectory() {
  return mkdtemp(join(tmpdir(), 'dreamstory-continuity-'));
}

test('keeps stable entities and projects chapter-effective fact versions', async () => {
  const directory = await createDirectory();
  try {
    const initialized = await initializeProjectDatabase(directory);
    const books = new BookService(
      initialized.repositories.books,
      initialized.repositories.commandReceipts,
    );
    await books.createBook({
      bookId: 'book_continuity_01',
      clientRequestId: 'c6595f8b-2583-4ccc-9569-62d273282eb9',
      title: '连续性测试',
      language: 'zh-CN',
      genre: '悬疑',
      premise: '验证事实版本投影。',
      createdAt: timestamp,
    });
    const service = new ContinuityService(initialized.repositories);
    const entity = await service.createEntity({
      bookId: 'book_continuity_01',
      clientRequestId: 'b3b241cc-6f6e-4d98-a8e3-3e94d4e5c5dd',
      expectedBookRevision: 1,
      entity: {
        id: 'entity_lyra',
        bookId: 'book_continuity_01',
        kind: 'character',
        name: '林澜',
        aliases: ['澜姐'],
      },
      now: timestamp,
    });
    assert.equal(entity.bookRevision, 2);
    assert.deepEqual(entity.value.aliases, ['澜姐']);

    const first = await service.appendFact({
      bookId: 'book_continuity_01',
      clientRequestId: 'd74e7b8e-80f0-4c20-8f9c-b1b82f9a6d5b',
      expectedBookRevision: 2,
      fact: {
        id: 'fact_lyra_location_01',
        entityId: 'entity_lyra',
        predicate: 'location',
        value: '雾港',
        validFromChapter: 1,
        sourceKind: 'author',
        sourceId: 'author_01',
        sourceHash,
      },
      now: timestamp,
    });
    assert.equal(first.bookRevision, 3);
    assert.equal(first.value.revision, 1);
    assert.equal(first.value.validToChapter, null);

    const second = await service.appendFact({
      bookId: 'book_continuity_01',
      clientRequestId: 'f1c22d4b-cf76-46c2-bc03-e4a4d794caf1',
      expectedBookRevision: 3,
      fact: {
        id: 'fact_lyra_location_02',
        entityId: 'entity_lyra',
        predicate: 'location',
        value: '北站',
        validFromChapter: 3,
        sourceKind: 'finalization',
        sourceId: 'finalization_01',
        sourceHash,
      },
      now: timestamp,
    });
    assert.equal(second.value.revision, 2);
    assert.equal(second.bookRevision, 4);
    assert.equal(
      (await initialized.repositories.facts.get('book_continuity_01', 'fact_lyra_location_01'))
        .validToChapter,
      2,
    );

    assert.deepEqual(
      (await service.project('book_continuity_01', 2))[0].facts.map((fact) => fact.value),
      ['雾港'],
    );
    assert.deepEqual(
      (await service.project('book_continuity_01', 3))[0].facts.map((fact) => fact.value),
      ['北站'],
    );

    initialized.connection.db
      .prepare(
        `INSERT INTO chapters (
          id, book_id, chapter_number, display_title, plan_node_id,
          current_draft_id, current_finalization_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
      )
      .run(
        'chapter_01',
        'book_continuity_01',
        1,
        '第一章',
        'plan_chapter_01',
        timestamp,
        timestamp,
      );
    initialized.connection.db
      .prepare(
        `INSERT INTO chapters (
          id, book_id, chapter_number, display_title, plan_node_id,
          current_draft_id, current_finalization_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
      )
      .run(
        'chapter_03',
        'book_continuity_01',
        3,
        '第三章',
        'plan_chapter_03',
        timestamp,
        timestamp,
      );

    const authorTruth = await service.recordRevelation({
      bookId: 'book_continuity_01',
      clientRequestId: '6a11b2f5-2f98-4c30-b4c6-6018f2fcf4a6',
      expectedBookRevision: 4,
      revelation: {
        id: 'revelation_author_truth_01',
        bookId: 'book_continuity_01',
        factId: 'fact_lyra_location_01',
        chapterId: 'chapter_01',
        sourceHash,
        textRange: null,
        visibility: 'author_truth',
        knownToEntityId: null,
      },
      now: timestamp,
    });
    assert.equal(authorTruth.bookRevision, 5);

    const readerKnown = await service.recordRevelation({
      bookId: 'book_continuity_01',
      clientRequestId: 'd6c53a6b-e3af-42b1-898a-7a9d5d6a4229',
      expectedBookRevision: 5,
      revelation: {
        id: 'revelation_reader_known_01',
        bookId: 'book_continuity_01',
        factId: 'fact_lyra_location_01',
        chapterId: 'chapter_01',
        sourceHash,
        textRange: { start: 0, end: 2, quoteHash: sourceHash },
        visibility: 'reader_known',
        knownToEntityId: null,
      },
      now: timestamp,
    });
    assert.equal(readerKnown.bookRevision, 6);

    const characterKnown = await service.recordRevelation({
      bookId: 'book_continuity_01',
      clientRequestId: 'a3e779dd-65c7-4ab0-b53b-80e5dc0b87d5',
      expectedBookRevision: 6,
      revelation: {
        id: 'revelation_character_known_01',
        bookId: 'book_continuity_01',
        factId: 'fact_lyra_location_02',
        chapterId: 'chapter_03',
        sourceHash,
        textRange: { start: 2, end: 4, quoteHash: sourceHash },
        visibility: 'character_known',
        knownToEntityId: 'entity_lyra',
      },
      now: timestamp,
    });
    assert.equal(characterKnown.bookRevision, 7);
    assert.equal(
      (await service.listRevelationsByVisibility('book_continuity_01', 'reader_known')).length,
      1,
    );
    assert.equal(
      (await service.listRevelationsByFact('book_continuity_01', 'fact_lyra_location_02'))[0]
        .knownToEntityId,
      'entity_lyra',
    );

    await assert.rejects(
      () =>
        service.recordRevelation({
          bookId: 'book_continuity_01',
          clientRequestId: 'a4a0f5f8-7a7d-4dc7-ae84-b9c96d0f55c1',
          expectedBookRevision: 7,
          revelation: {
            id: 'revelation_reader_missing_range',
            bookId: 'book_continuity_01',
            factId: 'fact_lyra_location_01',
            chapterId: 'chapter_01',
            sourceHash,
            textRange: null,
            visibility: 'reader_known',
            knownToEntityId: null,
          },
          now: timestamp,
        }),
      (error) => {
        assert.equal(error instanceof ContinuityCommandError, true);
        assert.equal(error.code, 'VALIDATION_ERROR');
        return true;
      },
    );

    const aliases = await service.updateAliases({
      bookId: 'book_continuity_01',
      clientRequestId: '18b8654e-c799-4bf1-9999-838e356e79f1',
      entityId: 'entity_lyra',
      expectedBookRevision: 7,
      aliases: ['澜姐', '林编辑'],
      now: timestamp,
    });
    assert.equal(aliases.bookRevision, 8);
    assert.deepEqual(aliases.value.aliases, ['澜姐', '林编辑']);

    await assert.rejects(
      () =>
        service.appendFact({
          bookId: 'book_continuity_01',
          clientRequestId: 'a4a0f5f8-7a7d-4dc7-ae84-b9c96d0f55c1',
          expectedBookRevision: 8,
          fact: {
            id: 'fact_lyra_location_overlap',
            entityId: 'entity_lyra',
            predicate: 'location',
            value: '旧码头',
            validFromChapter: 2,
            sourceKind: 'author',
            sourceId: 'author_02',
            sourceHash,
          },
          now: timestamp,
        }),
      (error) => {
        assert.equal(error instanceof ContinuityCommandError, true);
        assert.equal(error.code, 'REVISION_CONFLICT');
        return true;
      },
    );

    initialized.connection.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
