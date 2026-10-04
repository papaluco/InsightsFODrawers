import React, { useMemo } from 'react';
import { GitCompareArrows, Loader2, X } from 'lucide-react';
import { CollapsiblePanel } from '../../../components/Common/CollapsiblePanel';
import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { ComparisonView } from '../hooks/useComparison';
import { useComparisonStore } from '../store/useComparisonStore';
import { getSideShortNames } from '../ui/comparisonDisplay';
import { ComparisonKpiTable } from './ComparisonKpiTable';
import { ComparisonSummary } from './ComparisonSummary';

/** NXT-77202 §6 empty state copy. */
export const COMPARISON_EMPTY_STATE_TEXT = 'Select sites and a timeframe for both sides to compare.';

/** NXT-77211 §7 trend empty state copy. */
const TREND_EMPTY_STATE_TEXT = 'Select a KPI from the KPI Comparison table to view its trend.';

interface ComparisonResultsAreaProps {
  comparison: ComparisonView;
  onFocusKpi: (kpi: ComparisonKpiKey | null) => void;
}

/**
 * Comparison Summary → KPI Comparison → Performance Trend (spec §6 layout order). Shows one
 * empty-state prompt until both sides are set, and a light loading state while either side is
 * fetching. Every section reads engine results only from `comparison.results`.
 */
export const ComparisonResultsArea: React.FC<ComparisonResultsAreaProps> = ({ comparison, onFocusKpi }) => {
  const { bothSidesSet, isLoading, results, left, right } = comparison;
  const expandedSections = useComparisonStore(s => s.expandedSections);
  const toggleSection = useComparisonStore(s => s.toggleSection);
  const focusedKpi = useComparisonStore(s => s.focusedKpi);
  const needsAttentionOnly = useComparisonStore(s => s.needsAttentionOnly);

  const sideShortNames = useMemo<[string, string]>(
    () =>
      left.dataset && right.dataset
        ? getSideShortNames(left.dataset, right.dataset)
        : [results?.leftLabel ?? '', results?.rightLabel ?? ''],
    [left.dataset, right.dataset, results],
  );

  if (!bothSidesSet) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
          <GitCompareArrows className="w-6 h-6 text-indigo-500" />
        </div>
        <p className="text-sm font-medium text-gray-600">{COMPARISON_EMPTY_STATE_TEXT}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div aria-busy={isLoading} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-16 text-sm text-gray-500">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            Loading comparison…
          </>
        ) : (
          'This comparison could not be loaded.'
        )}
      </div>
    );
  }

  const focusedName = focusedKpi ? getKpiDefinition(focusedKpi).name : null;

  return (
    <div aria-busy={isLoading} className="relative">
      {isLoading && (
        <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm border border-gray-200">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          Updating…
        </div>
      )}
      <div className={`flex flex-col gap-6 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <CollapsiblePanel
          title="Comparison Summary"
          isExpanded={expandedSections.summary}
          onToggle={() => toggleSection('summary')}
        >
          <ComparisonSummary summary={results.summary} kpisInScope={results.results.length} />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="KPI Comparison"
          isExpanded={expandedSections.kpiTable}
          onToggle={() => toggleSection('kpiTable')}
          actions={
            focusedName && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 pl-3 pr-1 py-0.5 text-xs font-semibold text-indigo-700">
                Focused: {focusedName}
                <button
                  type="button"
                  onClick={() => onFocusKpi(null)}
                  aria-label="Clear focused KPI"
                  title="Clear focus"
                  className="p-0.5 rounded-full hover:bg-indigo-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )
          }
        >
          <ComparisonKpiTable
            results={results.results}
            leftLabel={results.leftLabel}
            rightLabel={results.rightLabel}
            sideShortNames={sideShortNames}
            focusedKpi={focusedKpi}
            onFocusKpi={onFocusKpi}
            needsAttentionOnly={needsAttentionOnly}
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Performance Trend"
          isExpanded={expandedSections.trend}
          onToggle={() => toggleSection('trend')}
        >
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
            {focusedName ? `Performance Trend for ${focusedName} coming soon` : TREND_EMPTY_STATE_TEXT}
          </div>
        </CollapsiblePanel>
      </div>
    </div>
  );
};
