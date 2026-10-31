export type SpotStatus = 'available' | 'occupied' | 'reserved' | 'unknown';
export type SpotFeature = 'elevator' | 'accessible' | 'ev' | 'compact';
export type Spot = {
  id: string;
  garageId: string;
  level: number;
  row: string;
  number: number;
  label: string;
  status: SpotStatus;
  features: SpotFeature[];
};
export type Garage = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  description: string;
  levels: number;
  rows: string[];
  spotsPerRow: number;
  walkMinutes: number;
  hours: string;
  permits: string[];
  amenities: string[];
  cameraMonitored: boolean;
  mapX: number;
  mapY: number;
};
export type LevelSummary = {
  level: number;
  total: number;
  available: number;
  occupied: number;
  reserved: number;
};

type GarageConfig = Garage & { occupancy: number };

const configs: GarageConfig[] = [
  {
    id: 'north',
    name: 'North Garage',
    shortName: 'North',
    address: '65 S 10th St',
    description: 'Closest to the engineering buildings and the busiest garage at midday.',
    levels: 4,
    rows: ['A', 'B', 'C', 'D'],
    spotsPerRow: 12,
    walkMinutes: 6,
    hours: 'Open 24/7',
    permits: ['Student', 'Employee'],
    amenities: ['Covered', 'Accessible', 'EV charging'],
    cameraMonitored: true,
    mapX: 64,
    mapY: 21,
    occupancy: 0.82,
  },
  {
    id: 'south',
    name: 'South Garage',
    shortName: 'South',
    address: '377 S 7th St',
    description: 'Next to the Student Union and the rec center, with the most EV chargers on campus.',
    levels: 5,
    rows: ['A', 'B', 'C', 'D'],
    spotsPerRow: 12,
    walkMinutes: 4,
    hours: 'Open 24/7',
    permits: ['Student', 'Visitor'],
    amenities: ['Covered', 'EV charging', 'Accessible'],
    cameraMonitored: true,
    mapX: 73,
    mapY: 74,
    occupancy: 0.68,
  },
  {
    id: 'west',
    name: 'West Garage',
    shortName: 'West',
    address: '350 S 4th St',
    description: 'A tall garage near the library that fills up early on weekdays.',
    levels: 6,
    rows: ['A', 'B', 'C', 'D'],
    spotsPerRow: 12,
    walkMinutes: 5,
    hours: 'Open 24/7',
    permits: ['Student', 'Employee', 'Visitor'],
    amenities: ['Covered', 'Accessible'],
    cameraMonitored: false,
    mapX: 19,
    mapY: 53,
    occupancy: 0.9,
  },
  {
    id: 'south-campus',
    name: 'South Campus Lot',
    shortName: 'South Campus',
    address: '1251 S 10th St',
    description: 'A large surface lot with a shuttle to the main campus and plenty of room all day.',
    levels: 1,
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    spotsPerRow: 15,
    walkMinutes: 15,
    hours: '6 AM – 11 PM',
    permits: ['Student', 'Park & Ride'],
    amenities: ['Accessible'],
    cameraMonitored: false,
    mapX: 88,
    mapY: 88,
    occupancy: 0.35,
  },
];

export const garages: Garage[] = configs.map(({ occupancy: _occupancy, ...garage }) => garage);

export function getGarage(id: string): Garage | undefined {
  return garages.find(garage => garage.id === id);
}

// FNV-1a hash mapped to [0, 1) so the same spot always gets the same value.
function seeded(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  return (hash >>> 0) / 4294967296;
}

function featuresFor(garage: Garage, row: string, number: number): SpotFeature[] {
  const features: SpotFeature[] = [];
  if (number <= 2) features.push('elevator');
  if (row === 'A' && number <= 2) features.push('accessible');
  if (row === 'D' && number >= 11 && number <= 12) features.push('ev');
  if (row === garage.rows[garage.rows.length - 1] && number >= 5 && number <= 6) features.push('compact');
  return features;
}

function buildLevel(config: GarageConfig, level: number): Spot[] {
  const spots: Spot[] = [];
  for (const row of config.rows) {
    for (let number = 1; number <= config.spotsPerRow; number += 1) {
      const id = `${config.id}-${level}-${row}${number}`;
      spots.push({
        id,
        garageId: config.id,
        level,
        row,
        number,
        label: `${level}-${row}${number.toString().padStart(2, '0')}`,
        status: seeded(`occupied:${id}`) < config.occupancy ? 'occupied' : 'available',
        features: featuresFor(config, row, number),
      });
    }
  }
  // Reserve the two free spots with the lowest hash so every level has exactly two.
  spots
    .filter(spot => spot.status === 'available')
    .sort((first, second) => seeded(`reserved:${first.id}`) - seeded(`reserved:${second.id}`))
    .slice(0, 2)
    .forEach(spot => { spot.status = 'reserved'; });
  return spots;
}

const levelCache = new Map<string, Spot[]>();

function levelSpots(garageId: string, level: number): Spot[] {
  const key = `${garageId}:${level}`;
  const cached = levelCache.get(key);
  if (cached) return cached;
  const config = configs.find(item => item.id === garageId);
  const spots = config && level >= 1 && level <= config.levels ? buildLevel(config, level) : [];
  levelCache.set(key, spots);
  return spots;
}

export function getSpots(garageId: string, level?: number): Spot[] {
  const garage = getGarage(garageId);
  if (!garage) return [];
  if (level !== undefined) return levelSpots(garageId, level);
  const key = `${garageId}:all`;
  const cached = levelCache.get(key);
  if (cached) return cached;
  const all: Spot[] = [];
  for (let current = 1; current <= garage.levels; current += 1) all.push(...levelSpots(garageId, current));
  levelCache.set(key, all);
  return all;
}

export function getSpot(spotId: string): Spot | undefined {
  const match = /^(.+)-(\d+)-([A-Z])(\d+)$/.exec(spotId);
  if (!match) return undefined;
  return levelSpots(match[1], Number(match[2])).find(spot => spot.id === spotId);
}

export function summarize(spots: Spot[]): Omit<LevelSummary, 'level'> {
  const counts = { total: spots.length, available: 0, occupied: 0, reserved: 0 };
  for (const spot of spots) {
    if (spot.status === 'available') counts.available += 1;
    else if (spot.status === 'occupied') counts.occupied += 1;
    else if (spot.status === 'reserved') counts.reserved += 1;
  }
  return counts;
}

// `statusOf` lets callers apply live overrides (reservations, admin holds) on top of the base status.
export function garageSummary(
  garageId: string,
  statusOf: (spot: Spot) => SpotStatus = spot => spot.status,
): Omit<LevelSummary, 'level'> & { byLevel: LevelSummary[] } {
  const garage = getGarage(garageId);
  const byLevel: LevelSummary[] = [];
  for (let level = 1; level <= (garage?.levels ?? 0); level += 1) {
    const spots = getSpots(garageId, level).map(spot => ({ ...spot, status: statusOf(spot) }));
    byLevel.push({ level, ...summarize(spots) });
  }
  const total = byLevel.reduce(
    (sum, item) => ({
      total: sum.total + item.total,
      available: sum.available + item.available,
      occupied: sum.occupied + item.occupied,
      reserved: sum.reserved + item.reserved,
    }),
    { total: 0, available: 0, occupied: 0, reserved: 0 },
  );
  return { ...total, byLevel };
}
