export type AppEventType =
  | 'PAGE_VIEWED'
  | 'APP_CLOSED'
  | 'KPI_DRAWER_OPENED'
  | 'KPI_DRAWER_DOWNLOAD'
  | 'KPI_SCHOOLIE_OPENED'
  | 'SITE_FILTER_CHANGED'
  | 'DATE_RANGE_CHANGED'
  | 'KPI_LAYOUT_UPDATED'
  | 'TREND_KPI_SELECTED'
  | 'BENCHMARK_CONFIG_OPENED'
  | 'DASHBOARD_DOWNLOAD_TRIGGERED'
  | 'DASHBOARD_SCHOOLIE_OPENED'
  | 'REPORT_VIEWED'
  | 'REPORT_RUN'
  | 'REPORT_DOWNLOADED'
  | 'REPORT_DISTRIBUTED'
  | 'REPORT_EMAILED'
  | 'REPORT_CONFIG_VIEWED';

export type AppPage = 'Workspace' | 'Insights' | 'MenuAnalysis' | 'Reports';
export type AppEntryPoint = 'Workspace' | 'InsightsDirect' | 'MenuAnalysisDirect' | 'ReportsDirect';

export const APP_EVENT_FRIENDLY: Record<AppEventType, string> = {
  PAGE_VIEWED:                 'Page Viewed',
  APP_CLOSED:                  'App Closed',
  KPI_DRAWER_OPENED:           'KPI Drawer Opened',
  KPI_DRAWER_DOWNLOAD:         'KPI Drawer Downloaded',
  KPI_SCHOOLIE_OPENED:         'Schoolie Opened (KPI)',
  SITE_FILTER_CHANGED:         'Site Filter Changed',
  DATE_RANGE_CHANGED:          'Date Range Changed',
  KPI_LAYOUT_UPDATED:          'Dashboard Layout Updated',
  TREND_KPI_SELECTED:          'Trend KPI Selected',
  BENCHMARK_CONFIG_OPENED:     'Benchmark Config Opened',
  DASHBOARD_DOWNLOAD_TRIGGERED:'Dashboard Downloaded',
  DASHBOARD_SCHOOLIE_OPENED:   'Schoolie Opened (Dashboard)',
  REPORT_VIEWED:               'Report Viewed',
  REPORT_RUN:                  'Report Run',
  REPORT_DOWNLOADED:           'Report Downloaded',
  REPORT_DISTRIBUTED:          'Report Distributed',
  REPORT_EMAILED:              'Report Emailed',
  REPORT_CONFIG_VIEWED:        'Report Config Viewed',
};

export const APP_INTERACTION_TYPES: AppEventType[] = [
  'KPI_DRAWER_OPENED',
  'KPI_DRAWER_DOWNLOAD',
  'KPI_SCHOOLIE_OPENED',
  'SITE_FILTER_CHANGED',
  'DATE_RANGE_CHANGED',
  'KPI_LAYOUT_UPDATED',
  'TREND_KPI_SELECTED',
  'BENCHMARK_CONFIG_OPENED',
  'DASHBOARD_DOWNLOAD_TRIGGERED',
  'DASHBOARD_SCHOOLIE_OPENED',
  'REPORT_VIEWED',
  'REPORT_RUN',
  'REPORT_DOWNLOADED',
  'REPORT_DISTRIBUTED',
  'REPORT_EMAILED',
  'REPORT_CONFIG_VIEWED',
];

export const APP_INSIGHTS_INTERACTION_TYPES: AppEventType[] = [
  'KPI_DRAWER_OPENED',
  'KPI_DRAWER_DOWNLOAD',
  'KPI_SCHOOLIE_OPENED',
  'SITE_FILTER_CHANGED',
  'DATE_RANGE_CHANGED',
  'KPI_LAYOUT_UPDATED',
  'TREND_KPI_SELECTED',
  'BENCHMARK_CONFIG_OPENED',
  'DASHBOARD_DOWNLOAD_TRIGGERED',
  'DASHBOARD_SCHOOLIE_OPENED',
];

export const APP_REPORTS_INTERACTION_TYPES: AppEventType[] = [
  'REPORT_VIEWED',
  'REPORT_RUN',
  'REPORT_DOWNLOADED',
  'REPORT_DISTRIBUTED',
  'REPORT_EMAILED',
  'REPORT_CONFIG_VIEWED',
];

export interface AppEventContext {
  entryPoint?: AppEntryPoint;
  kpi?: string;
  site?: string;
  drawerType?: string;
  reportId?: string;
  reportName?: string;
  format?: string;
}

export interface AppUsageEvent {
  eventType: AppEventType;
  sessionId: string;
  userId: string;
  districtId: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  page: AppPage;
  timestamp: string;
  context: AppEventContext;
}

export interface AppUsageFilters {
  startDate: string;
  endDate: string;
  platform: string;
  districts: string[];
  userIds: string[];
  eventTypes: string[];
}

export const DEFAULT_APP_FILTERS: AppUsageFilters = {
  startDate: '',
  endDate: '',
  platform: '',
  districts: [],
  userIds: [],
  eventTypes: [],
};

export interface AppUsageSummary {
  activeUsers: number;
  activeDistricts: number;
  totalSessions: number;
  avgSessionDuration: number;
  dau: number;
  wau: number;
  mau: number;
  newUsers: number;
  returningUsers: number;
  retentionPercent: number;
}

export interface AppUserStatRow {
  userId: string;
  userName: string;
  districtId: string;
  districtName: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  sessions: number;
  eventCount: number;
  lastActive: string;
  avgSessionDuration: number;
  isPowerUser: boolean;
}

export interface AppDistrictStatRow {
  districtId: string;
  districtName: string;
  timezone: string;
  platform: string;
  activeUsers: number;
  sessions: number;
  avgSessionsPerUser: number;
  avgDuration: number;
  lastActivity: string;
  hasNoActivity: boolean;
}

export interface AppSessionStatRow {
  sessionId: string;
  userId: string;
  userName: string;
  districtId: string;
  districtName: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  entryPoint: AppEntryPoint;
  startTime: string;
  lastEventTime: string;
  derivedDuration: number;
  isDerivedDuration: boolean;
  eventCount: number;
  isDropOff: boolean;
  hasAppClosed: boolean;
}

export interface AppCalendarDay {
  date: string;
  sessionCount: number;
  activeUserCount: number;
  percentOfTotalUsage: number;
}

export interface AppDayOfWeekSummary {
  dayOfWeek: string;
  sessionCount: number;
  activeUserCount: number;
  percentOfTotalUsage: number;
}

export interface AppTimeOfDayBucket {
  bucket: 'Morning' | 'Afternoon' | 'Evening';
  timeRange: string;
  sessionCount: number;
  activeUserCount: number;
  percentOfTotalUsage: number;
}

export interface AppTimingData {
  calendarUsage: AppCalendarDay[];
  dayOfWeekSummary: AppDayOfWeekSummary[];
  timeOfDayBreakdown: AppTimeOfDayBucket[];
}

export interface AppFunnelStepResult {
  stepOrder: number;
  stepKey: string;
  label: string;
  description: string;
  count: number;
  percentOfStart: number;
  dropOffFromPrevious: number;
}

export interface AppFunnelStepDef {
  stepKey: string;
  label: string;
  description: string;
  color?: string;
  match: (sessionEvents: AppUsageEvent[]) => boolean;
}

export interface AppFunnelDef {
  funnelId: string;
  funnelName: string;
  description: string;
  category: string;
  steps: AppFunnelStepDef[];
}
