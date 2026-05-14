-- Add session_id to feedback table to enable joining feedback
-- sentiment to session-level telemetry data

ALTER TABLE feedback
ADD COLUMN session_id TEXT;

CREATE INDEX idx_feedback_session
ON feedback(session_id)
WHERE session_id IS NOT NULL;
