import { fetchReliability } from '../lib/api';

export interface ReliabilityKpis {
  errorFreeSessionRate: number;
  userBlockingRate: number;
  criticalErrorCount: number;
  userBlockingCount: number;
  totalSessions: number;
  sessionsWithCritical: number;
  mttr: number;
}

export interface ComponentRisk {
  component: string;
  errorCount: number;
  criticalCount: number;
  userBlockingCount: number;
  modules: string[];
}

export interface IncidentEntry {
  eventId: string;
  timestamp: string;
  severity: 'critical' | 'high';
  message: string;
  component?: string;
  module: string;
  isUserBlocking: boolean;
  sessionId: string;
}

export interface SeverityTrend {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ReliabilityData {
  kpis: ReliabilityKpis;
  componentRisks: ComponentRisk[];
  incidentLog: IncidentEntry[];
  severityTrend: SeverityTrend[];
}

export async function getReliabilityData(): Promise<ReliabilityData> {
  const res = await fetchReliability();

  return {
    kpis: {
      errorFreeSessionRate: res.kpis.error_free_session_rate,
      userBlockingRate:     res.kpis.user_blocking_rate,
      criticalErrorCount:   res.kpis.critical_error_count,
      userBlockingCount:    res.kpis.user_blocking_count,
      totalSessions:        res.kpis.total_sessions,
      sessionsWithCritical: res.kpis.sessions_with_critical,
      mttr:                 res.kpis.mttr,
    },
    componentRisks: res.component_risks.map(r => ({
      component:        r.component,
      errorCount:       r.error_count,
      criticalCount:    r.critical_count,
      userBlockingCount:r.user_blocking_count,
      modules:          r.modules,
    })),
    incidentLog: res.incident_log.map(r => ({
      eventId:        r.event_id,
      timestamp:      r.timestamp,
      severity:       r.severity as 'critical' | 'high',
      message:        r.message,
      component:      r.component ?? undefined,
      module:         r.module,
      isUserBlocking: r.is_user_blocking,
      sessionId:      r.session_id,
    })),
    severityTrend: res.severity_trend.map(r => ({
      date:     r.date,
      critical: r.critical,
      high:     r.high,
      medium:   r.medium,
      low:      r.low,
    })),
  };
}
