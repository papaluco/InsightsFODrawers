import { describe, expect, it } from 'vitest';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { evaluateSiteDrivers, SiteDriversSideInput, SiteValuesInput } from '../engine/siteDrivers';
import { getSiteDriversSummaryLines, nextSiteSort, sortMatchedSites, sortSiteEvaluations } from './siteDriversView';

const side = (label: string, timeframeLabel: string, sites: SiteValuesInput[]): SiteDriversSideInput => ({ label, timeframeLabel, sites });

const site = (siteId: number, siteName: string, actual: number | null, target: number | null): SiteValuesInput => ({
  siteId,
  siteName,
  actual,
  target,
});

// Lunch, higher is favorable. Variance from target: Adams −5, Brook −1, Cedar +3, Dale no target, Elm No Data.
const highSchoolsLeft = side('High Schools · SY 2024–25', 'SY 2024–25', [
  site(1, 'Adams High', 58, 60),
  site(2, 'Brook High', 61, 60),
  site(3, 'Cedar High', 62, 60),
  site(4, 'Dale High', 50, null),
  site(5, 'Elm High', 55, 60),
]);
const highSchoolsRight = side('High Schools · SY 2025–26', 'SY 2025–26', [
  site(1, 'Adams High', 57, 62),
  site(2, 'Brook High', 61, 62),
  site(3, 'Cedar High', 65, 62),
  site(4, 'Dale High', 52, null),
  site(5, 'Elm High', null, 62),
]);
const middleSchools = side('Middle Schools · SY 2025–26', 'SY 2025–26', [
  site(6, 'Fox Middle', 70, 60),
  site(7, 'Gray Middle', 50, 60),
]);

const drivers = (kpi: ComparisonKpiKey, left: SiteDriversSideInput, right: SiteDriversSideInput) => evaluateSiteDrivers(kpi, left, right);
const names = (items: { siteName: string }[]) => items.map(s => s.siteName);

describe('getSiteDriversSummaryLines', () => {
  it('matched: left → right sites meeting target, denominator = sites with data and a target', () => {
    // Left: Brook and Cedar meet; Adams and Elm don't → 2 of 4. Right: only Cedar meets; Elm has No Data → 1 of 3.
    expect(getSiteDriversSummaryLines(drivers('Lunch', highSchoolsLeft, highSchoolsRight), ['SY 2024–25', 'SY 2025–26'])).toEqual([
      '2 of 4 → 1 of 3 sites meeting target',
    ]);
  });

  it('unmatched with one multi-site side: spec wording with the below-target count', () => {
    const single = side('Fox Middle · SY 2025–26', 'SY 2025–26', [site(6, 'Fox Middle', 70, 60)]);
    expect(getSiteDriversSummaryLines(drivers('Lunch', highSchoolsRight, single), ['High Schools', 'Fox Middle'])).toEqual([
      '1 of 3 sites meeting target · 2 below target',
    ]);
  });

  it('unmatched with two multi-site sides: one compact line per side, named by the differing part', () => {
    expect(getSiteDriversSummaryLines(drivers('Lunch', highSchoolsRight, middleSchools), ['High Schools', 'Middle Schools'])).toEqual([
      'High Schools: 1 of 3 meeting target',
      'Middle Schools: 1 of 2 meeting target',
    ]);
  });

  it('says "above target" for lower-is-favorable KPIs', () => {
    const waste = side('High Schools · SY 2025–26', 'SY 2025–26', [site(1, 'Adams High', 1200, 1000), site(2, 'Brook High', 900, 1000)]);
    const single = side('Fox Middle · SY 2025–26', 'SY 2025–26', [site(6, 'Fox Middle', 900, 1000)]);
    expect(getSiteDriversSummaryLines(drivers('Waste', waste, single), ['High Schools', 'Fox Middle'])).toEqual([
      '1 of 2 sites meeting target · 1 above target',
    ]);
  });

  it('no targets or no data: says so instead of "0 of 0"', () => {
    const noTargets = (s: SiteDriversSideInput) => ({ ...s, sites: s.sites.map(x => ({ ...x, target: null })) });
    expect(getSiteDriversSummaryLines(drivers('A La Carte', noTargets(highSchoolsLeft), noTargets(highSchoolsRight)), ['a', 'b'])).toEqual([
      'No site targets',
    ]);
    const noData = (s: SiteDriversSideInput) => ({ ...s, sites: s.sites.map(x => ({ ...x, actual: null })) });
    expect(getSiteDriversSummaryLines(drivers('Lunch', noData(highSchoolsLeft), highSchoolsRight), ['a', 'b'])).toEqual([
      'No site data → 1 of 3 sites meeting target',
    ]);
  });

  it('informational KPIs: site counts only', () => {
    expect(getSiteDriversSummaryLines(drivers('Inventory Value', highSchoolsLeft, highSchoolsRight), ['a', 'b'])).toEqual(['5 sites']);
  });

  it('is null when both sides are a single site', () => {
    const a = side('Adams High · SY 2024–25', 'SY 2024–25', [highSchoolsLeft.sites[0]]);
    const b = side('Adams High · SY 2025–26', 'SY 2025–26', [highSchoolsRight.sites[0]]);
    expect(getSiteDriversSummaryLines(drivers('Lunch', a, b), ['a', 'b'])).toBeNull();
  });
});

