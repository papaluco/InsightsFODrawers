import type { PerformanceTelemetryEvent, PerformanceCategory } from '../telemetry/types';
import { fetchPerformance, type PerformanceEventRow, type CategoryStatRow } from '../lib/api';

export interface PerfFilters {
  startDate: string;
  endDate: string;
  categories: PerformanceCategory[];
  modules: string[];
  components: string[];
  isSlow: '' | 'true' | 'false';
  isSuccess: '' | 'true' | 'false';
  eventSearch: string;
}

export const DEFAULT_PERF_FILTERS: PerfFilters = {
  startDate: '', endDate: '',
  categories: [], modules: [], components: [],
  isSlow: '', isSuccess: '', eventSearch: '',
};

export interface PerfKpis {
  total: number;
  slowCount: number;
  slowPct: number;
  failedCount: number;
  p50Ms: number;
  p95Ms: number;
  avgMs: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  slowCount: number;
  slowPct: number;
  avgMs: number;
  p95Ms: number;
}

export interface PerfFilterOptions {
  modules:    { value: string; label: string }[];
  components: { value: string; label: string }[];
  categories: { value: string; label: string }[];
}

export interface PerfData {
  events: PerformanceTelemetryEvent[];
  kpis: PerfKpis;
  categoryStats: CategoryStat[];
  filterOptions: PerfFilterOptions;
}

function toPerfEvent(r: PerformanceEventRow): PerformanceTelemetryEvent {
  return {
    eventId:              r.event_id,
    eventDomain:          'performance',
    eventName:            r.event_name,
    timestamp:            r.timestamp,
    sessionId:            r.session_id,
    module:               r.module,
    source:               r.source as PerformanceTelemetryEvent['source'],
    correlationId:        r.correlation_id ?? undefined,
    districtId:           r.district_id ?? undefined,
    userId:               r.user_id ?? undefined,
    route:                r.route ?? undefined,
    page:                 r.page ?? undefined,
    component:            r.component ?? undefined,
    action:               r.action ?? undefined,
    performanceCategory:  r.performance_category as PerformanceCategory,
    durationMs:           r.duration_ms,
    thresholdMs:          r.threshold_ms ?? undefined,
    isSlow:               r.is_slow,
    success:              r.success,
    properties:           r.properties ?? undefined,
  };
}

function toCategoryStat(r: CategoryStatRow): CategoryStat {
  return {
    category:  r.category,
    count:     r.count,
    slowCount: r.slow_count,
    slowPct:   r.slow_pct,
    avgMs:     r.avg_ms,
    p95Ms:     r.p95_ms,
  };
}

export async function getPerfData(filters: Partial<PerfFilters> = {}): Promise<PerfData> {
  const res = await fetchPerformance({
    startDate:   filters.startDate   || undefined,
    endDate:     filters.endDate     || undefined,
    category:    filters.categories?.length  ? filters.categories  : undefined,
    module:      filters.modules?.length     ? filters.modules     : undefined,
    component:   filters.components?.length  ? filters.components  : undefined,
    isSlow:      filters.isSlow    || undefined,
    isSuccess:   filters.isSuccess || undefined,
    eventSearch: filters.eventSearch || undefined,
  });

  const toOpt = (v: string) => ({ value: v, label: v.replace(/_/g, ' ') });

  return {
    events: res.events.map(toPerfEvent),
    kpis: {
      total:       res.kpis.total,
      slowCount:   res.kpis.slow_count,
      slowPct:     res.kpis.slow_pct,
      failedCount: res.kpis.failed_count,
      p50Ms:       res.kpis.p50_ms,
      p95Ms:       res.kpis.p95_ms,
      avgMs:       res.kpis.avg_ms,
    },
    categoryStats: res.category_stats.map(toCategoryStat),
    filterOptions: {
      modules:    res.filter_options.modules.map(toOpt),
      components: res.filter_options.components.map(v => ({ value: v, label: v })),
      categories: res.filter_options.categories.map(toOpt),
    },
  };
}
