import test from 'node:test';
import assert from 'node:assert/strict';
import { attachVisitor, readVisitorCookie } from '../src/auth/visitor.js';

const secret = 'example-secret-value-that-is-not-production';
test('new browser gets signed anonymous cookie and stable visitor identity', () => {
  let cookie;
  const req = { headers: {} };
  const res = {
    append: (_key, value) => {
      cookie = value;
    },
  };
  attachVisitor(secret)(req, res, () => {});
  assert.match(cookie, /HttpOnly; SameSite=Lax/);
  assert.equal(readVisitorCookie(cookie, secret), req.visitorId);
});
test('tampered visitor cookies are rejected', () => {
  const id = 'a'.repeat(32);
  assert.equal(readVisitorCookie(`ridetrace_visitor=${id}.${'0'.repeat(64)}`, secret), null);
});
