import { preflight, json, apiError } from '../_shared/cors.ts';
import { createSupabaseAdmin } from '../_shared/client.ts';
import type { SessionsResponse, SessionKpisRow } from '../_shared/types.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return apiError('Method not allowed', 405);

  try {
    const p = new URL(req.url).searchParams;
    const supabase = createSupabaseAdmin();

    const health          = p.getAll('health');
    const startDate       = p.get('startDate')       ?? null;
    const endDate         = p.get('endDate')         ?? null;
    const districtSearch  = p.get('districtSearch')  ?? null;
    const sessionSearch   = p.get('sessionSearch')   ?? null;

    // ── Sessions query (filtered) ───────────────────────────────────────────
    let q = supabase.from('session_summaries').select('*');
    if (startDate)            q = q.gte('last_seen',   startDate + 'T00:00:00Z');
    if (endDate)              q = q.lte('first_seen',  endDate   + 'T23:59:59Z');
    if (health.length > 0)    q = q.in('health',        health);
    if (districtSearch)       q = q.ilike('district_id', `%${districtSearch}%`);
    if (sessionSearch)        q = q.ilike('session_id',  `%${sessionSearch}%`);
    q = q.order('last_seen', { ascending: false }).limit(2000);

    // ── KPIs (SQL aggregate) ────────────────────────────────────────────────
    const kpiParams = {
      p_start_date:      startDate,
      p_end_date:        endDate,
      p_health:          health.length > 0 ? health : null,
      p_district_search: districtSearch,
      p_session_search:  sessionSearch,
    };

    const [sessionsResult, kpisResult] = await Promise.all([
      q,
      supabase.rpc('get_session_kpis', kpiParams),
    ]);

    if (sessionsResult.error) return apiError(sessionsResult.error.message);
    if (kpisResult.error)     return apiError(kpisResult.error.message);

    const kpisRow = Array.isArray(kpisResult.data) ? kpisResult.data[0] : kpisResult.data;

    const kpis: SessionKpisRow = {
      total:           Number(kpisRow?.total           ?? 0),
      healthy:         Number(kpisRow?.healthy         ?? 0),
      slow:            Number(kpisRow?.slow            ?? 0),
      degraded:        Number(kpisRow?.degraded        ?? 0),
      failed:          Number(kpisRow?.failed          ?? 0),
      healthy_pct:     Number(kpisRow?.healthy_pct     ?? 0),
      error_free_rate: Number(kpisRow?.error_free_rate ?? 0),
    };

    const response: SessionsResponse = {
      sessions: sessionsResult.data ?? [],
      kpis,
    };

    return json(response);
  } catch (e) {
    return apiError(String(e));
  }
});
