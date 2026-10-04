import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { getSideSelectionKey } from '../hooks/useSideDataset';
import type { ComparisonSideDefinition } from '../store/useComparisonStore';

/**
 * Identity of the comparison context Schoolie analyzes (NXT-77214 §11 stale state).
 *
 * Covers exactly what changes the facts payload: both side definitions in orientation order
 * (sites plus timeframe option, including custom-range dates), the KPI filter, and Needs
 * Attention. The focused KPI and the trend interval are deliberately not inputs, so changing
 * them never marks an analysis out of date.
 */
export interface ComparisonContextState {
  left: ComparisonSideDefinition;
  right: ComparisonSideDefinition;
  kpiFilter: readonly ComparisonKpiKey[];
  needsAttentionOnly: boolean;
}

/** 32-bit FNV-1a, hex. Enough to tell contexts apart; not a security hash. */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function getComparisonContextKey(state: ComparisonContextState): string {
  return fnv1a(
    JSON.stringify({
      // getSideSelectionKey sorts sites and includes custom-range start/end.
      left: getSideSelectionKey(state.left),
      right: getSideSelectionKey(state.right),
      kpiFilter: [...state.kpiFilter].sort(),
      needsAttentionOnly: state.needsAttentionOnly,
    }),
  );
}
