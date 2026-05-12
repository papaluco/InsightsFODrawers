import type {
  TelemetryEvent,
  TelemetryEventDomain,
  ITelemetryTransport,
  TelemetryQueryParams,
  TelemetryEventBatch,
} from '../types';
import { generateBatchId } from './telemetryUtils';

/**
 * Telemetry transport with dual write:
 *   1. POST batch to Supabase ingest Edge Function (production path)
 *   2. Keep local in-memory copy for App Health dashboard fallback
 *
 * If VITE_SUPABASE_URL is not set (e.g. Node.js seed scripts), falls back
 * to in-memory only — no network call is made.
 */
class TelemetryTransportImpl implements ITelemetryTransport {
  private events: TelemetryEvent[] = [];

  async dispatch(batch: TelemetryEvent[]): Promise<void> {
    this.events.push(...batch);

    const url  = import.meta.env?.VITE_SUPABASE_URL  as string | undefined;
    const anon = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!url || !anon) return;

    const payload: TelemetryEventBatch = {
      events: batch,
      batchId: generateBatchId(),
      sentAt: new Date().toISOString(),
    };

    try {
      await fetch(`${url}/functions/v1/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anon}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Network failure — events already stored locally above, no action needed.
    }
  }

  seed(events: TelemetryEvent[]): void {
    this.events.push(...events);
  }

  clear(): void { this.events = []; }

  getAllEvents(): TelemetryEvent[] { return [...this.events]; }

  getByDomain(domain: TelemetryEventDomain): TelemetryEvent[] {
    return this.events.filter(e => e.eventDomain === domain);
  }

  query(params: TelemetryQueryParams): TelemetryEvent[] {
    let results = this.events;

    if (params.domain)        results = results.filter(e => e.eventDomain === params.domain);
    if (params.sessionId)     results = results.filter(e => e.sessionId === params.sessionId);
    if (params.correlationId) results = results.filter(e => e.correlationId === params.correlationId);
    if (params.workflowId)    results = results.filter(e => e.workflowId === params.workflowId);
    if (params.districtId)    results = results.filter(e => e.districtId === params.districtId);
    if (params.userId)        results = results.filter(e => e.userId === params.userId);
    if (params.startDate)     results = results.filter(e => e.timestamp.slice(0, 10) >= params.startDate!);
    if (params.endDate)       results = results.filter(e => e.timestamp.slice(0, 10) <= params.endDate!);
    if (params.eventName)     results = results.filter(e => e.eventName === params.eventName);
    if (params.module)        results = results.filter(e => e.module === params.module);
    if (params.page)          results = results.filter(e => e.page === params.page);
    if (params.component)     results = results.filter(e => e.component === params.component);
    if (params.severity !== undefined) {
      results = results.filter(e => e.eventDomain === 'error' && 'severity' in e && e.severity === params.severity);
    }
    if (params.isUserBlocking !== undefined) {
      results = results.filter(e => e.eventDomain === 'error' && 'isUserBlocking' in e && e.isUserBlocking === params.isUserBlocking);
    }
    if (params.errorCategory !== undefined) {
      results = results.filter(e => e.eventDomain === 'error' && 'errorCategory' in e && e.errorCategory === params.errorCategory);
    }
    if (params.isSlow !== undefined) {
      results = results.filter(e => e.eventDomain === 'performance' && 'isSlow' in e && e.isSlow === params.isSlow);
    }
    if (params.performanceCategory !== undefined) {
      results = results.filter(e => e.eventDomain === 'performance' && 'performanceCategory' in e && e.performanceCategory === params.performanceCategory);
    }

    results = [...results].sort((a, b) => {
      const dir = params.sortDir === 'asc' ? 1 : -1;
      if (params.sortBy === 'timestamp') return dir * a.timestamp.localeCompare(b.timestamp);
      if (params.sortBy === 'durationMs') {
        const ad = 'durationMs' in a ? (a.durationMs as number) : 0;
        const bd = 'durationMs' in b ? (b.durationMs as number) : 0;
        return dir * (ad - bd);
      }
      return b.timestamp.localeCompare(a.timestamp);
    });

    const offset = params.offset ?? 0;
    const limit  = params.limit;
    return results.slice(offset, limit ? offset + limit : undefined);
  }
}

export const TelemetryTransport = new TelemetryTransportImpl();
