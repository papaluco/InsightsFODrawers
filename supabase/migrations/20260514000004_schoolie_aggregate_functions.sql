-- ============================================================================
-- Schoolie AI aggregate functions — called by Edge Functions via supabase.rpc()
-- All aggregation logic lives here, not in JavaScript.
-- All functions filter telemetry_usage_events WHERE usage_category = 'ai_interactions'.
-- Satisfaction functions join the feedback table via analysis_identifier or session_id.
-- NULL scalar params → no filter applied.
-- ============================================================================

-- ── get_schoolie_kpis ─────────────────────────────────────────────────────────
-- Inputs:  date range, optional district_id, user_id, analysis_identifier, source_entry_point
-- Outputs: active_districts, active_users, total_requests, failed_requests,
--          failure_rate, avg_response_time, positive_feedback_pct, feedback_participation_rate
-- Join:    counts feedback via analysis_identifier for satisfaction overlay

CREATE OR REPLACE FUNCTION get_schoolie_kpis(
  p_start_date           TIMESTAMPTZ DEFAULT NULL,
  p_end_date             TIMESTAMPTZ DEFAULT NULL,
  p_district_id          TEXT        DEFAULT NULL,
  p_user_id              TEXT        DEFAULT NULL,
  p_analysis_identifier  TEXT        DEFAULT NULL,
  p_source_entry_point   TEXT        DEFAULT NULL
) RETURNS JSON LANGUAGE SQL STABLE AS $$
  WITH ai_events AS (
    SELECT *
    FROM telemetry_usage_events
    WHERE usage_category = 'ai_interactions'
      AND (p_start_date          IS NULL OR timestamp        >= p_start_date)
      AND (p_end_date            IS NULL OR timestamp        <= p_end_date)
      AND (p_district_id         IS NULL OR district_id      = p_district_id)
      AND (p_user_id             IS NULL OR user_id          = p_user_id)
      AND (p_analysis_identifier IS NULL OR analysis_identifier = p_analysis_identifier)
      AND (p_source_entry_point  IS NULL OR properties->>'sourceEntryPoint' = p_source_entry_point)
  ),
  feedback_agg AS (
    SELECT
      COUNT(*)                                                   AS total_feedback,
      COUNT(*) FILTER (WHERE feedback_value = 'thumbs_up')       AS positive_feedback
    FROM feedback
    WHERE (p_start_date          IS NULL OR created_at        >= p_start_date)
      AND (p_end_date            IS NULL OR created_at        <= p_end_date)
      AND (p_district_id         IS NULL OR district_id       = p_district_id)
      AND (p_analysis_identifier IS NULL OR analysis_identifier = p_analysis_identifier)
      AND feedback_type = 'Schoolie'
  )
  SELECT json_build_object(
    'active_districts',          COUNT(DISTINCT district_id),
    'active_users',              COUNT(DISTINCT user_id),
    'total_requests',            COUNT(*) FILTER (WHERE event_name = 'ai_request_started'),
    'failed_requests',           COUNT(*) FILTER (WHERE event_name = 'ai_response_error'),
    'failure_rate',              ROUND(
                                   COUNT(*) FILTER (WHERE event_name = 'ai_response_error')::NUMERIC
                                   / NULLIF(COUNT(*) FILTER (WHERE event_name IN ('ai_response_success','ai_response_error')), 0) * 100,
                                 2),
    'avg_response_time',         ROUND(AVG((properties->>'responseTimeMs')::NUMERIC) FILTER (
                                   WHERE properties->>'responseTimeMs' IS NOT NULL
                                 )),
    'positive_feedback_pct',     ROUND(
                                   (SELECT positive_feedback::NUMERIC / NULLIF(total_feedback, 0) * 100 FROM feedback_agg)
                                 ),
    'feedback_participation_rate', ROUND(
                                     (SELECT total_feedback::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE event_name = 'ai_request_started'), 0) * 100 FROM feedback_agg)
                                   )
  )
  FROM ai_events
$$;

-- ── get_schoolie_adoption ─────────────────────────────────────────────────────
-- Inputs:  date range, optional district_id
-- Outputs: active_districts, active_users, new_users, returning_users,
--          district_adoption_rate, user_growth_pct, adoption_by_surface JSONB,
--          top_districts JSONB
-- Strategy: new_users = users with their first ever ai_request_started in range

