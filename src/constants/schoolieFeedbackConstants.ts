import type { FeedbackType } from '../types/feedbackTypes';

export const SCHOOLIE_FEEDBACK_REASONS = [
  { code: "incorrect_data", label: "Incorrect data" },
  { code: "too_vague", label: "Too vague" },
  { code: "not_useful", label: "Not useful" },
  { code: "missing_recommendation", label: "Missing recommendation" },
  { code: "hard_to_understand", label: "Hard to understand" },
  { code: "other", label: "Other" }
];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  Schoolie:    "Schoolie AI",
  Insights:    "Insights AI",
  Reports:     "Reports AI",
  MenuAnalysis: "Menu Analysis AI",
};
