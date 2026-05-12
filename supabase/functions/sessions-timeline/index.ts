import { preflight, json, apiError } from '../_shared/cors.ts';
import { createSupabaseAdmin } from '../_shared/client.ts';
import type { SessionTimelineResponse } from '../_shared/types.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return apiError('Method not allowed', 405);

  try {
    const sessionId = new URL(req.url).searchParams.get('sessionId');
    if (!sessionId) return apiError('sessionId is required', 400);

    const supabase = createSupabaseAdmin();

    const [usageResult, errorResult, perfResult, sessionResult] = await Promise.all([
      supabase.from('telemetry_usage_events')
        .select('*').eq('session_id', sessionId).order('timestamp'),
      supabase.from('telemetry_error_events')
        .select('*').eq('session_id', sessionId).order('timestamp'),
      supabase.from('telemetry_performance_events')
        .select('*').eq('session_id', sessionId).order('timestamp'),
      supabase.from('session_summaries')
        .select('*').eq('session_id', sessionId).maybeSingle(),
    ]);

    if (usageResult.error)   return apiError(usageResult.error.message);
    if (errorResult.error)   return apiError(errorResult.error.message);
    if (perfResult.error)    return apiError(perfResult.error.message);
    if (sessionResult.error) return apiError(sessionResult.error.message);

    const events = [
      ...(usageResult.data  ?? []).map((e: any) => ({ ...e, event_domain: 'usage'        as const })),
      ...(errorResult.data  ?? []).map((e: any) => ({ ...e, event_domain: 'error'        as const })),
      ...(perfResult.data   ?? []).map((e: any) => ({ ...e, event_domain: 'performance'  as const })),
    ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const response: SessionTimelineResponse = {
      events,
      session: sessionResult.data ?? null,
    };

    return json(response);
  } catch (e) {
    return apiError(String(e));
  }
});
