import { KpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { formatLongDate } from '../../../utils/dateOnly';
import {
  formatCount,
  formatCurrency,
  formatDays,
  formatKpiValue,
  formatMplh,
  formatPercent,
} from '../../../utils/kpiFormatters';
import {
  Classification,
  KpiComparisonInput,
  SideKpiInput,
  SideKpiResult,
  TargetTransition,
} from './types';
import { roundForComparison } from './rounding';

/**
 * Deterministic descriptions (NXT-77217 spec §5.9).
 *
 * Format: "<Classification> — <sentence>." plus an optional partial-period sentence.
 * Factual only: no causes, recommendations, "better/worse", temporal words
 * ("previous", "current", "now"), or side names other than generated labels.
 */

/** User-facing classification names (badge text and description prefix). */
export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  Improved: 'Improved',
  Comparable: 'Comparable',
  Declined: 'Declined',
  NoData: 'No Data',
  RelativeNotApplicable: 'Relative Change N/A',
  Informational: 'Informational',
};

const EM_DASH = '—';

export interface DescriptionContext {
  definition: KpiDefinition;
  input: KpiComparisonInput;
  left: SideKpiResult;
  right: SideKpiResult;
  delta: number | null;
  relativeChange: number | null;
  classification: Classification;
  targetTransition: TargetTransition | null;
  partialNote: string | null;
}

// ─── Partial-period note ─────────────────────────────────────────────────────

/**
 * "High Schools · SY 2025–26 includes data through April 16, 2026." for each partial side
 * that has data. Null when neither side is partial.
 */
export function buildPartialNote(left: SideKpiInput, right: SideKpiInput): string | null {
  const partialSides = [left, right].filter(s => s.partial?.isPartial && s.partial.throughDate);
  if (partialSides.length === 0) return null;

  const [first, second] = partialSides;
  const through = (side: SideKpiInput) => formatLongDate(side.partial?.throughDate ?? '');
  if (!second || second.label === first.label) return `${first.label} includes data through ${through(first)}.`;
  if (first.partial?.throughDate === second.partial?.throughDate) {
    return `${first.label} and ${second.label} include data through ${through(first)}.`;
  }
  return `${first.label} includes data through ${through(first)}; ${second.label} includes data through ${through(second)}.`;
}

// ─── Number phrasing ─────────────────────────────────────────────────────────

/** "2", "1.5", "0.4"; two decimals only when one would round a non-zero change to 0. */
function formatPoints(magnitude: number): string {
  const oneDecimal = formatCount(magnitude, { decimals: 1, trimZeros: true });
  return oneDecimal === '0' && magnitude > 0 ? formatCount(magnitude, { decimals: 2, trimZeros: true }) : oneDecimal;
}

/** A change amount in the KPI's units, unsigned: "$4,000", "250", "0.37". */
function formatAmount(kpi: ComparisonKpiKey, definition: KpiDefinition, magnitude: number): string {
  switch (definition.displayFormat) {
    case 'currency':
      return formatCurrency(magnitude);
    case 'count':
      return formatCount(magnitude);
    case 'mplh':
      return formatMplh(magnitude);
    case 'days':
      return formatDays(magnitude);
    default:
      return formatKpiValue(kpi, magnitude);
  }
}

/** Target as written in a sentence: "60%", "$9,000", "18.50". */
function formatTarget(kpi: ComparisonKpiKey, definition: KpiDefinition, target: number): string {
  return definition.displayFormat === 'percent' ? formatPercent(target, { trimZeros: true }) : formatKpiValue(kpi, target);
}

/**
 * The explicit change: "increased by 2 percentage points", "decreased by $500",
 * "increased by $4,000 (4.0%)". The relative % is included only when there is no
 * target clause, keeping sentences short (matches the spec §5.9 fixtures).
 */
