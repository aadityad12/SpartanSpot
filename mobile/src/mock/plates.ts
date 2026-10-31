import { student } from './people';

export type PlateRecord = {
  plate: string;
  state: string;
  make: string;
  model: string;
  color: string;
  owner: { name: string; sjsuId: string; role: 'Student' | 'Employee' | 'Visitor' } | null;
  permit: { name: string; validFrom: string; validUntil: string } | null;
  payment: 'paid' | 'unpaid' | 'expired' | 'none';
  amountDue: number;
  sightings: { garageId: string; level: number; at: string }[];
  violations: { date: string; type: string; amount: number; status: 'paid' | 'open' }[];
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Sample sightings and violations are built relative to now so the demo always looks current.
const now = Date.now();

function ago(ms: number): string {
  return new Date(now - ms).toISOString();
}

function dateOnly(ms: number): string {
  const date = new Date(now - ms);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const fallSemester = { name: 'Fall 2026 Semester Permit', validFrom: '2026-08-19', validUntil: '2026-12-18' };

const [primaryCar, secondCar] = student.vehicles;
const studentOwner = { name: student.name, sjsuId: student.sjsuId, role: 'Student' } as const;

export const plateRecords: PlateRecord[] = [
  {
    plate: primaryCar.plate,
    state: primaryCar.state,
    make: primaryCar.make,
    model: primaryCar.model,
    color: primaryCar.color,
    owner: studentOwner,
    permit: fallSemester,
    payment: 'paid',
    amountDue: 0,
    sightings: [
      { garageId: 'north', level: 2, at: ago(14 * MINUTE) },
      { garageId: 'north', level: 2, at: ago(1 * DAY + 5 * HOUR) },
    ],
    violations: [],
  },
  {
    plate: secondCar.plate,
    state: secondCar.state,
    make: secondCar.make,
    model: secondCar.model,
    color: secondCar.color,
    owner: studentOwner,
    permit: fallSemester,
    payment: 'paid',
    amountDue: 0,
    sightings: [{ garageId: 'south-campus', level: 1, at: ago(6 * DAY) }],
    violations: [],
  },
  {
    plate: '7XYZ889',
    state: 'CA',
    make: 'Tesla',
    model: 'Model 3',
    color: 'White',
    owner: { name: 'Marcus Lee', sjsuId: '016733402', role: 'Student' },
    permit: fallSemester,
    payment: 'unpaid',
    amountDue: 250,
    sightings: [
      { garageId: 'west', level: 4, at: ago(32 * MINUTE) },
      { garageId: 'west', level: 3, at: ago(1 * DAY + 2 * HOUR) },
    ],
    violations: [{ date: dateOnly(0), type: 'No valid permit', amount: 55, status: 'open' }],
  },
  {
    plate: '6LMN456',
    state: 'CA',
    make: 'Ford',
    model: 'Focus',
    color: 'Gray',
    owner: { name: 'Priya Nair', sjsuId: '016551870', role: 'Student' },
    permit: { name: 'Summer 2026 Monthly Permit', validFrom: '2026-07-16', validUntil: '2026-08-15' },
    payment: 'expired',
    amountDue: 0,
    sightings: [{ garageId: 'south', level: 3, at: ago(3 * HOUR) }],
    violations: [{ date: dateOnly(9 * DAY), type: 'Expired permit', amount: 45, status: 'paid' }],
  },
  {
    plate: '4DEF321',
    state: 'CA',
    make: 'Nissan',
    model: 'Sentra',
    color: 'Black',
    owner: null,
    permit: null,
    payment: 'none',
    amountDue: 0,
    sightings: [{ garageId: 'south', level: 1, at: ago(52 * MINUTE) }],
    violations: [
      { date: dateOnly(0), type: 'No valid permit', amount: 55, status: 'open' },
      { date: dateOnly(21 * DAY), type: 'No valid permit', amount: 55, status: 'paid' },
    ],
  },
  {
    plate: '9EMP204',
    state: 'CA',
    make: 'Subaru',
    model: 'Outback',
    color: 'Green',
    owner: { name: 'Dr. Elena Ruiz', sjsuId: '009128844', role: 'Employee' },
    permit: { name: '2026 Employee Annual Permit', validFrom: '2026-01-05', validUntil: '2026-12-31' },
    payment: 'paid',
    amountDue: 0,
    sightings: [{ garageId: 'west', level: 2, at: ago(2 * HOUR + 10 * MINUTE) }],
    violations: [],
  },
  {
    plate: '5VIS771',
    state: 'NV',
    make: 'Jeep',
    model: 'Wrangler',
    color: 'Red',
    owner: { name: 'Tom Alvarez', sjsuId: '—', role: 'Visitor' },
    permit: { name: 'Daily Visitor Permit', validFrom: dateOnly(0), validUntil: dateOnly(0) },
    payment: 'paid',
    amountDue: 0,
    sightings: [{ garageId: 'south', level: 5, at: ago(41 * MINUTE) }],
    violations: [],
  },
  {
    plate: '8TRN310',
    state: 'CA',
    make: 'Hyundai',
    model: 'Elantra',
    color: 'White',
    owner: { name: 'Aiko Tanaka', sjsuId: '016208455', role: 'Student' },
    permit: { name: 'Fall 2026 Monthly Permit', validFrom: '2026-10-01', validUntil: '2026-10-31' },
    payment: 'paid',
    amountDue: 0,
    sightings: [{ garageId: 'north', level: 4, at: ago(75 * MINUTE) }],
    violations: [],
  },
  {
    plate: '6QWE908',
    state: 'CA',
    make: 'Kia',
    model: 'Soul',
    color: 'Orange',
    owner: { name: 'Diego Morales', sjsuId: '016347019', role: 'Student' },
    permit: fallSemester,
    payment: 'unpaid',
    amountDue: 250,
    sightings: [{ garageId: 'north', level: 1, at: ago(4 * HOUR) }],
    violations: [{ date: dateOnly(2 * DAY), type: 'Reserved spot violation', amount: 75, status: 'open' }],
  },
  {
    plate: '3GRN552',
    state: 'CA',
    make: 'Chevrolet',
    model: 'Bolt',
    color: 'Blue',
    owner: { name: 'Hannah Cho', sjsuId: '016690231', role: 'Student' },
    permit: { name: '2025-26 Annual Permit', validFrom: '2025-08-20', validUntil: '2026-08-14' },
    payment: 'expired',
    amountDue: 0,
    sightings: [],
    violations: [],
  },
  {
    plate: '2FAC118',
    state: 'CA',
    make: 'Toyota',
    model: 'Prius',
    color: 'Silver',
    owner: { name: 'Prof. David Kim', sjsuId: '009045617', role: 'Employee' },
    permit: { name: '2026 Employee Annual Permit', validFrom: '2026-01-05', validUntil: '2026-12-31' },
    payment: 'paid',
    amountDue: 0,
    sightings: [{ garageId: 'north', level: 3, at: ago(5 * HOUR) }],
    violations: [],
  },
  {
    plate: '1VST620',
    state: 'OR',
    make: 'Mazda',
    model: 'CX-5',
    color: 'Gray',
    owner: { name: 'Sara Whitfield', sjsuId: '—', role: 'Visitor' },
    permit: { name: 'Daily Visitor Permit', validFrom: dateOnly(1 * DAY), validUntil: dateOnly(1 * DAY) },
    payment: 'expired',
    amountDue: 0,
    sightings: [{ garageId: 'south', level: 2, at: ago(1 * DAY + 3 * HOUR) }],
    violations: [{ date: dateOnly(1 * DAY), type: 'Expired permit', amount: 45, status: 'open' }],
  },
];

function normalize(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

export function findPlate(query: string): PlateRecord | undefined {
  const wanted = normalize(query);
  return wanted ? plateRecords.find(record => record.plate === wanted) : undefined;
}

export const samplePlates: { plate: string; hint: string }[] = [
  { plate: '8ABC123', hint: 'paid' },
  { plate: '7XYZ889', hint: 'unpaid' },
  { plate: '6LMN456', hint: 'expired' },
  { plate: '4DEF321', hint: 'no permit' },
  { plate: '5QRS000', hint: 'no record' },
];
