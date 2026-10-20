import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  getProjectDatabasePath,
  MigrationError,
  openProjectDatabase,
  openSqliteDatabase,
  probeProjectDatabase,
  readSchemaVersion,
  runMigrations,
} from '../dist/index.js';

async function createTestDirectory() {
  return mkdtemp(join(tmpdir(), 'dreamstory-storage-'));
}

async function removeTestDirectory(directory) {
  await rm(directory, { recursive: true, force: true });
}

test('opens a WAL database with foreign keys and a busy timeout', async () => {
  const directory = await createTestDirectory();
  try {
    const connection = openSqliteDatabase(join(directory, '.dreamstory', 'story.sqlite'));

    assert.deepEqual(connection.pragmas, {
      foreignKeysEnabled: true,
      journalMode: 'wal',
      busyTimeoutMs: 5000,
    });
    connection.db.exec(
      'CREATE TABLE parent (id INTEGER PRIMARY KEY); CREATE TABLE child (parent_id INTEGER REFERENCES parent(id));',
    );
    assert.throws(() => connection.db.prepare('INSERT INTO child (parent_id) VALUES (1)').run());
    connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});

test('creates a consistent backup before applying migrations', async () => {
  const directory = await createTestDirectory();
  try {
    const connection = openSqliteDatabase(join(directory, '.dreamstory', 'story.sqlite'));
    const result = await runMigrations(
      connection,
      [
        {
          version: 1,
          name: 'create_fixture',
          up: (database) => database.exec('CREATE TABLE fixture (value TEXT NOT NULL);'),
        },
        {
          version: 2,
          name: 'seed_fixture',
          up: (database) => database.prepare('INSERT INTO fixture (value) VALUES (?)').run('ready'),
        },
      ],
      {
        backupDirectory: join(directory, '.dreamstory', 'backups'),
        now: new Date('2026-10-20T12:34:56.789Z'),
      },
    );

    assert.equal(result.previousVersion, 0);
    assert.equal(result.currentVersion, 2);
    assert.deepEqual(result.appliedVersions, [1, 2]);
    assert.ok(result.backupPath);
    assert.equal(readSchemaVersion(connection.db), 2);
    assert.equal(connection.db.prepare('SELECT value FROM fixture').pluck().get(), 'ready');
    assert.equal(await readFile(result.backupPath, { encoding: 'utf8' }).then(() => true), true);
    connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});

test('rolls back all migrations when one migration fails', async () => {
  const directory = await createTestDirectory();
  try {
    const databasePath = join(directory, '.dreamstory', 'story.sqlite');
    const connection = openSqliteDatabase(databasePath);

    await assert.rejects(
      () =>
        runMigrations(
          connection,
          [
            {
              version: 1,
              name: 'create_fixture',
              up: (database) => database.exec('CREATE TABLE fixture (value TEXT NOT NULL);'),
            },
            {
              version: 2,
              name: 'fail_fixture',
              up: () => {
                throw new Error('fixture failure');
              },
            },
          ],
          { backupDirectory: join(directory, '.dreamstory', 'backups') },
        ),
      (error) => {
        assert.equal(error instanceof MigrationError, true);
        assert.ok(error.backupPath);
        return true;
      },
    );

    assert.equal(readSchemaVersion(connection.db), 0);
    assert.throws(() => connection.db.prepare('SELECT * FROM fixture').all());
    connection.close();
  } finally {
    await removeTestDirectory(directory);
  }
});

test('probes missing, ready, and invalid project databases', async () => {
  const directory = await createTestDirectory();
  try {
    const missing = probeProjectDatabase(directory);
    assert.equal(missing.status, 'missing');
    assert.equal(missing.databasePath, getProjectDatabasePath(directory));

    const connection = openProjectDatabase(directory);
    connection.close();
    const ready = probeProjectDatabase(directory);
    assert.equal(ready.status, 'ready');
    assert.equal(ready.schemaVersion, 0);
    assert.equal(ready.journalMode, 'wal');

    await writeFile(ready.databasePath, 'not a sqlite database');
    const invalid = probeProjectDatabase(directory);
    assert.equal(invalid.status, 'invalid');
  } finally {
    await removeTestDirectory(directory);
  }
});
