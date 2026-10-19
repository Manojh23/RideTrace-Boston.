import { asyncHandler, readPagination, textFilter, escapeRegex } from '../lib/http.js';

export function stopRoutes(db, Router) {
  const router = Router();
  const collection = db.collection('mbtaStops');
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { page, limit, skip } = readPagination(req.query, 100);
      const search = textFilter(req.query.search, 100);
      const filter = search ? { stopName: { $regex: escapeRegex(search), $options: 'i' } } : {};
      const [stops, total] = await Promise.all([
        collection
          .find(filter, { projection: { _id: 0 } })
          .sort({ stopName: 1, stopId: 1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(filter),
      ]);
      res.json({ records: stops, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
    }),
  );
  return router;
}
