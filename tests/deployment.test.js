import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { MongoClient } from 'mongodb';
import { getConfig } from '../src/config.js';
import { closeDatabase } from '../src/db/connection.js';
import { readVisitorCookie } from '../src/auth/visitor.js';

test('production configuration requires a secret and an explicit database URI', () => {
  assert.throws(() => getConfig({ NODE_ENV: 'production' }), /APP_SECRET/);
  assert.throws(
    () => getConfig({ NODE_ENV: 'production', APP_SECRET: 's'.repeat(40) }),
    /MONGODB_URI/,
  );
  const config = getConfig({
    NODE_ENV: 'production',
    APP_SECRET: 's'.repeat(40),
    MONGODB_URI: 'mongodb://localhost',
  });
  assert.equal(config.production, true);
});

test('hosted app retries startup, sets secure identity, and serves both APIs through HTTP', async (t) => {
  let connections = 0;
  const filters = [];
  const db = {
    command: async () => ({ ok: 1 }),
    collection: (name) => ({
      createIndex: async () => {},
      countDocuments: async () => 0,
      find: (filter) => {
        filters.push({ name, filter });
        const cursor = {
          sort: () => cursor,
          skip: () => cursor,
          limit: () => cursor,
          toArray: async () => [],
        };
        return cursor;
      },
    }),
  };
  t.mock.method(MongoClient.prototype, 'connect', async function () {
    if (++connections === 1) throw new Error('Private connection diagnostic');
    return this;
  });
  t.mock.method(MongoClient.prototype, 'db', () => db);
  t.mock.method(MongoClient.prototype, 'close', async () => {});
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    APP_SECRET: process.env.APP_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
  };
  process.env.NODE_ENV = 'production';
  process.env.APP_SECRET = 'deployment-test-secret-not-a-real-credential';
  process.env.MONGODB_URI = 'mongodb://localhost';
  const { default: app } = await import('../src/app.js');
  assert.equal(connections, 0);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const unavailable = await fetch(`${base}/api/session`);
    assert.equal(unavailable.status, 503);
    assert.match(unavailable.headers.get('cache-control'), /no-store/);
    assert.doesNotMatch(JSON.stringify(await unavailable.json()), /Private connection diagnostic/);
    const session = await fetch(`${base}/api/session`);
    assert.equal(session.status, 200);
    assert.deepEqual(await session.json(), { status: 'ready' });
    const cookie = session.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly; SameSite=Lax; Secure/);
    const owner = readVisitorCookie(cookie, process.env.APP_SECRET);
    assert.ok(owner);
    const responses = await Promise.all(
      [
        '/api/commutes',
        '/api/commutes/stats',
        '/api/transfers',
        '/api/transfers/stats',
        '/api/health',
      ].map((path) => fetch(`${base}${path}`, { headers: { cookie: cookie.split(';')[0] } })),
    );
    for (const response of responses) {
      assert.equal(response.status, 200);
      assert.match(response.headers.get('cache-control'), /private, no-store/);
      assert.equal(response.headers.get('set-cookie'), null);
      await response.json();
    }
    assert.equal(connections, 2);
    assert.equal(
      filters
        .filter((item) => item.name === 'commuteLogs')
        .every((item) => item.filter.ownerId === owner),
      true,
    );
    assert.equal(
      filters
        .filter((item) => item.name === 'transferReports')
        .every((item) => item.filter.ownerId === undefined),
      true,
    );
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await closeDatabase();
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
