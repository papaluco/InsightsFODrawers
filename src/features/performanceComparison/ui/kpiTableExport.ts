import type { ICSVReportData } from '../../../components/Downloading/CSVGen/CSVContract';
import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { toIsoDate } from '../../../utils/dateOnly';
import { NO_DATA_TEXT } from '../../../utils/kpiFormatters';
import { CLASSIFICATION_LABELS } from '../engine/descriptions';
import type { SiteDriversResult } from '../engine/siteDrivers';
import type { KpiComparisonResult, SideKpiResult } from '../engine/types';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { getTargetStatusDisplay, NEEDS_ATTENTION_REASON_LABELS } from './comparisonDisplay';
import { getSiteDriversSummaryLines } from './siteDriversView';

/**
 * KPI Comparison table export (NXT-77213, spec §10): the rows behind Copy data (TSV) and
 * Download CSV. Prototype reference for the column layout. Every value is the engine's
 * formatted text, exactly as the table shows it; nothing is recalculated here.
 */

/** Missing target, or no change to show. Never 0 (spec §1). */
export const EXPORT_EMPTY_TEXT = '—';

export interface KpiTableExportInput {
  /** KPIs in scope (KPI filter + Needs Attention), in display order. */
  results: KpiComparisonResult[];
  /** Generated labels in the current orientation. */
  leftLabel: string;
  rightLabel: string;
  /** Compact side names, used by the Site Drivers summary text (spec §8). */
  sideShortNames: [string, string];
  siteDrivers: Record<ComparisonKpiKey, SiteDriversResult>;
}

export interface KpiTableExport {
  headers: string[];
  rows: string[][];
}

/** Column headers. Site Drivers is left out when no side has more than one site (spec §8, §10). */
export function getKpiTableExportHeaders(leftLabel: string, rightLabel: string, includeSiteDrivers = true): string[] {
  const headers = [
    'KPI',
    `${leftLabel} Actual`,
    `${leftLabel} Target`,
    `${leftLabel} Target Status`,
    `${rightLabel} Actual`,
    `${rightLabel} Target`,
    `${rightLabel} Target Status`,
    'Change',
    'Performance',
    'Needs Attention',
    'Needs Attention Reasons',
    'Description',
  ];
  return includeSiteDrivers ? [...headers, 'Site Drivers'] : headers;
}

/** Actual, target, and target status for one side, as the table shows them. */
function sideColumns(side: SideKpiResult, isInformational: boolean): string[] {
  return [
    side.hasData ? side.actualFormatted : NO_DATA_TEXT,
    // Informational KPIs export their context benchmark here; it still gets no status (spec §3).
    side.target === null ? EXPORT_EMPTY_TEXT : side.targetFormatted,
    getTargetStatusDisplay(side, isInformational).text,
  ];
}

export function buildKpiTableExport({ results, leftLabel, rightLabel, sideShortNames, siteDrivers }: KpiTableExportInput): KpiTableExport {
  // Site Drivers applies to every KPI or to none: it depends only on how many sites each side has.
  const includeSiteDrivers = Object.values(siteDrivers).some(drivers => drivers.available);
  const rows = results.map(result => {
    const isInformational = result.kind === 'informational';
    const row = [
      getKpiDefinition(result.kpi).name,
      ...sideColumns(result.left, isInformational),
      ...sideColumns(result.right, isInformational),
      result.deltaFormatted ?? EXPORT_EMPTY_TEXT,
      CLASSIFICATION_LABELS[result.classification],
      result.needsAttention ? 'Yes' : 'No',
      result.needsAttentionReasons.map(reason => NEEDS_ATTENTION_REASON_LABELS[reason]).join(' · '),
      // The full description, with its "<Classification> — " prefix (spec §5.2: exports use `description`).
      result.description,
    ];
    if (!includeSiteDrivers) return row;
    return [...row, (getSiteDriversSummaryLines(siteDrivers[result.kpi], sideShortNames) ?? []).join('; ')];
  });
  return { headers: getKpiTableExportHeaders(leftLabel, rightLabel, includeSiteDrivers), rows };
}

/** Tab-separated text for the clipboard (Excel friendly). Tabs and line breaks inside a cell become spaces. */
export function toTsv({ headers, rows }: KpiTableExport): string {
  const cell = (value: string) => value.replace(/[\t\r\n]+/g, ' ');
  return [headers, ...rows].map(row => row.map(cell).join('\t')).join('\n');
}

/** Local calendar date of the download, YYYY-MM-DD. */
function localIsoDate(date: Date): string {
  return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function getKpiTableCsvFileName(now: Date = new Date()): string {
  return `Performance_Comparison_KPIs_${localIsoDate(now)}.csv`;
}

/** CSVRenderer input. CSVRenderer writes UTF-8 with a BOM, so "—" and "−" display correctly in Excel. */
/** Call when the user downloads, so the filename has the download's date (spec §10). */
export function toKpiTableCsvData(table: KpiTableExport, now: Date = new Date()): ICSVReportData {
  return { fileName: getKpiTableCsvFileName(now), headers: table.headers, rows: table.rows };
}
