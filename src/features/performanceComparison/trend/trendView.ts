import { formatLongDate } from '../../../utils/dateOnly';
import type { ResolvedTimeframe } from '../../../utils/timeframes';
import {
  alignTrendBuckets,
  checkTrendCompatibility,
  ServingDayPredicate,
  TREND_INTERVALS,
  TrendBucket,
  TrendInterval,
  TrendUnavailableReason,
} from './trendRules';

/**
 * Performance Trend view model (NXT-77211, spec §7): which intervals are selectable and why
 * not, which interval to show, and the chart rows. Pure TypeScript — builds on trendRules
 * (compatibility, alignment) and the data service's series; it never buckets dates itself.
 */

export const TREND_INTERVAL_LABELS: Record<TrendInterval, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  quarter: 'Quarter',
};

const INTERVAL_PLURALS: Record<TrendInterval, string> = {
  day: 'days',
  week: 'weeks',
  month: 'months',
  quarter: 'quarters',
};

export interface TrendIntervalOption {
  interval: TrendInterval;
  available: boolean;
  /** Tooltip for a disabled interval; null when available. */
  disabledReason: string | null;
}

function describeUnavailable(interval: TrendInterval, reason: TrendUnavailableReason): string {
  switch (reason) {
    case 'kindMismatch':
      return 'Unavailable: the two timeframes are different kinds of periods.';
    case 'customLengthMismatch':
      return 'Unavailable: the two custom ranges differ in length by more than 10%.';
    case 'intervalNotFinerThanPeriod':
      return `Unavailable: ${TREND_INTERVAL_LABELS[interval]} is not shorter than the selected timeframes.`;
    case 'insufficientBuckets':
      return `Unavailable: each timeframe needs at least 2 ${INTERVAL_PLURALS[interval]} that have occurred.`;
  }
}

/** Every interval with its availability for this pair of timeframes (spec §7 compatibility). */
export function getTrendIntervalOptions(
  left: ResolvedTimeframe,
  right: ResolvedTimeframe,
  isServingDay: ServingDayPredicate,
): TrendIntervalOption[] {
  return TREND_INTERVALS.map(interval => {
    const { available, reason } = checkTrendCompatibility(left, right, interval, isServingDay);
    return { interval, available, disabledReason: available || !reason ? null : describeUnavailable(interval, reason) };
  });
}

/**
 * The interval to show: the user's choice while it's still available, otherwise the spec §3
 * default. If the default isn't available either, the available interval closest to it (finer
 * first on a tie). Null when no interval is available — the trend is unavailable.
 */
export function resolveTrendInterval(
  userChoice: TrendInterval | null,
  options: TrendIntervalOption[],
  defaultInterval: TrendInterval,
): TrendInterval | null {
  const isAvailable = (interval: TrendInterval) => options.some(o => o.interval === interval && o.available);
  if (userChoice && isAvailable(userChoice)) return userChoice;
  if (isAvailable(defaultInterval)) return defaultInterval;
  const defaultRank = TREND_INTERVALS.indexOf(defaultInterval);
  const byDistance = [...TREND_INTERVALS]
    .filter(isAvailable)
    .sort((a, b) => {
      const da = Math.abs(TREND_INTERVALS.indexOf(a) - defaultRank);
      const db = Math.abs(TREND_INTERVALS.indexOf(b) - defaultRank);
      return da - db || TREND_INTERVALS.indexOf(a) - TREND_INTERVALS.indexOf(b);
    });
  return byDistance[0] ?? null;
}

// ─── Chart rows ──────────────────────────────────────────────────────────────

/** A series point as returned by comparisonDataService's series(). */
export interface TrendSeriesPoint extends TrendBucket {
  actual: number | null;
  target: number | null;
}

