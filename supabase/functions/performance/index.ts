import { preflight, json, apiError } from '../_shared/cors.ts';
import { createSupabaseAdmin } from '../_shared/client.ts';
import type { PerformanceResponse, PerfKpisRow, CategoryStatRow, FilterOptions } from '../_shared/types.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return apiError('Method not allowed', 405);

  try {
    const p = new URL(req.url).searchParams;
    const supabase = createSupabaseAdmin();

    const categories  = p.getAll('category');
    const modules     = p.getAll('module');
    const components  = p.getAll('component');
    const startDate   = p.get('startDate')   ?? null;
    const endDate     = p.get('endDate')     ?? null;
    const isSlow      = p.get('isSlow');
    const isSuccess   = p.get('isSuccess');
    const eventSearch = p.get('eventSearch') ?? null;

    // ── Events query (filtered) ─────────────────────────────────────────────
    let q = supabase.from('telemetry_performance_events').select('*');
    if (startDate)              q = q.gte('timestamp', startDate + 'T00:00:00Z');
    if (endDate)                q = q.lte('timestamp', endDate   + 'T23:59:59Z');
    if (categories.length > 0)  q = q.in('performance_category', categories);
    if (modules.length    > 0)  q = q.in('module',                modules);
    if (components.length > 0)  q = q.in('component',             components);
    if (isSlow    === 'true')   q = q.eq('is_slow',  true);
    if (isSlow    === 'false')  q = q.eq('is_slow',  false);
    if (isSuccess === 'true')   q = q.eq('success',  true);
    if (isSuccess === 'false')  q = q.eq('success',  false);
    if (eventSearch)            q = q.ilike('event_name', `%${eventSearch}%`);
    q = q.order('timestamp', { ascending: false }).limit(5000);

    // ── SQL aggregates (KPIs + category stats) ──────────────────────────────
    const rpcParams = {
      p_start_date:   startDate,
      p_end_date:     endDate,
      p_categories:   categories.length > 0 ? categories : null,
      p_modules:      modules.length    > 0 ? modules    : null,
      p_components:   components.length > 0 ? components : null,
      p_is_slow:      isSlow    === 'true' ? true : isSlow    === 'false' ? false : null,
      p_is_success:   isSuccess === 'true' ? true : isSuccess === 'false' ? false : null,
      p_event_search: eventSearch,
    };

    const [eventsResult, kpisResult, catResult, optsResult] = await Promise.all([
      q,
      supabase.rpc('get_perf_kpis', rpcParams),
      supabase.rpc('get_perf_category_stats', rpcParams),
      supabase.rpc('get_perf_filter_options'),
    ]);

    if (eventsResult.error) return apiError(eventsResult.error.message);
    if (kpisResult.error)   return apiError(kpisResult.error.message);
    if (catResult.error)    return apiError(catResult.error.message);
    if (optsResult.error)   return apiError(optsResult.error.message);

    const kpisRow = Array.isArray(kpisResult.data) ? kpisResult.data[0] : kpisResult.data;
    const optsRow = Array.isArray(optsResult.data) ? optsResult.data[0] : optsResult.data;

    const kpis: PerfKpisRow = {
      total:        Number(kpisRow?.total        ?? 0),
      slow_count:   Number(kpisRow?.slow_count   ?? 0),
      slow_pct:     Number(kpisRow?.slow_pct     ?? 0),
      failed_count: Number(kpisRow?.failed_count ?? 0),
      p50_ms:       Number(kpisRow?.p50_ms       ?? 0),
      p95_ms:       Number(kpisRow?.p95_ms       ?? 0),
      avg_ms:       Number(kpisRow?.avg_ms       ?? 0),
    };

    const category_stats: CategoryStatRow[] = (catResult.data ?? []).map((r: any) => ({
      category:   r.category,
      count:      Number(r.count),
      slow_count: Number(r.slow_count),
      slow_pct:   Number(r.slow_pct),
      avg_ms:     Number(r.avg_ms),
      p95_ms:     Number(r.p95_ms),
    }));

    const filter_options: FilterOptions = {
      modules:    optsRow?.modules    ?? [],
      components: optsRow?.components ?? [],
      categories: optsRow?.categories ?? [],
    };

    const response: PerformanceResponse = {
      events: eventsResult.data ?? [],
      kpis,
      category_stats,
      filter_options,
    };

    return json(response);
  } catch (e) {
    return apiError(String(e));
  }
});
