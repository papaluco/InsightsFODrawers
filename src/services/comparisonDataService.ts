/**
 * Comparison data service for Insights Performance Comparison (NXT-77201 spec §9).
 *
 * This is the contract the production API replaces. UI components and the rules
 * engine get comparison data only from here, never from mock data directly.
 * Async so it can be swapped for a real API call without changing callers.
 */
import { DEMO_AS_OF_DATE } from '../constants/demo';
import { COMPARISON_KPI_KEYS, getKpiDefinition } from '../constants/kpiDefinitions';
import { resolveBenchmark } from '../data/mockComparisonBenchmarks';
import { getComparisonMockData } from '../data/mockComparisonData';
import { isServingDay } from '../data/mockSchoolCalendar';
import {
  getSiteScopeLabel,
  getSiteScopeType,
  resolveSiteScope,
  SiteScopeKind,
  SiteSelection,
} from '../data/siteRegistry';
import {
  buildTrendBuckets,
  DayAlignment,
  ServingDayPredicate,
  TrendInterval,
} from '../features/performanceComparison/trend/trendRules';
import { DailySiteFacts, InventorySnapshot } from '../types/comparisonDataTypes';
import { ComparisonKpiKey } from '../types/kpiTypes';
import { IsoDate } from '../utils/dateOnly';
import { getSchoolYear } from '../utils/schoolYear';
import {
  CustomDateRange,
  getTimeframeLabel,
  ResolvedTimeframe,
  resolveTimeframe,
  TimeframeOptionId,
} from '../utils/timeframes';
import {
  aggregateInventoryDiscrepancyDollars,
  aggregateKpi,
} from './comparisonAggregation';

// ─── Contract ────────────────────────────────────────────────────────────────

export interface TimeframeSelection {
  optionId: TimeframeOptionId;
  customRange?: CustomDateRange;
}

/** One KPI's value on one side (or one site). null = No Data / no target, never 0. */
export interface KpiActualAndTarget {
  actual: number | null;
  target: number | null;
  /** Physical Inventory Discrepancy only: the $ amount shown alongside the %. */
  secondaryActual?: number | null;
}

export type KpiValues = Record<ComparisonKpiKey, KpiActualAndTarget>;

export interface SeriesPoint {
  /** Alignment position within the side's period (pair with the other side's point at the same position). */
  position: number;
  /** Side-neutral axis label, e.g. "Month 3". */
  positionLabel: string;
  /** This side's calendar label, e.g. "Sep 25". */
  label: string;
  start: IsoDate;
  end: IsoDate;
  /** null when the bucket has no data (e.g. a month of summer break). */
  actual: number | null;
}

export interface SeriesOptions {
  /** Week-vs-week Day trends align by weekday; get it from getDayAlignment(left, right). */
  dayAlignment?: DayAlignment;
}

export interface SideDataset {
  /** Generated label, e.g. "High Schools · SY 2025–26" (spec §6). */
  label: string;
  siteLabel: string;
  timeframeLabel: string;
  siteIds: number[];
  scopeType: SiteScopeKind;
  /** Full period plus partial info (isPartial, throughDate). */
  timeframe: ResolvedTimeframe;
  kpis: KpiValues;
  /** Per-site values, each with that site's own resolved target (for Site Drivers). */
  sites: Record<number, KpiValues>;
  /** Trend series for one KPI. Only buckets that have occurred are returned. */
  series: (kpi: ComparisonKpiKey, interval: TrendInterval, options?: SeriesOptions) => SeriesPoint[];
}

/**
 * Serving-day rule for trend Day buckets and compatibility (excludes weekends and
 * school breaks). Exposed here so UI code doesn't import the mock calendar.
 */
export const comparisonIsServingDay: ServingDayPredicate = isServingDay;

// ─── Implementation ──────────────────────────────────────────────────────────

interface FactIndex {
  factsBySite: Map<number, DailySiteFacts[]>;
  snapshotsBySite: Map<number, InventorySnapshot[]>;
}

let factIndex: FactIndex | null = null;

function getFactIndex(): FactIndex {
  if (factIndex) return factIndex;
  const { dailyFacts, inventorySnapshots } = getComparisonMockData();
  const groupBySite = <T extends { siteId: number }>(items: T[]) => {
    const map = new Map<number, T[]>();
    for (const item of items) {
      const list = map.get(item.siteId) ?? [];
      list.push(item);
      map.set(item.siteId, list);
    }
    return map;
  };
  factIndex = { factsBySite: groupBySite(dailyFacts), snapshotsBySite: groupBySite(inventorySnapshots) };
  return factIndex;
}

const inRange = (date: IsoDate, start: IsoDate, end: IsoDate) => date >= start && date <= end;

