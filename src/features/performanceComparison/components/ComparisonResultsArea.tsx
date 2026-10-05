import React from 'react';
import { GitCompareArrows, Loader2, X } from 'lucide-react';
import { CollapsiblePanel } from '../../../components/Common/CollapsiblePanel';
import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { ComparisonView } from '../hooks/useComparison';
import { useComparisonTrend } from '../hooks/useComparisonTrend';
import { useSideShortNames } from '../hooks/useSideShortNames';
import { TREND_UNAVAILABLE_MESSAGE } from '../trend/trendRules';
import { TREND_INTERVAL_LABELS } from '../trend/trendView';
import { useComparisonStore } from '../store/useComparisonStore';
import { KpiTableExportControls, TrendExportControls } from './ComparisonExportControls';
import { ComparisonFilters } from './ComparisonFilters';
import { ComparisonKpiTable } from './ComparisonKpiTable';
import { ComparisonSummary } from './ComparisonSummary';
import { ComparisonTrendChart } from './ComparisonTrendChart';
import { InfoTip } from './InfoTip';
import { TrendIntervalSelector } from './TrendIntervalSelector';

/** NXT-77202 §6 empty state copy. */
export const COMPARISON_EMPTY_STATE_TEXT = 'Select sites and a timeframe for both sides to compare.';

/** NXT-77202 §6 materiality note, shown from the info icon next to the KPI Comparison title. */
export const MATERIALITY_NOTE =
  'Percentage-based KPIs are classified as Improved or Declined when they change by at least 0.5 percentage points. ' +
  'Dollar, count, and MPLH KPIs use a 2% relative-change threshold. Inventory KPIs are informational and are not classified.';

/** NXT-77211 §7 trend empty state copy. */
const TREND_EMPTY_STATE_TEXT = 'Select a KPI from the KPI Comparison table to view its trend.';

/** NXT-77213 §10: trend exports are disabled until a KPI is focused and its trend is available. */
const TREND_EXPORT_NO_KPI_REASON = 'Select a KPI in the KPI Comparison table to copy or download its trend';
const TREND_EXPORT_UNAVAILABLE_REASON = 'The trend is unavailable for the current comparison';

const TrendMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">{children}</div>
);

interface ComparisonResultsAreaProps {
  comparison: ComparisonView;
  onFocusKpi: (kpi: ComparisonKpiKey | null) => void;
  /** View Sites in the KPI table: opens the Site Drivers drawer for that KPI. */
  onViewSites: (kpi: ComparisonKpiKey) => void;
}

/**
 * Comparison Summary → KPI Comparison → Performance Trend (spec §6 layout order). Shows one
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

  const focusedName = focusedKpi ? getKpiDefinition(focusedKpi).name : null;
  const trendExportDisabledReason = !focusedKpi
    ? TREND_EXPORT_NO_KPI_REASON
    : !trend.interval || !trend.chartData || trend.chartData.rows.length === 0
      ? TREND_EXPORT_UNAVAILABLE_REASON
      : null;

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
              {focusedName && (
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
              )}
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
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Performance Trend"
          isExpanded={expandedSections.trend}
          onToggle={() => toggleSection('trend')}
          actions={
            <>
              <TrendIntervalSelector options={trend.intervalOptions} value={trend.interval} onChange={setTrendInterval} />
              <TrendExportControls disabledReason={trendExportDisabledReason} />
            </>
          }
        >
          {!focusedKpi ? (
            // spec §7: never auto-select a KPI.
            <TrendMessage>{TREND_EMPTY_STATE_TEXT}</TrendMessage>
          ) : !trend.interval || !trend.chartData ? (
            <TrendMessage>{TREND_UNAVAILABLE_MESSAGE}</TrendMessage>
          ) : trend.chartData.rows.length === 0 ? (
            // Every interval was dropped because neither side has data in it (spec §7).
            <TrendMessage>{`Neither timeframe has data for ${focusedName}.`}</TrendMessage>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-900">
                {focusedName} <span className="font-normal text-gray-500">by {TREND_INTERVAL_LABELS[trend.interval].toLowerCase()}</span>
              </p>
              <ComparisonTrendChart
                kpi={focusedKpi}
                data={trend.chartData}
                leftLabel={results.leftLabel}
                rightLabel={results.rightLabel}
                showTargets={getKpiDefinition(focusedKpi).kind === 'directional'}
              />
              {/* spec §7 partial periods: only buckets that have occurred are drawn */}
              {/* At most one note per side, in left → right order; keyed by position since two labels can match. */}
              {trend.partialNotes.map((note, index) => (
                <p key={index} className="text-xs italic text-gray-500">
                  {note}
                </p>
              ))}
            </div>
          )}
        </CollapsiblePanel>
      </div>
    </div>
  );
};
