import { getKpiDefinition } from '../constants/kpiDefinitions';
import { BenchmarkRow, BenchmarkScope, ResolvedBenchmark } from '../types/comparisonDataTypes';
import { ComparisonKpiKey } from '../types/kpiTypes';
import { DASHBOARD_METRICS } from './mockDashData';
import { districtENPBenchmark } from './mockENPProgramData';
import { districtPNATarget } from './mockPNAData';
import { DEMO_SITES, getSiteById, SITE_TYPE_IDS, SiteScopeKind } from './siteRegistry';

/**
 * Performance Comparison benchmarks (NXT-77201 spec §3, §9).
 *
 * Rows: { kpi, schoolYear, scope: 'district' | 'siteType' | 'site', scopeId?, value | null }.
 *
 * Units:
 * - Sum KPIs (Revenue, Meals, MEQs, A La Carte, Reimbursement, Waste): `value` is a rate per
 *   site per serving day. The comparison service multiplies it by the side's elapsed
 *   site-serving-days, so targets work for any timeframe and scope (Phase 2 decision).
 * - All other KPIs: `value` is in the KPI's own units (%, MPLH, days).
 *
 * Precedence (spec §3), implemented by resolveBenchmark:
 * - Single site: site → site type → district → none
 * - Site-type selection: site type → district → none
 * - All Sites / Multiple Sites: district → none
 * Site benchmarks are never averaged.
 *
 * ─── BENCHMARK SCENARIOS (spec §9) ───────────────────────────────────────────
 * Search for "SCENARIO:" below.
 *  - District values seeded from existing constants (MPLH 18.5, PNA 10, ENP 5,
 *    DASHBOARD_METRICS.expected for Breakfast/Snack/Supper and Physical Inventory Discrepancy).
 *  - Site-type and site overrides that differ by school year.
 *  - Deliberately missing: Inventory Value (never), A La Carte (none configured), and
 *    Snack (missing only for SY 2024–25).
 *  - Inventory Turnover Rate has site benchmarks only ("Varies by site"), as context.
 *  - Explicit "no target": Hamilton High has no Lunch target for SY 2025–26 while the
 *    other high schools keep theirs (a mixed-target Site Drivers case).
 *
 * Explicit "no target" rows ({ value: null, noTarget: true }) stop the precedence chain.
 * A plain null row only means "not configured at this scope" and falls through.
 */

const SCHOOL_YEARS = [2023, 2024, 2025] as const;

/** Mirrors the hardcoded MPLH target in mockMPLHData.ts (not exported there). */
const DISTRICT_MPLH_TARGET = 18.5;

const rows: BenchmarkRow[] = [];

function addDistrict(kpi: ComparisonKpiKey, byYear: Record<number, number | null>) {
  for (const schoolYear of SCHOOL_YEARS) rows.push({ kpi, schoolYear, scope: 'district', value: byYear[schoolYear] ?? null });
}

/** DASHBOARD_METRICS stores percentages as fractions (0.20 = 20%). Rounded to avoid float residue. */
const fractionToPercent = (fraction: number): number => Math.round(fraction * 10000) / 100;

const allYears = (value: number): Record<number, number> => Object.fromEntries(SCHOOL_YEARS.map(y => [y, value]));

function addOverride(kpi: ComparisonKpiKey, scope: 'siteType' | 'site', scopeId: number, byYear: Record<number, number>) {
  for (const [schoolYear, value] of Object.entries(byYear)) rows.push({ kpi, schoolYear: Number(schoolYear), scope, scopeId, value });
}

// ─── District: ratio KPIs ────────────────────────────────────────────────────

