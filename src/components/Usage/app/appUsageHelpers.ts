import {
  AppUsageEvent,
  AppUsageFilters,
  AppFunnelDef,
  APP_EVENT_FRIENDLY,
  APP_INSIGHTS_INTERACTION_TYPES,
  APP_REPORTS_INTERACTION_TYPES,
} from '../../../types/appUsageTypes';
import { FUNNEL_COLORS, EVENT_COLORS } from '../common/usageHelpers';



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

const WORKSPACE_STEP = {
  stepKey: 'viewed_workspace',
  label: 'Viewed Workspace',
  description: 'User started at the Workspace.',
  color: FUNNEL_COLORS.Workspace,
  match: (evs: AppUsageEvent[]) => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Workspace'),
};

// Predefined funnels
export const APP_FUNNELS: AppFunnelDef[] = [
  // ─── Insights funnels ───
  {
    funnelId: 'insights_page_view',
    funnelName: 'Insights Page View',
    description: 'Measures how many sessions/users reached the Insights page.',
    category: 'Insights',
    steps: [
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        color: FUNNEL_COLORS.Insights,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        color: FUNNEL_COLORS.Insights,
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'interacted_insights',
        label: 'Interacted with Insights',
        description: 'User performed a meaningful action on the Insights Dashboard.',
        color: EVENT_COLORS.SITE_FILTER_CHANGED,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        color: FUNNEL_COLORS.Insights,
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_kpi_drawer',
        label: 'Opened KPI Drawer',
        description: 'User opened a KPI detail drawer.',
        color: EVENT_COLORS.KPI_DRAWER_OPENED,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        color: FUNNEL_COLORS.Insights,
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_kpi_drawer',
        label: 'Opened KPI Drawer',
        description: 'User opened a KPI detail drawer.',
        color: EVENT_COLORS.KPI_DRAWER_OPENED,
        match: evs => evs.some(e => e.eventType === 'KPI_DRAWER_OPENED'),
      },
      {
        stepKey: 'downloaded_from_drawer',
        label: 'Downloaded from Drawer',
        description: 'User exported data from a KPI drawer.',
        color: EVENT_COLORS.KPI_DRAWER_DOWNLOAD,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        color: FUNNEL_COLORS.Insights,
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_kpi_drawer',
        label: 'Opened KPI Drawer',
        description: 'User opened a KPI detail drawer.',
        color: EVENT_COLORS.KPI_DRAWER_OPENED,
        match: evs => evs.some(e => e.eventType === 'KPI_DRAWER_OPENED'),
      },
      {
        stepKey: 'opened_schoolie_from_drawer',
        label: 'Opened Schoolie from Drawer',
        description: 'User opened Schoolie AI analysis from a KPI drawer.',
        color: EVENT_COLORS.KPI_SCHOOLIE_OPENED,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_insights',
        label: 'Viewed Insights',
        description: 'User reached the Insights Dashboard.',
        color: FUNNEL_COLORS.Insights,
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Insights'),
      },
      {
        stepKey: 'opened_schoolie_dashboard',
        label: 'Opened Schoolie from Dashboard',
        description: 'User opened Schoolie AI analysis from the Insights Dashboard.',
        color: EVENT_COLORS.DASHBOARD_SCHOOLIE_OPENED,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_menu',
        label: 'Viewed Menu Analysis',
        description: 'User reached the Menu Analysis page.',
        color: FUNNEL_COLORS.MenuAnalysis,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_menu',
        label: 'Viewed Menu Analysis',
        description: 'User reached the Menu Analysis page.',
        color: FUNNEL_COLORS.MenuAnalysis,
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'MenuAnalysis'),
      },
      {
        stepKey: 'interacted_menu',
        label: 'Interacted with Menu Analysis',
        description: 'User performed a meaningful action on Menu Analysis.',
        color: EVENT_COLORS.SITE_FILTER_CHANGED,
        // Will be populated when Menu Analysis tracking is finalized
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_reports',
        label: 'Viewed Reports',
        description: 'User reached the Reports page.',
        color: FUNNEL_COLORS.Reports,
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
      WORKSPACE_STEP,
      {
        stepKey: 'viewed_reports',
        label: 'Viewed Reports',
        description: 'User reached the Reports page.',
        color: FUNNEL_COLORS.Reports,
        match: evs => evs.some(e => e.eventType === 'PAGE_VIEWED' && e.page === 'Reports'),
      },
      {
        stepKey: 'interacted_reports',
        label: 'Interacted with Reports',
        description: 'User ran, downloaded, configured, distributed, or emailed a report.',
        color: EVENT_COLORS.REPORT_RUN,
        match: evs => evs.some(e => APP_REPORTS_INTERACTION_TYPES.includes(e.eventType)),
      },
    ],
  },
];
