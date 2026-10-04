import { diffMonths, getDateParts, IsoDate, toIsoDate } from './dateOnly';

/**
 * School year rules (NXT-77201 spec §3).
 * The school year runs July 1 – June 30 and is not configurable.
 */

/** Month (1–12) the school year starts in. */
export const SCHOOL_YEAR_START_MONTH = 7;

export interface SchoolYear {
  /** Calendar year the school year starts in (SY 2025–26 → 2025). */
  startYear: number;
  /** July 1 of startYear. */
  start: IsoDate;
  /** June 30 of startYear + 1. */
  end: IsoDate;
  /** "SY 2025–26" (en dash). */
  label: string;
}

export function getSchoolYearByStartYear(startYear: number): SchoolYear {
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return {
    startYear,
    start: toIsoDate(startYear, SCHOOL_YEAR_START_MONTH, 1),
    end: toIsoDate(startYear + 1, SCHOOL_YEAR_START_MONTH - 1, 30),
    label: `SY ${startYear}–${endYearShort}`,
  };
}

/** The school year containing `date`. Jun 30 belongs to the earlier year; Jul 1 starts the next. */
export function getSchoolYear(date: IsoDate): SchoolYear {
  const { year, month } = getDateParts(date);
  return getSchoolYearByStartYear(month >= SCHOOL_YEAR_START_MONTH ? year : year - 1);
}

/** Month position within the school year: Jul = 1 … Jun = 12. */
export function getSchoolYearMonthPosition(date: IsoDate): number {
  return diffMonths(getSchoolYear(date).start, date) + 1;
}

/** School-year quarter (spec §3): Q1 = Jul–Sep, Q2 = Oct–Dec, Q3 = Jan–Mar, Q4 = Apr–Jun. */
export function getSchoolYearQuarter(date: IsoDate): 1 | 2 | 3 | 4 {
  return (Math.floor((getSchoolYearMonthPosition(date) - 1) / 3) + 1) as 1 | 2 | 3 | 4;
}
