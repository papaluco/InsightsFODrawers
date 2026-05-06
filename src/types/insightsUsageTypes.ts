export type InsightsEventType =
  | 'INSIGHTS_PAGE_VIEWED'
  | 'SITE_FILTER_CHANGED'
  | 'DATE_RANGE_CHANGED'
  | 'KPI_DRAWER_OPENED'
  | 'TREND_KPI_CHANGED'
  | 'BENCHMARK_CONFIG_OPENED'
  | 'BENCHMARK_UPDATED'
  | 'BULK_UPDATE'
  | 'LAYOUT_CONFIG_CHANGED'
  | 'DASHBOARD_DOWNLOAD'
  | 'KPI_DRAWER_DOWNLOAD'
  | 'KPI_SCHOOLIE_OPENED'
  | 'DASHBOARD_SCHOOLIE_OPENED'
  | 'KPI_RENDERED';

export const INSIGHTS_INTERACTION_TYPES: InsightsEventType[] = [
  'SITE_FILTER_CHANGED',
  'DATE_RANGE_CHANGED',
  'KPI_DRAWER_OPENED',
  'TREND_KPI_CHANGED',
  'BENCHMARK_CONFIG_OPENED',
  'BENCHMARK_UPDATED',
  'BULK_UPDATE',
  'LAYOUT_CONFIG_CHANGED',
  'DASHBOARD_DOWNLOAD',
  'KPI_DRAWER_DOWNLOAD',
  'KPI_SCHOOLIE_OPENED',
  'DASHBOARD_SCHOOLIE_OPENED',
  // KPI_RENDERED is intentionally excluded — passive render tracking, not a user interaction
];

export const INSIGHTS_EVENT_FRIENDLY: Record<InsightsEventType, string> = {
  INSIGHTS_PAGE_VIEWED:      'Page Viewed',
  SITE_FILTER_CHANGED:       'Site Filter Changed',
  DATE_RANGE_CHANGED:        'Date Range Changed',
  KPI_DRAWER_OPENED:         'KPI Drawer Opened',
  TREND_KPI_CHANGED:         'Trend KPI Changed',
  BENCHMARK_CONFIG_OPENED:   'Benchmark Config Opened',
  BENCHMARK_UPDATED:         'Benchmark Updated',
  BULK_UPDATE:               'Bulk Update',
  LAYOUT_CONFIG_CHANGED:     'Layout Changed',
  DASHBOARD_DOWNLOAD:        'Dashboard Downloaded',
  KPI_DRAWER_DOWNLOAD:       'Drawer Downloaded',
  KPI_SCHOOLIE_OPENED:       'KPI Schoolie Opened',
  DASHBOARD_SCHOOLIE_OPENED: 'Dashboard Schoolie Opened',
  KPI_RENDERED:              'KPI Rendered',
};

export interface InsightsEventContext {
  kpi?: string;
  site?: string;
  isDistrictDrawer?: boolean;
  format?: string;
  entryPoint?: string;
  // Set to true on KPI_RENDERED events when the KPI was available but user has it hidden.
  // Stub: in production this comes from the layout config API. Available = rendered + notRendered.
  notRendered?: boolean;
}

export interface InsightsUsageEvent {
  eventType: InsightsEventType;
  sessionId: string;
  userId: string;
  districtId: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  timestamp: string;
  context: InsightsEventContext;
}

export interface InsightsUsageFilters {
  startDate: string;
  endDate: string;
  platform: string;
  districts: string[];
  userIds: string[];
  kpi: string;
  eventTypes: string[];
}

export const DEFAULT_INSIGHTS_FILTERS: InsightsUsageFilters = {
  startDate: '',
  endDate: '',
  platform: '',
  districts: [],
  userIds: [],
  kpi: '',
  eventTypes: [],
};

export interface InsightsUsageSummary {
  pageViews: number;
  totalSessions: number;
  interactions: number;
  interactionRate: number;
  drawerOpens: number;
  schoolieOpens: number;
  downloads: number;
  activeUsers: number;
  activeDistricts: number;
}

export interface KPIStatRow {
  kpi: string;
  // Legacy: page-view sessions (denominator for normalizedUsage when KPI_RENDERED unavailable)
  renderedSessions: number;
  // Visibility / availability (from KPI_RENDERED events)
  available: number;        // sessions where KPI was available (shown or hidden)
  visibleSessions: number;  // sessions where KPI was actually shown (!notRendered)
  hidden: number;           // sessions where KPI was hidden (notRendered)
  neverOpened: number;      // visible sessions with no drawer open
  visibilityPct: number;    // visibleSessions / available
  hiddenPct: number;        // hidden / available
  neverOpenedPct: number;   // neverOpened / visibleSessions
  needsAttention: boolean;  // hiddenPct > 0.3 || neverOpenedPct > 0.8
  // Usage
  drawerOpens: number;
  schoolieOpens: number;
  downloads: number;
  trendSelections: number;
  uniqueUsers: number;
  normalizedUsage: number;
  avgOpensPerSession: number;
  avgOpensPerUser: number;
}

export interface InsightsUserStatRow {
  userId: string;
  userName: string;
  districtId: string;
  districtName: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  sessions: number;
  pageViews: number;
  interactions: number;
  drawerOpens: number;
  schoolieUsage: number;
  downloads: number;
  avgSessionsPerWeek: number;
  lastActive: string;
  isPowerUser: boolean;
}

export interface InsightsDistrictStatRow {
  districtId: string;
  districtName: string;
  platform: string;
  timezone: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  interactions: number;
  drawerOpens: number;
  schoolieUsage: number;
  downloads: number;
  lastActivity: string;
}

export interface FunnelStep {
  label: string;
  count: number;
  pct: number;
}
