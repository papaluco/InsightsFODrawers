import React from 'react';
import { Target } from 'lucide-react';
import TrendIndicator, { type TrendDirection, type TrendStatus } from '../../../components/Common/TrendIndicator';
import type { ComparisonSummary as ComparisonSummaryFacts, SideTargetAttainment } from '../selectors/selectComparison';

interface CountTileProps {
  label: string;
  count: number;
  direction: TrendDirection;
  status: TrendStatus;
}

const COUNT_TONE: Record<TrendStatus, string> = {
  favorable: 'text-insightsFavorable',
  unfavorable: 'text-insightsUnfavorable',
  neutral: 'text-insightsNeutral',
};

const CountTile: React.FC<CountTileProps> = ({ label, count, direction, status }) => (
  <div className="w-44 rounded-lg border border-gray-200 px-4 py-3 text-center">
    <div className={`flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide ${COUNT_TONE[status]}`}>
      <TrendIndicator direction={direction} status={status} size="small" />
      {label}
    </div>
    <div className="mt-1 text-2xl font-bold text-gray-900">{count}</div>
  </div>
);

const AttainmentRow: React.FC<{ attainment: SideTargetAttainment }> = ({ attainment }) => (
  <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
    <span className="font-semibold text-gray-900">{attainment.label}</span>
    <span className="text-gray-400">—</span>
    <span className="text-gray-700">
      {attainment.kpisWithTarget === 0
        ? 'No KPIs in scope have data and a target'
        : `${attainment.meetingTarget} of ${attainment.kpisWithTarget} KPIs meeting target`}
    </span>
  </li>
);

interface ComparisonSummaryProps {
  summary: ComparisonSummaryFacts;
  /** KPIs in scope (KPI filter + Needs Attention). */
  kpisInScope: number;
}

/**
 * Comparison Summary (NXT-77208, spec §8): Improved / Comparable / Declined counts among
 * directional KPIs in scope, No Data shown separately, and target attainment per side by
 * generated label. All numbers come from the engine summary; no charts, scores, or winners.
 */
export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ summary, kpisInScope }) => {
  if (kpisInScope === 0) {
    return <p className="text-sm text-gray-500">No KPIs match the current filters.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Fixed-width cards, centered as a group; they wrap on narrow screens. */}
      <div className="flex flex-wrap justify-center gap-3">
        <CountTile label="Improved" count={summary.improved} direction="up" status="favorable" />
        <CountTile label="Comparable" count={summary.comparable} direction="flat" status="neutral" />
        <CountTile label="Declined" count={summary.declined} direction="down" status="unfavorable" />
      </div>

      {(summary.noData > 0 || summary.relativeNotApplicable > 0) && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {summary.noData > 0 && <li>{summary.noData} with no data</li>}
          {/* NXT-77217 §5.4 baseline zero: not Improved/Comparable/Declined */}
          {summary.relativeNotApplicable > 0 && (
            <li>{summary.relativeNotApplicable} with a zero starting value (no relative change)</li>
          )}
        </ul>
      )}

      <div className="border-t border-gray-100 pt-3">
        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
          <Target className="w-3.5 h-3.5" />
          Target attainment
        </h4>
        <ul className="mt-2 flex flex-col gap-1.5">
          <AttainmentRow attainment={summary.left} />
          <AttainmentRow attainment={summary.right} />
        </ul>
      </div>

      <p className="text-xs text-gray-500">
        Counts cover directional KPIs in the current filters. Inventory KPIs are informational and are not counted.
      </p>
    </div>
  );
};
