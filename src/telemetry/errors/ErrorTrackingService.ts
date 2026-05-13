import type { ErrorTelemetryEvent } from '../types';
import { telemetryQueue } from '../core/TelemetryQueue';
import { TelemetryConfigResolver } from '../core/TelemetryConfigResolver';
import { SessionManager } from '../session/SessionManager';
import { generateEventId } from '../core/telemetryUtils';
import { DEFAULT_TELEMETRY_CONFIG } from '../config/telemetryDefaults';

// ─── Sanitization ─────────────────────────────────────────────────────────────

const SENSITIVE_PATTERNS: RegExp[] = [
  /authorization:\s*\S+/gi,
  /bearer\s+\S+/gi,
  /password[=:\s]+\S+/gi,
  /token[=:\s]+\S+/gi,
  /api[-_]?key[=:\s]+\S+/gi,
  /secret[=:\s]+\S+/gi,
  /x-api-key[=:\s]+\S+/gi,
  /\b[A-Za-z0-9+/]{40,}={0,2}\b/g, // long base64 strings (likely tokens)
];

function sanitizeString(value: string): string {
  let safe = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    safe = safe.replace(pattern, '[REDACTED]');
  }
  return safe.length > 500 ? safe.slice(0, 500) + '…' : safe;
}

function sanitizeStackTrace(stack: string): string {
  const safe = sanitizeString(stack);
  return safe.split('\n').slice(0, 10).join('\n');
}

// ─── Input type ───────────────────────────────────────────────────────────────

type TrackErrorInput =
  Omit<ErrorTelemetryEvent, 'eventId' | 'eventDomain' | 'timestamp' | 'sessionId'>
  & Partial<Pick<ErrorTelemetryEvent, 'sessionId' | 'source' | 'module'>>;

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Error tracking domain service.
 *
 * Always-on by default. Usage exclusions for demo/test districts do NOT
 * suppress error tracking. Critical and high errors are captured even when
 * errorTrackingEnabled is false.
 *
 * Usage (via telemetry facade — prefer this):
 *   telemetry.trackError('kpi_drawer_load_failed', {
 *     errorCategory: 'api_error',
 *     severity: 'high',
 *     message: 'Failed to load KPI data',
 *     component: 'KpiDrawer',
 *     isUserBlocking: true,
 *     statusCode: 500,
 *     correlationId,
 *   });
 */
export const ErrorTrackingService = {
  track(eventName: string, input: TrackErrorInput): void {
    try {
      const sanitize = TelemetryConfigResolver.getGlobalConfig().errorSanitizationEnabled;
      const cfg      = DEFAULT_TELEMETRY_CONFIG;

      const event: ErrorTelemetryEvent = {
        // Enriched fields
        eventId:    generateEventId(),
        eventDomain: 'error',
        eventName,
        timestamp:  new Date().toISOString(),
        sessionId:  input.sessionId ?? SessionManager.getSessionId(),
        source:     input.source    ?? 'frontend',
        module:     input.module    ?? cfg.module,
        // Sanitized message & stack
        message:    sanitize ? sanitizeString(input.message) : input.message,
        sanitizedStackTrace: input.sanitizedStackTrace
          ? (sanitize ? sanitizeStackTrace(input.sanitizedStackTrace) : input.sanitizedStackTrace)
          : undefined,
        // Spread remaining input fields
        ...input,
      };

      telemetryQueue.enqueue(event);
    } catch {
      // Error tracking must NEVER throw or break the UI
    }
  },
};
