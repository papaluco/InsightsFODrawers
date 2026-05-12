-- ============================================================================
-- Daily rollup tables — simulates Azure Databricks/Azure Function nightly job
-- Stores pre-aggregated metrics by (date, module, category).
-- Weighted averages stored as (sum_duration_ms / event_count) to allow
-- correct merging across time windows without precision loss.
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_error_rollup (
  rollup_date         DATE NOT NULL,
  module              TEXT NOT NULL,
  severity            TEXT NOT NULL,
  error_category      TEXT NOT NULL,
  total_count         INT  NOT NULL DEFAULT 0,
  user_blocking_count INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (rollup_date, module, severity, error_category)
);

CREATE INDEX IF NOT EXISTS idx_error_rollup_date ON daily_error_rollup (rollup_date DESC);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS daily_performance_rollup (
  rollup_date          DATE   NOT NULL,
  module               TEXT   NOT NULL,
  performance_category TEXT   NOT NULL,
  event_count          INT    NOT NULL DEFAULT 0,
  slow_count           INT    NOT NULL DEFAULT 0,
  failed_count         INT    NOT NULL DEFAULT 0,
  sum_duration_ms      BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (rollup_date, module, performance_category)
);

CREATE INDEX IF NOT EXISTS idx_perf_rollup_date ON daily_performance_rollup (rollup_date DESC);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS daily_usage_rollup (
  rollup_date    DATE NOT NULL,
  module         TEXT NOT NULL,
  usage_category TEXT NOT NULL,
  event_count    INT  NOT NULL DEFAULT 0,
  unique_sessions INT NOT NULL DEFAULT 0,
  unique_users    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (rollup_date, module, usage_category)
);

CREATE INDEX IF NOT EXISTS idx_usage_rollup_date ON daily_usage_rollup (rollup_date DESC);
