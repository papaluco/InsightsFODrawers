import { describe, expect, it } from 'vitest';
import {
  getSchoolYear,
  getSchoolYearByStartYear,
  getSchoolYearMonthPosition,
  getSchoolYearQuarter,
} from './schoolYear';

describe('getSchoolYear (Jul 1 – Jun 30)', () => {
  it('puts Jun 30 in the earlier school year and Jul 1 in the next', () => {
    expect(getSchoolYear('2025-06-30').label).toBe('SY 2024–25');
    expect(getSchoolYear('2025-07-01').label).toBe('SY 2025–26');
    expect(getSchoolYear('2026-06-30').label).toBe('SY 2025–26');
    expect(getSchoolYear('2026-07-01').label).toBe('SY 2026–27');
  });

  it('handles Dec 31 / Jan 1 within one school year', () => {
    expect(getSchoolYear('2025-12-31').startYear).toBe(2025);
    expect(getSchoolYear('2026-01-01').startYear).toBe(2025);
  });

  it('returns full bounds', () => {
    expect(getSchoolYear('2026-04-16')).toEqual({
      startYear: 2025,
      start: '2025-07-01',
      end: '2026-06-30',
      label: 'SY 2025–26',
    });
  });

  it('pads the two-digit end year and uses an en dash', () => {
    expect(getSchoolYearByStartYear(1999).label).toBe('SY 1999–00');
    expect(getSchoolYearByStartYear(2008).label).toBe('SY 2008–09');
    expect(getSchoolYearByStartYear(2025).label).toContain('–');
  });
});

describe('school-year positions', () => {
  it('numbers months Jul = 1 … Jun = 12', () => {
    expect(getSchoolYearMonthPosition('2025-07-01')).toBe(1);
    expect(getSchoolYearMonthPosition('2025-12-15')).toBe(6);
    expect(getSchoolYearMonthPosition('2026-01-01')).toBe(7);
    expect(getSchoolYearMonthPosition('2026-06-30')).toBe(12);
  });

  it('uses school-year quarters: Q1 Jul–Sep, Q2 Oct–Dec, Q3 Jan–Mar, Q4 Apr–Jun', () => {
    expect(getSchoolYearQuarter('2025-07-01')).toBe(1);
    expect(getSchoolYearQuarter('2025-09-30')).toBe(1);
    expect(getSchoolYearQuarter('2025-10-01')).toBe(2);
    expect(getSchoolYearQuarter('2025-12-31')).toBe(2);
    expect(getSchoolYearQuarter('2026-01-01')).toBe(3);
    expect(getSchoolYearQuarter('2026-03-31')).toBe(3);
    expect(getSchoolYearQuarter('2026-04-01')).toBe(4);
    expect(getSchoolYearQuarter('2026-06-30')).toBe(4);
  });
});
