import type {
  TelemetryContext,
  PerformanceTimer,
  PerformanceTelemetryEvent,
  UsageTelemetryEvent,
  ErrorTelemetryEvent,
} from '../types';
import { UsageTrackingService } from '../usage/UsageTrackingService';
import { ErrorTrackingService } from '../errors/ErrorTrackingService';
import { PerformanceTrackingService } from '../performance/PerformanceTrackingService';
import { CorrelationManager } from '../session/CorrelationManager';
import { SessionManager } from '../session/SessionManager';

// ─── Input types (omit auto-enriched fields) ──────────────────────────────────

type UsageInput =
  Omit<UsageTelemetryEvent, 'eventId' | 'eventDomain' | 'timestamp' | 'sessionId'>
  & Partial<Pick<UsageTelemetryEvent, 'sessionId' | 'source' | 'module' | 'usageCategory'>>;

type ErrorInput =
  Omit<ErrorTelemetryEvent, 'eventId' | 'eventDomain' | 'timestamp' | 'sessionId'>
  & Partial<Pick<ErrorTelemetryEvent, 'sessionId' | 'source' | 'module'>>;

type PerformanceInput =
  Omit<PerformanceTelemetryEvent, 'eventId' | 'eventDomain' | 'timestamp' | 'sessionId' | 'isSlow'>
  & Partial<Pick<PerformanceTelemetryEvent, 'sessionId' | 'source' | 'module' | 'isSlow'>>;

type TimerStartInput =
  Omit<PerformanceInput, 'durationMs' | 'success' | 'isSlow'>
  & Partial<Pick<PerformanceInput, 'thresholdMs'>>;

// ─── Facade ───────────────────────────────────────────────────────────────────

/**
 * Primary telemetry facade — import this in application code.
 *
 * All methods are fire-and-forget. They never throw.
 *
 * Quick reference:
 *   telemetry.trackUsage('event_name', { usageCategory, component, districtId })
 *   telemetry.trackError('event_name', { errorCategory, severity, message, isUserBlocking })
 *   telemetry.trackPerformance('event_name', { performanceCategory, durationMs, success })
 *
 *   const timer = telemetry.startPerformanceTimer('event_name', { performanceCategory });
 *   try { await work(); timer.success(); } catch (e) { timer.failure(e); }
 *
 *   const ctx = telemetry.createWorkflowContext('workflow_id');
 *   telemetry.trackUsage('step_1', { ...ctx });
 *   telemetry.trackPerformance('step_2', { ...ctx, durationMs, success });
 */
export const telemetry = {
  // ── Domain methods ──────────────────────────────────────────────────────────

  trackUsage(eventName: string, input: UsageInput): void {
    UsageTrackingService.track(eventName, input);
  },

  trackError(eventName: string, input: ErrorInput): void {
    ErrorTrackingService.track(eventName, input);
  },

  trackPerformance(eventName: string, input: PerformanceInput): void {
    PerformanceTrackingService.track(eventName, input);
  },

  // ── Timer ───────────────────────────────────────────────────────────────────

  startPerformanceTimer(eventName: string, props: TimerStartInput): PerformanceTimer {
    return PerformanceTrackingService.startTimer(eventName, props);
  },

  // ── Correlation helpers ─────────────────────────────────────────────────────

  createWorkflowContext(workflowId: string): TelemetryContext {
    return CorrelationManager.createWorkflowContext(workflowId);
  },

  createChildContext(parentEventId: string, correlationId?: string): TelemetryContext {
    return CorrelationManager.createChildContext(parentEventId, correlationId);
  },

  createCorrelationId(): string {
    return CorrelationManager.createCorrelationId();
  },

  // ── Session ─────────────────────────────────────────────────────────────────

  getSessionId(): string {
    return SessionManager.getSessionId();
  },

  getSessionMetadata() {
    return SessionManager.getSessionMetadata();
  },
};
