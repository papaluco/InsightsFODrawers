import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { CLASSIFICATION_LABELS } from '../engine/descriptions';
import type { MatchedSiteResult, SiteTargetEvaluation } from '../engine/siteDrivers';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { getTargetStatusDisplay } from './comparisonDisplay';
import { EXPORT_EMPTY_TEXT, type KpiTableExport } from './kpiTableExport';

/**
 * Site Drivers drawer copy (NXT-77212, NXT-77213): each drawer table as the user sees it —
 * same columns, same text, same row order — for the clipboard (tab-separated, via toTsv).
 * Pure; every value is the engine's formatted text.
 */

/** Columns shown for a KPI: informational KPIs have no variance or status, and show Context only when a site has one. */
export function getSiteTableColumns(kpi: ComparisonKpiKey, hasAnyTarget: boolean) {
  const isInformational = getKpiDefinition(kpi).kind === 'informational';
  return {
    isInformational,
    showTarget: !isInformational || hasAnyTarget,
    targetHeader: isInformational ? 'Context' : 'Target',
  };
}

/** Matched target cell: one target when both sides agree, otherwise "left → right". */
export function getMatchedTargetText(site: MatchedSiteResult): string {
  if (site.left.targetFormatted === site.right.targetFormatted) return site.right.targetFormatted;
  return `${site.left.targetFormatted} → ${site.right.targetFormatted}`;
}

/** Matched status cell: classification · target status (left → right, or one status when both are the same "none"). */
export function getMatchedStatusText(site: MatchedSiteResult): string {
  const left = getTargetStatusDisplay(site.result.left, false);
  const right = getTargetStatusDisplay(site.result.right, false);
  const sameNone = left.tone === 'none' && right.tone === 'none' && left.text === right.text;
  const status = sameNone ? right.text : `${left.text} → ${right.text}`;
  return `${CLASSIFICATION_LABELS[site.result.classification]} · ${status}`;
}

/** Matched populations table, in the displayed (sorted) order. */
export function buildMatchedSitesExport(kpi: ComparisonKpiKey, sites: MatchedSiteResult[], sideShortNames: [string, string]): KpiTableExport {
  const { isInformational, showTarget, targetHeader } = getSiteTableColumns(
    kpi,
    sites.some(s => s.left.target !== null || s.right.target !== null),
  );
  const [leftName, rightName] = sideShortNames;
  const headers = [
    'Site',
    leftName,
    rightName,
    'Change',
    ...(showTarget ? [targetHeader] : []),
    ...(isInformational ? [] : [`Variance from target (${rightName})`, 'Status']),
  ];
  const rows = sites.map(site => [
    site.siteName,
    site.left.actualFormatted,
    site.right.actualFormatted,
    site.result.deltaFormatted ?? EXPORT_EMPTY_TEXT,
    ...(showTarget ? [getMatchedTargetText(site)] : []),
    ...(isInformational ? [] : [site.right.varianceFormatted ?? EXPORT_EMPTY_TEXT, getMatchedStatusText(site)]),
  ]);
  return { headers, rows };
}

/** One side's table (unmatched populations), in the displayed (sorted) order. */
export function buildSideSitesExport(kpi: ComparisonKpiKey, sites: SiteTargetEvaluation[]): KpiTableExport {
  const { isInformational, showTarget, targetHeader } = getSiteTableColumns(kpi, sites.some(s => s.target !== null));
  const headers = ['Site', 'Actual', ...(showTarget ? [targetHeader] : []), ...(isInformational ? [] : ['Target Status', 'Variance from target'])];
  const rows = sites.map(site => [
    site.siteName,
    site.actualFormatted,
    ...(showTarget ? [site.targetFormatted] : []),
    ...(isInformational ? [] : [getTargetStatusDisplay(site, false).text, site.varianceFormatted ?? EXPORT_EMPTY_TEXT]),
  ]);
  return { headers, rows };
}
