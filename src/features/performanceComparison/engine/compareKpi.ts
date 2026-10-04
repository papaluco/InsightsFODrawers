import { getKpiDefinition, KpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import {
  formatInventoryDiscrepancy,
  formatKpiDelta,
  formatKpiValue,
  formatRelativeDelta,
  NO_DATA_TEXT,
  roundToDisplayPrecision,
} from '../../../utils/kpiFormatters';
import { buildDescription, buildPartialNote, isPartialNoteMaterial } from './descriptions';
import { roundForComparison } from './rounding';
import {
  Classification,
  Favorability,
  KpiComparisonInput,
  KpiComparisonResult,
  Materiality,
  NeedsAttentionReason,
  SideKpiInput,
  SideKpiResult,
  TargetStatus,
  TargetTransition,
} from './types';

/**
 * KPI comparison rules engine (NXT-77217, spec §5).
 *
 * Pure TypeScript: no React, no mock data. This is the single source of comparison
 * facts — classification, deltas, target status, transitions, Needs Attention, and
 * descriptions. Every surface (Summary, KPI table, Site Drivers, trend context,
 * exports, Schoolie) consumes these results and never recalculates them.
 */

/** Shown when a side has no target. */
export const NO_TARGET_TEXT = '—';

// ─── Target status (spec §5.6) ───────────────────────────────────────────────

/**
 * One side's target status. Directional KPIs with a configured target only:
 * - no target, or no data on that side → NotAvailable (a missing benchmark is never a missed target)
 * - higher is favorable → Met when actual ≥ target; lower is favorable → Met when actual ≤ target
 * - both values are compared at display precision, so the status always agrees with what users
 *   see (59.97% displays as 60.0% and meets a 60% target)
 * Informational KPIs are always NotAvailable, even when a context benchmark is shown (spec §3).
 */
export function getTargetStatus(kpi: ComparisonKpiKey, actual: number | null, target: number | null): TargetStatus {
  const definition = getKpiDefinition(kpi);
  if (definition.targetPolicy !== 'configured' || actual === null || target === null) return 'NotAvailable';
  const a = roundToDisplayPrecision(kpi, actual);
  const t = roundToDisplayPrecision(kpi, target);
  const met = definition.favorableDirection === 'lower' ? a <= t : a >= t;
  return met ? 'Met' : 'NotMet';
}

/** Transition only when both sides are Met or NotMet (spec §5.6). */
export function getTargetTransition(left: TargetStatus, right: TargetStatus): TargetTransition | null {
  if (left === 'NotAvailable' || right === 'NotAvailable') return null;
  return `${left}To${right}` as TargetTransition;
}

// ─── Side results ────────────────────────────────────────────────────────────

/** Inventory Value never has a target; anything passed in is ignored (spec §3). */
function effectiveTarget(definition: KpiDefinition, target: number | null): number | null {
  return definition.targetPolicy === 'none' ? null : target;
}

function formatSideActual(kpi: ComparisonKpiKey, side: SideKpiInput): string {
  if (kpi === 'Physical Inventory Discrepancy') return formatInventoryDiscrepancy(side.actual, side.secondaryActual ?? null);
  return formatKpiValue(kpi, side.actual, NO_DATA_TEXT);
}

function buildSideResult(kpi: ComparisonKpiKey, definition: KpiDefinition, side: SideKpiInput): SideKpiResult {
  const target = effectiveTarget(definition, side.target);
  return {
    actual: side.actual,
    target,
    actualFormatted: formatSideActual(kpi, side),
    targetFormatted: formatKpiValue(kpi, target, NO_TARGET_TEXT),
    hasData: side.actual !== null,
    targetStatus: getTargetStatus(kpi, side.actual, target),
  };
}

// ─── Change, materiality, classification (spec §5.3–5.5, §5.7) ──────────────

interface ChangeEvaluation {
  delta: number | null;
  relativeChange: number | null;
  materiality: Materiality | null;
  classification: Classification;
}

function evaluateChange(definition: KpiDefinition, left: number | null, right: number | null): ChangeEvaluation {
  // §5.7: neither side, or only one side, has data → No Data; no delta, materiality, or transition.
  if (left === null || right === null) {
    return { delta: null, relativeChange: null, materiality: null, classification: 'NoData' };
  }

  // §5.3: change is always right − left.
  const delta = right - left;

  // §5.4: informational KPIs have no materiality and are never classified.
  if (definition.kind === 'informational') {
    return { delta, relativeChange: null, materiality: 'NotApplicable', classification: 'Informational' };
  }

  const { method, threshold } = definition.materiality;
  let isMaterial: boolean;
  let relativeChange: number | null = null;

  if (method === 'percentagePoints') {
    // Raw pt difference, never relative % (§5.4).
    isMaterial = Math.abs(roundForComparison(delta)) >= (threshold ?? 0);
  } else {
    if (left === 0) {
      // §5.4 baseline zero: 0 → non-zero has no relative change (never ∞); 0 → 0 is Comparable.
      if (right !== 0) {
        return { delta, relativeChange: null, materiality: 'NotApplicable', classification: 'RelativeNotApplicable' };
      }
      return { delta: 0, relativeChange: null, materiality: 'NotMaterial', classification: 'Comparable' };
    }
    relativeChange = delta / left;
    isMaterial = Math.abs(roundForComparison(relativeChange)) >= (threshold ?? 0);
  }

  if (!isMaterial) return { delta, relativeChange, materiality: 'NotMaterial', classification: 'Comparable' };

  // §5.5: direction decides favorability; the sign alone never does.
  const increased = delta > 0;
  const improved = definition.favorableDirection === 'higher' ? increased : !increased;
  return { delta, relativeChange, materiality: 'Material', classification: improved ? 'Improved' : 'Declined' };
}

const FAVORABILITY: Record<Classification, Favorability | null> = {
  Improved: 'favorable',
  Declined: 'unfavorable',
  Comparable: 'neutral',
  // Not judged either way; shown with neutral styling.
  RelativeNotApplicable: 'neutral',
  Informational: 'neutral',
  NoData: null,
};

function formatDelta(kpi: ComparisonKpiKey, change: ChangeEvaluation): string | null {
  if (change.delta === null) return null;
  if (change.relativeChange !== null) return formatRelativeDelta(kpi, change.relativeChange, change.delta);
  return formatKpiDelta(kpi, change.delta);
}

// ─── Needs Attention (spec §5.8) ─────────────────────────────────────────────

/**
 * Directional KPIs only: Declined, and/or the right side is Not Met.
 * - Right Not Met with left No Data → BelowTarget.
 * - Only left has data → never (right status is NotAvailable, classification NoData).
 * - Right target missing → only via Declined.
 * - RelativeNotApplicable → still via right-side BelowTarget.
 */
function getNeedsAttentionReasons(
  definition: KpiDefinition,
  classification: Classification,
  rightStatus: TargetStatus,
): NeedsAttentionReason[] {
  if (definition.kind !== 'directional') return [];
  const reasons: NeedsAttentionReason[] = [];
  if (classification === 'Declined') reasons.push('Declined');
  if (rightStatus === 'NotMet') reasons.push('BelowTarget');
  return reasons;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Compares one KPI across the two sides (spec §5). Used for the overall comparison
 * and, with each site's own actuals and targets, for Site Drivers.
 */
export function compareKpi(input: KpiComparisonInput): KpiComparisonResult {
  const { kpi } = input;
  const definition = getKpiDefinition(kpi);

  const left = buildSideResult(kpi, definition, input.left);
  const right = buildSideResult(kpi, definition, input.right);
  const change = evaluateChange(definition, left.actual, right.actual);
  const targetTransition =
    change.classification === 'NoData' ? null : getTargetTransition(left.targetStatus, right.targetStatus);
  const needsAttentionReasons = getNeedsAttentionReasons(definition, change.classification, right.targetStatus);

  // §5.9: the partial note is appended only when material (sum KPI + period-length notice).
  const partialNote =
    change.classification !== 'NoData' && isPartialNoteMaterial(definition, input.left, input.right)
      ? buildPartialNote(input.left, input.right)
      : null;
  const description = buildDescription({
    definition,
    input,
    left,
    right,
    delta: change.delta,
    relativeChange: change.relativeChange,
    classification: change.classification,
    targetTransition,
    partialNote,
  });

  return {
    kpi,
    kind: definition.kind,
    left,
    right,
    delta: change.delta,
    relativeChange: change.relativeChange,
    deltaFormatted: formatDelta(kpi, change),
    materiality: change.materiality,
    classification: change.classification,
    favorability: FAVORABILITY[change.classification],
    targetTransition,
    needsAttention: needsAttentionReasons.length > 0,
    needsAttentionReasons,
    description,
    partialNote,
  };
}

/** The same comparison with the sides exchanged (spec §5.3 Swap). */
export function swapComparisonInput(input: KpiComparisonInput): KpiComparisonInput {
  return { kpi: input.kpi, left: input.right, right: input.left };
}
