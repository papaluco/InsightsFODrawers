import { FavorableDirection, getKpiDefinition } from '../../../constants/kpiDefinitions';
import type { SideDataset } from '../../../services/comparisonDataService';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { SiteDriversResult } from '../engine/siteDrivers';
import type {
  Classification,
  KpiComparisonResult,
  NeedsAttentionReason,
  SideKpiResult,
  TargetStatus,
  TargetTransition,
} from '../engine/types';
import type { ComparisonFilters, ComparisonResults } from '../selectors/selectComparison';
import { compareSitesByDefaultOrder, getSiteDriversSummaryTitle } from '../ui/siteDriversView';

/**
 * Structured facts payload sent to Schoolie (NXT-77214, spec §11).
 *
 * "The application determines the facts. Schoolie explains the facts." (spec §1). Every value here
 * is copied from the engine results, the side datasets, or the Site Drivers view helpers; nothing is
 * recalculated. Only KPIs in the current scope (KPI filter + Needs Attention) are included.
 *
 * Sides are keyed "from" (the side the change is measured from; the engine's left side) and "to"
 * (the compared side), so the payload never says left/right, A/B, or baseline (spec §2).
 */

/** Top-level orientation rules; the performance_comparison prompt repeats them. */
export const ORIENTATION_RULES: readonly string[] = [
  '"from" is the side the change is measured from; "to" is the compared side. Every delta is to − from.',
  'The comparison is not necessarily chronological: "from" may cover a later period than "to", or the same period for different sites.',
  'Refer to each side only by its generated label. Never call a side "from", "to", "A", "B", "left", "right", or "baseline".',
];

export interface SideFacts {
  /** Generated label, e.g. "High Schools · SY 2025–26". */
  label: string;
  siteScope: { label: string; scopeType: SideDataset['scopeType']; siteCount: number };
  timeframe: { label: string; optionId: string; start: string; end: string };
  /** Partial-period info (spec §5.1). throughDate is the last date with data. */
  partial: { isPartial: boolean; throughDate: string | null };
}

export interface KpiSideFacts {
  /** null = No Data (never 0). */
  actual: number | null;
  actualFormatted: string;
  /** null = no target configured (never a missed target). */
  target: number | null;
  targetFormatted: string;
  hasData: boolean;
  targetStatus: TargetStatus;
}

export interface SiteBelowTargetFacts {
  siteName: string;
  actualFormatted: string;
  targetFormatted: string;
  /** Variance from the site's own target in KPI delta format, e.g. "−3.1%" (percentage points). */
  varianceFormatted: string | null;
}

export interface KpiSiteDriversFacts {
  /** Both sides cover the identical set of sites. */
  matched: boolean;
  /** Row summary, e.g. "8 of 10 → 6 of 10 sites meeting target"; sides named by generated label. */
  summary: string;
  /**
   * NXT-77214 §11: for KPIs that need attention, the (up to) 3 sites on the "to" side furthest
   * outside their own targets, in the Site Drivers default order (spec §8). Empty otherwise.
   */
  topSitesOutsideTarget: SiteBelowTargetFacts[];
}

export interface KpiFacts {
  kpi: ComparisonKpiKey;
  name: string;
  /** Informational KPIs are never Improved/Declined and have no target status (spec §3). */
  informational: boolean;
  favorableDirection: FavorableDirection;
  from: KpiSideFacts;
  to: KpiSideFacts;
  /** to − from in KPI units (pts for % KPIs); null without data on both sides. */
  delta: number | null;
  deltaFormatted: string | null;
  classification: Classification;
  /** from → to; null unless both sides are Met or NotMet. */
  targetTransition: TargetTransition | null;
  needsAttention: boolean;
  needsAttentionReasons: NeedsAttentionReason[];
  /** The engine's full deterministic description (spec §5.9). */
  description: string;
  /** null when Site Drivers doesn't apply (both sides are a single site). */
  siteDrivers: KpiSiteDriversFacts | null;
}

