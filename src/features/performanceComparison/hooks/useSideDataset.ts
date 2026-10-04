import { useEffect, useState } from 'react';
import type { SiteSelection } from '../../../data/siteRegistry';
import { getSideDataset, SideDataset, TimeframeSelection } from '../../../services/comparisonDataService';
import { ComparisonSideDefinition, isSideComplete } from '../store/useComparisonStore';

/**
 * Loads one side's dataset from comparisonDataService (spec §9) whenever its definition changes.
 *
 * Responses for selections that are no longer current are ignored: each request is tied to the
 * selection key it was made for, and an effect cleanup cancels it as soon as the key changes, so
 * a slow older response can never overwrite a newer one.
 */

export interface SideDatasetState {
  /**
   * The dataset for the current selection. While a newer selection is loading this is the
   * previous dataset (shown dimmed by callers); null when the side isn't set.
   */
  dataset: SideDataset | null;
  /** True while the current selection's dataset is being fetched. */
  isLoading: boolean;
  error: string | null;
}

interface SideRequest {
  sites: SiteSelection;
  timeframe: TimeframeSelection;
}

/**
 * Stable identity of a side's selection; null until the side is set. Site order doesn't matter,
 * so re-applying the same sites in a different order doesn't refetch.
 */
export function getSideSelectionKey(side: ComparisonSideDefinition): string | null {
  if (!isSideComplete(side) || !side.sites || !side.timeframe) return null;
  const request: SideRequest = {
    sites: [...side.sites].sort((a, b) => a - b),
    timeframe: side.timeframe.customRange
      ? { optionId: side.timeframe.optionId, customRange: { start: side.timeframe.customRange.start, end: side.timeframe.customRange.end } }
      : { optionId: side.timeframe.optionId },
  };
  return JSON.stringify(request);
}

interface LoadedSide {
  key: string;
  dataset: SideDataset | null;
  error: string | null;
}

export function useSideDataset(side: ComparisonSideDefinition): SideDatasetState {
  const key = getSideSelectionKey(side);
  const [loaded, setLoaded] = useState<LoadedSide | null>(null);

  useEffect(() => {
    if (!key) {
      setLoaded(null);
      return;
    }
    let isCurrent = true;
    const { sites, timeframe } = JSON.parse(key) as SideRequest;
    getSideDataset(sites, timeframe).then(
      dataset => {
        if (isCurrent) setLoaded({ key, dataset, error: null });
      },
      (error: unknown) => {
        if (isCurrent) setLoaded({ key, dataset: null, error: error instanceof Error ? error.message : String(error) });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [key]);

  if (!key) return { dataset: null, isLoading: false, error: null };
  const isLoading = loaded?.key !== key;
  return {
    dataset: loaded?.dataset ?? null,
    isLoading,
    error: isLoading ? null : loaded?.error ?? null,
  };
}
