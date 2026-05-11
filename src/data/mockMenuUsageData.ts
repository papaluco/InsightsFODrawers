import { MenuUsageEvent, MenuPlatform } from '../types/menuUsageTypes';

export const MENU_USER_NAMES: Record<string, string> = {
  'mu001': 'Sarah Bennett',
  'mu002': 'James Ortega',
  'mu003': 'Linda Zhao',
  'mu004': 'Carlos Rivera',
  'mu005': 'Rachel Kim',
  'mu006': 'Derek Thompson',
  'mu007': 'Monica Davis',
  'mu008': 'Patrick Wu',
  'mu009': 'Alicia Patel',
  'mu010': 'Tyler Brooks',
  'mu011': 'Jennifer Cruz',
  'mu012': 'Brandon Lee',
  'mu013': 'Susan Nguyen',
  'mu014': 'Marcus Hall',
  'mu015': 'Diana Foster',
  'mu016': 'Kevin Murray',
  'mu017': 'Amy Collins',
  'mu018': 'Robert Grant',
  'mu019': 'Tanya Jenkins',
  'mu020': 'Christopher Bell',
  'mu021': 'Nicole Adams',
  'mu022': 'Stephen King',
  'mu023': 'Laura Mitchell',
  'mu024': 'David Torres',
  'mu025': 'Emily Young',
};

export const MENU_DISTRICT_NAMES: Record<string, string> = {
  'md001': 'Pinewood USD',
  'md002': 'Riverside ISD',
  'md003': 'Oakmont CUSD',
  'md004': 'Summit Hills USD',
  'md005': 'Crestview Schools',
  'md006': 'Lakewood USD',
  'md007': 'Maplewood ISD',
  'md008': 'Highland CUSD',
};

const PLATFORM_BY_DISTRICT: Record<string, MenuPlatform> = {
  'md001': 'SchoolCafe',
  'md002': 'SchoolCafe',
  'md003': 'PrimeroEdge',
  'md004': 'SchoolCafe',
  'md005': 'PrimeroEdge',
  'md006': 'SchoolCafe',
  'md007': 'PrimeroEdge',
  'md008': 'SchoolCafe',
};

const USER_DISTRICT: Record<string, string> = {
  'mu001': 'md001', 'mu002': 'md001', 'mu003': 'md001', 'mu004': 'md001',
  'mu005': 'md002', 'mu006': 'md002', 'mu007': 'md002',
  'mu008': 'md003', 'mu009': 'md003', 'mu010': 'md003',
  'mu011': 'md004', 'mu012': 'md004', 'mu013': 'md004',
  'mu014': 'md005', 'mu015': 'md005', 'mu016': 'md005',
  'mu017': 'md006', 'mu018': 'md006', 'mu019': 'md006',
  'mu020': 'md007', 'mu021': 'md007', 'mu022': 'md007',
  'mu023': 'md008', 'mu024': 'md008', 'mu025': 'md008',
};

let sidx = 0;
function sid(): string { return `msess-${String(++sidx).padStart(4, '0')}`; }

function ts(date: string, hour: number, minute = 0): string {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;
}

function session(
  userId: string,
  date: string,
  hour: number,
  events: Array<[string, Record<string, unknown>]>
): MenuUsageEvent[] {
  const sessionId = sid();
  const districtId = USER_DISTRICT[userId];
  const platform = PLATFORM_BY_DISTRICT[districtId];
  let m = 0;
  return events.map(([eventType, context]) => ({
    eventType: eventType as MenuUsageEvent['eventType'],
    sessionId,
    userId,
    districtId,
    platform,
    page: 'menu_analysis',
    timestamp: ts(date, hour, m++),
    context: context as MenuUsageEvent['context'],
  }));
}

