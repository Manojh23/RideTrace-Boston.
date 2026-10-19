import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, normalizeStops, readZipEntry } from '../scripts/gtfs-utils.js';
import { deflateRawSync } from 'node:zlib';

test('GTFS parser handles escaped commas, quotes and newlines', () => {
  const rows = parseCsv(
    'stop_id,stop_name,location_type\r\n1,"Park, South",0\r\n2,"City ""Center""\nLine",1\r\n',
  );
  assert.equal(rows[0].stop_name, 'Park, South');
  assert.equal(rows[1].stop_name, 'City "Center"\nLine');
});
test('filters unrelated GTFS entrance records', () => {
  const csv =
    'stop_id,stop_name,location_type,stop_lat,stop_lon\n1,Park,0,42.3,-71.1\n2,Entrance,2,42.3,-71.1\n3,Central,1,42.3,-71.1\n';
  assert.equal(normalizeStops(csv).length, 2);
});
test('extracts deflated stops.txt from ZIP central directory', () => {
  const name = Buffer.from('stops.txt');
  const original = Buffer.from('stop_id,stop_name\n1,Central\n');
  const compressed = deflateRawSync(original);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(original.length, 22);
  local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(original.length, 24);
  central.writeUInt16LE(name.length, 28);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12);
  end.writeUInt32LE(local.length + name.length + compressed.length, 16);
  const zip = Buffer.concat([local, name, compressed, central, name, end]);
  assert.equal(readZipEntry(zip, 'stops.txt'), original.toString());
});
