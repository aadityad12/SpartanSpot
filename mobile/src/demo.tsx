import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getSpot, type Spot, type SpotStatus } from './mock/garages';
import { admin, student, type AdminProfile, type StudentProfile, type Vehicle } from './mock/people';
import { initialPermit, paymentHistory, plans, type Payment, type Permit, type Plan } from './mock/permits';
import { defaultRules, seedReservations, type Reservation, type Rules } from './mock/reservations';

export type Role = 'student' | 'admin';
export type CreateResult = { ok: true; reservation: Reservation } | { ok: false; reason: string };
export type PurchaseOptions = { validFrom?: string; validUntil?: string; method?: string };
export type Demo = {
  role: Role | null;
  signIn: (role: Role) => void;
  signOut: () => void;
  student: StudentProfile;
  admin: AdminProfile;

  reservations: Reservation[];
  createReservation: (input: {
    garageId: string;
    spotId: string;
    start: string;
    end: string;
    plate: string;
    fee: number;
  }) => CreateResult;
  cancelReservation: (id: string) => void;
  usage: (date: Date) => { today: number; month: number };

  rules: Rules;
  updateRules: (patch: Partial<Rules>) => void;

  adminHolds: Record<string, string>;
  setAdminHold: (spotId: string, reason: string | null) => void;

  spotStatus: (spot: Spot) => SpotStatus;

  permit: Permit | null;
  // `options` carry the term and payment method picked at checkout; omitted values fall back to
  // a permit that starts today, paid with the default card.
  purchasePlan: (planId: Plan['id'], plates: string[], options?: PurchaseOptions) => Permit;
  payments: Payment[];
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  removeVehicle: (id: string) => void;
};

