-- ============================================================================
-- Backfill session_summaries from existing raw event data.
-- Run this ONCE after applying migration 2 (session_summaries) if events were
-- already inserted before the trigger existed.
--
-- Usage (Supabase SQL Editor):
--   CALL backfill_session_summaries();
-- ============================================================================

CREATE OR REPLACE PROCEDURE backfill_session_summaries()
LANGUAGE plpgsql AS $$
BEGIN
  -- Start fresh
  TRUNCATE session_summaries;

  -- Build base rows from all three domains
  INSERT INTO session_summaries (
    session_id, user_id, district_id,
    first_seen, last_seen
  )
  SELECT
    session_id,
    MIN(user_id)    AS user_id,
    MIN(district_id) AS district_id,
    MIN(timestamp)  AS first_seen,
    MAX(timestamp)  AS last_seen
  FROM (
    SELECT session_id, user_id, district_id, timestamp FROM telemetry_usage_events
    UNION ALL
    SELECT session_id, user_id, district_id, timestamp FROM telemetry_error_events
    UNION ALL
    SELECT session_id, user_id, district_id, timestamp FROM telemetry_performance_events
  ) all_events
  GROUP BY session_id
  ON CONFLICT (session_id) DO NOTHING;

  -- Aggregate usage counters
  UPDATE session_summaries ss SET
    usage_event_count = u.cnt,
    total_events      = total_events + u.cnt,
    modules = (
      SELECT COALESCE(array_agg(DISTINCT m), '{}')
      FROM (SELECT module FROM telemetry_usage_events WHERE session_id = ss.session_id) sub(m)
    )
  FROM (
    SELECT session_id, COUNT(*) AS cnt
    FROM telemetry_usage_events GROUP BY session_id
  ) u
  WHERE ss.session_id = u.session_id;

  -- Aggregate error counters
  UPDATE session_summaries ss SET
    error_count     = e.error_count,
    critical_errors = e.critical_errors,
    high_errors     = e.high_errors,
    total_events    = total_events + e.error_count,
    modules = (
      SELECT array(
        SELECT DISTINCT unnest(ss.modules || COALESCE(array_agg(module), '{}'))
        FROM telemetry_error_events WHERE session_id = ss.session_id
      )
    )
  FROM (
    SELECT
      session_id,
      COUNT(*)                                        AS error_count,
      COUNT(*) FILTER (WHERE severity = 'critical')   AS critical_errors,
      COUNT(*) FILTER (WHERE severity = 'high')       AS high_errors
    FROM telemetry_error_events GROUP BY session_id
  ) e
  WHERE ss.session_id = e.session_id;

  -- Aggregate performance counters
  UPDATE session_summaries ss SET
    perf_event_count = p.perf_count,
    slow_event_count = p.slow_count,
    total_events     = total_events + p.perf_count,
    modules = (
      SELECT array(
        SELECT DISTINCT unnest(ss.modules || COALESCE(array_agg(module), '{}'))
        FROM telemetry_performance_events WHERE session_id = ss.session_id
      )
    )
  FROM (
    SELECT
      session_id,
      COUNT(*)                              AS perf_count,
      COUNT(*) FILTER (WHERE is_slow = true) AS slow_count
    FROM telemetry_performance_events GROUP BY session_id
  ) p
  WHERE ss.session_id = p.session_id;

  -- Compute health and duration for all sessions
  UPDATE session_summaries SET
    duration_ms = CASE
      WHEN first_seen = last_seen THEN 0
      ELSE EXTRACT(EPOCH FROM (last_seen - first_seen)) * 1000
    END::BIGINT,
    health = CASE
      WHEN critical_errors  > 0  THEN 'failed'
      WHEN error_count      > 0  THEN 'degraded'
      WHEN slow_event_count >= 3 THEN 'slow'
      ELSE 'healthy'
    END,
    updated_at = now();

  RAISE NOTICE 'Backfill complete: % sessions rebuilt', (SELECT COUNT(*) FROM session_summaries);
END;
$$;
