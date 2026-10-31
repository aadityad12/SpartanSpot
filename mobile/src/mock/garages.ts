import { estimatedWalkMinutes, parkingLocations, type Coordinate } from '../maps/geography';

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
  location: Coordinate;
};
export type LevelSummary = {
  level: number;
  total: number;
  available: number;
  occupied: number;
  reserved: number;
};

type GarageConfig = Omit<Garage, 'location' | 'walkMinutes'> & { occupancy: number };

// Lower levels fill first, so the busiest level runs about this many points above the top one.
// The offsets are symmetric around the garage's target, which keeps the overall average on target.
const LEVEL_SPREAD = 0.09;

function levelOccupancy(config: GarageConfig, level: number): number {
  if (config.levels === 1) return config.occupancy;
  const middle = (config.levels + 1) / 2;
  const offset = ((middle - level) / (config.levels - 1)) * LEVEL_SPREAD;
  return Math.min(0.96, Math.max(0.05, config.occupancy + offset));
}

const configs: GarageConfig[] = [
  {
    id: 'north',
    name: 'North Garage',
    shortName: 'North',
    address: '65 S 10th St',
    description: 'Across E. San Fernando Street from the northeast corner of Main Campus. Vehicle entrance on E. San Fernando Street.',
    levels: 6,
    rows: ['A', 'B', 'C', 'D'],
    spotsPerRow: 12,
    hours: '7 AM – midnight; overnight access depends on permit',
    permits: ['Student', 'Employee'],
    amenities: ['Covered', 'Accessible', 'EV charging'],
    cameraMonitored: true,
    occupancy: 0.82,
  },
  {
    id: 'south',
    name: 'South Garage',
    shortName: 'South',
    address: '377 S 7th St',
    description: 'At S. 7th and E. San Salvador Streets on the south edge of Main Campus. Vehicle entrance on S. 7th Street.',
    levels: 5,
    rows: ['A', 'B', 'C', 'D'],
    spotsPerRow: 12,
    hours: '7 AM – midnight; overnight access depends on permit',
    permits: ['Student', 'Visitor'],
    amenities: ['Covered', 'EV charging', 'Accessible'],
    cameraMonitored: true,
    occupancy: 0.68,
  },
  {
    id: 'west',
    name: 'West Garage',
    shortName: 'West',
    address: '350 S 4th St',
    description: 'At S. 4th and E. San Salvador Streets, at the southwest corner of Main Campus. Entrances on both streets.',
    levels: 5,
    rows: ['A', 'B', 'C', 'D'],
    spotsPerRow: 12,
    hours: '7 AM – midnight; overnight access depends on permit',
    permits: ['Student', 'Employee', 'Visitor'],
    amenities: ['Covered', 'Accessible'],
    cameraMonitored: false,
    occupancy: 0.9,
  },
  {
    id: 'south-campus',
    name: 'South Campus Garage',
    shortName: 'South Campus',
    address: '1278 S 10th St',
    description: 'At S. 10th Street and E. Alma Avenue, eight blocks south of Main Campus. Entrances on 10th and Alma; campus shuttle service runs on a published schedule.',
    levels: 4,
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    spotsPerRow: 15,
    hours: '7 AM – 10 PM',
    permits: ['Student', 'Park & Ride'],
    amenities: ['Covered', 'Accessible'],
    cameraMonitored: false,
    occupancy: 0.35,
  },
];

export const garages: Garage[] = configs.map(({ occupancy: _occupancy, ...garage }) => ({
  ...garage,
  location: parkingLocations[garage.id],
  walkMinutes: estimatedWalkMinutes(parkingLocations[garage.id]),
}));

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

function featuresFor(garage: GarageConfig, row: string, number: number): SpotFeature[] {
  const features: SpotFeature[] = [];
  if (number <= 2) features.push('elevator');
  if (row === 'A' && number <= 2) features.push('accessible');
  if (garage.amenities.includes('EV charging') && row === 'D' && number >= 11 && number <= 12) features.push('ev');
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
        status: 'available',
        features: featuresFor(config, row, number),
      });
    }
  }
  // Rank spots by hash and take the first slice, so each level lands on its target occupancy
  // exactly while the pattern still looks random. Two of the remaining spots are reserved.
  const byRank = (prefix: string) => (first: Spot, second: Spot) =>
    seeded(`${prefix}:${first.id}`) - seeded(`${prefix}:${second.id}`);
  const occupiedCount = Math.round(spots.length * levelOccupancy(config, level));
  [...spots].sort(byRank('occupied')).slice(0, occupiedCount).forEach(spot => { spot.status = 'occupied'; });
  spots
    .filter(spot => spot.status === 'available')
    .sort(byRank('reserved'))
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
