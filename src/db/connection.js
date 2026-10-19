import { MongoClient } from 'mongodb';

let client;
let database;
let connecting;

export async function connectDatabase(uri, name) {
  if (database) return database;
  if (connecting) return connecting;
  const candidate = new MongoClient(uri, {
    serverSelectionTimeoutMS: 7000,
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 60000,
  });
  connecting = (async () => {
    try {
      await candidate.connect();
      const db = candidate.db(name);
      await Promise.all([
        db.collection('commuteLogs').createIndex({ ownerId: 1, date: -1 }),
        db.collection('transferReports').createIndex({ observedAt: -1 }),
        db.collection('transferReports').createIndex({ stopName: 1, daypart: 1 }),
        db.collection('mbtaStops').createIndex({ stopName: 1 }),
      ]);
      client = candidate;
      database = db;
      return database;
    } catch (error) {
      await candidate.close().catch(() => {});
      throw error;
    } finally {
      connecting = undefined;
    }
  })();
  return connecting;
}

export function getDatabase() {
  if (!database) throw new Error('Database not connected.');
  return database;
}

export async function closeDatabase() {
  if (connecting) await connecting.catch(() => {});
  if (client) await client.close();
  client = undefined;
  database = undefined;
}
