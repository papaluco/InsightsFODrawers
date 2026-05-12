// Dev-only endpoint to manually trigger the daily rollup procedure.
// Useful for testing the rollup logic before pg_cron fires.
import { preflight, json, apiError } from '../_shared/cors.ts';
import { createSupabaseAdmin } from '../_shared/client.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return apiError('Method not allowed', 405);

  try {
    const body = await req.json().catch(() => ({}));
    const targetDate: string = body.date ?? new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.rpc('run_daily_rollup', { target_date: targetDate });
    if (error) return apiError(error.message);

    return json({ ok: true, rolled_up_date: targetDate });
  } catch (e) {
    return apiError(String(e));
  }
});
