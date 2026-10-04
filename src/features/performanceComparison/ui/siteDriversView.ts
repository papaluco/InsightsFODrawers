import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import type { Classification, TargetStatus } from '../engine/types';
import type { MatchedSiteResult, SiteDriversResult, SiteDriversSide, SiteTargetEvaluation } from '../engine/siteDrivers';

/**
 * Site Drivers presentation (NXT-77212, spec §8). Turns the engine's siteDrivers results into
 * row-summary text and table order. Every count, status, and variance comes from the engine;
 * nothing here classifies a site or compares it with its target.
 */

// ─── Row summary ─────────────────────────────────────────────────────────────

/** "below" for higher-is-favorable KPIs, "above" for lower-is-favorable (matches the engine's descriptions). */
const outsideWord = (drivers: SiteDriversResult) =>
  getKpiDefinition(drivers.kpi).favorableDirection === 'lower' ? 'above' : 'below';

const siteCount = (n: number) => `${n} ${n === 1 ? 'site' : 'sites'}`;

/** "6 of 10", or why there is no count. Denominator = sites with data and a target (spec §8). */
function meetingPart(side: SiteDriversSide): string {
  const { meetingTarget, sitesWithTarget } = side.summary;
  if (sitesWithTarget > 0) return `${meetingTarget} of ${sitesWithTarget}`;
  return side.sites.some(s => s.hasData) ? 'No site targets' : 'No site data';
}

/**
 * One side's sites against their own targets: "6 of 10 sites meeting target · 4 below target"
 * (no count when every site meets it), "No site targets", "No site data", or for informational
 * KPIs just "10 sites". Used for a single multi-site side in the row summary and as the drawer's
 * section summaries.
 */
export function getSideAttainmentText(drivers: SiteDriversResult, side: SiteDriversSide): string {
  if (getKpiDefinition(drivers.kpi).kind === 'informational') return siteCount(side.sites.length);
  const { sitesWithTarget, notMeetingTarget } = side.summary;
  if (sitesWithTarget === 0) return meetingPart(side);
  const outside = notMeetingTarget > 0 ? ` · ${notMeetingTarget} ${outsideWord(drivers)} target` : '';
  return `${meetingPart(side)} sites meeting target${outside}`;
}

/**
 * Compact text for the KPI table's Site Drivers column; null when Site Drivers doesn't apply
 * (both sides are a single site). One line per entry; "View Sites" follows the last line.
 *
 * - Matched: "8 of 10 → 6 of 10 sites meeting target" (left → right, the table's orientation).
 * - Unmatched, one multi-site side: "6 of 10 sites meeting target · 4 below target".
 * - Unmatched, both multi-site: one shorter line per side, named with the compact side names
 *   ("High Schools: 3 of 4 meeting target") so the row stays compact.
 * - Informational KPIs: site counts only, no target attainment (spec §3).
 */
