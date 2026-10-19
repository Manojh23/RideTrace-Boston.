// Keep one copy of identical reference records left by an interrupted import.
// Group by every catalog field so reports and differing stop data are never deleted.
export async function removeExactStopDuplicates(catalog) {
  const groups = catalog.aggregate([
    {
      $group: {
        _id: {
          stopId: '$stopId',
          stopName: '$stopName',
          locationType: '$locationType',
          parentStation: '$parentStation',
          latitude: '$latitude',
          longitude: '$longitude',
        },
        ids: { $push: '$_id' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);
  let removed = 0;
  for await (const group of groups) {
    const extras = group.ids.slice(1);
    for (let i = 0; i < extras.length; i += 500) {
      const result = await catalog.deleteMany({ _id: { $in: extras.slice(i, i + 500) } });
      removed += result.deletedCount;
    }
  }
  return removed;
}
