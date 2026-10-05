/**
 * Canonical demo site registry (NXT-77201 spec §9).
 *
 * Promoted from DemoSchoolSelector and kept in its `{ siteTypeList, siteList }`
 * shape so the selector keeps working. Site names reuse those in the MPLH, PNA,
 * and ENP mocks where possible.
 *
 * Selection model (unchanged from DemoSchoolSelector): a flat array of IDs where
 * 0 = All, 101–105 = site types, and 1–18 = individual sites.
 */

export interface SiteType {
  siteTypeId: number;
  siteTypeName: string;
  /** Used for generated labels, e.g. "High Schools" (spec §6). */
  siteTypePluralName: string;
}

export interface Site {
  siteId: number;
  siteName: string;
  siteTypeId: number;
}

export interface SiteRegistry {
  siteTypeList: SiteType[];
  siteList: Site[];
}

/** Selection ID meaning "every site". */
export const ALL_SITES_ID = 0;

/** A site selection: any mix of ALL_SITES_ID, site type IDs, and site IDs. */
export type SiteSelection = number[];

export const SITE_TYPE_IDS = {
  centralOffice: 101,
  childCare: 102,
  elementary: 103,
  high: 104,
  middle: 105,
} as const;

export const DEMO_SITES: SiteRegistry = {
  siteTypeList: [
    { siteTypeId: SITE_TYPE_IDS.centralOffice, siteTypeName: 'Central Office', siteTypePluralName: 'Central Office' },
    { siteTypeId: SITE_TYPE_IDS.childCare, siteTypeName: 'Child Care Facility Provider', siteTypePluralName: 'Child Care Facility Providers' },
    { siteTypeId: SITE_TYPE_IDS.elementary, siteTypeName: 'Elementary School', siteTypePluralName: 'Elementary Schools' },
    { siteTypeId: SITE_TYPE_IDS.high, siteTypeName: 'High School', siteTypePluralName: 'High Schools' },
    { siteTypeId: SITE_TYPE_IDS.middle, siteTypeName: 'Middle School', siteTypePluralName: 'Middle Schools' },
  ],
  siteList: [
    // Elementary
    { siteId: 1, siteName: 'Lincoln Elementary', siteTypeId: SITE_TYPE_IDS.elementary },
    { siteId: 2, siteName: 'Jefferson Elementary', siteTypeId: SITE_TYPE_IDS.elementary },
    { siteId: 3, siteName: 'Monroe Elementary', siteTypeId: SITE_TYPE_IDS.elementary },
    { siteId: 4, siteName: 'Arbutus Elementary', siteTypeId: SITE_TYPE_IDS.elementary },
    { siteId: 5, siteName: 'Franklin Elementary', siteTypeId: SITE_TYPE_IDS.elementary },
    { siteId: 6, siteName: 'Garfield Elementary', siteTypeId: SITE_TYPE_IDS.elementary },
    // Middle
    { siteId: 7, siteName: 'Washington Middle', siteTypeId: SITE_TYPE_IDS.middle },
    { siteId: 8, siteName: 'Adams Middle', siteTypeId: SITE_TYPE_IDS.middle },
    { siteId: 9, siteName: 'Jackson Middle', siteTypeId: SITE_TYPE_IDS.middle },
    { siteId: 10, siteName: 'Madison Middle', siteTypeId: SITE_TYPE_IDS.middle },
    { siteId: 11, siteName: 'Kennedy Middle', siteTypeId: SITE_TYPE_IDS.middle },
    // High
    { siteId: 12, siteName: 'Roosevelt High', siteTypeId: SITE_TYPE_IDS.high },
    { siteId: 13, siteName: 'Madison High', siteTypeId: SITE_TYPE_IDS.high },
    { siteId: 14, siteName: 'Hamilton High', siteTypeId: SITE_TYPE_IDS.high },
    { siteId: 15, siteName: 'Truman High', siteTypeId: SITE_TYPE_IDS.high },
    { siteId: 16, siteName: 'Wilson High', siteTypeId: SITE_TYPE_IDS.high },
    // Other
    { siteId: 17, siteName: 'District Central Office', siteTypeId: SITE_TYPE_IDS.centralOffice },
    { siteId: 18, siteName: 'Little Learners Child Care Center', siteTypeId: SITE_TYPE_IDS.childCare },
  ],
};

export function getSiteById(siteId: number, registry: SiteRegistry = DEMO_SITES): Site | undefined {
  return registry.siteList.find(s => s.siteId === siteId);
}

