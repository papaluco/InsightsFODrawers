ALTER TABLE feedback
ADD COLUMN analysis_identifier TEXT;

CREATE INDEX idx_feedback_analysis
ON feedback(feedback_type, source_entry_point, analysis_identifier);
