import type {
  TelemetryConfig,
  TelemetryDistrictOverride,
  ResolvedTelemetryConfig,
} from '../types';
import { DEFAULT_TELEMETRY_CONFIG } from '../config/telemetryDefaults';

let globalConfig: TelemetryConfig = { ...DEFAULT_TELEMETRY_CONFIG, performance: { ...DEFAULT_TELEMETRY_CONFIG.performance, thresholds: { ...DEFAULT_TELEMETRY_CONFIG.performance.thresholds } } };

const districtOverrides = new Map<string, TelemetryDistrictOverride>();

/**
 * Resolves the effective telemetry configuration for a given district,
 * merging global settings with any active district-level override.
 *
 * Usage exclusions (demo/test districts) do NOT disable error tracking.
 * Critical errors are always captured regardless of all other settings.
 */
export const TelemetryConfigResolver = {
  getGlobalConfig(): TelemetryConfig {
    return { ...globalConfig, performance: { ...globalConfig.performance, thresholds: { ...globalConfig.performance.thresholds } } };
  },

  updateGlobalConfig(patch: Partial<TelemetryConfig>): void {
    globalConfig = { ...globalConfig, ...patch };
  },

  setDistrictOverride(override: TelemetryDistrictOverride): void {
    districtOverrides.set(override.districtId, { ...override });
  },

  removeDistrictOverride(districtId: string): void {
    districtOverrides.delete(districtId);
  },

  getAllDistrictOverrides(): TelemetryDistrictOverride[] {
    return [...districtOverrides.values()];
  },

  /**
   * Resolve the effective config for a district.
   * Resolution priority: district override > global exclusion list > global defaults.
   */
  resolve(districtId?: string): ResolvedTelemetryConfig {
    const base: ResolvedTelemetryConfig = {
      ...globalConfig,
      performance: { ...globalConfig.performance, thresholds: { ...globalConfig.performance.thresholds } },
      districtId,
      overriddenBy: 'global',
    };

    if (!districtId) return base;

    // Global excluded districts: disable usage only
    if (globalConfig.excludedDistrictIds.includes(districtId)) {
      return { ...base, usageTrackingEnabled: false, overriddenBy: 'global' };
    }

    const override = districtOverrides.get(districtId);
    if (!override?.overrideEnabled) return base;

    return {
      ...base,
      usageTrackingEnabled:  override.usageTrackingEnabled,
      errorTrackingEnabled:  override.errorTrackingEnabled,
      performance: {
        ...base.performance,
        performanceTrackingMode: override.performanceTrackingMode,
      },
      overriddenBy: 'district',
    };
  },

  isUsageEnabled(districtId?: string): boolean {
    return this.resolve(districtId).usageTrackingEnabled;
  },

  /**
   * Error tracking respects the errorTrackingEnabled flag, BUT critical errors
   * are always captured when criticalErrorsAlwaysCaptured is true.
   * This method returns true if ANY error should be captured for this district.
   */
  isErrorEnabled(districtId?: string): boolean {
    const cfg = this.resolve(districtId);
    return cfg.errorTrackingEnabled || cfg.criticalErrorsAlwaysCaptured;
  },

  isPerformanceEnabled(districtId?: string): boolean {
    return this.resolve(districtId).performance.performanceTrackingMode !== 'off';
  },

  getThresholdMs(eventNameOrCategory: string, districtId?: string): number | undefined {
    const cfg = this.resolve(districtId);
    return cfg.performance.thresholds[eventNameOrCategory];
  },
};
