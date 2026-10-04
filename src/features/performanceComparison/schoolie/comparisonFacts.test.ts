import { describe, expect, it } from 'vitest';
import { COMPARISON_KPI_KEYS, getKpiDefinition } from '../../../constants/kpiDefinitions';
import { buildSideDataset, SideDataset } from '../../../services/comparisonDataService';
import { getPeriodLengthNotice } from '../../../utils/timeframes';
import { ComparisonFilters, selectComparison } from '../selectors/selectComparison';
import { buildComparisonFacts, ORIENTATION_RULES } from './comparisonFacts';

const ALL_KPIS: ComparisonFilters = { kpiFilter: COMPARISON_KPI_KEYS, needsAttentionOnly: false };

function facts(from: SideDataset, to: SideDataset, filters: ComparisonFilters = ALL_KPIS) {
  return buildComparisonFacts({
    from,
    to,
    results: selectComparison(from, to, filters),
    filters,
    periodLengthNotice: getPeriodLengthNotice(from.timeframe, to.timeframe),
    totalKpiCount: COMPARISON_KPI_KEYS.length,
  });
}

const allPriorYear = buildSideDataset([0], { optionId: 'prior_year' });
const allYtd = buildSideDataset([0], { optionId: 'ytd' });
const allPytd = buildSideDataset([0], { optionId: 'prior_ytd' });
const highYtd = buildSideDataset([104], { optionId: 'ytd' });

describe('buildComparisonFacts (NXT-77214 §11)', () => {
  it('states the orientation rules and names both sides by generated label', () => {
    const payload = facts(allPytd, allYtd);
    expect(payload.orientation).toEqual({ from: allPytd.label, to: allYtd.label, rules: ORIENTATION_RULES });
    expect(payload.sides.from.label).toBe(allPytd.label);
    expect(payload.sides.to.label).toBe(allYtd.label);
    expect(payload.sides.to.partial).toEqual({ isPartial: true, throughDate: '2026-04-16' });
    expect(payload.sides.from.partial.isPartial).toBe(false);
  });

  it('excludes filtered-out KPIs', () => {
    const payload = facts(allPytd, allYtd, { kpiFilter: ['Lunch', 'MPLH', 'Revenue'], needsAttentionOnly: false });
    expect(payload.kpis.map(k => k.kpi)).toEqual(['Lunch', 'MPLH', 'Revenue']);
    expect(payload.filters.allKpisSelected).toBe(false);
    expect(payload.filters.kpiFilter).toEqual(['Lunch', getKpiDefinition('MPLH').name, 'Revenue']);
  });

  it('excludes KPIs that do not need attention when Needs Attention is on', () => {
    const all = facts(allPytd, allYtd);
    const attention = facts(allPytd, allYtd, { ...ALL_KPIS, needsAttentionOnly: true });
    expect(attention.filters.needsAttentionOnly).toBe(true);
    expect(attention.kpis.length).toBeGreaterThan(0);
    expect(attention.kpis.every(k => k.needsAttention)).toBe(true);
    expect(attention.kpis.map(k => k.kpi)).toEqual(all.kpis.filter(k => k.needsAttention).map(k => k.kpi));
  });

  it('copies engine results without recalculating them', () => {
    const results = selectComparison(allPytd, allYtd, ALL_KPIS);
    const lunch = facts(allPytd, allYtd).kpis.find(k => k.kpi === 'Lunch');
    const engine = results.resultsByKpi.Lunch;
    expect(lunch).toMatchObject({
      delta: engine.delta,
      deltaFormatted: engine.deltaFormatted,
      classification: engine.classification,
      targetTransition: engine.targetTransition,
      needsAttention: engine.needsAttention,
      needsAttentionReasons: engine.needsAttentionReasons,
      description: engine.description,
      informational: false,
    });
    expect(lunch?.from.actual).toBe(engine.left.actual);
    expect(lunch?.to.targetStatus).toBe(engine.right.targetStatus);
  });

  it('follows orientation after a swap', () => {
    const forward = facts(allPytd, allYtd);
    const swapped = facts(allYtd, allPytd);
    expect(swapped.orientation.from).toBe(forward.orientation.to);
    expect(swapped.orientation.to).toBe(forward.orientation.from);
    expect(swapped.sides.from).toEqual(forward.sides.to);
    for (const kpi of forward.kpis) {
      const other = swapped.kpis.find(k => k.kpi === kpi.kpi);
      expect(other?.from).toEqual(kpi.to);
      expect(other?.to).toEqual(kpi.from);
      if (kpi.delta !== null) expect(other?.delta).toBeCloseTo(-kpi.delta, 6);
    }
  });

  it('includes the period-length notice only when it applies', () => {
    expect(facts(allPriorYear, allYtd).periodLengthNotice).not.toBeNull();
    expect(facts(allPytd, allYtd).periodLengthNotice).toBeNull();
  });

  it('includes Site Drivers summaries and up to 3 sites outside target for KPIs that need attention', () => {
    const payload = facts(allPriorYear, allYtd);
    for (const kpi of payload.kpis) {
      expect(kpi.siteDrivers).not.toBeNull();
      const sites = kpi.siteDrivers?.topSitesOutsideTarget ?? [];
      expect(sites.length).toBeLessThanOrEqual(3);
      if (!kpi.needsAttention) expect(sites).toEqual([]);
    }
    expect(payload.kpis.some(k => (k.siteDrivers?.topSitesOutsideTarget.length ?? 0) > 0)).toBe(true);
    // Single site on both sides: Site Drivers doesn't apply.
    const single = facts(buildSideDataset([1], { optionId: 'prior_ytd' }), buildSideDataset([1], { optionId: 'ytd' }));
    expect(single.kpis.every(k => k.siteDrivers === null)).toBe(true);
  });

  it('never uses A/B, left/right, or baseline in user-facing text', () => {
    const text = JSON.stringify(facts(allPriorYear, highYtd).kpis.map(k => [k.description, k.siteDrivers?.summary]));
    expect(text).not.toMatch(/\b(left|right|baseline|Side A|Side B)\b/i);
  });
});
