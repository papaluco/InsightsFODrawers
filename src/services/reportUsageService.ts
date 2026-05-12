import {
  ReportUsageEvent,
  ReportUsageFilters,
  ReportUsageSummary,
  ReportStatRow,
  UserStatRow,
  DistrictStatRow,
} from '../types/reportUsageTypes';
import {
  mockReportUsageEvents,
  REPORT_USER_NAMES,
  REPORT_DISTRICT_NAMES,
} from '../data/mockReportUsageData';
import { isSettingEnabled } from './systemSettingsService';
import { telemetry } from '../telemetry';

// In-memory event store seeded from mock data
const eventStore: ReportUsageEvent[] = [...mockReportUsageEvents];

/** Fire-and-forget event tracking. No-ops when reports usage tracking is disabled. */
export const trackReportEvent = (event: Omit<ReportUsageEvent, 'sessionId' | 'application' | 'page' | 'timestamp'>): void => {
  if (!isSettingEnabled('enable_reports_usage_tracking')) return;
  const sessionId = telemetry.getSessionId();
  telemetry.trackUsage(event.eventType.toLowerCase(), {
    module: 'reports',
    districtId: event.districtId,
    userId: event.userId,
    sessionId,
  });
  void Promise.resolve().then(() => {
    eventStore.unshift({
      ...event,
      sessionId,
      application: 'InsightsWorkspace',
      page: 'Reports',
      timestamp: new Date().toISOString(),
    });
  }).catch(console.error);
};

function applyFilters(events: ReportUsageEvent[], filters: Partial<ReportUsageFilters>): ReportUsageEvent[] {
  return events.filter(e => {
    if (filters.startDate && e.timestamp.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && e.timestamp.slice(0, 10) > filters.endDate) return false;
    if (filters.platform && e.platform !== filters.platform) return false;
    if (filters.districts?.length && !filters.districts.includes(e.districtId)) return false;
    if (filters.userId && e.userId !== filters.userId) return false;
    if (filters.reportName && e.context.reportName !== filters.reportName) return false;
    if (filters.reportType && e.context.reportType !== filters.reportType) return false;
    if (filters.module && e.context.module !== filters.module) return false;
    if (filters.dataSource && e.context.dataSource !== filters.dataSource) return false;
    if (filters.entryPoint && e.context.entryPoint !== filters.entryPoint) return false;
    if (filters.eventTypes?.length && !filters.eventTypes.includes(e.eventType)) return false;
    return true;
  });
}

async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function getAllReportEvents(filters?: Partial<ReportUsageFilters>): Promise<ReportUsageEvent[]> {
  await delay(60);
  const events = [...eventStore];
  return filters ? applyFilters(events, filters) : events;
}

export async function getReportUsageSummary(filters?: Partial<ReportUsageFilters>): Promise<ReportUsageSummary> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  return {
    views: events.filter(e => e.eventType === 'REPORT_VIEWED').length,
    runs: events.filter(e => e.eventType === 'REPORT_RUN').length,
    downloads: events.filter(e => e.eventType === 'REPORT_DOWNLOADED').length,
    emails: events.filter(e => e.eventType === 'REPORT_EMAILED').length,
    distributions: events.filter(e => e.eventType === 'REPORT_DISTRIBUTED').length,
    configViews: events.filter(e => e.eventType === 'REPORT_CONFIG_VIEWED').length,
    activeUsers: new Set(events.map(e => e.userId)).size,
    activeDistricts: new Set(events.map(e => e.districtId)).size,
  };
}

