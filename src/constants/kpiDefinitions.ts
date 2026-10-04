import { ComparisonKpiKey, KPI_SHORT_TO_LONG } from '../types/kpiTypes';
import { KPIKey as SchoolieKpiKey } from '../types/SchoolieTypes';

/**
 * KPI rules matrix for Performance Comparison (NXT-77217 §2, spec §4).
 *
 * This is the single source of KPI metadata for the rules engine and the
 * comparison UI. Keys are the existing short names from kpiTypes.ts.
 */

/** How a value is displayed. */
export type KpiDisplayFormat =
  | 'percent'
  | 'currency'
  | 'count'
  /** Number with 2 decimal places. */
  | 'mplh'
  | 'days'
  /** % of total inventory value is the compared value; the $ amount is shown alongside. */
  | 'percentOfInventoryValue';

export type KpiKind = 'directional' | 'informational';

export type FavorableDirection = 'higher' | 'lower' | 'none';

/**
 * - percentagePoints: material when |right − left| ≥ threshold pts (spec §5.4).
 * - relativePercent: material when |(right − left) / left| ≥ threshold, as a fraction (0.02 = 2%).
 */
export type MaterialityMethod = 'percentagePoints' | 'relativePercent' | 'none';

/**
 * How a side's value is built from site/day facts (spec §4).
 * Ratio KPIs are always a ratio of sums, never an average of site ratios.
 */
export type KpiAggregation = 'sum' | 'ratioOfSums' | 'pointInTime';

/**
 * - configured: the configured benchmark drives Met / Not Met.
 * - contextOnly: a benchmark may be shown, but there is no target status (spec §3 informational targets).
 * - none: never has a target.
 */
export type KpiTargetPolicy = 'configured' | 'contextOnly' | 'none';

export interface KpiMateriality {
  method: MaterialityMethod;
  /** pts for percentagePoints; a fraction for relativePercent; null when method is 'none'. */
  threshold: number | null;
}

export interface KpiDefinition {
  key: ComparisonKpiKey;
  /** Display name, reusing KPI_LONG_NAMES where it exists. */
  name: string;
  /** How the KPI is named at the start of a deterministic description, e.g. "Lunch participation". */
  descriptionSubject: string;
  displayFormat: KpiDisplayFormat;
  /** Secondary value shown next to the primary one (Physical Inventory Discrepancy's $ amount). */
  secondaryDisplayFormat?: KpiDisplayFormat;
  kind: KpiKind;
  favorableDirection: FavorableDirection;
  materiality: KpiMateriality;
  aggregation: KpiAggregation;
  /** For ratioOfSums KPIs whose components are already defined (spec §4 or existing calcs). Others are mock pairs (spec §3). */
  ratio?: { numerator: string; denominator: string };
  targetPolicy: KpiTargetPolicy;
}

const PERCENTAGE_POINT_MATERIALITY: KpiMateriality = { method: 'percentagePoints', threshold: 0.5 };
const RELATIVE_MATERIALITY: KpiMateriality = { method: 'relativePercent', threshold: 0.02 };
const NO_MATERIALITY: KpiMateriality = { method: 'none', threshold: null };

const participation = (key: 'Breakfast' | 'Lunch' | 'Snack' | 'Supper'): KpiDefinition => ({
  key,
  name: KPI_SHORT_TO_LONG[key],
  descriptionSubject: `${key} participation`,
  displayFormat: 'percent',
  kind: 'directional',
  favorableDirection: 'higher',
  materiality: PERCENTAGE_POINT_MATERIALITY,
  aggregation: 'ratioOfSums',
  targetPolicy: 'configured',
});

const dollars = (
  key: 'Revenue' | 'A La Carte' | 'Reimbursement' | 'Waste',
  descriptionSubject: string,
  favorableDirection: 'higher' | 'lower',
): KpiDefinition => ({
  key,
  name: KPI_SHORT_TO_LONG[key] ?? key,
  descriptionSubject,
  displayFormat: 'currency',
  kind: 'directional',
  favorableDirection,
  materiality: RELATIVE_MATERIALITY,
  aggregation: 'sum',
  targetPolicy: 'configured',
});