CREATE OR REPLACE FUNCTION get_schoolie_adoption(
  p_start_date   TIMESTAMPTZ DEFAULT NULL,
  p_end_date     TIMESTAMPTZ DEFAULT NULL,
  p_district_id  TEXT        DEFAULT NULL
) RETURNS JSON LANGUAGE SQL STABLE AS $$
  WITH ai_events AS (
    SELECT *
    FROM telemetry_usage_events
    WHERE usage_category = 'ai_interactions'
      AND event_name = 'ai_request_started'
      AND (p_start_date IS NULL OR timestamp >= p_start_date)
      AND (p_end_date   IS NULL OR timestamp <= p_end_date)
      AND (p_district_id IS NULL OR district_id = p_district_id)
  ),
  all_history AS (
    SELECT user_id, MIN(timestamp) AS first_request
    FROM telemetry_usage_events
    WHERE usage_category = 'ai_interactions' AND event_name = 'ai_request_started'
    GROUP BY user_id
  ),
  user_status AS (
    SELECT
      e.user_id,
      e.district_id,
      CASE WHEN h.first_request >= COALESCE(p_start_date, h.first_request)
           THEN 'new' ELSE 'returning' END AS status
    FROM ai_events e
    JOIN all_history h USING (user_id)
    GROUP BY e.user_id, e.district_id, h.first_request
  ),
  by_surface AS (
    SELECT
      COALESCE(properties->>'sourceEntryPoint', 'Unknown') AS surface,
      COUNT(DISTINCT user_id) AS users,
      COUNT(*) AS requests
    FROM ai_events
    GROUP BY properties->>'sourceEntryPoint'
    ORDER BY requests DESC
  ),
  top_districts AS (
    SELECT district_id, COUNT(DISTINCT user_id) AS users, COUNT(*) AS requests
    FROM ai_events
    GROUP BY district_id
    ORDER BY requests DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'active_districts',      COUNT(DISTINCT district_id),
    'active_users',          COUNT(DISTINCT user_id),
    'new_users',             COUNT(DISTINCT user_id) FILTER (WHERE status = 'new'),
    'returning_users',       COUNT(DISTINCT user_id) FILTER (WHERE status = 'returning'),
    'district_adoption_rate', NULL,
    'user_growth_pct',       NULL,
    'adoption_by_surface',   (SELECT json_agg(row_to_json(by_surface)) FROM by_surface),
    'top_districts',         (SELECT json_agg(row_to_json(top_districts)) FROM top_districts)
  )
  FROM user_status
$$;

-- ── get_schoolie_engagement ───────────────────────────────────────────────────
-- Inputs:  date range, optional district_id, user_id
-- Outputs: total_requests, avg_requests_per_user, total_sessions,
--          avg_sessions_per_user, avg_response_time, avg_requests_per_session,
--          engagement_by_surface JSONB, top_users JSONB

CREATE OR REPLACE FUNCTION get_schoolie_engagement(
  p_start_date   TIMESTAMPTZ DEFAULT NULL,
  p_end_date     TIMESTAMPTZ DEFAULT NULL,
  p_district_id  TEXT        DEFAULT NULL,
  p_user_id      TEXT        DEFAULT NULL
) RETURNS JSON LANGUAGE SQL STABLE AS $$
  WITH ai_events AS (
    SELECT *
    FROM telemetry_usage_events
    WHERE usage_category = 'ai_interactions'
      AND (p_start_date  IS NULL OR timestamp    >= p_start_date)
      AND (p_end_date    IS NULL OR timestamp    <= p_end_date)
      AND (p_district_id IS NULL OR district_id  = p_district_id)
      AND (p_user_id     IS NULL OR user_id      = p_user_id)
  ),
  requests AS (
    SELECT *
    FROM ai_events WHERE event_name = 'ai_request_started'
  ),
  by_surface AS (
    SELECT
      COALESCE(properties->>'sourceEntryPoint', 'Unknown') AS surface,
      COUNT(DISTINCT user_id) AS users,
      COUNT(*) AS requests,
      COUNT(DISTINCT session_id) AS sessions
    FROM requests
    GROUP BY properties->>'sourceEntryPoint'
    ORDER BY requests DESC
  ),
  top_users AS (
    SELECT user_id, district_id, COUNT(*) AS requests, COUNT(DISTINCT session_id) AS sessions
    FROM requests
    GROUP BY user_id, district_id
    ORDER BY requests DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'total_requests',          COUNT(*) FILTER (WHERE event_name = 'ai_request_started'),
    'avg_requests_per_user',   ROUND(
                                 COUNT(*) FILTER (WHERE event_name = 'ai_request_started')::NUMERIC
                                 / NULLIF(COUNT(DISTINCT user_id), 0),
                               1),
    'total_sessions',          COUNT(DISTINCT session_id),
    'avg_sessions_per_user',   ROUND(
                                 COUNT(DISTINCT session_id)::NUMERIC
                                 / NULLIF(COUNT(DISTINCT user_id), 0),
                               1),
    'avg_response_time',       ROUND(AVG((properties->>'responseTimeMs')::NUMERIC) FILTER (
                                 WHERE properties->>'responseTimeMs' IS NOT NULL
                               )),
    'avg_requests_per_session', ROUND(
                                  COUNT(*) FILTER (WHERE event_name = 'ai_request_started')::NUMERIC
                                  / NULLIF(COUNT(DISTINCT session_id), 0),
                                1),
    'engagement_by_surface',   (SELECT json_agg(row_to_json(by_surface)) FROM by_surface),
    'top_users',               (SELECT json_agg(row_to_json(top_users)) FROM top_users)
  )
  FROM ai_events
