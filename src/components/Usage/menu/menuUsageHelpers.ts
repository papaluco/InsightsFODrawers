import {
  MenuUsageEvent,
  MenuUsageFilters,
  MenuSessionRow,
  MENU_EVENT_FRIENDLY,
  MENU_INTERACTION_TYPES,
} from '../../../types/menuUsageTypes';



export function getMenuEventFriendlyLabel(eventType: string, context: MenuUsageEvent['context'] = {}): string {
  const base = MENU_EVENT_FRIENDLY[eventType as keyof typeof MENU_EVENT_FRIENDLY] ?? eventType;
  if (eventType === 'MENU_ANALYSIS_METRIC_SELECTED' && context.metric) return `Selected Metric: ${context.metric}`;
  if (eventType === 'MENU_ANALYSIS_SITE_FILTER_CHANGED' && context.site) return `Site Filter: ${context.site}`;
  if (eventType === 'MENU_ANALYSIS_CATEGORY_FILTER_CHANGED' && context.category) return `Category Filter: ${context.category}`;
  if (eventType === 'MENU_ANALYSIS_SEARCH_USED' && context.search) return `Search: "${context.search}"`;
  if (eventType === 'MENU_ANALYSIS_SORT_CHANGED' && context.sortColumn) {
    return `Sort: ${context.sortColumn} ${context.sortDirection ?? ''}`.trim();
  }
  return base;
}

export function deriveMenuSessions(events: MenuUsageEvent[]): MenuSessionRow[] {
  const sessionMap = new Map<string, MenuUsageEvent[]>();
  for (const e of events) {
    const arr = sessionMap.get(e.sessionId) ?? [];
    arr.push(e);
    sessionMap.set(e.sessionId, arr);
  }
  return Array.from(sessionMap.entries()).map(([sessionId, evs]) => {
    const sorted = [...evs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return {
      sessionId,
      userId: evs[0].userId,
      districtId: evs[0].districtId,
      platform: evs[0].platform,
      eventCount: evs.length,
      pageViews: evs.filter(e => e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED').length,
      interactions: evs.filter(e => MENU_INTERACTION_TYPES.includes(e.eventType)).length,
      menuItemsDrawerViews: evs.filter(e => e.eventType === 'MENU_ITEMS_DRAWER_VIEWED').length,
      schoolPerformanceDrawerViews: evs.filter(e => e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED').length,
      firstEvent: sorted[0].timestamp,
      lastEvent: sorted[sorted.length - 1].timestamp,
    };
  });
}

export function applyMenuFilters(events: MenuUsageEvent[], filters: MenuUsageFilters): MenuUsageEvent[] {
  return events.filter(e => {
    if (filters.startDate && e.timestamp.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && e.timestamp.slice(0, 10) > filters.endDate) return false;
    if (filters.platform && e.platform !== filters.platform) return false;
    if (filters.districts.length && !filters.districts.includes(e.districtId)) return false;
    if (filters.userIds.length && !filters.userIds.includes(e.userId)) return false;
    if (filters.eventTypes.length && !filters.eventTypes.includes(e.eventType)) return false;
    if (filters.drawerTypes.length) {
      const drawerType = e.context.drawerType;
      if (!drawerType || !filters.drawerTypes.includes(drawerType)) return false;
    }
    if (filters.metrics.length) {
      const metric = e.context.metric;
      if (!metric || !filters.metrics.includes(metric)) return false;
    }
    return true;
  });
}
