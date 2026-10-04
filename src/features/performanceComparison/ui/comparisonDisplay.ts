import type { TrendDirection, TrendStatus } from '../../../components/Common/TrendIndicator';
import { CLASSIFICATION_LABELS } from '../engine/descriptions';
import type { KpiComparisonResult, NeedsAttentionReason, SideKpiResult } from '../engine/types';

/**
 * Display mapping for engine results (spec §8, §12). These functions only choose how an
 * engine fact looks (badge text, icon, token); they never classify, compare, or decide
 * target status. Every fact comes from KpiComparisonResult.
 */

export interface ClassificationDisplay {
  /** Badge text, e.g. "Improved", "No Data". */
  label: string;
  /** insights* token for the badge; null for No Data (gray). */
  status: TrendStatus | null;
  /** TrendIndicator arrow; null when no arrow is shown (No Data, Informational). */
  direction: TrendDirection | null;
}

/**
 * Classification → badge. Improved/Declined arrows follow the delta's sign and take their
 * color from the engine's favorability (a decrease can be Improved for lower-is-favorable
 * KPIs). Comparable is flat and neutral; baseline-zero changes keep their arrow but stay neutral.
 */
export function getClassificationDisplay(result: KpiComparisonResult): ClassificationDisplay {
  const label = CLASSIFICATION_LABELS[result.classification];
  const deltaDirection: TrendDirection = (result.delta ?? 0) > 0 ? 'up' : (result.delta ?? 0) < 0 ? 'down' : 'flat';

  switch (result.classification) {
    case 'NoData':
      return { label, status: null, direction: null };
    case 'Informational':
      return { label, status: 'neutral', direction: null };
    case 'Comparable':
      return { label, status: 'neutral', direction: 'flat' };
    case 'RelativeNotApplicable':
      return { label, status: 'neutral', direction: deltaDirection };
    default:
      return { label, status: result.favorability ?? 'neutral', direction: deltaDirection };
  }
}

export type TargetStatusTone = 'met' | 'notMet' | 'none';

export interface TargetStatusDisplay {
  text: string;
  tone: TargetStatusTone;
}

/** One side's target status as shown in the table. Informational KPIs never get Met/Not Met (spec §3). */
export function getTargetStatusDisplay(side: SideKpiResult, isInformational: boolean): TargetStatusDisplay {
  if (isInformational) return { text: 'Not evaluated', tone: 'none' };
  switch (side.targetStatus) {
    case 'Met':
      return { text: 'Met', tone: 'met' };
    case 'NotMet':
      return { text: 'Not Met', tone: 'notMet' };
    default:
      // No Data is never a missed target, and a missing benchmark is never a missed target (spec §1).
      return { text: side.hasData ? 'No target' : 'No Data', tone: 'none' };
  }
}

export const NEEDS_ATTENTION_REASON_LABELS: Record<NeedsAttentionReason, string> = {
  Declined: 'Declined',
  BelowTarget: 'Below Target',
};

interface SideNameSource {
  label: string;
  siteLabel: string;
  timeframeLabel: string;
}

/**
 * Compact side names (spec §8), used wherever a side is named in compact form (e.g. Target
 * Status). Each side is named by the part of its generated label that differs:
 * only the timeframes differ → timeframe ("Today"); only the sites differ → site
 * ("Lincoln Elementary"); both differ, or the labels are identical → the full labels.
 */
export function getSideShortNames(left: SideNameSource, right: SideNameSource): [string, string] {
  const timeframesDiffer = left.timeframeLabel !== right.timeframeLabel;
  const sitesDiffer = left.siteLabel !== right.siteLabel;
  if (timeframesDiffer && !sitesDiffer) return [left.timeframeLabel, right.timeframeLabel];
  if (sitesDiffer && !timeframesDiffer) return [left.siteLabel, right.siteLabel];
  return [left.label, right.label];
}
