-- ============================================================================
-- run_daily_rollup(target_date) — nightly aggregation procedure
-- Simulates an Azure Function / Databricks job that rolls up raw events into
-- the daily_*_rollup tables for efficient trend queries.
--
-- Defaults to yesterday's data. Idempotent: DELETE + INSERT per date.
-- ============================================================================

CREATE OR REPLACE PROCEDURE run_daily_rollup(target_date DATE DEFAULT CURRENT_DATE - 1)
LANGUAGE plpgsql AS $$
BEGIN

  -- ── Error rollup ─────────────────────────────────────────────────────────
  DELETE FROM daily_error_rollup WHERE rollup_date = target_date;

  INSERT INTO daily_error_rollup
    (rollup_date, module, severity, error_category, total_count, user_blocking_count)
  SELECT
    target_date,
    module,
    severity,
    error_category,
    COUNT(*)                                        AS total_count,
    COUNT(*) FILTER (WHERE is_user_blocking = true) AS user_blocking_count
  FROM telemetry_error_events
  WHERE timestamp::DATE = target_date
  GROUP BY module, severity, error_category;

  -- ── Performance rollup ───────────────────────────────────────────────────
  DELETE FROM daily_performance_rollup WHERE rollup_date = target_date;

  INSERT INTO daily_performance_rollup
    (rollup_date, module, performance_category, event_count, slow_count, failed_count, sum_duration_ms)
  SELECT
    target_date,
    module,
    performance_category,
    COUNT(*)                                  AS event_count,
    COUNT(*) FILTER (WHERE is_slow = true)    AS slow_count,
    COUNT(*) FILTER (WHERE success = false)   AS failed_count,
    SUM(duration_ms)                          AS sum_duration_ms
  FROM telemetry_performance_events
  WHERE timestamp::DATE = target_date
  GROUP BY module, performance_category;

  -- ── Usage rollup ─────────────────────────────────────────────────────────
  DELETE FROM daily_usage_rollup WHERE rollup_date = target_date;

  INSERT INTO daily_usage_rollup
    (rollup_date, module, usage_category, event_count, unique_sessions, unique_users)
  SELECT
    target_date,
    module,
    usage_category,
    COUNT(*)                   AS event_count,
    COUNT(DISTINCT session_id) AS unique_sessions,
    COUNT(DISTINCT user_id)    AS unique_users
  FROM telemetry_usage_events
  WHERE timestamp::DATE = target_date
  GROUP BY module, usage_category;

END;
$$;

-- ============================================================================
-- pg_cron schedule — runs nightly at 02:00 UTC
-- Requires the pg_cron extension to be enabled in Supabase dashboard:
--   Database → Extensions → pg_cron
-- ============================================================================

SELECT cron.schedule(
  'nightly-telemetry-rollup',
  '0 2 * * *',
  'CALL run_daily_rollup()'
);
