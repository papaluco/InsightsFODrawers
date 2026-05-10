import {
  AppUsageEvent,
  AppUsageFilters,
  AppFunnelDef,
  APP_EVENT_FRIENDLY,
  APP_INSIGHTS_INTERACTION_TYPES,
  APP_REPORTS_INTERACTION_TYPES,
} from '../../../types/appUsageTypes';
import { 
  Users, Building2, Activity, Clock, TrendingUp, 
  RefreshCw, MousePointerClick, 
  Layers, Gauge, Globe
} from 'lucide-react';


export const APP_CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#64748b', '#ef4444',
];

export const APP_EVENT_COLORS: Record<string, string> = {
  PAGE_VIEWED:                  '#6366f1',
  APP_CLOSED:                   '#64748b',
  KPI_DRAWER_OPENED:            '#3b82f6',
  KPI_DRAWER_DOWNLOAD:          '#f97316',
  KPI_SCHOOLIE_OPENED:          '#8b5cf6',
  SITE_FILTER_CHANGED:          '#10b981',
  DATE_RANGE_CHANGED:           '#14b8a6',
  KPI_LAYOUT_UPDATED:           '#64748b',
  TREND_KPI_SELECTED:           '#06b6d4',
  BENCHMARK_CONFIG_OPENED:      '#84cc16',
  DASHBOARD_DOWNLOAD_TRIGGERED: '#f59e0b',
  DASHBOARD_SCHOOLIE_OPENED:    '#ec4899',
  REPORT_VIEWED:                '#6366f1',
  REPORT_RUN:                   '#10b981',
  REPORT_DOWNLOADED:            '#f59e0b',
  REPORT_DISTRIBUTED:           '#8b5cf6',
  REPORT_EMAILED:               '#3b82f6',
  REPORT_CONFIG_VIEWED:         '#64748b',
};

export const PAGE_COLORS: Record<string, string> = {
  Workspace:    '#6366f1', // Indigo (Tech/General)
  Insights:     '#3b82f6', // Blue (Data/Depth)
  MenuAnalysis: '#f97316', // Orange (Spice/Food/Plating) - Very distinct from Teal
  Reports:      '#f59e0b', // Amber (Warmth)
  TimeAnalysis: '#14b8a6', // Teal (Time/Calendar)
  Funnel:       '#ec4899', // Pink (Flow/Conversion)
  Event:        '#8b5cf6',
};

export const TAB_COLORS: Record<string, string> = {
  Overview:    '#6366f1', // Indigo (Tech/General)
  Users:       '#3b82f6', // Blue (Data/Depth)
  Districts:   '#f97316', // Orange (Spice/Food/Plating) - Very distinct from Teal
  Sessions:    '#f59e0b', // Amber (Warmth)
  Timming:     '#14b8a6', // Teal (Time/Calendar)
  Funnel:      '#ec4899', // Pink (Flow/Conversion)
  Event:       '#8b5cf6',
};

// Centralized Icon Registry
export const APP_ICONS = {
  // Section/Tab Icons
  OVERVIEW: Activity,
  DISTRICT: Building2,
  USER: Users,
  
  // Metric/Functional Icons
  SESSIONS: Activity,
  PAGE_VIEWS: MousePointerClick,
  TIME: Clock,
  FREQUENCY: RefreshCw,
  TRENDS: TrendingUp,
  PAGES: Layers,
  EVENT: Globe,
  
  // Generic KPI Header Icon
  KPI_SECTION: Gauge, // Or Target/LayoutDashboard
};


export const ENTRY_POINT_COLORS: Record<string, string> = {
  Workspace:          '#6366f1',
  InsightsDirect:     '#3b82f6',
  MenuAnalysisDirect: '#10b981',
  ReportsDirect:      '#f59e0b',
};

export const ENTRY_POINT_LABELS: Record<string, string> = {
  Workspace:          'Workspace',
  InsightsDirect:     'Insights Direct',
  MenuAnalysisDirect: 'Menu Analysis Direct',
  ReportsDirect:      'Reports Direct',
};

