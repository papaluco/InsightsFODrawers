import { beforeEach, describe, expect, it } from 'vitest';
import { useComparisonStore } from '../store/useComparisonStore';
import { getComparisonContextKey } from './contextKey';

const currentKey = () => getComparisonContextKey(useComparisonStore.getState());

describe('getComparisonContextKey (NXT-77214 §11 stale state)', () => {
  beforeEach(() => {
    const store = useComparisonStore.getState();
    store.resetComparison();
    store.setSideSites('left', [0]);
    store.setSideTimeframe('left', { optionId: 'prior_ytd' });
    store.setSideSites('right', [0]);
    store.setSideTimeframe('right', { optionId: 'ytd' });
  });

  it('is stable for the same context', () => {
    expect(currentKey()).toBe(currentKey());
  });

  it('changes when a side changes', () => {
    const before = currentKey();
    useComparisonStore.getState().setSideSites('right', [104]);
    expect(currentKey()).not.toBe(before);
    const afterSites = currentKey();
    useComparisonStore.getState().setSideTimeframe('left', { optionId: 'prior_year' });
    expect(currentKey()).not.toBe(afterSites);
  });

  it('changes with custom-range dates, not just the option', () => {
    const store = useComparisonStore.getState();
    store.setSideTimeframe('right', { optionId: 'custom', customRange: { start: '2025-09-01', end: '2025-09-30' } });
    const september = currentKey();
    store.setSideTimeframe('right', { optionId: 'custom', customRange: { start: '2025-10-01', end: '2025-10-31' } });
    expect(currentKey()).not.toBe(september);
  });

  it('changes on swap (orientation)', () => {
    const before = currentKey();
    useComparisonStore.getState().swapSides();
    expect(currentKey()).not.toBe(before);
    useComparisonStore.getState().swapSides();
    expect(currentKey()).toBe(before);
  });

  it('changes with the KPI filter and Needs Attention', () => {
    const before = currentKey();
    useComparisonStore.getState().setKpiFilter(['Lunch', 'Breakfast']);
    const filtered = currentKey();
    expect(filtered).not.toBe(before);
    useComparisonStore.getState().setNeedsAttentionOnly(true);
    expect(currentKey()).not.toBe(filtered);
  });

  it('does not change when a KPI is focused or the trend interval changes', () => {
    const before = currentKey();
    useComparisonStore.getState().setFocusedKpi('Lunch');
    useComparisonStore.getState().setTrendInterval('month');
    expect(currentKey()).toBe(before);
  });

  it('ignores site order within a side', () => {
    useComparisonStore.getState().setSideSites('right', [1, 2]);
    const ordered = currentKey();
    useComparisonStore.getState().setSideSites('right', [2, 1]);
    expect(currentKey()).toBe(ordered);
  });
});
