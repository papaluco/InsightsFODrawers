import React from 'react';
import { GitCompareArrows, Loader2 } from 'lucide-react';
import { CollapsiblePanel } from '../../../components/Common/CollapsiblePanel';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { ComparisonView } from '../hooks/useComparison';
import { useComparisonTrend } from '../hooks/useComparisonTrend';
import { useSideShortNames } from '../hooks/useSideShortNames';
import { useComparisonStore } from '../store/useComparisonStore';
import { KpiTableExportControls } from './ComparisonExportControls';
import { ComparisonFilters } from './ComparisonFilters';
import { ComparisonKpiTable } from './ComparisonKpiTable';
import { ComparisonSummary } from './ComparisonSummary';
import { InfoTip } from './InfoTip';
import { InlineTrendPanel } from './InlineTrendPanel';

/** NXT-77202 §6 empty state copy. */
export const COMPARISON_EMPTY_STATE_TEXT = 'Select sites and a timeframe for both sides to compare.';

/** NXT-77202 §6 materiality note, shown from the info icon next to the KPI Comparison title. */
export const MATERIALITY_NOTE =
  'Percentage-based KPIs are classified as Improved or Declined when they change by at least 0.5 percentage points. ' +
  'Dollar, count, and MPLH KPIs use a 2% relative-change threshold. Inventory KPIs are informational and are not classified.';

interface ComparisonResultsAreaProps {
  comparison: ComparisonView;
  onFocusKpi: (kpi: ComparisonKpiKey | null) => void;
  /** View Sites in the KPI table: opens the Site Drivers drawer for that KPI. */
  onViewSites: (kpi: ComparisonKpiKey) => void;
}

/**
 * Comparison Summary → KPI Comparison, with the Performance Trend opening inline under the
 * focused KPI's row (spec §6 layout order, §7). Shows one
 * empty-state prompt until both sides are set, and a light loading state while either side is
 * fetching. Every section reads engine results only from `comparison.results`.
 */
export const ComparisonResultsArea: React.FC<ComparisonResultsAreaProps> = ({ comparison, onFocusKpi, onViewSites }) => {
  const { bothSidesSet, isLoading, results } = comparison;
  const expandedSections = useComparisonStore(s => s.expandedSections);
  const toggleSection = useComparisonStore(s => s.toggleSection);
  const focusedKpi = useComparisonStore(s => s.focusedKpi);
  const needsAttentionOnly = useComparisonStore(s => s.needsAttentionOnly);
  const setTrendInterval = useComparisonStore(s => s.setTrendInterval);
  const trend = useComparisonTrend(comparison);

  const sideShortNames = useSideShortNames(comparison);

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
          <ComparisonSummary summary={results.summary} kpisInScope={results.results.length} sideShortNames={sideShortNames} />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="KPI Comparison"
          titleAddon={<InfoTip text={MATERIALITY_NOTE} label="How changes are classified" />}
          isExpanded={expandedSections.kpiTable}
          onToggle={() => toggleSection('kpiTable')}
          actions={
            // Filters set the comparison scope: the table, Summary, Site Drivers, exports and Schoolie all follow them.
            <>
              <ComparisonFilters />
              <KpiTableExportControls results={results} sideShortNames={sideShortNames} />
            </>
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
            siteDrivers={results.siteDrivers}
            showSiteDrivers={results.siteDriversAvailable}
            onViewSites={onViewSites}
            renderExpanded={kpi => (
              <InlineTrendPanel
                kpi={kpi}
                trend={trend}
                leftLabel={results.leftLabel}
                rightLabel={results.rightLabel}
                onIntervalChange={setTrendInterval}
                onClose={() => onFocusKpi(null)}
              />
            )}
          />
        </CollapsiblePanel>

      </div>
    </div>
  );
};
