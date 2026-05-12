-- ============================================================================
-- Analytics SQL functions — called by Edge Functions via supabase.rpc()
-- All aggregation logic lives here, not in JavaScript.
-- NULL array params → no filter applied. Empty arrays treated the same.
-- ============================================================================

-- ── Errors ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_error_kpis(
  p_start_date      TEXT    DEFAULT NULL,
  p_end_date        TEXT    DEFAULT NULL,
  p_severities      TEXT[]  DEFAULT NULL,
  p_categories      TEXT[]  DEFAULT NULL,
  p_modules         TEXT[]  DEFAULT NULL,
  p_components      TEXT[]  DEFAULT NULL,
  p_is_user_blocking BOOLEAN DEFAULT NULL,
  p_session_search  TEXT    DEFAULT NULL
) RETURNS TABLE (
  total             BIGINT,
  critical          BIGINT,
  high              BIGINT,
  medium            BIGINT,
  low               BIGINT,
  user_blocking     BIGINT,
  affected_sessions BIGINT
) LANGUAGE SQL STABLE AS $$
  SELECT
    COUNT(*)                                             AS total,
    COUNT(*) FILTER (WHERE severity = 'critical')        AS critical,
    COUNT(*) FILTER (WHERE severity = 'high')            AS high,
    COUNT(*) FILTER (WHERE severity = 'medium')          AS medium,
    COUNT(*) FILTER (WHERE severity = 'low')             AS low,
    COUNT(*) FILTER (WHERE is_user_blocking = true)      AS user_blocking,
    COUNT(DISTINCT session_id)                           AS affected_sessions
  FROM telemetry_error_events
  WHERE
    (p_start_date IS NULL OR timestamp >= (p_start_date || 'T00:00:00Z')::TIMESTAMPTZ)
    AND (p_end_date IS NULL OR timestamp <= (p_end_date || 'T23:59:59Z')::TIMESTAMPTZ)
    AND (COALESCE(cardinality(p_severities),  0) = 0 OR severity       = ANY(p_severities))
    AND (COALESCE(cardinality(p_categories),  0) = 0 OR error_category = ANY(p_categories))
    AND (COALESCE(cardinality(p_modules),     0) = 0 OR module         = ANY(p_modules))
    AND (COALESCE(cardinality(p_components),  0) = 0 OR component      = ANY(p_components))
    AND (p_is_user_blocking IS NULL OR is_user_blocking = p_is_user_blocking)
    AND (p_session_search IS NULL OR session_id ILIKE '%' || p_session_search || '%')
$$;

CREATE OR REPLACE FUNCTION get_error_filter_options()
RETURNS TABLE (
  modules    TEXT[],
  components TEXT[],
  categories TEXT[]
) LANGUAGE SQL STABLE AS $$
  SELECT
    COALESCE(array_agg(DISTINCT module ORDER BY module), '{}') AS modules,
    COALESCE(
      array_agg(DISTINCT component ORDER BY component) FILTER (WHERE component IS NOT NULL),
      '{}'
    ) AS components,
    COALESCE(array_agg(DISTINCT error_category ORDER BY error_category), '{}') AS categories
  FROM telemetry_error_events
$$;

-- ── Performance ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_perf_kpis(
  p_start_date   TEXT    DEFAULT NULL,
  p_end_date     TEXT    DEFAULT NULL,
  p_categories   TEXT[]  DEFAULT NULL,
  p_modules      TEXT[]  DEFAULT NULL,
  p_components   TEXT[]  DEFAULT NULL,
  p_is_slow      BOOLEAN DEFAULT NULL,
  p_is_success   BOOLEAN DEFAULT NULL,
  p_event_search TEXT    DEFAULT NULL
) RETURNS TABLE (
  total        BIGINT,
  slow_count   BIGINT,
  slow_pct     NUMERIC,
  failed_count BIGINT,
  p50_ms       NUMERIC,
  p95_ms       NUMERIC,
  avg_ms       NUMERIC
) LANGUAGE SQL STABLE AS $$
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE is_slow = true)  AS slow_count,
    ROUND(
      COUNT(*) FILTER (WHERE is_slow = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100
    ) AS slow_pct,
    COUNT(*) FILTER (WHERE success = false) AS failed_count,
    COALESCE(ROUND(percentile_cont(0.50) WITHIN GROUP (ORDER BY duration_ms)), 0) AS p50_ms,
    COALESCE(ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms)), 0) AS p95_ms,
    COALESCE(ROUND(AVG(duration_ms)), 0) AS avg_ms
  FROM telemetry_performance_events
  WHERE
    (p_start_date IS NULL OR timestamp >= (p_start_date || 'T00:00:00Z')::TIMESTAMPTZ)
    AND (p_end_date IS NULL OR timestamp <= (p_end_date || 'T23:59:59Z')::TIMESTAMPTZ)
    AND (COALESCE(cardinality(p_categories),  0) = 0 OR performance_category = ANY(p_categories))
    AND (COALESCE(cardinality(p_modules),     0) = 0 OR module               = ANY(p_modules))
    AND (COALESCE(cardinality(p_components),  0) = 0 OR component            = ANY(p_components))
    AND (p_is_slow    IS NULL OR is_slow  = p_is_slow)
    AND (p_is_success IS NULL OR success  = p_is_success)
    AND (p_event_search IS NULL OR event_name ILIKE '%' || p_event_search || '%')