$$;

-- ── get_schoolie_satisfaction ─────────────────────────────────────────────────
-- Inputs:  date range, optional district_id, feedback_type
-- Outputs: positive_pct, negative_pct, participation_rate, total_feedback,
--          positive_count, negative_count, top_positive_reasons JSONB,
--          top_negative_reasons JSONB, sentiment_by_surface JSONB,
--          feedback_by_district JSONB
-- Join:    feedback table joined to telemetry via analysis_identifier;
--          participation_rate = total_feedback / total_sessions in range

CREATE OR REPLACE FUNCTION get_schoolie_satisfaction(
  p_start_date    TIMESTAMPTZ DEFAULT NULL,
  p_end_date      TIMESTAMPTZ DEFAULT NULL,
  p_district_id   TEXT        DEFAULT NULL,
  p_feedback_type TEXT        DEFAULT 'Schoolie'
) RETURNS JSON LANGUAGE SQL STABLE AS $$
  WITH fb AS (
    SELECT *
    FROM feedback
    WHERE feedback_type = COALESCE(p_feedback_type, 'Schoolie')
      AND (p_start_date  IS NULL OR created_at  >= p_start_date)
      AND (p_end_date    IS NULL OR created_at  <= p_end_date)
      AND (p_district_id IS NULL OR district_id  = p_district_id)
  ),
  sessions_in_range AS (
    SELECT COUNT(DISTINCT session_id) AS total_sessions
    FROM telemetry_usage_events
    WHERE usage_category = 'ai_interactions'
      AND event_name = 'ai_request_started'
      AND (p_start_date  IS NULL OR timestamp   >= p_start_date)
      AND (p_end_date    IS NULL OR timestamp   <= p_end_date)
      AND (p_district_id IS NULL OR district_id  = p_district_id)
  ),
  reason_codes AS (
    SELECT unnest(reason_codes) AS code, feedback_value
    FROM fb
    WHERE reason_codes IS NOT NULL
  ),
  by_surface AS (
    SELECT
      source_entry_point AS surface,
      COUNT(*)                                              AS total,
      COUNT(*) FILTER (WHERE feedback_value = 'thumbs_up') AS positive,
      COUNT(*) FILTER (WHERE feedback_value = 'thumbs_down') AS negative
    FROM fb
    GROUP BY source_entry_point
    ORDER BY total DESC
  ),
  by_district AS (
    SELECT
      district_id,
      COUNT(*)                                              AS total,
      COUNT(*) FILTER (WHERE feedback_value = 'thumbs_up') AS positive,
      COUNT(*) FILTER (WHERE feedback_value = 'thumbs_down') AS negative,
      ROUND(COUNT(*) FILTER (WHERE feedback_value = 'thumbs_up')::NUMERIC / NULLIF(COUNT(*), 0) * 100) AS satisfaction_rate
    FROM fb
    GROUP BY district_id
    ORDER BY total DESC
  )
  SELECT json_build_object(
    'total_feedback',          COUNT(*),
    'positive_count',          COUNT(*) FILTER (WHERE feedback_value = 'thumbs_up'),
    'negative_count',          COUNT(*) FILTER (WHERE feedback_value = 'thumbs_down'),
    'positive_pct',            ROUND(COUNT(*) FILTER (WHERE feedback_value = 'thumbs_up')::NUMERIC / NULLIF(COUNT(*), 0) * 100),
    'negative_pct',            ROUND(COUNT(*) FILTER (WHERE feedback_value = 'thumbs_down')::NUMERIC / NULLIF(COUNT(*), 0) * 100),
    'participation_rate',      ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT total_sessions FROM sessions_in_range), 0) * 100),
    'top_positive_reasons',    (
                                 SELECT json_agg(json_build_object('code', code, 'count', cnt) ORDER BY cnt DESC)
                                 FROM (
                                   SELECT code, COUNT(*) AS cnt
                                   FROM reason_codes WHERE feedback_value = 'thumbs_up'
                                   GROUP BY code ORDER BY cnt DESC LIMIT 5
                                 ) t
                               ),
    'top_negative_reasons',    (
                                 SELECT json_agg(json_build_object('code', code, 'count', cnt) ORDER BY cnt DESC)
                                 FROM (
                                   SELECT code, COUNT(*) AS cnt
                                   FROM reason_codes WHERE feedback_value = 'thumbs_down'
                                   GROUP BY code ORDER BY cnt DESC LIMIT 5
                                 ) t
                               ),
    'sentiment_by_surface',    (SELECT json_agg(row_to_json(by_surface)) FROM by_surface),
    'feedback_by_district',    (SELECT json_agg(row_to_json(by_district)) FROM by_district)
  )
  FROM fb