/** Spec §4 order; also the default KPI filter / table order. */
export const KPI_DEFINITIONS: readonly KpiDefinition[] = [
  participation('Breakfast'),
  participation('Lunch'),
  participation('Snack'),
  participation('Supper'),
  dollars('Revenue', 'Revenue', 'higher'),
  {
    key: 'Meals',
    name: KPI_SHORT_TO_LONG['Meals'],
    descriptionSubject: 'Meals',
    displayFormat: 'count',
    kind: 'directional',
    favorableDirection: 'higher',
    materiality: RELATIVE_MATERIALITY,
    aggregation: 'sum',
    targetPolicy: 'configured',
  },
  {
    key: 'MEQs',
    name: KPI_SHORT_TO_LONG['MEQs'],
    descriptionSubject: 'MEQs',
    displayFormat: 'count',
    kind: 'directional',
    favorableDirection: 'higher',
    materiality: RELATIVE_MATERIALITY,
    aggregation: 'sum',
    targetPolicy: 'configured',
  },
  {
    key: 'Eco Dis',
    name: KPI_SHORT_TO_LONG['Eco Dis'],
    descriptionSubject: 'Eco Dis',
    displayFormat: 'percent',
    kind: 'directional',
    favorableDirection: 'higher',
    materiality: PERCENTAGE_POINT_MATERIALITY,
    aggregation: 'ratioOfSums',
    targetPolicy: 'configured',
  },
  {
    key: 'PNA',
    name: KPI_SHORT_TO_LONG['PNA'],
    descriptionSubject: 'PNA',
    displayFormat: 'percent',
    kind: 'directional',
    favorableDirection: 'lower',
    materiality: PERCENTAGE_POINT_MATERIALITY,
    aggregation: 'ratioOfSums',
    ratio: { numerator: 'paid students', denominator: 'students' }, // as in calculateDistrictPNA()
    targetPolicy: 'configured',
  },
  {
    key: 'ENP',
    name: KPI_SHORT_TO_LONG['ENP'],
    descriptionSubject: 'ENP',
    displayFormat: 'percent',
    kind: 'directional',
    favorableDirection: 'lower',
    materiality: PERCENTAGE_POINT_MATERIALITY,
    aggregation: 'ratioOfSums',
    targetPolicy: 'configured',
  },
  {
    key: 'MPLH',
    name: KPI_SHORT_TO_LONG['MPLH'],
    descriptionSubject: 'MPLH',
    displayFormat: 'mplh',
    kind: 'directional',
    favorableDirection: 'higher',
    materiality: RELATIVE_MATERIALITY,
    aggregation: 'ratioOfSums',
    ratio: { numerator: 'MEQs', denominator: 'labor hours' }, // spec §4
    targetPolicy: 'configured',
  },
  dollars('A La Carte', 'A La Carte sales', 'higher'),
  dollars('Reimbursement', 'Reimbursement', 'higher'),
  dollars('Waste', 'Waste', 'lower'),
  {
    key: 'Inventory Value',
    name: KPI_SHORT_TO_LONG['Inventory Value'],
    descriptionSubject: 'Inventory value',
    displayFormat: 'currency',
    kind: 'informational',
    favorableDirection: 'none',
    materiality: NO_MATERIALITY,
    aggregation: 'pointInTime',
    targetPolicy: 'none',
  },
  {
    key: 'Inventory Turnover Rate',
    name: KPI_SHORT_TO_LONG['Inventory Turnover Rate'],
    descriptionSubject: 'Inventory turnover',
    displayFormat: 'days',
    kind: 'informational',
    favorableDirection: 'none',
    materiality: NO_MATERIALITY,
    aggregation: 'pointInTime',
    targetPolicy: 'contextOnly',
  },
  {
    key: 'Physical Inventory Discrepancy',
    name: KPI_SHORT_TO_LONG['Physical Inventory Discrepancy'],
    descriptionSubject: 'Physical inventory discrepancy',
    displayFormat: 'percentOfInventoryValue',
    secondaryDisplayFormat: 'currency',
    kind: 'informational',
    favorableDirection: 'none',
    materiality: NO_MATERIALITY,
    aggregation: 'pointInTime',
    targetPolicy: 'contextOnly',
  },
];

/** All 17 comparison KPI keys in spec §4 order. */
export const COMPARISON_KPI_KEYS: readonly ComparisonKpiKey[] = KPI_DEFINITIONS.map(d => d.key);

const DEFINITIONS_BY_KEY = new Map<ComparisonKpiKey, KpiDefinition>(KPI_DEFINITIONS.map(d => [d.key, d]));

export function getKpiDefinition(key: ComparisonKpiKey): KpiDefinition {
  const definition = DEFINITIONS_BY_KEY.get(key);
  if (!definition) throw new Error(`Unknown KPI: "${key}"`);
  return definition;
}

/** True when the KPI can be Met / Not Met against a target (spec §3, §5.6). */
export function hasTargetStatus(key: ComparisonKpiKey): boolean {
  return getKpiDefinition(key).targetPolicy === 'configured';
}

/**
 * Mapping to the Schoolie KPIKey in types/SchoolieTypes.ts (e.g. 'PNA' → 'PAID_NOT_APPLIED').
 * The two KPIKey types aren't consolidated because their string values are used as keys in
 * mockAIResponses and elsewhere. A La Carte and Reimbursement have no Schoolie key yet (null).
 */
export const COMPARISON_KPI_TO_SCHOOLIE_KEY: Record<ComparisonKpiKey, SchoolieKpiKey | null> = {
  Breakfast: 'BREAKFAST',
  Lunch: 'LUNCH',
  Snack: 'SNACK',
  Supper: 'SUPPER',
  Revenue: 'REVENUE',
  Meals: 'MEALS',
  MEQs: 'MEAL_EQUIVALENTS',
  'Eco Dis': 'ECON_DISADVANTAGED',
  PNA: 'PAID_NOT_APPLIED',
  ENP: 'ENP',
  MPLH: 'MPLH',
  'A La Carte': null,
  Reimbursement: null,
  Waste: 'WASTE',
  'Inventory Value': 'INV_VALUE',
  'Inventory Turnover Rate': 'INV_TURNOVER',
  'Physical Inventory Discrepancy': 'PHYS_INV_DISCREPANCY',
};