export interface TrendChartRow {
  position: number;
  /** X-axis tick. */
  axisLabel: string;
  /** Each side's calendar label for this position (tooltip), null when that side has no bucket here. */
  leftPeriodLabel: string | null;
  rightPeriodLabel: string | null;
  /** null = No Data: drawn as a gap, never a zero bar. */
  leftActual: number | null;
  rightActual: number | null;
  /** Per-side target lines; null when the targets are merged or absent. */
  leftTarget: number | null;
  rightTarget: number | null;
  /** One line for both sides when their targets are identical. */
  sharedTarget: number | null;
}

export interface TrendChartData {
  rows: TrendChartRow[];
  /** Both sides' targets are identical, drawn as one line labeled for both. */
  targetsMerged: boolean;
  hasLeftTarget: boolean;
  hasRightTarget: boolean;
}

/** Month buckets are labeled "Sep 25"; the month part alone, e.g. "Sep". */
const monthName = (label: string) => label.split(' ')[0];

/**
 * X-axis tick for a position. Month buckets show the month name when both sides fall in the
 * same calendar month (e.g. school year vs school year), otherwise the side-neutral position
 * label ("Month 3", "Wk 2", "Mon", "Day 4", "Q3").
 */
function getAxisLabel(interval: TrendInterval, positionLabel: string, left: TrendBucket | null, right: TrendBucket | null): string {
  if (interval !== 'month') return positionLabel;
  const names = [left, right].filter((b): b is TrendBucket => b !== null).map(b => monthName(b.label));
  return names.every(n => n === names[0]) ? names[0] : positionLabel;
}

const sameTarget = (a: number | null, b: number | null) =>
  a === null || b === null ? a === b : Math.abs(a - b) < 1e-9;

/**
 * Pairs both sides' series by position (alignTrendBuckets) into chart rows.
 * Targets are merged into one line when, at every position both sides have, their targets are
 * identical (and at least one exists). `showTargets` is false for informational KPIs.
 */
export function buildTrendChartData(
  leftSeries: TrendSeriesPoint[],
  rightSeries: TrendSeriesPoint[],
  interval: TrendInterval,
  showTargets: boolean,
): TrendChartData {
  const aligned = alignTrendBuckets(leftSeries, rightSeries);
  const leftTargets = aligned.map(r => (showTargets ? r.left?.target ?? null : null));
  const rightTargets = aligned.map(r => (showTargets ? r.right?.target ?? null : null));
  const hasLeftTarget = leftTargets.some(t => t !== null);
  const hasRightTarget = rightTargets.some(t => t !== null);

  const targetsMerged =
    hasLeftTarget &&
    hasRightTarget &&
    aligned.every((r, i) => !r.left || !r.right || sameTarget(leftTargets[i], rightTargets[i]));

  const rows = aligned.map((r, i): TrendChartRow => ({
    position: r.position,
    axisLabel: getAxisLabel(interval, r.positionLabel, r.left, r.right),
    leftPeriodLabel: r.left?.label ?? null,
    rightPeriodLabel: r.right?.label ?? null,
    leftActual: r.left?.actual ?? null,
    rightActual: r.right?.actual ?? null,
    leftTarget: targetsMerged ? null : leftTargets[i],
    rightTarget: targetsMerged ? null : rightTargets[i],
    sharedTarget: targetsMerged ? leftTargets[i] ?? rightTargets[i] : null,
  }));

  return { rows, targetsMerged, hasLeftTarget, hasRightTarget };
}

// ─── Partial-period note (spec §7) ───────────────────────────────────────────

interface PartialSide {
  label: string;
  timeframe: Pick<ResolvedTimeframe, 'isPartial' | 'throughDate'>;
}

/**
 * Notes under the chart for each partial side, e.g. "All Sites · SY 2025–26 includes data
 * through April 16, 2026. Later periods have not occurred and are not shown."
 */
export function getTrendPartialNotes(left: PartialSide, right: PartialSide): string[] {
  return [left, right]
    .filter(side => side.timeframe.isPartial)
    .map(side =>
      side.timeframe.throughDate
        ? `${side.label} includes data through ${formatLongDate(side.timeframe.throughDate)}. Later periods have not occurred and are not shown.`
        : `${side.label} has no data yet.`,
    );
}
