// Deterministic sample occupancy history. Nothing here is measured data.

export type HourlyPoint = { hour: number; percent: number };
export type ForecastDay = { date: string; peakPercent: number; quietWindow: string };

export const FIRST_HOUR = 7;
export const LAST_HOUR = 22;

// Weekday peak (Mon-Thu) and Saturday peak for each garage.
const peaks: Record<string, { weekday: number; weekend: number }> = {
  west: { weekday: 98, weekend: 40 },
  north: { weekday: 94, weekend: 36 },
  south: { weekday: 90, weekend: 32 },
  'south-campus': { weekday: 85, weekend: 25 },
};
const fallbackPeak = { weekday: 85, weekend: 25 };

// Index is JS getDay(): 0 = Sunday.
const dayFactor = [0.6, 1, 1, 0.98, 0.95, 0.8, 1];

// Stable pseudo-random number in [0, 1) so every render shows the same history.
function noise(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 1274126177);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

// Bell curve centered on midday, slower to fall in the afternoon than it rose in the morning.
function middayShape(hour: number): number {
  const offset = hour + 0.5 - 11.5;
  const spread = offset < 0 ? 2.8 : 3.6;
  return Math.exp(-(offset * offset) / (2 * spread * spread));
}

export function clampHour(hour: number): number {
  return Math.min(LAST_HOUR, Math.max(FIRST_HOUR, hour));
}

/**
 * Percent full for each hour from 7 to 22.
 * `weekday` follows Date.getDay() (0 = Sunday); `weekOffset` is 0 for this week, -1 for last week.
 */
export function hourlyOccupancy(garageId: string, weekday: number, weekOffset: number): HourlyPoint[] {
  const peak = peaks[garageId] ?? fallbackPeak;
  const isWeekend = weekday === 0 || weekday === 6;
  // Past weeks sit a steady 3-10 points above or below this week, with a little hourly jitter.
  const shiftSize = 3 + noise(`${garageId}|${weekday}|${weekOffset}|size`) * 7;
  const shiftSign = noise(`${garageId}|${weekday}|${weekOffset}|sign`) < 0.5 ? -1 : 1;
  const shift = weekOffset === 0 ? 0 : shiftSign * shiftSize;

  const points: HourlyPoint[] = [];
  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour += 1) {
    const shape = middayShape(hour);
    const base = isWeekend
      ? 15 + (peak.weekend - 15) * dayFactor[weekday] * shape
      : peak.weekday * dayFactor[weekday] * (0.25 + 0.75 * shape);
    const jitter = (noise(`${garageId}|${weekday}|${weekOffset}|${hour}`) - 0.5) * 4;
    const percent = Math.round(Math.min(99, Math.max(5, base + shift + jitter)));
    points.push({ hour, percent });
  }
  return points;
}

/** Current occupancy against the average of the previous three weeks at the same weekday and hour. */
export function currentVsTypical(garageId: string, at: Date = new Date()): { now: number; typical: number } {
  const weekday = at.getDay();
  const index = clampHour(at.getHours()) - FIRST_HOUR;
  const now = hourlyOccupancy(garageId, weekday, 0)[index].percent;
  const past = [-1, -2, -3].map(offset => hourlyOccupancy(garageId, weekday, offset)[index].percent);
  const typical = Math.round(past.reduce((sum, value) => sum + value, 0) / past.length);
  return { now, typical };
}

function twelveHour(hour: number): number {
  return hour % 12 || 12;
}

function meridiem(hour: number): string {
  return hour < 12 ? 'AM' : 'PM';
}

function windowLabel(start: number, end: number): string {
  if (meridiem(start) === meridiem(end)) return `${twelveHour(start)}–${twelveHour(end)} ${meridiem(end)}`;
  return `${twelveHour(start)} ${meridiem(start)}–${twelveHour(end)} ${meridiem(end)}`;
}

/** The two-hour stretch with the lowest average occupancy between `fromHour` and 8 PM, or null if none is left. */
export function quietestWindow(garageId: string, weekday: number, fromHour = 8): string | null {
  const points = hourlyOccupancy(garageId, weekday, 0);
  let best: { start: number; average: number } | null = null;
  for (let start = Math.max(8, fromHour); start + 2 <= 20; start += 1) {
    const average = (points[start - FIRST_HOUR].percent + points[start + 1 - FIRST_HOUR].percent) / 2;
    if (!best || average < best.average) best = { start, average };
  }
  return best ? windowLabel(best.start, best.start + 2) : null;
}

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Daily peak and quietest daytime window for today and the next six days. */
export function forecastNext7Days(garageId: string, from: Date = new Date()): ForecastDay[] {
  const days: ForecastDay[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
    const weekday = date.getDay();
    const peakPercent = Math.max(...hourlyOccupancy(garageId, weekday, 0).map(point => point.percent));
    days.push({ date: isoDate(date), peakPercent, quietWindow: quietestWindow(garageId, weekday) ?? 'All day' });
  }
  return days;
}
