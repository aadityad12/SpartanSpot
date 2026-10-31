import { getSpots } from './garages';
import { student } from './people';

export type Reservation = {
  id: string;
  code: string;
  garageId: string;
  spotId: string;
  plate: string;
  holder: string;
  start: string;
  end: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  fee: number;
  createdAt: string;
};
export type Rules = {
  dailyLimit: number;
  monthlyLimit: number;
  maxHours: number;
  graceMinutes: number;
  showReservedSeparately: boolean;
};

export const defaultRules: Rules = {
  dailyLimit: 2,
  monthlyLimit: 8,
  maxHours: 4,
  graceMinutes: 15,
  showReservedSeparately: true,
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Seed spots must start out available so they never collide with the base occupancy.
function availableSpotId(garageId: string, level: number, skip: number): string {
  const spot = getSpots(garageId, level).filter(item => item.status === 'available')[skip];
  return spot.id;
}

function tomorrowAt(hour: number): number {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

const now = Date.now();
const upcomingStart = tomorrowAt(9);

export const seedReservations: Reservation[] = [
  {
    id: 'res-seed-active',
    code: 'SPT-7K4Q',
    garageId: 'south',
    spotId: availableSpotId('south', 2, 3),
    plate: student.vehicles[0].plate,
    holder: student.name,
    start: new Date(now - 30 * 60 * 1000).toISOString(),
    end: new Date(now + 90 * 60 * 1000).toISOString(),
    status: 'active',
    fee: 3,
    createdAt: new Date(now - 2 * HOUR).toISOString(),
  },
  {
    id: 'res-seed-upcoming',
    code: 'SPT-M2XD',
    garageId: 'north',
    spotId: availableSpotId('north', 3, 5),
    plate: student.vehicles[0].plate,
    holder: student.name,
    start: new Date(upcomingStart).toISOString(),
    end: new Date(upcomingStart + 3 * HOUR).toISOString(),
    status: 'upcoming',
    fee: 3,
    createdAt: new Date(now - 5 * HOUR).toISOString(),
  },
  {
    id: 'res-seed-completed',
    code: 'SPT-9HBW',
    garageId: 'south-campus',
    spotId: availableSpotId('south-campus', 1, 8),
    plate: student.vehicles[1].plate,
    holder: student.name,
    start: new Date(now - 7 * DAY).toISOString(),
    end: new Date(now - 7 * DAY + 2 * HOUR).toISOString(),
    status: 'completed',
    fee: 0,
    createdAt: new Date(now - 8 * DAY).toISOString(),
  },
];