export function getSiteTypeById(siteTypeId: number, registry: SiteRegistry = DEMO_SITES): SiteType | undefined {
  return registry.siteTypeList.find(t => t.siteTypeId === siteTypeId);
}

/** Site IDs belonging to a site type, ascending. */
export function getSiteIdsForType(siteTypeId: number, registry: SiteRegistry = DEMO_SITES): number[] {
  return registry.siteList
    .filter(s => s.siteTypeId === siteTypeId)
    .map(s => s.siteId)
    .sort((a, b) => a - b);
}

/**
 * Expands a selection to the site IDs it covers (ascending, no duplicates).
 * All → every site; a site type → its member sites; a site → itself. Unknown IDs are ignored.
 */
export function resolveSiteScope(selection: SiteSelection, registry: SiteRegistry = DEMO_SITES): number[] {
  if (selection.includes(ALL_SITES_ID)) return registry.siteList.map(s => s.siteId).sort((a, b) => a - b);

  const siteIds = new Set<number>();
  for (const id of selection) {
    if (getSiteById(id, registry)) siteIds.add(id);
    else if (getSiteTypeById(id, registry)) getSiteIdsForType(id, registry).forEach(siteId => siteIds.add(siteId));
  }
  return Array.from(siteIds).sort((a, b) => a - b);
}

function sameIds(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/** The site type whose members are exactly `siteIds` (ascending), if any. */
export function findSiteTypeMatchingScope(siteIds: number[], registry: SiteRegistry = DEMO_SITES): SiteType | undefined {
  if (siteIds.length === 0) return undefined;
  return registry.siteTypeList.find(t => sameIds(getSiteIdsForType(t.siteTypeId, registry), siteIds));
}

export function isAllSites(siteIds: number[], registry: SiteRegistry = DEMO_SITES): boolean {
  return siteIds.length > 0 && sameIds(siteIds, resolveSiteScope([ALL_SITES_ID], registry));
}

/**
 * Site part of a side's generated label (spec §6), based on the sites the selection resolves to:
 * every site → "All Sites"; one site → its name; exactly one site type's members → plural type
 * name ("High Schools"); anything else → "Multiple Sites (N)" with the resolved site count, so two
 * different multi-site selections are told apart. Null when the selection resolves to no sites.
 */
export function getSiteScopeLabel(selection: SiteSelection, registry: SiteRegistry = DEMO_SITES): string | null {
  const siteIds = resolveSiteScope(selection, registry);
  if (siteIds.length === 0) return null;
  if (isAllSites(siteIds, registry)) return 'All Sites';
  if (siteIds.length === 1) return getSiteById(siteIds[0], registry)?.siteName ?? null;
  const matchingType = findSiteTypeMatchingScope(siteIds, registry);
  if (matchingType) return matchingType.siteTypePluralName;
  return `Multiple Sites (${siteIds.length})`;
}

/**
 * Button label for the dashboard's DemoSchoolSelector. Like getSiteScopeLabel but keeps the
 * dashboard's wording ("All Schools", "N Schools Selected"). Counts resolved sites, so a
 * type-only selection no longer shows "0 Schools Selected".
 */
export function getSiteSelectorLabel(selection: SiteSelection, registry: SiteRegistry = DEMO_SITES): string {
  if (selection.includes(ALL_SITES_ID)) return 'All Schools';
  const siteIds = resolveSiteScope(selection, registry);
  if (siteIds.length === 1) return getSiteById(siteIds[0], registry)?.siteName ?? '1 School Selected';
  const matchingType = findSiteTypeMatchingScope(siteIds, registry);
  if (matchingType) return matchingType.siteTypePluralName;
  return `${siteIds.length} Schools Selected`;
}

export type SiteScopeKind = 'site' | 'siteType' | 'allSites' | 'multipleSites';

/**
 * Classifies resolved site IDs for benchmark precedence (spec §3), using the same rules
 * as getSiteScopeLabel: every site → allSites; one site → site (even when it came from a
 * one-site type); exactly one type's members → siteType; otherwise multipleSites.
 * Null for an empty scope.
 */
export function getSiteScopeType(siteIds: number[], registry: SiteRegistry = DEMO_SITES): SiteScopeKind | null {
  const sorted = [...siteIds].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  if (isAllSites(sorted, registry)) return 'allSites';
  if (sorted.length === 1) return 'site';
  if (findSiteTypeMatchingScope(sorted, registry)) return 'siteType';
  return 'multipleSites';
}