$$;

CREATE OR REPLACE FUNCTION get_perf_category_stats(
  p_start_date   TEXT    DEFAULT NULL,
  p_end_date     TEXT    DEFAULT NULL,
  p_categories   TEXT[]  DEFAULT NULL,
  p_modules      TEXT[]  DEFAULT NULL,
  p_components   TEXT[]  DEFAULT NULL,
  p_is_slow      BOOLEAN DEFAULT NULL,
  p_is_success   BOOLEAN DEFAULT NULL,
  p_event_search TEXT    DEFAULT NULL
) RETURNS TABLE (
  category   TEXT,
  count      BIGINT,
  slow_count BIGINT,
  slow_pct   NUMERIC,
  avg_ms     NUMERIC,
  p95_ms     NUMERIC
) LANGUAGE SQL STABLE AS $$
  SELECT
    performance_category AS category,
    COUNT(*) AS count,
    COUNT(*) FILTER (WHERE is_slow = true) AS slow_count,
    ROUND(
      COUNT(*) FILTER (WHERE is_slow = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100
    ) AS slow_pct,
    COALESCE(ROUND(AVG(duration_ms)), 0) AS avg_ms,
    COALESCE(ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms)), 0) AS p95_ms
  FROM telemetry_performance_events
  WHERE
    (p_start_date IS NULL OR timestamp >= (p_start_date || 'T00:00:00Z')::TIMESTAMPTZ)
    AND (p_end_date IS NULL OR timestamp <= (p_end_date || 'T23:59:59Z')::TIMESTAMPTZ)
    AND (COALESCE(cardinality(p_categories),  0) = 0 OR performance_category = ANY(p_categories))
    AND (COALESCE(cardinality(p_modules),     0) = 0 OR module               = ANY(p_modules))
    AND (COALESCE(cardinality(p_components),  0) = 0 OR component            = ANY(p_components))
    AND (p_is_slow    IS NULL OR is_slow  = p_is_slow)
    AND (p_is_success IS NULL OR success  = p_is_success)
    AND (p_event_search IS NULL OR event_name ILIKE '%' || p_event_search || '%')
  GROUP BY performance_category
  ORDER BY avg_ms DESC
$$;

CREATE OR REPLACE FUNCTION get_perf_filter_options()
RETURNS TABLE (
  modules    TEXT[],
  components TEXT[],
  categories TEXT[]
) LANGUAGE SQL STABLE AS $$
  SELECT
    COALESCE(array_agg(DISTINCT module ORDER BY module), '{}') AS modules,
    COALESCE(
      array_agg(DISTINCT component ORDER BY component) FILTER (WHERE component IS NOT NULL),
      '{}'
    ) AS components,
    COALESCE(array_agg(DISTINCT performance_category ORDER BY performance_category), '{}') AS categories
  FROM telemetry_performance_events
$$;

