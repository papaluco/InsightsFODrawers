import { preflight, json, apiError } from '../_shared/cors.ts';
import { createSupabaseAdmin } from '../_shared/client.ts';
import type {
  ReliabilityResponse, ReliabilityKpisRow,
  ComponentRiskRow, IncidentEntryRow, SeverityTrendRow,
} from '../_shared/types.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return apiError('Method not allowed', 405);

  try {
    const supabase = createSupabaseAdmin();

    const [kpisResult, risksResult, trendResult, incidentsResult] = await Promise.all([
      supabase.rpc('get_reliability_kpis'),
      supabase.rpc('get_component_risks'),
      supabase.rpc('get_severity_trend'),
      supabase.from('telemetry_error_events')
        .select('event_id, timestamp, severity, message, component, module, is_user_blocking, session_id')
        .in('severity', ['critical', 'high'])
        .order('timestamp', { ascending: false })
        .limit(50),
    ]);

    if (kpisResult.error)      return apiError(kpisResult.error.message);
    if (risksResult.error)     return apiError(risksResult.error.message);
    if (trendResult.error)     return apiError(trendResult.error.message);
    if (incidentsResult.error) return apiError(incidentsResult.error.message);

    const kpisRow = Array.isArray(kpisResult.data) ? kpisResult.data[0] : kpisResult.data;

    const kpis: ReliabilityKpisRow = {
      error_free_session_rate: Number(kpisRow?.error_free_session_rate ?? 100),
      user_blocking_rate:      Number(kpisRow?.user_blocking_rate      ?? 0),
      critical_error_count:    Number(kpisRow?.critical_error_count    ?? 0),
      user_blocking_count:     Number(kpisRow?.user_blocking_count     ?? 0),
      total_sessions:          Number(kpisRow?.total_sessions          ?? 0),
      sessions_with_critical:  Number(kpisRow?.sessions_with_critical  ?? 0),
      mttr:                    Number(kpisRow?.mttr                    ?? 0),
    };

    const component_risks: ComponentRiskRow[] = (risksResult.data ?? []).map((r: any) => ({
      component:           r.component,
      error_count:         Number(r.error_count),
      critical_count:      Number(r.critical_count),
      user_blocking_count: Number(r.user_blocking_count),
      modules:             r.modules ?? [],
    }));

    const severity_trend: SeverityTrendRow[] = (trendResult.data ?? []).map((r: any) => ({
      date:     r.date,
      critical: Number(r.critical),
      high:     Number(r.high),
      medium:   Number(r.medium),
      low:      Number(r.low),
    }));

    const incident_log: IncidentEntryRow[] = (incidentsResult.data ?? []).map((r: any) => ({
      event_id:        r.event_id,
      timestamp:       r.timestamp,
      severity:        r.severity,
      message:         r.message,
      component:       r.component ?? null,
      module:          r.module,
      is_user_blocking:r.is_user_blocking,
      session_id:      r.session_id,
    }));

    const response: ReliabilityResponse = { kpis, component_risks, severity_trend, incident_log };

    return json(response);
  } catch (e) {
    return apiError(String(e));
  }
});
