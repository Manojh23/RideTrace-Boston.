import { ObjectId } from 'mongodb';
import {
  asyncHandler,
  escapeRegex,
  HttpError,
  parseId,
  readPagination,
  textFilter,
} from '../../lib/http.js';
import { validateCommute } from './validation.js';
import { commuteStats } from './statistics.js';

export function commuteRoutes(db, Router) {
  const router = Router();
  const collection = db.collection('commuteLogs');

  router.get(
    '/stats',
    asyncHandler(async (req, res) => {
      const route = textFilter(req.query.route, 70);
      const filter = { ownerId: req.visitorId };
      if (route) filter.route = { $regex: `^${escapeRegex(route)}$`, $options: 'i' };
      const logs = await collection.find(filter).sort({ date: -1, _id: -1 }).limit(2500).toArray();
      res.json({ ...commuteStats(logs), analyzedRecords: logs.length, maximumAnalyzed: 2500 });
    }),
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { page, limit, skip } = readPagination(req.query);
      const route = textFilter(req.query.route, 70);
      const day = textFilter(req.query.day, 9);
      const filter = { ownerId: req.visitorId };
      if (route) filter.route = { $regex: escapeRegex(route), $options: 'i' };
      if (day) {
        if (!['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(day))
          throw new HttpError(400, 'Invalid day.');
        // Date day-of-week is calculated using MongoDB expressions rather than locale-sensitive JS.
        filter.$expr = {
          $eq: [
            { $dayOfWeek: { $dateFromString: { dateString: '$date' } } },
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day) + 1,
          ],
        };
      }
      const [records, total] = await Promise.all([
        collection.find(filter).sort({ date: -1, _id: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);
      res.json({ records, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const fields = validateCommute(req.body);
      const now = new Date();
      const record = { ...fields, ownerId: req.visitorId, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(record);
      res.status(201).json({ ...record, _id: result.insertedId });
    }),
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const _id = new ObjectId(parseId(req.params.id));
      const fields = validateCommute(req.body);
      const result = await collection.findOneAndUpdate(
        { _id, ownerId: req.visitorId },
        { $set: { ...fields, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      if (!result) throw new HttpError(404, 'Commute not found or not owned by this browser.');
      res.json(result);
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const result = await collection.deleteOne({
        _id: new ObjectId(parseId(req.params.id)),
        ownerId: req.visitorId,
      });
      if (!result.deletedCount)
        throw new HttpError(404, 'Commute not found or not owned by this browser.');
      res.status(204).end();
    }),
  );
  return router;
}
