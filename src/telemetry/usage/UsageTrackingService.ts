import type { UsageTelemetryEvent, UsageCategory } from '../types';
import { telemetryQueue } from '../core/TelemetryQueue';
import { TelemetryConfigResolver } from '../core/TelemetryConfigResolver';
import { SessionManager } from '../session/SessionManager';
import { generateEventId } from '../core/telemetryUtils';
import { DEFAULT_TELEMETRY_CONFIG } from '../config/telemetryDefaults';

// ─── Category inference ───────────────────────────────────────────────────────

/**
 * Infer a UsageCategory from an eventName when the caller doesn't specify one.
 * Matching is prefix-based on snake_case conventions.
 */
function inferCategory(eventName: string): UsageCategory {
  if (eventName.includes('page_view') || eventName.includes('page_loaded')) return 'page_view';
  if (eventName.includes('navigat'))   return 'navigation';
  if (eventName.includes('drawer'))    return 'drawer';
  if (eventName.includes('filter') || eventName.includes('search') || eventName.includes('sort')) return 'filter';
  if (eventName.includes('report'))    return 'report';
  if (eventName.includes('ai') || eventName.includes('schoolie') || eventName.includes('chat'))   return 'ai';
  if (eventName.includes('setting') || eventName.includes('config') || eventName.includes('preference')) return 'settings';
  return 'interaction';
}

// ─── Input type ───────────────────────────────────────────────────────────────

type TrackUsageInput =
  Omit<UsageTelemetryEvent, 'eventId' | 'eventDomain' | 'timestamp' | 'sessionId'>
  & Partial<Pick<UsageTelemetryEvent, 'sessionId' | 'source' | 'module' | 'usageCategory'>>;

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Usage tracking domain service.
 *
 * Respects usageTrackingEnabled and excludedDistrictIds from the config.
 * Unlike error tracking, usage events are fully suppressed for excluded districts.
 *
 * Usage (via telemetry facade — prefer this):
 *   telemetry.trackUsage('kpi_drawer_opened', {
 *     usageCategory: 'drawer',
 *     component: 'KpiDrawer',
 *     districtId,
 *     userId,
 *   });
 */
export const UsageTrackingService = {
  track(eventName: string, input: TrackUsageInput): void {
    try {
      if (!TelemetryConfigResolver.isUsageEnabled(input.districtId)) return;

      const event: UsageTelemetryEvent = {
        // Enriched fields
        eventId:       generateEventId(),
        eventDomain:   'usage',
        eventName,
        timestamp:     new Date().toISOString(),
        sessionId:     input.sessionId ?? SessionManager.getSessionId(),
        source:        input.source    ?? 'frontend',
        module:        input.module    ?? DEFAULT_TELEMETRY_CONFIG.module,
        usageCategory: input.usageCategory ?? inferCategory(eventName),
        // Spread remaining input fields
        ...input,
      };

      telemetryQueue.enqueue(event);
    } catch {
      // Usage tracking must NEVER throw or break the UI
    }
  },
};
