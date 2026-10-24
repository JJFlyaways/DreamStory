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

    const aliases = await service.updateAliases({
      bookId: 'book_continuity_01',
      clientRequestId: '18b8654e-c799-4bf1-9999-838e356e79f1',
      entityId: 'entity_lyra',
      expectedBookRevision: 4,
      aliases: ['澜姐', '林编辑'],
      now: timestamp,
    });
    assert.equal(aliases.bookRevision, 5);
    assert.deepEqual(aliases.value.aliases, ['澜姐', '林编辑']);

    await assert.rejects(
      () =>
        service.appendFact({
          bookId: 'book_continuity_01',
          clientRequestId: 'a4a0f5f8-7a7d-4dc7-ae84-b9c96d0f55c1',
          expectedBookRevision: 5,
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
