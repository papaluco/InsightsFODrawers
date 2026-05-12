import type { TelemetryContext } from '../types';
import { generateCorrelationId } from '../core/telemetryUtils';
import { SessionManager } from './SessionManager';

class CorrelationManagerClass {
  /**
   * Create a fresh correlation ID for tracking a related chain of events
   * triggered by a single user action.
   */
  createCorrelationId(): string {
    return generateCorrelationId();
  }

  /**
   * Create a workflow context for a multi-step business workflow.
   * Spread this into every telemetry call that belongs to the workflow.
   *
   * Example:
   *   const ctx = telemetry.createWorkflowContext('kpi_drawer_open');
   *   telemetry.trackUsage('kpi_drawer_opened', { ...ctx });
   *   telemetry.trackPerformance('kpi_drawer_load', { ...ctx, durationMs });
   *   telemetry.trackError('kpi_drawer_failed', { ...ctx, ... });
   */
  createWorkflowContext(workflowId: string): TelemetryContext {
    return {
      sessionId:     SessionManager.getSessionId(),
      correlationId: this.createCorrelationId(),
      workflowId,
    };
  }

  /**
   * Create a child context that references the parent event.
   * Use when one event directly triggers another (e.g. a drawer open that fails).
   */
  createChildContext(parentEventId: string, correlationId?: string): TelemetryContext {
    return {
      sessionId:     SessionManager.getSessionId(),
      correlationId: correlationId ?? this.createCorrelationId(),
      parentEventId,
    };
  }
}

export const CorrelationManager = new CorrelationManagerClass();
