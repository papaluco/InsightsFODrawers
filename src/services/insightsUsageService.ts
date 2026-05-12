import {
  InsightsUsageEvent,
  InsightsUsageFilters,
  InsightsUsageSummary,
  KPIStatRow,
  InsightsUserStatRow,
  InsightsDistrictStatRow,
  INSIGHTS_INTERACTION_TYPES,
} from '../types/insightsUsageTypes';
import { isInsightsInteraction } from '../components/Usage/insights/insightsUsageHelpers';
import {
  mockInsightsUsageEvents,
  INSIGHTS_USER_NAMES,
  INSIGHTS_DISTRICT_NAMES,
  INSIGHTS_DISTRICT_TIMEZONES,
} from '../data/mockInsightsUsageData';
import { isSettingEnabled } from './systemSettingsService';
import { telemetry } from '../telemetry';

const eventStore: InsightsUsageEvent[] = [...mockInsightsUsageEvents];

export const trackInsightsEvent = (
  event: Omit<InsightsUsageEvent, 'sessionId' | 'timestamp'>
): void => {
  if (!isSettingEnabled('enable_insights_usage_tracking')) return;
  const sessionId = telemetry.getSessionId();
  telemetry.trackUsage(event.eventType.toLowerCase(), {
    module: 'insights',
    districtId: event.districtId,
    userId: event.userId,
    sessionId,
  });
  void Promise.resolve().then(() => {
    eventStore.unshift({ ...event, sessionId, timestamp: new Date().toISOString() });
  }).catch(console.error);
};

function applyFilters(events: InsightsUsageEvent[], filters: Partial<InsightsUsageFilters>): InsightsUsageEvent[] {
  return events.filter(e => {
    if (filters.startDate && e.timestamp.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && e.timestamp.slice(0, 10) > filters.endDate) return false;
    if (filters.platform && e.platform !== filters.platform) return false;
    if (filters.districts?.length && !filters.districts.includes(e.districtId)) return false;
    if (filters.userIds?.length && !filters.userIds.includes(e.userId)) return false;
    if (filters.kpi && e.context.kpi !== filters.kpi) return false;
    if (filters.eventTypes?.length && !(filters.eventTypes as string[]).includes(e.eventType)) return false;
    return true;
  });
}

async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function getAllInsightsEvents(filters?: Partial<InsightsUsageFilters>): Promise<InsightsUsageEvent[]> {
  await delay(60);
  const events = [...eventStore];
  return filters ? applyFilters(events, filters) : events;
}

export async function getInsightsUsageSummary(filters?: Partial<InsightsUsageFilters>): Promise<InsightsUsageSummary> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});

  const pageViewedSessions = new Set(
    events.filter(e => e.eventType === 'INSIGHTS_PAGE_VIEWED').map(e => e.sessionId)
  );
  const interactedSessions = new Set(
    events.filter(isInsightsInteraction).map(e => e.sessionId)
  );
  const interactionRate = pageViewedSessions.size > 0
    ? interactedSessions.size / pageViewedSessions.size
    : 0;

  return {
    pageViews: events.filter(e => e.eventType === 'INSIGHTS_PAGE_VIEWED').length,
    totalSessions: new Set(events.map(e => e.sessionId)).size,
    interactions: events.filter(isInsightsInteraction).length,
    interactionRate,
    drawerOpens: events.filter(e => e.eventType === 'KPI_DRAWER_OPENED').length,
    schoolieOpens: events.filter(e => e.eventType === 'KPI_SCHOOLIE_OPENED' || e.eventType === 'DASHBOARD_SCHOOLIE_OPENED').length,
    downloads: events.filter(e => e.eventType === 'KPI_DRAWER_DOWNLOAD' || e.eventType === 'DASHBOARD_DOWNLOAD').length,
    activeUsers: new Set(events.map(e => e.userId)).size,
    activeDistricts: new Set(events.map(e => e.districtId)).size,
  };
}

