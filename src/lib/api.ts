// ============================================================================
// Typed Edge Function client
// All requests use the anon key — Edge Functions use service role internally.
// ============================================================================

import { telemetry } from '../telemetry';

const BASE = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

type ParamValue = string | string[] | boolean | number | undefined | null;

function buildUrl(path: string, params?: Record<string, ParamValue>): string {
  const url = new URL(`${BASE}/${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) {
        v.forEach(item => url.searchParams.append(k, String(item)));
      } else {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

async function get<T>(path: string, params?: Record<string, ParamValue>): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    headers: { Authorization: `Bearer ${ANON}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    telemetry.trackError(`api_${path}_failed`, {
      errorCategory: 'api_error',
      severity: res.status >= 500 ? 'high' : 'medium',
      message: `[${path}] ${res.status}: ${text}`,
      statusCode: res.status,
      isUserBlocking: true,
      module: 'app_health',
      source: 'frontend',
    });
    throw new Error(`[${path}] ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    telemetry.trackError(`api_${path}_failed`, {
      errorCategory: 'api_error',
      severity: res.status >= 500 ? 'high' : 'medium',
      message: `[${path}] ${res.status}: ${text}`,
      statusCode: res.status,
      isUserBlocking: true,
      module: 'app_health',
      source: 'frontend',
    });
    throw new Error(`[${path}] ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Response types (snake_case — mirrors DB column names) ─────────────────────

export interface ErrorEventRow {
  event_id: string; event_name: string; timestamp: string;
  session_id: string; module: string; source: string;
  correlation_id: string | null; district_id: string | null;
  user_id: string | null; route: string | null; page: string | null;
  component: string | null; action: string | null;
  error_category: string; severity: string; message: string;
  status_code: number | null; is_user_blocking: boolean;
  sanitized_stack_trace: string | null;
  properties: Record<string, unknown> | null;
}

export interface PerformanceEventRow {
  event_id: string; event_name: string; timestamp: string;
  session_id: string; module: string; source: string;
  correlation_id: string | null; district_id: string | null;
  user_id: string | null; route: string | null; page: string | null;
  component: string | null; action: string | null;
  performance_category: string; duration_ms: number;
  threshold_ms: number | null; is_slow: boolean; success: boolean;
  properties: Record<string, unknown> | null;
}

export interface UsageEventRow {
  event_id: string; event_name: string; timestamp: string;
  session_id: string; module: string; source: string;
  correlation_id: string | null; district_id: string | null;
  user_id: string | null; route: string | null; page: string | null;
  component: string | null; action: string | null;
  usage_category: string;
  properties: Record<string, unknown> | null;
}

export interface SessionSummaryRow {
  session_id: string; user_id: string | null; district_id: string | null;
  health: string; error_count: number; critical_errors: number;
  high_errors: number; slow_event_count: number; total_events: number;
  usage_event_count: number; perf_event_count: number;
  modules: string[]; first_seen: string | null; last_seen: string | null;
  duration_ms: number;
}

export interface ErrorKpisRow {
  total: number; critical: number; high: number; medium: number; low: number;
  user_blocking: number; affected_sessions: number;
}

export interface PerfKpisRow {
  total: number; slow_count: number; slow_pct: number;
  failed_count: number; p50_ms: number; p95_ms: number; avg_ms: number;
}

export interface CategoryStatRow {
  category: string; count: number; slow_count: number;
  slow_pct: number; avg_ms: number; p95_ms: number;
}

export interface SessionKpisRow {
  total: number; healthy: number; slow: number; degraded: number; failed: number;
  healthy_pct: number; error_free_rate: number;
}

export interface ReliabilityKpisRow {
  error_free_session_rate: number; user_blocking_rate: number;
  critical_error_count: number; user_blocking_count: number;
  total_sessions: number; sessions_with_critical: number; mttr: number;
}

export interface ComponentRiskRow {
  component: string; error_count: number; critical_count: number;
  user_blocking_count: number; modules: string[];
}

export interface IncidentEntryRow {
  event_id: string; timestamp: string; severity: string; message: string;
  component: string | null; module: string; is_user_blocking: boolean; session_id: string;
}

export interface SeverityTrendRow {
  date: string; critical: number; high: number; medium: number; low: number;
}

export interface FilterOptions {
  modules: string[]; components: string[]; categories: string[];
}

export interface ErrorsApiResponse {
  events: ErrorEventRow[]; kpis: ErrorKpisRow; filter_options: FilterOptions;
}

export interface PerformanceApiResponse {
  events: PerformanceEventRow[]; kpis: PerfKpisRow;
  category_stats: CategoryStatRow[]; filter_options: FilterOptions;
}

export interface SessionsApiResponse {
  sessions: SessionSummaryRow[]; kpis: SessionKpisRow;
}

export interface SessionTimelineApiResponse {
  events: Array<
    (UsageEventRow  & { event_domain: 'usage' }) |
    (ErrorEventRow  & { event_domain: 'error' }) |
    (PerformanceEventRow & { event_domain: 'performance' })
  >;
  session: SessionSummaryRow | null;
}

export interface ReliabilityApiResponse {
  kpis: ReliabilityKpisRow;
  component_risks: ComponentRiskRow[];
  incident_log: IncidentEntryRow[];
  severity_trend: SeverityTrendRow[];
}

export interface IngestApiResponse {
  received: number; failed: number; batch_id: string;
}

// ── Typed callers ─────────────────────────────────────────────────────────────

export interface ErrorQueryParams {
  startDate?: string; endDate?: string;
  severity?: string[]; category?: string[]; module?: string[]; component?: string[];
  isUserBlocking?: string; sessionSearch?: string;
}

export function fetchErrors(p: ErrorQueryParams): Promise<ErrorsApiResponse> {
  return get<ErrorsApiResponse>('errors', {
    startDate: p.startDate, endDate: p.endDate,
    severity: p.severity, category: p.category,
    module: p.module, component: p.component,
    isUserBlocking: p.isUserBlocking, sessionSearch: p.sessionSearch,
  });
}

export interface PerfQueryParams {
  startDate?: string; endDate?: string;
  category?: string[]; module?: string[]; component?: string[];
  isSlow?: string; isSuccess?: string; eventSearch?: string;
}

export function fetchPerformance(p: PerfQueryParams): Promise<PerformanceApiResponse> {
  return get<PerformanceApiResponse>('performance', {
    startDate: p.startDate, endDate: p.endDate,
    category: p.category, module: p.module, component: p.component,
    isSlow: p.isSlow, isSuccess: p.isSuccess, eventSearch: p.eventSearch,
  });
}

export interface SessionQueryParams {
  startDate?: string; endDate?: string;
  health?: string[]; districtSearch?: string; sessionSearch?: string;
}

export function fetchSessions(p: SessionQueryParams): Promise<SessionsApiResponse> {
  return get<SessionsApiResponse>('sessions', {
    startDate: p.startDate, endDate: p.endDate,
    health: p.health, districtSearch: p.districtSearch, sessionSearch: p.sessionSearch,
  });
}

export function fetchSessionTimeline(sessionId: string): Promise<SessionTimelineApiResponse> {
  return get<SessionTimelineApiResponse>('sessions-timeline', { sessionId });
}

export function fetchReliability(): Promise<ReliabilityApiResponse> {
  return get<ReliabilityApiResponse>('reliability');
}

export function ingestEvents(body: unknown): Promise<IngestApiResponse> {
  return post<IngestApiResponse>('ingest', body);
}
