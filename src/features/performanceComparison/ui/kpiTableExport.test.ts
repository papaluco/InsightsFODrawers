import { describe, expect, it } from 'vitest';
import { COMPARISON_KPI_KEYS, getKpiDefinition } from '../../../constants/kpiDefinitions';
import { buildSideDataset, SideDataset } from '../../../services/comparisonDataService';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { ComparisonFilters, selectComparison } from '../selectors/selectComparison';
import { getSideShortNames } from './comparisonDisplay';
import {
  buildKpiTableExport,
  EXPORT_EMPTY_TEXT,
  getKpiTableCsvFileName,
  getKpiTableExportHeaders,
  toKpiTableCsvData,
  toTsv,
} from './kpiTableExport';

// Export tests go through the comparison data service and selector, the same path the UI uses.
const ALL_KPIS: ComparisonFilters = { kpiFilter: COMPARISON_KPI_KEYS, needsAttentionOnly: false };
const allPriorYear = buildSideDataset([0], { optionId: 'prior_year' });
const allYtd = buildSideDataset([0], { optionId: 'ytd' });
const highYtd = buildSideDataset([104], { optionId: 'ytd' });
const allSy2223 = buildSideDataset([0], { optionId: 'sy2223' }); // no mock data before SY 2023–24

const COLUMN = {
  kpi: 0,
  leftActual: 1,
  leftTarget: 2,
  leftStatus: 3,
  rightActual: 4,
  rightTarget: 5,
  rightStatus: 6,
  change: 7,
  performance: 8,
  needsAttention: 9,
  reasons: 10,
  description: 11,
  siteDrivers: 12,
} as const;

function exportFor(left: SideDataset, right: SideDataset, filters: ComparisonFilters = ALL_KPIS) {
  const comparison = selectComparison(left, right, filters);
  const table = buildKpiTableExport({
    results: comparison.results,
    leftLabel: comparison.leftLabel,
    rightLabel: comparison.rightLabel,
    sideShortNames: getSideShortNames(left, right),
    siteDrivers: comparison.siteDrivers,
  });
  return { comparison, table };
}

const rowFor = (rows: string[][], kpi: ComparisonKpiKey) => {
  const kpiName = getKpiDefinition(kpi).name;
  const row = rows.find(r => r[COLUMN.kpi] === kpiName);
  if (!row) throw new Error(`No export row for ${kpiName}`);
  return row;
};

