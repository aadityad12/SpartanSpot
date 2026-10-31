import type { ReportOffset } from '../../../mock/reports';

export const periodOptions: { value: string; label: string }[] = [
  { value: '0', label: 'Today' },
  { value: '-1', label: 'Yesterday' },
  { value: '-7', label: 'Last week' },
];

export function parseOffset(value: string): ReportOffset {
  return value === '-1' ? -1 : value === '-7' ? -7 : 0;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

// Local calendar date shifted by `offset` days, as YYYY-MM-DD for the file name.
export function reportDate(now: number, offset: ReportOffset): string {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function reportFileName(now: number, offset: ReportOffset): string {
  return `SpartanSpot_Daily_${reportDate(now, offset)}.pdf`;
}

export function hourLabel(hour: number): string {
  return `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function hourTick(hour: number): string {
  return `${hour % 12 || 12}${hour < 12 ? 'a' : 'p'}`;
}

export function money(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function weekdayName(now: number, offset: ReportOffset): string {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
