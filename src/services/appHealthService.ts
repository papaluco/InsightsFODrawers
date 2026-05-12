import type { ErrorTelemetryEvent, PerformanceTelemetryEvent } from '../telemetry/types';
import { TelemetryTransport } from '../telemetry/core/TelemetryTransport';
import { seedTelemetry } from '../data/mockTelemetryData';

let _seeded = false;
function ensureSeeded(): void {
  if (!_seeded) {
    seedTelemetry();
    _seeded = true;
  }
}

// ─── Error queries ────────────────────────────────────────────────────────────

export interface ErrorSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  userBlocking: number;
  byCategory: Record<string, number>;
}

export function getErrorSummary(): ErrorSummary {
  ensureSeeded();
  const events = TelemetryTransport.getByDomain('error') as ErrorTelemetryEvent[];
  const summary: ErrorSummary = {
    total: events.length,
    critical: 0, high: 0, medium: 0, low: 0,
    userBlocking: 0,
    byCategory: {},
  };
  for (const e of events) {
    summary[e.severity]++;
    if (e.isUserBlocking) summary.userBlocking++;
    summary.byCategory[e.errorCategory] = (summary.byCategory[e.errorCategory] ?? 0) + 1;
  }
  return summary;
}

export function getRecentErrors(limit = 10): ErrorTelemetryEvent[] {
  ensureSeeded();
  return TelemetryTransport.query({
    domain: 'error', limit, sortBy: 'timestamp', sortDir: 'desc',
  }) as ErrorTelemetryEvent[];
}

// ─── Performance queries ──────────────────────────────────────────────────────

export interface PerfCategoryStats {
  count: number;
  slowCount: number;
  slowPct: number;
  avgMs: number;
}

export interface PerformanceSummary {
  total: number;
  slowCount: number;
  failedCount: number;
  slowPct: number;
  p50Ms: number;
  p95Ms: number;
  byCategory: Record<string, PerfCategoryStats>;
}

export function getPerformanceSummary(): PerformanceSummary {
  ensureSeeded();
  const events = TelemetryTransport.getByDomain('performance') as PerformanceTelemetryEvent[];
  const durations = events.map(e => e.durationMs).sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length * 0.5)] ?? 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0;

  const byCategory: Record<string, PerfCategoryStats> = {};
  let slowCount = 0;
  let failedCount = 0;

  for (const e of events) {
    if (e.isSlow) slowCount++;
    if (!e.success) failedCount++;
    const cat = e.performanceCategory;
    if (!byCategory[cat]) byCategory[cat] = { count: 0, slowCount: 0, slowPct: 0, avgMs: 0 };
    const s = byCategory[cat];
    s.avgMs = (s.avgMs * s.count + e.durationMs) / (s.count + 1);
    s.count++;
    if (e.isSlow) s.slowCount++;
  }
  for (const s of Object.values(byCategory)) {
    s.slowPct = s.count > 0 ? Math.round(s.slowCount / s.count * 100) : 0;
    s.avgMs   = Math.round(s.avgMs);
  }

  return {
    total: events.length,
    slowCount,
    failedCount,
    slowPct: events.length > 0 ? Math.round(slowCount / events.length * 100) : 0,
    p50Ms: p50,
    p95Ms: p95,
    byCategory,
  };
}

export function getRecentSlowEvents(limit = 10): PerformanceTelemetryEvent[] {
  ensureSeeded();
  return TelemetryTransport.query({
    domain: 'performance', isSlow: true, limit, sortBy: 'timestamp', sortDir: 'desc',
  }) as PerformanceTelemetryEvent[];
}

// ─── Session queries ──────────────────────────────────────────────────────────

export interface SessionSummary {
  totalSessions: number;
  sessionsWithErrors: number;
  sessionsWithSlowEvents: number;
  errorRate: number;
}

