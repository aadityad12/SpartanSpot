import { dayChipLabel } from '../reservations/format';
import type { Plan } from '../../mock/permits';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Split by hand: `new Date('2026-08-19')` parses as UTC and can land on the previous day locally.
function parts(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month: MONTHS[month - 1] ?? '', day };
}

export function shortDate(iso: string): string {
  const { month, day } = parts(iso);
  return `${month} ${day}`;
}

export function fullDate(iso: string): string {
  return `${shortDate(iso)}, ${parts(iso).year}`;
}

// "Aug 19 – Dec 18, 2026" (a single day reads "Oct 31, 2026"), or with both years when the permit spans a year boundary.
export function validRange(from: string, until: string): string {
  if (from === until) return fullDate(from);
  if (parts(from).year === parts(until).year) {
    return `${shortDate(from)} – ${fullDate(until)}`;
  }
  return `${fullDate(from)} – ${fullDate(until)}`;
}

export const PROCESSING_FEE = 2.5;

export type TermOption = { value: string; label: string; validFrom: string; validUntil: string };

function dateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function term(value: string, label: string, validFrom: string, validUntil: string): TermOption {
  return { value, label, validFrom, validUntil };
}

// The period a permit covers. Daily terms follow the calendar from today; the longer terms are
// fixed sample academic dates, not official SJSU term dates.
export function termOptions(planId: Plan['id'], now: number): TermOption[] {
  switch (planId) {
    case 'daily':
      return Array.from({ length: 7 }, (_, offset) => {
        const day = new Date(now);
        day.setDate(day.getDate() + offset);
        return term(`day-${offset}`, dayChipLabel(now, offset), dateOnly(day), dateOnly(day));
      });
    case 'monthly':
      return [
        term('2026-11', 'Nov 2026', '2026-11-01', '2026-11-30'),
        term('2026-12', 'Dec 2026', '2026-12-01', '2026-12-31'),
        term('2027-01', 'Jan 2027', '2027-01-01', '2027-01-31'),
      ];
    case 'semester':
      return [
        term('spring-2027', 'Spring 2027 (Jan 21 – May 20)', '2027-01-21', '2027-05-20'),
        term('summer-2027', 'Summer 2027 (May 24 – Aug 13)', '2027-05-24', '2027-08-13'),
      ];
    default:
      return [term('annual', 'Aug 2026 – Aug 2027', '2026-08-19', '2027-08-18')];
  }
}
