import {
  MenuUsageEvent,
  MenuUsageFilters,
  MENU_EVENT_FRIENDLY,
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
