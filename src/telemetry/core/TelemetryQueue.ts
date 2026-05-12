import type { TelemetryEvent, ITelemetryTransport } from '../types';

interface QueueOptions {
  batchSize: number;
  flushIntervalMs: number;
  maxRetries: number;
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const MAX_QUEUE_SIZE = 500;

/**
 * Async event queue with batching and bounded retry.
 *
 * - Telemetry calls enqueue() and return immediately — never awaited.
 * - Events flush on interval OR when batchSize is reached.
 * - Critical errors bypass batching and flush immediately.
 * - If the queue reaches MAX_QUEUE_SIZE, the oldest low-priority events are dropped.
 * - All failures are silent — telemetry must never break user workflows.
 */
export class TelemetryQueueClass {
  private queue: TelemetryEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly transport: ITelemetryTransport,
    private readonly options: QueueOptions,
  ) {
    this.startFlushTimer();
  }

  enqueue(event: TelemetryEvent): void {
    try {
      if (this.queue.length >= MAX_QUEUE_SIZE) {
        this.dropLowestPriority();
      }
      this.queue.push(event);

      const isCritical = event.eventDomain === 'error' &&
        'severity' in event &&
        event.severity === 'critical';

      if (isCritical || this.queue.length >= this.options.batchSize) {
        this.flush();
      }
    } catch {
      // swallow — queue failure must never propagate to UI
    }
  }

  flush(): void {
    if (this.queue.length === 0) return;
    try {
      const batch = this.queue.splice(0, this.options.batchSize);
      this.dispatchWithRetry(batch, 0);
    } catch {
      // swallow
    }
  }

  getQueueSize(): number { return this.queue.length; }

  destroy(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  private dropLowestPriority(): void {
    // Find the oldest non-error event and drop it; otherwise drop the oldest event.
    const dropIdx = this.queue.findIndex(e => e.eventDomain !== 'error');
    this.queue.splice(dropIdx >= 0 ? dropIdx : 0, 1);
  }

  private dispatchWithRetry(batch: TelemetryEvent[], attempt: number): void {
    this.transport.dispatch(batch).catch(() => {
      if (attempt < this.options.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30_000);
        setTimeout(() => this.dispatchWithRetry(batch, attempt + 1), delay);
      }
      // fail silently after max retries
    });
  }

  private startFlushTimer(): void {
    if (this.flushTimer !== null) return;
    this.flushTimer = setInterval(() => this.flush(), this.options.flushIntervalMs);
  }
}

// Singleton initialized with the shared transport and default options.
// Import the transport here — no circular dependency (transport has no imports back to queue).
import { TelemetryTransport } from './TelemetryTransport';
import { DEFAULT_TELEMETRY_CONFIG } from '../config/telemetryDefaults';

void SEVERITY_ORDER; // used in future sort-by-severity enhancements

export const telemetryQueue = new TelemetryQueueClass(TelemetryTransport, {
  batchSize:      DEFAULT_TELEMETRY_CONFIG.batchSize,
  flushIntervalMs: DEFAULT_TELEMETRY_CONFIG.flushIntervalMs,
  maxRetries:     DEFAULT_TELEMETRY_CONFIG.maxRetries,
});
