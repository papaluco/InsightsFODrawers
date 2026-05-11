export type MenuEventType =
  | 'MENU_ANALYSIS_PAGE_VIEWED'
  | 'MENU_ITEMS_DRAWER_VIEWED'
  | 'SCHOOL_PERFORMANCE_DRAWER_VIEWED'
  | 'MENU_ANALYSIS_METRIC_SELECTED'
  | 'MENU_ANALYSIS_DATE_FILTER_CHANGED'
  | 'MENU_ANALYSIS_SITE_FILTER_CHANGED'
  | 'MENU_ANALYSIS_DAYS_SERVED_CHANGED'
  | 'MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED'
  | 'MENU_ANALYSIS_CATEGORY_FILTER_CHANGED'
  | 'MENU_ANALYSIS_SEARCH_USED'
  | 'MENU_ANALYSIS_SORT_CHANGED';

export type MenuDrawerType = 'Menu Items' | 'School Performance';
export type MenuMetric = 'Overall Performance' | 'Participation Score' | 'Food Waste %' | 'Food Waste $';
export type MenuPlatform = 'SchoolCafe' | 'PrimeroEdge';
export type MenuPage = 'menu_analysis';

export const MENU_EVENT_FRIENDLY: Record<MenuEventType, string> = {
  MENU_ANALYSIS_PAGE_VIEWED:           'Page Viewed',
  MENU_ITEMS_DRAWER_VIEWED:            'Menu Items Drawer Viewed',
  SCHOOL_PERFORMANCE_DRAWER_VIEWED:    'School Performance Drawer Viewed',
  MENU_ANALYSIS_METRIC_SELECTED:       'Metric Selected',
  MENU_ANALYSIS_DATE_FILTER_CHANGED:   'Date Filter Changed',
  MENU_ANALYSIS_SITE_FILTER_CHANGED:   'Site Filter Changed',
  MENU_ANALYSIS_DAYS_SERVED_CHANGED:   'Days Served Range Changed',
  MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED:'Schools Served Range Changed',
  MENU_ANALYSIS_CATEGORY_FILTER_CHANGED:'Category Filter Changed',
  MENU_ANALYSIS_SEARCH_USED:           'Search Used',
  MENU_ANALYSIS_SORT_CHANGED:          'Sort Changed',
};

export const MENU_INTERACTION_TYPES: MenuEventType[] = [
  'MENU_ITEMS_DRAWER_VIEWED',
  'SCHOOL_PERFORMANCE_DRAWER_VIEWED',
  'MENU_ANALYSIS_METRIC_SELECTED',
  'MENU_ANALYSIS_DATE_FILTER_CHANGED',
  'MENU_ANALYSIS_SITE_FILTER_CHANGED',
  'MENU_ANALYSIS_DAYS_SERVED_CHANGED',
  'MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED',
  'MENU_ANALYSIS_CATEGORY_FILTER_CHANGED',
  'MENU_ANALYSIS_SEARCH_USED',
  'MENU_ANALYSIS_SORT_CHANGED',
];

export const MENU_FILTER_TYPES: MenuEventType[] = [
  'MENU_ANALYSIS_DATE_FILTER_CHANGED',
  'MENU_ANALYSIS_SITE_FILTER_CHANGED',
  'MENU_ANALYSIS_DAYS_SERVED_CHANGED',
  'MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED',
  'MENU_ANALYSIS_CATEGORY_FILTER_CHANGED',
  'MENU_ANALYSIS_SEARCH_USED',
  'MENU_ANALYSIS_SORT_CHANGED',
];

export const MENU_METRICS: MenuMetric[] = [
  'Overall Performance',
  'Participation Score',
  'Food Waste %',
  'Food Waste $',
];

export const MENU_CATEGORIES: string[] = [
  'Entrees',
  'Sides',
  'Beverages',
  'Snacks',
  'Desserts',
  'Breakfast Items',
];

export interface MenuEventContext {
  chart?: string;
  metric?: string;
  drawerType?: MenuDrawerType;
  site?: string;
  category?: string;
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface MenuUsageEvent {
  eventType: MenuEventType;
  sessionId: string;
  userId: string;
  districtId: string;
  platform: MenuPlatform;
  page: MenuPage;
  timestamp: string;
  context: MenuEventContext;
}

export interface MenuUsageFilters {
  startDate: string;
  endDate: string;
  platform: string;
  districts: string[];
  userIds: string[];
  eventTypes: string[];
  drawerTypes: string[];
  metrics: string[];
}

export const DEFAULT_MENU_FILTERS: MenuUsageFilters = {
  startDate: '',
  endDate: '',
  platform: '',
  districts: [],
  userIds: [],
  eventTypes: [],
  drawerTypes: [],
  metrics: [],
};

export interface MenuUsageSummary {
  pageViews: number;
  interactions: number;
  interactionRate: number;
  menuItemsDrawerViews: number;
  schoolPerformanceDrawerViews: number;
  metricChanges: number;
  filterChanges: number;
  activeUsers: number;
  activeDistricts: number;
}

export interface MenuDrawerUsageStat {
  drawerType: MenuDrawerType;
  count: number;
  percent: number;
}

export interface MenuMetricUsageStat {
  metric: string;
  chart: string;
  count: number;
  percent: number;
}

export interface MenuFilterUsageStat {
  filter: string;
  eventType: MenuEventType;
  count: number;
}

export interface MenuUserStatRow {
  userId: string;
  userName: string;
  districtId: string;
  districtName: string;
  platform: MenuPlatform;
  sessions: number;
  pageViews: number;
  interactions: number;
  menuItemsDrawerViews: number;
  schoolPerformanceDrawerViews: number;
  filterChanges: number;
  metricChanges: number;
  searches: number;
  sortChanges: number;
  lastActive: string;
}

export interface MenuDistrictStatRow {
  districtId: string;
  districtName: string;
  platform: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  interactions: number;
  menuItemsDrawerViews: number;
  schoolPerformanceDrawerViews: number;
  filterChanges: number;
  metricChanges: number;
  lastActivity: string;
  hasNoActivity: boolean;
}