const DemoContext = createContext<Demo | null>(null);

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function isSameDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function isSameMonth(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

function toDateOnly(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function randomCode(prefix: string, length: number) {
  let code = '';
  for (let index = 0; index < length; index += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `${prefix}-${code}`;
}

function permitEnd(planId: Plan['id'], from: Date) {
  const end = new Date(from);
  if (planId === 'daily') end.setDate(end.getDate() + 1);
  else if (planId === 'monthly') end.setMonth(end.getMonth() + 1);
  else if (planId === 'semester') end.setMonth(end.getMonth() + 4);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);
  const [rules, setRules] = useState<Rules>(defaultRules);
  const [adminHolds, setAdminHolds] = useState<Record<string, string>>({});
  const [permit, setPermit] = useState<Permit | null>(initialPermit);
  const [payments, setPayments] = useState<Payment[]>(paymentHistory);
  const [vehicles, setVehicles] = useState<Vehicle[]>(student.vehicles);

  const usage = useCallback((date: Date) => {
    const mine = reservations.filter(item => item.holder === student.name && item.status !== 'cancelled');
    return {
      today: mine.filter(item => isSameDay(new Date(item.start), date)).length,
      month: mine.filter(item => isSameMonth(new Date(item.start), date)).length,
    };
  }, [reservations]);

  const spotStatus = useCallback((spot: Spot): SpotStatus => {
    if (adminHolds[spot.id]) return 'reserved';
    const now = Date.now();
    const held = reservations.some(item => item.spotId === spot.id
      && item.status !== 'cancelled'
      && Date.parse(item.start) <= now
      && now < Date.parse(item.end));
    return held ? 'reserved' : spot.status;
  }, [adminHolds, reservations]);

  const createReservation = useCallback<Demo['createReservation']>(input => {
    const spot = getSpot(input.spotId);
    if (!spot) return { ok: false, reason: 'That spot could not be found.' };
    const start = new Date(input.start);
    const end = new Date(input.end);

    const status = spotStatus(spot);
    if (status !== 'available') {
      return { ok: false, reason: `Spot ${spot.label} is ${status} right now. Pick a green spot.` };
    }

    const overlaps = reservations.some(item => item.spotId === spot.id
      && item.status !== 'cancelled'
      && Date.parse(item.start) < end.getTime()
      && start.getTime() < Date.parse(item.end));
    if (overlaps) return { ok: false, reason: `Spot ${spot.label} is already reserved for that time.` };

    const used = usage(start);
    if (used.today >= rules.dailyLimit) {
      const day = `${WEEKDAYS[start.getDay()]}, ${MONTHS[start.getMonth()]} ${start.getDate()}`;
      return {
        ok: false,
        reason: `You've used ${used.today} of ${rules.dailyLimit} reservations for ${day}. Daily limits reset at midnight.`,
      };
    }
    if (used.month >= rules.monthlyLimit) {
      const reset = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return {
        ok: false,
        reason: `You've reached your monthly limit of ${rules.monthlyLimit} reservations. It resets on ${MONTHS[reset.getMonth()]} ${reset.getDate()}.`,
      };
    }

    const hours = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
    if (hours > rules.maxHours) {
      return { ok: false, reason: `Reservations can be at most ${rules.maxHours} hours.` };
    }
    if (!(hours > 0)) return { ok: false, reason: 'The end time must be after the start time.' };

    const now = Date.now();
    const reservation: Reservation = {
      id: `res-${now.toString(36)}-${Math.floor(Math.random() * 1296).toString(36)}`,
      code: randomCode('SPT', 4),
      garageId: input.garageId,
      spotId: input.spotId,
      plate: input.plate,
      holder: student.name,
      start: input.start,
      end: input.end,
      status: start.getTime() <= now ? 'active' : 'upcoming',
      fee: input.fee,
      createdAt: new Date(now).toISOString(),
    };
    setReservations(current => [reservation, ...current]);
    return { ok: true, reservation };
  }, [reservations, rules, spotStatus, usage]);

  const cancelReservation = useCallback((id: string) => {
    setReservations(current => current.map(item => (item.id === id ? { ...item, status: 'cancelled' } : item)));
  }, []);

  const setAdminHold = useCallback((spotId: string, reason: string | null) => {
    setAdminHolds(current => {
      const next = { ...current };
      if (reason) next[spotId] = reason;
      else delete next[spotId];
      return next;
    });
  }, []);

  const purchasePlan = useCallback((planId: Plan['id'], plates: string[], options: PurchaseOptions = {}) => {
    const plan = plans.find(item => item.id === planId) ?? plans[0];
    const today = new Date();
    const next: Permit = {
      id: `permit-${today.getTime().toString(36)}`,
      planId: plan.id,
      name: `${plan.name} Permit`,
      validFrom: options.validFrom ?? toDateOnly(today),
      validUntil: options.validUntil ?? toDateOnly(permitEnd(plan.id, today)),
      plates,
      status: 'active',
      confirmation: randomCode('PRM', 4),
    };
    setPermit(next);
    setPayments(current => [
      {
        id: `pay-${today.getTime().toString(36)}`,
        date: toDateOnly(today),
        description: next.name,
        amount: plan.price,
        method: options.method ?? 'Visa •••• 4242',
      },
      ...current,
    ]);
    return next;
  }, []);

  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id'>) => {
    const added: Vehicle = { ...vehicle, id: `veh-${Date.now().toString(36)}` };
    setVehicles(current => {
      const others = vehicle.primary ? current.map(item => ({ ...item, primary: false })) : current;
      return [...others, { ...added, primary: vehicle.primary || current.length === 0 }];
    });
  }, []);

  const removeVehicle = useCallback((id: string) => {
    setVehicles(current => {
      const remaining = current.filter(item => item.id !== id);
      if (remaining.length > 0 && !remaining.some(item => item.primary)) {
        remaining[0] = { ...remaining[0], primary: true };
      }
      return remaining;
    });
  }, []);

  const value = useMemo<Demo>(() => ({
    role,
    signIn: setRole,
    signOut: () => setRole(null),
    student,
    admin,
    reservations,
    createReservation,
    cancelReservation,
    usage,
    rules,
    updateRules: patch => setRules(current => ({ ...current, ...patch })),
    adminHolds,
    setAdminHold,
    spotStatus,
    permit,
    purchasePlan,
    payments,
    vehicles,
    addVehicle,
    removeVehicle,
  }), [role, reservations, createReservation, cancelReservation, usage, rules, adminHolds, setAdminHold,
    spotStatus, permit, purchasePlan, payments, vehicles, addVehicle, removeVehicle]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): Demo {
  const context = useContext(DemoContext);
  if (!context) throw new Error('DemoProvider is missing');
  return context;
}
