// ─── Primary facade (import this in application code) ─────────────────────────
export { telemetry } from './core/TelemetryLogger';

// ─── Types (for callers that need them) ───────────────────────────────────────
export type {
  TelemetryEvent,
  TelemetryEventBase,
  UsageTelemetryEvent,
  ErrorTelemetryEvent,
  PerformanceTelemetryEvent,
  TelemetryContext,
  SessionMetadata,
  PerformanceTimer,
  TelemetryConfig,
  ResolvedTelemetryConfig,
  TelemetryDistrictOverride,
  TelemetryQueryParams,
  TelemetryEventDomain,
  TelemetryEventSource,
  UsageCategory,
  ErrorCategory,
  ErrorSeverity,
  PerformanceCategory,
  PerformanceTrackingMode,
  SessionHealth,
} from './types';

// ─── Config management (used by app bootstrap and settings UI) ─────────────────
export { TelemetryConfigResolver } from './core/TelemetryConfigResolver';

// ─── Transport (used by App Health dashboard services) ────────────────────────
export { TelemetryTransport } from './core/TelemetryTransport';

// ─── Session (used by App Health session explorer) ────────────────────────────
export { SessionManager } from './session/SessionManager';
