import type { TelemetryConfig, EventCategoryId } from '../types';

export const DEFAULT_EVENT_CATEGORY_IDS: EventCategoryId[] = [
  'navigation',
  'core_workflows',
  'feature_engagement',
  'filters_search',
  'reports_exports',
  'ai_interactions',
];

/**
 * Slow-event thresholds in milliseconds.
 * Keyed by performanceCategory (fallback) or specific eventName (takes precedence).
 * Override via TelemetryConfigResolver.updateGlobalConfig().
 */
export const DEFAULT_THRESHOLDS: Record<string, number> = {
  // ── By performanceCategory ────────────────────────────────────────────────
  page_load:          3000,
  api_request:        2000,
  component_render:    500,
  drawer_load:        2500,
  grid_load:          2500,
  chart_render:       2000,
  filter_apply:       1500,
  report_generation: 10000,
  ai_response:       15000,
  // ── By specific eventName (higher specificity, evaluated first) ───────────
  dashboard_load:             3000,
  kpi_drawer_load:            2500,
  insights_drawer_load:       2500,
  menu_analysis_load:         3000,
  report_export:             10000,
  ai_recap_generation:       15000,
  schoolie_response:         15000,
  mplh_drawer_load:           2500,
  pna_drawer_load:            2500,
  enp_drawer_load:            2500,
  school_grid_render:         2500,
  performance_trends_render:  2000,
};

export const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  usageTrackingEnabled:         true,
  errorTrackingEnabled:         true,
  criticalErrorsAlwaysCaptured: true,
  errorSanitizationEnabled:     true,
  excludedDistrictIds:          [],
  enabledEventCategoryIds:      [...DEFAULT_EVENT_CATEGORY_IDS],
  batchSize:                    25,
  flushIntervalMs:              8000,
  maxRetries:                   3,
  module:                       'workspace',
  performance: {
    performanceTrackingMode:    'full',
    performanceSampleRate:      0.1,
    alwaysCaptureSlowEvents:    true,
    alwaysCaptureFailedEvents:  true,
    thresholds:                 { ...DEFAULT_THRESHOLDS },
  },
};
