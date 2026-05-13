// =============================================================================
// Product Observability Framework — Shared Telemetry Event Model
// =============================================================================
// This file is the canonical API contract for the telemetry framework.
// All telemetry domains (usage, error, performance) extend TelemetryEventBase.
// Future domains (ai, diagnostic, reliability) should follow the same pattern.
// =============================================================================

// ─── Primitive Types ──────────────────────────────────────────────────────────

/**
 * The 8 event category buckets shown in Telemetry Settings.
 * Usage and performance events are gated against this list.
 * Error events are always captured regardless.
 */
export type EventCategoryId =
  | 'navigation'
  | 'core_workflows'
  | 'feature_engagement'
  | 'filters_search'
  | 'grid_interactions'
  | 'reports_exports'
  | 'ai_interactions'
  | 'debug_diagnostics';

/** Which observability domain an event belongs to. */
export type TelemetryEventDomain =
  | 'usage'
  | 'error'
  | 'performance';
// Future: | 'ai' | 'diagnostic' | 'reliability'

/** Where the event was emitted from. */
export type TelemetryEventSource =
  | 'frontend'
  | 'backend'
  | 'api'
  | 'ai'
  | 'reporting';

// ─── Usage ────────────────────────────────────────────────────────────────────

/** Behavioral classification of a usage event. */
export type UsageCategory =
  | 'page_view'
  | 'navigation'
  | 'interaction'
  | 'filter'
  | 'drawer'
  | 'report'
  | 'ai'
  | 'settings';

// ─── Error ────────────────────────────────────────────────────────────────────

/** Root cause category of an error event. */
export type ErrorCategory =
  | 'frontend_exception'
  | 'api_error'
  | 'network_error'
  | 'permission_error'
  | 'validation_error'
  | 'data_error'
  | 'integration_error'
  | 'unknown';

/**
 * How severely the error impacted the user.
 * low    = minor, non-blocking
 * medium = feature degraded, user can continue
 * high   = workflow blocked or failed
 * critical = app crash or core workflow unavailable
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// ─── Performance ──────────────────────────────────────────────────────────────

/** What type of operation was being measured. */
export type PerformanceCategory =
  | 'page_load'
  | 'api_request'
  | 'component_render'
  | 'drawer_load'
  | 'grid_load'
  | 'chart_render'
  | 'filter_apply'
  | 'report_generation'
  | 'ai_response'
  | 'unknown';

/**
 * Controls how much performance data is captured.
 * off        = no performance events
 * sampled    = capture a configured percentage
 * full       = capture everything
 * slow_only  = capture only events that exceed their threshold
 */
export type PerformanceTrackingMode =
  | 'off'
  | 'sampled'
  | 'full'
  | 'slow_only';

// ─── Session Health ───────────────────────────────────────────────────────────

/**
 * Computed health classification of a user session.
 * Derived from the combination of usage, error, and performance events.
 */
export type SessionHealth =
  | 'healthy'
  | 'slow'
  | 'degraded'
  | 'failed'
  | 'abandoned_after_error';

// ─── Base Event ───────────────────────────────────────────────────────────────

/**
 * Every telemetry event shares these fields.
 *
 * Naming conventions:
 *   eventName   → snake_case  (e.g. "kpi_drawer_opened")
 *   eventDomain → lowercase   (e.g. "usage")
 *   categories  → snake_case  (e.g. "page_view")
 *   IDs         → camelCase   (e.g. "sessionId")
 *   timestamps  → ISO 8601    (e.g. "2026-05-11T09:01:00.000Z")
 *   durations   → milliseconds (e.g. durationMs: 4200)
 */
export interface TelemetryEventBase {
  // ── Required ──────────────────────────────────────────────────────────────
  /** Unique identifier for this specific event instance. */
  eventId: string;
  /** Which observability domain this event belongs to. */
  eventDomain: TelemetryEventDomain;
  /** snake_case name describing what happened. */
  eventName: string;
  /** ISO 8601 timestamp when the event was captured. */
  timestamp: string;
  /** The user's active session identifier. Shared across all domains. */
  sessionId: string;
  /** App module that emitted this event (e.g. "insights", "reports", "menu_analysis"). */
  module: string;
  /** Where this event was emitted from. */
  source: TelemetryEventSource;

