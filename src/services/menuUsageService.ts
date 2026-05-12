import {
  MenuUsageEvent,
  MenuUsageFilters,
  MenuUsageSummary,
  MenuUserStatRow,
  MenuDistrictStatRow,
  MenuDrawerUsageStat,
  MenuMetricUsageStat,
  MenuFilterUsageStat,
  MENU_INTERACTION_TYPES,
  MENU_FILTER_TYPES,
  MENU_EVENT_FRIENDLY,
} from '../types/menuUsageTypes';
import {
  mockMenuUsageEvents,
  MENU_USER_NAMES,
  MENU_DISTRICT_NAMES,
} from '../data/mockMenuUsageData';
import { telemetry } from '../telemetry';

// In-memory event store seeded from mock data
const eventStore: MenuUsageEvent[] = [...mockMenuUsageEvents];

async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function applyFilters(events: MenuUsageEvent[], filters: Partial<MenuUsageFilters>): MenuUsageEvent[] {
  return events.filter(e => {
    if (filters.startDate && e.timestamp.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && e.timestamp.slice(0, 10) > filters.endDate) return false;
    if (filters.platform && e.platform !== filters.platform) return false;
    if (filters.districts?.length && !filters.districts.includes(e.districtId)) return false;
    if (filters.userIds?.length && !filters.userIds.includes(e.userId)) return false;
    if (filters.eventTypes?.length && !filters.eventTypes.includes(e.eventType)) return false;
    if (filters.drawerTypes?.length) {
      const drawerType = e.context.drawerType;
      if (!drawerType || !filters.drawerTypes.includes(drawerType)) return false;
    }
    if (filters.metrics?.length) {
      const metric = e.context.metric;
      if (!metric || !filters.metrics.includes(metric)) return false;
    }
    return true;
  });
}

export async function trackMenuUsageEvent(event: Omit<MenuUsageEvent, 'timestamp'>): Promise<void> {
  telemetry.trackUsage(event.eventType.toLowerCase(), {
    module: 'menu_analysis',
    districtId: event.districtId,
    userId: event.userId,
    sessionId: event.sessionId,
  });
  eventStore.push({ ...event, timestamp: new Date().toISOString() } as MenuUsageEvent);
}

export async function getAllMenuEvents(filters?: Partial<MenuUsageFilters>): Promise<MenuUsageEvent[]> {
  await delay(60);
  const events = [...eventStore];
  return filters ? applyFilters(events, filters) : events;
}

