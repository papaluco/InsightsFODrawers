import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { compareKpi, getTargetStatus, NO_TARGET_TEXT } from './compareKpi';
import { formatInventoryDiscrepancy, formatKpiDelta, formatKpiTarget, formatKpiValue, NO_DATA_TEXT } from '../../../utils/kpiFormatters';
import { KpiComparisonResult, SideTimeframe, TargetStatus } from './types';

/**
 * Site-level evaluation for Site Drivers (NXT-77212, spec §5 and §8).
 *
 * Each site is evaluated with the same rules as the overall comparison, using that
 * site's own actual and its own resolved target (never an averaged benchmark).
 * - Matched: both sides resolve to the identical set of sites → one engine result per site.
 * - Unmatched: each side's sites are evaluated independently against their targets.
 */

export interface SiteValuesInput {
  siteId: number;
  siteName: string;
  actual: number | null;
  target: number | null;
  secondaryActual?: number | null;
}

export interface SiteDriversSideInput {
  /** The side's generated label, e.g. "High Schools · SY 2025–26". */
  label: string;
  /** The side's timeframe label, used to build site labels ("Roosevelt High · SY 2025–26"). */
  timeframeLabel: string;
  timeframe?: SideTimeframe;
  sites: SiteValuesInput[];
}

export interface SiteTargetEvaluation {
  siteId: number;
  siteName: string;
  actual: number | null;
  target: number | null;
  actualFormatted: string;
  targetFormatted: string;
  hasData: boolean;
  targetStatus: TargetStatus;
  /** actual − target in KPI units. Null without data or a target, and for informational KPIs. */
  varianceFromTarget: number | null;
  /** Variance from target in the KPI's delta format ("−1.0 pts", "+$200"); null when there is no variance. */
  varianceFormatted: string | null;
  /** How far the site falls short of its target (positive = unfavorable), respecting direction. */
  unfavorableVariance: number | null;
}

export interface SiteTargetSummary {
  sitesInScope: number;
  /** Denominator for "N of M sites meeting target": sites with data and a target. */
  sitesWithTarget: number;
  meetingTarget: number;
  notMeetingTarget: number;
}

export interface SiteDriversSide {
  label: string;
  sites: SiteTargetEvaluation[];
  summary: SiteTargetSummary;
}

export interface MatchedSiteResult {
  siteId: number;
  siteName: string;
  /** The site's comparison (classification, change, both target statuses). */
  result: KpiComparisonResult;
  /** The site against its own target on each side (variance from target; spec §8 default sort uses the right side). */
  left: SiteTargetEvaluation;
  right: SiteTargetEvaluation;
}

export interface SiteDriversResult {
  kpi: ComparisonKpiKey;
  /** Site Drivers applies when at least one side resolves to more than one site (spec §8). */
  available: boolean;
  /** True when both sides resolve to the identical set of sites (spec §3). */
  matched: boolean;
  left: SiteDriversSide;
  right: SiteDriversSide;
  /** One engine result per site when matched; null otherwise. */
  matchedSites: MatchedSiteResult[] | null;
}

export function evaluateSiteAgainstTarget(kpi: ComparisonKpiKey, site: SiteValuesInput): SiteTargetEvaluation {
  const definition = getKpiDefinition(kpi);
  const target = definition.targetPolicy === 'none' ? null : site.target;
  const targetStatus = getTargetStatus(kpi, site.actual, target);
  const hasStatus = targetStatus !== 'NotAvailable' && site.actual !== null && target !== null;
  const varianceFromTarget = hasStatus ? (site.actual as number) - (target as number) : null;

  return {
    siteId: site.siteId,
    siteName: site.siteName,
    actual: site.actual,
    target,
    actualFormatted:
      kpi === 'Physical Inventory Discrepancy'
        ? formatInventoryDiscrepancy(site.actual, site.secondaryActual ?? null)
        : formatKpiValue(kpi, site.actual, NO_DATA_TEXT),
    targetFormatted: formatKpiTarget(kpi, target, NO_TARGET_TEXT),
    hasData: site.actual !== null,
    targetStatus,
    varianceFromTarget,
    varianceFormatted: varianceFromTarget === null ? null : formatKpiDelta(kpi, varianceFromTarget),
    unfavorableVariance:
      varianceFromTarget === null ? null : definition.favorableDirection === 'lower' ? varianceFromTarget : -varianceFromTarget,
  };
}

export function summarizeSiteTargets(sites: SiteTargetEvaluation[]): SiteTargetSummary {
  const meetingTarget = sites.filter(s => s.targetStatus === 'Met').length;
  const notMeetingTarget = sites.filter(s => s.targetStatus === 'NotMet').length;
  return { sitesInScope: sites.length, sitesWithTarget: meetingTarget + notMeetingTarget, meetingTarget, notMeetingTarget };
}

function evaluateSide(kpi: ComparisonKpiKey, side: SiteDriversSideInput): SiteDriversSide {
  const sites = side.sites.map(site => evaluateSiteAgainstTarget(kpi, site));
  return { label: side.label, sites, summary: summarizeSiteTargets(sites) };
}

const siteIdSet = (side: SiteDriversSideInput) => side.sites.map(s => s.siteId).sort((a, b) => a - b).join(',');

export function evaluateSiteDrivers(
  kpi: ComparisonKpiKey,
  left: SiteDriversSideInput,
  right: SiteDriversSideInput,
): SiteDriversResult {
  const matched = siteIdSet(left) === siteIdSet(right);
  const leftSide = evaluateSide(kpi, left);
  const rightSide = evaluateSide(kpi, right);

  const matchedSites = matched
    ? left.sites.map((leftSite, index) => {
        const rightIndex = right.sites.findIndex(s => s.siteId === leftSite.siteId);
        const rightSite = right.sites[rightIndex];
        return {
          siteId: leftSite.siteId,
          siteName: leftSite.siteName,
          result: compareKpi({
            kpi,
            left: { ...leftSite, label: `${leftSite.siteName} · ${left.timeframeLabel}`, timeframe: left.timeframe },
            right: { ...rightSite, label: `${rightSite.siteName} · ${right.timeframeLabel}`, timeframe: right.timeframe },
          }),
          left: leftSide.sites[index],
          right: rightSide.sites[rightIndex],
        };
      })
    : null;

  return {
    kpi,
    available: left.sites.length > 1 || right.sites.length > 1,
    matched,
    left: leftSide,
    right: rightSide,
    matchedSites,
  };
}