export async function getKPIStats(filters?: Partial<InsightsUsageFilters>): Promise<KPIStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});

  const pageViewSessionCount = new Set(
    events.filter(e => e.eventType === 'INSIGHTS_PAGE_VIEWED').map(e => e.sessionId)
  ).size;

  // Discover active KPIs from all events that carry context.kpi
  const allKpis = new Set<string>();
  events.forEach(e => { if (e.context.kpi) allKpis.add(e.context.kpi); });
  if (allKpis.size === 0) return [];

  return [...allKpis].map(kpi => {
    // Visibility — derived from KPI_RENDERED events
    const renderedEvts = events.filter(e => e.eventType === 'KPI_RENDERED' && e.context.kpi === kpi);
    const availableSet = new Set(renderedEvts.map(e => e.sessionId));
    const visibleSet = new Set(renderedEvts.filter(e => !e.context.notRendered).map(e => e.sessionId));
    const hiddenSet = new Set(renderedEvts.filter(e => e.context.notRendered === true).map(e => e.sessionId));

    const available = availableSet.size;
    const visibleSessions = visibleSet.size;
    const hidden = hiddenSet.size;

    // Usage — non-render events for this KPI
    const drawerEvts = events.filter(e => e.context.kpi === kpi && e.eventType === 'KPI_DRAWER_OPENED');
    const drawerOpenSessions = new Set(drawerEvts.map(e => e.sessionId));
    const drawerOpens = drawerEvts.length;
    const schoolieOpens = events.filter(e => e.context.kpi === kpi && e.eventType === 'KPI_SCHOOLIE_OPENED').length;
    const downloads = events.filter(e => e.context.kpi === kpi && e.eventType === 'KPI_DRAWER_DOWNLOAD').length;
    const trendSelections = events.filter(e => e.context.kpi === kpi && e.eventType === 'TREND_KPI_CHANGED').length;
    const interactionEvts = events.filter(e => e.context.kpi === kpi && e.eventType !== 'KPI_RENDERED');
    const uniqueUsers = new Set(interactionEvts.map(e => e.userId)).size;

    // Never opened: visible sessions with no drawer open for this KPI
    const neverOpened = visibleSet.size > 0
      ? [...visibleSet].filter(sid => !drawerOpenSessions.has(sid)).length
      : 0;

    const visibilityPct = available > 0 ? visibleSessions / available : 0;
    const hiddenPct = available > 0 ? hidden / available : 0;
    const neverOpenedPct = visibleSessions > 0 ? neverOpened / visibleSessions : 0;
    const needsAttention = hiddenPct > 0.3 || neverOpenedPct > 0.8;

    // normalizedUsage: drawer-open sessions / visible sessions (fallback to page-view sessions)
    const normalizedDenom = available > 0 ? visibleSessions : pageViewSessionCount;
    const normalizedUsage = normalizedDenom > 0 ? drawerOpenSessions.size / normalizedDenom : 0;

    const avgOpensPerSession = drawerOpenSessions.size > 0 ? drawerOpens / drawerOpenSessions.size : 0;
    const avgOpensPerUser = uniqueUsers > 0 ? drawerOpens / uniqueUsers : 0;

    return {
      kpi,
      renderedSessions: pageViewSessionCount,
      available,
      visibleSessions,
      hidden,
      neverOpened,
      visibilityPct,
      hiddenPct,
      neverOpenedPct,
      needsAttention,
      drawerOpens,
      schoolieOpens,
      downloads,
      trendSelections,
      uniqueUsers,
      normalizedUsage,
      avgOpensPerSession,
      avgOpensPerUser,
    };
  }).sort((a, b) => b.drawerOpens - a.drawerOpens);
}

