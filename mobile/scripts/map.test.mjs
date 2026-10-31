import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = mkdtempSync(join(tmpdir(), 'spartanspot-map-test-'));
after(() => rmSync(build, { recursive: true, force: true }));
// Exercise the actual app modules without introducing a test-framework dependency.
for (const file of ['maps/campusGeometry', 'maps/geography', 'mock/garages', 'mock/reservations', 'mock/people', 'data', 'theme']) {
  const destination = join(build, `${file}.js`);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, ts.transpileModule(readFileSync(join(root, `src/${file}.ts`), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
}
const require = createRequire(import.meta.url);
const { campusGeometry } = require(join(build, 'maps/campusGeometry.js'));
const { parkingLocations, projectCoordinate, areaForCoordinate } = require(join(build, 'maps/geography.js'));
const { garages, getSpot, getSpots, garageSummary } = require(join(build, 'mock/garages.js'));
const { seedReservations } = require(join(build, 'mock/reservations.js'));
const { fetchParkingFeed } = require(join(build, 'data.js'));

function contains(polygon, x, y) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

test('every garage pin lands inside its OSM building footprint', () => {
  for (const [id, location] of Object.entries(parkingLocations)) {
    const map = campusGeometry[location.area];
    const point = projectCoordinate(location, location.area);
    const footprints = map.paths.garages.split('M').filter(Boolean).map(path =>
      [...path.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(match => [Number(match[1]), Number(match[2])]));
    assert.ok(footprints.some(polygon => contains(polygon, point.x * map.width, point.y * map.height)), `${id} pin must overlay its garage`);
    assert.ok(point.x > 0.15 && point.x < 0.85 && point.y > 0.15 && point.y < 0.92, `${id} marker must fit the mobile viewport`);
  }
});

test('Main and South Campus remain geographically separate; outside coordinates are never clamped', () => {
  assert.equal(areaForCoordinate(parkingLocations['south-campus']), 'south');
  for (const id of ['north', 'south', 'west']) assert.equal(areaForCoordinate(parkingLocations[id]), 'main');
  assert.equal(areaForCoordinate({ latitude: 0, longitude: 0 }), null);
  assert.ok(projectCoordinate(parkingLocations['south-campus'], 'main').y > 1);
});

test('floor-count corrections preserve reservation references and shared availability totals', () => {
  for (const reservation of seedReservations) assert.ok(getSpot(reservation.spotId), reservation.spotId);
  for (const garage of garages) {
    assert.equal(garageSummary(garage.id).total, getSpots(garage.id).length);
    assert.equal(getSpots(garage.id, garage.levels + 1).length, 0);
  }
});

const liveLot = { id: 'camera-lot', name: 'Camera lot', subtitle: '', available: 1, total: 2, unknown: 0,
  walkMinutes: null, permit: '', tags: [], mapX: 50, mapY: 50, destination: null, updatedAt: null };
async function parseLocation(location, include = true) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ mode: 'live', updatedAt: null,
    lots: [{ ...liveLot, ...(include ? { location } : {}) }] }) });
  try { return await fetchParkingFeed('http://localhost'); }
  finally { globalThis.fetch = originalFetch; }
}
test('legacy camera feeds without coordinates still load without acquiring a fictional pin', async () => {
  const feed = await parseLocation(undefined, false);
  assert.equal(feed.lots[0].location, undefined);
});
test('live coordinates accept real locations and reject malformed or out-of-range pairs', async () => {
  const feed = await parseLocation(parkingLocations.south);
  assert.equal(areaForCoordinate(feed.lots[0].location), 'main');
  for (const location of [{ latitude: 91, longitude: 0 }, { latitude: 37, longitude: -181 },
    { latitude: '37', longitude: -121 }, { latitude: 37 }, { latitude: NaN, longitude: 0 }, 'main']) {
    await assert.rejects(parseLocation(location), /invalid response/);
  }
});
