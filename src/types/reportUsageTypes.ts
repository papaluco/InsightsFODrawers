export type ReportEventType =
  | 'REPORT_VIEWED'
  | 'REPORT_RUN'
  | 'REPORT_DOWNLOADED'
  | 'REPORT_DISTRIBUTED'
  | 'REPORT_EMAILED'
  | 'REPORT_CONFIG_VIEWED';

export type ReportEntryPoint = 'Starred' | 'FullDirectory' | 'Recent';

export interface ReportUsageEvent {
  eventType: ReportEventType;
  sessionId: string;
  userId: string;
  districtId: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  application: 'InsightsWorkspace';
  page: 'Reports';
  timestamp: string;
  context: ReportEventContext;
}

export interface ReportEventContext {
  reportId: string;
  reportName: string;
  reportType: string;
  module: string;
  dataSource: string;
  entryPoint: ReportEntryPoint;
  isDistributed?: boolean;
  isStarred?: boolean;
  format?: string;
  distributionType?: 'Manual';
  recipientCount?: number;
}

export interface ReportUsageFilters {
  startDate: string;
  endDate: string;
  platform: string;
  districts: string[];
  userId: string;
  reportName: string;
  reportType: string;
  module: string;
  dataSource: string;
  entryPoint: string;
  eventTypes: string[];
}

export const DEFAULT_REPORT_FILTERS: ReportUsageFilters = {
  startDate: '',
  endDate: '',
  platform: '',
  districts: [],
  userId: '',
  reportName: '',
  reportType: '',
  module: '',
  dataSource: '',
  entryPoint: '',
  eventTypes: [],
};

export interface ReportUsageSummary {
  views: number;
  runs: number;
  downloads: number;
  emails: number;
  distributions: number;
  configViews: number;
  activeUsers: number;
  activeDistricts: number;
}

export interface ActionBreakdownItem {
  type: string;
  eventType: ReportEventType;
  count: number;
}

export interface ReportStatRow {
  reportId: string;
  reportName: string;
  reportType: string;
  module: string;
  dataSource: string;
  views: number;
  runs: number;
  downloads: number;
  emails: number;
  distributions: number;
  uniqueUsers: number;
  uniqueDistricts: number;
  lastUsed: string;
}

export interface UserStatRow {
  userId: string;
  userName: string;
  districtId: string;
  districtName: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  views: number;
  runs: number;
  downloads: number;
  emails: number;
  distributions: number;
  lastActive: string;
  isPowerUser: boolean;
}

export interface DistrictStatRow {
  districtId: string;
  districtName: string;
  platform: string;
  activeUsers: number;
  views: number;
  runs: number;
  downloads: number;
  emails: number;
  distributions: number;
  lastActivity: string;
}
