import { describe, expect, it } from 'vitest';
import { evaluateSiteDrivers, SiteDriversSideInput, SiteValuesInput } from '../engine/siteDrivers';
import { toTsv } from './kpiTableExport';
import { buildMatchedSitesExport, buildSideSitesExport } from './siteDriversExport';
import { sortMatchedSites, sortSiteEvaluations } from './siteDriversView';

const side = (label: string, timeframeLabel: string, sites: SiteValuesInput[]): SiteDriversSideInput => ({ label, timeframeLabel, sites });
const site = (siteId: number, siteName: string, actual: number | null, target: number | null): SiteValuesInput => ({ siteId, siteName, actual, target });

const left = side('High Schools · SY 2024–25', 'SY 2024–25', [
  site(1, 'Adams High', 58, 60),
  site(2, 'Brook High', 61, 60),
  site(3, 'Cedar High', 62, 60),
]);
const right = side('High Schools · SY 2025–26', 'SY 2025–26', [
  site(1, 'Adams High', 57, 62),
  site(2, 'Brook High', 61, 60),
  site(3, 'Cedar High', null, 62),
]);
const middle = side('Middle Schools · SY 2025–26', 'SY 2025–26', [
  site(6, 'Fox Middle', 70, 60),
  site(7, 'Gray Middle', 50, null),
]);

describe('buildMatchedSitesExport (Site Drivers drawer copy)', () => {
  const drivers = evaluateSiteDrivers('Lunch', left, right);
  const sites = sortMatchedSites(drivers.matchedSites ?? [], null);
  const table = buildMatchedSitesExport('Lunch', sites, ['SY 2024–25', 'SY 2025–26']);

  it('uses the drawer columns, naming sides by their compact names', () => {
    expect(table.headers).toEqual(['Site', 'SY 2024–25', 'SY 2025–26', 'Change', 'Target', 'Variance from target (SY 2025–26)', 'Status']);
  });

  it('keeps the displayed row order and text, with "—" (never 0) for missing values', () => {
    expect(table.rows.map(r => r[0])).toEqual(sites.map(s => s.siteName));
    const adams = table.rows.find(r => r[0] === 'Adams High')!;
    expect(adams).toEqual(['Adams High', '58.0%', '57.0%', '−1.0%', '60% → 62%', '−5.0%', 'Declined · Not Met → Not Met']);
    const brook = table.rows.find(r => r[0] === 'Brook High')!;
    expect(brook[4]).toBe('60%'); // same target on both sides → shown once
    const cedar = table.rows.find(r => r[0] === 'Cedar High')!;
    expect(cedar[2]).toBe('No Data');
    expect(cedar[3]).toBe('—');
    expect(cedar[5]).toBe('—');
  });

  it('follows a column sort', () => {
    const byName = sortMatchedSites(drivers.matchedSites ?? [], { key: 'site', direction: 'desc' });
    expect(buildMatchedSitesExport('Lunch', byName, ['a', 'b']).rows.map(r => r[0])).toEqual(['Cedar High', 'Brook High', 'Adams High']);
  });

  it('is tab-separated for the clipboard', () => {
    expect(toTsv(table).split('\n')[0]).toBe('Site\tSY 2024–25\tSY 2025–26\tChange\tTarget\tVariance from target (SY 2025–26)\tStatus');
  });
});

describe('buildSideSitesExport (unmatched populations)', () => {
  it('lists one side with actual, target, target status, and variance', () => {
    const drivers = evaluateSiteDrivers('Lunch', left, middle);
    const table = buildSideSitesExport('Lunch', sortSiteEvaluations(drivers.right.sites, null));
    expect(table.headers).toEqual(['Site', 'Actual', 'Target', 'Target Status', 'Variance from target']);
    expect(table.rows).toEqual([
      ['Fox Middle', '70.0%', '60%', 'Met', '+10.0%'],
      ['Gray Middle', '50.0%', '—', 'No target', '—'],
    ]);
  });

  it('drops status and variance for informational KPIs (no target status, spec §3)', () => {
    const inventory = (label: string) =>
      side(label, 'SY 2025–26', [site(6, 'Fox Middle', 100000, null), site(7, 'Gray Middle', 120000, null)]);
    const drivers = evaluateSiteDrivers('Inventory Value', inventory('A · SY'), inventory('B · SY'));
    const table = buildSideSitesExport('Inventory Value', drivers.right.sites);
    expect(table.headers).toEqual(['Site', 'Actual']);
  });
});
