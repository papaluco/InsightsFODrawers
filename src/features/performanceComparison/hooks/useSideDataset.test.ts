import { describe, expect, it } from 'vitest';
import { getSideSelectionKey } from './useSideDataset';

describe('getSideSelectionKey', () => {
  it('is null until the side has sites and a timeframe', () => {
    expect(getSideSelectionKey({ sites: null, timeframe: null })).toBeNull();
    expect(getSideSelectionKey({ sites: [1], timeframe: null })).toBeNull();
    expect(getSideSelectionKey({ sites: null, timeframe: { optionId: 'ytd' } })).toBeNull();
  });

  it('ignores site order', () => {
    expect(getSideSelectionKey({ sites: [3, 1, 2], timeframe: { optionId: 'ytd' } })).toBe(
      getSideSelectionKey({ sites: [1, 2, 3], timeframe: { optionId: 'ytd' } }),
    );
  });

  it('changes with the timeframe, including a custom range', () => {
    const custom = (end: string) =>
      getSideSelectionKey({ sites: [1], timeframe: { optionId: 'custom', customRange: { start: '2025-08-01', end } } });
    expect(getSideSelectionKey({ sites: [1], timeframe: { optionId: 'ytd' } })).not.toBe(
      getSideSelectionKey({ sites: [1], timeframe: { optionId: 'prior_ytd' } }),
    );
    expect(custom('2025-09-30')).not.toBe(custom('2025-10-31'));
  });

  it('round-trips the request it encodes', () => {
    const key = getSideSelectionKey({ sites: [12, 13], timeframe: { optionId: 'custom', customRange: { start: '2025-08-01', end: '2025-09-30' } } });
    expect(JSON.parse(key!)).toEqual({ sites: [12, 13], timeframe: { optionId: 'custom', customRange: { start: '2025-08-01', end: '2025-09-30' } } });
  });
});
