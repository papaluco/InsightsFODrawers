import type {
  PerformanceTelemetryEvent,
  PerformanceCategory,
  PerformanceTimer,
  PerformanceTrackingMode,
  TelemetryConfig,
} from '../types';
import { telemetryQueue } from '../core/TelemetryQueue';
import { TelemetryConfigResolver } from '../core/TelemetryConfigResolver';
import { SessionManager } from '../session/SessionManager';
import { generateEventId } from '../core/telemetryUtils';
import { DEFAULT_TELEMETRY_CONFIG } from '../config/telemetryDefaults';

// ─── Capture gating ───────────────────────────────────────────────────────────

function shouldCapture(
  isSlow: boolean,
  success: boolean,
  cfg: TelemetryConfig,
): boolean {
  const mode: PerformanceTrackingMode = cfg.performance.performanceTrackingMode;

  if (mode === 'off') {
    // Even in off mode, overrides can force capture
    if (isSlow && cfg.performance.alwaysCaptureSlowEvents) return true;
    if (!success && cfg.performance.alwaysCaptureFailedEvents) return true;
    return false;
  }

  if (mode === 'full') return true;

  if (mode === 'slow_only') {
    if (isSlow) return true;
    if (!success && cfg.performance.alwaysCaptureFailedEvents) return true;
    return false;
  }

  // sampled mode
  if (isSlow && cfg.performance.alwaysCaptureSlowEvents) return true;
  if (!success && cfg.performance.alwaysCaptureFailedEvents) return true;
  return Math.random() < cfg.performance.performanceSampleRate;
}

function resolveThreshold(eventName: string, category: PerformanceCategory): number | undefined {
  return (
    TelemetryConfigResolver.getThresholdMs(eventName) ??
    TelemetryConfigResolver.getThresholdMs(category)
  );
}

// ─── Input type ───────────────────────────────────────────────────────────────

type TrackPerformanceInput =
  Omit<PerformanceTelemetryEvent, 'eventId' | 'eventDomain' | 'timestamp' | 'sessionId' | 'isSlow'>
  & Partial<Pick<PerformanceTelemetryEvent, 'sessionId' | 'source' | 'module' | 'isSlow'>>;

type TimerStartInput =
  Omit<TrackPerformanceInput, 'durationMs' | 'success' | 'isSlow'>
  & Partial<Pick<TrackPerformanceInput, 'thresholdMs'>>;

// ─── Timer implementation ─────────────────────────────────────────────────────

class PerformanceTimerImpl implements PerformanceTimer {
  readonly eventName: string;
  readonly startTime: number;

  private readonly props: TimerStartInput;
  private done = false;

  constructor(eventName: string, props: TimerStartInput) {
    this.eventName    = eventName;
    this.startTime    = performance.now();
    this.props        = props;
  }

  success(extraProps?: Partial<PerformanceTelemetryEvent>): void {
    if (this.done) return;
    this.done = true;
    PerformanceTrackingService.track(this.eventName, {
      ...this.props,
      ...extraProps,
      durationMs: Math.round(performance.now() - this.startTime),
      success: true,
    });
  }

  failure(error?: Error, extraProps?: Partial<PerformanceTelemetryEvent>): void {
    if (this.done) return;
    this.done = true;
    PerformanceTrackingService.track(this.eventName, {
      ...this.props,
      ...extraProps,
      durationMs: Math.round(performance.now() - this.startTime),
      success: false,
      properties: {
        ...this.props.properties,
        ...(extraProps?.properties ?? {}),
        ...(error ? { errorMessage: error.message } : {}),
      },
    });
  }

  cancel(): void {
    this.done = true; // discard silently
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Performance tracking domain service.
 *
 * Respects PerformanceTrackingMode (off / sampled / full / slow_only).
 * alwaysCaptureSlowEvents and alwaysCaptureFailedEvents override the mode.
 * isSlow is auto-derived from durationMs vs. the resolved threshold when not
 * explicitly provided.
 *
 * Usage (via telemetry facade — prefer this):
 *   const timer = telemetry.startPerformanceTimer('kpi_drawer_load', {
 *     performanceCategory: 'drawer_load',
 *     component: 'KpiDrawer',
 *   });
 *   try {
 *     await loadData();
 *     timer.success();
 *   } catch (err) {
 *     timer.failure(err);
 *   }
 */
export const PerformanceTrackingService = {
  track(eventName: string, input: TrackPerformanceInput): void {
    try {
      // Gate 1: excluded district
      if (TelemetryConfigResolver.isDistrictExcluded(input.districtId)) return;

      const cfg = TelemetryConfigResolver.getGlobalConfig();

      const thresholdMs = input.thresholdMs
        ?? resolveThreshold(eventName, input.performanceCategory);

      const isSlow = input.isSlow
        ?? (thresholdMs !== undefined ? input.durationMs > thresholdMs : false);

      // Gate 2: tracking mode / slow / failed overrides
      if (!shouldCapture(isSlow, input.success, cfg)) return;

      // Gate 3: event category
      if (!TelemetryConfigResolver.isPerfCategoryEnabled(input.performanceCategory)) return;

      const event: PerformanceTelemetryEvent = {
        // Enriched fields
        eventId:             generateEventId(),
        eventDomain:         'performance',
        eventName,
        timestamp:           new Date().toISOString(),
        sessionId:           input.sessionId  ?? SessionManager.getSessionId(),
        source:              input.source     ?? 'frontend',
        module:              input.module     ?? DEFAULT_TELEMETRY_CONFIG.module,
        // Derived fields
        thresholdMs,
        isSlow,
        // Spread remaining
        ...input,
      };

      telemetryQueue.enqueue(event);
    } catch {
      // Performance tracking must NEVER throw or break the UI
    }
  },

  startTimer(eventName: string, props: TimerStartInput): PerformanceTimer {
    return new PerformanceTimerImpl(eventName, props);
  },
};