$$;

-- ── get_schoolie_operational_health ──────────────────────────────────────────
-- Inputs:  date range, optional district_id, analysis_identifier
-- Outputs: total_requests, failed_requests, failure_rate, avg_response_time,
--          timeout_count, slow_request_count, health_by_surface JSONB,
--          prompt_version_stats JSONB, slowest_requests JSONB

CREATE OR REPLACE FUNCTION get_schoolie_operational_health(
  p_start_date           TIMESTAMPTZ DEFAULT NULL,
  p_end_date             TIMESTAMPTZ DEFAULT NULL,
  p_district_id          TEXT        DEFAULT NULL,
  p_analysis_identifier  TEXT        DEFAULT NULL
) RETURNS JSON LANGUAGE SQL STABLE AS $$
  WITH responses AS (
    SELECT *
    FROM telemetry_usage_events
    WHERE usage_category = 'ai_interactions'
      AND event_name IN ('ai_response_success', 'ai_response_error')
      AND (p_start_date          IS NULL OR timestamp           >= p_start_date)
      AND (p_end_date            IS NULL OR timestamp           <= p_end_date)
      AND (p_district_id         IS NULL OR district_id         = p_district_id)
      AND (p_analysis_identifier IS NULL OR analysis_identifier = p_analysis_identifier)
  ),
  by_surface AS (
    SELECT
      COALESCE(properties->>'sourceEntryPoint', 'Unknown') AS surface,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE event_name = 'ai_response_error') AS failed,
      ROUND(
        COUNT(*) FILTER (WHERE event_name = 'ai_response_error')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
      2) AS failure_rate,
      ROUND(AVG((properties->>'responseTimeMs')::NUMERIC) FILTER (WHERE properties->>'responseTimeMs' IS NOT NULL)) AS avg_response_time
    FROM responses
    GROUP BY properties->>'sourceEntryPoint'
    ORDER BY total DESC
  ),
  prompt_versions AS (
    SELECT
      properties->>'promptVersion' AS prompt_version,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE event_name = 'ai_response_error') AS failed
    FROM responses
    WHERE properties->>'promptVersion' IS NOT NULL
    GROUP BY properties->>'promptVersion'
    ORDER BY prompt_version
  ),
  slowest AS (
    SELECT
      session_id,
      user_id,
      district_id,
      analysis_identifier,
      properties->>'sourceEntryPoint' AS surface,
      (properties->>'responseTimeMs')::NUMERIC AS response_time_ms,
      event_name
    FROM responses
    WHERE (properties->>'responseTimeMs')::NUMERIC IS NOT NULL
    ORDER BY (properties->>'responseTimeMs')::NUMERIC DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'total_requests',      COUNT(*),
    'failed_requests',     COUNT(*) FILTER (WHERE event_name = 'ai_response_error'),
    'failure_rate',        ROUND(
                             COUNT(*) FILTER (WHERE event_name = 'ai_response_error')::NUMERIC
                             / NULLIF(COUNT(*), 0) * 100,
                           2),
    'avg_response_time',   ROUND(AVG((properties->>'responseTimeMs')::NUMERIC) FILTER (
                             WHERE properties->>'responseTimeMs' IS NOT NULL
                           )),
    'timeout_count',       COUNT(*) FILTER (
                             WHERE event_name = 'ai_response_error'
                               AND (properties->>'responseTimeMs')::NUMERIC > 10000
                           ),
    'slow_request_count',  COUNT(*) FILTER (
                             WHERE (properties->>'responseTimeMs')::NUMERIC > 4000
                           ),
    'health_by_surface',   (SELECT json_agg(row_to_json(by_surface)) FROM by_surface),
    'prompt_version_stats', (SELECT json_agg(row_to_json(prompt_versions)) FROM prompt_versions),
    'slowest_requests',    (SELECT json_agg(row_to_json(slowest)) FROM slowest)
  )
  FROM responses
$$;
