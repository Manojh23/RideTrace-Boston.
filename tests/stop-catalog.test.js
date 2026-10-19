import test from 'node:test';
import assert from 'node:assert/strict';
import { removeExactStopDuplicates } from '../scripts/stop-catalog.js';

test('catalog repair preserves one original and deletes only explicit duplicate IDs', async () => {
  const deleted = [];
  const catalog = {
    aggregate(pipeline) {
      assert.deepEqual(Object.keys(pipeline[0].$group._id).sort(), [
        'latitude',
        'locationType',
        'longitude',
        'parentStation',
        'stopId',
        'stopName',
      ]);
      return (async function* () {
        yield { ids: ['keep-a', 'duplicate-a', 'duplicate-b'] };
        yield { ids: ['keep-b', 'duplicate-c'] };
      })();
    },
    async deleteMany(filter) {
      deleted.push(...filter._id.$in);
      return { deletedCount: filter._id.$in.length };
    },
  };
  assert.equal(await removeExactStopDuplicates(catalog), 3);
  assert.deepEqual(deleted, ['duplicate-a', 'duplicate-b', 'duplicate-c']);
});

test('a catalog without exact duplicates is left unchanged', async () => {
  const catalog = {
    aggregate: () => (async function* () {})(),
    deleteMany: () => assert.fail('No deletion should be requested'),
  };
  assert.equal(await removeExactStopDuplicates(catalog), 0);
});
