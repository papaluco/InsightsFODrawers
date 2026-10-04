import { describe, expect, it } from 'vitest';
import { evaluateSiteAgainstTarget, evaluateSiteDrivers, SiteDriversSideInput, summarizeSiteTargets } from './siteDrivers';

const side = (label: string, timeframeLabel: string, sites: SiteDriversSideInput['sites']): SiteDriversSideInput => ({
  label,
  timeframeLabel,
  sites,
});

const highSchools2425 = side('High Schools · SY 2024–25', 'SY 2024–25', [
  { siteId: 12, siteName: 'Roosevelt High', actual: 54, target: 55 },
  { siteId: 13, siteName: 'Madison High', actual: 63, target: 60 },
  { siteId: 14, siteName: 'Hamilton High', actual: null, target: 60 },
]);
const highSchools2526 = side('High Schools · SY 2025–26', 'SY 2025–26', [
  { siteId: 12, siteName: 'Roosevelt High', actual: 59, target: 58 },
  { siteId: 13, siteName: 'Madison High', actual: 60, target: 62 },
  { siteId: 14, siteName: 'Hamilton High', actual: 61, target: null },
]);

describe('evaluateSiteAgainstTarget', () => {
  it('uses the site\'s own target and reports variance', () => {
    expect(evaluateSiteAgainstTarget('Lunch', { siteId: 12, siteName: 'Roosevelt High', actual: 54, target: 55 })).toMatchObject({
      targetStatus: 'NotMet',
      varianceFromTarget: -1,
      unfavorableVariance: 1, // 1 pt short
      actualFormatted: '54.0%',
      targetFormatted: '55%',
    });
  });

  it('flips the unfavorable direction for lower-is-favorable KPIs', () => {
    expect(evaluateSiteAgainstTarget('Waste', { siteId: 1, siteName: 'Lincoln Elementary', actual: 1200, target: 1000 }))
      .toMatchObject({ targetStatus: 'NotMet', varianceFromTarget: 200, unfavorableVariance: 200 });
    expect(evaluateSiteAgainstTarget('Waste', { siteId: 1, siteName: 'Lincoln Elementary', actual: 900, target: 1000 }))
      .toMatchObject({ targetStatus: 'Met', unfavorableVariance: -100 });
  });

  it('has no variance without data, without a target, or for informational KPIs', () => {
    expect(evaluateSiteAgainstTarget('Lunch', { siteId: 1, siteName: 'X', actual: null, target: 60 })).toMatchObject({ targetStatus: 'NotAvailable', varianceFromTarget: null, actualFormatted: 'No Data' });
    expect(evaluateSiteAgainstTarget('Lunch', { siteId: 1, siteName: 'X', actual: 50, target: null }).varianceFromTarget).toBeNull();
    expect(evaluateSiteAgainstTarget('Inventory Turnover Rate', { siteId: 1, siteName: 'X', actual: 20, target: 16 }))
      .toMatchObject({ targetStatus: 'NotAvailable', varianceFromTarget: null, target: 16 });
  });
});

describe('summarizeSiteTargets', () => {
  it('counts only sites with data and a target in the denominator', () => {
    const sites = highSchools2425.sites.map(s => evaluateSiteAgainstTarget('Lunch', s));
    expect(summarizeSiteTargets(sites)).toEqual({ sitesInScope: 3, sitesWithTarget: 2, meetingTarget: 1, notMeetingTarget: 1 });
  });
});

describe('evaluateSiteDrivers', () => {
  it('matched site sets → one engine result per site, labeled by site and timeframe', () => {
    const result = evaluateSiteDrivers('Lunch', highSchools2425, highSchools2526);
    expect(result).toMatchObject({ available: true, matched: true });
    const roosevelt = result.matchedSites?.find(s => s.siteId === 12)?.result;
    expect(roosevelt).toMatchObject({ classification: 'Improved', targetTransition: 'NotMetToMet' });
    expect(roosevelt?.description).toBe('Improved — Lunch participation increased by 5 percentage points and meets the 58% target.');

    const madison = result.matchedSites?.find(s => s.siteId === 13)?.result;
    expect(madison).toMatchObject({ classification: 'Declined', needsAttentionReasons: ['Declined', 'BelowTarget'] });

    const hamilton = result.matchedSites?.find(s => s.siteId === 14)?.result;
    expect(hamilton?.classification).toBe('NoData');
    expect(hamilton?.description).toContain('Hamilton High · SY 2024–25');
  });

  it('summarizes each side\'s sites against their own targets', () => {
    const result = evaluateSiteDrivers('Lunch', highSchools2425, highSchools2526);
    expect(result.left.summary).toEqual({ sitesInScope: 3, sitesWithTarget: 2, meetingTarget: 1, notMeetingTarget: 1 });
    expect(result.right.summary).toEqual({ sitesInScope: 3, sitesWithTarget: 2, meetingTarget: 1, notMeetingTarget: 1 });
  });

  it('different site sets → unmatched, each side listed independently', () => {
    const oneSite = side('Roosevelt High · SY 2025–26', 'SY 2025–26', [highSchools2526.sites[0]]);
    const result = evaluateSiteDrivers('Lunch', highSchools2425, oneSite);
    expect(result).toMatchObject({ available: true, matched: false, matchedSites: null });
    expect(result.right.sites).toHaveLength(1);
  });

  it('is unavailable when both sides are a single site', () => {
    const a = side('Roosevelt High · SY 2024–25', 'SY 2024–25', [highSchools2425.sites[0]]);
    const b = side('Roosevelt High · SY 2025–26', 'SY 2025–26', [highSchools2526.sites[0]]);
    expect(evaluateSiteDrivers('Lunch', a, b)).toMatchObject({ available: false, matched: true });
  });
});
