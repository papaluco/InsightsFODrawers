// ============================================================================
// Edge Function DTO types — snake_case matches Postgres column names.
// Frontend services transform these to camelCase before exposing to components.
// ============================================================================

// ── DB row shapes ─────────────────────────────────────────────────────────────

export interface UsageEventRow {
  event_id: string;
  event_name: string;
  timestamp: string;
  session_id: string;
  module: string;
  source: string;
  correlation_id: string | null;
  workflow_id: string | null;
  parent_event_id: string | null;
  district_id: string | null;
  site_id: string | null;
  user_id: string | null;
  route: string | null;
  page: string | null;
  component: string | null;
  action: string | null;
  usage_category: string;
  properties: Record<string, unknown> | null;
}

export interface ErrorEventRow {
  event_id: string;
  event_name: string;
  timestamp: string;
  session_id: string;
  module: string;
  source: string;
  correlation_id: string | null;
  workflow_id: string | null;
  parent_event_id: string | null;
  district_id: string | null;
  site_id: string | null;
  user_id: string | null;
  route: string | null;
  page: string | null;
  component: string | null;
  action: string | null;
  error_category: string;
  severity: string;
  message: string;
  status_code: number | null;
  is_user_blocking: boolean;
  sanitized_stack_trace: string | null;
  properties: Record<string, unknown> | null;
}

export interface PerformanceEventRow {
  event_id: string;
  event_name: string;
  timestamp: string;
  session_id: string;
  module: string;
  source: string;
  correlation_id: string | null;
  workflow_id: string | null;
  parent_event_id: string | null;
  district_id: string | null;
  site_id: string | null;
  user_id: string | null;
  route: string | null;
  page: string | null;
  component: string | null;
  action: string | null;
  performance_category: string;
  duration_ms: number;
  threshold_ms: number | null;
  is_slow: boolean;
  success: boolean;
  properties: Record<string, unknown> | null;
}

export interface SessionSummaryRow {
  session_id: string;
  user_id: string | null;
  district_id: string | null;
  health: string;
  error_count: number;
  critical_errors: number;
  high_errors: number;
  slow_event_count: number;
  total_events: number;
  usage_event_count: number;
  perf_event_count: number;
  modules: string[];
  first_seen: string | null;
  last_seen: string | null;
  duration_ms: number;
}

// ── KPI shapes (from SQL aggregate functions) ─────────────────────────────────

export interface ErrorKpisRow {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  user_blocking: number;
  affected_sessions: number;
}

export interface PerfKpisRow {
  total: number;
  slow_count: number;
  slow_pct: number;
  failed_count: number;
  p50_ms: number;
  p95_ms: number;
  avg_ms: number;
}

export interface CategoryStatRow {
  category: string;
  count: number;
  slow_count: number;
  slow_pct: number;
  avg_ms: number;
  p95_ms: number;
}

export interface SessionKpisRow {
  total: number;
  healthy: number;
  slow: number;
  degraded: number;
  failed: number;
  healthy_pct: number;
  error_free_rate: number;
}

export interface ReliabilityKpisRow {
  error_free_session_rate: number;
  user_blocking_rate: number;
  critical_error_count: number;
  user_blocking_count: number;
  total_sessions: number;
  sessions_with_critical: number;
  mttr: number;
}

export interface ComponentRiskRow {
  component: string;
  error_count: number;
  critical_count: number;
  user_blocking_count: number;
  modules: string[];
}

export interface IncidentEntryRow {
  event_id: string;
  timestamp: string;
  severity: string;
  message: string;
  component: string | null;
  module: string;
  is_user_blocking: boolean;
  session_id: string;
}

export interface SeverityTrendRow {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

// ── Edge Function response bodies ─────────────────────────────────────────────

export interface FilterOptions {
  modules: string[];
  components: string[];
  categories: string[];
}

export interface ErrorsResponse {
  events: ErrorEventRow[];
  kpis: ErrorKpisRow;
  filter_options: FilterOptions;
}

export interface PerformanceResponse {
  events: PerformanceEventRow[];
  kpis: PerfKpisRow;
  category_stats: CategoryStatRow[];
  filter_options: FilterOptions;
}

export interface SessionsResponse {
  sessions: SessionSummaryRow[];
  kpis: SessionKpisRow;
}

export interface SessionTimelineResponse {
  events: Array<
    (UsageEventRow & { event_domain: 'usage' }) |
    (ErrorEventRow & { event_domain: 'error' }) |
    (PerformanceEventRow & { event_domain: 'performance' })
  >;
  session: SessionSummaryRow | null;
}

export interface ReliabilityResponse {
  kpis: ReliabilityKpisRow;
  component_risks: ComponentRiskRow[];
  incident_log: IncidentEntryRow[];
  severity_trend: SeverityTrendRow[];
}

export interface IngestResponse {
  received: number;
  failed: number;
  batch_id: string;
}
