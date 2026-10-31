import type { Spot, SpotFeature } from '../../../mock/garages';
import type { Reservation } from '../../../mock/reservations';
import { liveStatus } from '../../reservations/format';

export const HOLD_REASONS = ['Event', 'Faculty', 'Maintenance', 'Accessible', 'VIP'] as const;
export type HoldReason = (typeof HOLD_REASONS)[number];

export const featureLabel: Record<SpotFeature, string> = {
  elevator: 'Near elevator',
  accessible: 'Accessible',
  ev: 'EV charging',
  compact: 'Compact',
};

// A reservation that currently occupies the spot, mirroring how the shared spot status is derived.
export function currentReservation(spot: Spot, reservations: Reservation[], now: number): Reservation | undefined {
  return reservations.find(item => item.spotId === spot.id
    && item.status !== 'cancelled'
    && Date.parse(item.start) <= now
    && now < Date.parse(item.end));
}

// Later bookings on a spot that is free right now, so the detail card can still mention them.
export function nextReservation(spot: Spot, reservations: Reservation[], now: number): Reservation | undefined {
  return reservations
    .filter(item => item.spotId === spot.id && liveStatus(item, now) === 'upcoming')
    .sort((first, second) => Date.parse(first.start) - Date.parse(second.start))[0];
}

// Spots that Parking Services reserved permanently in the sample data (not releasable). The reason
// is a stand-in derived from the spot's features, so the holds list can say why it is set aside.
export function preAssigned(spots: Spot[], adminHolds: Record<string, string>): Spot[] {
  return spots.filter(spot => spot.status === 'reserved' && !adminHolds[spot.id]);
}

export function preAssignedReason(spot: Spot): HoldReason {
  return spot.features.includes('accessible') ? 'Accessible' : 'Faculty';
}

export type ReservedSplit = { student: number; held: number };

// Reserved spots come from three places: a student booking, an admin hold, or the sample baseline
// that Parking Services pre-assigned. The last two both count as "held by Parking Services".
export function splitReserved(
  spots: Spot[],
  reservations: Reservation[],
  adminHolds: Record<string, string>,
  now: number,
): ReservedSplit {
  let student = 0;
  let held = 0;
  for (const spot of spots) {
    if (adminHolds[spot.id]) held += 1;
    else if (currentReservation(spot, reservations, now)) student += 1;
    else if (spot.status === 'reserved') held += 1;
  }
  return { student, held };
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
