import { IsoDate, isWeekday } from '../utils/dateOnly';
import { getSchoolYear } from '../utils/schoolYear';

/**
 * Demo district school calendar for Performance Comparison mock data (spec §9).
 *
 * A serving day is a weekday inside the instructional calendar that is not in a
 * break. Summer break is everything in the school year (Jul 1 – Jun 30) before the
 * first day or after the last day. `isServingDay` plugs into the trend
 * `ServingDayPredicate` hook so non-serving days are excluded from Day buckets.
 */

export interface SchoolBreak {
  name: 'Winter Break' | 'Spring Break';
  start: IsoDate;
  end: IsoDate;
}

export interface SchoolYearCalendar {
  /** School year start year (SY 2025–26 → 2025). */
  schoolYear: number;
  firstDay: IsoDate;
  lastDay: IsoDate;
  breaks: SchoolBreak[];
}

export const SCHOOL_CALENDARS: readonly SchoolYearCalendar[] = [
  {
    schoolYear: 2023,
    firstDay: '2023-08-14',
    lastDay: '2024-05-24',
    breaks: [
      { name: 'Winter Break', start: '2023-12-21', end: '2024-01-03' },
      { name: 'Spring Break', start: '2024-03-11', end: '2024-03-15' },
    ],
  },
  {
    schoolYear: 2024,
    firstDay: '2024-08-12',
    lastDay: '2025-05-23',
    breaks: [
      { name: 'Winter Break', start: '2024-12-23', end: '2025-01-03' },
      { name: 'Spring Break', start: '2025-03-10', end: '2025-03-14' },
    ],
  },
  {
    schoolYear: 2025,
    firstDay: '2025-08-11',
    lastDay: '2026-05-22',
    breaks: [
      { name: 'Winter Break', start: '2025-12-22', end: '2026-01-02' },
      { name: 'Spring Break', start: '2026-03-16', end: '2026-03-20' },
    ],
  },
];

export function getSchoolYearCalendar(schoolYear: number): SchoolYearCalendar | undefined {
  return SCHOOL_CALENDARS.find(c => c.schoolYear === schoolYear);
}

/**
 * True when meals are served on `date`. School years without a calendar (before
 * SY 2023–24) fall back to weekdays; they have no mock data either way.
 */
export function isServingDay(date: IsoDate): boolean {
  if (!isWeekday(date)) return false;
  const calendar = getSchoolYearCalendar(getSchoolYear(date).startYear);
  if (!calendar) return true;
  if (date < calendar.firstDay || date > calendar.lastDay) return false; // summer break
  return !calendar.breaks.some(b => date >= b.start && date <= b.end);
}
