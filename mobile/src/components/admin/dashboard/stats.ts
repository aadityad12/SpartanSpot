import { useMemo } from 'react';
import { useDemo } from '../../../demo';
import { garageSummary, garages, type Garage } from '../../../mock/garages';
import { plateRecords } from '../../../mock/plates';

export type GarageStat = {
  garage: Garage;
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  percent: number;
};

export const CAMERAS_ONLINE = 3;
export const CAMERAS_TOTAL = 4;

// Reservations and admin holds count toward "reserved", so the numbers follow what students do.
export function useGarageStats(): { stats: GarageStat[]; campus: Omit<GarageStat, 'garage'> } {
  const { spotStatus } = useDemo();
  return useMemo(() => {
    const stats = garages.map(garage => {
      const summary = garageSummary(garage.id, spotStatus);
      return {
        garage,
        total: summary.total,
        available: summary.available,
        occupied: summary.occupied,
        reserved: summary.reserved,
        percent: summary.total ? Math.round((summary.occupied / summary.total) * 100) : 0,
      };
    });
    const sum = (pick: (stat: GarageStat) => number) => stats.reduce((total, stat) => total + pick(stat), 0);
    const total = sum(stat => stat.total);
    const occupied = sum(stat => stat.occupied);
    return {
      stats,
      campus: {
        total,
        occupied,
        available: sum(stat => stat.available),
        reserved: sum(stat => stat.reserved),
        percent: total ? Math.round((occupied / total) * 100) : 0,
      },
    };
  }, [spotStatus]);
}

function localDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function violationsToday(now: number): number {
  const today = localDate(new Date(now));
  return plateRecords.reduce(
    (count, record) => count + record.violations.filter(item => item.date === today).length,
    0,
  );
}

export function garageStatus(percent: number): { label: string; tone: 'occupied' | 'warning' | 'available'; icon: 'x-circle' | 'alert-triangle' | 'check-circle' } {
  if (percent >= 95) return { label: 'Full', tone: 'occupied', icon: 'x-circle' };
  if (percent >= 80) return { label: 'Busy', tone: 'warning', icon: 'alert-triangle' };
  return { label: 'Open', tone: 'available', icon: 'check-circle' };
}
