import {
  addDays,
  endOfMonth,
  formatMonthDay,
  formatShortDate,
  getDateParts,
  inclusiveDayCount,
  isAfter,
  isBefore,
  isIsoDate,
  IsoDate,
  minDate,
  startOfMonth,
  startOfWeek,
  toIsoDate,
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
  | 'prior_ytd'
  | 'sy2324'
  | 'sy2223'
  | 'sy2122'
  | 'sy2021'
  | 'custom';

export const TIMEFRAME_OPTION_IDS: readonly TimeframeOptionId[] = [
  'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month',
  'ytd', 'prior_year', 'prior_ytd', 'sy2324', 'sy2223', 'sy2122', 'sy2021', 'custom',
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

/** The same month and day one year earlier; Feb 29 maps to Feb 28 (spec §3). */
function sameDayOneYearEarlier(date: IsoDate): IsoDate {
  const { year, month, day } = getDateParts(date);
  return toIsoDate(year - 1, month, month === 2 && day === 29 ? 28 : day);
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
    // Same elapsed portion of the prior school year as Year to Date (spec §3). Kind stays
    // 'schoolYear' so it trends against YTD; month positions count from Jul 1 on both sides.
    case 'prior_ytd': {
      const sy = getSchoolYearByStartYear(getSchoolYear(asOf).startYear - 1);
      return { kind: 'schoolYear', start: sy.start, end: sameDayOneYearEarlier(asOf) };
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

/** The parts of a resolved timeframe that period comparisons need. */
export type TimeframePeriod = Pick<ResolvedTimeframe, 'optionId' | 'start' | 'end' | 'isPartial' | 'throughDate'>;

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
 * school-year options → "SY 2025–26"; Prior Year to Date → "SY 2024–25 through Apr 16";
 * relative options → their name; Custom Range → the date range.
 */
export function getTimeframeLabel(timeframe: ResolvedTimeframe): string {
  if (timeframe.optionId === 'prior_ytd' && timeframe.schoolYear) {
    return `${timeframe.schoolYear.label} through ${formatMonthDay(timeframe.end)}`;
  }
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

// ─── Period-length notice (spec §6) ──────────────────────────────────────────

export const PERIOD_LENGTH_NOTICE =
  'These timeframes cover different lengths of time and cumulative totals may be difficult to compare directly.';

export const PERIOD_LENGTH_NOTICE_YTD_VS_PRIOR_YEAR =
  'These timeframes cover different lengths of time. For a like-for-like comparison, consider Prior Year to Date.';

/** Minimum extra length (as a fraction of the partial side's covered days) that triggers the notice. */
export const PERIOD_LENGTH_NOTICE_THRESHOLD = 0.1;

/** Calendar days a side covers: through its through date when partial, otherwise the full period. */
function coveredDays(timeframe: TimeframePeriod): number {
  if (!timeframe.isPartial) return inclusiveDayCount(timeframe.start, timeframe.end);
  return timeframe.throughDate ? inclusiveDayCount(timeframe.start, timeframe.throughDate) : 0;
}

/**
 * Informational notice when the two sides cover different lengths of time (spec §6).
 * Shown only when exactly one side is partial and the other covers at least 10% more
 * days. Year to Date vs Prior Year (either order) gets a notice suggesting Prior Year to
 * Date. Returns null when no notice applies. Never changes either selection.
 */
export function getPeriodLengthNotice(left: TimeframePeriod, right: TimeframePeriod): string | null {
  if (left.isPartial === right.isPartial) return null;

  const [partial, complete] = left.isPartial ? [left, right] : [right, left];
  const partialDays = coveredDays(partial);
  // Rounded so exact boundaries (e.g. 290 vs 319 days = 10.0%) aren't lost to floating-point error.
  const extraFraction = partialDays === 0 ? Infinity : coveredDays(complete) / partialDays - 1;
  if (Number(extraFraction.toFixed(6)) < PERIOD_LENGTH_NOTICE_THRESHOLD) return null;

  const pair = new Set([left.optionId, right.optionId]);
  return pair.has('ytd') && pair.has('prior_year') ? PERIOD_LENGTH_NOTICE_YTD_VS_PRIOR_YEAR : PERIOD_LENGTH_NOTICE;
}

// ─── Selector option descriptions (NXT-77202) ────────────────────────────────

/**
 * Secondary text under each TimeframeSelector option, derived from resolveTimeframe so it
 * always matches the period the option resolves to (e.g. This Week → "Apr 13 – Apr 19, 2026").
 * Year to Date shows the elapsed period through the as-of date, since "to date" means exactly
 * that. Custom Range has no fixed period and returns null.
 */
export function getTimeframeOptionDescription(optionId: TimeframeOptionId, asOf: IsoDate): string | null {
  if (optionId === 'custom') return null;
  const timeframe = resolveTimeframe(optionId, asOf);
  const end = optionId === 'ytd' && timeframe.throughDate ? timeframe.throughDate : timeframe.end;
  return formatDateRangeLabel(timeframe.start, end);
}
