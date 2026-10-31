import { getGarage } from '../../../mock/garages';
import type { Reservation } from '../../../mock/reservations';
import { liveStatus, spotLine } from '../../reservations/format';
import type { IconName } from '../../ui';

export type ActivityEvent = {
  id: string;
  at: number;
  icon: IconName;
  text: string;
  tone: 'ok' | 'alert' | 'info';
};

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

// Sample events; the plates match the records in the lookup data.
const baseEvents: { minutesAgo: number; icon: IconName; text: string; tone: ActivityEvent['tone'] }[] = [
  { minutesAgo: 3, icon: 'square', text: 'Spot 2-A07 now occupied — South Garage', tone: 'info' },
  { minutesAgo: 9, icon: 'video-off', text: 'Camera W-4 went offline — West Garage', tone: 'alert' },
  { minutesAgo: 14, icon: 'log-in', text: '8ABC123 entered North Garage L2 — permit valid', tone: 'ok' },
  { minutesAgo: 23, icon: 'check-square', text: 'Spot 3-C11 freed — North Garage', tone: 'info' },
  { minutesAgo: 32, icon: 'flag', text: '7XYZ889 detected at West Garage L4 — unpaid, flagged', tone: 'alert' },
  { minutesAgo: 41, icon: 'log-in', text: '5VIS771 entered South Garage L5 — daily visitor permit valid', tone: 'ok' },
  { minutesAgo: 52, icon: 'flag', text: '4DEF321 detected at South Garage L1 — no permit, flagged', tone: 'alert' },
  { minutesAgo: 75, icon: 'log-in', text: '8TRN310 entered North Garage L4 — permit valid', tone: 'ok' },
];

function reservationEvent(reservation: Reservation, now: number): ActivityEvent | null {
  const status = liveStatus(reservation, now);
  const garage = getGarage(reservation.garageId)?.name ?? reservation.garageId;
  const where = `${garage}, ${spotLine(reservation.spotId)}`;
  if (status === 'active') {
    return {
      id: `res-start-${reservation.id}`,
      at: Math.min(now, Date.parse(reservation.start)),
      icon: 'bookmark',
      text: `Reservation ${reservation.code} started — ${where}`,
      tone: 'info',
    };
  }
  if (status === 'upcoming') {
    return {
      id: `res-new-${reservation.id}`,
      at: Date.parse(reservation.createdAt),
      icon: 'calendar',
      text: `Reservation ${reservation.code} booked — ${where}`,
      tone: 'info',
    };
  }
  return null;
}

// Sample events plus the reservations students have made in this demo, newest first.
export function buildActivity(reservations: Reservation[], now: number, limit = 10): ActivityEvent[] {
  const fromSample = baseEvents.map(item => ({
    id: item.text,
    at: now - item.minutesAgo * MINUTE,
    icon: item.icon,
    text: item.text,
    tone: item.tone,
  }));
  const fromReservations = reservations
    .map(item => reservationEvent(item, now))
    .filter((item): item is ActivityEvent => item !== null && now - item.at < DAY);
  return [...fromSample, ...fromReservations].sort((first, second) => second.at - first.at).slice(0, limit);
}