  // ── Correlation — optional, strongly encouraged for workflows ─────────────
  /** Groups related events triggered by one user action (e.g. drawer open → load → error). */
  correlationId?: string;
  /** Groups events belonging to a broader business workflow. */
  workflowId?: string;
  /** The eventId of the direct parent event in a parent→child relationship. */
  parentEventId?: string;

  // ── Identity — enriched automatically where available ────────────────────
  districtId?: string;
  siteId?: string;
  userId?: string;

  // ── Location context ──────────────────────────────────────────────────────
  /** URL route at the time of the event. */
  route?: string;
  /** Page/view name (e.g. "InsightsDashboard", "ReportsPage"). */
  page?: string;
  /** UI component that emitted the event. */
  component?: string;
  /** The user action that triggered the event. */
  action?: string;

  /** Domain-specific or catch-all additional properties. */
  properties?: Record<string, unknown>;
}

// ─── Domain Events ────────────────────────────────────────────────────────────

export interface UsageTelemetryEvent extends TelemetryEventBase {
  eventDomain: 'usage';
  /** Behavioral classification for grouping and funnel analysis. */
  usageCategory: UsageCategory;
}

export interface ErrorTelemetryEvent extends TelemetryEventBase {
  eventDomain: 'error';
  errorCategory: ErrorCategory;
  severity: ErrorSeverity;
  /** Sanitized error message — must not contain tokens, passwords, or raw payloads. */
  message: string;
  /** HTTP status code if this was an API/network error. */
  statusCode?: number;
  /** True if this error prevented the user from completing their workflow. */
  isUserBlocking: boolean;
  /** Sanitized stack summary — max 10 lines, sensitive values redacted. */
  sanitizedStackTrace?: string;
}

export interface PerformanceTelemetryEvent extends TelemetryEventBase {
  eventDomain: 'performance';
  performanceCategory: PerformanceCategory;
  /** Measured elapsed time in milliseconds. */
  durationMs: number;
  /** The configured slow-event threshold for this operation in milliseconds. */
  thresholdMs?: number;
  /** True when durationMs exceeds thresholdMs (or the category default). */
  isSlow: boolean;
  /** Whether the measured operation completed successfully. */
  success: boolean;
}

/** Discriminated union of all concrete telemetry event types. */
export type TelemetryEvent =
  | UsageTelemetryEvent
  | ErrorTelemetryEvent
  | PerformanceTelemetryEvent;

// ─── Context & Session ────────────────────────────────────────────────────────

/**
 * Reusable correlation context, typically created via
 * telemetry.createWorkflowContext() or telemetry.createChildContext().
 *
 * Example:
 *   const ctx = telemetry.createWorkflowContext('kpi_drawer_open');
 *   telemetry.trackUsage('kpi_drawer_opened', { ...ctx, component: 'KpiDrawer' });
 *   telemetry.trackPerformance('kpi_drawer_load', { ...ctx, durationMs, success: true });
 */
export interface TelemetryContext {
  sessionId: string;
  correlationId?: string;
  workflowId?: string;
  parentEventId?: string;
}

export interface SessionMetadata {
  sessionId: string;
  startedAt: string;
  lastActivityAt: string;
  pageCount: number;
}

// ─── Configuration ────────────────────────────────────────────────────────────

export interface PerformanceTelemetryConfig {
  performanceTrackingMode: PerformanceTrackingMode;
  /** Fraction of events to sample when mode is 'sampled'. Range: 0.0–1.0. */
  performanceSampleRate: number;
  /** When true, slow events are always captured regardless of tracking mode. */
  alwaysCaptureSlowEvents: boolean;
  /** When true, failed operations are always captured regardless of tracking mode. */
  alwaysCaptureFailedEvents: boolean;
  /**
   * Maps a performanceCategory or specific eventName to a slow-event threshold in ms.
   * eventName-level thresholds take precedence over category-level defaults.
   */
  thresholds: Record<string, number>;
}

