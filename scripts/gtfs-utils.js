import { inflateRawSync } from 'node:zlib';

// Parse a standard GTFS CSV including quoted commas, embedded line breaks, and escaped quotes.
export function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (char === '"') {
      if (quoted && csv[i + 1] === '"') {
        field += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && csv[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
    } else field += char;
  }
  if (quoted) throw new Error('Unterminated quoted GTFS CSV field.');
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (!rows.length) return [];
  const [headers, ...data] = rows;
  headers[0] = headers[0].replace(/^\uFEFF/, '');
  return data.map((values) =>
    Object.fromEntries(headers.map((header, i) => [header, values[i] || ''])),
  );
}

// Minimal central-directory ZIP reader (stored/deflate entries only). No third-party library.
export function readZipEntry(zip, target) {
  let end = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i -= 1) {
    if (zip.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end === -1) throw new Error('ZIP end-of-central-directory not found.');
  const count = zip.readUInt16LE(end + 10);
  let pos = zip.readUInt32LE(end + 16);
  for (let i = 0; i < count; i += 1) {
    if (zip.readUInt32LE(pos) !== 0x02014b50) throw new Error('Invalid ZIP central directory.');
    const method = zip.readUInt16LE(pos + 10);
    const compressed = zip.readUInt32LE(pos + 20);
    const uncompressed = zip.readUInt32LE(pos + 24);
    const filenameLength = zip.readUInt16LE(pos + 28);
    const extraLength = zip.readUInt16LE(pos + 30);
    const commentLength = zip.readUInt16LE(pos + 32);
    const offset = zip.readUInt32LE(pos + 42);
    const filename = zip.subarray(pos + 46, pos + 46 + filenameLength).toString('utf8');
    pos += 46 + filenameLength + extraLength + commentLength;
    if (filename !== target) continue;
    if (uncompressed > 30 * 1024 * 1024) throw new Error('GTFS entry exceeds safe size limit.');
    if (zip.readUInt32LE(offset) !== 0x04034b50) throw new Error('Invalid ZIP local header.');
    const start = offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28);
    const payload = zip.subarray(start, start + compressed);
    const output = method === 8 ? inflateRawSync(payload) : method === 0 ? payload : null;
    if (!output) throw new Error('Unsupported ZIP compression method.');
    if (output.length !== uncompressed) throw new Error('Invalid uncompressed GTFS file length.');
    return output.toString('utf8');
  }
  throw new Error(`Missing ${target} in GTFS ZIP.`);
}

export function normalizeStops(csv) {
  const unique = new Map();
  for (const item of parseCsv(csv)) {
    if (!item.stop_id || !item.stop_name) continue;
    if (!['', '0', '1'].includes(item.location_type)) continue; // stop/platform or station
    unique.set(item.stop_id, {
      stopId: item.stop_id,
      stopName: item.stop_name,
      locationType: item.location_type === '1' ? 'station' : 'stop/platform',
      parentStation: item.parent_station || null,
      latitude: Number(item.stop_lat) || null,
      longitude: Number(item.stop_lon) || null,
    });
  }
  return [...unique.values()];
}
