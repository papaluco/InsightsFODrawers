import { describe, expect, it } from 'vitest';
import { COMPARISON_KPI_KEYS } from '../../../constants/kpiDefinitions';
import { buildSideDataset } from '../../../services/comparisonDataService';
import { compareKpi } from '../engine/compareKpi';
import { buildKpiComparisonInput, selectComparison } from './selectComparison';

// Selector tests use the comparison data service (the same path the UI uses).
const ALL_KPIS = { kpiFilter: COMPARISON_KPI_KEYS, needsAttentionOnly: false };
const priorYear = buildSideDataset([0], { optionId: 'prior_year' });
const ytd = buildSideDataset([0], { optionId: 'ytd' });
const pytd = buildSideDataset([0], { optionId: 'prior_ytd' });
const highYtd = buildSideDataset([104], { optionId: 'ytd' });
const highPytd = buildSideDataset([104], { optionId: 'prior_ytd' });

describe('selectComparison', () => {
  const comparison = selectComparison(priorYear, ytd, ALL_KPIS);

  it('returns one engine result per KPI in spec order, labeled by the generated labels', () => {
    expect(comparison.leftLabel).toBe('All Sites · SY 2024–25');
    expect(comparison.rightLabel).toBe('All Sites · SY 2025–26');
    expect(comparison.allResults.map(r => r.kpi)).toEqual([...COMPARISON_KPI_KEYS]);
    expect(comparison.results).toEqual(comparison.allResults);
  });

  it('uses exactly the engine output for each KPI', () => {
    expect(comparison.resultsByKpi.Lunch).toEqual(compareKpi(buildKpiComparisonInput('Lunch', priorYear, ytd)));
  });

  it('passes timeframes so sum KPIs carry the material partial note', () => {
    expect(comparison.resultsByKpi.Revenue.partialNote).toBe('All Sites · SY 2025–26 includes data through April 16, 2026.');
    expect(comparison.resultsByKpi.Lunch.partialNote).toBeNull(); // ratio KPI
    expect(selectComparison(pytd, ytd, ALL_KPIS).resultsByKpi.Revenue.partialNote).toBeNull(); // like-for-like
  });

  it('applies the KPI filter without changing results', () => {
    const filtered = selectComparison(priorYear, ytd, { kpiFilter: ['MPLH', 'Lunch'], needsAttentionOnly: false });
    expect(filtered.results.map(r => r.kpi)).toEqual(['Lunch', 'MPLH']); // spec order, not filter order
    expect(filtered.resultsByKpi.Revenue).toEqual(comparison.resultsByKpi.Revenue);
  });

  it('applies the Needs Attention toggle', () => {
    const attention = selectComparison(priorYear, ytd, { ...ALL_KPIS, needsAttentionOnly: true });
    expect(attention.results.length).toBeGreaterThan(0);
    expect(attention.results.every(r => r.needsAttention)).toBe(true);
    expect(attention.results.length).toBe(comparison.allResults.filter(r => r.needsAttention).length);
  });

  it('summarizes directional KPIs in scope, excluding informational and baseline-zero results', () => {
    const { summary } = comparison;
    const directional = comparison.results.filter(r => r.kind === 'directional');
    expect(summary.improved + summary.comparable + summary.declined + summary.noData + summary.relativeNotApplicable).toBe(directional.length);
    expect(summary.left.label).toBe('All Sites · SY 2024–25');
    expect(summary.right.kpisWithTarget).toBe(directional.filter(r => r.right.targetStatus !== 'NotAvailable').length);
  });

  it('counts only KPIs in scope', () => {
    const lunchOnly = selectComparison(priorYear, ytd, { kpiFilter: ['Lunch'], needsAttentionOnly: false });
    expect(lunchOnly.summary).toMatchObject({ improved: 0, comparable: 1, declined: 0 });
    expect(lunchOnly.summary.right).toMatchObject({ meetingTarget: 1, kpisWithTarget: 1 });
  });

  it('swapping the datasets recalculates everything from the other side', () => {
    const swapped = selectComparison(ytd, priorYear, ALL_KPIS);
    expect(swapped.leftLabel).toBe(comparison.rightLabel);
    expect(swapped.resultsByKpi.Breakfast.classification).toBe('Declined');
    expect(swapped.resultsByKpi.Breakfast.delta).toBeCloseTo(-(comparison.resultsByKpi.Breakfast.delta ?? 0), 10);
  });
});

