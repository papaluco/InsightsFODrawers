import { useEffect, useMemo } from 'react';
import { getPeriodLengthNotice } from '../../../utils/timeframes';
import { ComparisonResults } from '../selectors/selectComparison';
import { isSideComplete, useComparisonStore } from '../store/useComparisonStore';
import { useComparisonResults } from './useComparisonResults';
import { SideDatasetState, useSideDataset } from './useSideDataset';

export interface ComparisonView {
  left: SideDatasetState;
  right: SideDatasetState;
  /** Both sides have a site scope and a timeframe (spec §6 empty state until then). */
  bothSidesSet: boolean;
  /** Either side is fetching. Results, if any, are from the previous selection until this clears. */
  isLoading: boolean;
  /** Engine results for the current sides and filters; null until both sides are set and loaded. */
  results: ComparisonResults | null;
  /** Informational period-length notice (spec §6), or null when it doesn't apply. */
  periodLengthNotice: string | null;
}

/**
 * The comparison for the current store state: both side datasets, the engine results,
 * and the period-length notice. Call it once (in the overlay) and pass the result down,
 * so every section renders the same engine results (spec §1, §6).
 */
export function useComparison(): ComparisonView {
  const leftDefinition = useComparisonStore(s => s.left);
  const rightDefinition = useComparisonStore(s => s.right);
  const kpiFilter = useComparisonStore(s => s.kpiFilter);
  const needsAttentionOnly = useComparisonStore(s => s.needsAttentionOnly);
  const focusedKpi = useComparisonStore(s => s.focusedKpi);
  const setFocusedKpi = useComparisonStore(s => s.setFocusedKpi);

  const left = useSideDataset(leftDefinition);
  const right = useSideDataset(rightDefinition);
  const bothSidesSet = isSideComplete(leftDefinition) && isSideComplete(rightDefinition);
  const isLoading = left.isLoading || right.isLoading;

  // Nothing is calculated until both sides are set (spec §3).
  const leftDataset = bothSidesSet ? left.dataset : null;
  const rightDataset = bothSidesSet ? right.dataset : null;
  const results = useComparisonResults(leftDataset, rightDataset, kpiFilter, needsAttentionOnly);

  const periodLengthNotice = useMemo(
    () => (leftDataset && rightDataset ? getPeriodLengthNotice(leftDataset.timeframe, rightDataset.timeframe) : null),
    [leftDataset, rightDataset],
  );

  // NXT-77202 §6 Focused KPI: if a filter change (e.g. Needs Attention) removes the focused KPI
  // from scope, clear the focus. The KPI filter case is handled in the store.
  useEffect(() => {
    if (!focusedKpi || !results || isLoading) return;
    if (!results.results.some(r => r.kpi === focusedKpi)) setFocusedKpi(null);
  }, [focusedKpi, results, isLoading, setFocusedKpi]);

  return { left, right, bothSidesSet, isLoading, results, periodLengthNotice };
}