export async function getInsightsUserStats(filters?: Partial<InsightsUsageFilters>): Promise<InsightsUserStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const allTimestamps = [...eventStore].map(e => new Date(e.timestamp).getTime());
  const oldest = allTimestamps.length ? Math.min(...allTimestamps) : Date.now();
  const newest = allTimestamps.length ? Math.max(...allTimestamps) : Date.now();
  const weeks = Math.max((newest - oldest) / (1000 * 60 * 60 * 24 * 7), 1);

  const map = new Map<string, InsightsUserStatRow>();

  events.forEach(e => {
    if (!map.has(e.userId)) {
      map.set(e.userId, {
        userId: e.userId,
        userName: INSIGHTS_USER_NAMES[e.userId] ?? e.userId,
        districtId: e.districtId,
        districtName: INSIGHTS_DISTRICT_NAMES[e.districtId] ?? e.districtId,
        platform: e.platform,
        sessions: 0,
        pageViews: 0,
        interactions: 0,
        drawerOpens: 0,
        schoolieUsage: 0,
        downloads: 0,
        avgSessionsPerWeek: 0,
        lastActive: '',
        isPowerUser: false,
      });
    }
    const row = map.get(e.userId)!;
    if (e.eventType === 'INSIGHTS_PAGE_VIEWED') row.pageViews++;
    if (isInsightsInteraction(e)) row.interactions++;
    if (e.eventType === 'KPI_DRAWER_OPENED') row.drawerOpens++;
    if (e.eventType === 'KPI_SCHOOLIE_OPENED' || e.eventType === 'DASHBOARD_SCHOOLIE_OPENED') row.schoolieUsage++;
    if (e.eventType === 'KPI_DRAWER_DOWNLOAD' || e.eventType === 'DASHBOARD_DOWNLOAD') row.downloads++;
    if (!row.lastActive || e.timestamp > row.lastActive) row.lastActive = e.timestamp;
  });

  map.forEach((row, userId) => {
    const userSessions = new Set(events.filter(e => e.userId === userId).map(e => e.sessionId)).size;
    row.sessions = userSessions;
    row.avgSessionsPerWeek = userSessions / weeks;
  });

  const rows = [...map.values()];
  const avgInteractions = rows.reduce((s, r) => s + r.interactions, 0) / Math.max(rows.length, 1);
  rows.forEach(r => { r.isPowerUser = r.interactions > avgInteractions * 1.5; });

  return rows.sort((a, b) => b.interactions - a.interactions);
}

export async function getInsightsDistrictStats(filters?: Partial<InsightsUsageFilters>): Promise<InsightsDistrictStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const map = new Map<string, InsightsDistrictStatRow>();

  events.forEach(e => {
    if (!map.has(e.districtId)) {
      map.set(e.districtId, {
        districtId: e.districtId,
        districtName: INSIGHTS_DISTRICT_NAMES[e.districtId] ?? e.districtId,
        platform: e.platform,
        timezone: INSIGHTS_DISTRICT_TIMEZONES[e.districtId] ?? 'America/New_York',
        activeUsers: 0,
        sessions: 0,
        pageViews: 0,
        interactions: 0,
        drawerOpens: 0,
        schoolieUsage: 0,
        downloads: 0,
        lastActivity: '',
      });
    }
    const row = map.get(e.districtId)!;
    if (e.eventType === 'INSIGHTS_PAGE_VIEWED') row.pageViews++;
    if (isInsightsInteraction(e)) row.interactions++;
    if (e.eventType === 'KPI_DRAWER_OPENED') row.drawerOpens++;
    if (e.eventType === 'KPI_SCHOOLIE_OPENED' || e.eventType === 'DASHBOARD_SCHOOLIE_OPENED') row.schoolieUsage++;
    if (e.eventType === 'KPI_DRAWER_DOWNLOAD' || e.eventType === 'DASHBOARD_DOWNLOAD') row.downloads++;
    if (!row.lastActivity || e.timestamp > row.lastActivity) row.lastActivity = e.timestamp;
  });

  map.forEach((row, districtId) => {
    const distEvents = events.filter(e => e.districtId === districtId);
    row.activeUsers = new Set(distEvents.map(e => e.userId)).size;
    row.sessions = new Set(distEvents.map(e => e.sessionId)).size;
  });

  return [...map.values()].sort((a, b) => b.interactions - a.interactions);
}
