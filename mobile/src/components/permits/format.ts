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

// "Aug 19 – Dec 18, 2026", or with both years when the permit spans a year boundary.
export function validRange(from: string, until: string): string {
  if (parts(from).year === parts(until).year) {
    return `${shortDate(from)} – ${fullDate(until)}`;
  }
  return `${fullDate(from)} – ${fullDate(until)}`;
}

export const PROCESSING_FEE = 2.5;

export type TermOption = { value: string; label: string };

// Which period the permit covers. Labels only: the demo store dates a purchase from today.
export function termOptions(planId: Plan['id'], now: number): TermOption[] {
  switch (planId) {
    case 'daily':
      return Array.from({ length: 7 }, (_, offset) => ({
        value: `day-${offset}`,
        label: dayChipLabel(now, offset),
      }));
    case 'monthly':
      return ['Nov 2026', 'Dec 2026', 'Jan 2027'].map(label => ({ value: label, label }));
    case 'semester':
      return [
        { value: 'spring-2027', label: 'Spring 2027 (Jan 21 – May 20)' },
        { value: 'summer-2027', label: 'Summer 2027' },
      ];
    default:
      return [{ value: 'annual', label: 'Aug 2026 – Aug 2027' }];
  }
}
