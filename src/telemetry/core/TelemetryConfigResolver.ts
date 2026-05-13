import type {
  TelemetryConfig,
  UsageCategory,
  PerformanceCategory,
  EventCategoryId,
} from '../types';
import { DEFAULT_TELEMETRY_CONFIG } from '../config/telemetryDefaults';

let globalConfig: TelemetryConfig = {
  ...DEFAULT_TELEMETRY_CONFIG,
  performance: { ...DEFAULT_TELEMETRY_CONFIG.performance, thresholds: { ...DEFAULT_TELEMETRY_CONFIG.performance.thresholds } },
};

// ─── Category maps ────────────────────────────────────────────────────────────

const USAGE_CATEGORY_MAP: Record<UsageCategory, EventCategoryId> = {
  page_view:   'navigation',
  navigation:  'navigation',
  interaction: 'feature_engagement',
  filter:      'filters_search',
  drawer:      'feature_engagement',
  report:      'reports_exports',
  ai:          'ai_interactions',
  settings:    'debug_diagnostics',
};

const PERF_CATEGORY_MAP: Record<PerformanceCategory, EventCategoryId> = {
  page_load:         'navigation',
  api_request:       'core_workflows',
  component_render:  'feature_engagement',
  drawer_load:       'feature_engagement',
  grid_load:         'grid_interactions',
  chart_render:      'feature_engagement',
  filter_apply:      'filters_search',
  report_generation: 'reports_exports',
  ai_response:       'ai_interactions',
  unknown:           'debug_diagnostics',
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

export const TelemetryConfigResolver = {
  getGlobalConfig(): TelemetryConfig {
    return {
      ...globalConfig,
      performance: { ...globalConfig.performance, thresholds: { ...globalConfig.performance.thresholds } },
    };
  },

  updateGlobalConfig(patch: Partial<TelemetryConfig>): void {
    globalConfig = { ...globalConfig, ...patch };
  },

  /** True when the district is on the exclusion list. Applies to usage and performance only. */
  isDistrictExcluded(districtId?: string): boolean {
    if (!districtId) return false;
    return globalConfig.excludedDistrictIds.includes(districtId);
  },

  /** True when the usage event's mapped category is in the enabled list. */
  isUsageCategoryEnabled(category: UsageCategory): boolean {
    return globalConfig.enabledEventCategoryIds.includes(USAGE_CATEGORY_MAP[category]);
  },

  /** True when the performance event's mapped category is in the enabled list. */
  isPerfCategoryEnabled(category: PerformanceCategory): boolean {
    return globalConfig.enabledEventCategoryIds.includes(PERF_CATEGORY_MAP[category]);
  },

  getThresholdMs(eventNameOrCategory: string): number | undefined {
    return globalConfig.performance.thresholds[eventNameOrCategory];
  },
};