function selectRows(siteIds: number[], start: IsoDate, end: IsoDate) {
  const { factsBySite, snapshotsBySite } = getFactIndex();
  const facts: DailySiteFacts[] = [];
  const snapshots: InventorySnapshot[] = [];
  for (const siteId of siteIds) {
    for (const row of factsBySite.get(siteId) ?? []) if (inRange(row.date, start, end)) facts.push(row);
    for (const row of snapshotsBySite.get(siteId) ?? []) if (inRange(row.date, start, end)) snapshots.push(row);
  }
  return { facts, snapshots };
}

/**
 * The school year whose benchmarks apply. A custom range that spans Jul 1 uses the
 * school year it starts in (prototype rule).
 */
const benchmarkSchoolYear = (timeframe: ResolvedTimeframe): number =>
  timeframe.schoolYear?.startYear ?? getSchoolYear(timeframe.start).startYear;

/**
 * Target for one KPI over a set of sites and their facts.
 * Sum KPIs: benchmark rate × elapsed site-serving-days (fact rows); null with no rows.
 */
function computeTarget(
  kpi: ComparisonKpiKey,
  siteIds: number[],
  scopeType: SiteScopeKind,
  schoolYear: number,
  siteServingDays: number,
): number | null {
  const { value } = resolveBenchmark(kpi, siteIds, scopeType, schoolYear);
  if (value === null) return null;
  if (getKpiDefinition(kpi).aggregation !== 'sum') return value;
  return siteServingDays === 0 ? null : value * siteServingDays;
}

function computeKpiValues(
  siteIds: number[],
  scopeType: SiteScopeKind,
  schoolYear: number,
  facts: DailySiteFacts[],
  snapshots: InventorySnapshot[],
): KpiValues {
  const values = {} as KpiValues;
  for (const kpi of COMPARISON_KPI_KEYS) {
    values[kpi] = {
      actual: aggregateKpi(kpi, facts, snapshots),
      target: computeTarget(kpi, siteIds, scopeType, schoolYear, facts.length),
    };
  }
  values['Physical Inventory Discrepancy'].secondaryActual = aggregateInventoryDiscrepancyDollars(snapshots);
  return values;
}

/** Builds a side's dataset synchronously as of `asOf`. Exported for tests; callers use getSideDataset. */
export function buildSideDataset(
  siteSelection: SiteSelection,
  timeframeSelection: TimeframeSelection,
  asOf: IsoDate = DEMO_AS_OF_DATE,
): SideDataset {
  const siteIds = resolveSiteScope(siteSelection);
  const scopeType = getSiteScopeType(siteIds);
  const siteLabel = getSiteScopeLabel(siteSelection);
  if (!scopeType || !siteLabel) throw new Error('A side needs at least one site.');

  const timeframe = resolveTimeframe(timeframeSelection.optionId, asOf, timeframeSelection.customRange);
  const timeframeLabel = getTimeframeLabel(timeframe);
  const schoolYear = benchmarkSchoolYear(timeframe);

  // Only dates that have occurred (through throughDate) contribute; future dates are never 0.
  const { facts, snapshots } = timeframe.throughDate
    ? selectRows(siteIds, timeframe.start, timeframe.throughDate)
    : { facts: [], snapshots: [] };

  const sites: Record<number, KpiValues> = {};
  for (const siteId of siteIds) {
    sites[siteId] = computeKpiValues(
      [siteId],
      'site',
      schoolYear,
      facts.filter(f => f.siteId === siteId),
      snapshots.filter(s => s.siteId === siteId),
    );
  }

  const series = (kpi: ComparisonKpiKey, interval: TrendInterval, options: SeriesOptions = {}): SeriesPoint[] =>
    buildTrendBuckets(timeframe, interval, { isServingDay, dayAlignment: options.dayAlignment }).map(bucket => {
      const rows = selectRows(siteIds, bucket.start, bucket.end);
      return { ...bucket, actual: aggregateKpi(kpi, rows.facts, rows.snapshots) };
    });

  return {
    label: `${siteLabel} · ${timeframeLabel}`,
    siteLabel,
    timeframeLabel,
    siteIds,
    scopeType,
    timeframe,
    kpis: computeKpiValues(siteIds, scopeType, schoolYear, facts, snapshots),
    sites,
    series,
  };
}

/** One side of a comparison: its label, scope, timeframe, KPI values and targets, per-site values, and series. */
export async function getSideDataset(
  siteSelection: SiteSelection,
  timeframeSelection: TimeframeSelection,
): Promise<SideDataset> {
  return buildSideDataset(siteSelection, timeframeSelection);
}
