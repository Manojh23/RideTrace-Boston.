import { MongoClient } from 'mongodb';

let client;
let database;

export async function connectDatabase(uri, name) {
  if (database) return database;
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 7000 });
  await client.connect();
  database = client.db(name);
  await Promise.all([
    database.collection('commuteLogs').createIndex({ ownerId: 1, date: -1 }),
    database.collection('transferReports').createIndex({ observedAt: -1 }),
    database.collection('transferReports').createIndex({ stopName: 1, daypart: 1 }),
    database.collection('mbtaStops').createIndex({ stopName: 1 }),
  ]);
  return database;
}

export function getDatabase() {
  if (!database) throw new Error('Database not connected.');
  return database;
}

export async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}
