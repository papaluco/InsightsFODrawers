import { describe, expect, it } from 'vitest';
import {
  ALL_SITES_ID,
  DEMO_SITES,
  getSiteIdsForType,
  getSiteScopeLabel,
  getSiteSelectorLabel,
  resolveSiteScope,
  SITE_TYPE_IDS,
} from './siteRegistry';

const ALL_SITE_IDS = Array.from({ length: 18 }, (_, i) => i + 1);
const HIGH_SCHOOL_IDS = [12, 13, 14, 15, 16];

describe('DEMO_SITES registry', () => {
  it('has 18 sites across 5 site types', () => {
    expect(DEMO_SITES.siteList).toHaveLength(18);
    expect(DEMO_SITES.siteTypeList).toHaveLength(5);
  });

  it('keeps the original site types, including Child Care Facility Provider', () => {
    expect(DEMO_SITES.siteTypeList.map(t => [t.siteTypeId, t.siteTypeName])).toEqual([
      [101, 'Central Office'],
      [102, 'Child Care Facility Provider'],
      [103, 'Elementary School'],
      [104, 'High School'],
      [105, 'Middle School'],
    ]);
  });

  it('gives every site type at least one site and every site a known type', () => {
    const typeIds = DEMO_SITES.siteTypeList.map(t => t.siteTypeId);
    for (const typeId of typeIds) expect(getSiteIdsForType(typeId).length).toBeGreaterThan(0);
    for (const site of DEMO_SITES.siteList) expect(typeIds).toContain(site.siteTypeId);
  });

  it('uses unique IDs that never collide with site type IDs or All', () => {
    const siteIds = DEMO_SITES.siteList.map(s => s.siteId);
    const typeIds = DEMO_SITES.siteTypeList.map(t => t.siteTypeId);
    expect(new Set(siteIds).size).toBe(siteIds.length);
    expect(siteIds).not.toContain(ALL_SITES_ID);
    expect(siteIds.some(id => typeIds.includes(id))).toBe(false);
  });

  it('has several elementary, middle, and high schools', () => {
    expect(getSiteIdsForType(SITE_TYPE_IDS.elementary).length).toBeGreaterThanOrEqual(4);
    expect(getSiteIdsForType(SITE_TYPE_IDS.middle).length).toBeGreaterThanOrEqual(4);
    expect(getSiteIdsForType(SITE_TYPE_IDS.high).length).toBeGreaterThanOrEqual(4);
  });
});

describe('resolveSiteScope', () => {
  it('expands All to every site', () => {
    expect(resolveSiteScope([ALL_SITES_ID])).toEqual(ALL_SITE_IDS);
    expect(resolveSiteScope([ALL_SITES_ID, 1, 104])).toEqual(ALL_SITE_IDS);
  });

  it('expands a site type to its member sites', () => {
    expect(resolveSiteScope([SITE_TYPE_IDS.high])).toEqual(HIGH_SCHOOL_IDS);
  });

  it('combines types and sites, sorted and de-duplicated', () => {
    expect(resolveSiteScope([SITE_TYPE_IDS.high, 1])).toEqual([1, ...HIGH_SCHOOL_IDS]);
    expect(resolveSiteScope([12, SITE_TYPE_IDS.high, 12])).toEqual(HIGH_SCHOOL_IDS);
    expect(resolveSiteScope([3, 1, 2])).toEqual([1, 2, 3]);
  });

  it('returns nothing for an empty selection and ignores unknown IDs', () => {
    expect(resolveSiteScope([])).toEqual([]);
    expect(resolveSiteScope([999])).toEqual([]);
    expect(resolveSiteScope([999, 1])).toEqual([1]);
  });
});

describe('getSiteScopeLabel (spec §6)', () => {
  it('All → "All Sites"', () => {
    expect(getSiteScopeLabel([ALL_SITES_ID])).toBe('All Sites');
  });

  it('selecting every site another way is still "All Sites"', () => {
    expect(getSiteScopeLabel(DEMO_SITES.siteTypeList.map(t => t.siteTypeId))).toBe('All Sites');
    expect(getSiteScopeLabel(ALL_SITE_IDS)).toBe('All Sites');
  });

  it('a single site → its name', () => {
    expect(getSiteScopeLabel([1])).toBe('Lincoln Elementary');
    expect(getSiteScopeLabel([12])).toBe('Roosevelt High');
  });

  it('one site type → its plural name', () => {
    expect(getSiteScopeLabel([SITE_TYPE_IDS.high])).toBe('High Schools');
    expect(getSiteScopeLabel([SITE_TYPE_IDS.elementary])).toBe('Elementary Schools');
    expect(getSiteScopeLabel(HIGH_SCHOOL_IDS)).toBe('High Schools'); // every member picked individually
  });

  it('a one-site type resolves to that site, so it shows the site name', () => {
    expect(getSiteScopeLabel([SITE_TYPE_IDS.centralOffice])).toBe('District Central Office');
  });

  it('anything else → "Multiple Sites"', () => {
    expect(getSiteScopeLabel([1, 2])).toBe('Multiple Sites');
    expect(getSiteScopeLabel([SITE_TYPE_IDS.high, 1])).toBe('Multiple Sites');
    expect(getSiteScopeLabel([SITE_TYPE_IDS.high, SITE_TYPE_IDS.middle])).toBe('Multiple Sites');
    expect(getSiteScopeLabel([12, 13])).toBe('Multiple Sites'); // part of a type
  });

  it('is null when nothing is selected', () => {
    expect(getSiteScopeLabel([])).toBeNull();
  });
});

describe('getSiteSelectorLabel (dashboard DemoSchoolSelector)', () => {
  it('keeps "All Schools" and single-site names', () => {
    expect(getSiteSelectorLabel([ALL_SITES_ID])).toBe('All Schools');
    expect(getSiteSelectorLabel([1])).toBe('Lincoln Elementary');
  });

  it('a type-only selection no longer shows "0 Schools Selected"', () => {
    expect(getSiteSelectorLabel([SITE_TYPE_IDS.elementary])).toBe('Elementary Schools');
    expect(getSiteSelectorLabel([SITE_TYPE_IDS.elementary, SITE_TYPE_IDS.middle])).toBe('11 Schools Selected');
  });

  it('counts resolved sites for mixed selections', () => {
    expect(getSiteSelectorLabel([1, 7])).toBe('2 Schools Selected');
    expect(getSiteSelectorLabel([SITE_TYPE_IDS.high, 1])).toBe('6 Schools Selected');
  });

  it('shows 0 only when nothing is selected', () => {
    expect(getSiteSelectorLabel([])).toBe('0 Schools Selected');
  });
});