export interface SessionHealthRow {
  sessionId: string;
  userId?: string;
  districtId?: string;
  errorCount: number;
  criticalErrors: number;
  slowEventCount: number;
  firstSeen: string;
  lastSeen: string;
  modules: string[];
  health: 'healthy' | 'slow' | 'degraded' | 'failed';
}

export function getSessionSummary(): SessionSummary {
  ensureSeeded();
  const allEvents   = TelemetryTransport.getAllEvents();
  const sessions    = new Set(allEvents.map(e => e.sessionId));
  const errSessions = new Set(TelemetryTransport.getByDomain('error').map(e => e.sessionId));
  const perfEvents  = TelemetryTransport.getByDomain('performance') as PerformanceTelemetryEvent[];
  const slowSessions = new Set(perfEvents.filter(e => e.isSlow).map(e => e.sessionId));

  return {
    totalSessions:        sessions.size,
    sessionsWithErrors:   errSessions.size,
    sessionsWithSlowEvents: slowSessions.size,
    errorRate: sessions.size > 0 ? Math.round(errSessions.size / sessions.size * 100) : 0,
  };
}

export function getSessionList(limit = 25): SessionHealthRow[] {
  ensureSeeded();
  const map = new Map<string, SessionHealthRow>();

  for (const e of TelemetryTransport.getAllEvents()) {
    if (!map.has(e.sessionId)) {
      map.set(e.sessionId, {
        sessionId:    e.sessionId,
        userId:       e.userId,
        districtId:   e.districtId,
        errorCount:   0,
        criticalErrors: 0,
        slowEventCount: 0,
        firstSeen:    e.timestamp,
        lastSeen:     e.timestamp,
        modules:      [],
        health:       'healthy',
      });
    }
    const s = map.get(e.sessionId)!;
    if (e.timestamp < s.firstSeen) s.firstSeen = e.timestamp;
    if (e.timestamp > s.lastSeen)  s.lastSeen  = e.timestamp;
    if (e.module && !s.modules.includes(e.module)) s.modules.push(e.module);
    if (e.eventDomain === 'error') {
      s.errorCount++;
      if ((e as ErrorTelemetryEvent).severity === 'critical') s.criticalErrors++;
    }
    if (e.eventDomain === 'performance' && (e as PerformanceTelemetryEvent).isSlow) {
      s.slowEventCount++;
    }
  }

  for (const s of map.values()) {
    if (s.criticalErrors > 0)          s.health = 'failed';
    else if (s.errorCount > 0)         s.health = 'degraded';
    else if (s.slowEventCount >= 3)    s.health = 'slow';
  }

  return [...map.values()]
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
    .slice(0, limit);
}

// ─── Reliability queries ──────────────────────────────────────────────────────

export interface ReliabilitySummary {
  criticalErrors: number;
  userBlockingErrors: number;
  errorFreeSessionRate: number;
  topProblematicComponent: string | null;
}

export function getReliabilitySummary(): ReliabilitySummary {
  ensureSeeded();
  const errors      = TelemetryTransport.getByDomain('error') as ErrorTelemetryEvent[];
  const allSessions = new Set(TelemetryTransport.getAllEvents().map(e => e.sessionId));
  const errSessions = new Set(errors.map(e => e.sessionId));

  const componentCounts: Record<string, number> = {};
  let criticalErrors    = 0;
  let userBlockingErrors = 0;

  for (const e of errors) {
    if (e.severity === 'critical')  criticalErrors++;
    if (e.isUserBlocking)           userBlockingErrors++;
    if (e.component) componentCounts[e.component] = (componentCounts[e.component] ?? 0) + 1;
  }

  const topComponent = Object.entries(componentCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const errorFreeRate = allSessions.size > 0
    ? Math.round((allSessions.size - errSessions.size) / allSessions.size * 100)
    : 100;

  return { criticalErrors, userBlockingErrors, errorFreeSessionRate: errorFreeRate, topProblematicComponent: topComponent };
}