export function getSiteDriversSummaryLines(drivers: SiteDriversResult, sideShortNames: [string, string]): string[] | null {
  if (!drivers.available) return null;
  const isInformational = getKpiDefinition(drivers.kpi).kind === 'informational';

  if (drivers.matched) {
    if (isInformational) return [siteCount(drivers.right.sites.length)];
    const left = meetingPart(drivers.left);
    const right = meetingPart(drivers.right);
    if (left === right && drivers.left.summary.sitesWithTarget === 0) return [left];
    const suffix = drivers.right.summary.sitesWithTarget > 0 ? ' sites meeting target' : '';
    return [`${left} → ${right}${suffix}`];
  }

  // Unmatched: summarize each side that has more than one site; a single site is already the KPI row.
  const sides = ([
    [drivers.left, sideShortNames[0]],
    [drivers.right, sideShortNames[1]],
  ] as const).filter(([side]) => side.sites.length > 1);
  const named = sides.length > 1;

  return sides.map(([side, name]) => {
    if (!named) return getSideAttainmentText(drivers, side);
    if (isInformational || side.summary.sitesWithTarget === 0) return `${name}: ${getSideAttainmentText(drivers, side)}`;
    return `${name}: ${meetingPart(side)} meeting target`;
  });
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

export type SiteSortKey = 'site' | 'leftActual' | 'rightActual' | 'actual' | 'change' | 'target' | 'variance' | 'status';
export type SortDirection = 'asc' | 'desc';

/** null = the default Site Drivers order. */
export interface SiteSort {
  key: SiteSortKey;
  direction: SortDirection;
}

/**
 * Header click: the same column flips direction; a new column starts with the order that puts
 * the most notable sites first (names A–Z, status worst first, numbers largest first).
 */
export function nextSiteSort(current: SiteSort | null, key: SiteSortKey): SiteSort {
  if (current?.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  return { key, direction: key === 'site' || key === 'status' ? 'asc' : 'desc' };
}

const byName = (a: { siteName: string }, b: { siteName: string }) => a.siteName.localeCompare(b.siteName);

/**
 * Default order group (spec §8): sites with a variance from target first, then sites with data
 * but no target (including informational KPIs), then No Data last.
 */
function defaultGroup(site: SiteTargetEvaluation): number {
  if (!site.hasData) return 2;
  return site.unfavorableVariance === null ? 1 : 0;
}

/** Default order: largest unfavorable variance from target first; no target next; No Data last. Ties by name. */
export function compareSitesByDefaultOrder(a: SiteTargetEvaluation, b: SiteTargetEvaluation): number {
  const group = defaultGroup(a) - defaultGroup(b);
  if (group !== 0) return group;
  if (a.unfavorableVariance !== null && b.unfavorableVariance !== null && a.unfavorableVariance !== b.unfavorableVariance) {
    return b.unfavorableVariance - a.unfavorableVariance;
  }
  return byName(a, b);
}

/** Worst first when ascending. Not Met → Met → no target; No Data has no rank (always last). */
const TARGET_STATUS_RANK: Record<TargetStatus, number> = { NotMet: 0, Met: 1, NotAvailable: 2 };

/** Worst first when ascending; No Data has no rank (always last). */
const CLASSIFICATION_RANK: Partial<Record<Classification, number>> = {
  Declined: 0,
  Comparable: 1,
  RelativeNotApplicable: 2,
  Improved: 3,
  Informational: 4,
};

type SortValue = number | string | null;

/** Column sort with No Data (null) always last whichever the direction. Ties by name. */
function sortByColumn<T extends { siteName: string }>(items: T[], sort: SiteSort, valueOf: (item: T) => SortValue): T[] {
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = valueOf(a);
    const vb = valueOf(b);
    if (va === null || vb === null) {
      if (va === vb) return byName(a, b);
      return va === null ? 1 : -1;
    }
    const diff = typeof va === 'string' ? va.localeCompare(vb as string) : va - (vb as number);
    return diff !== 0 ? diff * factor : byName(a, b);
  });
}

const statusValue = (site: SiteTargetEvaluation): number | null => (site.hasData ? TARGET_STATUS_RANK[site.targetStatus] : null);

/** One side's list (unmatched populations). */
export function sortSiteEvaluations(sites: SiteTargetEvaluation[], sort: SiteSort | null): SiteTargetEvaluation[] {
  if (!sort) return [...sites].sort(compareSitesByDefaultOrder);
  return sortByColumn(sites, sort, site => {
    switch (sort.key) {
      case 'site':
        return site.siteName;
      case 'target':
        return site.target;
      case 'variance':
        // Ordered by how far the site falls short, so "largest first" means most unfavorable first.
        return site.unfavorableVariance;
      case 'status':
        return statusValue(site);
      default:
        return site.actual;
    }
  });
}

/** Matched populations. The default order follows the right side's variance from target (spec §8). */
export function sortMatchedSites(sites: MatchedSiteResult[], sort: SiteSort | null): MatchedSiteResult[] {
  if (!sort) return [...sites].sort((a, b) => compareSitesByDefaultOrder(a.right, b.right));
  return sortByColumn(sites, sort, site => {
    switch (sort.key) {
      case 'site':
        return site.siteName;
      case 'leftActual':
        return site.left.actual;
      case 'rightActual':
      case 'actual':
        return site.right.actual;
      case 'change':
        return site.result.delta;
      case 'target':
        return site.right.target;
      case 'variance':
        return site.right.unfavorableVariance;
      case 'status': {
        // Classification first, then the right side's target status.
        const rank = CLASSIFICATION_RANK[site.result.classification];
        if (rank === undefined) return null;
        return rank * 10 + (statusValue(site.right) ?? 9);
      }
    }
  });
}
