import { InsightsUsageEvent, InsightsUsageFilters, FunnelStep, INSIGHTS_INTERACTION_TYPES, INSIGHTS_EVENT_FRIENDLY } from '../../../types/insightsUsageTypes';
import { OrderedSelectItem } from '../../Common/DragReorderSelect';

/**
 * Returns true if the event counts as an "interaction" for summary/funnel metrics.
 * KPI_DRAWER_OPENED only counts when it is a district-level drawer open.
 */
export function isInsightsInteraction(e: InsightsUsageEvent): boolean {
  if (!(INSIGHTS_INTERACTION_TYPES as string[]).includes(e.eventType)) return false;
  if (e.eventType === 'KPI_DRAWER_OPENED') return e.context.isDistrictDrawer === true;
  return true;
}

export function applyInsightsFilters(
  events: InsightsUsageEvent[],
  filters: Partial<InsightsUsageFilters>
): InsightsUsageEvent[] {
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


// Event types hidden by default — less operationally relevant for most users
const DEPRIORITIZED_EVENTS = new Set([
  'BULK_UPDATE',
  'LAYOUT_CONFIG_CHANGED',
  'BENCHMARK_UPDATED',
  'BENCHMARK_CONFIG_OPENED',
  'KPI_RENDERED',  // passive render tracking — not an interaction
]);

// Shared default item list for the interaction chart and co-occurrence matrix.
// All event types present; the deprioritized four are unselected by default.
export const DEFAULT_INSIGHTS_CHART_ITEMS: OrderedSelectItem[] =
  Object.entries(INSIGHTS_EVENT_FRIENDLY).map(([value, label]) => ({
    value,
    label,
    selected: !DEPRIORITIZED_EVENTS.has(value),
  }));


// ─── Funnel definitions ───────────────────────────────────────────────────────

export interface FunnelStepDef {
  label: string;
  filter: (e: InsightsUsageEvent) => boolean;
}

export interface FunnelDef {
  id: string;
  name: string;
  description: string;
  steps: FunnelStepDef[];
}

export const INSIGHT_FUNNELS: FunnelDef[] = [
  {
    id: 'engagement',
    name: 'Insights Engagement',
    description: 'Measures whether users are doing anything meaningful after reaching Insights.',
    steps: [
      { label: 'Viewed Insights',       filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Interacted',            filter: isInsightsInteraction },
    ],
  },
  {
    id: 'kpi-drawer',
    name: 'KPI Drawer Usage',
    description: 'Measures whether users drill into KPI details.',
    steps: [
      { label: 'Viewed Insights',       filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Opened KPI Drawer',     filter: e => e.eventType === 'KPI_DRAWER_OPENED' },
    ],
  },
  {
    id: 'kpi-drawer-download',
    name: 'KPI Drawer Download',
    description: 'Measures whether users export data after opening a KPI drawer.',
    steps: [
      { label: 'Viewed Insights',         filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Opened KPI Drawer',       filter: e => e.eventType === 'KPI_DRAWER_OPENED' },
      { label: 'Downloaded from Drawer',  filter: e => e.eventType === 'KPI_DRAWER_DOWNLOAD' },
    ],
  },
  {
    id: 'kpi-drawer-schoolie',
    name: 'KPI Drawer Schoolie',
    description: 'Measures whether users use Schoolie after opening a KPI drawer.',
    steps: [
      { label: 'Viewed Insights',         filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Opened KPI Drawer',       filter: e => e.eventType === 'KPI_DRAWER_OPENED' },
      { label: 'Opened KPI Schoolie',     filter: e => e.eventType === 'KPI_SCHOOLIE_OPENED' },
    ],
  },
  {
    id: 'dashboard-schoolie',
    name: 'Dashboard Schoolie',
    description: 'Measures whether users use Schoolie directly from the Insights Dashboard.',
    steps: [
      { label: 'Viewed Insights',         filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Opened Dashboard Schoolie', filter: e => e.eventType === 'DASHBOARD_SCHOOLIE_OPENED' },
    ],
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis Usage',
    description: 'Measures whether users interact with the trend chart.',
    steps: [
      { label: 'Viewed Insights',         filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Selected Trend KPI',      filter: e => e.eventType === 'TREND_KPI_CHANGED' },
    ],
  },
  {
    id: 'benchmark-config',
    name: 'Benchmark Configuration',
    description: 'Measures whether authorized users access and update benchmark configuration.',
    steps: [
      { label: 'Viewed Insights',              filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Opened Benchmark Config',      filter: e => e.eventType === 'BENCHMARK_CONFIG_OPENED' },
      { label: 'Updated Benchmark Config',     filter: e => e.eventType === 'BENCHMARK_UPDATED' },
    ],
  },
  {
    id: 'layout-config',
    name: 'Layout Configuration',
    description: 'Measures whether users customize their dashboard layout.',
    steps: [
      { label: 'Viewed Insights',         filter: e => e.eventType === 'INSIGHTS_PAGE_VIEWED' },
      { label: 'Changed Layout Config',   filter: e => e.eventType === 'LAYOUT_CONFIG_CHANGED' },
    ],
  },
];

/**
 * Strict funnel computation: step N counts only sessions that completed
 * ALL prior steps AND step N. Pct is relative to step 0 (page views).
 */
export function computeFunnelSteps(
  events: InsightsUsageEvent[],
  funnel: FunnelDef
): FunnelStep[] {
  const sessionSets = funnel.steps.map(step =>
    new Set(events.filter(step.filter).map(e => e.sessionId))
  );
  const base = sessionSets[0]?.size ?? 0;

  return funnel.steps.map((step, i) => {
    const count = i === 0
      ? base
      : [...sessionSets[0]].filter(sid =>
          sessionSets.slice(1, i + 1).every(s => s.has(sid))
        ).length;
    return {
      label: step.label,
      count,
      pct: base > 0 ? (count / base) * 100 : 0,
    };
  });
}