export async function getReportStats(filters?: Partial<ReportUsageFilters>): Promise<ReportStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const map = new Map<string, ReportStatRow>();

  events.forEach(e => {
    const { reportId, reportName, reportType, module, dataSource } = e.context;
    if (!map.has(reportId)) {
      map.set(reportId, { reportId, reportName, reportType, module, dataSource, views: 0, runs: 0, downloads: 0, emails: 0, distributions: 0, uniqueUsers: 0, uniqueDistricts: 0, lastUsed: '' });
    }
    const row = map.get(reportId)!;
    if (e.eventType === 'REPORT_VIEWED') row.views++;
    else if (e.eventType === 'REPORT_RUN') row.runs++;
    else if (e.eventType === 'REPORT_DOWNLOADED') row.downloads++;
    else if (e.eventType === 'REPORT_EMAILED') row.emails++;
    else if (e.eventType === 'REPORT_DISTRIBUTED') row.distributions++;
    if (!row.lastUsed || e.timestamp > row.lastUsed) row.lastUsed = e.timestamp;
  });

  // Compute unique users/districts per report
  map.forEach((row, reportId) => {
    const reportEvents = events.filter(e => e.context.reportId === reportId);
    row.uniqueUsers = new Set(reportEvents.map(e => e.userId)).size;
    row.uniqueDistricts = new Set(reportEvents.map(e => e.districtId)).size;
  });

  return [...map.values()].sort((a, b) => (b.views + b.runs) - (a.views + a.runs));
}

export async function getUserStats(filters?: Partial<ReportUsageFilters>): Promise<UserStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const map = new Map<string, UserStatRow>();

  events.forEach(e => {
    if (!map.has(e.userId)) {
      map.set(e.userId, {
        userId: e.userId,
        userName: REPORT_USER_NAMES[e.userId] ?? e.userId,
        districtId: e.districtId,
        districtName: REPORT_DISTRICT_NAMES[e.districtId] ?? e.districtId,
        platform: e.platform,
        views: 0, runs: 0, downloads: 0, emails: 0, distributions: 0,
        lastActive: '',
        isPowerUser: false,
      });
    }
    const row = map.get(e.userId)!;
    if (e.eventType === 'REPORT_VIEWED') row.views++;
    else if (e.eventType === 'REPORT_RUN') row.runs++;
    else if (e.eventType === 'REPORT_DOWNLOADED') row.downloads++;
    else if (e.eventType === 'REPORT_EMAILED') row.emails++;
    else if (e.eventType === 'REPORT_DISTRIBUTED') row.distributions++;
    if (!row.lastActive || e.timestamp > row.lastActive) row.lastActive = e.timestamp;
  });

  const rows = [...map.values()];
  const avgTotal = rows.reduce((s, r) => s + r.views + r.runs, 0) / Math.max(rows.length, 1);
  rows.forEach(r => { r.isPowerUser = (r.views + r.runs) > avgTotal * 1.5; });

  return rows.sort((a, b) => (b.views + b.runs) - (a.views + a.runs));
}

export async function getDistrictStats(filters?: Partial<ReportUsageFilters>): Promise<DistrictStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const map = new Map<string, DistrictStatRow>();

  events.forEach(e => {
    if (!map.has(e.districtId)) {
      map.set(e.districtId, {
        districtId: e.districtId,
        districtName: REPORT_DISTRICT_NAMES[e.districtId] ?? e.districtId,
        platform: e.platform,
        activeUsers: 0, views: 0, runs: 0, downloads: 0, emails: 0, distributions: 0, lastActivity: '',
      });
    }
    const row = map.get(e.districtId)!;
    if (e.eventType === 'REPORT_VIEWED') row.views++;
    else if (e.eventType === 'REPORT_RUN') row.runs++;
    else if (e.eventType === 'REPORT_DOWNLOADED') row.downloads++;
    else if (e.eventType === 'REPORT_EMAILED') row.emails++;
    else if (e.eventType === 'REPORT_DISTRIBUTED') row.distributions++;
    if (!row.lastActivity || e.timestamp > row.lastActivity) row.lastActivity = e.timestamp;
  });

  map.forEach((row, districtId) => {
    row.activeUsers = new Set(events.filter(e => e.districtId === districtId).map(e => e.userId)).size;
  });

  return [...map.values()].sort((a, b) => (b.views + b.runs) - (a.views + a.runs));
}