describe('default sort (spec §8)', () => {
  it('unmatched: largest unfavorable variance first, no target next, No Data last', () => {
    const result = drivers('Lunch', highSchoolsLeft, middleSchools);
    // Left variances: Adams −2 (short 2), Elm −5 (short 5), Brook +1, Cedar +2; Dale no target.
    expect(names(sortSiteEvaluations(result.left.sites, null))).toEqual(['Elm High', 'Adams High', 'Brook High', 'Cedar High', 'Dale High']);
  });

  it('matched: follows the right side; a site with No Data on the right is last', () => {
    const result = drivers('Lunch', highSchoolsLeft, highSchoolsRight);
    // Right: Adams short 5, Brook short 1, Cedar +3, Dale no target, Elm No Data.
    expect(names(sortMatchedSites(result.matchedSites ?? [], null))).toEqual(['Adams High', 'Brook High', 'Cedar High', 'Dale High', 'Elm High']);
  });

  it('respects direction for lower-is-favorable KPIs (over target is unfavorable)', () => {
    const waste = side('High Schools · SY 2025–26', 'SY 2025–26', [
      site(1, 'Adams High', 900, 1000),
      site(2, 'Brook High', 1300, 1000),
      site(3, 'Cedar High', 1100, 1000),
    ]);
    const result = drivers('Waste', waste, middleSchools);
    expect(names(sortSiteEvaluations(result.left.sites, null))).toEqual(['Brook High', 'Cedar High', 'Adams High']);
  });
});

describe('column sort', () => {
  it('keeps No Data last in both directions', () => {
    const result = drivers('Lunch', highSchoolsLeft, highSchoolsRight);
    const asc = sortMatchedSites(result.matchedSites ?? [], { key: 'rightActual', direction: 'asc' });
    const desc = sortMatchedSites(result.matchedSites ?? [], { key: 'rightActual', direction: 'desc' });
    expect(names(asc)).toEqual(['Dale High', 'Adams High', 'Brook High', 'Cedar High', 'Elm High']);
    expect(names(desc)).toEqual(['Cedar High', 'Brook High', 'Adams High', 'Dale High', 'Elm High']);
  });

  it('sorts by name, target, variance, and status', () => {
    const result = drivers('Lunch', highSchoolsLeft, middleSchools);
    expect(names(sortSiteEvaluations(result.left.sites, { key: 'site', direction: 'desc' }))).toEqual([
      'Elm High', 'Dale High', 'Cedar High', 'Brook High', 'Adams High',
    ]);
    expect(names(sortSiteEvaluations(result.left.sites, { key: 'variance', direction: 'asc' }))[0]).toBe('Cedar High');
    // Status ascending: Not Met, then Met, then no target.
    expect(names(sortSiteEvaluations(result.left.sites, { key: 'status', direction: 'asc' }))).toEqual([
      'Adams High', 'Elm High', 'Brook High', 'Cedar High', 'Dale High',
    ]);
    const byTarget = names(sortSiteEvaluations(result.left.sites, { key: 'target', direction: 'desc' }));
    expect(byTarget[byTarget.length - 1]).toBe('Dale High');
  });

  it('matched status sorts by classification, worst first', () => {
    const result = drivers('Lunch', highSchoolsLeft, highSchoolsRight);
    // Adams −1 pt (Declined), Brook 0 (Comparable), Cedar +3 (Improved), Dale +2 (Improved), Elm No Data.
    expect(names(sortMatchedSites(result.matchedSites ?? [], { key: 'status', direction: 'asc' }))).toEqual([
      'Adams High', 'Brook High', 'Cedar High', 'Dale High', 'Elm High',
    ]);
  });
});

describe('nextSiteSort', () => {
  it('flips the same column and starts new columns at their natural order', () => {
    expect(nextSiteSort(null, 'site')).toEqual({ key: 'site', direction: 'asc' });
    expect(nextSiteSort(null, 'variance')).toEqual({ key: 'variance', direction: 'desc' });
    expect(nextSiteSort({ key: 'variance', direction: 'desc' }, 'variance')).toEqual({ key: 'variance', direction: 'asc' });
  });
});
