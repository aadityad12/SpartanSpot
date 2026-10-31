import { colors } from './theme';

export type ParkingLot = {
  id: string;
  name: string;
  subtitle: string;
  available: number;
  total: number;
  unknown: number;
  walkMinutes: number | null;
  permit: string;
  tags: string[];
  mapX: number;
  mapY: number;
  destination: string | null;
  updatedAt: string | null;
};

export type ParkingFeed = {
  mode: 'demo' | 'live';
  updatedAt: string | null;
  lots: ParkingLot[];
};

export const demoFeed: ParkingFeed = {
  mode: 'demo',
  updatedAt: null,
  lots: [
    { id: 'south', name: 'South Garage', subtitle: 'South campus · 4 levels', available: 142, total: 480, unknown: 0, walkMinutes: 4, permit: 'Student & visitor', tags: ['Covered', 'EV charging', 'Accessible'], mapX: 73, mapY: 74, destination: null, updatedAt: null },
    { id: 'north', name: 'North Garage', subtitle: 'North campus · 3 levels', available: 68, total: 320, unknown: 0, walkMinutes: 6, permit: 'Student & staff', tags: ['Covered', 'Accessible'], mapX: 64, mapY: 21, destination: null, updatedAt: null },
    { id: 'west', name: 'West Lot', subtitle: 'West campus · Surface lot', available: 23, total: 110, unknown: 0, walkMinutes: 3, permit: 'Student & visitor', tags: ['EV charging', 'Accessible'], mapX: 19, mapY: 53, destination: null, updatedAt: null },
    { id: 'east', name: 'East Garage', subtitle: 'East campus · 3 levels', available: 0, total: 240, unknown: 0, walkMinutes: 8, permit: 'Staff only', tags: ['Covered', 'Accessible'], mapX: 88, mapY: 40, destination: null, updatedAt: null },
  ],
};

function isLot(value: unknown): value is ParkingLot {
  if (!value || typeof value !== 'object') return false;
  const lot = value as ParkingLot;
  return typeof lot.id === 'string' && typeof lot.name === 'string'
    && typeof lot.subtitle === 'string' && typeof lot.permit === 'string'
    && [lot.available, lot.total, lot.unknown, lot.mapX, lot.mapY].every(Number.isFinite)
    && lot.available >= 0 && lot.total >= 0 && lot.unknown >= 0
    && lot.available + lot.unknown <= lot.total
    && lot.mapX >= 0 && lot.mapX <= 100 && lot.mapY >= 0 && lot.mapY <= 100
    && (lot.walkMinutes === null || (Number.isFinite(lot.walkMinutes) && lot.walkMinutes >= 0))
    && Array.isArray(lot.tags) && lot.tags.every(tag => typeof tag === 'string')
    && (lot.destination === null || typeof lot.destination === 'string')
    && (lot.updatedAt === null || (typeof lot.updatedAt === 'string' && Number.isFinite(Date.parse(lot.updatedAt))));
}

export async function fetchParkingFeed(baseUrl: string): Promise<ParkingFeed> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/lots`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Parking server returned ${response.status}`);
    const feed = await response.json();
    if (feed.mode !== 'live' || !Array.isArray(feed.lots) || !feed.lots.every(isLot)
      || !(feed.updatedAt === null || (typeof feed.updatedAt === 'string' && Number.isFinite(Date.parse(feed.updatedAt))))
      || new Set(feed.lots.map((lot: ParkingLot) => lot.id)).size !== feed.lots.length) {
      throw new Error('The parking server returned an invalid response.');
    }
    return feed;
  } finally {
    clearTimeout(timeout);
  }
}

export function availability(lot: ParkingLot, stale = false) {
  if (stale || !lot.total || lot.unknown === lot.total) return { label: 'No current data', color: colors.muted };
  if (lot.available === 0) return { label: lot.unknown ? 'Availability unknown' : 'Full', color: colors.occupied };
  if (lot.available / lot.total < 0.12) return { label: 'Filling up', color: colors.amber };
  return { label: 'Spots available', color: colors.available };
}
