import {
  addDays,
  endOfMonth,
  formatMonthDay,
  formatShortDate,
  getDateParts,
  isAfter,
  isBefore,
  isIsoDate,
  IsoDate,
  minDate,
  startOfMonth,
  startOfWeek,
} from './dateOnly';
import { getSchoolYear, getSchoolYearByStartYear, SchoolYear } from './schoolYear';

/**
 * Timeframe resolution and labels (NXT-77201 spec §3, §6).
 *
 * Option IDs match DATE_OPTIONS in components/Common/TimeframeSelector.tsx.
 */

export type TimeframeOptionId =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'ytd'
  | 'prior_year'
  | 'sy2324'
  | 'sy2223'
  | 'sy2122'
  | 'sy2021'
  | 'custom';

export const TIMEFRAME_OPTION_IDS: readonly TimeframeOptionId[] = [
  'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month',
  'ytd', 'prior_year', 'sy2324', 'sy2223', 'sy2122', 'sy2021', 'custom',
];

/** Fixed school-year options → the calendar year the school year starts in. */
const FIXED_SCHOOL_YEAR_OPTIONS: Partial<Record<TimeframeOptionId, number>> = {
  sy2324: 2023,
  sy2223: 2022,
  sy2122: 2021,
  sy2021: 2020,
};

/** Relative options use their own name as the label (spec §6). */
const RELATIVE_OPTION_LABELS: Partial<Record<TimeframeOptionId, string>> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  last_week: 'Last Week',
  this_month: 'This Month',
  last_month: 'Last Month',
};

/** Period type. Trend compatibility (spec §7) compares sides by kind. */
export type TimeframeKind = 'day' | 'week' | 'month' | 'schoolYear' | 'custom';

export interface CustomDateRange {
  start: IsoDate;
  end: IsoDate;
}

export interface ResolvedTimeframe {
  optionId: TimeframeOptionId;
  kind: TimeframeKind;
  /** First day of the full period. */
  start: IsoDate;
  /** Last day of the full period, even if it is after the as-of date (e.g. Jun 30 for YTD). */
  end: IsoDate;
  /** Set when the whole period falls within one school year (always true except for some custom ranges). */
  schoolYear?: SchoolYear;
  /** True when the period extends past the as-of date. */
  isPartial: boolean;
  /** Last day with data: the earlier of `end` and the as-of date. Null when the period starts after the as-of date. */
  throughDate: IsoDate | null;
}

function getPeriod(
  optionId: TimeframeOptionId,
  asOf: IsoDate,
  customRange?: CustomDateRange,
): { kind: TimeframeKind; start: IsoDate; end: IsoDate } {
  switch (optionId) {
    case 'today':
      return { kind: 'day', start: asOf, end: asOf };
    case 'yesterday': {
      const day = addDays(asOf, -1);
      return { kind: 'day', start: day, end: day };
    }
    // Weeks run Monday–Sunday.
    case 'this_week': {
      const monday = startOfWeek(asOf);
      return { kind: 'week', start: monday, end: addDays(monday, 6) };
    }
    case 'last_week': {
      const monday = addDays(startOfWeek(asOf), -7);
      return { kind: 'week', start: monday, end: addDays(monday, 6) };
    }
    case 'this_month':
      return { kind: 'month', start: startOfMonth(asOf), end: endOfMonth(asOf) };
    case 'last_month': {
      const lastMonth = addDays(startOfMonth(asOf), -1);
      return { kind: 'month', start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    // Year to Date resolves to the full school year containing the as-of date (spec §6).
    case 'ytd': {
      const sy = getSchoolYear(asOf);
      return { kind: 'schoolYear', start: sy.start, end: sy.end };
    }
    case 'prior_year': {
      const sy = getSchoolYearByStartYear(getSchoolYear(asOf).startYear - 1);
      return { kind: 'schoolYear', start: sy.start, end: sy.end };
    }
    case 'custom': {
      if (!customRange) throw new Error('A custom range is required for the "custom" timeframe.');
      const { start, end } = customRange;
      if (!isIsoDate(start) || !isIsoDate(end)) {
        throw new Error(`Invalid custom range: ${start} – ${end}`);
      }
      if (isAfter(start, end)) throw new Error(`Custom range starts after it ends: ${start} – ${end}`);
      return { kind: 'custom', start, end };
    }
    default: {
      const startYear = FIXED_SCHOOL_YEAR_OPTIONS[optionId];
      if (startYear === undefined) throw new Error(`Unknown timeframe option: "${optionId}"`);
      const sy = getSchoolYearByStartYear(startYear);
      return { kind: 'schoolYear', start: sy.start, end: sy.end };
    }
  }
}

export function resolveTimeframe(
  optionId: TimeframeOptionId,
  asOf: IsoDate,
  customRange?: CustomDateRange,
): ResolvedTimeframe {
  const { kind, start, end } = getPeriod(optionId, asOf, customRange);

  const startSchoolYear = getSchoolYear(start);
  const schoolYear = startSchoolYear.startYear === getSchoolYear(end).startYear ? startSchoolYear : undefined;

  // Partial = the period extends past the as-of date. A period ending on the as-of date (e.g. Today) is complete.
  const isPartial = isAfter(end, asOf);
  const throughDate = isBefore(asOf, start) ? null : minDate(end, asOf);

  return { optionId, kind, start, end, ...(schoolYear && { schoolYear }), isPartial, throughDate };
}

/** "Aug 1 – Sep 30, 2025", "Dec 15, 2025 – Jan 10, 2026", or "Aug 1, 2025" for a single day. */
export function formatDateRangeLabel(start: IsoDate, end: IsoDate): string {
  if (start === end) return formatShortDate(start);
  if (getDateParts(start).year === getDateParts(end).year) {
    return `${formatMonthDay(start)} – ${formatShortDate(end)}`;
  }
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

/**
 * Timeframe part of a side's generated label (spec §6):
 * school-year options → "SY 2025–26"; relative options → their name; Custom Range → the date range.
 */
export function getTimeframeLabel(timeframe: ResolvedTimeframe): string {
  if (timeframe.kind === 'schoolYear' && timeframe.schoolYear) return timeframe.schoolYear.label;
  if (timeframe.kind === 'custom') return formatDateRangeLabel(timeframe.start, timeframe.end);
  return RELATIVE_OPTION_LABELS[timeframe.optionId] ?? formatDateRangeLabel(timeframe.start, timeframe.end);
}

/** Partial badge text (spec §6), e.g. "Partial · through Apr 16, 2026". Null when the period is complete. */
export function getPartialPeriodLabel(timeframe: ResolvedTimeframe): string | null {
  if (!timeframe.isPartial) return null;
  if (!timeframe.throughDate) return 'Partial · no data yet';
  return `Partial · through ${formatShortDate(timeframe.throughDate)}`;
}
