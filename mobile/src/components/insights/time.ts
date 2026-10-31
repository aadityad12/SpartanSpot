import { FIRST_HOUR, LAST_HOUR } from '../../mock/trends';

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Heatmap rows start on Monday, so Sunday (0) goes last.
export const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

export const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, index) => FIRST_HOUR + index);

// 7 -> "7a", 12 -> "12p", 22 -> "10p"
export function hourTick(hour: number): string {
  return `${hour % 12 || 12}${hour < 12 ? 'a' : 'p'}`;
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const rest = String(minutes % 60).padStart(2, '0');
  return `${hours}:${rest}`;
}

export function percentLabel(percent: number): string {
  return `${percent}%`;
}