-- ── Sessions ──────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_session_kpis(
  p_start_date     TEXT   DEFAULT NULL,
  p_end_date       TEXT   DEFAULT NULL,
  p_health         TEXT[] DEFAULT NULL,
  p_district_search TEXT  DEFAULT NULL,
  p_session_search  TEXT  DEFAULT NULL
) RETURNS TABLE (
  total          BIGINT,
  healthy        BIGINT,
  slow           BIGINT,
  degraded       BIGINT,
  failed         BIGINT,
  healthy_pct    NUMERIC,
  error_free_rate NUMERIC
) LANGUAGE SQL STABLE AS $$
  WITH filtered AS (
    SELECT health, error_count
    FROM session_summaries
    WHERE
      (p_start_date IS NULL OR last_seen  >= (p_start_date || 'T00:00:00Z')::TIMESTAMPTZ)
      AND (p_end_date IS NULL OR first_seen <= (p_end_date  || 'T23:59:59Z')::TIMESTAMPTZ)
      AND (COALESCE(cardinality(p_health), 0) = 0 OR health = ANY(p_health))
      AND (p_district_search IS NULL OR district_id ILIKE '%' || p_district_search || '%')
      AND (p_session_search  IS NULL OR session_id  ILIKE '%' || p_session_search  || '%')
  )
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE health = 'healthy')  AS healthy,
    COUNT(*) FILTER (WHERE health = 'slow')     AS slow,
    COUNT(*) FILTER (WHERE health = 'degraded') AS degraded,
    COUNT(*) FILTER (WHERE health = 'failed')   AS failed,
    ROUND(COUNT(*) FILTER (WHERE health = 'healthy')::NUMERIC / NULLIF(COUNT(*), 0) * 100) AS healthy_pct,
    ROUND(COUNT(*) FILTER (WHERE error_count = 0)::NUMERIC  / NULLIF(COUNT(*), 0) * 100) AS error_free_rate
  FROM filtered
$$;

-- ── Reliability ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_reliability_kpis()
RETURNS TABLE (
  error_free_session_rate NUMERIC,
  user_blocking_rate      NUMERIC,
  critical_error_count    BIGINT,
  user_blocking_count     BIGINT,
  total_sessions          BIGINT,
  sessions_with_critical  BIGINT,
  mttr                    INT
) LANGUAGE SQL STABLE AS $$
  WITH session_totals AS (
    SELECT
      COUNT(*)                                          AS total,
      COUNT(*) FILTER (WHERE critical_errors > 0)      AS with_critical,
      COUNT(*) FILTER (WHERE error_count = 0)          AS error_free
    FROM session_summaries
  ),
  error_agg AS (
    SELECT
      COUNT(*) FILTER (WHERE severity = 'critical')    AS critical_count,
      COUNT(*) FILTER (WHERE is_user_blocking = true)  AS blocking_count,
      COUNT(DISTINCT session_id) FILTER (WHERE is_user_blocking = true) AS blocking_sessions
    FROM telemetry_error_events
  )
  SELECT
    ROUND(s.error_free::NUMERIC    / NULLIF(s.total, 0) * 100) AS error_free_session_rate,
    ROUND(e.blocking_sessions::NUMERIC / NULLIF(s.total, 0) * 100) AS user_blocking_rate,
    e.critical_count   AS critical_error_count,
    e.blocking_count   AS user_blocking_count,
    s.total            AS total_sessions,
    s.with_critical    AS sessions_with_critical,
    0                  AS mttr
  FROM session_totals s, error_agg e
$$;

CREATE OR REPLACE FUNCTION get_component_risks()
RETURNS TABLE (
  component          TEXT,
  error_count        BIGINT,
  critical_count     BIGINT,
  user_blocking_count BIGINT,
  modules            TEXT[]
) LANGUAGE SQL STABLE AS $$
  SELECT
    COALESCE(component, '(' || module || ')') AS component,
    COUNT(*)                                  AS error_count,
    COUNT(*) FILTER (WHERE severity = 'critical')   AS critical_count,
    COUNT(*) FILTER (WHERE is_user_blocking = true) AS user_blocking_count,
    array_agg(DISTINCT module)                AS modules
  FROM telemetry_error_events
  GROUP BY COALESCE(component, '(' || module || ')')
  ORDER BY (COUNT(*) FILTER (WHERE severity = 'critical') * 10
          + COUNT(*) FILTER (WHERE is_user_blocking = true)) DESC
  LIMIT 10
$$;

CREATE OR REPLACE FUNCTION get_severity_trend()
RETURNS TABLE (
  date     TEXT,
  critical BIGINT,
  high     BIGINT,
  medium   BIGINT,
  low      BIGINT
) LANGUAGE SQL STABLE AS $$
  SELECT
    timestamp::DATE::TEXT                           AS date,
    COUNT(*) FILTER (WHERE severity = 'critical')   AS critical,
    COUNT(*) FILTER (WHERE severity = 'high')       AS high,
    COUNT(*) FILTER (WHERE severity = 'medium')     AS medium,
    COUNT(*) FILTER (WHERE severity = 'low')        AS low
  FROM telemetry_error_events
  GROUP BY timestamp::DATE
  ORDER BY date ASC
$$;