export function fmtDuration(minutes: number, isDerived = false): string {
  const m = Math.round(minutes);
  if (m < 1) return isDerived ? '< 1 min (est.)' : '< 1 min';
  if (m < 60) return isDerived ? `${m} min (est.)` : `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  const base = rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  return isDerived ? `${base} (est.)` : base;
}

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

export function getEventFriendlyLabel(eventType: string, context: AppUsageEvent['context'] = {}): string {
  const base = APP_EVENT_FRIENDLY[eventType as keyof typeof APP_EVENT_FRIENDLY] ?? eventType;
  if (eventType === 'KPI_DRAWER_OPENED' && context.kpi) return `Opened ${context.kpi} ${context.drawerType ?? ''} Drawer`.trim();
  if (eventType === 'KPI_SCHOOLIE_OPENED' && context.kpi) return `Opened Schoolie Analysis – ${context.kpi}`;
  if (eventType === 'SITE_FILTER_CHANGED' && context.site) return `Changed Site Filter to ${context.site}`;
  if (eventType === 'PAGE_VIEWED' && context.entryPoint) return `Viewed ${context.entryPoint === 'Workspace' ? 'Workspace' : context.entryPoint.replace('Direct', '')} (Entry)`;
  return base;
}

export function applyAppFilters(events: AppUsageEvent[], filters: AppUsageFilters): AppUsageEvent[] {
  return events.filter(e => {
    if (filters.startDate && e.timestamp.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && e.timestamp.slice(0, 10) > filters.endDate) return false;
    if (filters.platform && e.platform !== filters.platform) return false;
    if (filters.districts.length && !filters.districts.includes(e.districtId)) return false;
    if (filters.userIds.length && !filters.userIds.includes(e.userId)) return false;
    if (filters.eventTypes.length && !filters.eventTypes.includes(e.eventType)) return false;
    return true;
  });
}

export function isAppInteraction(e: AppUsageEvent): boolean {
  return [...APP_INSIGHTS_INTERACTION_TYPES, ...APP_REPORTS_INTERACTION_TYPES].includes(e.eventType);
}

// Predefined funnels
export const APP_FUNNELS: AppFunnelDef[] = [
  // ─── Insights funnels ───
  {
    funnelId: 'insights_page_view',
    funnelName: 'Insights Page View',
    description: 'Measures how many sessions/users reached the Insights page.',
    category: 'Insights',
    steps: [
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
    ],
  },
  {
    funnelId: 'insights_engagement',
    funnelName: 'Insights Engagement',
    description: 'Measures whether users performed a meaningful action after reaching Insights.',
    category: 'Insights',
    steps: [
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'interacted_insights',
        label: 'Interacted with Insights',
        description: 'User performed a meaningful action on the Insights Dashboard.',
        match: evs => evs.some(e => APP_INSIGHTS_INTERACTION_TYPES.includes(e.eventType)),
      },
    ],
  },
  {
    funnelId: 'insights_drawer_usage',
    funnelName: 'Insights Drawer Usage',
    description: 'Measures whether users drilled into KPI details.',
    category: 'Insights',
    steps: [
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_kpi_drawer',
        label: 'Opened KPI Drawer',
        description: 'User opened a KPI detail drawer.',
        match: evs => evs.some(e => e.eventType === 'KPI_DRAWER_OPENED'),
      },
    ],
  },
  {
    funnelId: 'insights_drawer_download',
    funnelName: 'Insights Drawer Download',
    description: 'Measures whether users exported data after opening a KPI drawer.',
    category: 'Insights',
    steps: [
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_kpi_drawer',
        label: 'Opened KPI Drawer',
        description: 'User opened a KPI detail drawer.',
        match: evs => evs.some(e => e.eventType === 'KPI_DRAWER_OPENED'),
      },
      {
        stepKey: 'downloaded_from_drawer',
        label: 'Downloaded from Drawer',
        description: 'User exported data from a KPI drawer.',
        match: evs => evs.some(e => e.eventType === 'KPI_DRAWER_DOWNLOAD'),
      },
    ],
  },
  {
    funnelId: 'insights_drawer_schoolie',
    funnelName: 'Insights Drawer Schoolie',
    description: 'Measures whether users used AI analysis from a KPI drawer.',
    category: 'Insights',
    steps: [
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_kpi_drawer',
        label: 'Opened KPI Drawer',
        description: 'User opened a KPI detail drawer.',
        match: evs => evs.some(e => e.eventType === 'KPI_DRAWER_OPENED'),
      },
      {
        stepKey: 'opened_schoolie_from_drawer',
        label: 'Opened Schoolie from Drawer',
        description: 'User opened Schoolie AI analysis from a KPI drawer.',
        match: evs => evs.some(e => e.eventType === 'KPI_SCHOOLIE_OPENED'),
      },
    ],
  },
  {
    funnelId: 'insights_dashboard_schoolie',
    funnelName: 'Insights Dashboard Schoolie',
    description: 'Measures whether users used Schoolie from the Insights Dashboard.',
    category: 'Insights',
    steps: [
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_schoolie_dashboard',
        label: 'Opened Schoolie from Dashboard',
        description: 'User opened Schoolie AI analysis from the Insights Dashboard.',
        match: evs => evs.some(e => e.eventType === 'DASHBOARD_SCHOOLIE_OPENED'),
      },
    ],
  },
  // ─── Menu Analysis funnels ───
  {
    funnelId: 'menu_page_view',
    funnelName: 'Menu Analysis Page View',
    description: 'Measures how many sessions/users reached Menu Analysis.',
    category: 'Menu Analysis',
    steps: [
      {
        stepKey: 'viewed_menu',
        label: 'Viewed Menu Analysis',
        description: 'User reached the Menu Analysis page.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'MenuAnalysis'),
      },
    ],
  },
  {
    funnelId: 'menu_engagement',
    funnelName: 'Menu Analysis Engagement',
    description: 'Measures whether users performed a meaningful action after reaching Menu Analysis.',
    category: 'Menu Analysis',
    steps: [
      {
        stepKey: 'viewed_menu',
        label: 'Viewed Menu Analysis',
        description: 'User reached the Menu Analysis page.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'MenuAnalysis'),
      },
      {
        stepKey: 'interacted_menu',
        label: 'Interacted with Menu Analysis',
        description: 'User performed a meaningful action on Menu Analysis.',
        // Empty interaction array — will be populated when Menu Analysis tracking is finalized
        match: () => false,
      },
    ],
  },
  // ─── Reports funnels ───
  {
    funnelId: 'reports_page_view',
    funnelName: 'Reports Page View',
    description: 'Measures how many sessions/users reached Reports.',
    category: 'Reports',
    steps: [
      {
        stepKey: 'viewed_reports',
        label: 'Viewed Reports',
        description: 'User reached the Reports page.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Reports'),
      },
    ],
  },
  {
    funnelId: 'reports_engagement',
    funnelName: 'Reports Engagement',
    description: 'Measures whether users performed a meaningful report action after reaching Reports.',
    category: 'Reports',
    steps: [
      {
        stepKey: 'viewed_reports',
        label: 'Viewed Reports',
        description: 'User reached the Reports page.',
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Reports'),
      },
      {
        stepKey: 'interacted_reports',
        label: 'Interacted with Reports',
        description: 'User ran, downloaded, configured, distributed, or emailed a report.',
        match: evs => evs.some(e => APP_REPORTS_INTERACTION_TYPES.includes(e.eventType)),
      },
    ],
  },
];
