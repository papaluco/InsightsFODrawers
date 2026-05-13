import type { ErrorTelemetryEvent, ErrorSeverity, ErrorCategory } from '../telemetry/types';
import { fetchErrors, type ErrorEventRow } from '../lib/api';

export interface ErrorFilters {
  startDate: string;
  endDate: string;
  severities: ErrorSeverity[];
  categories: ErrorCategory[];
  modules: string[];
  components: string[];
  users: string[];
  districts: string[];
  isUserBlocking: '' | 'true' | 'false';
  sessionSearch: string;
}

export const DEFAULT_ERROR_FILTERS: ErrorFilters = {
  startDate: '', endDate: '',
  severities: [], categories: [],
  modules: [], components: [],
  users: [], districts: [],
  isUserBlocking: '', sessionSearch: '',
};

export interface ErrorKpis {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  userBlocking: number;
  affectedSessions: number;
}

export interface ErrorFilterOptions {
  modules:    { value: string; label: string }[];
  components: { value: string; label: string }[];
  categories: { value: string; label: string }[];
}

export interface ErrorData {
  events: ErrorTelemetryEvent[];
  kpis: ErrorKpis;
  filterOptions: ErrorFilterOptions;
}

function toErrorEvent(r: ErrorEventRow): ErrorTelemetryEvent {
  return {
    eventId:               r.event_id,
    eventDomain:           'error',
    eventName:             r.event_name,
    timestamp:             r.timestamp,
    sessionId:             r.session_id,
    module:                r.module,
    source:                r.source as ErrorTelemetryEvent['source'],
    correlationId:         r.correlation_id ?? undefined,
    districtId:            r.district_id ?? undefined,
    userId:                r.user_id ?? undefined,
    route:                 r.route ?? undefined,
    page:                  r.page ?? undefined,
    component:             r.component ?? undefined,
    action:                r.action ?? undefined,
    errorCategory:         r.error_category as ErrorCategory,
    severity:              r.severity as ErrorSeverity,
    message:               r.message,
    statusCode:            r.status_code ?? undefined,
    isUserBlocking:        r.is_user_blocking,
    sanitizedStackTrace:   r.sanitized_stack_trace ?? undefined,
    properties:            r.properties ?? undefined,
  };
}

export async function getErrorData(filters: Partial<ErrorFilters> = {}): Promise<ErrorData> {
  const res = await fetchErrors({
    startDate:     filters.startDate     || undefined,
    endDate:       filters.endDate       || undefined,
    severity:      filters.severities?.length  ? filters.severities  : undefined,
    category:      filters.categories?.length  ? filters.categories  : undefined,
    module:        filters.modules?.length      ? filters.modules     : undefined,
    component:     filters.components?.length   ? filters.components  : undefined,
    isUserBlocking:filters.isUserBlocking || undefined,
    sessionSearch: filters.sessionSearch || undefined,
  });

  const toOpt = (v: string) => ({ value: v, label: v.replace(/_/g, ' ') });

  let events = res.events.map(toErrorEvent);
  if (filters.users?.length)     events = events.filter(e => e.userId     && filters.users!.includes(e.userId));
  if (filters.districts?.length) events = events.filter(e => e.districtId && filters.districts!.includes(e.districtId));

  return {
    events,
    kpis: {
      total:            res.kpis.total,
      critical:         res.kpis.critical,
      high:             res.kpis.high,
      medium:           res.kpis.medium,
      low:              res.kpis.low,
      userBlocking:     res.kpis.user_blocking,
      affectedSessions: res.kpis.affected_sessions,
    },
    filterOptions: {
      modules:    res.filter_options.modules.map(toOpt),
      components: res.filter_options.components.map(v => ({ value: v, label: v })),
      categories: res.filter_options.categories.map(toOpt),
    },
  };
}
