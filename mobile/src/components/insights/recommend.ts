import { garages, getGarage, type Garage } from '../../mock/garages';
import type { ClassDay, ClassMeeting } from '../../mock/schedule';
import { classDays } from '../../mock/schedule';
import { FIRST_HOUR, clampHour, hourlyOccupancy } from '../../mock/trends';
import { toMinutes } from './time';

// Walk time plus a buffer to find a space and get settled.
const BUFFER_MINUTES = 15;
// Arriving this full usually means circling for a spot.
export const BUSY_PERCENT = 90;

const dayIndex: Record<ClassDay, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 };

export type Recommendation = {
  key: string;
  day: ClassDay;
  meeting: ClassMeeting;
  arrivalMinutes: number;
  percent: number;
  alternative: { garage: Garage; percent: number } | null;
};

function percentAtArrival(garage: Garage, day: ClassDay, meeting: ClassMeeting) {
  const arrivalMinutes = toMinutes(meeting.start) - (garage.walkMinutes + BUFFER_MINUTES);
  const hour = clampHour(Math.floor(arrivalMinutes / 60));
  const percent = hourlyOccupancy(garage.id, dayIndex[day], 0)[hour - FIRST_HOUR].percent;
  return { arrivalMinutes, percent };
}

export function recommend(meetings: ClassMeeting[], garageId: string): Recommendation[] {
  const garage = getGarage(garageId);
  if (!garage) return [];

  const rows: Recommendation[] = [];
  for (const meeting of meetings) {
    for (const day of meeting.days) {
      const { arrivalMinutes, percent } = percentAtArrival(garage, day, meeting);
      let alternative: Recommendation['alternative'] = null;
      if (percent >= BUSY_PERCENT) {
        // Each garage has its own walk time, so its arrival hour can differ too.
        const options = garages
          .filter(other => other.id !== garage.id)
          .map(other => ({ garage: other, percent: percentAtArrival(other, day, meeting).percent }))
          .sort((first, second) => first.percent - second.percent);
        if (options.length > 0 && options[0].percent < percent) alternative = options[0];
      }
      rows.push({ key: `${meeting.id}-${day}`, day, meeting, arrivalMinutes, percent, alternative });
    }
  }

  return rows.sort((first, second) => {
    const byDay = classDays.indexOf(first.day) - classDays.indexOf(second.day);
    return byDay !== 0 ? byDay : toMinutes(first.meeting.start) - toMinutes(second.meeting.start);
  });
}
