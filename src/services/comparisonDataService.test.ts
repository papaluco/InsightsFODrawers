import { describe, expect, it } from 'vitest';
import { COMPARISON_KPI_KEYS, getKpiDefinition } from '../constants/kpiDefinitions';
import { getComparisonMockData } from '../data/mockComparisonData';
import { resolveSiteScope, SITE_TYPE_IDS } from '../data/siteRegistry';
import { getDayAlignment } from '../features/performanceComparison/trend/trendRules';
import { ComparisonKpiKey } from '../types/kpiTypes';
import { buildSideDataset, comparisonIsServingDay, getSideDataset } from './comparisonDataService';

const ALL = [0];
const HIGH = [SITE_TYPE_IDS.high];
const KENNEDY_MIDDLE = 11;
const LINCOLN_ELEMENTARY = 1;
const ROOSEVELT_HIGH = 12;
const LITTLE_LEARNERS = 18;

const prior = buildSideDataset(ALL, { optionId: 'prior_year' }); //  SY 2024–25
const current = buildSideDataset(ALL, { optionId: 'ytd' }); //       SY 2025–26 (partial)

/**
 * Minimal classification used only to check the mock scenarios. The real rules engine
 * (Phase 3) owns classification; this mirrors spec §5.4–5.5 materiality and direction.
 */
function classify(kpi: ComparisonKpiKey, left: number, right: number): 'Improved' | 'Comparable' | 'Declined' | 'Informational' {
  const def = getKpiDefinition(kpi);
  if (def.kind === 'informational') return 'Informational';
  const delta = right - left;
  const magnitude = def.materiality.method === 'percentagePoints' ? Math.abs(delta) : Math.abs(delta / left);
  if (Number(magnitude.toFixed(4)) < (def.materiality.threshold ?? 0)) return 'Comparable';
  const increased = delta > 0;
  return increased === (def.favorableDirection === 'higher') ? 'Improved' : 'Declined';
}

describe('getSideDataset contract', () => {
  it('returns the generated label, scope, and timeframe', async () => {
    const side = await getSideDataset(HIGH, { optionId: 'ytd' });
    expect(side.label).toBe('High Schools · SY 2025–26');
    expect(side.siteLabel).toBe('High Schools');
    expect(side.timeframeLabel).toBe('SY 2025–26');
    expect(side.scopeType).toBe('siteType');
    expect(side.siteIds).toEqual(resolveSiteScope(HIGH));
  });

  it('returns all 17 KPIs and per-site values for every site in scope', () => {
    expect(Object.keys(current.kpis).sort()).toEqual([...COMPARISON_KPI_KEYS].sort());
    expect(Object.keys(current.sites).map(Number)).toEqual(current.siteIds);
    expect(Object.keys(current.sites[1]).sort()).toEqual([...COMPARISON_KPI_KEYS].sort());
  });

  it('rejects an empty site selection', () => {
    expect(() => buildSideDataset([], { optionId: 'ytd' })).toThrow();
  });

  it('exposes the serving-day rule for trend compatibility', () => {
    expect(comparisonIsServingDay('2026-03-17')).toBe(false); // spring break
    expect(comparisonIsServingDay('2026-04-16')).toBe(true);
  });
});