// SCENARIO: seeded from existing constants. DASHBOARD_METRICS.expected stores these as
// fractions (0.20 = 20%). Lunch (0.02) and Eco Dis (0.10) are not plausible targets for
// those KPIs, so they use the spec's 60% Lunch example and a 52% Eco Dis target instead.
addDistrict('Breakfast', allYears(fractionToPercent(DASHBOARD_METRICS.breakfast.expected)));
addDistrict('Lunch', allYears(60));
// SCENARIO: a directional KPI missing only for SY 2024–25.
addDistrict('Snack', { 2023: fractionToPercent(DASHBOARD_METRICS.snack.expected), 2024: null, 2025: fractionToPercent(DASHBOARD_METRICS.snack.expected) });
addDistrict('Supper', allYears(fractionToPercent(DASHBOARD_METRICS.supper.expected)));
addDistrict('Eco Dis', allYears(52));
addDistrict('PNA', allYears(districtPNATarget));
addDistrict('ENP', allYears(districtENPBenchmark));
addDistrict('MPLH', allYears(DISTRICT_MPLH_TARGET));
// Context only (no Met/Not Met). DASHBOARD_METRICS.expected = 0, i.e. "≤ 0% of total inventory".
addDistrict('Physical Inventory Discrepancy', allYears(DASHBOARD_METRICS.physicalInventoryDiscrepancy.expected));

// SCENARIO: deliberately missing — Inventory Value never has a benchmark; A La Carte has none configured.

// ─── District: sum KPIs (rate per site per serving day) ─────────────────────

const DISTRICT_SUM_RATES: Partial<Record<ComparisonKpiKey, Record<number, number>>> = {
  Revenue: { 2023: 3050, 2024: 3200, 2025: 3200 },
  Meals: allYears(850),
  MEQs: { 2023: 900, 2024: 950, 2025: 975 },
  Reimbursement: allYears(1850),
  Waste: allYears(350),
};

for (const [kpi, byYear] of Object.entries(DISTRICT_SUM_RATES)) addDistrict(kpi as ComparisonKpiKey, byYear);

/**
 * Site-type sum rates = district rate × the type's typical size relative to the district
 * average site, so a High Schools target isn't compared against an average-sized site.
 */
const SITE_TYPE_SUM_SIZE_FACTORS: Record<number, Partial<Record<ComparisonKpiKey, number>>> = {
  [SITE_TYPE_IDS.elementary]: { Revenue: 0.6, Meals: 0.77, MEQs: 0.64, Reimbursement: 0.74, Waste: 0.77 },
  [SITE_TYPE_IDS.middle]: { Revenue: 0.92, Meals: 0.98, MEQs: 0.93, Reimbursement: 0.98, Waste: 0.99 },
  [SITE_TYPE_IDS.high]: { Revenue: 1.91, Meals: 1.63, MEQs: 1.86, Reimbursement: 1.69, Waste: 1.63 },
  [SITE_TYPE_IDS.centralOffice]: { Revenue: 0.045, Meals: 0.05, MEQs: 0.046, Reimbursement: 0.05, Waste: 0.05 },
  [SITE_TYPE_IDS.childCare]: { Revenue: 0.15, Meals: 0.24, MEQs: 0.17, Reimbursement: 0.19, Waste: 0.23 },
};

for (const [siteTypeId, factors] of Object.entries(SITE_TYPE_SUM_SIZE_FACTORS)) {
  for (const [kpi, factor] of Object.entries(factors)) {
    const districtRates = DISTRICT_SUM_RATES[kpi as ComparisonKpiKey] ?? {};
    const byYear = Object.fromEntries(Object.entries(districtRates).map(([y, rate]) => [y, Math.round(rate * factor)]));
    addOverride(kpi as ComparisonKpiKey, 'siteType', Number(siteTypeId), byYear);
  }
}

// ─── Site-type and site overrides that differ by school year ─────────────────

// SCENARIO: year-specific site-type overrides.
addOverride('Lunch', 'siteType', SITE_TYPE_IDS.high, { 2024: 60, 2025: 62 }); // spec §9 example
addOverride('Lunch', 'siteType', SITE_TYPE_IDS.elementary, { 2025: 65 });
addOverride('Breakfast', 'siteType', SITE_TYPE_IDS.elementary, { 2024: 30, 2025: 32 });
addOverride('MPLH', 'siteType', SITE_TYPE_IDS.high, { 2024: 17.5, 2025: 18 });

