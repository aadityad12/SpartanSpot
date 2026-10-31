export type ClassDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export type ClassMeeting = {
  id: string;
  course: string;
  title: string;
  days: ClassDay[];
  start: string; // 'HH:MM', 24-hour
  end: string; // 'HH:MM', 24-hour
  building: string;
};

export const classDays: ClassDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const defaultSchedule: ClassMeeting[] = [
  {
    id: 'cmpe131',
    course: 'CMPE 131',
    title: 'Software Engineering I',
    days: ['Mon', 'Wed'],
    start: '10:30',
    end: '11:45',
    building: 'ENG 189',
  },
  {
    id: 'math42',
    course: 'MATH 42',
    title: 'Discrete Mathematics',
    days: ['Tue', 'Thu'],
    start: '09:00',
    end: '10:15',
    building: 'MH 225',
  },
  {
    id: 'phys50',
    course: 'PHYS 50',
    title: 'General Physics I',
    days: ['Tue', 'Thu'],
    start: '13:30',
    end: '14:45',
    building: 'SCI 142',
  },
  {
    id: 'engl1b',
    course: 'ENGL 1B',
    title: 'Argument and Analysis',
    days: ['Fri'],
    start: '09:00',
    end: '11:45',
    building: 'BBC 125',
  },
];