export const mockMenuUsageEvents: MenuUsageEvent[] = [
  // ── Feb 2026 ─────────────────────────────────────────────────────────────
  ...session('mu001', '2026-02-03', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'pizza' }],
  ]),
  ...session('mu002', '2026-02-03', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
  ]),
  ...session('mu005', '2026-02-04', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Lincoln Elementary' }],
  ]),
  ...session('mu008', '2026-02-04', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'participation', sortDirection: 'desc' }],
  ]),
  ...session('mu011', '2026-02-05', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Participation Score' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu003', '2026-02-06', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Breakfast Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu014', '2026-02-06', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
  ]),
  ...session('mu017', '2026-02-07', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Food Waste %' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu020', '2026-02-07', 15, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'taco' }],
  ]),
  ...session('mu001', '2026-02-10', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Sides' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'waste', sortDirection: 'asc' }],
  ]),
  ...session('mu006', '2026-02-10', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu009', '2026-02-11', 13, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Jefferson Middle' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu012', '2026-02-11', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu015', '2026-02-12', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Food Waste $' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu023', '2026-02-12', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'salad' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'participation', sortDirection: 'desc' }],
  ]),
  ...session('mu004', '2026-02-13', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Beverages' }],
  ]),
  ...session('mu018', '2026-02-13', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Participation Score' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
  ]),
  ...session('mu021', '2026-02-14', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu002', '2026-02-17', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'chicken' }],
  ]),
  ...session('mu007', '2026-02-17', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu010', '2026-02-18', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu013', '2026-02-18', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Washington High' }],
  ]),
  ...session('mu016', '2026-02-19', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Snacks' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu024', '2026-02-19', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Overall Performance' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu001', '2026-02-20', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'waste', sortDirection: 'desc' }],
  ]),
  ...session('mu025', '2026-02-20', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Desserts' }],
  ]),
  ...session('mu003', '2026-02-24', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Roosevelt Elementary' }],
  ]),
  ...session('mu019', '2026-02-24', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'pasta' }],
  ]),
  ...session('mu022', '2026-02-25', 13, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Food Waste %' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu005', '2026-02-25', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu011', '2026-02-26', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Breakfast Items' }],
  ]),
  // ── March 2026 ───────────────────────────────────────────────────────────
  ...session('mu001', '2026-03-02', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu006', '2026-03-02', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Lincoln Elementary' }],
  ]),
  ...session('mu009', '2026-03-03', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'sandwich' }],
  ]),
  ...session('mu014', '2026-03-03', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Participation Score' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu017', '2026-03-04', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Sides' }],
  ]),
  ...session('mu020', '2026-03-04', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu002', '2026-03-05', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu023', '2026-03-05', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Food Waste $' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'participation', sortDirection: 'desc' }],
  ]),
  ...session('mu004', '2026-03-06', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Jefferson Middle' }],
  ]),
  ...session('mu008', '2026-03-06', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Breakfast Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu012', '2026-03-09', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'burger' }],
  ]),
  ...session('mu015', '2026-03-09', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Overall Performance' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu018', '2026-03-10', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Beverages' }],
  ]),
  ...session('mu021', '2026-03-10', 13, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Washington High' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu001', '2026-03-11', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'waste', sortDirection: 'asc' }],
  ]),
  ...session('mu024', '2026-03-11', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Participation Score' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
  ]),
  ...session('mu003', '2026-03-12', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu007', '2026-03-12', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Snacks' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'fruit' }],
  ]),
  ...session('mu013', '2026-03-13', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Food Waste %' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu016', '2026-03-13', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu019', '2026-03-16', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Roosevelt Elementary' }],
  ]),
  ...session('mu022', '2026-03-16', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu025', '2026-03-17', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu001', '2026-03-17', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'participation', sortDirection: 'desc' }],
  ]),
  ...session('mu005', '2026-03-18', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu010', '2026-03-18', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Desserts' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'cookie' }],
  ]),
  ...session('mu002', '2026-03-19', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu006', '2026-03-19', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Lincoln Elementary' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu011', '2026-03-20', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu014', '2026-03-23', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Food Waste $' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu017', '2026-03-23', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Breakfast Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu020', '2026-03-24', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu003', '2026-03-24', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'waste', sortDirection: 'desc' }],
  ]),
  ...session('mu007', '2026-03-25', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Participation Score' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Sides' }],
  ]),
  ...session('mu009', '2026-03-25', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Jefferson Middle' }],
  ]),
  ...session('mu012', '2026-03-26', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'wrap' }],
  ]),
  ...session('mu015', '2026-03-26', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Food Waste %' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu018', '2026-03-27', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu001', '2026-03-30', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu021', '2026-03-30', 13, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  // ── April 2026 ───────────────────────────────────────────────────────────
  ...session('mu004', '2026-04-01', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Beverages' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'participation', sortDirection: 'asc' }],
  ]),
  ...session('mu008', '2026-04-01', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Washington High' }],
  ]),
  ...session('mu016', '2026-04-02', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Food Waste %' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu019', '2026-04-02', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu022', '2026-04-03', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu025', '2026-04-03', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Overall Performance' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu002', '2026-04-06', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Breakfast Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'cereal' }],
  ]),
  ...session('mu005', '2026-04-06', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Roosevelt Elementary' }],
  ]),
  ...session('mu011', '2026-04-07', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'waste', sortDirection: 'desc' }],
  ]),
  ...session('mu013', '2026-04-07', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Participation Score' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Sides' }],
  ]),
  ...session('mu001', '2026-04-08', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu006', '2026-04-08', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu010', '2026-04-09', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Food Waste $' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu014', '2026-04-09', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'wrap' }],
  ]),
  ...session('mu017', '2026-04-10', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Lincoln Elementary' }],
  ]),
  ...session('mu020', '2026-04-10', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Snacks' }],
  ]),
  ...session('mu003', '2026-04-13', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'participation', sortDirection: 'asc' }],
  ]),
  ...session('mu007', '2026-04-13', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu023', '2026-04-14', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu024', '2026-04-14', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Participation Score' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu004', '2026-04-15', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'soup' }],
  ]),
  ...session('mu008', '2026-04-15', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Jefferson Middle' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu012', '2026-04-16', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Breakfast Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu015', '2026-04-16', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Food Waste %' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
  ]),
  ...session('mu018', '2026-04-17', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu021', '2026-04-17', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Sides' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'waste', sortDirection: 'asc' }],
  ]),
  ...session('mu001', '2026-04-20', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu019', '2026-04-20', 13, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu022', '2026-04-21', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'rice' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
  ]),
  ...session('mu025', '2026-04-21', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Overall Performance' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu002', '2026-04-22', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu005', '2026-04-22', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Roosevelt Elementary' }],
  ]),
  ...session('mu011', '2026-04-23', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Participation Score' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'participation', sortDirection: 'desc' }],
  ]),
  ...session('mu016', '2026-04-23', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu003', '2026-04-24', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Desserts' }],
  ]),
  ...session('mu009', '2026-04-24', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Food Waste $' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
  ]),
  ...session('mu013', '2026-04-25', 8, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
    ['MENU_ANALYSIS_SEARCH_USED', { search: 'pasta' }],
  ]),
  ...session('mu017', '2026-04-28', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SITE_FILTER_CHANGED', { site: 'Lincoln Elementary' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
  ...session('mu020', '2026-04-28', 11, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Beverages' }],
  ]),
  ...session('mu001', '2026-04-29', 10, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'Item Performance Trend', metric: 'Overall Performance' }],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
    ['MENU_ANALYSIS_SORT_CHANGED', { sortColumn: 'waste', sortDirection: 'desc' }],
  ]),
  ...session('mu023', '2026-04-29', 14, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED', {}],
  ]),
  ...session('mu006', '2026-04-30', 9, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ITEMS_DRAWER_VIEWED', { drawerType: 'Menu Items' }],
    ['MENU_ANALYSIS_CATEGORY_FILTER_CHANGED', { category: 'Entrees' }],
    ['MENU_ANALYSIS_DATE_FILTER_CHANGED', {}],
  ]),
  ...session('mu010', '2026-04-30', 13, [
    ['MENU_ANALYSIS_PAGE_VIEWED', {}],
    ['MENU_ANALYSIS_METRIC_SELECTED', { chart: 'School Performance Trend', metric: 'Participation Score' }],
    ['SCHOOL_PERFORMANCE_DRAWER_VIEWED', { drawerType: 'School Performance' }],
    ['MENU_ANALYSIS_DAYS_SERVED_CHANGED', {}],
  ]),
];
