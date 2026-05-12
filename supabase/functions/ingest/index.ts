import { preflight, json, apiError } from '../_shared/cors.ts';
import { createSupabaseAdmin } from '../_shared/client.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return apiError('Method not allowed', 405);

  try {
    const body = await req.json();
    const events: unknown[] = Array.isArray(body.events) ? body.events : [body];
    const batchId: string = body.batchId ?? `batch-${Date.now()}`;
    const supabase = createSupabaseAdmin();

    const usage = events.filter((e: any) => e.eventDomain === 'usage');
    const errors = events.filter((e: any) => e.eventDomain === 'error');
    const perf = events.filter((e: any) => e.eventDomain === 'performance');

    let failed = 0;

    console.log(`[ingest] batch=${batchId} usage=${usage.length} errors=${errors.length} perf=${perf.length}`);

    if (usage.length > 0) {
      const rows = (usage as any[]).map(e => ({
        event_id: e.eventId, event_name: e.eventName, timestamp: e.timestamp,
        session_id: e.sessionId, module: e.module, source: e.source,
        correlation_id: e.correlationId ?? null, workflow_id: e.workflowId ?? null,
        parent_event_id: e.parentEventId ?? null, district_id: e.districtId ?? null,
        site_id: e.siteId ?? null, user_id: e.userId ?? null,
        route: e.route ?? null, page: e.page ?? null,
        component: e.component ?? null, action: e.action ?? null,
        usage_category: e.usageCategory, properties: e.properties ?? null,
      }));
      const { error } = await supabase.from('telemetry_usage_events').upsert(rows, { onConflict: 'event_id' });
      if (error) { console.error('[ingest] usage insert failed:', error.message); failed += usage.length; }
    }

    if (errors.length > 0) {
      const rows = (errors as any[]).map(e => ({
        event_id: e.eventId, event_name: e.eventName, timestamp: e.timestamp,
        session_id: e.sessionId, module: e.module, source: e.source,
        correlation_id: e.correlationId ?? null, workflow_id: e.workflowId ?? null,
        parent_event_id: e.parentEventId ?? null, district_id: e.districtId ?? null,
        site_id: e.siteId ?? null, user_id: e.userId ?? null,
        route: e.route ?? null, page: e.page ?? null,
        component: e.component ?? null, action: e.action ?? null,
        error_category: e.errorCategory, severity: e.severity, message: e.message,
        status_code: e.statusCode ?? null, is_user_blocking: e.isUserBlocking ?? false,
        sanitized_stack_trace: e.sanitizedStackTrace ?? null, properties: e.properties ?? null,
      }));
      const { error } = await supabase.from('telemetry_error_events').upsert(rows, { onConflict: 'event_id' });
      if (error) { console.error('[ingest] error insert failed:', error.message); failed += errors.length; }
    }

    if (perf.length > 0) {
      const rows = (perf as any[]).map(e => ({
        event_id: e.eventId, event_name: e.eventName, timestamp: e.timestamp,
        session_id: e.sessionId, module: e.module, source: e.source,
        correlation_id: e.correlationId ?? null, workflow_id: e.workflowId ?? null,
        parent_event_id: e.parentEventId ?? null, district_id: e.districtId ?? null,
        site_id: e.siteId ?? null, user_id: e.userId ?? null,
        route: e.route ?? null, page: e.page ?? null,
        component: e.component ?? null, action: e.action ?? null,
        performance_category: e.performanceCategory, duration_ms: e.durationMs,
        threshold_ms: e.thresholdMs ?? null, is_slow: e.isSlow ?? false,
        success: e.success ?? true, properties: e.properties ?? null,
      }));
      const { error } = await supabase.from('telemetry_performance_events').upsert(rows, { onConflict: 'event_id' });
      if (error) { console.error('[ingest] perf insert failed:', error.message); failed += perf.length; }
    }

    return json({ received: events.length - failed, failed, batch_id: batchId });
  } catch (e) {
    return apiError(String(e));
  }
});
