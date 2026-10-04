import { useMemo } from 'react';
import type { SideDataset } from '../../../services/comparisonDataService';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { ComparisonResults, selectComparison } from '../selectors/selectComparison';

/**
 * Memoized comparison results for the current sides and filters (spec §6).
 * Returns null until both sides are set — nothing is calculated before that (spec §3).
 * Every Performance Comparison component reads from this; none calls the engine directly.
 */
export function useComparisonResults(
  left: SideDataset | null,
  right: SideDataset | null,
  kpiFilter: readonly ComparisonKpiKey[],
  needsAttentionOnly: boolean,
): ComparisonResults | null {
  return useMemo(
    () => (left && right ? selectComparison(left, right, { kpiFilter, needsAttentionOnly }) : null),
    [left, right, kpiFilter, needsAttentionOnly],
  );
}