describe('site drivers through the selector', () => {
  it('All Sites vs All Sites is a matched population', () => {
    const drivers = selectComparison(pytd, ytd, ALL_KPIS).siteDrivers.Lunch;
    expect(drivers).toMatchObject({ available: true, matched: true });
    expect(drivers.matchedSites).toHaveLength(18);
  });

  it('each site uses its own resolved target', () => {
    const drivers = selectComparison(highPytd, highYtd, ALL_KPIS).siteDrivers.Lunch;
    const roosevelt = drivers.right.sites.find(s => s.siteId === 12);
    const madison = drivers.right.sites.find(s => s.siteId === 13);
    expect(roosevelt?.target).toBe(58); // Roosevelt High site override
    expect(madison?.target).toBe(62); //   High School type
  });

  it('different scopes are unmatched', () => {
    const drivers = selectComparison(highPytd, ytd, ALL_KPIS).siteDrivers.Lunch;
    expect(drivers).toMatchObject({ matched: false, matchedSites: null });
    expect(drivers.left.sites).toHaveLength(5);
    expect(drivers.right.sites).toHaveLength(18);
  });

  it('SCENARIO: Kennedy Middle is one-sided No Data in SY 2023–24 vs SY 2024–25', () => {
    const sy2324 = buildSideDataset([0], { optionId: 'sy2324' });
    const kennedy = selectComparison(sy2324, priorYear, ALL_KPIS).siteDrivers.Lunch.matchedSites?.find(s => s.siteId === 11);
    expect(kennedy?.result.classification).toBe('NoData');
    expect(kennedy?.result.description).toContain('Kennedy Middle · SY 2023–24');
  });

  it('SCENARIO: Little Learners A La Carte is RelativeNotApplicable (zero baseline)', () => {
    const littleLearners = selectComparison(priorYear, ytd, ALL_KPIS).siteDrivers['A La Carte'].matchedSites?.find(s => s.siteId === 18);
    expect(littleLearners?.result.classification).toBe('RelativeNotApplicable');
  });

  it('SCENARIO: the engine returns RelativeNotApplicable for the real Little Learners mock data (spec §5.4)', () => {
    const left = buildSideDataset([18], { optionId: 'prior_year' });
    const right = buildSideDataset([18], { optionId: 'ytd' });
    const result = compareKpi(buildKpiComparisonInput('A La Carte', left, right));
    expect(left.kpis['A La Carte'].actual).toBe(0);
    expect(result.classification).toBe('RelativeNotApplicable');
    expect(result.relativeChange).toBeNull();
    expect(result.delta).toBeGreaterThan(0);
    // Absolute change only: no relative % and never ∞.
    expect(result.deltaFormatted).toMatch(/^\+\$[\d,]+$/);
    // Excluded from the Summary's counts.
    const summary = selectComparison(left, right, ALL_KPIS).summary;
    expect(summary.relativeNotApplicable).toBeGreaterThanOrEqual(1);
  });

  it('flags Site Drivers as available only when a side has more than one site (spec §8)', () => {
    expect(selectComparison(priorYear, ytd, ALL_KPIS).siteDriversAvailable).toBe(true);
    const roosevelt = buildSideDataset([12], { optionId: 'prior_year' });
    const lincoln = buildSideDataset([1], { optionId: 'prior_year' });
    expect(selectComparison(roosevelt, lincoln, ALL_KPIS).siteDriversAvailable).toBe(false);
    expect(selectComparison(roosevelt, highYtd, ALL_KPIS).siteDriversAvailable).toBe(true);
  });
});
