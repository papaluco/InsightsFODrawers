import {
  MenuUsageEvent,
  MenuUsageFilters,
  MENU_EVENT_FRIENDLY,
} from '../../../types/menuUsageTypes';
import {
  BarChart2, Building2, Users, UtensilsCrossed,
  School, Activity, MousePointerClick, Search, ArrowUpDown,
  SlidersHorizontal, CalendarDays,
} from 'lucide-react';

export const MENU_CHART_COLORS = [
  '#f97316', '#6366f1', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f59e0b', '#64748b', '#ef4444',
];

export const MENU_EVENT_COLORS: Record<string, string> = {
  MENU_ANALYSIS_PAGE_VIEWED:            '#6366f1',
  MENU_ITEMS_DRAWER_VIEWED:             '#f97316',
  SCHOOL_PERFORMANCE_DRAWER_VIEWED:     '#3b82f6',
  MENU_ANALYSIS_METRIC_SELECTED:        '#8b5cf6',
  MENU_ANALYSIS_DATE_FILTER_CHANGED:    '#10b981',
  MENU_ANALYSIS_SITE_FILTER_CHANGED:    '#14b8a6',
  MENU_ANALYSIS_DAYS_SERVED_CHANGED:    '#f59e0b',
  MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED: '#ec4899',
  MENU_ANALYSIS_CATEGORY_FILTER_CHANGED:'#06b6d4',
  MENU_ANALYSIS_SEARCH_USED:            '#84cc16',
  MENU_ANALYSIS_SORT_CHANGED:           '#64748b',
};

// Tab color tokens (hex) for charts/borders
export const MENU_TAB_COLORS: Record<string, string> = {
  Overview:          '#6366f1', // Indigo
  'Menu Items':      '#f97316', // Orange (food theme)
  'School Performance': '#3b82f6', // Blue
  Users:             '#14b8a6', // Teal
  Districts:         '#f59e0b', // Amber
};

// Tailwind class equivalents for FeedbackKPICard colorClass prop
export const MENU_TAB_TAILWIND: Record<string, string> = {
  Overview:             'bg-indigo-50 text-indigo-600',
  'Menu Items':         'bg-orange-50 text-orange-600',
  'School Performance': 'bg-blue-50 text-blue-600',
  Users:                'bg-teal-50 text-teal-600',
  Districts:            'bg-amber-50 text-amber-600',
  PageViews:            'bg-indigo-50 text-indigo-600',
  Interactions:         'bg-orange-50 text-orange-600',
  Drawers:              'bg-blue-50 text-blue-600',
  Filters:              'bg-teal-50 text-teal-600',
  Metrics:              'bg-violet-50 text-violet-600',
};

// Centralized Icon Registry
export const MENU_ICONS = {
  OVERVIEW:    Activity,
  MENU_ITEMS:  UtensilsCrossed,
  SCHOOL_PERF: School,
  USER:        Users,
  DISTRICT:    Building2,
  PAGE_VIEWS:  MousePointerClick,
  SEARCH:      Search,
  SORT:        ArrowUpDown,
  FILTER:      SlidersHorizontal,
  DATE:        CalendarDays,
  CHART:       BarChart2,
};

// Donut chart data for drawer split
export const DRAWER_COLORS: Record<string, string> = {
  'Menu Items':       '#f97316',
  'School Performance': '#3b82f6',
};

export function fmtDate(ts: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtDateTime(ts: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

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
