import { describe, expect, it } from 'vitest';
import { DEMO_AS_OF_DATE } from '../../../constants/demo';
import { COMPARISON_KPI_KEYS, getKpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { formatKpiValue } from '../../../utils/kpiFormatters';
import { resolveTimeframe } from '../../../utils/timeframes';
import { compareKpi, getTargetStatus, getTargetTransition, swapComparisonInput } from './compareKpi';
import { Classification, KpiComparisonInput, SideTimeframe, TargetTransition } from './types';

const LEFT_LABEL = 'High Schools · SY 2024–25';
const RIGHT_LABEL = 'High Schools · SY 2025–26';
// Timeframes as of DEMO_AS_OF_DATE. YTD is partial through Apr 16, 2026.
const PRIOR_YEAR = resolveTimeframe('prior_year', DEMO_AS_OF_DATE);
const PRIOR_YTD = resolveTimeframe('prior_ytd', DEMO_AS_OF_DATE);
const YTD = resolveTimeframe('ytd', DEMO_AS_OF_DATE);

interface SideSpec {
  actual: number | null;
  target?: number | null;
  label?: string;
  timeframe?: SideTimeframe;
  secondaryActual?: number | null;
}

function input(kpi: ComparisonKpiKey, left: SideSpec, right: SideSpec): KpiComparisonInput {
  return {
    kpi,
    left: { target: null, label: LEFT_LABEL, ...left },
    right: { target: null, label: RIGHT_LABEL, ...right },
  };
}

const run = (kpi: ComparisonKpiKey, left: SideSpec, right: SideSpec) => compareKpi(input(kpi, left, right));

// ─── Spec §5.9 description fixtures ──────────────────────────────────────────

describe('spec §5.9 description fixtures', () => {
  it.each<[string, ComparisonKpiKey, SideSpec, SideSpec, string]>([
    ['Lunch 58% → 60%, target 60%', 'Lunch', { actual: 58, target: 60 }, { actual: 60, target: 60 },
      'Improved — Lunch participation increased by 2 percentage points and meets the 60% target.'],
    ['Waste 10,000 → 9,500, target 9,000', 'Waste', { actual: 10000, target: 9000 }, { actual: 9500, target: 9000 },
      'Improved — Waste decreased by $500 but remains above the $9,000 target.'],
    ['PNA 8% → 6.5%, target 5%', 'PNA', { actual: 8, target: 5 }, { actual: 6.5, target: 5 },
      'Improved — PNA decreased by 1.5 percentage points but remains above the 5% target.'],
    ['Lunch 68% → 66%, target 60%', 'Lunch', { actual: 68, target: 60 }, { actual: 66, target: 60 },
      'Declined — Lunch participation decreased by 2 percentage points but meets the 60% target.'],
    ['Lunch 61% → 59%, target 60%', 'Lunch', { actual: 61, target: 60 }, { actual: 59, target: 60 },
      'Declined — Lunch participation decreased by 2 percentage points and is below the 60% target.'],
    ['Lunch 63% → 63.4%, target 60%', 'Lunch', { actual: 63, target: 60 }, { actual: 63.4, target: 60 },
      'Comparable — Lunch participation remained relatively stable and meets the 60% target.'],
    ['Lunch 59.8% → 60.2%, target 60%', 'Lunch', { actual: 59.8, target: 60 }, { actual: 60.2, target: 60 },
      'Comparable — Lunch participation changed by less than the materiality threshold but meets the 60% target.'],
    ['Revenue 100,000 → 104,000, no target', 'Revenue', { actual: 100000 }, { actual: 104000 },
      'Improved — Revenue increased by $4,000 (4.0%).'],
    ['Lunch 58% (target 55%) → 58.4% (target 65%)', 'Lunch', { actual: 58, target: 55 }, { actual: 58.4, target: 65 },
      'Comparable — Lunch participation increased by 0.4 percentage points; High Schools · SY 2025–26 is below its 65% target.'],
    // The partial note is material here: a sum KPI, and a full year vs a partial year (spec §5.9).
    ['Revenue +8,420 (6.3%), right side partial through Apr 16', 'Revenue',
      { actual: 133651, timeframe: PRIOR_YEAR }, { actual: 142071, timeframe: YTD },
      'Improved — Revenue increased by $8,420 (6.3%). High Schools · SY 2025–26 includes data through April 16, 2026.'],
    ['Lunch no data on left', 'Lunch', { actual: null, label: 'High Schools · SY 2022–23' }, { actual: 60, target: 60 },
      'No Data — Lunch participation could not be compared because data is unavailable for High Schools · SY 2022–23.'],
    ['Inventory Value 167,224 → 181,750', 'Inventory Value', { actual: 167224 }, { actual: 181750 },
      'Inventory value increased from $167,224 to $181,750, a change of $14,526.'],
    ['Inventory Turnover 16 → 14 days', 'Inventory Turnover Rate', { actual: 16 }, { actual: 14 },
      'Inventory turnover changed from 16 days to 14 days.'],
    ['Physical Inventory Discrepancy 3.2% → 2.6%', 'Physical Inventory Discrepancy', { actual: 3.2 }, { actual: 2.6 },
      'Physical inventory discrepancy changed from 3.2% to 2.6% of total inventory value.'],
  ])('%s', (_name, kpi, left, right, expected) => {
    expect(run(kpi, left, right).description).toBe(expected);
  });
});

describe('spec §5.9 materiality fixtures', () => {
  it.each<[string, ComparisonKpiKey, number, number, Classification, string]>([
    ['Lunch 60% → 60.4%', 'Lunch', 60, 60.4, 'Comparable', '+0.4 pts'],
    ['Lunch 60% → 60.5%', 'Lunch', 60, 60.5, 'Improved', '+0.5 pts'],
    ['Lunch 60% → 59.5%', 'Lunch', 60, 59.5, 'Declined', '−0.5 pts'],
    ['Revenue 100,000 → 101,500', 'Revenue', 100000, 101500, 'Comparable', '+1.5% (+$1,500)'],
    ['Revenue 100,000 → 102,000', 'Revenue', 100000, 102000, 'Improved', '+2.0% (+$2,000)'],
    ['Meals 12,500 → 12,625', 'Meals', 12500, 12625, 'Comparable', '+1.0% (+125)'],
    ['Meals 12,500 → 12,750', 'Meals', 12500, 12750, 'Improved', '+2.0% (+250)'],
    ['MPLH 18.40 → 18.58', 'MPLH', 18.4, 18.58, 'Comparable', '+1.0% (+0.18)'],
    ['MPLH 18.40 → 18.77', 'MPLH', 18.4, 18.77, 'Improved', '+2.0% (+0.37)'],
    ['Waste 10,000 → 9,800 (lower is favorable)', 'Waste', 10000, 9800, 'Improved', '−2.0% (−$200)'],
    ['Revenue 0 → 5,000', 'Revenue', 0, 5000, 'RelativeNotApplicable', '+$5,000'],
    ['Revenue 0 → 0', 'Revenue', 0, 0, 'Comparable', '$0'],
  ])('%s', (_name, kpi, left, right, classification, deltaFormatted) => {
    const result = run(kpi, { actual: left }, { actual: right });
    expect(result.classification).toBe(classification);
    expect(result.deltaFormatted).toBe(deltaFormatted);
  });

  it('baseline zero has an absolute delta, no relative change, and never ∞', () => {
    const result = run('Revenue', { actual: 0 }, { actual: 5000 });
    expect(result).toMatchObject({ delta: 5000, relativeChange: null, materiality: 'NotApplicable' });
    expect(result.description).toBe('Relative Change N/A — Revenue increased by $5,000 from $0, so a percentage change cannot be calculated.');
    expect(result.description).not.toMatch(/∞|Infinity/);
  });

  it('both zero → change 0, Comparable', () => {
    expect(run('Revenue', { actual: 0 }, { actual: 0 })).toMatchObject({ delta: 0, classification: 'Comparable', materiality: 'NotMaterial' });
  });
});

// ─── All 12 classification × transition combinations ────────────────────────

const MATRIX_CASES: Array<[Classification, TargetTransition, ComparisonKpiKey, SideSpec, SideSpec, string]> = [
    ['Improved', 'NotMetToMet', 'Lunch', { actual: 58, target: 60 }, { actual: 60, target: 60 },
      'Improved — Lunch participation increased by 2 percentage points and meets the 60% target.'],
    ['Improved', 'NotMetToNotMet', 'Lunch', { actual: 50, target: 60 }, { actual: 55, target: 60 },
      'Improved — Lunch participation increased by 5 percentage points but remains below the 60% target.'],
    ['Improved', 'MetToMet', 'Lunch', { actual: 62, target: 60 }, { actual: 65, target: 60 },
      'Improved — Lunch participation increased by 3 percentage points and meets the 60% target.'],
    // Phase 3 brief example (district Waste, SY 2024–25 → SY 2025–26).
    ['Improved', 'MetToNotMet', 'Waste', { actual: 1126401, target: 1163750 }, { actual: 1078776, target: 1033200 },
      'Improved — Waste decreased by $47,625 but is above the $1,033,200 target.'],
    ['Declined', 'MetToNotMet', 'Lunch', { actual: 61, target: 60 }, { actual: 59, target: 60 },
      'Declined — Lunch participation decreased by 2 percentage points and is below the 60% target.'],
    ['Declined', 'MetToMet', 'Lunch', { actual: 68, target: 60 }, { actual: 66, target: 60 },
      'Declined — Lunch participation decreased by 2 percentage points but meets the 60% target.'],
    ['Declined', 'NotMetToNotMet', 'Lunch', { actual: 55, target: 60 }, { actual: 50, target: 60 },
      'Declined — Lunch participation decreased by 5 percentage points and remains below the 60% target.'],
    // Phase 3 brief example (district Revenue). The relative % is omitted when there is a target
    // clause, matching the spec §5.9 Waste fixtures; see the Phase 3 summary.
    ['Declined', 'NotMetToMet', 'Revenue', { actual: 10394110, target: 10640000 }, { actual: 9684397, target: 9446400 },
      'Declined — Revenue decreased by $709,713 but meets the $9,446,400 target.'],
    ['Comparable', 'MetToMet', 'Lunch', { actual: 63, target: 60 }, { actual: 63.4, target: 60 },
      'Comparable — Lunch participation remained relatively stable and meets the 60% target.'],
    ['Comparable', 'NotMetToNotMet', 'Lunch', { actual: 55, target: 60 }, { actual: 55.3, target: 60 },
      'Comparable — Lunch participation remained relatively stable and is below the 60% target.'],
    ['Comparable', 'NotMetToMet', 'Lunch', { actual: 59.8, target: 60 }, { actual: 60.2, target: 60 },
      'Comparable — Lunch participation changed by less than the materiality threshold but meets the 60% target.'],
    ['Comparable', 'MetToNotMet', 'Lunch', { actual: 60.2, target: 60 }, { actual: 59.8, target: 60 },
      'Comparable — Lunch participation changed by less than the materiality threshold and is below the 60% target.'],
];

describe('decision matrix: every classification × transition', () => {
  it.each(MATRIX_CASES)('%s + %s', (classification, transition, kpi, left, right, expected) => {
    const result = run(kpi, left, right);
    expect(result.classification).toBe(classification);
    expect(result.targetTransition).toBe(transition);
    expect(result.description).toBe(expected);
  });

  it('the cases above cover all 12 combinations exactly once', () => {
    expect(new Set(MATRIX_CASES.map(([c, t]) => `${c}+${t}`)).size).toBe(12);
    expect(MATRIX_CASES).toHaveLength(12);
  });

  it('Comparable + NotMetToNotMet uses "is above" for lower-is-favorable KPIs, never "remains"', () => {
    expect(run('PNA', { actual: 8, target: 5 }, { actual: 8.2, target: 5 }).description).toBe(
      'Comparable — PNA remained relatively stable and is above the 5% target.',
    );
  });

  it('no target on either side → no transition and no target commentary', () => {
    expect(run('Lunch', { actual: 58 }, { actual: 60 })).toMatchObject({
      targetTransition: null,
      description: 'Improved — Lunch participation increased by 2 percentage points.',
    });
    expect(run('Lunch', { actual: 60 }, { actual: 60.3 }).description).toBe('Comparable — Lunch participation remained relatively stable.');
    expect(run('Revenue', { actual: 100000 }, { actual: 96000 }).description).toBe('Declined — Revenue decreased by $4,000 (4.0%).');
  });

  it('a target on only one side → no transition and no target commentary', () => {
    const result = run('Lunch', { actual: 58 }, { actual: 60, target: 60 });
    expect(result.targetTransition).toBeNull();
    expect(result.right.targetStatus).toBe('Met');
    expect(result.description).toBe('Improved — Lunch participation increased by 2 percentage points.');
  });

  it('uses "above" wording for lower-is-favorable KPIs', () => {
    expect(run('PNA', { actual: 4.8, target: 5 }, { actual: 5.5, target: 5 }).description)
      .toBe('Declined — PNA increased by 0.7 percentage points and is above the 5% target.');
  });

  it('uses singular "percentage point" for exactly 1', () => {
    expect(run('Lunch', { actual: 58 }, { actual: 59 }).description).toBe('Improved — Lunch participation increased by 1 percentage point.');
  });
});

// ─── Orientation and swap ────────────────────────────────────────────────────

describe('orientation and swap (spec §5.3)', () => {
  it('delta is right − left', () => {
    expect(run('Lunch', { actual: 58 }, { actual: 60 }).delta).toBeCloseTo(2, 10);
    expect(run('Revenue', { actual: 100000 }, { actual: 104000 }).relativeChange).toBeCloseTo(0.04, 10);
  });

  it('swapping flips the delta sign and recalculates classification, transition, and Needs Attention', () => {
    const original = input('Lunch', { actual: 61, target: 60 }, { actual: 59, target: 60 });
    const forward = compareKpi(original);
    const swapped = compareKpi(swapComparisonInput(original));

    expect(swapped.delta).toBeCloseTo(-(forward.delta ?? 0), 10);
    expect(forward).toMatchObject({ classification: 'Declined', targetTransition: 'MetToNotMet', needsAttentionReasons: ['Declined', 'BelowTarget'] });
    expect(swapped).toMatchObject({ classification: 'Improved', targetTransition: 'NotMetToMet', needsAttention: false, needsAttentionReasons: [] });
    expect(swapped.left).toEqual(forward.right);
    expect(swapped.right).toEqual(forward.left);
  });

  it('swapping recalculates relative change against the new reference side', () => {
    const original = input('Revenue', { actual: 100000 }, { actual: 102000 });
    const forward = compareKpi(original); //                        +2.0% → Improved
    const swapped = compareKpi(swapComparisonInput(original)); //   −1.96% → Comparable
    expect(forward.classification).toBe('Improved');
    expect(swapped.classification).toBe('Comparable');
    expect(swapped.relativeChange).toBeCloseTo(-2000 / 102000, 10);
  });

  it('for every KPI, swapping exchanges the side results and negates the delta', () => {
    for (const kpi of COMPARISON_KPI_KEYS) {
      const original = input(kpi, { actual: 40, target: 45, timeframe: PRIOR_YEAR }, { actual: 50, target: 45, timeframe: YTD });
      const forward = compareKpi(original);
      const swapped = compareKpi(swapComparisonInput(original));
      expect(swapped.delta, kpi).toBeCloseTo(-(forward.delta ?? 0), 10);
      expect(swapped.left, kpi).toEqual(forward.right);
      expect(swapped.right, kpi).toEqual(forward.left);
      if (forward.classification === 'Improved') expect(swapped.classification, kpi).toBe('Declined');
      if (forward.classification === 'Declined') expect(swapped.classification, kpi).toBe('Improved');
    }
  });

  it('swapping a baseline-zero comparison makes the new reference non-zero', () => {
    const swapped = compareKpi(swapComparisonInput(input('Revenue', { actual: 0 }, { actual: 5000 })));
    expect(swapped).toMatchObject({ classification: 'Declined', relativeChange: -1, delta: -5000 });
  });
});

describe('floating-point guard (spec §5.4)', () => {
  it('60 → 60.5 is exactly material', () => {
    expect(run('Lunch', { actual: 60 }, { actual: 60.5 })).toMatchObject({ classification: 'Improved', materiality: 'Material' });
  });

  it('a difference that is 0.5 except for float error is material', () => {
    expect(64.1 - 63.6).toBeLessThan(0.5); // 0.4999999999999929
    expect(run('Lunch', { actual: 63.6 }, { actual: 64.1 }).classification).toBe('Improved');
  });

  it('a relative change of exactly 2% is material', () => {
    expect(run('Meals', { actual: 12500 }, { actual: 12750 }).classification).toBe('Improved');
    expect(run('Waste', { actual: 10000 }, { actual: 9800 }).classification).toBe('Improved');
  });

  it('target status is unaffected by float error', () => {
    expect(getTargetStatus('Lunch', 0.1 + 0.2, 0.3)).toBe('Met');
    expect(getTargetStatus('PNA', 0.1 + 0.2, 0.3)).toBe('Met');
  });
});

// ─── Target status and transitions ───────────────────────────────────────────

describe('target status (spec §5.6)', () => {
  it('higher is favorable → Met when actual ≥ target', () => {
    expect(getTargetStatus('Lunch', 60, 60)).toBe('Met');
    expect(getTargetStatus('Lunch', 59.9, 60)).toBe('NotMet');
  });

  it('lower is favorable → Met when actual ≤ target', () => {
    expect(getTargetStatus('Waste', 9000, 9000)).toBe('Met');
    expect(getTargetStatus('Waste', 9001, 9000)).toBe('NotMet');
  });

  it('uses display precision, so the status agrees with what users see (59.97% shows as 60.0%)', () => {
    expect(formatKpiValue('Lunch', 59.97)).toBe('60.0%');
    expect(getTargetStatus('Lunch', 59.97, 60)).toBe('Met');
    expect(formatKpiValue('Lunch', 59.94)).toBe('59.9%');
    expect(getTargetStatus('Lunch', 59.94, 60)).toBe('NotMet');
  });

  it('applies display precision for every format', () => {
    expect(getTargetStatus('Waste', 9000.4, 9000)).toBe('Met'); //   shows $9,000
    expect(getTargetStatus('Waste', 9000.6, 9000)).toBe('NotMet'); // shows $9,001
    expect(getTargetStatus('MPLH', 18.496, 18.5)).toBe('Met'); //   shows 18.50
    expect(getTargetStatus('Meals', 2499.5, 2500)).toBe('Met'); //  shows 2,500
    expect(getTargetStatus('PNA', 10.04, 10)).toBe('Met'); //       shows 10.0% (lower is favorable)
  });

  it('the engine result shows the same status as its formatted value', () => {
    const result = run('Lunch', { actual: 58, target: 60 }, { actual: 59.97, target: 60 });
    expect(result.right).toMatchObject({ actualFormatted: '60.0%', targetFormatted: '60%', targetStatus: 'Met' });
    expect(result.targetTransition).toBe('NotMetToMet');
  });

  it('no target or no data → NotAvailable, never a missed target', () => {
    expect(getTargetStatus('Lunch', 50, null)).toBe('NotAvailable');
    expect(getTargetStatus('Lunch', null, 60)).toBe('NotAvailable');
  });

  it('informational KPIs never get a status, even with a context benchmark', () => {
    expect(getTargetStatus('Inventory Turnover Rate', 20, 16)).toBe('NotAvailable');
    expect(getTargetStatus('Physical Inventory Discrepancy', 3, 0)).toBe('NotAvailable');
  });

  it('each side uses its own target', () => {
    const result = run('Lunch', { actual: 58, target: 55 }, { actual: 58.4, target: 65 });
    expect(result.left).toMatchObject({ target: 55, targetStatus: 'Met' });
    expect(result.right).toMatchObject({ target: 65, targetStatus: 'NotMet' });
  });

  it('transition exists only when both sides are Met or NotMet', () => {
    expect(getTargetTransition('Met', 'NotMet')).toBe('MetToNotMet');
    expect(getTargetTransition('NotMet', 'Met')).toBe('NotMetToMet');
    expect(getTargetTransition('Met', 'NotAvailable')).toBeNull();
    expect(getTargetTransition('NotAvailable', 'NotAvailable')).toBeNull();
  });
});

// ─── No Data and one-sided data ──────────────────────────────────────────────

describe('No Data and one-sided data (spec §5.7)', () => {
  it('neither side has data → NoData, no delta', () => {
    const result = run('Lunch', { actual: null, target: 60 }, { actual: null, target: 60 });
    expect(result).toMatchObject({
      classification: 'NoData', delta: null, relativeChange: null, deltaFormatted: null,
      materiality: null, favorability: null, targetTransition: null, needsAttention: false,
    });
    expect(result.left).toMatchObject({ hasData: false, actualFormatted: 'No Data', targetStatus: 'NotAvailable' });
    expect(result.description).toBe(
      'No Data — Lunch participation could not be compared because data is unavailable for High Schools · SY 2024–25 and High Schools · SY 2025–26.',
    );
  });

  it('only one side has data → keep that side\'s actual and status; nothing else', () => {
    const result = run('Lunch', { actual: 55, target: 60 }, { actual: null, target: 60 });
    expect(result.left).toMatchObject({ actual: 55, hasData: true, targetStatus: 'NotMet' });
    expect(result.right).toMatchObject({ actual: null, hasData: false, targetStatus: 'NotAvailable' });
    expect(result).toMatchObject({ classification: 'NoData', delta: null, materiality: null, targetTransition: null });
  });

  it('No Data is never 0, Declined, Comparable, or a missed target', () => {
    const result = run('Revenue', { actual: 100000, target: 90000 }, { actual: null, target: 90000 });
    expect(result.classification).toBe('NoData');
    expect(result.right.actualFormatted).toBe('No Data');
    expect(result.right.targetStatus).toBe('NotAvailable');
  });

  it('a real zero is data, not No Data', () => {
    const result = run('Supper', { actual: 0 }, { actual: 0 });
    expect(result).toMatchObject({ classification: 'Comparable', delta: 0 });
    expect(result.left.actualFormatted).toBe('0.0%');
  });

  it('dedupes identical labels in the No Data sentence', () => {
    const result = run('Lunch', { actual: null, label: 'All Sites · SY 2022–23' }, { actual: null, label: 'All Sites · SY 2022–23' });
    expect(result.description).toBe('No Data — Lunch participation could not be compared because data is unavailable for All Sites · SY 2022–23.');
  });

  it('informational KPIs with missing data are No Data too', () => {
    expect(run('Inventory Value', { actual: null }, { actual: 1000 }).classification).toBe('NoData');
  });
});

// ─── Needs Attention ─────────────────────────────────────────────────────────

describe('Needs Attention (spec §5.8)', () => {
  it('Declined only (no right target)', () => {
    expect(run('Lunch', { actual: 61 }, { actual: 59 }).needsAttentionReasons).toEqual(['Declined']);
  });

  it('BelowTarget only (Comparable, right Not Met)', () => {
    expect(run('Lunch', { actual: 55, target: 60 }, { actual: 55.3, target: 60 }).needsAttentionReasons).toEqual(['BelowTarget']);
  });

  it('both reasons', () => {
    expect(run('Lunch', { actual: 61, target: 60 }, { actual: 59, target: 60 })).toMatchObject({
      needsAttention: true,
      needsAttentionReasons: ['Declined', 'BelowTarget'],
    });
  });

  it('right side has data and is Not Met, left No Data → BelowTarget', () => {
    const result = run('Lunch', { actual: null }, { actual: 55, target: 60 });
    expect(result.classification).toBe('NoData');
    expect(result.needsAttentionReasons).toEqual(['BelowTarget']);
  });

  it('only the left side has data → never qualifies, even if left is Not Met', () => {
    expect(run('Lunch', { actual: 50, target: 60 }, { actual: null, target: 60 }).needsAttention).toBe(false);
  });

  it('right target missing → only via Declined', () => {
    expect(run('Lunch', { actual: 50, target: 60 }, { actual: 50.2 }).needsAttention).toBe(false);
    expect(run('Lunch', { actual: 50, target: 60 }, { actual: 45 }).needsAttentionReasons).toEqual(['Declined']);
  });

  it('RelativeNotApplicable can still qualify via right-side BelowTarget', () => {
    const below = run('Revenue', { actual: 0, target: 6000 }, { actual: 5000, target: 6000 });
    expect(below).toMatchObject({ classification: 'RelativeNotApplicable', needsAttentionReasons: ['BelowTarget'] });
    expect(below.description).toBe(
      'Relative Change N/A — Revenue increased by $5,000 from $0, so a percentage change cannot be calculated; High Schools · SY 2025–26 is below its $6,000 target.',
    );
    expect(run('Revenue', { actual: 0, target: 4000 }, { actual: 5000, target: 4000 }).needsAttention).toBe(false);
  });

  it('informational KPIs never qualify', () => {
    for (const kpi of ['Inventory Value', 'Inventory Turnover Rate', 'Physical Inventory Discrepancy'] as const) {
      expect(run(kpi, { actual: 10, target: 1 }, { actual: 1000, target: 1 }).needsAttention).toBe(false);
    }
  });

  it('lower is favorable: right above target → BelowTarget (named for "not meeting target")', () => {
    expect(run('PNA', { actual: 10.5, target: 10 }, { actual: 10.7, target: 10 }).needsAttentionReasons).toEqual(['BelowTarget']);
  });
});

// ─── Informational KPIs ──────────────────────────────────────────────────────

describe('informational KPIs (spec §3, §5.4)', () => {
  it('are classified Informational with no materiality and neutral favorability', () => {
    expect(run('Inventory Turnover Rate', { actual: 16, target: 15 }, { actual: 14, target: 15 })).toMatchObject({
      kind: 'informational', classification: 'Informational', materiality: 'NotApplicable', favorability: 'neutral',
      targetTransition: null, delta: -2, deltaFormatted: '−2 days',
    });
  });

  it('keep a context benchmark but no status', () => {
    const result = run('Inventory Turnover Rate', { actual: 16, target: 15 }, { actual: 14, target: 15 });
    expect(result.right).toMatchObject({ target: 15, targetFormatted: '15 days', targetStatus: 'NotAvailable' });
  });

  it('Inventory Value never has a target', () => {
    expect(run('Inventory Value', { actual: 1, target: 5 }, { actual: 2, target: 5 }).right).toMatchObject({ target: null, targetFormatted: '—' });
  });

  it('describe decreases and unchanged values', () => {
    expect(run('Inventory Value', { actual: 181750 }, { actual: 167224 }).description)
      .toBe('Inventory value decreased from $181,750 to $167,224, a change of −$14,526.');
    expect(run('Inventory Turnover Rate', { actual: 16 }, { actual: 16 }).description).toBe('Inventory turnover remained at 16 days.');
  });

  it('show Physical Inventory Discrepancy as % with the $ amount alongside', () => {
    const result = run('Physical Inventory Discrepancy', { actual: 3.2, secondaryActual: 7647 }, { actual: 2.6, secondaryActual: 7102 });
    expect(result.left.actualFormatted).toBe('3.2% ($7,647)');
    expect(result.right.actualFormatted).toBe('2.6% ($7,102)');
  });
});

// ─── Partial notes, formatting, and favorability ─────────────────────────────

describe('partial-period notes are appended only when material (spec §5.9)', () => {
  const SUM_KPIS: ComparisonKpiKey[] = ['Revenue', 'Meals', 'MEQs', 'A La Carte', 'Reimbursement', 'Waste'];
  const NOTE = 'High Schools · SY 2025–26 includes data through April 16, 2026.';

  it('every sum KPI gets the note when the period-length notice applies (full year vs partial year)', () => {
    for (const kpi of SUM_KPIS) {
      const result = run(kpi, { actual: 1000, timeframe: PRIOR_YEAR }, { actual: 1100, timeframe: YTD });
      expect(result.partialNote, kpi).toBe(NOTE);
      expect(result.description.endsWith(` ${NOTE}`), kpi).toBe(true);
    }
  });

  it('names the partial side whichever side it is on', () => {
    expect(run('Revenue', { actual: 1000, timeframe: YTD, label: 'All Sites · SY 2025–26' }, { actual: 1100, timeframe: PRIOR_YEAR }).partialNote)
      .toBe('All Sites · SY 2025–26 includes data through April 16, 2026.');
  });

  it('sum KPIs over like-for-like periods (Prior Year to Date vs Year to Date) get no note', () => {
    const result = run('Revenue', { actual: 1000, timeframe: PRIOR_YTD }, { actual: 1100, timeframe: YTD });
    expect(result.partialNote).toBeNull();
    expect(result.description).toBe('Improved — Revenue increased by $100 (10.0%).');
  });

  it('ratio KPIs never get the note, even when period lengths differ', () => {
    for (const kpi of ['Lunch', 'PNA', 'MPLH', 'Eco Dis'] as ComparisonKpiKey[]) {
      expect(run(kpi, { actual: 10, timeframe: PRIOR_YEAR }, { actual: 12, timeframe: YTD }).partialNote, kpi).toBeNull();
    }
  });

  it('informational KPIs never get the note', () => {
    expect(run('Inventory Turnover Rate', { actual: 16, timeframe: PRIOR_YEAR }, { actual: 14, timeframe: YTD }).description)
      .toBe('Inventory turnover changed from 16 days to 14 days.');
    expect(run('Inventory Value', { actual: 1, timeframe: PRIOR_YEAR }, { actual: 2, timeframe: YTD }).partialNote).toBeNull();
  });

  it('is omitted for No Data and when timeframes are not provided', () => {
    expect(run('Revenue', { actual: null, timeframe: PRIOR_YEAR }, { actual: 60, timeframe: YTD }).partialNote).toBeNull();
    expect(run('Revenue', { actual: 58 }, { actual: 60 }).partialNote).toBeNull();
  });
});

describe('formatted fields and favorability', () => {
  it('formats actuals, targets, and deltas', () => {
    const result = run('Lunch', { actual: 58, target: 60 }, { actual: 60, target: null });
    expect(result.left).toMatchObject({ actualFormatted: '58.0%', targetFormatted: '60%' });
    expect(result.right).toMatchObject({ actualFormatted: '60.0%', targetFormatted: '—' });
    expect(result.deltaFormatted).toBe('+2.0 pts');
  });

  it('maps classification to favorability', () => {
    expect(run('Lunch', { actual: 58 }, { actual: 60 }).favorability).toBe('favorable');
    expect(run('Lunch', { actual: 60 }, { actual: 58 }).favorability).toBe('unfavorable');
    expect(run('Lunch', { actual: 60 }, { actual: 60.2 }).favorability).toBe('neutral');
    expect(run('Revenue', { actual: 0 }, { actual: 1 }).favorability).toBe('neutral');
  });
});

// ─── Wording guard ───────────────────────────────────────────────────────────

describe('descriptions never name sides except by generated label (spec §2, §5.9)', () => {
  const FORBIDDEN_WORDS = /\b(left|right|baseline|previous|current|now)\b/i;
  const FORBIDDEN_LETTERS = / A | B /;
  const labels = ['High Schools · SY 2024–25', 'Roosevelt High · SY 2025–26', 'All Sites · This Week'];
  const values = [null, 0, 9.5, 50, 60, 60.4, 70, 120000];
  const targets = [null, 10, 60, 100000];

  it('across every KPI, value, target, and partial combination', () => {
    let checked = 0;
    for (const kpi of COMPARISON_KPI_KEYS) {
      const subject = getKpiDefinition(kpi).descriptionSubject;
      for (const l of values) for (const r of values) for (const lt of targets) for (const rt of targets) {
        const result = run(kpi,
          { actual: l, target: lt, label: labels[0], timeframe: PRIOR_YEAR },
          { actual: r, target: rt, label: labels[(checked % 2) + 1], timeframe: checked % 3 === 0 ? YTD : PRIOR_YTD });
        // Generated labels and KPI names (e.g. "A La Carte") are allowed to contain anything.
        const text = [...labels, subject].reduce((t, allowed) => t.split(allowed).join('<>'), result.description);
        expect(text, result.description).not.toMatch(FORBIDDEN_WORDS);
        expect(text, result.description).not.toMatch(FORBIDDEN_LETTERS);
        checked += 1;
      }
    }
    expect(checked).toBe(17 * values.length ** 2 * targets.length ** 2);
    // Exhaustive (~5s alone); a generous timeout keeps it from failing on a busy machine.
  }, 20_000);
});

describe('target formatting matches between targetFormatted and descriptions (spec §5.9)', () => {
  it.each<[ComparisonKpiKey, number, string]>([
    ['Lunch', 35, '35%'],
    ['Lunch', 62.5, '62.5%'],
    ['MPLH', 18.5, '18.50'],
    ['Waste', 9000, '$9,000'],
  ])('%s target %d → %s in both places', (kpi, target, text) => {
    const result = run(kpi, { actual: target * 2, target }, { actual: target * 2, target });
    expect(result.right.targetFormatted).toBe(text);
    expect(result.description).toContain(`the ${text} target`);
  });
});

describe('descriptionBody', () => {
  it('drops the leading "<Classification> — " and keeps the rest', () => {
    const result = run('Lunch', { actual: 58, target: 60 }, { actual: 60, target: 60 });
    expect(result.description).toBe('Improved — Lunch participation increased by 2 percentage points and meets the 60% target.');
    expect(result.descriptionBody).toBe('Lunch participation increased by 2 percentage points and meets the 60% target.');
  });

  it('works for No Data and baseline-zero prefixes', () => {
    expect(run('Lunch', { actual: null }, { actual: 60 }).descriptionBody).toMatch(/^Lunch participation could not be compared/);
    expect(run('Revenue', { actual: 0 }, { actual: 5000 }).descriptionBody).toMatch(/^Revenue increased by \$5,000 from \$0/);
  });

  it('leaves informational descriptions (no prefix) unchanged', () => {
    const result = run('Inventory Turnover Rate', { actual: 16 }, { actual: 14 });
    expect(result.descriptionBody).toBe(result.description);
  });
});
