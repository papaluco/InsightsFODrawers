import React from 'react';
import { Target } from 'lucide-react';
import TrendIndicator, { type TrendDirection, type TrendStatus } from '../../../components/Common/TrendIndicator';
import type { ComparisonSummary as ComparisonSummaryFacts, SideTargetAttainment } from '../selectors/selectComparison';
import { InfoTip } from './InfoTip';

/** What the counts cover, shown from the info icon on the Target Attainment heading. */
export const SUMMARY_COUNTS_NOTE = 'Counts cover directional KPIs in the current filters. Inventory KPIs are informational and are not counted.';

const COUNT_TONE: Record<TrendStatus, string> = {
  favorable: 'text-insightsFavorable',
  unfavorable: 'text-insightsUnfavorable',
  neutral: 'text-insightsNeutral',
};

interface CountPartProps {
  label: string;
  count: number;
  direction: TrendDirection;
  status: TrendStatus;
}

/** "6 ↗ Improved": count, icon, and label in the classification's color, so color is never alone (spec §12). */
const CountPart: React.FC<CountPartProps> = ({ label, count, direction, status }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap font-semibold ${COUNT_TONE[status]}`}>
    {count}
    <TrendIndicator direction={direction} status={status} size="small" />
    {label}
  </span>
);

const AttainmentRow: React.FC<{ attainment: SideTargetAttainment }> = ({ attainment }) => (
  <li className="text-sm">
    <span className="font-semibold text-gray-900">{attainment.label}</span> <span className="text-gray-400">—</span>{' '}
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
 * Comparison Summary (NXT-77208, spec §8): one sentence with the Improved / Comparable / Declined
 * counts among directional KPIs in scope, No Data shown separately, and target attainment per side
 * by generated label. All numbers come from the engine summary; no charts, scores, or winners.
 */
export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ summary, kpisInScope }) => {
  if (kpisInScope === 0) {
    return <p className="text-sm text-gray-500">No KPIs match the current filters.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
        <Target className="w-3.5 h-3.5" />
        Target Attainment
        <InfoTip text={SUMMARY_COUNTS_NOTE} label="What the counts cover" />
      </h4>

      <p className="text-sm text-gray-700">
        <CountPart label="Improved" count={summary.improved} direction="up" status="favorable" />,{' '}
        <CountPart label="Comparable" count={summary.comparable} direction="flat" status="neutral" />,{' '}
        <CountPart label="Declined" count={summary.declined} direction="down" status="unfavorable" />.
        {summary.noData > 0 && <span className="text-gray-500"> {summary.noData} with no data.</span>}
        {/* NXT-77217 §5.4 baseline zero: not Improved/Comparable/Declined */}
        {summary.relativeNotApplicable > 0 && (
          <span className="text-gray-500"> {summary.relativeNotApplicable} with a zero starting value (no relative change).</span>
        )}
      </p>

      <ul className="flex flex-col gap-1.5">
        <AttainmentRow attainment={summary.left} />
        <AttainmentRow attainment={summary.right} />
      </ul>
    </div>
  );
};