function describeChange(ctx: DescriptionContext, includeRelativePercent: boolean): string {
  const { definition, input } = ctx;
  const delta = ctx.delta ?? 0;
  const magnitude = Math.abs(delta);

  if (definition.materiality.method === 'percentagePoints') {
    const points = formatPoints(magnitude);
    if (points === '0') return 'did not change';
    return `${delta > 0 ? 'increased' : 'decreased'} by ${points} percentage point${points === '1' ? '' : 's'}`;
  }

  const amount = formatAmount(input.kpi, definition, magnitude);
  if (amount === formatAmount(input.kpi, definition, 0)) return 'did not change';
  const percent =
    includeRelativePercent && ctx.relativeChange !== null
      ? ` (${formatPercent(Math.abs(ctx.relativeChange) * 100)})`
      : '';
  return `${delta > 0 ? 'increased' : 'decreased'} by ${amount}${percent}`;
}

// ─── Target commentary (spec §5.9 decision matrix) ───────────────────────────

/** How the right side stands against its target. */
type TargetOutcome = 'meets' | 'doesNotMeet' | 'remainsOutside';

interface MatrixRow {
  /** Opening phrase for Comparable rows; Improved/Declined state the change explicitly. */
  comparablePhrase?: string;
  connective: 'and' | 'but';
  outcome: TargetOutcome;
}

/**
 * Spec §5.9: all 12 classification × transition combinations.
 * "and" when the target outcome agrees with the change, "but" when it contrasts.
 */
const DECISION_MATRIX: Record<'Improved' | 'Declined' | 'Comparable', Record<TargetTransition, MatrixRow>> = {
  Improved: {
    NotMetToMet: { connective: 'and', outcome: 'meets' },
    NotMetToNotMet: { connective: 'but', outcome: 'remainsOutside' },
    MetToMet: { connective: 'and', outcome: 'meets' },
    MetToNotMet: { connective: 'but', outcome: 'doesNotMeet' },
  },
  Declined: {
    MetToNotMet: { connective: 'and', outcome: 'doesNotMeet' },
    MetToMet: { connective: 'but', outcome: 'meets' },
    NotMetToNotMet: { connective: 'and', outcome: 'remainsOutside' },
    NotMetToMet: { connective: 'but', outcome: 'meets' },
  },
  Comparable: {
    MetToMet: { comparablePhrase: 'remained relatively stable', connective: 'and', outcome: 'meets' },
    NotMetToNotMet: { comparablePhrase: 'remained relatively stable', connective: 'and', outcome: 'remainsOutside' },
    NotMetToMet: { comparablePhrase: 'changed by less than the materiality threshold', connective: 'but', outcome: 'meets' },
    MetToNotMet: { comparablePhrase: 'changed by less than the materiality threshold', connective: 'and', outcome: 'doesNotMeet' },
  },
};

/** "below" for higher-is-favorable KPIs, "above" for lower-is-favorable. */
const outsideWord = (definition: KpiDefinition) => (definition.favorableDirection === 'lower' ? 'above' : 'below');

function describeOutcome(outcome: TargetOutcome, definition: KpiDefinition, targetText: string, possessive: 'the' | 'its'): string {
  switch (outcome) {
    case 'meets':
      return `meets ${possessive} ${targetText} target`;
    case 'doesNotMeet':
      return `is ${outsideWord(definition)} ${possessive} ${targetText} target`;
    case 'remainsOutside':
      return `remains ${outsideWord(definition)} ${possessive} ${targetText} target`;
  }
}

/** "; High Schools · SY 2025–26 is below its 65% target" — names the side when its own target matters. */
function describeRightTargetByLabel(ctx: DescriptionContext): string {
  const { right, input, definition } = ctx;
  if (right.target === null || right.targetStatus === 'NotAvailable') return '';
  const outcome: TargetOutcome = right.targetStatus === 'Met' ? 'meets' : 'doesNotMeet';
  return `; ${input.right.label} ${describeOutcome(outcome, definition, formatTarget(input.kpi, definition, right.target), 'its')}`;
}

// ─── Sentences by classification ─────────────────────────────────────────────

