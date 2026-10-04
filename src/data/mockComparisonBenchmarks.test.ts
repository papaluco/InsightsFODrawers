import { describe, expect, it } from 'vitest';
import { BenchmarkRow } from '../types/comparisonDataTypes';
import { COMPARISON_BENCHMARKS, resolveBenchmark } from './mockComparisonBenchmarks';
import { resolveSiteScope, SITE_TYPE_IDS } from './siteRegistry';

const ROOSEVELT_HIGH = 12;
const MADISON_HIGH = 13;
const LINCOLN_ELEMENTARY = 1;
const HIGH_SCHOOLS = resolveSiteScope([SITE_TYPE_IDS.high]);
const ALL_SITES = resolveSiteScope([0]);

describe('resolveBenchmark precedence (spec §3)', () => {
  // A small table so each rule is isolated from the demo values.
  const table: BenchmarkRow[] = [
    { kpi: 'Lunch', schoolYear: 2025, scope: 'district', value: 60 },
    { kpi: 'Lunch', schoolYear: 2025, scope: 'siteType', scopeId: SITE_TYPE_IDS.high, value: 62 },
    { kpi: 'Lunch', schoolYear: 2025, scope: 'site', scopeId: ROOSEVELT_HIGH, value: 58 },
    { kpi: 'Breakfast', schoolYear: 2025, scope: 'siteType', scopeId: SITE_TYPE_IDS.high, value: null },
    { kpi: 'Breakfast', schoolYear: 2025, scope: 'district', value: 20 },
  ];
  const resolve = (siteIds: number[], scopeType: Parameters<typeof resolveBenchmark>[2], kpi: 'Lunch' | 'Breakfast' = 'Lunch') =>
    resolveBenchmark(kpi, siteIds, scopeType, 2025, table);

  it('single site: uses the site benchmark first', () => {
    expect(resolve([ROOSEVELT_HIGH], 'site')).toEqual({ value: 58, source: 'site' });
  });

  it('single site: falls back to its site type, then the district', () => {
    expect(resolve([MADISON_HIGH], 'site')).toEqual({ value: 62, source: 'siteType' });
    expect(resolve([LINCOLN_ELEMENTARY], 'site')).toEqual({ value: 60, source: 'district' });
  });

  it('site type: uses the type benchmark, ignoring member site benchmarks', () => {
    expect(resolve(HIGH_SCHOOLS, 'siteType')).toEqual({ value: 62, source: 'siteType' });
  });

  it('all sites and multiple sites: district only — never a site or type value, never an average', () => {
    expect(resolve(ALL_SITES, 'allSites')).toEqual({ value: 60, source: 'district' });
    expect(resolve([ROOSEVELT_HIGH, MADISON_HIGH], 'multipleSites')).toEqual({ value: 60, source: 'district' });
  });

  it('a null row falls through to the next scope', () => {
    expect(resolve(HIGH_SCHOOLS, 'siteType', 'Breakfast')).toEqual({ value: 20, source: 'district' });
  });

  it('returns null when nothing is configured', () => {
    expect(resolveBenchmark('Lunch', [ROOSEVELT_HIGH], 'site', 2024, table)).toEqual({ value: null, source: null });
    expect(resolveBenchmark('Lunch', [], 'site', 2025, table)).toEqual({ value: null, source: null });
  });
});

describe('demo benchmark table (spec §9)', () => {
  it('seeds district values from existing constants', () => {
    expect(resolveBenchmark('MPLH', ALL_SITES, 'allSites', 2025).value).toBe(18.5);
    expect(resolveBenchmark('PNA', ALL_SITES, 'allSites', 2025).value).toBe(10);
    expect(resolveBenchmark('ENP', ALL_SITES, 'allSites', 2025).value).toBe(5);
    expect(resolveBenchmark('Breakfast', ALL_SITES, 'allSites', 2025).value).toBe(20);
    expect(resolveBenchmark('Supper', ALL_SITES, 'allSites', 2025).value).toBe(10);
  });

  it('has site-type overrides that differ by school year (High Schools Lunch 60% → 62%)', () => {
    expect(resolveBenchmark('Lunch', HIGH_SCHOOLS, 'siteType', 2024)).toEqual({ value: 60, source: 'siteType' });
    expect(resolveBenchmark('Lunch', HIGH_SCHOOLS, 'siteType', 2025)).toEqual({ value: 62, source: 'siteType' });
  });

  it('has site overrides that differ by school year', () => {
    expect(resolveBenchmark('Lunch', [ROOSEVELT_HIGH], 'site', 2024).value).toBe(55);
    expect(resolveBenchmark('Lunch', [ROOSEVELT_HIGH], 'site', 2025).value).toBe(58);
    expect(resolveBenchmark('Breakfast', [LINCOLN_ELEMENTARY], 'site', 2024)).toEqual({ value: 30, source: 'siteType' });
    expect(resolveBenchmark('Breakfast', [LINCOLN_ELEMENTARY], 'site', 2025)).toEqual({ value: 35, source: 'site' });
  });

  it('SCENARIO: Inventory Value never has a benchmark', () => {
    for (const year of [2023, 2024, 2025]) {
      expect(resolveBenchmark('Inventory Value', ALL_SITES, 'allSites', year).value).toBeNull();
      expect(resolveBenchmark('Inventory Value', [ROOSEVELT_HIGH], 'site', year).value).toBeNull();
    }
    expect(COMPARISON_BENCHMARKS.some(b => b.kpi === 'Inventory Value')).toBe(false);
  });

  it('SCENARIO: A La Carte has no benchmark configured', () => {
    expect(COMPARISON_BENCHMARKS.some(b => b.kpi === 'A La Carte')).toBe(false);
    expect(resolveBenchmark('A La Carte', [ROOSEVELT_HIGH], 'site', 2025).value).toBeNull();
  });

  it('SCENARIO: Snack is missing only for SY 2024–25', () => {
    expect(resolveBenchmark('Snack', ALL_SITES, 'allSites', 2023).value).toBe(10);
    expect(resolveBenchmark('Snack', ALL_SITES, 'allSites', 2024).value).toBeNull();
    expect(resolveBenchmark('Snack', ALL_SITES, 'allSites', 2025).value).toBe(10);
    expect(resolveBenchmark('Snack', [ROOSEVELT_HIGH], 'site', 2024).value).toBeNull();
  });

  it('SCENARIO: Inventory Turnover Rate has site benchmarks only', () => {
    expect(resolveBenchmark('Inventory Turnover Rate', [ROOSEVELT_HIGH], 'site', 2025)).toEqual({ value: 16, source: 'site' });
    expect(resolveBenchmark('Inventory Turnover Rate', HIGH_SCHOOLS, 'siteType', 2025).value).toBeNull();
    expect(resolveBenchmark('Inventory Turnover Rate', ALL_SITES, 'allSites', 2025).value).toBeNull();
  });

  it('sum KPIs use per-site-per-day rates, scaled by type size', () => {
    expect(resolveBenchmark('Revenue', ALL_SITES, 'allSites', 2025)).toEqual({ value: 3200, source: 'district' });
    expect(resolveBenchmark('Revenue', HIGH_SCHOOLS, 'siteType', 2025)).toEqual({ value: Math.round(3200 * 1.91), source: 'siteType' });
    expect(resolveBenchmark('Revenue', [ROOSEVELT_HIGH], 'site', 2025)).toEqual({ value: 6000, source: 'site' });
  });

  it('has no benchmarks for school years without data', () => {
    expect(resolveBenchmark('Lunch', ALL_SITES, 'allSites', 2022).value).toBeNull();
  });
});
