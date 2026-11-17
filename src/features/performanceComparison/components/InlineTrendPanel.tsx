import React from 'react';
import { X } from 'lucide-react';
import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { ComparisonTrendView } from '../hooks/useComparisonTrend';
import type { TrendInterval } from '../trend/trendRules';
import { TREND_UNAVAILABLE_MESSAGE } from '../trend/trendRules';
import { TREND_INTERVAL_LABELS } from '../trend/trendView';
import { TrendExportControls } from './ComparisonExportControls';
import { ComparisonTrendChart } from './ComparisonTrendChart';
import { TrendIntervalSelector } from './TrendIntervalSelector';

/** NXT-77213 §10: trend exports are disabled while the trend is unavailable. */
const TREND_EXPORT_UNAVAILABLE_REASON = 'The trend is unavailable for the current comparison';

const TrendMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">{children}</div>
);

interface InlineTrendPanelProps {
  kpi: ComparisonKpiKey;
  trend: ComparisonTrendView;
  leftLabel: string;
  rightLabel: string;
  onIntervalChange: (interval: TrendInterval) => void;
  onClose: () => void;
}

/**
 * Performance Trend for the expanded KPI row (NXT-77211 §7), shown inline under that row of the
 * KPI Comparison table. Holds the trend's own controls (interval, copy/download, close), so the
 * page no longer has a separate Performance Trend panel.
 */
export const InlineTrendPanel: React.FC<InlineTrendPanelProps> = ({ kpi, trend, leftLabel, rightLabel, onIntervalChange, onClose }) => {
  const name = getKpiDefinition(kpi).name;
  const hasChart = trend.interval !== null && trend.chartData !== null && trend.chartData.rows.length > 0;

  return (
    <div className="rounded-lg border border-indigo-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">
          {name} trend
          {trend.interval && <span className="font-normal text-gray-500"> by {TREND_INTERVAL_LABELS[trend.interval].toLowerCase()}</span>}
        </p>
        <div className="flex items-center gap-2">
          <TrendIntervalSelector options={trend.intervalOptions} value={trend.interval} onChange={onIntervalChange} />
          <TrendExportControls disabledReason={hasChart ? null : TREND_EXPORT_UNAVAILABLE_REASON} />
          <button
            type="button"
            onClick={onClose}
            aria-label={`Hide ${name} trend`}
            title="Hide trend (Esc)"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!trend.interval || !trend.chartData ? (
        <TrendMessage>{TREND_UNAVAILABLE_MESSAGE}</TrendMessage>
      ) : trend.chartData.rows.length === 0 ? (
        // Every interval was dropped because neither side has data in it (spec §7).
        <TrendMessage>{`Neither timeframe has data for ${name}.`}</TrendMessage>
      ) : (
        <div className="flex flex-col gap-3">
          <ComparisonTrendChart
            kpi={kpi}
            data={trend.chartData}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            showTargets={getKpiDefinition(kpi).kind === 'directional'}
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
    </div>
  );
};
