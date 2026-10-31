export type EventImpact = 'High' | 'Moderate' | 'Low';

export type CampusEvent = {
  id: string;
  title: string;
  venue: string;
  date: string; // ISO date, local
  startTime: string; // 'HH:MM', 24-hour
  endTime: string;
  attendance: number;
  affectedGarageIds: string[];
  impact: EventImpact;
  advice: string;
};

function isoDateFromToday(offsetDays: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Pushes a weekend date to the following Monday so the lecture stays on a week-day.
function weekdayFromToday(offsetDays: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Dates are relative to the day the app loads so the list always looks upcoming.
export const campusEvents: CampusEvent[] = [
  {
    id: 'ev-basketball',
    title: 'Spartans Basketball vs. Fresno State',
    venue: 'Provident Credit Union Event Center',
    date: isoDateFromToday(1),
    startTime: '19:00',
    endTime: '21:30',
    attendance: 4500,
    affectedGarageIds: ['south', 'west'],
    impact: 'Moderate',
    advice: 'South and West fill up from about 5:30 PM. Park in South Campus and take the shuttle, or arrive before 5 PM.',
  },
  {
    id: 'ev-lecture',
    title: 'Distinguished Lecture: Sustainable Cities',
    venue: 'Hammer Theatre Center',
    date: weekdayFromToday(2),
    startTime: '14:00',
    endTime: '15:30',
    attendance: 300,
    affectedGarageIds: ['north'],
    impact: 'Low',
    advice: 'Little effect expected. North may be slightly busier around 1:30 PM.',
  },
  {
    id: 'ev-career-fair',
    title: 'Engineering Career Fair',
    venue: 'Student Union',
    date: isoDateFromToday(3),
    startTime: '10:00',
    endTime: '15:00',
    attendance: 3000,
    affectedGarageIds: ['south', 'north'],
    impact: 'Moderate',
    advice: 'South Garage is the closest and will fill by 10 AM. North or South Campus are better midday options.',
  },
  {
    id: 'ev-football',
    title: 'Spartans Football vs. Boise State',
    venue: 'CEFCU Stadium',
    date: isoDateFromToday(5),
    startTime: '17:30',
    endTime: '21:00',
    attendance: 18000,
    affectedGarageIds: ['north', 'south'],
    impact: 'High',
    advice: 'Expect North and South to be full by 3 PM. Reserve a spot ahead of time or use South Campus with the shuttle.',
  },
  {
    id: 'ev-concert',
    title: 'Fall Concert Series',
    venue: 'Provident Credit Union Event Center',
    date: isoDateFromToday(8),
    startTime: '20:00',
    endTime: '22:30',
    attendance: 5000,
    affectedGarageIds: ['south', 'west'],
    impact: 'High',
    advice: 'Evening parking at South and West will be tight from 6 PM. Daytime classes are not affected.',
  },
];
