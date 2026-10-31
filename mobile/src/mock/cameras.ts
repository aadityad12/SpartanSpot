import { getGarage, getSpots, type Spot } from './garages';

export type CameraStatus = 'online' | 'degraded' | 'offline';

export type Camera = {
  id: string;
  garageId: string;
  level: number;
  name: string;
  status: CameraStatus;
  fps: number;
  avgConfidence: number;
  lastFrameSecondsAgo: number;
  model: string;
  spotIds: string[];
};

export type DetectionEvent = {
  at: string;
  cameraId: string;
  spotLabel: string;
  from: 'available' | 'occupied';
  to: 'available' | 'occupied';
  confidence: number;
};

export const MODEL_NAME = 'YOLO11n · parking-v3 (best_parking.pt)';

// Each camera watches two facing rows of seven stalls.
const COVERED_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

function coverage(garageId: string, level: number, rows: [string, string]): string[] {
  return getSpots(garageId, level)
    .filter(spot => rows.includes(spot.row) && COVERED_NUMBERS.includes(spot.number))
    .map(spot => spot.id);
}

// The dashboard reports 3 of 4 cameras online: a degraded camera is still sending frames,
// and W-L4-01 is the one that went offline.
export const cameras: Camera[] = [
  {
    id: 'N-L2-01',
    garageId: 'north',
    level: 2,
    name: 'North Garage · Level 2',
    status: 'online',
    fps: 14.8,
    avgConfidence: 0.93,
    lastFrameSecondsAgo: 1,
    model: MODEL_NAME,
    spotIds: coverage('north', 2, ['A', 'B']),
  },
  {
    id: 'N-L3-01',
    garageId: 'north',
    level: 3,
    name: 'North Garage · Level 3',
    status: 'degraded',
    fps: 6.2,
    avgConfidence: 0.78,
    lastFrameSecondsAgo: 7,
    model: MODEL_NAME,
    spotIds: coverage('north', 3, ['A', 'B']),
  },
  {
    id: 'S-L1-01',
    garageId: 'south',
    level: 1,
    name: 'South Garage · Level 1',
    status: 'online',
    fps: 15.0,
    avgConfidence: 0.95,
    lastFrameSecondsAgo: 1,
    model: MODEL_NAME,
    spotIds: coverage('south', 1, ['A', 'B']),
  },
  {
    id: 'W-L4-01',
    garageId: 'west',
    level: 4,
    name: 'West Garage · Level 4',
    status: 'offline',
    fps: 0,
    avgConfidence: 0,
    lastFrameSecondsAgo: 540,
    model: MODEL_NAME,
    spotIds: coverage('west', 4, ['A', 'B']),
  },
];

export function getCamera(id: string): Camera | undefined {
  return cameras.find(camera => camera.id === id);
}

export function cameraSpots(camera: Camera): Spot[] {
  const covered = new Set(camera.spotIds);
  return getSpots(camera.garageId, camera.level).filter(spot => covered.has(spot.id));
}

export function cameraTitle(camera: Camera): string {
  const garage = getGarage(camera.garageId);
  return `${garage?.name ?? camera.garageId} · Level ${camera.level}`;
}

// FNV-style hash so every spot keeps the same confidence from one render to the next.
export function hashUnit(key: string): number {
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

// Confidence for one box, spread around the camera average (the degraded camera is noisier).
export function detectionConfidence(camera: Camera, spotId: string): number {
  const spread = camera.status === 'degraded' ? 0.16 : 0.08;
  const value = camera.avgConfidence + (hashUnit(`${camera.id}:${spotId}`) - 0.5) * spread;
  return Math.round(Math.min(0.99, Math.max(0.5, value)) * 100) / 100;
}

const MINUTE = 60 * 1000;
const loadedAt = Date.now();

// Newest first. `index` picks one of the camera's spots that is not reserved; the new state
// matches what the spot grid shows, so the log never contradicts the live view.
const schedule: { cameraId: string; index: number; minutesAgo: number; confidence: number }[] = [
  { cameraId: 'S-L1-01', index: 2, minutesAgo: 1, confidence: 0.96 },
  { cameraId: 'N-L2-01', index: 5, minutesAgo: 2, confidence: 0.94 },
  { cameraId: 'N-L3-01', index: 1, minutesAgo: 4, confidence: 0.74 },
  { cameraId: 'S-L1-01', index: 9, minutesAgo: 6, confidence: 0.91 },
  { cameraId: 'N-L2-01', index: 11, minutesAgo: 8, confidence: 0.97 },
  { cameraId: 'N-L3-01', index: 7, minutesAgo: 11, confidence: 0.69 },
  { cameraId: 'S-L1-01', index: 4, minutesAgo: 13, confidence: 0.93 },
  { cameraId: 'N-L2-01', index: 0, minutesAgo: 17, confidence: 0.92 },
  { cameraId: 'W-L4-01', index: 6, minutesAgo: 19, confidence: 0.9 },
  { cameraId: 'S-L1-01', index: 12, minutesAgo: 22, confidence: 0.95 },
  { cameraId: 'N-L3-01', index: 10, minutesAgo: 26, confidence: 0.81 },
  { cameraId: 'N-L2-01', index: 8, minutesAgo: 31, confidence: 0.89 },
  { cameraId: 'W-L4-01', index: 3, minutesAgo: 38, confidence: 0.92 },
  { cameraId: 'S-L1-01', index: 1, minutesAgo: 44, confidence: 0.97 },
  { cameraId: 'W-L4-01', index: 10, minutesAgo: 52, confidence: 0.88 },
];

export const detectionLog: DetectionEvent[] = schedule.flatMap(entry => {
  const camera = getCamera(entry.cameraId);
  if (!camera) return [];
  const settled = cameraSpots(camera).filter(spot => spot.status !== 'reserved');
  const spot = settled[entry.index % settled.length];
  const to = spot.status === 'occupied' ? 'occupied' : 'available';
  return [{
    at: new Date(loadedAt - entry.minutesAgo * MINUTE).toISOString(),
    cameraId: entry.cameraId,
    spotLabel: spot.label,
    from: to === 'occupied' ? 'available' : 'occupied',
    to,
    confidence: entry.confidence,
  } satisfies DetectionEvent];
});