export interface TelemetryConfig {
  usageTrackingEnabled: boolean;
  errorTrackingEnabled: boolean;
  /** When true, critical/high errors are captured even if errorTrackingEnabled is false. */
  criticalErrorsAlwaysCaptured: boolean;
  /** When true, error messages and stack traces are sanitized before storage. */
  errorSanitizationEnabled: boolean;
  /** District IDs excluded from usage and performance tracking (demo/test/internal). Errors always fire. */
  excludedDistrictIds: string[];
  /** Which event category buckets are enabled. Usage and performance events are gated against this list. */
  enabledEventCategoryIds: EventCategoryId[];
  /** Max events per batch flush. */
  batchSize: number;
  /** How often the queue flushes in milliseconds. */
  flushIntervalMs: number;
  /** Max retry attempts for failed batch dispatches. */
  maxRetries: number;
  /** Default module tag applied to events that don't specify one. */
  module: string;
  performance: PerformanceTelemetryConfig;
}

// ─── Timer ────────────────────────────────────────────────────────────────────

/**
 * Returned by telemetry.startPerformanceTimer().
 * Automatically calculates durationMs when .success() or .failure() is called.
 *
 * Example:
 *   const timer = telemetry.startPerformanceTimer('kpi_drawer_load', {
 *     performanceCategory: 'drawer_load',
 *     component: 'KpiDrawer',
 *     thresholdMs: 2500,
 *   });
 *   try {
 *     await loadData();
 *     timer.success();
 *   } catch (err) {
 *     timer.failure(err);
 *   }
 */
export interface PerformanceTimer {
  readonly eventName: string;
  readonly startTime: number;
  success(extraProps?: Partial<PerformanceTelemetryEvent>): void;
  failure(error?: Error, extraProps?: Partial<PerformanceTelemetryEvent>): void;
  /** Discard without recording — use when the operation was cancelled. */
  cancel(): void;
}

// ─── Transport ────────────────────────────────────────────────────────────────

/** Interface for the telemetry transport layer. Swap the implementation for real backends. */
export interface ITelemetryTransport {
  dispatch(events: TelemetryEvent[]): Promise<void>;
}

// =============================================================================
// API CONTRACT — Backend Integration Reference
// =============================================================================
// These types define the shapes for the future REST API.
// The mock TelemetryTransport stores events in-memory using the same shapes.
//
// POST /api/v1/telemetry/events
//   Request body:  TelemetryEventBatch
//   Response body: TelemetryBatchResponse
//
// GET  /api/v1/telemetry/events
//   Query params:  TelemetryQueryParams
//   Response body: TelemetryEvent[]
//
// GET  /api/v1/telemetry/sessions/:sessionId/timeline
//   Response body: TelemetryEvent[]  (all domains, sorted by timestamp asc)
// =============================================================================

export interface TelemetryEventBatch {
  events: TelemetryEvent[];
  batchId: string;
  sentAt: string;
  /** Semver of the client SDK that produced this batch. */
  clientVersion?: string;
}

export interface TelemetryBatchResponse {
  received: number;
  failed: number;
  batchId: string;
}

export interface TelemetryQueryParams {
  domain?: TelemetryEventDomain;
  sessionId?: string;
  correlationId?: string;
  workflowId?: string;
  districtId?: string;
  userId?: string;
  /** YYYY-MM-DD */
  startDate?: string;
  /** YYYY-MM-DD */
  endDate?: string;
  eventName?: string;
  module?: string;
  page?: string;
  component?: string;
  // Error-specific filters
  severity?: ErrorSeverity;
  isUserBlocking?: boolean;
  errorCategory?: ErrorCategory;
  // Performance-specific filters
  isSlow?: boolean;
  performanceCategory?: PerformanceCategory;
  // Pagination
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'durationMs';
  sortDir?: 'asc' | 'desc';
}
