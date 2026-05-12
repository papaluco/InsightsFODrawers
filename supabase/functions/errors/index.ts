import { preflight, json, apiError } from '../_shared/cors.ts';
import { createSupabaseAdmin } from '../_shared/client.ts';
import type { ErrorsResponse, ErrorKpisRow, FilterOptions } from '../_shared/types.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return apiError('Method not allowed', 405);

  try {
    const p = new URL(req.url).searchParams;
    const supabase = createSupabaseAdmin();

    const severities  = p.getAll('severity');
    const categories  = p.getAll('category');
    const modules     = p.getAll('module');
    const components  = p.getAll('component');
    const startDate   = p.get('startDate')   ?? null;
    const endDate     = p.get('endDate')     ?? null;
    const isBlocking  = p.get('isUserBlocking');
    const sessionSearch = p.get('sessionSearch') ?? null;

    // ── Events query (filtered) ─────────────────────────────────────────────
    let q = supabase.from('telemetry_error_events').select('*');
    if (startDate)               q = q.gte('timestamp', startDate + 'T00:00:00Z');
    if (endDate)                 q = q.lte('timestamp', endDate   + 'T23:59:59Z');
    if (severities.length  > 0)  q = q.in('severity',       severities);
    if (categories.length  > 0)  q = q.in('error_category', categories);
    if (modules.length     > 0)  q = q.in('module',         modules);
    if (components.length  > 0)  q = q.in('component',      components);
    if (isBlocking === 'true')   q = q.eq('is_user_blocking', true);
    if (isBlocking === 'false')  q = q.eq('is_user_blocking', false);
    if (sessionSearch)           q = q.ilike('session_id', `%${sessionSearch}%`);
    q = q.order('timestamp', { ascending: false }).limit(5000);

    // ── KPIs (SQL aggregate) ────────────────────────────────────────────────
    const kpiParams = {
      p_start_date:       startDate,
      p_end_date:         endDate,
      p_severities:       severities.length  > 0 ? severities  : null,
      p_categories:       categories.length  > 0 ? categories  : null,
      p_modules:          modules.length     > 0 ? modules     : null,
      p_components:       components.length  > 0 ? components  : null,
      p_is_user_blocking: isBlocking === 'true' ? true : isBlocking === 'false' ? false : null,
      p_session_search:   sessionSearch,
    };

    const [eventsResult, kpisResult, optionsResult] = await Promise.all([
      q,
      supabase.rpc('get_error_kpis', kpiParams),
      supabase.rpc('get_error_filter_options'),
    ]);

    if (eventsResult.error)  return apiError(eventsResult.error.message);
    if (kpisResult.error)    return apiError(kpisResult.error.message);
    if (optionsResult.error) return apiError(optionsResult.error.message);

    const kpisRow = Array.isArray(kpisResult.data) ? kpisResult.data[0] : kpisResult.data;
    const optsRow = Array.isArray(optionsResult.data) ? optionsResult.data[0] : optionsResult.data;

    const kpis: ErrorKpisRow = {
      total:             Number(kpisRow?.total             ?? 0),
      critical:          Number(kpisRow?.critical          ?? 0),
      high:              Number(kpisRow?.high              ?? 0),
      medium:            Number(kpisRow?.medium            ?? 0),
      low:               Number(kpisRow?.low               ?? 0),
      user_blocking:     Number(kpisRow?.user_blocking     ?? 0),
      affected_sessions: Number(kpisRow?.affected_sessions ?? 0),
    };

    const filter_options: FilterOptions = {
      modules:    optsRow?.modules    ?? [],
      components: optsRow?.components ?? [],
      categories: optsRow?.categories ?? [],
    };

    const response: ErrorsResponse = {
      events: eventsResult.data ?? [],
      kpis,
      filter_options,
    };

    return json(response);
  } catch (e) {
    return apiError(String(e));
  }
});
