import { useMemo } from 'react';
import { COMPARISON_KPI_KEYS } from '../../../constants/kpiDefinitions';
import { buildComparisonFacts, ComparisonFactsPayload } from '../schoolie/comparisonFacts';
import { getComparisonContextKey } from '../schoolie/contextKey';
import { useComparisonStore } from '../store/useComparisonStore';
import type { ComparisonView } from './useComparison';

export interface SchoolieComparisonContext {
  /** Key of the current comparison context (sides in orientation order, KPI filter, Needs Attention). */
  contextKey: string;
  /** Facts for the current context; null while either side is loading or until both sides are set. */
  analysisContext: { key: string; facts: ComparisonFactsPayload } | null;
}

/**
 * The Schoolie facts payload for the current comparison (NXT-77214, spec §11), tagged with the
 * key of the context it was built from. Facts are only offered once the engine results match the
 * current selection (not while a side is loading), so the analyzed key always describes the facts
 * that were actually sent.
 */
export function useSchoolieComparisonContext(comparison: ComparisonView): SchoolieComparisonContext {
  const left = useComparisonStore(s => s.left);
  const right = useComparisonStore(s => s.right);
  const kpiFilter = useComparisonStore(s => s.kpiFilter);
  const needsAttentionOnly = useComparisonStore(s => s.needsAttentionOnly);

  const contextKey = useMemo(
    () => getComparisonContextKey({ left, right, kpiFilter, needsAttentionOnly }),
    [left, right, kpiFilter, needsAttentionOnly],
  );

  const { results, isLoading, periodLengthNotice } = comparison;
  const fromDataset = comparison.left.dataset;
  const toDataset = comparison.right.dataset;

  const analysisContext = useMemo(() => {
    if (isLoading || !results || !fromDataset || !toDataset) return null;
    return {
      key: contextKey,
      facts: buildComparisonFacts({
        from: fromDataset,
        to: toDataset,
        results,
        filters: { kpiFilter, needsAttentionOnly },
        periodLengthNotice,
        totalKpiCount: COMPARISON_KPI_KEYS.length,
      }),
    };
  }, [isLoading, results, fromDataset, toDataset, contextKey, kpiFilter, needsAttentionOnly, periodLengthNotice]);

  return { contextKey, analysisContext };
}
