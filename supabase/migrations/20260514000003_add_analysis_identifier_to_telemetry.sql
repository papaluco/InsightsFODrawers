-- Add analysis_identifier to telemetry_usage_events to support
-- joining telemetry events to feedback records and enabling
-- efficient dashboard queries by analysis context

ALTER TABLE telemetry_usage_events
ADD COLUMN analysis_identifier TEXT;

CREATE INDEX idx_telemetry_usage_analysis
ON telemetry_usage_events(analysis_identifier)
WHERE analysis_identifier IS NOT NULL;

CREATE INDEX idx_telemetry_usage_ai_analysis
ON telemetry_usage_events(analysis_identifier, event_name)
WHERE analysis_identifier IS NOT NULL;
