import test from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient } from 'mongodb';
import { connectDatabase, closeDatabase, getDatabase } from '../src/db/connection.js';

test('concurrent initialization shares one client and creates indexes once', async (t) => {
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  let connections = 0;
  let indexes = 0;
  let closes = 0;
  const db = {
    collection: () => ({
      createIndex: async () => {
        indexes += 1;
      },
    }),
  };
  t.mock.method(MongoClient.prototype, 'connect', async function () {
    connections += 1;
    assert.equal(this.options.maxPoolSize, 10);
    await ready;
    return this;
  });
  t.mock.method(MongoClient.prototype, 'db', () => db);
  t.mock.method(MongoClient.prototype, 'close', async () => {
    closes += 1;
  });
  try {
    const pending = Array.from({ length: 12 }, () =>
      connectDatabase('mongodb://localhost', 'test'),
    );
    assert.equal(connections, 1);
    assert.throws(getDatabase, /not connected/);
    release();
    const results = await Promise.all(pending);
    assert.equal(
      results.every((value) => value === db),
      true,
    );
    assert.equal(indexes, 2);
    assert.equal(await connectDatabase('mongodb://localhost', 'test'), db);
    assert.equal(connections, 1);
  } finally {
    await closeDatabase();
  }
  assert.equal(closes, 1);
});

test('a failed connection is closed and a later request can reconnect', async (t) => {
  let connections = 0;
  let closes = 0;
  const db = { collection: () => ({ createIndex: async () => {} }) };
  t.mock.method(MongoClient.prototype, 'connect', async function () {
    if (++connections === 1) throw new Error('Connection unavailable');
    return this;
  });
  t.mock.method(MongoClient.prototype, 'db', () => db);
  t.mock.method(MongoClient.prototype, 'close', async () => {
    closes += 1;
  });
  try {
    await assert.rejects(connectDatabase('mongodb://localhost', 'test'), /unavailable/);
    assert.throws(getDatabase, /not connected/);
    assert.equal(closes, 1);
    assert.equal(await connectDatabase('mongodb://localhost', 'test'), db);
    assert.equal(connections, 2);
  } finally {
    await closeDatabase();
  }
});

test('failed index initialization does not cache a partially initialized database', async (t) => {
  let failIndex = true;
  let connections = 0;
  const db = {
    collection: () => ({
      createIndex: async () => {
        if (failIndex) throw new Error('Index initialization failed');
      },
    }),
  };
  t.mock.method(MongoClient.prototype, 'connect', async function () {
    connections += 1;
    return this;
  });
  t.mock.method(MongoClient.prototype, 'db', () => db);
  t.mock.method(MongoClient.prototype, 'close', async () => {});
  try {
    await assert.rejects(connectDatabase('mongodb://localhost', 'test'), /Index initialization/);
    assert.throws(getDatabase, /not connected/);
    failIndex = false;
    assert.equal(await connectDatabase('mongodb://localhost', 'test'), db);
    assert.equal(connections, 2);
  } finally {
    await closeDatabase();
  }
});