export async function getMenuUsageSummary(filters?: Partial<MenuUsageFilters>): Promise<MenuUsageSummary> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});

  const pageViews = events.filter(e => e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED').length;
  const interactions = events.filter(e => MENU_INTERACTION_TYPES.includes(e.eventType)).length;
  const interactionRate = pageViews > 0 ? Math.round((interactions / pageViews) * 100) / 100 : 0;

  const menuItemsDrawerViews = events.filter(e => e.eventType === 'MENU_ITEMS_DRAWER_VIEWED').length;
  const schoolPerformanceDrawerViews = events.filter(e => e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED').length;
  const metricChanges = events.filter(e => e.eventType === 'MENU_ANALYSIS_METRIC_SELECTED').length;
  const filterChanges = events.filter(e => MENU_FILTER_TYPES.includes(e.eventType)).length;

  const activeUsers = new Set(events.map(e => e.userId)).size;
  const activeDistricts = new Set(events.map(e => e.districtId)).size;

  return {
    pageViews,
    interactions,
    interactionRate,
    menuItemsDrawerViews,
    schoolPerformanceDrawerViews,
    metricChanges,
    filterChanges,
    activeUsers,
    activeDistricts,
  };
}

export async function getMenuUserStats(filters?: Partial<MenuUsageFilters>): Promise<MenuUserStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});

  const userMap = new Map<string, MenuUsageEvent[]>();
  for (const e of events) {
    if (!userMap.has(e.userId)) userMap.set(e.userId, []);
    userMap.get(e.userId)!.push(e);
  }

  const rows: MenuUserStatRow[] = [];

  userMap.forEach((userEvents, userId) => {
    const sessions = new Set(userEvents.map(e => e.sessionId)).size;
    const pageViews = userEvents.filter(e => e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED').length;
    const interactions = userEvents.filter(e => MENU_INTERACTION_TYPES.includes(e.eventType)).length;
    const menuItemsDrawerViews = userEvents.filter(e => e.eventType === 'MENU_ITEMS_DRAWER_VIEWED').length;
    const schoolPerformanceDrawerViews = userEvents.filter(e => e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED').length;
    const filterChanges = userEvents.filter(e => MENU_FILTER_TYPES.includes(e.eventType)).length;
    const metricChanges = userEvents.filter(e => e.eventType === 'MENU_ANALYSIS_METRIC_SELECTED').length;
    const searches = userEvents.filter(e => e.eventType === 'MENU_ANALYSIS_SEARCH_USED').length;
    const sortChanges = userEvents.filter(e => e.eventType === 'MENU_ANALYSIS_SORT_CHANGED').length;
    const lastActive = userEvents.map(e => e.timestamp).sort().at(-1) ?? '';
    const first = userEvents[0];

    rows.push({
      userId,
      userName: MENU_USER_NAMES[userId] ?? userId,
      districtId: first.districtId,
      districtName: MENU_DISTRICT_NAMES[first.districtId] ?? first.districtId,
      platform: first.platform,
      sessions,
      pageViews,
      interactions,
      menuItemsDrawerViews,
      schoolPerformanceDrawerViews,
      filterChanges,
      metricChanges,
      searches,
      sortChanges,
      lastActive,
    });
  });

  return rows.sort((a, b) => b.sessions - a.sessions);
}

export async function getMenuDistrictStats(filters?: Partial<MenuUsageFilters>): Promise<MenuDistrictStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});

  const distMap = new Map<string, { events: MenuUsageEvent[]; userIds: Set<string>; platform: string }>();

  for (const e of events) {
    if (!distMap.has(e.districtId)) {
      distMap.set(e.districtId, { events: [], userIds: new Set(), platform: e.platform });
    }
    const d = distMap.get(e.districtId)!;
    d.events.push(e);
    d.userIds.add(e.userId);
  }

  const rows: MenuDistrictStatRow[] = [];

  distMap.forEach((data, districtId) => {
    const { events: distEvents, userIds, platform } = data;
    const sessions = new Set(distEvents.map(e => e.sessionId)).size;
    const pageViews = distEvents.filter(e => e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED').length;
    const interactions = distEvents.filter(e => MENU_INTERACTION_TYPES.includes(e.eventType)).length;
    const menuItemsDrawerViews = distEvents.filter(e => e.eventType === 'MENU_ITEMS_DRAWER_VIEWED').length;
    const schoolPerformanceDrawerViews = distEvents.filter(e => e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED').length;
    const filterChanges = distEvents.filter(e => MENU_FILTER_TYPES.includes(e.eventType)).length;
    const metricChanges = distEvents.filter(e => e.eventType === 'MENU_ANALYSIS_METRIC_SELECTED').length;
    const lastActivity = distEvents.map(e => e.timestamp).sort().at(-1) ?? '';

    rows.push({
      districtId,
      districtName: MENU_DISTRICT_NAMES[districtId] ?? districtId,
      platform,
      activeUsers: userIds.size,
      sessions,
      pageViews,
      interactions,
      menuItemsDrawerViews,
      schoolPerformanceDrawerViews,
      filterChanges,
      metricChanges,
      lastActivity,
      hasNoActivity: false,
    });
  });

  // Include districts with no activity in this filter range
  const activeDists = new Set(rows.map(r => r.districtId));
  Object.keys(MENU_DISTRICT_NAMES).forEach(id => {
    if (!activeDists.has(id)) {
      rows.push({
        districtId: id,
        districtName: MENU_DISTRICT_NAMES[id],
        platform: '',
        activeUsers: 0,
        sessions: 0,
        pageViews: 0,
        interactions: 0,
        menuItemsDrawerViews: 0,
        schoolPerformanceDrawerViews: 0,
        filterChanges: 0,
        metricChanges: 0,
        lastActivity: '',
        hasNoActivity: true,
      });
    }
  });

  return rows.sort((a, b) => b.sessions - a.sessions);
}

export async function getMenuDrawerStats(filters?: Partial<MenuUsageFilters>): Promise<MenuDrawerUsageStat[]> {
  await delay(60);
  const events = applyFilters([...eventStore], filters ?? {});

  const menuItems = events.filter(e => e.eventType === 'MENU_ITEMS_DRAWER_VIEWED').length;
  const schoolPerf = events.filter(e => e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED').length;
  const total = menuItems + schoolPerf;

  return [
    { drawerType: 'Menu Items', count: menuItems, percent: total > 0 ? Math.round((menuItems / total) * 1000) / 10 : 0 },
    { drawerType: 'School Performance', count: schoolPerf, percent: total > 0 ? Math.round((schoolPerf / total) * 1000) / 10 : 0 },
  ];
}

export async function getMenuMetricStats(filters?: Partial<MenuUsageFilters>): Promise<MenuMetricUsageStat[]> {
  await delay(60);
  const events = applyFilters([...eventStore], filters ?? {})
    .filter(e => e.eventType === 'MENU_ANALYSIS_METRIC_SELECTED');

  const counts = new Map<string, number>();
  for (const e of events) {
    const key = e.context.metric ?? 'Unknown';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const total = events.length;
  const rows: MenuMetricUsageStat[] = [];

  counts.forEach((count, metric) => {
    rows.push({
      metric,
      chart: '',
      count,
      percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    });
  });

  return rows.sort((a, b) => b.count - a.count);
}

export async function getMenuFilterStats(filters?: Partial<MenuUsageFilters>): Promise<MenuFilterUsageStat[]> {
  await delay(60);
  const events = applyFilters([...eventStore], filters ?? {})
    .filter(e => MENU_FILTER_TYPES.includes(e.eventType));

  const counts = new Map<string, number>();
  for (const e of events) {
    counts.set(e.eventType, (counts.get(e.eventType) ?? 0) + 1);
  }

  const rows: MenuFilterUsageStat[] = [];

  counts.forEach((count, eventType) => {
    rows.push({
      filter: MENU_EVENT_FRIENDLY[eventType as keyof typeof MENU_EVENT_FRIENDLY] ?? eventType,
      eventType: eventType as MenuUsageEvent['eventType'],
      count,
    });
  });

  return rows.sort((a, b) => b.count - a.count);
}
