import React, { useId } from 'react';
import { AlertTriangle, CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { NO_DATA_TEXT } from '../../../utils/kpiFormatters';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { KpiComparisonResult, NeedsAttentionReason, SideKpiResult } from '../engine/types';
import { getTargetStatusDisplay, NEEDS_ATTENTION_REASON_LABELS, TargetStatusTone } from '../ui/comparisonDisplay';
import { ClassificationBadge } from './ClassificationBadge';

const TH = 'px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-bottom';

const STATUS_ICON: Record<TargetStatusTone, React.ReactNode> = {
  met: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-insightsFavorable" />,
  notMet: <XCircle className="w-3.5 h-3.5 shrink-0 text-insightsUnfavorable" />,
  none: <MinusCircle className="w-3.5 h-3.5 shrink-0 text-gray-300" />,
};

/** One side's actual and target. Text comes from the engine result (spec §5.2 *Formatted fields). */
const SideValueCell: React.FC<{ side: SideKpiResult; isInformational: boolean }> = ({ side, isInformational }) => {
  const targetLabel = isInformational ? 'Context' : 'Target';
  return (
    <td className="px-3 py-3 align-top whitespace-nowrap">
      <div className={`text-sm ${side.hasData ? 'font-semibold text-gray-900' : 'italic text-gray-400'}`}>
        {side.hasData ? side.actualFormatted : NO_DATA_TEXT}
      </div>
      <div className="text-xs text-gray-500">
        {side.target === null ? (isInformational ? 'No target' : 'Target —') : `${targetLabel} ${side.targetFormatted}`}
      </div>
    </td>
  );
};

const TargetStatusLine: React.FC<{ name: string; side: SideKpiResult; isInformational: boolean }> = ({ name, side, isInformational }) => {
  const { text, tone } = getTargetStatusDisplay(side, isInformational);
  return (
    <div className="flex items-start gap-1.5 text-xs leading-snug">
      <span className="mt-px">{STATUS_ICON[tone]}</span>
      {/* Status follows the side name inline and never splits ("Not Met" stays together). */}
      <span>
        <span className="text-gray-500">{name}:</span>{' '}
        <span className={`whitespace-nowrap ${tone === 'none' ? 'text-gray-500' : 'font-semibold text-gray-800'}`}>{text}</span>
      </span>
    </div>
  );
};

/**
 * Needs Attention marker (NXT-77217 §5.8): one small warning icon next to the KPI name. The
 * reasons ("Declined · Below Target") appear on hover or keyboard focus, and the marker has an
 * accessible name so it isn't icon-only for screen readers. The tooltip opens to the right, so
 * the table's scroll container never clips it.
 */
const NeedsAttentionMarker: React.FC<{ reasons: NeedsAttentionReason[] }> = ({ reasons }) => {
  const tooltipId = useId();
  const reasonText = reasons.map(r => NEEDS_ATTENTION_REASON_LABELS[r]).join(' · ');
  return (
    <span
      tabIndex={0}
      role="img"
      aria-label={`Needs attention: ${reasonText}`}
      aria-describedby={tooltipId}
      className="group relative inline-flex align-[-3px] rounded outline-none focus-visible:ring-2 focus-visible:ring-insightsUnfavorable"
    >
      <AlertTriangle className="w-4 h-4 text-insightsUnfavorable" aria-hidden="true" />
      <span
        id={tooltipId}
        role="tooltip"
        className="invisible group-hover:visible group-focus-visible:visible absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white shadow-lg"
      >
        Needs attention: {reasonText}
      </span>
    </span>
  );
};

interface ComparisonKpiTableProps {
  /** KPIs in scope, in spec §4 order. */
  results: KpiComparisonResult[];
  leftLabel: string;
  rightLabel: string;
  /** Short side names for Target Status (timeframe or site part of the label). */
  sideShortNames: [string, string];
  focusedKpi: ComparisonKpiKey | null;
  onFocusKpi: (kpi: ComparisonKpiKey | null) => void;
  needsAttentionOnly: boolean;
}

/**
 * KPI Comparison table (NXT-77210, spec §8), modeled on MPLHSchoolTable. One row per KPI in
 * scope; every value, status, classification, and description comes from the engine result.
 * Clicking a row focuses that KPI (clicking it again clears focus); focus never changes the filter.
 */
export const ComparisonKpiTable: React.FC<ComparisonKpiTableProps> = ({
  results,
  leftLabel,
  rightLabel,
  sideShortNames,
  focusedKpi,
  onFocusKpi,
  needsAttentionOnly,
}) => {
  const toggleFocus = (kpi: ComparisonKpiKey) => onFocusKpi(focusedKpi === kpi ? null : kpi);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Tables scroll horizontally inside their own container (spec §12). */}
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={`${TH} w-48`}>KPI</th>
              <th className={`${TH} min-w-[170px]`}>
                <span className="block normal-case tracking-normal text-sm font-semibold text-gray-800">{leftLabel}</span>
                Actual · Target
              </th>
              <th className={`${TH} min-w-[170px]`}>
                <span className="block normal-case tracking-normal text-sm font-semibold text-gray-800">{rightLabel}</span>
                Actual · Target
              </th>
              <th className={TH}>Change</th>
              <th className={`${TH} min-w-[180px]`}>Target Status</th>
              <th className={`${TH} w-[30%]`}>Performance</th>
              <th className={TH}>Site Drivers</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  {needsAttentionOnly
                    ? 'No KPIs in the current filters need attention.'
                    : 'No KPIs selected. Choose KPIs in Filters to compare them.'}
                </td>
              </tr>
            ) : (
              results.map(result => {
                const definition = getKpiDefinition(result.kpi);
                const isInformational = result.kind === 'informational';
                const isFocused = focusedKpi === result.kpi;
                return (
                  <tr
                    key={result.kpi}
                    tabIndex={0}
                    aria-current={isFocused ? 'true' : undefined}
                    title={isFocused ? 'Click to clear focus' : 'Click to focus this KPI'}
                    onClick={() => toggleFocus(result.kpi)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFocus(result.kpi);
                      }
                    }}
                    className={`cursor-pointer transition-colors outline-none focus-visible:bg-indigo-50/60 ${
                      isFocused ? 'bg-indigo-50 shadow-[inset_4px_0_0_0_#6366f1]' : 'hover:bg-blue-50/50'
                    }`}
                  >
                    <td className="px-3 py-3 align-top">
                      {/* Marker flows inline after the name, so it stays next to the last word when the name wraps. */}
                      <div className={`text-sm font-medium ${isFocused ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {definition.name}
                        {result.needsAttention && (
                          <>
                            {' '}
                            <NeedsAttentionMarker reasons={result.needsAttentionReasons} />
                          </>
                        )}
                      </div>
                    </td>
                    <SideValueCell side={result.left} isInformational={isInformational} />
                    <SideValueCell side={result.right} isInformational={isInformational} />
                    <td className="px-3 py-3 align-top whitespace-nowrap text-sm text-gray-800">{result.deltaFormatted ?? '—'}</td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <TargetStatusLine name={sideShortNames[0]} side={result.left} isInformational={isInformational} />
                        <TargetStatusLine name={sideShortNames[1]} side={result.right} isInformational={isInformational} />
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <ClassificationBadge result={result} />
                      {/* The badge carries the classification, so the description drops its "<Classification> — " prefix. */}
                      <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{result.descriptionBody}</p>
                    </td>
                    {/* Site Drivers summary arrives with NXT-77212 (Phase 7). */}
                    <td className="px-3 py-3 align-top text-sm text-gray-300" title="Site Drivers coming soon">
                      —
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
