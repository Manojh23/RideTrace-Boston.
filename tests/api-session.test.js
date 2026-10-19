import test from 'node:test';
import assert from 'node:assert/strict';

test('parallel API requests wait for one completed browser-session handshake', async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  const calls = [];
  let cookieEstablished = false;
  globalThis.fetch = async (path, options) => {
    calls.push(path);
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.cache, 'no-store');
    if (path === '/api/session') {
      await ready;
      cookieEstablished = true;
      return { ok: true };
    }
    assert.equal(cookieEstablished, true);
    return { status: 200, ok: true, json: async () => ({ records: [] }) };
  };
  const { api } = await import('../public/js/api.js?session-order');
  const requests = [api('/commutes'), api('/commutes/stats')];
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls, ['/api/session']);
  release();
  await Promise.all(requests);
  assert.deepEqual(calls, ['/api/session', '/api/commutes', '/api/commutes/stats']);
});

test('failed browser-session initialization blocks data requests and can be retried', async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  let attempts = 0;
  const calls = [];
  globalThis.fetch = async (path) => {
    calls.push(path);
    if (path === '/api/session') return { ok: ++attempts > 1 };
    return { status: 200, ok: true, json: async () => ({ count: 0 }) };
  };
  const { api } = await import('../public/js/api.js?session-retry');
  await assert.rejects(api('/commutes'), /Could not contact the server/);
  assert.deepEqual(calls, ['/api/session']);
  assert.deepEqual(await api('/commutes'), { count: 0 });
  assert.deepEqual(calls, ['/api/session', '/api/session', '/api/commutes']);
});
