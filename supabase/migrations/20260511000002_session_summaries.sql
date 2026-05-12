-- ============================================================================
-- session_summaries: trigger-maintained read model
-- Upserted by fn_upsert_session_summary() on every raw event insert.
-- Simulates the "computed session" table in the Azure read-model tier.
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_summaries (
  session_id        TEXT        PRIMARY KEY,
  user_id           TEXT,
  district_id       TEXT,
  health            TEXT        NOT NULL DEFAULT 'healthy',
  error_count       INT         NOT NULL DEFAULT 0,
  critical_errors   INT         NOT NULL DEFAULT 0,
  high_errors       INT         NOT NULL DEFAULT 0,
  slow_event_count  INT         NOT NULL DEFAULT 0,
  total_events      INT         NOT NULL DEFAULT 0,
  usage_event_count INT         NOT NULL DEFAULT 0,
  perf_event_count  INT         NOT NULL DEFAULT 0,
  modules           TEXT[]      NOT NULL DEFAULT '{}',
  first_seen        TIMESTAMPTZ,
  last_seen         TIMESTAMPTZ,
  duration_ms       BIGINT      NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_district_id ON session_summaries (district_id);
CREATE INDEX IF NOT EXISTS idx_sessions_health      ON session_summaries (health);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen   ON session_summaries (last_seen DESC);

-- ============================================================================
-- Trigger function — handles all 3 domains via TG_TABLE_NAME
-- Health classification: failed > degraded > slow > healthy
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_upsert_session_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure session row exists
  INSERT INTO session_summaries (session_id, user_id, district_id, first_seen, last_seen)
  VALUES (NEW.session_id, NEW.user_id, NEW.district_id, NEW.timestamp, NEW.timestamp)
  ON CONFLICT (session_id) DO UPDATE SET
    user_id     = COALESCE(session_summaries.user_id,     EXCLUDED.user_id),
    district_id = COALESCE(session_summaries.district_id, EXCLUDED.district_id),
    first_seen  = LEAST(session_summaries.first_seen,    NEW.timestamp),
    last_seen   = GREATEST(session_summaries.last_seen,  NEW.timestamp);

  -- Increment domain-specific counters
  IF TG_TABLE_NAME = 'telemetry_usage_events' THEN
    UPDATE session_summaries SET
      total_events      = total_events + 1,
      usage_event_count = usage_event_count + 1,
      modules = CASE
        WHEN NEW.module = ANY(modules) THEN modules
        ELSE array_append(modules, NEW.module)
      END
    WHERE session_id = NEW.session_id;

  ELSIF TG_TABLE_NAME = 'telemetry_performance_events' THEN
    UPDATE session_summaries SET
      total_events     = total_events + 1,
      perf_event_count = perf_event_count + 1,
      slow_event_count = slow_event_count + (CASE WHEN NEW.is_slow THEN 1 ELSE 0 END),
      modules = CASE
        WHEN NEW.module = ANY(modules) THEN modules
        ELSE array_append(modules, NEW.module)
      END
    WHERE session_id = NEW.session_id;

  ELSIF TG_TABLE_NAME = 'telemetry_error_events' THEN
    UPDATE session_summaries SET
      total_events    = total_events + 1,
      error_count     = error_count + 1,
      critical_errors = critical_errors + (CASE WHEN NEW.severity = 'critical' THEN 1 ELSE 0 END),
      high_errors     = high_errors     + (CASE WHEN NEW.severity = 'high'     THEN 1 ELSE 0 END),
      modules = CASE
        WHEN NEW.module = ANY(modules) THEN modules
        ELSE array_append(modules, NEW.module)
      END
    WHERE session_id = NEW.session_id;
  END IF;

  -- Recompute health and duration in a single pass
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
    updated_at = now()
  WHERE session_id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to all three raw tables (idempotent — drop first)

DROP TRIGGER IF EXISTS trg_usage_session ON telemetry_usage_events;
DROP TRIGGER IF EXISTS trg_error_session ON telemetry_error_events;
DROP TRIGGER IF EXISTS trg_perf_session  ON telemetry_performance_events;

CREATE TRIGGER trg_usage_session
  AFTER INSERT ON telemetry_usage_events
  FOR EACH ROW EXECUTE FUNCTION fn_upsert_session_summary();

CREATE TRIGGER trg_error_session
  AFTER INSERT ON telemetry_error_events
  FOR EACH ROW EXECUTE FUNCTION fn_upsert_session_summary();

CREATE TRIGGER trg_perf_session
  AFTER INSERT ON telemetry_performance_events
  FOR EACH ROW EXECUTE FUNCTION fn_upsert_session_summary();
