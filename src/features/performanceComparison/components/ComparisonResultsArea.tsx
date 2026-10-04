import React from 'react';
import { GitCompareArrows, Loader2 } from 'lucide-react';
import { COMPARISON_KPI_KEYS } from '../../../constants/kpiDefinitions';
import type { ComparisonView } from '../hooks/useComparison';

/** NXT-77202 §6 empty state copy. */
export const COMPARISON_EMPTY_STATE_TEXT = 'Select sites and a timeframe for both sides to compare.';

interface PlaceholderSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Stand-in for a results section built in a later phase. */
const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({ title, children }) => (
  <section aria-label={title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
      {children}
    </div>
  </section>
);

interface ComparisonResultsAreaProps {
  comparison: ComparisonView;
}

/**
 * Summary → KPI Comparison → Performance Trend (spec §6 layout order). Shows the empty
 * state until both sides are set, and a light loading state while either side is fetching.
 * Sections read engine results only from `comparison.results`.
 */
export const ComparisonResultsArea: React.FC<ComparisonResultsAreaProps> = ({ comparison }) => {
  const { bothSidesSet, isLoading, results } = comparison;

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

  const inScope = results.results.length;

  return (
    <div aria-busy={isLoading} className="relative">
      {isLoading && (
        <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm border border-gray-200">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          Updating…
        </div>
      )}
      <div className={`flex flex-col gap-6 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <PlaceholderSection title="Comparison Summary">
          Summary coming soon · {inScope} of {COMPARISON_KPI_KEYS.length} KPIs in scope
        </PlaceholderSection>
        <PlaceholderSection title="KPI Comparison">
          {inScope === 0 ? 'No KPIs match the current filters.' : `KPI Comparison table coming soon · ${inScope} KPIs in scope`}
        </PlaceholderSection>
        <PlaceholderSection title="Performance Trend">Performance Trend coming soon</PlaceholderSection>
      </div>
    </div>
  );
};
