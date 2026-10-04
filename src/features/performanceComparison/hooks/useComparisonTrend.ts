import { useEffect, useMemo } from 'react';
import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { comparisonIsServingDay } from '../../../services/comparisonDataService';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { useComparisonStore } from '../store/useComparisonStore';
import { getDayAlignment, getDefaultInterval, TrendInterval } from '../trend/trendRules';
import {
  buildTrendChartData,
  getTrendIntervalOptions,
  getTrendPartialNotes,
  resolveTrendInterval,
  TrendChartData,
  TrendIntervalOption,
} from '../trend/trendView';
import type { ComparisonView } from './useComparison';

export interface ComparisonTrendView {
  /** Every interval with availability and a reason when disabled; empty until both sides are loaded. */
  intervalOptions: TrendIntervalOption[];
  /** The interval shown; null when no interval is compatible (trend unavailable). */
  interval: TrendInterval | null;
  focusedKpi: ComparisonKpiKey | null;
  /** Chart rows for the focused KPI; null with no focused KPI or no compatible interval. */
  chartData: TrendChartData | null;
  partialNotes: string[];
}

/**
 * Performance Trend for the current comparison (NXT-77211, spec §7). Uses the trend rules for
 * compatibility, default interval, and alignment, and each side's series() from the data
 * service — it never buckets dates itself.
 *
 * The user's interval choice stays in the store while it's valid. Once the comparison changes
 * so it's no longer available, the choice is cleared and the spec §3 default applies.
 */
export function useComparisonTrend(comparison: ComparisonView): ComparisonTrendView {
  const focusedKpi = useComparisonStore(s => s.focusedKpi);
  const chosenInterval = useComparisonStore(s => s.trendInterval);
  const setTrendInterval = useComparisonStore(s => s.setTrendInterval);

  const left = comparison.bothSidesSet ? comparison.left.dataset : null;
  const right = comparison.bothSidesSet ? comparison.right.dataset : null;

  const intervalOptions = useMemo(
    () => (left && right ? getTrendIntervalOptions(left.timeframe, right.timeframe, comparisonIsServingDay) : []),
    [left, right],
  );

  const interval = useMemo(
    () =>
      left && right
        ? resolveTrendInterval(chosenInterval, intervalOptions, getDefaultInterval(left.timeframe, right.timeframe))
        : null,
    [left, right, chosenInterval, intervalOptions],
  );

  // A stored choice that is no longer valid for the settled comparison falls back to the default.
  useEffect(() => {
    if (!chosenInterval || comparison.isLoading || intervalOptions.length === 0) return;
    if (!intervalOptions.some(o => o.interval === chosenInterval && o.available)) setTrendInterval(null);
  }, [chosenInterval, comparison.isLoading, intervalOptions, setTrendInterval]);

  const chartData = useMemo(() => {
    if (!left || !right || !focusedKpi || !interval) return null;
    const options = { dayAlignment: getDayAlignment(left.timeframe, right.timeframe) };
    // spec §7: informational KPIs chart normally with no target lines.
    const showTargets = getKpiDefinition(focusedKpi).kind === 'directional';
    return buildTrendChartData(
      left.series(focusedKpi, interval, options),
      right.series(focusedKpi, interval, options),
      interval,
      showTargets,
    );
  }, [left, right, focusedKpi, interval]);

  const partialNotes = useMemo(() => (left && right ? getTrendPartialNotes(left, right) : []), [left, right]);

  return { intervalOptions, interval, focusedKpi, chartData, partialNotes };
}
