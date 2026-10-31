import { getSpot } from '../../mock/garages';
import type { Reservation } from '../../mock/reservations';

// Flat sample fee, not real SJSU pricing.
export const RESERVATION_FEE = 3;

export const START_FIRST_MINUTES = 7 * 60;
export const START_LAST_MINUTES = 20 * 60;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function dayLabel(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()}`;
}

function clock(date: Date): { time: string; meridiem: string } {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return { time: `${hours % 12 || 12}:${minutes}`, meridiem: hours < 12 ? 'AM' : 'PM' };
}

export function timeLabel(date: Date): string {
  const { time, meridiem } = clock(date);
  return `${time} ${meridiem}`;
}

export function minutesLabel(minutesOfDay: number): string {
  const date = new Date(2000, 0, 1, Math.floor(minutesOfDay / 60), minutesOfDay % 60);
  return timeLabel(date);
}

function sameDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

// e.g. "Mon 11/2 · 9:30 – 11:30 AM", or with both meridiems when the window crosses noon.
export function formatWindow(start: Date, end: Date): string {
  const from = clock(start);
  const to = clock(end);
  if (!sameDay(start, end)) {
    return `${dayLabel(start)} · ${timeLabel(start)} – ${dayLabel(end)} ${timeLabel(end)}`;
  }
  const range = from.meridiem === to.meridiem
    ? `${from.time} – ${to.time} ${to.meridiem}`
    : `${from.time} ${from.meridiem} – ${to.time} ${to.meridiem}`;
  return `${dayLabel(start)} · ${range}`;
}

// Day chip dates: offset 0 is today, 1 is tomorrow, and so on.
export function dateForOffset(now: number, offset: number): Date {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

export function dayChipLabel(now: number, offset: number): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return dayLabel(dateForOffset(now, offset));
}

// Start times every 30 minutes from 7:00 AM to 8:00 PM; past times are hidden for today.
export function startOptions(now: number, offset: number): number[] {
  const today = new Date(now);
  const minutesNow = today.getHours() * 60 + today.getMinutes();
  const options: number[] = [];
  for (let minutes = START_FIRST_MINUTES; minutes <= START_LAST_MINUTES; minutes += 30) {
    if (offset > 0 || minutes > minutesNow) options.push(minutes);
  }
  return options;
}

export function buildWindow(now: number, offset: number, startMinutes: number, hours: number) {
  const start = dateForOffset(now, offset);
  start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  const end = new Date(start.getTime() + hours * HOUR);
  return { start, end };
}

// Stored status is only a snapshot, so derive the current one from the clock.
export function liveStatus(reservation: Reservation, now: number): Reservation['status'] {
  if (reservation.status === 'cancelled' || reservation.status === 'completed') return reservation.status;
  if (now >= Date.parse(reservation.end)) return 'completed';
  if (now >= Date.parse(reservation.start)) return 'active';
  return 'upcoming';
}

function formatSpan(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / MINUTE));
  if (totalMinutes < 1) return 'under 1 m';
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} m`;
  return `${minutes} m`;
}

export function countdownText(reservation: Reservation, now: number): string | null {
  const status = liveStatus(reservation, now);
  if (status === 'upcoming') return `Starts in ${formatSpan(Date.parse(reservation.start) - now)}`;
  if (status === 'active') return `Ends in ${formatSpan(Date.parse(reservation.end) - now)}`;
  return null;
}

export function spotLine(spotId: string): string {
  const spot = getSpot(spotId);
  return spot ? `Level ${spot.level} · Spot ${spot.label}` : 'Spot unavailable';
}

export function reservationWindow(reservation: Reservation): string {
  return formatWindow(new Date(reservation.start), new Date(reservation.end));
}
