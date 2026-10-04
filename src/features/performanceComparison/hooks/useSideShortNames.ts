import { useMemo } from 'react';
import { getSideShortNames } from '../ui/comparisonDisplay';
import type { ComparisonView } from './useComparison';

/**
 * Compact side names for the current comparison (spec §8): the differing part of each generated
 * label. Falls back to the full labels while a side's dataset isn't loaded.
 */
export function useSideShortNames(comparison: ComparisonView): [string, string] {
  const { left, right, results } = comparison;
  return useMemo<[string, string]>(
    () =>
      left.dataset && right.dataset
        ? getSideShortNames(left.dataset, right.dataset)
        : [results?.leftLabel ?? '', results?.rightLabel ?? ''],
    [left.dataset, right.dataset, results],
  );
}
