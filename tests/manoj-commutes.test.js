import test from 'node:test';
import assert from 'node:assert/strict';
import { commuteStats } from '../src/features/manoj/statistics.js';

const logs = [
  { route: 'Red', date: '2026-09-14', expectedMinutes: 20, actualMinutes: 20 },
  { route: 'Red', date: '2026-09-15', expectedMinutes: 20, actualMinutes: 25 },
  { route: 'Orange', date: '2026-09-16', expectedMinutes: 20, actualMinutes: 40 },
  { route: 'Red', date: '2026-09-17', expectedMinutes: 20, actualMinutes: 18 },
  { route: 'Red', date: '2026-09-18', expectedMinutes: 20, actualMinutes: 32 },
];
test('empty commute dashboard has no imaginary buffer', () => {
  assert.equal(commuteStats([]).bufferMinutes, 0);
  assert.equal(commuteStats([]).count, 0);
});
test('buffer uses 80th percentile and rounds upward to 5 minutes', () => {
  const stats = commuteStats(logs);
  assert.equal(stats.count, 5);
  assert.equal(stats.bufferMinutes, 15);
  assert.equal(stats.onTimePercent, 40);
  assert.equal(stats.routeCount, 2);
  assert.equal(stats.delayByDay.length, 7);
});
test('sample sizes below 3 do not overstate buffer reliability', () => {
  assert.equal(commuteStats(logs.slice(0, 2)).bufferMinutes, 0);
});

import { validateCommute } from '../src/features/manoj/validation.js';

const date = '2026-09-12';
const commute = {
  route: 'Orange Line',
  date,
  expectedMinutes: 30,
  actualMinutes: 39,
  delayReason: 'Crowding',
  notes: '',
};
test('validates a commute without changing meaningful values', () => {
  assert.equal(validateCommute(commute).route, 'Orange Line');
});
test('rejects a future commute', () => {
  assert.throws(() => validateCommute({ ...commute, date: '2099-01-01' }), /future/);
});
test('rejects unknown fields and non-numeric durations', () => {
  assert.throws(() => validateCommute({ ...commute, ownerId: 'admin' }), /Unknown field/);
  assert.throws(() => validateCommute({ ...commute, actualMinutes: '25' }), /whole number/);
});
