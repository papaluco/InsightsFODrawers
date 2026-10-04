/**
 * Calendar-date helpers for ISO date strings ("YYYY-MM-DD").
 *
 * Comparison logic works with calendar dates, not instants. All arithmetic is
 * done in UTC so results never depend on the viewer's time zone.
 */

/** A calendar date in ISO form, e.g. "2026-04-16". */
export type IsoDate = string;

const MS_PER_DAY = 86_400_000;

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface DateParts {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const { year, month, day } = parseParts(value);
  return toIsoDate(year, month, day) === value;
}

function parseParts(date: IsoDate): DateParts {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

export function getDateParts(date: IsoDate): DateParts {
  if (!isIsoDate(date)) throw new Error(`Invalid ISO date: "${date}"`);
  return parseParts(date);
}

/** Builds an ISO date; out-of-range months/days roll over like Date.UTC. */
export function toIsoDate(year: number, month: number, day: number): IsoDate {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function toUtcMs(date: IsoDate): number {
  const { year, month, day } = getDateParts(date);
  return Date.UTC(year, month - 1, day);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return new Date(toUtcMs(date) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function diffDays(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** Number of calendar days in [start, end], inclusive. */
export function inclusiveDayCount(start: IsoDate, end: IsoDate): number {
  return diffDays(start, end) + 1;
}

/** 0 = Sunday … 6 = Saturday (same convention as Date#getDay). */
export function getWeekday(date: IsoDate): number {
  return new Date(toUtcMs(date)).getUTCDay();
}

export function isWeekday(date: IsoDate): boolean {
  const weekday = getWeekday(date);
  return weekday !== 0 && weekday !== 6;
}

/** Monday of the Monday–Sunday week containing `date`. */
export function startOfWeek(date: IsoDate): IsoDate {
  const weekday = getWeekday(date);
  return addDays(date, weekday === 0 ? -6 : 1 - weekday);
}

export function startOfMonth(date: IsoDate): IsoDate {
  const { year, month } = getDateParts(date);
  return toIsoDate(year, month, 1);
}

export function endOfMonth(date: IsoDate): IsoDate {
  const { year, month } = getDateParts(date);
  return toIsoDate(year, month + 1, 0);
}

/** Calendar months from `from`'s month to `to`'s month (Jul → Sep = 2). */
export function diffMonths(from: IsoDate, to: IsoDate): number {
  const a = getDateParts(from);
  const b = getDateParts(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

// ISO strings sort lexically in date order, so these are plain comparisons.
export const isBefore = (a: IsoDate, b: IsoDate): boolean => a < b;
export const isAfter = (a: IsoDate, b: IsoDate): boolean => a > b;
export const minDate = (a: IsoDate, b: IsoDate): IsoDate => (a < b ? a : b);
export const maxDate = (a: IsoDate, b: IsoDate): IsoDate => (a > b ? a : b);

/** Every date in [start, end], inclusive. */
export function eachDay(start: IsoDate, end: IsoDate): IsoDate[] {
  const days: IsoDate[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

/** "Apr 16" */
export function formatMonthDay(date: IsoDate): string {
  const { month, day } = getDateParts(date);
  return `${MONTH_SHORT[month - 1]} ${day}`;
}

/** "Apr 16, 2026" */
export function formatShortDate(date: IsoDate): string {
  return `${formatMonthDay(date)}, ${getDateParts(date).year}`;
}

/** "April 16, 2026" */
export function formatLongDate(date: IsoDate): string {
  const { year, month, day } = getDateParts(date);
  return `${MONTH_LONG[month - 1]} ${day}, ${year}`;
}

/** "Apr 2026" */
export function formatMonthYear(date: IsoDate): string {
  const { year, month } = getDateParts(date);
  return `${MONTH_SHORT[month - 1]} ${year}`;
}
