import { describe, expect, it } from 'vitest';
import { DailySiteFacts, InventorySnapshot } from '../types/comparisonDataTypes';
import {
  aggregateDailyKpi,
  aggregateInventoryDiscrepancyDollars,
  aggregateInventoryKpi,
  aggregateKpi,
} from './comparisonAggregation';

/** A fact row with zeros except the given fields. */
function fact(overrides: Partial<DailySiteFacts>): DailySiteFacts {
  return {
    siteId: 1, date: '2025-09-02', enrollment: 0,
    breakfastMeals: 0, lunchMeals: 0, snackMeals: 0, supperMeals: 0,
    ecoDisStudents: 0, paidNotAppliedStudents: 0, eligibleStudents: 0, eligibleNotParticipating: 0,
    meals: 0, meqs: 0, laborHours: 0,
    revenue: 0, aLaCarteSales: 0, reimbursement: 0, waste: 0,
    ...overrides,
  };
}

function snapshot(overrides: Partial<InventorySnapshot>): InventorySnapshot {
  return { siteId: 1, date: '2025-09-30', inventoryValue: 0, turnoverDays: 1, discrepancyDollars: 0, discrepancyPercent: 0, ...overrides };
}

describe('ratio KPIs aggregate as ratio of sums, not average of ratios', () => {
  // Small site: 90 of 100 eat lunch (90%). Large site: 500 of 1,000 (50%).
  const small = fact({ siteId: 1, enrollment: 100, lunchMeals: 90 });
  const large = fact({ siteId: 2, enrollment: 1000, lunchMeals: 500 });

  it('Lunch = Σ meals ÷ Σ enrollment', () => {
    expect(aggregateDailyKpi('Lunch', [small, large])).toBeCloseTo((590 / 1100) * 100, 10); // 53.6%
  });

  it('differs from the average of site ratios', () => {
    const averageOfRatios = (90 + 50) / 2; // 70% — wrong
    expect(aggregateDailyKpi('Lunch', [small, large])).not.toBeCloseTo(averageOfRatios, 1);
  });

  it('weights days the same way (enrollment × serving days)', () => {
    const day1 = fact({ date: '2025-09-02', enrollment: 100, breakfastMeals: 10 });
    const day2 = fact({ date: '2025-09-03', enrollment: 100, breakfastMeals: 30 });
    expect(aggregateDailyKpi('Breakfast', [day1, day2])).toBeCloseTo(20, 10);
  });

  it('MPLH = Σ MEQs ÷ Σ labor hours (not ×100)', () => {
    const a = fact({ meqs: 200, laborHours: 10 }); // 20
    const b = fact({ meqs: 900, laborHours: 100 }); // 9
    expect(aggregateDailyKpi('MPLH', [a, b])).toBeCloseTo(1100 / 110, 10); // 10, not 14.5
  });

  it('ENP uses eligible students as its denominator', () => {
    expect(aggregateDailyKpi('ENP', [fact({ enrollment: 500, eligibleStudents: 200, eligibleNotParticipating: 10 })])).toBeCloseTo(5, 10);
  });

  it('PNA and Eco Dis use enrollment', () => {
    const row = fact({ enrollment: 400, paidNotAppliedStudents: 40, ecoDisStudents: 200 });
    expect(aggregateDailyKpi('PNA', [row])).toBeCloseTo(10, 10);
    expect(aggregateDailyKpi('Eco Dis', [row])).toBeCloseTo(50, 10);
  });
});

describe('sum KPIs', () => {
  it('total the field across sites and days', () => {
    const rows = [fact({ revenue: 100.5, waste: 10 }), fact({ siteId: 2, revenue: 200, waste: 5 })];
    expect(aggregateDailyKpi('Revenue', rows)).toBeCloseTo(300.5, 10);
    expect(aggregateDailyKpi('Waste', rows)).toBe(15);
  });
});

describe('No Data vs zero', () => {
  it('no rows → null for every daily KPI', () => {
    expect(aggregateDailyKpi('Lunch', [])).toBeNull();
    expect(aggregateDailyKpi('Revenue', [])).toBeNull();
  });

  it('a zero denominator → null', () => {
    expect(aggregateDailyKpi('ENP', [fact({ enrollment: 100, eligibleStudents: 0 })])).toBeNull();
    expect(aggregateDailyKpi('MPLH', [fact({ meqs: 0, laborHours: 0 })])).toBeNull();
  });

  it('reported zeros stay zero', () => {
    expect(aggregateDailyKpi('Supper', [fact({ enrollment: 100, supperMeals: 0 })])).toBe(0);
    expect(aggregateDailyKpi('A La Carte', [fact({ aLaCarteSales: 0 })])).toBe(0);
  });

  it('no snapshots → null for inventory KPIs', () => {
    expect(aggregateInventoryKpi('Inventory Value', [])).toBeNull();
    expect(aggregateInventoryDiscrepancyDollars([])).toBeNull();
  });
});

describe('inventory KPIs are point-in-time', () => {
  const site1 = [
    snapshot({ siteId: 1, date: '2025-08-31', inventoryValue: 5000, turnoverDays: 20, discrepancyDollars: 500 }),
    snapshot({ siteId: 1, date: '2025-09-30', inventoryValue: 10000, turnoverDays: 10, discrepancyDollars: 200 }),
  ];
  const site2 = [snapshot({ siteId: 2, date: '2025-09-30', inventoryValue: 30000, turnoverDays: 30, discrepancyDollars: 1200 })];

  it('Inventory Value = Σ each site\'s last snapshot in the period', () => {
    expect(aggregateInventoryKpi('Inventory Value', [...site1, ...site2])).toBe(40000);
  });

  it('Turnover = Σ value ÷ Σ daily usage (ratio of sums)', () => {
    // usage: 10000/10 = 1000/day, 30000/30 = 1000/day → 40000 / 2000 = 20 days (average of ratios would also be 20 here)
    expect(aggregateInventoryKpi('Inventory Turnover Rate', [...site1, ...site2])).toBeCloseTo(20, 10);
    // Unequal sizes: 1000 value / 5 days (200/day) + 30000 / 30 (1000/day) → 31000/1200 = 25.8, not (5+30)/2 = 17.5
    const uneven = [snapshot({ siteId: 1, inventoryValue: 1000, turnoverDays: 5 }), ...site2];
    expect(aggregateInventoryKpi('Inventory Turnover Rate', uneven)).toBeCloseTo(31000 / 1200, 10);
  });

  it('Physical Inventory Discrepancy = Σ $ ÷ Σ value, with the $ alongside', () => {
    expect(aggregateInventoryKpi('Physical Inventory Discrepancy', [...site1, ...site2])).toBeCloseTo((1400 / 40000) * 100, 10);
    expect(aggregateInventoryDiscrepancyDollars([...site1, ...site2])).toBe(1400);
  });

  it('aggregateKpi routes by the KPI definition', () => {
    expect(aggregateKpi('Inventory Value', [], [...site1, ...site2])).toBe(40000);
    expect(aggregateKpi('Revenue', [fact({ revenue: 5 })], [])).toBe(5);
  });
});
