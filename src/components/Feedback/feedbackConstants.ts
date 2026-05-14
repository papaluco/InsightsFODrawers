import type { FeedbackType } from '../../types/feedbackTypes';

export interface FeedbackReasonCode {
  code: string;
  label: string;
}

export const FEEDBACK_REASONS: Record<FeedbackType, FeedbackReasonCode[]> = {
  Schoolie: [
    { code: 'incorrect_data',         label: 'Incorrect data' },
    { code: 'too_vague',              label: 'Too vague' },
    { code: 'not_useful',             label: 'Not useful' },
    { code: 'missing_recommendation', label: 'Missing recommendation' },
    { code: 'hard_to_understand',     label: 'Hard to understand' },
    { code: 'other',                  label: 'Other' },
  ],
  Insights: [
    { code: 'incorrect_data',  label: 'Incorrect data' },
    { code: 'misleading',      label: 'Misleading' },
    { code: 'too_vague',       label: 'Too vague' },
    { code: 'not_actionable',  label: 'Not actionable' },
    { code: 'other',           label: 'Other' },
  ],
  Reports: [
    { code: 'incorrect_data',   label: 'Incorrect data' },
    { code: 'missing_data',     label: 'Missing data' },
    { code: 'formatting_issue', label: 'Formatting issue' },
    { code: 'not_useful',       label: 'Not useful' },
    { code: 'other',            label: 'Other' },
  ],
  MenuAnalysis: [
    { code: 'incorrect_data', label: 'Incorrect data' },
    { code: 'missing_data',   label: 'Missing data' },
    { code: 'too_vague',      label: 'Too vague' },
    { code: 'not_useful',     label: 'Not useful' },
    { code: 'other',          label: 'Other' },
  ],
};
