import { ObjectId } from 'mongodb';
import {
  asyncHandler,
  escapeRegex,
  HttpError,
  parseId,
  readPagination,
  textFilter,
} from '../../lib/http.js';
import { transferStats } from './statistics.js';
import { DAYPARTS, validateTransfer } from './validation.js';

function transferFilter(query) {
  const stop = textFilter(query.stop, 110);
  const from = textFilter(query.from, 70);
  const to = textFilter(query.to, 70);
  const daypart = textFilter(query.daypart, 15);
  const filter = {};
  if (stop) filter.stopName = { $regex: escapeRegex(stop), $options: 'i' };
  if (from) filter.fromRoute = { $regex: escapeRegex(from), $options: 'i' };
  if (to) filter.toRoute = { $regex: escapeRegex(to), $options: 'i' };
  if (daypart) {
    if (!DAYPARTS.includes(daypart)) throw new HttpError(400, 'Invalid time of day.');
    filter.daypart = daypart;
  }
  return filter;
}

export function transferRoutes(db, Router) {
  const router = Router();
  const collection = db.collection('transferReports');

  router.get(
    '/stats',
    asyncHandler(async (req, res) => {
      const filter = transferFilter(req.query);
      const reports = await collection
        .find(filter)
        .sort({ observedAt: -1, _id: -1 })
        .limit(2500)
        .toArray();
      res.json({
        ...transferStats(reports),
        analyzedRecords: reports.length,
        maximumAnalyzed: 2500,
      });
    }),
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const filter = transferFilter(req.query);
      const { page, limit, skip } = readPagination(req.query);
      const [records, total] = await Promise.all([
        collection.find(filter).sort({ observedAt: -1, _id: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);
      res.json({
        records: records.map(({ ownerId, ...record }) => ({
          ...record,
          isMine: ownerId === req.visitorId,
        })),
        total,
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
      });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const fields = validateTransfer(req.body);
      const now = new Date();
      const record = { ...fields, ownerId: req.visitorId, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(record);
      const { ownerId: _ownerId, ...publicRecord } = { ...record, _id: result.insertedId };
      void _ownerId;
      res.status(201).json({ ...publicRecord, isMine: true });
    }),
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const _id = new ObjectId(parseId(req.params.id));
      const fields = validateTransfer(req.body);
      const updated = await collection.findOneAndUpdate(
        { _id, ownerId: req.visitorId },
        { $set: { ...fields, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      if (!updated)
        throw new HttpError(404, 'Transfer report not found or not owned by this browser.');
      const { ownerId: _ownerId, ...record } = updated;
      void _ownerId;
      res.json({ ...record, isMine: true });
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
        throw new HttpError(404, 'Transfer report not found or not owned by this browser.');
      res.status(204).end();
    }),
  );

  return router;
}
