-- ============================================================================
-- Raw telemetry tables (append-only, simulate Azure Storage tier)
-- Three domain-specific tables match the TypeScript discriminated union:
--   UsageTelemetryEvent | ErrorTelemetryEvent | PerformanceTelemetryEvent
-- ============================================================================

CREATE TABLE IF NOT EXISTS telemetry_usage_events (
  event_id          TEXT        PRIMARY KEY,
  event_name        TEXT        NOT NULL,
  timestamp         TIMESTAMPTZ NOT NULL,
  session_id        TEXT        NOT NULL,
  module            TEXT        NOT NULL,
  source            TEXT        NOT NULL,
  correlation_id    TEXT,
  workflow_id       TEXT,
  parent_event_id   TEXT,
  district_id       TEXT,
  site_id           TEXT,
  user_id           TEXT,
  route             TEXT,
  page              TEXT,
  component         TEXT,
  action            TEXT,
  usage_category    TEXT        NOT NULL,
  properties        JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_session_id  ON telemetry_usage_events (session_id);
CREATE INDEX IF NOT EXISTS idx_usage_timestamp   ON telemetry_usage_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_district_id ON telemetry_usage_events (district_id);
CREATE INDEX IF NOT EXISTS idx_usage_module      ON telemetry_usage_events (module);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS telemetry_error_events (
  event_id                TEXT        PRIMARY KEY,
  event_name              TEXT        NOT NULL,
  timestamp               TIMESTAMPTZ NOT NULL,
  session_id              TEXT        NOT NULL,
  module                  TEXT        NOT NULL,
  source                  TEXT        NOT NULL,
  correlation_id          TEXT,
  workflow_id             TEXT,
  parent_event_id         TEXT,
  district_id             TEXT,
  site_id                 TEXT,
  user_id                 TEXT,
  route                   TEXT,
  page                    TEXT,
  component               TEXT,
  action                  TEXT,
  error_category          TEXT        NOT NULL,
  severity                TEXT        NOT NULL,
  message                 TEXT        NOT NULL,
  status_code             INT,
  is_user_blocking        BOOLEAN     NOT NULL DEFAULT false,
  sanitized_stack_trace   TEXT,
  properties              JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_session_id  ON telemetry_error_events (session_id);
CREATE INDEX IF NOT EXISTS idx_error_timestamp   ON telemetry_error_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_severity    ON telemetry_error_events (severity);
CREATE INDEX IF NOT EXISTS idx_error_district_id ON telemetry_error_events (district_id);
CREATE INDEX IF NOT EXISTS idx_error_module      ON telemetry_error_events (module);
CREATE INDEX IF NOT EXISTS idx_error_component   ON telemetry_error_events (component);
CREATE INDEX IF NOT EXISTS idx_error_blocking    ON telemetry_error_events (is_user_blocking) WHERE is_user_blocking = true;

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS telemetry_performance_events (
  event_id               TEXT        PRIMARY KEY,
  event_name             TEXT        NOT NULL,
  timestamp              TIMESTAMPTZ NOT NULL,
  session_id             TEXT        NOT NULL,
  module                 TEXT        NOT NULL,
  source                 TEXT        NOT NULL,
  correlation_id         TEXT,
  workflow_id            TEXT,
  parent_event_id        TEXT,
  district_id            TEXT,
  site_id                TEXT,
  user_id                TEXT,
  route                  TEXT,
  page                   TEXT,
  component              TEXT,
  action                 TEXT,
  performance_category   TEXT        NOT NULL,
  duration_ms            INT         NOT NULL,
  threshold_ms           INT,
  is_slow                BOOLEAN     NOT NULL DEFAULT false,
  success                BOOLEAN     NOT NULL DEFAULT true,
  properties             JSONB,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perf_session_id  ON telemetry_performance_events (session_id);
CREATE INDEX IF NOT EXISTS idx_perf_timestamp   ON telemetry_performance_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_district_id ON telemetry_performance_events (district_id);
CREATE INDEX IF NOT EXISTS idx_perf_module      ON telemetry_performance_events (module);
CREATE INDEX IF NOT EXISTS idx_perf_is_slow     ON telemetry_performance_events (is_slow) WHERE is_slow = true;
CREATE INDEX IF NOT EXISTS idx_perf_category    ON telemetry_performance_events (performance_category);
