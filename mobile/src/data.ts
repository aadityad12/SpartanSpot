import { garages, garageSummary } from './mock/garages';
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

// Derived from the shared garage data so Find-tab counts always match garage details.
const demoLots: ParkingLot[] = garages.map(garage => {
  const summary = garageSummary(garage.id);
  return {
    id: garage.id,
    name: garage.name,
    subtitle: `${garage.shortName.replace(/ Campus$/, '')} campus · ${garage.levels === 1 ? 'Surface lot' : `${garage.levels} levels`}`,
    available: summary.available,
    total: summary.total,
    unknown: 0,
    walkMinutes: garage.walkMinutes,
    permit: garage.permits.join(' & '),
    tags: garage.amenities,
    mapX: garage.mapX,
    mapY: garage.mapY,
    destination: null,
    updatedAt: null,
  };
});

export const demoFeed: ParkingFeed = {
  mode: 'demo',
  updatedAt: null,
  lots: demoLots,
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
