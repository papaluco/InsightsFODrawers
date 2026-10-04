import { KpiKind } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { TimeframePeriod } from '../../../utils/timeframes';

/**
 * Rules engine input and output types (NXT-77217, spec §5.1 and §5.2).
 *
 * Internally the two sides are "left" (the reference the change is measured from)
 * and "right" (compared against it). These names never appear in user-facing text;
 * descriptions name a side only by its generated label.
 */

/**
 * One side's timeframe: partial-period info (spec §5.1) plus the period itself, so the
 * engine can tell when period lengths differ (spec §6 period-length notice).
 */
export type SideTimeframe = TimeframePeriod;

/** One side's values for one KPI (spec §5.1). */
export interface SideKpiInput {
  /** null = No Data (never 0). */
  actual: number | null;
  /** null = no benchmark configured (never a missed target). */
  target: number | null;
  /** Generated label, e.g. "High Schools · SY 2025–26". */
  label: string;
  timeframe?: SideTimeframe;
  /** Physical Inventory Discrepancy only: the $ amount shown alongside the %. */
  secondaryActual?: number | null;
}

export interface KpiComparisonInput {
  kpi: ComparisonKpiKey;
  /** Reference side: the change is measured from here. */
  left: SideKpiInput;
  /** Compared side: change = right − left. */
  right: SideKpiInput;
}

export type TargetStatus = 'Met' | 'NotMet' | 'NotAvailable';

export type Materiality = 'Material' | 'NotMaterial' | 'NotApplicable';

export type Classification =
  | 'Improved'
  | 'Comparable'
  | 'Declined'
  | 'NoData'
  | 'RelativeNotApplicable'
  | 'Informational';

export type Favorability = 'favorable' | 'unfavorable' | 'neutral';

export type TargetTransition = 'MetToMet' | 'NotMetToMet' | 'MetToNotMet' | 'NotMetToNotMet';

export type NeedsAttentionReason = 'Declined' | 'BelowTarget';

export interface SideKpiResult {
  actual: number | null;
  /** For informational KPIs this is a context benchmark only (no status). */
  target: number | null;
  /** "60.0%", "$9,500", or "No Data". */
  actualFormatted: string;
  /** "60.0%", or "—" when there is no target. */
  targetFormatted: string;
  hasData: boolean;
  targetStatus: TargetStatus;
}

/** The single, centralized comparison result for one KPI (spec §5.2). */
export interface KpiComparisonResult {
  kpi: ComparisonKpiKey;
  kind: KpiKind;
  left: SideKpiResult;
  right: SideKpiResult;
  /** right − left in KPI units (pts for % KPIs). null without data on both sides. */
  delta: number | null;
  /** (right − left) ÷ left as a fraction; relative-% KPIs only, null when left is 0. */
  relativeChange: number | null;
  /** "+4.3 pts", "+2.0% (+$2,000)", "+$5,000" (baseline zero). */
  deltaFormatted: string | null;
  /** null when there is no delta (No Data / one-sided). */
  materiality: Materiality | null;
  classification: Classification;
  /** null for No Data. */
  favorability: Favorability | null;
  /** Only when both sides are Met or NotMet. */
  targetTransition: TargetTransition | null;
  needsAttention: boolean;
  needsAttentionReasons: NeedsAttentionReason[];
  /** Deterministic, user-facing description (spec §5.9), including the partial note when it's material. */
  description: string;
  /**
   * The partial-period sentence on its own, e.g. "High Schools · SY 2025–26 includes data through April 16, 2026."
   * Only for sum KPIs when the period-length notice applies; otherwise null (spec §5.9).
   */
  partialNote: string | null;
}
