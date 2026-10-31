import { garages } from './garages';

export type ReportOffset = 0 | -1 | -7;
export type ViolationType = 'No valid permit' | 'Expired permit' | 'Reserved spot violation' | 'Overstay';
export type ViolationStatus = 'Cited' | 'Warning' | 'Pending';

export type Violation = {
  plate: string;
  state: string;
  garageId: string;
  time: string;
  type: ViolationType;
  status: ViolationStatus;
};

export type HourlyPoint = { hour: number; entries: number; occupancyPercent: number };

export type GarageRow = {
  garageId: string;
  cars: number;
  peakPercent: number;
  violations: number;
  reservations: number;
};

export type DailyReport = {
  offset: ReportOffset;
  totals: {
    carsParked: number;
    uniquePlates: number;
    peakOccupancyPercent: number;
    peakHour: number;
    reservations: number;
    violations: number;
    revenue: { permits: number; reservations: number; total: number };
  };
  hourly: HourlyPoint[];
  byGarage: GarageRow[];
  violations: Violation[];
};

export const FIRST_HOUR = 6;

// Entries per hour from 6 AM to 10 PM and the campus-wide occupancy at that hour.
const ENTRIES = [18, 62, 148, 190, 142, 120, 104, 128, 138, 96, 74, 58, 44, 38, 30, 22, 12];
const OCCUPANCY = [18, 34, 52, 68, 79, 86, 89, 88, 87, 84, 78, 70, 60, 50, 42, 35, 28];

// Garage shares of the day's cars and reservations, in the order of `garages`.
const CAR_SHARE = [0.31, 0.27, 0.34, 0.08];
const RESERVATION_SHARE = [0.34, 0.3, 0.28, 0.08];
const PEAK_OFFSET = [8, -6, 6, -45];

const DAY_PROFILE: Record<ReportOffset, {
  entryScale: number;
  occupancyShift: number;
  reservations: number;
  permitsSold: number;
}> = {
  0: { entryScale: 1, occupancyShift: 0, reservations: 86, permitsSold: 41 },
  [-1]: { entryScale: 0.96, occupancyShift: -2, reservations: 74, permitsSold: 37 },
  [-7]: { entryScale: 1.05, occupancyShift: 1, reservations: 91, permitsSold: 48 },
};

const PERMIT_PRICE = 10;
const RESERVATION_FEE = 3;

// Today's two entries are the same open citations the plate lookup and dashboard show.
const VIOLATIONS: Record<ReportOffset, Violation[]> = {
  0: [
    { plate: '7XYZ889', state: 'CA', garageId: 'west', time: '9:42 AM', type: 'No valid permit', status: 'Cited' },
    { plate: '4DEF321', state: 'CA', garageId: 'south', time: '11:15 AM', type: 'No valid permit', status: 'Pending' },
  ],
  [-1]: [
    { plate: '3GRN552', state: 'CA', garageId: 'west', time: '8:55 AM', type: 'Expired permit', status: 'Warning' },
    { plate: '7KLM204', state: 'CA', garageId: 'north', time: '9:30 AM', type: 'Reserved spot violation', status: 'Cited' },
    { plate: '1VST620', state: 'OR', garageId: 'south', time: '2:20 PM', type: 'Expired permit', status: 'Cited' },
    { plate: '5TUV918', state: 'CA', garageId: 'west', time: '3:05 PM', type: 'Overstay', status: 'Warning' },
    { plate: '8HJK332', state: 'AZ', garageId: 'north', time: '4:40 PM', type: 'No valid permit', status: 'Cited' },
    { plate: '4WXC671', state: 'CA', garageId: 'south-campus', time: '6:10 PM', type: 'No valid permit', status: 'Pending' },
  ],
  [-7]: [
    { plate: '6RTY447', state: 'CA', garageId: 'north', time: '8:20 AM', type: 'No valid permit', status: 'Cited' },
    { plate: '2BNM905', state: 'CA', garageId: 'west', time: '10:05 AM', type: 'Expired permit', status: 'Cited' },
    { plate: '9QAZ118', state: 'NV', garageId: 'south', time: '11:45 AM', type: 'Overstay', status: 'Warning' },
    { plate: '3SDF662', state: 'CA', garageId: 'west', time: '1:30 PM', type: 'Reserved spot violation', status: 'Cited' },
    { plate: '7POI390', state: 'CA', garageId: 'north', time: '2:50 PM', type: 'No valid permit', status: 'Pending' },
    { plate: '5LKJ821', state: 'CA', garageId: 'south', time: '4:15 PM', type: 'Expired permit', status: 'Warning' },
    { plate: '8MNB254', state: 'WA', garageId: 'south-campus', time: '5:40 PM', type: 'No valid permit', status: 'Cited' },
  ],
};

// Largest-remainder rounding, so the garage numbers add up to the exact total.
function split(total: number, shares: number[]): number[] {
  const raw = shares.map(share => total * share);
  const result = raw.map(Math.floor);
  const order = raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((first, second) => second.remainder - first.remainder);
  for (let step = 0; step < total - result.reduce((sum, value) => sum + value, 0); step += 1) {
    result[order[step].index] += 1;
  }
  return result;
}

export function dailyReport(offset: ReportOffset): DailyReport {
  const profile = DAY_PROFILE[offset];
  const hourly = ENTRIES.map((entries, index) => ({
    hour: FIRST_HOUR + index,
    entries: Math.round(entries * profile.entryScale),
    occupancyPercent: Math.min(99, OCCUPANCY[index] + profile.occupancyShift),
  }));
  const carsParked = hourly.reduce((sum, point) => sum + point.entries, 0);
  const peak = hourly.reduce((best, point) => (point.occupancyPercent > best.occupancyPercent ? point : best));
  const violations = VIOLATIONS[offset];

  const cars = split(carsParked, CAR_SHARE);
  const reservations = split(profile.reservations, RESERVATION_SHARE);
  const byGarage = garages.map((garage, index) => ({
    garageId: garage.id,
    cars: cars[index],
    peakPercent: Math.min(99, Math.max(10, peak.occupancyPercent + PEAK_OFFSET[index])),
    violations: violations.filter(item => item.garageId === garage.id).length,
    reservations: reservations[index],
  }));

  const permitRevenue = profile.permitsSold * PERMIT_PRICE;
  const reservationRevenue = profile.reservations * RESERVATION_FEE;

  return {
    offset,
    totals: {
      carsParked,
      uniquePlates: Math.round(carsParked * 0.87),
      peakOccupancyPercent: peak.occupancyPercent,
      peakHour: peak.hour,
      reservations: profile.reservations,
      violations: violations.length,
      revenue: {
        permits: permitRevenue,
        reservations: reservationRevenue,
        total: permitRevenue + reservationRevenue,
      },
    },
    hourly,
    byGarage,
    violations,
  };
}