describe('buildKpiTableExport', () => {
  it('uses the generated labels in the side column headers', () => {
    const { table } = exportFor(allPriorYear, allYtd);
    expect(table.headers).toEqual([
      'KPI',
      'All Sites · SY 2024–25 Actual',
      'All Sites · SY 2024–25 Target',
      'All Sites · SY 2024–25 Target Status',
      'All Sites · SY 2025–26 Actual',
      'All Sites · SY 2025–26 Target',
      'All Sites · SY 2025–26 Target Status',
      'Change',
      'Performance',
      'Needs Attention',
      'Needs Attention Reasons',
      'Description',
      'Site Drivers',
    ]);
    expect(table.headers.join(' ')).not.toMatch(/\b(A|B|Baseline|Left|Right)\b/);
  });

  it('exports one row per KPI in scope, in display order, with every cell filled from the engine result', () => {
    const { comparison, table } = exportFor(allPriorYear, allYtd);
    expect(table.rows).toHaveLength(COMPARISON_KPI_KEYS.length);
    table.rows.forEach((row, index) => {
      const result = comparison.results[index];
      expect(row).toHaveLength(table.headers.length);
      expect(row[COLUMN.leftActual]).toBe(result.left.actualFormatted);
      expect(row[COLUMN.rightActual]).toBe(result.right.actualFormatted);
      expect(row[COLUMN.change]).toBe(result.deltaFormatted ?? EXPORT_EMPTY_TEXT);
      // The full description, classification prefix included (the engine gives informational KPIs none).
      expect(row[COLUMN.description]).toBe(result.description);
      if (result.kind === 'directional') expect(row[COLUMN.description].startsWith(`${row[COLUMN.performance]} — `)).toBe(true);
    });
  });

  it('exports only the KPI filter, in display order rather than filter order', () => {
    const { table } = exportFor(allPriorYear, allYtd, { kpiFilter: ['MPLH', 'Lunch'], needsAttentionOnly: false });
    expect(table.rows.map(r => r[COLUMN.kpi])).toEqual([getKpiDefinition('Lunch').name, getKpiDefinition('MPLH').name]);
  });

  it('exports only Needs Attention KPIs when the toggle is on, with their reasons', () => {
    const { comparison, table } = exportFor(allPriorYear, allYtd, { ...ALL_KPIS, needsAttentionOnly: true });
    expect(table.rows.length).toBeGreaterThan(0);
    expect(table.rows).toHaveLength(comparison.allResults.filter(r => r.needsAttention).length);
    for (const row of table.rows) {
      expect(row[COLUMN.needsAttention]).toBe('Yes');
      expect(row[COLUMN.reasons]).toMatch(/^(Declined|Below Target)( · Below Target)?$/);
    }
  });

  it('follows the current orientation after a swap', () => {
    const { table: original } = exportFor(allPriorYear, allYtd);
    const { table: swapped } = exportFor(allYtd, allPriorYear);
    expect(swapped.headers[COLUMN.leftActual]).toBe('All Sites · SY 2025–26 Actual');
    expect(swapped.headers[COLUMN.rightActual]).toBe('All Sites · SY 2024–25 Actual');

    const lunch = rowFor(original.rows, 'Lunch');
    const swappedLunch = rowFor(swapped.rows, 'Lunch');
    expect(swappedLunch.slice(COLUMN.leftActual, COLUMN.leftStatus + 1)).toEqual(lunch.slice(COLUMN.rightActual, COLUMN.rightStatus + 1));
    expect(swappedLunch.slice(COLUMN.rightActual, COLUMN.rightStatus + 1)).toEqual(lunch.slice(COLUMN.leftActual, COLUMN.leftStatus + 1));
    // The change is measured from the new left side, so its sign flips.
    expect(lunch[COLUMN.change]).not.toBe(swappedLunch[COLUMN.change]);
  });

  it('exports No Data as "No Data", never 0', () => {
    const { table } = exportFor(allSy2223, allYtd);
    for (const row of table.rows) {
      expect(row[COLUMN.leftActual]).toBe('No Data');
      expect(row[COLUMN.leftStatus]).toMatch(/^(No Data|Not evaluated)$/);
      expect(row[COLUMN.change]).toBe(EXPORT_EMPTY_TEXT);
      expect(row[COLUMN.performance]).toMatch(/^(No Data|Informational)$/);
      // No Data is never Declined; only the other side's own target can flag the row.
      expect(row[COLUMN.reasons]).not.toContain('Declined');
    }
    expect(table.rows.flat()).not.toContain('0');
  });

  it('exports a missing target as "—" with "No target" status, never a missed target', () => {
    const { table } = exportFor(allPriorYear, allYtd);
    // A La Carte has no benchmark configured (spec §9).
    const aLaCarte = rowFor(table.rows, 'A La Carte');
    expect(aLaCarte[COLUMN.leftTarget]).toBe(EXPORT_EMPTY_TEXT);
    expect(aLaCarte[COLUMN.rightTarget]).toBe(EXPORT_EMPTY_TEXT);
    expect(aLaCarte[COLUMN.leftStatus]).toBe('No target');
    expect(aLaCarte[COLUMN.rightStatus]).toBe('No target');
    expect(aLaCarte[COLUMN.reasons]).not.toContain('Below Target');
  });

  it('exports informational KPIs with context targets, no status, and no Needs Attention', () => {
    const { comparison, table } = exportFor(allPriorYear, allYtd);
    const informational = comparison.results.filter(r => r.kind === 'informational');
    expect(informational.length).toBeGreaterThan(0);
    for (const result of informational) {
      const row = table.rows[comparison.results.indexOf(result)];
      expect(row[COLUMN.performance]).toBe('Informational');
      expect(row[COLUMN.leftStatus]).toBe('Not evaluated');
      expect(row[COLUMN.rightStatus]).toBe('Not evaluated');
      expect(row[COLUMN.needsAttention]).toBe('No');
      expect(row[COLUMN.reasons]).toBe('');
      expect(row[COLUMN.leftTarget]).toBe(result.left.target === null ? EXPORT_EMPTY_TEXT : result.left.targetFormatted);
    }
    // Inventory Value never has a target.
    expect(rowFor(table.rows, 'Inventory Value')[COLUMN.rightTarget]).toBe(EXPORT_EMPTY_TEXT);
  });

  it('exports the Site Drivers summary text', () => {
    const { table } = exportFor(allPriorYear, allYtd);
    expect(rowFor(table.rows, 'Lunch')[COLUMN.siteDrivers]).toMatch(/sites meeting target$/);
  });

  it('leaves out the Site Drivers column when no side has more than one site', () => {
    const roosevelt = buildSideDataset([12], { optionId: 'prior_year' });
    const rooseveltYtd = buildSideDataset([12], { optionId: 'ytd' });
    const { table } = exportFor(roosevelt, rooseveltYtd);
    expect(table.headers).not.toContain('Site Drivers');
    expect(table.headers).toHaveLength(12);
    expect(table.rows.every(row => row.length === 12)).toBe(true);
  });

  it('names each side with its compact name when both sides have several sites, in full "meeting target" wording', () => {
    const middleYtd = buildSideDataset([105], { optionId: 'ytd' });
    const { table } = exportFor(highYtd, middleYtd);
    // The table cell uses the compact "meeting" lines; exports keep the full wording.
    expect(rowFor(table.rows, 'Lunch')[COLUMN.siteDrivers]).toMatch(/^High Schools: \d+ of \d+ meeting target; Middle Schools: \d+ of \d+ meeting target$/);
  });
});

