import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import { getConfig } from '../src/config.js';
import { normalizeStops, readZipEntry } from './gtfs-utils.js';
import { removeExactStopDuplicates } from './stop-catalog.js';

const SOURCE = 'https://cdn.mbta.com/MBTA_GTFS.zip';
const localFile = process.argv.find((arg) => arg.startsWith('--file='))?.slice('--file='.length);
const config = getConfig();

async function getFeed() {
  if (localFile) return readFile(localFile);
  console.log(`Downloading official MBTA GTFS from ${SOURCE} ...`);
  const response = await fetch(SOURCE, { signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(`MBTA GTFS download returned HTTP ${response.status}.`);
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > 120 * 1024 * 1024) throw new Error('Feed unexpectedly large; aborting.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

let client;
try {
  const feed = await getFeed();
  const stops = normalizeStops(readZipEntry(feed, 'stops.txt'));
  if (stops.length < 1001)
    throw new Error(
      `Expected over 1,000 real MBTA stops; found ${stops.length}. Refusing to replace the existing catalog.`,
    );
  client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(config.dbName);
  const catalog = db.collection('mbtaStops');
  // Non-destructive upsert. Preserves existing catalog in case of a failed download.
  for (let i = 0; i < stops.length; i += 500) {
    await catalog.bulkWrite(
      stops.slice(i, i + 500).map((stop) => ({
        updateOne: { filter: { stopId: stop.stopId }, update: { $set: stop }, upsert: true },
      })),
      { ordered: false },
    );
  }
  const removed = await removeExactStopDuplicates(catalog);
  if (removed) console.log(`Removed ${removed} identical duplicate catalog records.`);
  await catalog.createIndex({ stopId: 1 }, { unique: true });
  await catalog.createIndex({ stopName: 1 });
  console.log(
    `Import succeeded: ${stops.length} official MBTA stop/platform records; database has ${await catalog.countDocuments()} catalog records.`,
  );
  console.log(`Attribution: MBTA / MassDOT — ${SOURCE}`);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  if (client) await client.close();
}
