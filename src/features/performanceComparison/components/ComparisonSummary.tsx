import React from 'react';
import { Activity, Target } from 'lucide-react';
import TrendIndicator, { type TrendDirection, type TrendStatus } from '../../../components/Common/TrendIndicator';
import type { ComparisonSummary as ComparisonSummaryFacts, SideTargetAttainment } from '../selectors/selectComparison';
import { getAttainmentText, getKpisComparedText, NO_ATTAINMENT_TEXT } from '../ui/summaryDisplay';
import { InfoTip } from './InfoTip';

/** What the change counts cover, shown from the info icon on the Performance change heading. */
export const SUMMARY_COUNTS_NOTE = 'Counts cover directional KPIs in the current filters. Inventory KPIs are informational and are not counted.';

/** What target attainment counts, shown from the info icon on the Target attainment heading. */
export const ATTAINMENT_NOTE = "KPIs without a target or without data aren't counted.";

const COUNT_TONE: Record<TrendStatus, string> = {
  favorable: 'text-insightsFavorable',
  unfavorable: 'text-insightsUnfavorable',
  neutral: 'text-insightsNeutral',
};

const HEADING = 'flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500';

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

/** "This Month — 8 of 13 KPIs meeting target · 62%", or "No KPIs with data and a target". */
const AttainmentRow: React.FC<{ name: string; attainment: SideTargetAttainment }> = ({ name, attainment }) => {
  const text = getAttainmentText(attainment);
  return (
    <li className="text-sm text-gray-700">
      <span className="font-semibold text-gray-900">{name}</span> <span className="text-gray-400">—</span>{' '}
      {text ? (
        <>
          <span className="font-bold text-gray-900">{text.count}</span> {text.rest} <span className="text-gray-400">·</span>{' '}
          <span className="font-semibold text-gray-900">{text.percent}</span>
        </>
      ) : (
        <span className="text-gray-500">{NO_ATTAINMENT_TEXT}</span>
      )}
    </li>
  );
};

interface ComparisonSummaryProps {
  summary: ComparisonSummaryFacts;
  /** KPIs in scope (KPI filter + Needs Attention). */
  kpisInScope: number;
  /** Compact side names (spec §8): the part of each generated label that differs. */
  sideShortNames: [string, string];
}

/**
 * Comparison Summary (NXT-77208, spec §8), two columns from desktop width (one at tablet width):
 * - Performance change: directional KPIs compared, then one sentence with the Improved /
 *   Comparable / Declined counts (No Data shown separately).
 * - Target attainment: one row per side by compact side name, with count and share.
 * All numbers come from the engine summary; no cards, charts, gauges, scores, or winners.
 */
export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ summary, kpisInScope, sideShortNames }) => {
  if (kpisInScope === 0) {
    return <p className="text-sm text-gray-500">No KPIs match the current filters.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
      <div className="flex flex-col gap-2 min-w-0">
        <h4 className={HEADING}>
          <Activity className="w-3.5 h-3.5" />
          Performance change
          <InfoTip text={SUMMARY_COUNTS_NOTE} label="What the counts cover" />
        </h4>
        <p className="text-sm text-gray-500">{getKpisComparedText(summary.directional)}</p>
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
      </div>

      <div className="flex flex-col gap-2 min-w-0 border-t border-gray-100 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8">
        <h4 className={HEADING}>
          <Target className="w-3.5 h-3.5" />
          Target attainment
          <InfoTip text={ATTAINMENT_NOTE} label="What target attainment counts" />
        </h4>
        <ul className="flex flex-col gap-1.5">
          <AttainmentRow name={sideShortNames[0]} attainment={summary.left} />
          <AttainmentRow name={sideShortNames[1]} attainment={summary.right} />
        </ul>
      </div>
    </div>
  );
};
