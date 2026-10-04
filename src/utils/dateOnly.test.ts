import { describe, expect, it } from 'vitest';
import {
  addDays,
  diffDays,
  diffMonths,
  eachDay,
  endOfMonth,
  formatLongDate,
  formatMonthDay,
  formatMonthYear,
  formatShortDate,
  fromLocalDate,
  getWeekday,
  inclusiveDayCount,
  isIsoDate,
  isWeekday,
  startOfMonth,
  startOfWeek,
  toIsoDate,
  toLocalDate,
} from './dateOnly';

describe('dateOnly', () => {
  it('validates ISO dates', () => {
    expect(isIsoDate('2026-04-16')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2026-4-16')).toBe(false);
    expect(isIsoDate('2026-04-16T00:00:00Z')).toBe(false);
  });

  it('builds dates, rolling over out-of-range parts', () => {
    expect(toIsoDate(2026, 4, 16)).toBe('2026-04-16');
    expect(toIsoDate(2026, 13, 1)).toBe('2027-01-01');
    expect(toIsoDate(2026, 3, 0)).toBe('2026-02-28');
  });

  it('adds days across month, year, and leap-day boundaries', () => {
    expect(addDays('2026-04-30', 1)).toBe('2026-05-01');
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('is unaffected by DST transitions', () => {
    expect(addDays('2026-03-07', 2)).toBe('2026-03-09');
    expect(diffDays('2026-03-07', '2026-03-09')).toBe(2);
    expect(diffDays('2025-11-01', '2025-11-03')).toBe(2);
  });

  it('counts days and months', () => {
    expect(diffDays('2026-04-16', '2026-04-13')).toBe(-3);
    expect(inclusiveDayCount('2026-04-16', '2026-04-16')).toBe(1);
    expect(inclusiveDayCount('2025-07-01', '2026-06-30')).toBe(365);
    expect(inclusiveDayCount('2023-07-01', '2024-06-30')).toBe(366);
    expect(diffMonths('2025-07-15', '2025-09-01')).toBe(2);
    expect(diffMonths('2025-12-31', '2026-01-01')).toBe(1);
  });

  it('knows weekdays (2026-04-16 is a Thursday)', () => {
    expect(getWeekday('2026-04-16')).toBe(4);
    expect(isWeekday('2026-04-17')).toBe(true);
    expect(isWeekday('2026-04-18')).toBe(false);
    expect(isWeekday('2026-04-19')).toBe(false);
  });

  it('finds Monday-start weeks and month bounds', () => {
    expect(startOfWeek('2026-04-16')).toBe('2026-04-13');
    expect(startOfWeek('2026-04-13')).toBe('2026-04-13');
    expect(startOfWeek('2026-04-19')).toBe('2026-04-13'); // Sunday belongs to the week before
    expect(startOfMonth('2026-04-16')).toBe('2026-04-01');
    expect(endOfMonth('2024-02-10')).toBe('2024-02-29');
    expect(endOfMonth('2026-02-10')).toBe('2026-02-28');
  });

  it('lists each day inclusive', () => {
    expect(eachDay('2026-04-29', '2026-05-02')).toEqual(['2026-04-29', '2026-04-30', '2026-05-01', '2026-05-02']);
    expect(eachDay('2026-04-16', '2026-04-15')).toEqual([]);
  });

  it('formats dates', () => {
    expect(formatMonthDay('2026-04-16')).toBe('Apr 16');
    expect(formatShortDate('2026-04-16')).toBe('Apr 16, 2026');
    expect(formatLongDate('2026-04-16')).toBe('April 16, 2026');
    expect(formatMonthYear('2026-04-16')).toBe('Apr 2026');
  });
});

describe('toLocalDate / fromLocalDate', () => {
  it('builds a local-midnight Date on the same calendar day', () => {
    const date = toLocalDate('2026-04-16');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 3, 16, 0]);
  });

  it('round-trips', () => {
    expect(fromLocalDate(toLocalDate('2024-02-29'))).toBe('2024-02-29');
    expect(fromLocalDate(new Date(2025, 11, 31, 23, 59))).toBe('2025-12-31');
  });
});
