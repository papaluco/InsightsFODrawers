import {
  diffDays,
  diffMonths,
  eachDay,
  getWeekday,
  inclusiveDayCount,
  IsoDate,
  isWeekday,
  startOfWeek,
} from '../../../utils/dateOnly';
import { getSchoolYear, getSchoolYearQuarter } from '../../../utils/schoolYear';
import { formatBucketLabel, getDateBucket } from '../../../utils/timeBuckets';
import { ResolvedTimeframe, TimeframeKind } from '../../../utils/timeframes';

/**
 * Performance Trend rules (NXT-77211, spec §3 and §7): default interval,
 * bucket alignment between the two sides, and trend compatibility.
 * Pure TypeScript — no React, no mock data.
 */

export type TrendInterval = 'day' | 'week' | 'month' | 'quarter';

export const TREND_INTERVALS: readonly TrendInterval[] = ['day', 'week', 'month', 'quarter'];

export const TREND_UNAVAILABLE_MESSAGE =
  'Trend comparison unavailable. Select comparable timeframes to view performance trends.';

/** Returns true when the district serves meals on this date. Non-serving days are excluded from Day buckets (spec §7). */
export type ServingDayPredicate = (date: IsoDate) => boolean;

/** Prototype default until the mock calendar supplies breaks: weekdays are serving days. */
export const defaultIsServingDay: ServingDayPredicate = isWeekday;

type Period = Pick<ResolvedTimeframe, 'start' | 'end'>;

// ─── Default interval (spec §3) ──────────────────────────────────────────────

/** Default trend interval from the longer side's full span: ≤ 14 days → Day; ≤ 93 → Week; ≤ 366 → Month; otherwise Quarter. */
export function getDefaultInterval(left: Period, right: Period): TrendInterval {
  const longestSpan = Math.max(
    inclusiveDayCount(left.start, left.end),
    inclusiveDayCount(right.start, right.end),
  );
  if (longestSpan <= 14) return 'day';
  if (longestSpan <= 93) return 'week';
  if (longestSpan <= 366) return 'month';
  return 'quarter';
}

// ─── Alignment (spec §7) ─────────────────────────────────────────────────────

/**
 * How Day buckets are positioned. Normally a Day bucket's position is its school-day
 * index within the period; when both sides are weeks, days align by weekday instead.
 */
export type DayAlignment = 'schoolDayIndex' | 'weekday';

export interface TrendBucket {
  /** 1-based position used to pair this bucket with the other side's bucket at the same position. */
  position: number;
  /** Side-neutral axis label for the position, e.g. "Day 3", "Mon", "Wk 2", "Month 4", "Q3". */
  positionLabel: string;
  /** Calendar label for this side's bucket, e.g. "Apr 16", "Wk Apr 13", "Apr 26", "Q3 SY 2025–26". */
  label: string;
  /** First and last dates the bucket covers, clipped to the period and to the through date. */
  start: IsoDate;
  end: IsoDate;
}

