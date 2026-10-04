import { beforeEach, describe, expect, it } from 'vitest';
import { COMPARISON_KPI_KEYS } from '../../../constants/kpiDefinitions';
import { ALL_SITES_ID, SITE_TYPE_IDS } from '../../../data/siteRegistry';
import { COMPARISON_SECTION_IDS, EMPTY_SIDE, isSideComplete, useComparisonStore } from './useComparisonStore';

const store = () => useComparisonStore.getState();

const setBothSides = () => {
  store().setSideSites('left', [ALL_SITES_ID]);
  store().setSideTimeframe('left', { optionId: 'prior_year' });
  store().setSideSites('right', [SITE_TYPE_IDS.high]);
  store().setSideTimeframe('right', { optionId: 'ytd' });
};

beforeEach(() => store().resetComparison());

describe('initial state (spec §3 "Default comparison: None")', () => {
  it('starts with both sides empty, all 17 KPIs, and no Needs Attention, focus, or interval', () => {
    const state = store();
    expect(state.left).toEqual(EMPTY_SIDE);
    expect(state.right).toEqual(EMPTY_SIDE);
    expect(state.kpiFilter).toEqual(COMPARISON_KPI_KEYS);
    expect(state.kpiFilter).toHaveLength(17);
    expect(state.needsAttentionOnly).toBe(false);
    expect(state.focusedKpi).toBeNull();
    expect(state.trendInterval).toBeNull();
  });
});

describe('isSideComplete', () => {
  it('needs a non-empty site scope and a timeframe', () => {
    expect(isSideComplete(EMPTY_SIDE)).toBe(false);
    expect(isSideComplete({ sites: [1], timeframe: null })).toBe(false);
    expect(isSideComplete({ sites: [], timeframe: { optionId: 'ytd' } })).toBe(false);
    expect(isSideComplete({ sites: [1], timeframe: { optionId: 'ytd' } })).toBe(true);
  });
});

describe('side definitions', () => {
  it('stores an empty site selection as "not chosen"', () => {
    store().setSideSites('left', [1, 2]);
    store().setSideSites('left', []);
    expect(store().left.sites).toBeNull();
  });

  it('sets each side independently', () => {
    store().setSideSites('left', [1]);
    store().setSideTimeframe('right', { optionId: 'this_week' });
    expect(store().left).toEqual({ sites: [1], timeframe: null });
    expect(store().right).toEqual({ sites: null, timeframe: { optionId: 'this_week' } });
  });
});

describe('swapSides (spec §6 Swap)', () => {
  it('does nothing until both sides are set', () => {
    store().setSideSites('left', [1]);
    store().setSideTimeframe('left', { optionId: 'ytd' });
    store().swapSides();
    expect(store().left).toEqual({ sites: [1], timeframe: { optionId: 'ytd' } });
    expect(store().right).toEqual(EMPTY_SIDE);
  });

  it('exchanges the complete definitions, including custom ranges', () => {
    setBothSides();
    store().setSideTimeframe('right', { optionId: 'custom', customRange: { start: '2025-08-01', end: '2025-09-30' } });
    const { left, right } = store();
    store().swapSides();
    expect(store().left).toEqual(right);
    expect(store().right).toEqual(left);
  });

  it('leaves filters and focus alone', () => {
    setBothSides();
    store().setKpiFilter(['Lunch', 'MPLH']);
    store().setNeedsAttentionOnly(true);
    store().setFocusedKpi('Lunch');
    store().swapSides();
    expect(store().kpiFilter).toEqual(['Lunch', 'MPLH']);
    expect(store().needsAttentionOnly).toBe(true);
    expect(store().focusedKpi).toBe('Lunch');
  });
});

describe('KPI filter and focused KPI (spec §6)', () => {
  it('keeps the filter in spec §4 order', () => {
    store().setKpiFilter(['Waste', 'Breakfast', 'MPLH']);
    expect(store().kpiFilter).toEqual(['Breakfast', 'MPLH', 'Waste']);
  });

  it('keeps focus when the focused KPI stays in the filter', () => {
    store().setFocusedKpi('Revenue');
    store().setKpiFilter(['Revenue', 'Meals']);
    expect(store().focusedKpi).toBe('Revenue');
  });

  it('clears focus when the filter removes the focused KPI', () => {
    store().setFocusedKpi('Revenue');
    store().setKpiFilter(['Meals']);
    expect(store().focusedKpi).toBeNull();
  });

  it('focusing a KPI never changes the filter', () => {
    store().setKpiFilter(['Meals']);
    store().setFocusedKpi('Meals');
    expect(store().kpiFilter).toEqual(['Meals']);
  });
});

describe('resetFilters (spec §6 Clear Filters/Reset)', () => {
  it('resets the KPI filter and Needs Attention but not the sides', () => {
    setBothSides();
    const { left, right } = store();
    store().setKpiFilter([]);
    store().setNeedsAttentionOnly(true);
    store().resetFilters();
    expect(store().kpiFilter).toEqual(COMPARISON_KPI_KEYS);
    expect(store().needsAttentionOnly).toBe(false);
    expect(store().left).toEqual(left);
    expect(store().right).toEqual(right);
  });
});

describe('collapsible sections', () => {
  it('starts with every section expanded', () => {
    for (const section of COMPARISON_SECTION_IDS) expect(store().expandedSections[section]).toBe(true);
  });

  it('toggles one section at a time', () => {
    store().toggleSection('summary');
    expect(store().expandedSections.summary).toBe(false);
    expect(store().expandedSections.kpiTable).toBe(true);
    store().toggleSection('summary');
    expect(store().expandedSections.summary).toBe(true);
  });

  it('keeps collapse state through Clear Filters and Swap', () => {
    setBothSides();
    store().toggleSection('setup');
    store().resetFilters();
    store().swapSides();
    expect(store().expandedSections.setup).toBe(false);
  });
});
