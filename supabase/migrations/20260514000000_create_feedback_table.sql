CREATE TABLE feedback (
  feedback_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT        NOT NULL,
  district_id     TEXT        NOT NULL,
  platform        TEXT        NOT NULL,
  feedback_type   TEXT        NOT NULL DEFAULT 'Schoolie',
  source_entry_point TEXT,
  kpi_identifier  TEXT,
  drawer_type     TEXT,
  prompt_type     TEXT,
  prompt_version  INTEGER,
  feedback_value  TEXT        NOT NULL,
  reason_codes    TEXT[],
  comment         TEXT,
  cache_status    TEXT,
  context_json    JSONB,
  prompt_text     TEXT,
  response_json   JSONB,
  response_text   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_feedback_type_district ON feedback(feedback_type, district_id);
CREATE INDEX idx_feedback_type_user     ON feedback(feedback_type, user_id);