export interface BuildTrendBucketsOptions {
  isServingDay?: ServingDayPredicate;
  dayAlignment?: DayAlignment;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Day alignment for a pair of sides: week vs week aligns by weekday (spec §7). */
export function getDayAlignment(left: ResolvedTimeframe, right: ResolvedTimeframe): DayAlignment {
  return left.kind === 'week' && right.kind === 'week' ? 'weekday' : 'schoolDayIndex';
}

/**
 * Position of `date` within its side's period.
 * - Day: school-day index within the period (or weekday, Mon = 1, for week-vs-week).
 * - Week: Monday–Sunday week index within the period.
 * - Month: month index from the start of the period. For school years (which start
 *   Jul 1) this is the same as the school-year month position, Jul = 1. Counting from
 *   the period start keeps custom ranges that cross Jul 1 in order. (Product decision,
 *   Phase 1 review: overrides spec §7's "month position within the school year".)
 * - Quarter: school-year quarter (Q1 = Jul–Sep), indexed from the quarter the period
 *   starts in. For school years this equals the quarter number; same reasoning as Month.
 */
function getPositionForDate(
  date: IsoDate,
  period: Period,
  interval: TrendInterval,
  schoolDayIndex: number,
  dayAlignment: DayAlignment,
): number {
  switch (interval) {
    case 'day':
      return dayAlignment === 'weekday' ? getWeekday(date) || 7 : schoolDayIndex;
    case 'week':
      return diffDays(startOfWeek(period.start), startOfWeek(date)) / 7 + 1;
    case 'month':
      return diffMonths(period.start, date) + 1;
    case 'quarter': {
      const quarterOrdinal = (d: IsoDate) => getSchoolYear(d).startYear * 4 + getSchoolYearQuarter(d);
      return quarterOrdinal(date) - quarterOrdinal(period.start) + 1;
    }
  }
}

function getPositionLabel(position: number, interval: TrendInterval, date: IsoDate, dayAlignment: DayAlignment): string {
  switch (interval) {
    case 'day':
      return dayAlignment === 'weekday' ? WEEKDAY_SHORT[getWeekday(date)] : `Day ${position}`;
    case 'week':
      return `Wk ${position}`;
    case 'month':
      return `Month ${position}`;
    case 'quarter':
      return `Q${getSchoolYearQuarter(date)}`;
  }
}

/**
 * Buckets for one side, in order, covering only dates that have occurred
 * (through `throughDate`). Future buckets are never produced (spec §7 partial periods).
 * Day buckets include serving days only.
 */
export function buildTrendBuckets(
  timeframe: ResolvedTimeframe,
  interval: TrendInterval,
  { isServingDay = defaultIsServingDay, dayAlignment = 'schoolDayIndex' }: BuildTrendBucketsOptions = {},
): TrendBucket[] {
  if (!timeframe.throughDate) return [];

  const buckets: TrendBucket[] = [];
  let schoolDayIndex = 0;

  for (const date of eachDay(timeframe.start, timeframe.throughDate)) {
    if (interval === 'day') {
      if (!isServingDay(date)) continue;
      schoolDayIndex += 1;
    }

    const position = getPositionForDate(date, timeframe, interval, schoolDayIndex, dayAlignment);
    const current = buckets[buckets.length - 1];
    if (current && current.position === position) {
      current.end = date;
      continue;
    }

    buckets.push({
      position,
      positionLabel: getPositionLabel(position, interval, date, dayAlignment),
      label: formatBucketLabel(getDateBucket(date, interval), interval),
      start: date,
      end: date,
    });
  }

  return buckets;
}

export interface AlignedTrendRow<T extends TrendBucket = TrendBucket> {
  position: number;
  positionLabel: string;
  left: T | null;
  right: T | null;
}

/**
 * Pairs two sides' buckets by position. A position present on only one side has null on the other.
 * Generic so callers can pair richer bucket types (e.g. series points with values) without losing fields.
 */
export function alignTrendBuckets<T extends TrendBucket>(left: T[], right: T[]): AlignedTrendRow<T>[] {
  const positions = Array.from(new Set([...left, ...right].map(b => b.position))).sort((a, b) => a - b);
  return positions.map(position => {
    const leftBucket = left.find(b => b.position === position) ?? null;
    const rightBucket = right.find(b => b.position === position) ?? null;
    // Every position came from at least one side, so one of the two buckets exists.
    const positionLabel = (leftBucket ?? rightBucket)?.positionLabel ?? '';
    return { position, positionLabel, left: leftBucket, right: rightBucket };
  });
}

// ─── Compatibility (spec §7) ─────────────────────────────────────────────────

/** Max relative length difference for two custom ranges to be comparable. */
export const CUSTOM_RANGE_LENGTH_TOLERANCE = 0.1;

/** Minimum buckets each side must produce for a trend. */
export const MIN_TREND_BUCKETS = 2;

export type TrendUnavailableReason =
  | 'kindMismatch'
  | 'customLengthMismatch'
  | 'intervalNotFinerThanPeriod'
  | 'insufficientBuckets';

export interface TrendCompatibility {
  available: boolean;
  reason: TrendUnavailableReason | null;
}

/** Coarseness ranks; an interval must rank below its period to be "finer". */
const INTERVAL_RANK: Record<TrendInterval, number> = { day: 0, week: 1, month: 2, quarter: 3 };
const NAMED_PERIOD_RANK: Record<Exclude<TimeframeKind, 'custom'>, number> = { day: 0, week: 1, month: 2, schoolYear: 4 };

/**
 * Rank of a period. Custom ranges have no named grain, so they are ranked by length
 * (≤ 1 day = day, ≤ 7 = week, ≤ 31 = month, ≤ 92 = quarter, otherwise year).
 * Prototype rule — spec §7 does not define a grain for custom ranges.
 */
function getPeriodRank(timeframe: ResolvedTimeframe): number {
  if (timeframe.kind !== 'custom') return NAMED_PERIOD_RANK[timeframe.kind];
  const days = inclusiveDayCount(timeframe.start, timeframe.end);
  if (days <= 1) return 0;
  if (days <= 7) return 1;
  if (days <= 31) return 2;
  if (days <= 92) return 3;
  return 4;
}

function customLengthsWithinTolerance(left: ResolvedTimeframe, right: ResolvedTimeframe): boolean {
  const a = inclusiveDayCount(left.start, left.end);
  const b = inclusiveDayCount(right.start, right.end);
  return Math.abs(a - b) / Math.max(a, b) <= CUSTOM_RANGE_LENGTH_TOLERANCE;
}

/**
 * Whether a trend can be shown (spec §7 prototype rule). All must hold:
 * (a) both timeframes are the same kind, or both are custom ranges whose lengths differ by ≤ 10%;
 * (b) the interval is finer than each side's period (no Quarter for a month, no Week for a day);
 * (c) each side produces at least 2 buckets that have occurred.
 */
export function checkTrendCompatibility(
  left: ResolvedTimeframe,
  right: ResolvedTimeframe,
  interval: TrendInterval,
  isServingDay: ServingDayPredicate = defaultIsServingDay,
): TrendCompatibility {
  const unavailable = (reason: TrendUnavailableReason): TrendCompatibility => ({ available: false, reason });

  if (left.kind !== right.kind) return unavailable('kindMismatch');
  if (left.kind === 'custom' && !customLengthsWithinTolerance(left, right)) return unavailable('customLengthMismatch');

  const intervalRank = INTERVAL_RANK[interval];
  if (intervalRank >= getPeriodRank(left) || intervalRank >= getPeriodRank(right)) {
    return unavailable('intervalNotFinerThanPeriod');
  }

  const options = { isServingDay, dayAlignment: getDayAlignment(left, right) };
  if (
    buildTrendBuckets(left, interval, options).length < MIN_TREND_BUCKETS ||
    buildTrendBuckets(right, interval, options).length < MIN_TREND_BUCKETS
  ) {
    return unavailable('insufficientBuckets');
  }

  return { available: true, reason: null };
}
