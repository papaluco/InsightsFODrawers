import { describe, expect, it } from 'vitest';
import { isServingDay, SCHOOL_CALENDARS } from './mockSchoolCalendar';

describe('mock school calendar', () => {
  it('defines SY 2023–24 through SY 2025–26, each with winter and spring breaks', () => {
    expect(SCHOOL_CALENDARS.map(c => c.schoolYear)).toEqual([2023, 2024, 2025]);
    for (const calendar of SCHOOL_CALENDARS) {
      expect(calendar.breaks.map(b => b.name)).toEqual(['Winter Break', 'Spring Break']);
    }
  });

  it('serves on ordinary school weekdays, including the first and last day', () => {
    expect(isServingDay('2026-04-16')).toBe(true);
    expect(isServingDay('2025-08-11')).toBe(true); // first day SY 2025–26
    expect(isServingDay('2026-05-22')).toBe(true); // last day SY 2025–26
  });

  it('excludes weekends', () => {
    expect(isServingDay('2026-04-18')).toBe(false);
    expect(isServingDay('2026-04-19')).toBe(false);
  });

  it('excludes winter break', () => {
    expect(isServingDay('2025-12-19')).toBe(true);
    expect(isServingDay('2025-12-22')).toBe(false);
    expect(isServingDay('2026-01-02')).toBe(false);
    expect(isServingDay('2026-01-05')).toBe(true);
  });

  it('excludes spring break', () => {
    expect(isServingDay('2026-03-13')).toBe(true);
    expect(isServingDay('2026-03-16')).toBe(false);
    expect(isServingDay('2026-03-20')).toBe(false);
    expect(isServingDay('2026-03-23')).toBe(true);
  });

  it('excludes summer break on both sides of Jul 1', () => {
    expect(isServingDay('2025-05-27')).toBe(false); // after SY 2024–25 last day
    expect(isServingDay('2025-07-01')).toBe(false);
    expect(isServingDay('2025-08-08')).toBe(false); // before SY 2025–26 first day
  });

  it('falls back to weekdays for school years without a calendar', () => {
    expect(isServingDay('2022-10-03')).toBe(true);
    expect(isServingDay('2022-10-01')).toBe(false);
  });
});