function describeNoData(ctx: DescriptionContext): string {
  const missing = Array.from(new Set([ctx.input.left, ctx.input.right].filter(s => s.actual === null).map(s => s.label)));
  return `${CLASSIFICATION_LABELS.NoData} ${EM_DASH} ${ctx.definition.descriptionSubject} could not be compared because data is unavailable for ${missing.join(' and ')}.`;
}

/** Informational KPIs state the values only (no classification prefix, no target status). */
function describeInformational(ctx: DescriptionContext): string {
  const { definition, input, left, right } = ctx;
  const subject = definition.descriptionSubject;
  const from = formatKpiValue(input.kpi, left.actual);
  const to = formatKpiValue(input.kpi, right.actual);
  const suffix = definition.displayFormat === 'percentOfInventoryValue' ? ' of total inventory value' : '';

  if (from === to) return `${subject} remained at ${from}${suffix}.`;
  if (input.kpi === 'Inventory Value') {
    const verb = (ctx.delta ?? 0) > 0 ? 'increased' : 'decreased';
    return `${subject} ${verb} from ${from} to ${to}, a change of ${formatCurrency(ctx.delta ?? 0)}.`;
  }
  return `${subject} changed from ${from} to ${to}${suffix}.`;
}

/** Spec §5.4 baseline zero: absolute change only, no relative %. */
function describeRelativeNotApplicable(ctx: DescriptionContext): string {
  const { definition, input } = ctx;
  const delta = ctx.delta ?? 0;
  const zero = formatAmount(input.kpi, definition, 0);
  const verb = delta > 0 ? 'increased' : 'decreased';
  const sentence = `${definition.descriptionSubject} ${verb} by ${formatAmount(input.kpi, definition, Math.abs(delta))} from ${zero}, so a percentage change cannot be calculated`;
  return `${CLASSIFICATION_LABELS.RelativeNotApplicable} ${EM_DASH} ${sentence}${describeRightTargetByLabel(ctx)}.`;
}

function describeDirectional(ctx: DescriptionContext, classification: 'Improved' | 'Declined' | 'Comparable'): string {
  const { definition, input, left, right, targetTransition } = ctx;
  const subject = definition.descriptionSubject;
  const prefix = `${CLASSIFICATION_LABELS[classification]} ${EM_DASH} ${subject}`;

  // No transition (a side lacks a target): omit target commentary.
  if (!targetTransition || right.target === null) {
    const change = classification === 'Comparable' ? 'remained relatively stable' : describeChange(ctx, true);
    return `${prefix} ${change}.`;
  }

  const row = DECISION_MATRIX[classification][targetTransition];
  const targetText = formatTarget(input.kpi, definition, right.target);

  // A Comparable result whose status changed while the targets differ: the change may come
  // from the target itself, so state the actual change and name the side with its own target.
  const targetsDiffer = left.target !== null && roundForComparison(left.target) !== roundForComparison(right.target);
  const statusChanged = targetTransition === 'NotMetToMet' || targetTransition === 'MetToNotMet';
  if (classification === 'Comparable' && targetsDiffer && statusChanged) {
    return `${prefix} ${describeChange(ctx, false)}${describeRightTargetByLabel(ctx)}.`;
  }

  const change = row.comparablePhrase ?? describeChange(ctx, false);
  return `${prefix} ${change} ${row.connective} ${describeOutcome(row.outcome, definition, targetText, 'the')}.`;
}

/** The full description: main sentence plus the partial-period note, if any. */
export function buildDescription(ctx: DescriptionContext): string {
  let main: string;
  switch (ctx.classification) {
    case 'NoData':
      main = describeNoData(ctx);
      break;
    case 'Informational':
      main = describeInformational(ctx);
      break;
    case 'RelativeNotApplicable':
      main = describeRelativeNotApplicable(ctx);
      break;
    default:
      main = describeDirectional(ctx, ctx.classification);
  }
  return ctx.partialNote ? `${main} ${ctx.partialNote}` : main;
}
