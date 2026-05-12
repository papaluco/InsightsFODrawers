import type { TelemetryEvent, SessionHealth } from '../telemetry/types';
import { fetchSessions, fetchSessionTimeline, type SessionSummaryRow } from '../lib/api';

export interface SessionRow {
  sessionId: string;
  userId?: string;
  districtId?: string;
  health: SessionHealth;
  errorCount: number;
  criticalErrors: number;
  highErrors: number;
  slowEventCount: number;
  totalEvents: number;
  usageEventCount: number;
  perfEventCount: number;
  modules: string[];
  firstSeen: string;
  lastSeen: string;
  durationMs: number;
}

export interface SessionFilters {
  startDate: string;
  endDate: string;
  health: SessionHealth[];
  districtSearch: string;
  sessionSearch: string;
}

export const DEFAULT_SESSION_FILTERS: SessionFilters = {
  startDate: '', endDate: '', health: [],
  districtSearch: '', sessionSearch: '',
};

export interface SessionKpis {
  total: number;
  healthy: number;
  slow: number;
  degraded: number;
  failed: number;
  healthyPct: number;
  errorFreeRate: number;
}

export interface SessionData {
  sessions: SessionRow[];
  kpis: SessionKpis;
}

function toSessionRow(r: SessionSummaryRow): SessionRow {
  return {
    sessionId:       r.session_id,
    userId:          r.user_id ?? undefined,
    districtId:      r.district_id ?? undefined,
    health:          r.health as SessionHealth,
    errorCount:      r.error_count,
    criticalErrors:  r.critical_errors,
    highErrors:      r.high_errors,
    slowEventCount:  r.slow_event_count,
    totalEvents:     r.total_events,
    usageEventCount: r.usage_event_count,
    perfEventCount:  r.perf_event_count,
    modules:         r.modules ?? [],
    firstSeen:       r.first_seen ?? '',
    lastSeen:        r.last_seen ?? '',
    durationMs:      r.duration_ms,
  };
}

export async function getSessionData(filters: Partial<SessionFilters> = {}): Promise<SessionData> {
  const res = await fetchSessions({
    startDate:     filters.startDate    || undefined,
    endDate:       filters.endDate      || undefined,
    health:        filters.health?.length ? filters.health.map(h => h as string) : undefined,
    districtSearch:filters.districtSearch || undefined,
    sessionSearch: filters.sessionSearch  || undefined,
  });

  return {
    sessions: res.sessions.map(toSessionRow),
    kpis: {
      total:         res.kpis.total,
      healthy:       res.kpis.healthy,
      slow:          res.kpis.slow,
      degraded:      res.kpis.degraded,
      failed:        res.kpis.failed,
      healthyPct:    res.kpis.healthy_pct,
      errorFreeRate: res.kpis.error_free_rate,
    },
  };
}

export async function getSessionTimeline(sessionId: string): Promise<TelemetryEvent[]> {
  const res = await fetchSessionTimeline(sessionId);

  return res.events.map((e): TelemetryEvent => {
    const base = {
      eventId:     e.event_id,
      eventName:   e.event_name,
      timestamp:   e.timestamp,
      sessionId:   e.session_id,
      module:      e.module,
      source:      e.source as TelemetryEvent['source'],
      districtId:  e.district_id ?? undefined,
      userId:      e.user_id ?? undefined,
      route:       e.route ?? undefined,
      page:        e.page ?? undefined,
      component:   e.component ?? undefined,
      action:      e.action ?? undefined,
      correlationId:  (e as any).correlation_id ?? undefined,
    };

    if (e.event_domain === 'usage') {
      return { ...base, eventDomain: 'usage', usageCategory: (e as any).usage_category };
    }
    if (e.event_domain === 'error') {
      const err = e as any;
      return {
        ...base,
        eventDomain:     'error',
        errorCategory:   err.error_category,
        severity:        err.severity,
        message:         err.message,
        statusCode:      err.status_code ?? undefined,
        isUserBlocking:  err.is_user_blocking,
        sanitizedStackTrace: err.sanitized_stack_trace ?? undefined,
      };
    }
    // performance
    const perf = e as any;
    return {
      ...base,
      eventDomain:         'performance',
      performanceCategory: perf.performance_category,
      durationMs:          perf.duration_ms,
      thresholdMs:         perf.threshold_ms ?? undefined,
      isSlow:              perf.is_slow,
      success:             perf.success,
    };
  });
}
