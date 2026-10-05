import { COMPARISON_KPI_KEYS } from '../../../constants/kpiDefinitions';
import type { SideDataset } from '../../../services/comparisonDataService';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { compareKpi } from '../engine/compareKpi';
import { evaluateSiteDrivers, SiteDriversResult, SiteDriversSideInput } from '../engine/siteDrivers';
import { KpiComparisonInput, KpiComparisonResult } from '../engine/types';

/**
 * Comparison selector: the single source every Performance Comparison component
 * reads (spec §1 "one centralized result per KPI", §6 state). It maps two side
 * datasets to engine inputs, runs the engine once per KPI, and applies the KPI
 * filter and Needs Attention toggle. Components never call the engine themselves.
 */

export interface ComparisonFilters {
  /** KPIs selected in the KPI filter (default: all 17). */
  kpiFilter: readonly ComparisonKpiKey[];
  /** When true, only KPIs that need attention are in scope. */
  needsAttentionOnly: boolean;
}

export interface SideTargetAttainment {
  label: string;
  /** Directional KPIs in scope that meet their target on this side. */
  meetingTarget: number;
  /** Denominator: directional KPIs in scope with data and a target on this side. */
  kpisWithTarget: number;
}

/** Facts for the Comparison Summary (spec §8). Counts cover KPIs in scope only. */
export interface ComparisonSummary {
  /** Directional KPIs in scope ("14 KPIs compared"). Informational KPIs are never counted. */
  directional: number;
  improved: number;
  comparable: number;
  declined: number;
  /** Directional KPIs in scope with No Data (shown separately, never as a classification). */
  noData: number;
  /** Baseline-zero results: excluded from the counts above (spec §5.4). */
  relativeNotApplicable: number;
  needsAttention: number;
  left: SideTargetAttainment;
  right: SideTargetAttainment;
}

export interface ComparisonResults {
  leftLabel: string;
  rightLabel: string;
  /** Every KPI in spec §4 order, before filters. */
  allResults: KpiComparisonResult[];
  /** KPIs in scope (KPI filter + Needs Attention), in spec §4 order. */
  results: KpiComparisonResult[];
  /** Every KPI's result, keyed by KPI. */
  resultsByKpi: Record<ComparisonKpiKey, KpiComparisonResult>;
  /** Site-level evaluation per KPI for Site Drivers. */
  siteDrivers: Record<ComparisonKpiKey, SiteDriversResult>;
  /** Site Drivers applies: at least one side has more than one site (spec §8). Otherwise the column is hidden. */
  siteDriversAvailable: boolean;
  summary: ComparisonSummary;
}

/** Engine input for one KPI from two side datasets. */
export function buildKpiComparisonInput(kpi: ComparisonKpiKey, left: SideDataset, right: SideDataset): KpiComparisonInput {
  const side = (dataset: SideDataset) => ({
    ...dataset.kpis[kpi],
    label: dataset.label,
    timeframe: dataset.timeframe,
  });
  return { kpi, left: side(left), right: side(right) };
}

function buildSiteDriversSide(kpi: ComparisonKpiKey, dataset: SideDataset): SiteDriversSideInput {
  return {
    label: dataset.label,
    timeframeLabel: dataset.timeframeLabel,
    timeframe: dataset.timeframe,
    sites: dataset.siteIds.map(siteId => ({
      siteId,
      siteName: dataset.siteNames[siteId] ?? `Site ${siteId}`,
      ...dataset.sites[siteId][kpi],
    })),
  };
}

function summarize(results: KpiComparisonResult[], leftLabel: string, rightLabel: string): ComparisonSummary {
  const directional = results.filter(r => r.kind === 'directional');
  const count = (predicate: (r: KpiComparisonResult) => boolean) => directional.filter(predicate).length;
  const attainment = (label: string, side: 'left' | 'right'): SideTargetAttainment => ({
    label,
    meetingTarget: count(r => r[side].targetStatus === 'Met'),
    kpisWithTarget: count(r => r[side].targetStatus !== 'NotAvailable'),
  });

  return {
    directional: directional.length,
    improved: count(r => r.classification === 'Improved'),
    comparable: count(r => r.classification === 'Comparable'),
    declined: count(r => r.classification === 'Declined'),
    noData: count(r => r.classification === 'NoData'),
    relativeNotApplicable: count(r => r.classification === 'RelativeNotApplicable'),
    needsAttention: count(r => r.needsAttention),
    left: attainment(leftLabel, 'left'),
    right: attainment(rightLabel, 'right'),
  };
}

export function selectComparison(left: SideDataset, right: SideDataset, filters: ComparisonFilters): ComparisonResults {
  const resultsByKpi = {} as Record<ComparisonKpiKey, KpiComparisonResult>;
  const siteDrivers = {} as Record<ComparisonKpiKey, SiteDriversResult>;

  for (const kpi of COMPARISON_KPI_KEYS) {
    resultsByKpi[kpi] = compareKpi(buildKpiComparisonInput(kpi, left, right));
    siteDrivers[kpi] = evaluateSiteDrivers(kpi, buildSiteDriversSide(kpi, left), buildSiteDriversSide(kpi, right));
  }

  const allResults = COMPARISON_KPI_KEYS.map(kpi => resultsByKpi[kpi]);
  const selected = new Set(filters.kpiFilter);
  const results = allResults.filter(r => selected.has(r.kpi) && (!filters.needsAttentionOnly || r.needsAttention));

  return {
    leftLabel: left.label,
    rightLabel: right.label,
    allResults,
    results,
    resultsByKpi,
    siteDrivers,
    siteDriversAvailable: left.siteIds.length > 1 || right.siteIds.length > 1,
    summary: summarize(results, left.label, right.label),
  };
}