describe('toTsv', () => {
  it('joins headers and rows with tabs and newlines, flattening tabs and line breaks inside cells', () => {
    const tsv = toTsv({ headers: ['KPI', 'Description'], rows: [['Lunch', 'Line one\nline\ttwo']] });
    expect(tsv).toBe('KPI\tDescription\nLunch\tLine one line two');
  });

  it('has one line per in-scope KPI plus the header', () => {
    const { table } = exportFor(allPriorYear, allYtd, { kpiFilter: ['Lunch', 'Breakfast'] as ComparisonKpiKey[], needsAttentionOnly: false });
    expect(toTsv(table).split('\n')).toHaveLength(3);
  });
});

describe('CSV data', () => {
  it('names the file Performance_Comparison_KPIs_<YYYY-MM-DD>.csv using the local date', () => {
    expect(getKpiTableCsvFileName(new Date(2026, 9, 4, 23, 30))).toBe('Performance_Comparison_KPIs_2026-10-04.csv');
  });

  it('dates the filename from the moment it is built, so building on click gives the download date', () => {
    const { table } = exportFor(allPriorYear, allYtd);
    expect(toKpiTableCsvData(table, new Date(2026, 9, 4, 23, 59)).fileName).toBe('Performance_Comparison_KPIs_2026-10-04.csv');
    expect(toKpiTableCsvData(table, new Date(2026, 9, 5, 0, 1)).fileName).toBe('Performance_Comparison_KPIs_2026-10-05.csv');
  });

  it('passes the export headers and rows to CSVRenderer unchanged', () => {
    const { table } = exportFor(allPriorYear, allYtd);
    const csv = toKpiTableCsvData(table, new Date(2026, 0, 5));
    expect(csv).toEqual({ fileName: 'Performance_Comparison_KPIs_2026-01-05.csv', headers: table.headers, rows: table.rows });
    expect(csv.headers).toEqual(getKpiTableExportHeaders('All Sites · SY 2024–25', 'All Sites · SY 2025–26'));
  });
});