describe('aggregation through the service', () => {
  it('district ratio KPIs are ratio of sums over all sites, not the average of site values', () => {
    const { dailyFacts } = getComparisonMockData();
    const rows = dailyFacts.filter(f => f.date >= '2024-07-01' && f.date <= '2025-06-30');
    const expected = (rows.reduce((t, r) => t + r.lunchMeals, 0) / rows.reduce((t, r) => t + r.enrollment, 0)) * 100;
    expect(prior.kpis.Lunch.actual).toBeCloseTo(expected, 10);

    const siteValues = Object.values(prior.sites).map(s => s.Lunch.actual).filter((v): v is number => v !== null);
    const averageOfSites = siteValues.reduce((t, v) => t + v, 0) / siteValues.length;
    expect(Math.abs((prior.kpis.Lunch.actual ?? 0) - averageOfSites)).toBeGreaterThan(1);
  });

  it('sum KPIs equal the sum of the per-site values', () => {
    const siteTotal = Object.values(prior.sites).reduce((t, s) => t + (s.Revenue.actual ?? 0), 0);
    expect(prior.kpis.Revenue.actual).toBeCloseTo(siteTotal, 6);
  });

  it('keeps every percentage realistic (≤ 100%)', () => {
    const percentKpis = COMPARISON_KPI_KEYS.filter(k => getKpiDefinition(k).displayFormat === 'percent');
    for (const side of [prior, current]) {
      for (const values of [side.kpis, ...Object.values(side.sites)]) {
        for (const kpi of percentKpis) {
          const actual = values[kpi].actual;
          if (actual !== null) expect(actual).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});

describe('No Data vs zero', () => {
  it('a school year without data returns null actuals and targets, never 0', () => {
    const empty = buildSideDataset(ALL, { optionId: 'sy2223' });
    for (const kpi of COMPARISON_KPI_KEYS) {
      expect(empty.kpis[kpi].actual).toBeNull();
      expect(empty.kpis[kpi].target).toBeNull();
    }
  });

  it('SCENARIO: Lincoln Elementary Supper is a real 0, not No Data', () => {
    expect(prior.sites[LINCOLN_ELEMENTARY].Supper.actual).toBe(0);
  });

  it('SCENARIO: Little Learners has a $0 à la carte baseline, then sales', () => {
    expect(prior.sites[LITTLE_LEARNERS]['A La Carte'].actual).toBe(0);
    expect(current.sites[LITTLE_LEARNERS]['A La Carte'].actual).toBeGreaterThan(0);
  });

  it('inventory has No Data when no month-end count falls in the period', () => {
    const thisMonth = buildSideDataset(ALL, { optionId: 'this_month' }); // April 2026, counted Apr 30
    expect(thisMonth.kpis['Inventory Value'].actual).toBeNull();
    expect(thisMonth.kpis.Lunch.actual).not.toBeNull();
  });
});

describe('mid-year opening site', () => {
  it('SCENARIO: Kennedy Middle is No Data in SY 2023–24 while the district has data', () => {
    const sy2324 = buildSideDataset(ALL, { optionId: 'sy2324' });
    expect(sy2324.sites[KENNEDY_MIDDLE].Lunch.actual).toBeNull();
    expect(sy2324.sites[KENNEDY_MIDDLE].Revenue.actual).toBeNull();
    expect(sy2324.sites[KENNEDY_MIDDLE].Revenue.target).toBeNull(); // no serving days → no sum target
    expect(sy2324.kpis.Lunch.actual).not.toBeNull();
  });

  it('has data from its opening in SY 2024–25', () => {
    expect(prior.sites[KENNEDY_MIDDLE].Lunch.actual).not.toBeNull();
    const kennedySy2425 = buildSideDataset([KENNEDY_MIDDLE], { optionId: 'custom', customRange: { start: '2024-07-01', end: '2025-01-03' } });
    expect(kennedySy2425.kpis.Lunch.actual).toBeNull();
  });
});

describe('partial SY 2025–26', () => {
  it('is partial through DEMO_AS_OF_DATE', () => {
    expect(current.timeframe).toMatchObject({ start: '2025-07-01', end: '2026-06-30', isPartial: true, throughDate: '2026-04-16' });
    expect(prior.timeframe.isPartial).toBe(false);
  });

  it('series stop at the through date with no future buckets', () => {
    const months = current.series('Lunch', 'month');
    expect(months).toHaveLength(10); // Jul – Apr
    expect(months[9]).toMatchObject({ position: 10, end: '2026-04-16' });
    expect(months[9].actual).not.toBeNull();
  });

  it('a month with no serving days is No Data, not 0', () => {
    const months = current.series('Revenue', 'month');
    expect(months[0]).toMatchObject({ position: 1, start: '2025-07-01', actual: null }); // summer
    expect(months[1].actual).toBeGreaterThan(0);
  });

  it('sum targets scale with elapsed site-serving-days, so partial years get a proportional target', () => {
    const { dailyFacts } = getComparisonMockData();
    const siteDays = dailyFacts.filter(f => f.date >= '2025-07-01' && f.date <= '2026-04-16').length;
    expect(current.kpis.Revenue.target).toBe(3200 * siteDays);
  });
});

describe('targets', () => {
  it('ratio targets come straight from the resolved benchmark', () => {
    expect(current.kpis.Lunch.target).toBe(60);
    expect(buildSideDataset(HIGH, { optionId: 'ytd' }).kpis.Lunch.target).toBe(62);
    expect(buildSideDataset(HIGH, { optionId: 'prior_year' }).kpis.Lunch.target).toBe(60);
  });

  it('each site uses its own resolved target (Site Drivers)', () => {
    const high = buildSideDataset(HIGH, { optionId: 'ytd' });
    expect(high.sites[ROOSEVELT_HIGH].Lunch.target).toBe(58); // site override
    expect(high.sites[13].Lunch.target).toBe(62); //            falls back to High School type
  });

  it('missing benchmarks are null', () => {
    expect(prior.kpis.Snack.target).toBeNull(); // missing only for SY 2024–25
    expect(current.kpis.Snack.target).toBe(10);
    expect(current.kpis['A La Carte'].target).toBeNull();
    expect(current.kpis['Inventory Value'].target).toBeNull();
  });

  it('Physical Inventory Discrepancy returns % with the $ amount alongside', () => {
    const pid = current.kpis['Physical Inventory Discrepancy'];
    expect(pid.actual).toBeGreaterThan(0);
    expect(pid.secondaryActual).toBeGreaterThan(0);
  });
});

describe('school breaks in series', () => {
  it('Day buckets skip spring break', () => {
    const march = buildSideDataset(ALL, { optionId: 'last_month' }); // March 2026; spring break Mar 16–20
    const days = march.series('Lunch', 'day');
    expect(days.some(d => d.start >= '2026-03-16' && d.start <= '2026-03-20')).toBe(false);
    expect(days).toHaveLength(17); // 22 weekdays − 5 break days
    expect(days.every(d => d.actual !== null)).toBe(true);
  });

  it('week vs week Day series align by weekday', () => {
    const left = buildSideDataset(ALL, { optionId: 'last_week' });
    const right = buildSideDataset(ALL, { optionId: 'this_week' });
    const dayAlignment = getDayAlignment(left.timeframe, right.timeframe);
    expect(right.series('Meals', 'day', { dayAlignment }).map(p => p.positionLabel)).toEqual(['Mon', 'Tue', 'Wed', 'Thu']);
  });
});

describe('SCENARIO: district SY 2024–25 vs SY 2025–26 produces every classification', () => {
  const results = Object.fromEntries(
    COMPARISON_KPI_KEYS.map(kpi => {
      const left = prior.kpis[kpi].actual;
      const right = current.kpis[kpi].actual;
      return [kpi, left === null || right === null ? 'NoData' : classify(kpi, left, right)];
    }),
  ) as Record<ComparisonKpiKey, string>;

  it('has Improved, Comparable, and Declined KPIs', () => {
    const outcomes = new Set(Object.values(results));
    expect(outcomes).toContain('Improved');
    expect(outcomes).toContain('Comparable');
    expect(outcomes).toContain('Declined');
  });

  it('matches the designed ratio-KPI scenarios', () => {
    expect(results).toMatchObject({
      Breakfast: 'Improved',
      Lunch: 'Comparable',
      Snack: 'Comparable',
      Supper: 'Declined',
      'Eco Dis': 'Comparable',
      PNA: 'Improved',
      ENP: 'Declined',
      MPLH: 'Declined',
    });
  });

  it('Snack changes by just under the 0.5 pt threshold', () => {
    const delta = (current.kpis.Snack.actual ?? 0) - (prior.kpis.Snack.actual ?? 0);
    expect(delta).toBeGreaterThan(0.3);
    expect(delta).toBeLessThan(0.5);
  });

  it('Lunch crosses its 60% target while staying Comparable', () => {
    expect(prior.kpis.Lunch.actual).toBeLessThan(60);
    expect(current.kpis.Lunch.actual).toBeGreaterThanOrEqual(60);
    expect(results.Lunch).toBe('Comparable');
  });
});
