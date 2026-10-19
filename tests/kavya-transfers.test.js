import test from 'node:test';
import assert from 'node:assert/strict';
import { transferStats } from '../src/features/kavya/statistics.js';

test('transfer median and missed percentage', () => {
  const stats = transferStats([
    { transferMinutes: 5, missedConnection: false, observedAt: '2026-09-16' },
    { transferMinutes: 9, missedConnection: true, observedAt: '2026-09-15' },
    { transferMinutes: 22, missedConnection: false, observedAt: '2026-09-14' },
  ]);
  assert.equal(stats.medianMinutes, 9);
  assert.equal(stats.missedPercent, 33);
});

import { validateTransfer } from '../src/features/kavya/validation.js';

const date = '2026-09-12';
const transfer = {
  stopName: 'Downtown Crossing',
  fromRoute: 'Red Line',
  toRoute: 'Orange Line',
  observedAt: date,
  daypart: 'Morning',
  transferMinutes: 8,
  missedConnection: false,
  notes: 'Busy stairs',
};

test('validates transfer and requires boolean missedConnection', () => {
  assert.equal(validateTransfer(transfer).transferMinutes, 8);
  assert.throws(
    () => validateTransfer({ ...transfer, missedConnection: 'false' }),
    /true or false/,
  );
});
test('rejects overly long transfer notes', () => {
  assert.throws(() => validateTransfer({ ...transfer, notes: 'x'.repeat(601) }), /too long/);
});