export interface ComparisonFactsPayload {
  orientation: { from: string; to: string; rules: readonly string[] };
  sides: { from: SideFacts; to: SideFacts };
  /** Informational period-length notice (spec §6), or null when it doesn't apply. */
  periodLengthNotice: string | null;
  filters: {
    /** KPI names selected in the KPI filter, in display order. */
    kpiFilter: string[];
    allKpisSelected: boolean;
    needsAttentionOnly: boolean;
  };
  /** KPIs in scope, in display order. */
  kpis: KpiFacts[];
}

export interface ComparisonFactsInput {
  /** The side the change is measured from (the engine's left side). */
  from: SideDataset;
  /** The compared side (the engine's right side). */
  to: SideDataset;
  results: ComparisonResults;
  filters: ComparisonFilters;
  periodLengthNotice: string | null;
  /** Total KPIs available, to tell whether the filter is narrowed. */
  totalKpiCount: number;
}

const TOP_SITES_PER_KPI = 3;

function sideFacts(dataset: SideDataset): SideFacts {
  return {
    label: dataset.label,
    siteScope: { label: dataset.siteLabel, scopeType: dataset.scopeType, siteCount: dataset.siteIds.length },
    timeframe: {
      label: dataset.timeframeLabel,
      optionId: dataset.timeframe.optionId,
      start: dataset.timeframe.start,
      end: dataset.timeframe.end,
    },
    partial: { isPartial: dataset.timeframe.isPartial, throughDate: dataset.timeframe.throughDate ?? null },
  };
}

function kpiSideFacts(side: SideKpiResult): KpiSideFacts {
  return {
    actual: side.actual,
    actualFormatted: side.actualFormatted,
    target: side.target,
    targetFormatted: side.targetFormatted,
    hasData: side.hasData,
    targetStatus: side.targetStatus,
  };
}

function siteDriversFacts(drivers: SiteDriversResult, result: KpiComparisonResult, labels: [string, string]): KpiSiteDriversFacts | null {
  const summary = getSiteDriversSummaryTitle(drivers, labels);
  if (!summary) return null;
  // Top sites come from the "to" side, the side Needs Attention is evaluated on (spec §5.8).
  const topSitesOutsideTarget =
    result.needsAttention && drivers.right.sites.length > 1
      ? drivers.right.sites
          .filter(site => site.targetStatus === 'NotMet')
          .sort(compareSitesByDefaultOrder)
          .slice(0, TOP_SITES_PER_KPI)
          .map(site => ({
            siteName: site.siteName,
            actualFormatted: site.actualFormatted,
            targetFormatted: site.targetFormatted,
            varianceFormatted: site.varianceFormatted,
          }))
      : [];
  return { matched: drivers.matched, summary, topSitesOutsideTarget };
}

function kpiFacts(result: KpiComparisonResult, drivers: SiteDriversResult, labels: [string, string]): KpiFacts {
  const definition = getKpiDefinition(result.kpi);
  return {
    kpi: result.kpi,
    name: definition.name,
    informational: result.kind === 'informational',
    favorableDirection: definition.favorableDirection,
    from: kpiSideFacts(result.left),
    to: kpiSideFacts(result.right),
    delta: result.delta,
    deltaFormatted: result.deltaFormatted,
    classification: result.classification,
    targetTransition: result.targetTransition,
    needsAttention: result.needsAttention,
    needsAttentionReasons: [...result.needsAttentionReasons],
    description: result.description,
    siteDrivers: siteDriversFacts(drivers, result, labels),
  };
}

export function buildComparisonFacts(input: ComparisonFactsInput): ComparisonFactsPayload {
  const { from, to, results, filters, periodLengthNotice, totalKpiCount } = input;
  const labels: [string, string] = [results.leftLabel, results.rightLabel];

  return {
    orientation: { from: results.leftLabel, to: results.rightLabel, rules: ORIENTATION_RULES },
    sides: { from: sideFacts(from), to: sideFacts(to) },
    periodLengthNotice,
    filters: {
      kpiFilter: filters.kpiFilter.map(kpi => getKpiDefinition(kpi).name),
      allKpisSelected: filters.kpiFilter.length === totalKpiCount,
      needsAttentionOnly: filters.needsAttentionOnly,
    },
    // Only KPIs in scope (spec §11).
    kpis: results.results.map(result => kpiFacts(result, results.siteDrivers[result.kpi], labels)),
  };
}