// SCENARIO: year-specific site overrides.
addOverride('Lunch', 'site', 12, { 2024: 55, 2025: 58 }); //          Roosevelt High
addOverride('Breakfast', 'site', 1, { 2025: 35 }); //                 Lincoln Elementary, SY 2025–26 only
addOverride('MPLH', 'site', 7, { 2023: 19, 2024: 19.5, 2025: 20 }); // Washington Middle
addOverride('Revenue', 'site', 12, { 2025: 6000 }); //                Roosevelt High, $ per serving day

// SCENARIO: explicit "no target" at site level. Hamilton High has NO Lunch target for
// SY 2025–26, while the other high schools keep theirs (Roosevelt's site value, the rest the
// High Schools 62%). Without this row Hamilton would fall back to the site-type 62%, so the
// row is an explicit stop, not a missing row. Shows a mixed-target case in Site Drivers
// (High Schools, Prior Year to Date vs Year to Date, Lunch): Hamilton shows "No target" and is
// left out of the "of N sites meeting target" count. SY 2024–25 is unaffected (60%).
rows.push({ kpi: 'Lunch', schoolYear: 2025, scope: 'site', scopeId: 14, value: null, noTarget: true }); // Hamilton High

// SCENARIO: Inventory Turnover Rate varies by site (context only, no district or type value).
const TURNOVER_DAYS_BY_TYPE: Record<number, number> = {
  [SITE_TYPE_IDS.elementary]: 14,
  [SITE_TYPE_IDS.middle]: 15,
  [SITE_TYPE_IDS.high]: 16,
  [SITE_TYPE_IDS.centralOffice]: 20,
  [SITE_TYPE_IDS.childCare]: 12,
};
for (const site of DEMO_SITES.siteList) {
  addOverride('Inventory Turnover Rate', 'site', site.siteId, allYears(TURNOVER_DAYS_BY_TYPE[site.siteTypeId]));
}

export const COMPARISON_BENCHMARKS: readonly BenchmarkRow[] = rows;

// ─── Resolution ──────────────────────────────────────────────────────────────

function findRow(
  benchmarks: readonly BenchmarkRow[],
  kpi: ComparisonKpiKey,
  schoolYear: number,
  scope: BenchmarkScope,
  scopeId?: number,
): BenchmarkRow | undefined {
  return benchmarks.find(
    b => b.kpi === kpi && b.schoolYear === schoolYear && b.scope === scope && (scope === 'district' || b.scopeId === scopeId),
  );
}

/**
 * The benchmark for a side (spec §3 precedence). Returns the first configured value in
 * the precedence chain and which scope it came from, or { value: null, source: null }.
 * An explicit "no target" row ({ value: null, noTarget: true }) stops the chain and resolves
 * to { value: null, source: <its scope> }; a plain null row falls through to the next scope.
 * KPIs with targetPolicy 'none' (Inventory Value) always resolve to null.
 */
export function resolveBenchmark(
  kpi: ComparisonKpiKey,
  siteIds: number[],
  scopeType: SiteScopeKind,
  schoolYear: number,
  benchmarks: readonly BenchmarkRow[] = COMPARISON_BENCHMARKS,
): ResolvedBenchmark {
  const none: ResolvedBenchmark = { value: null, source: null };
  if (getKpiDefinition(kpi).targetPolicy === 'none' || siteIds.length === 0) return none;

  const chain: Array<{ scope: BenchmarkScope; scopeId?: number }> = [];
  const firstSite = getSiteById(siteIds[0]);
  if (scopeType === 'site' && firstSite) chain.push({ scope: 'site', scopeId: firstSite.siteId });
  if ((scopeType === 'site' || scopeType === 'siteType') && firstSite) chain.push({ scope: 'siteType', scopeId: firstSite.siteTypeId });
  chain.push({ scope: 'district' });

  for (const { scope, scopeId } of chain) {
    const row = findRow(benchmarks, kpi, schoolYear, scope, scopeId);
    if (row?.noTarget) return { value: null, source: scope };
    if (row && row.value !== null) return { value: row.value, source: scope };
  }
  return none;
}
