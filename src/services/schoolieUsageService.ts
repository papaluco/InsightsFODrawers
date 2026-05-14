import {
  SchoolieUsageFilters,
  SchoolieUsageSummary,
  SchoolieUserStatRow,
  SchoolieDistrictStatRow,
  SchoolieSessionStatRow,
  SchoolieEventStatRow,
  SchoolieOperationalStats,
  ScholieSatisfactionStats,
} from '../types/schoolieUsageTypes';
import {
  mockSchoolieUsageEvents,
  SchoolieUsageEvent,
  SCHOOLIE_USER_NAMES,
  SCHOOLIE_DISTRICT_NAMES,
} from '../data/mockSchoolieUsageData';
import { mockFeedbackStore } from '../data/mockFeedbackData';
import { FeedbackRecord } from '../types/feedbackTypes';

const eventStore: SchoolieUsageEvent[] = [...mockSchoolieUsageEvents];

function applyFilters(events: SchoolieUsageEvent[], filters: SchoolieUsageFilters): SchoolieUsageEvent[] {
  return events.filter(e => {
    if (filters.dateRange?.start && e.timestamp.slice(0, 10) < filters.dateRange.start) return false;
    if (filters.dateRange?.end && e.timestamp.slice(0, 10) > filters.dateRange.end) return false;
    if (filters.districtId && e.districtId !== filters.districtId) return false;
    if (filters.userId && e.userId !== filters.userId) return false;
    if (filters.sourceEntryPoint && e.sourceEntryPoint !== filters.sourceEntryPoint) return false;
    if (filters.analysisIdentifier && e.analysisIdentifier !== filters.analysisIdentifier) return false;
    if (filters.eventType && e.eventType !== filters.eventType) return false;
    return true;
  });
}

async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function calcP95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}

export async function getSchoolieUsageSummary(filters: SchoolieUsageFilters = {}): Promise<SchoolieUsageSummary> {
  await delay(80);
  const events = applyFilters([...eventStore], filters);

  const requests = events.filter(e => e.eventType === 'AI_REQUEST_STARTED');
  const successes = events.filter(e => e.eventType === 'AI_RESPONSE_SUCCESS');
  const errors = events.filter(e => e.eventType === 'AI_RESPONSE_ERROR');
  const responseTimes = events.filter(e => e.responseTimeMs != null).map(e => e.responseTimeMs!);
  const total = successes.length + errors.length;

  return {
    totalInteractions: new Set(events.filter(e =>
      e.eventType === 'KPI_SCHOOLIE_OPENED' || e.eventType === 'DASHBOARD_SCHOOLIE_OPENED'
    ).map(e => e.sessionId)).size,
    totalRequests: requests.length,
    successCount: successes.length,
    errorCount: errors.length,
    successRate: total > 0 ? successes.length / total : 0,
    avgResponseTimeMs: responseTimes.length > 0
      ? responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length
      : 0,
    p95ResponseTimeMs: calcP95(responseTimes),
    activeUsers: new Set(events.map(e => e.userId)).size,
    activeDistricts: new Set(events.map(e => e.districtId)).size,
    kpiInteractions: events.filter(e => e.sourceEntryPoint === 'KpiDrawer' && e.eventType === 'AI_REQUEST_STARTED').length,
    dashboardInteractions: events.filter(e => e.sourceEntryPoint === 'Dashboard' && e.eventType === 'AI_REQUEST_STARTED').length,
    usageScreenInteractions: events.filter(e => e.sourceEntryPoint === 'UsageScreen' && e.eventType === 'AI_REQUEST_STARTED').length,
  };
}

export async function getSchoolieUserStats(filters: SchoolieUsageFilters = {}): Promise<SchoolieUserStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters);
  const map = new Map<string, {
    userId: string; districtId: string; requests: number;
    successes: number; errors: number; responseTimes: number[];
    lastActive: string; analysisCounts: Map<string, number>;
  }>();

  events.forEach(e => {
    if (!map.has(e.userId)) {
      map.set(e.userId, {
        userId: e.userId, districtId: e.districtId, requests: 0,
        successes: 0, errors: 0, responseTimes: [], lastActive: '',
        analysisCounts: new Map(),
      });
    }
    const row = map.get(e.userId)!;
    if (e.eventType === 'AI_REQUEST_STARTED') row.requests++;
    if (e.eventType === 'AI_RESPONSE_SUCCESS') row.successes++;
    if (e.eventType === 'AI_RESPONSE_ERROR') row.errors++;
    if (e.responseTimeMs != null) row.responseTimes.push(e.responseTimeMs);
    if (!row.lastActive || e.timestamp > row.lastActive) row.lastActive = e.timestamp;
    if (e.eventType === 'AI_REQUEST_STARTED') {
      row.analysisCounts.set(e.analysisIdentifier, (row.analysisCounts.get(e.analysisIdentifier) ?? 0) + 1);
    }
  });

  return [...map.values()].map(r => {
    const total = r.successes + r.errors;
    const topEntry = [...r.analysisCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      userId: r.userId,
      userName: SCHOOLIE_USER_NAMES[r.userId] ?? r.userId,
      districtId: r.districtId,
      districtName: SCHOOLIE_DISTRICT_NAMES[r.districtId] ?? r.districtId,
      totalRequests: r.requests,
      successCount: r.successes,
      errorCount: r.errors,
      successRate: total > 0 ? r.successes / total : 0,
      avgResponseTimeMs: r.responseTimes.length > 0
        ? r.responseTimes.reduce((s, t) => s + t, 0) / r.responseTimes.length
        : 0,
      lastActive: r.lastActive,
      topAnalysis: topEntry?.[0] ?? '',
    };
  }).sort((a, b) => b.totalRequests - a.totalRequests);
}

export async function getSchoolieDistrictStats(filters: SchoolieUsageFilters = {}): Promise<SchoolieDistrictStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters);
  const map = new Map<string, {
    districtId: string; users: Set<string>; requests: number;
    successes: number; errors: number; responseTimes: number[]; lastActivity: string;
  }>();

  events.forEach(e => {
    if (!map.has(e.districtId)) {
      map.set(e.districtId, {
        districtId: e.districtId, users: new Set(), requests: 0,
        successes: 0, errors: 0, responseTimes: [], lastActivity: '',
      });
    }
    const row = map.get(e.districtId)!;
    row.users.add(e.userId);
    if (e.eventType === 'AI_REQUEST_STARTED') row.requests++;
    if (e.eventType === 'AI_RESPONSE_SUCCESS') row.successes++;
    if (e.eventType === 'AI_RESPONSE_ERROR') row.errors++;
    if (e.responseTimeMs != null) row.responseTimes.push(e.responseTimeMs);
    if (!row.lastActivity || e.timestamp > row.lastActivity) row.lastActivity = e.timestamp;
  });

  return [...map.values()].map(r => {
    const total = r.successes + r.errors;
    return {
      districtId: r.districtId,
      districtName: SCHOOLIE_DISTRICT_NAMES[r.districtId] ?? r.districtId,
      activeUsers: r.users.size,
      totalRequests: r.requests,
      successRate: total > 0 ? r.successes / total : 0,
      avgResponseTimeMs: r.responseTimes.length > 0
        ? r.responseTimes.reduce((s, t) => s + t, 0) / r.responseTimes.length
        : 0,
      lastActivity: r.lastActivity,
    };
  }).sort((a, b) => b.totalRequests - a.totalRequests);
}

export async function getSchoolieSessionStats(filters: SchoolieUsageFilters = {}): Promise<SchoolieSessionStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters);
  const map = new Map<string, SchoolieSessionStatRow>();

  events.forEach(e => {
    if (e.eventType !== 'AI_REQUEST_STARTED' && !map.has(e.sessionId)) return;
    if (e.eventType === 'AI_REQUEST_STARTED' && !map.has(e.sessionId)) {
      map.set(e.sessionId, {
        sessionId: e.sessionId,
        userId: e.userId,
        userName: SCHOOLIE_USER_NAMES[e.userId] ?? e.userId,
        districtId: e.districtId,
        districtName: SCHOOLIE_DISTRICT_NAMES[e.districtId] ?? e.districtId,
        platform: e.platform,
        analysisIdentifier: e.analysisIdentifier,
        sourceEntryPoint: e.sourceEntryPoint,
        promptVersion: e.promptVersion,
        modelVersion: e.modelVersion,
        requestedAt: e.timestamp,
      });
    }
    const row = map.get(e.sessionId);
    if (!row) return;
    if (e.eventType === 'AI_RESPONSE_SUCCESS' || e.eventType === 'AI_RESPONSE_ERROR') {
      row.status = e.status;
      row.responseTimeMs = e.responseTimeMs;
      row.errorMessage = e.errorMessage;
    }
  });

  return [...map.values()].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export async function getSchoolieEventStats(filters: SchoolieUsageFilters = {}): Promise<SchoolieEventStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters);
  const map = new Map<string, {
    analysisIdentifier: string; sourceEntryPoint: string;
    requests: number; successes: number; errors: number; responseTimes: number[];
  }>();

  events.forEach(e => {
    if (e.eventType !== 'AI_REQUEST_STARTED' &&
        e.eventType !== 'AI_RESPONSE_SUCCESS' &&
        e.eventType !== 'AI_RESPONSE_ERROR') return;
    const key = `${e.analysisIdentifier}|${e.sourceEntryPoint}`;
    if (!map.has(key)) {
      map.set(key, {
        analysisIdentifier: e.analysisIdentifier,
        sourceEntryPoint: e.sourceEntryPoint,
        requests: 0, successes: 0, errors: 0, responseTimes: [],
      });
    }
    const row = map.get(key)!;
    if (e.eventType === 'AI_REQUEST_STARTED') row.requests++;
    if (e.eventType === 'AI_RESPONSE_SUCCESS') row.successes++;
    if (e.eventType === 'AI_RESPONSE_ERROR') row.errors++;
    if (e.responseTimeMs != null) row.responseTimes.push(e.responseTimeMs);
  });

  return [...map.values()].map(r => {
    const total = r.successes + r.errors;
    return {
      analysisIdentifier: r.analysisIdentifier,
      sourceEntryPoint: r.sourceEntryPoint as SchoolieSessionStatRow['sourceEntryPoint'],
      totalRequests: r.requests,
      successCount: r.successes,
      errorCount: r.errors,
      successRate: total > 0 ? r.successes / total : 0,
      avgResponseTimeMs: r.responseTimes.length > 0
        ? r.responseTimes.reduce((s, t) => s + t, 0) / r.responseTimes.length
        : 0,
    };
  }).sort((a, b) => b.totalRequests - a.totalRequests);
}

export async function getSchoolieOperationalStats(filters: SchoolieUsageFilters = {}): Promise<SchoolieOperationalStats> {
  await delay(80);
  const events = applyFilters([...eventStore], filters);
  const successes = events.filter(e => e.eventType === 'AI_RESPONSE_SUCCESS');
  const errors = events.filter(e => e.eventType === 'AI_RESPONSE_ERROR');
  const responseTimes = events.filter(e => e.responseTimeMs != null).map(e => e.responseTimeMs!);
  const total = successes.length + errors.length;

  const errorMsgCounts = new Map<string, number>();
  errors.forEach(e => {
    const msg = e.errorMessage ?? 'Unknown error';
    errorMsgCounts.set(msg, (errorMsgCounts.get(msg) ?? 0) + 1);
  });

  return {
    successRate: total > 0 ? successes.length / total : 0,
    errorRate: total > 0 ? errors.length / total : 0,
    avgResponseTimeMs: responseTimes.length > 0
      ? responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length
      : 0,
    p95ResponseTimeMs: calcP95(responseTimes),
    timeoutCount: errors.filter(e => (e.responseTimeMs ?? 0) > 10000).length,
    fastFailCount: errors.filter(e => (e.responseTimeMs ?? Infinity) < 1000).length,
    totalErrors: errors.length,
    errorsByType: [...errorMsgCounts.entries()]
      .map(([errorMessage, count]) => ({ errorMessage, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getSchoolieRawEvents(filters: SchoolieUsageFilters = {}): Promise<SchoolieUsageEvent[]> {
  await delay(80);
  return applyFilters([...eventStore], filters).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export interface SchoolieAdoptionStats {
  newUserCount: number;
  returningUserCount: number;
  newUserIds: string[];
  returningUserIds: string[];
  totalDistrictsInStore: number;
  activeDistricts: number;
  adoptionRate: number;
  userGrowthPct: number | null;
}

export async function getSchoolieAdoptionStats(filters: SchoolieUsageFilters = {}): Promise<SchoolieAdoptionStats> {
  await delay(80);
  const filteredEvents = applyFilters([...eventStore], filters);
  const firstSeen = new Map<string, string>();
  eventStore.forEach(e => {
    if (!firstSeen.has(e.userId) || e.timestamp < firstSeen.get(e.userId)!) {
      firstSeen.set(e.userId, e.timestamp);
    }
  });
  const activeUserIds = [...new Set(filteredEvents.map(e => e.userId))];
  const filterStart = filters.dateRange?.start;
  const newUserIds: string[] = [];
  const returningUserIds: string[] = [];
  activeUserIds.forEach(userId => {
    const first = firstSeen.get(userId);
    if (!filterStart || !first || first >= filterStart) newUserIds.push(userId);
    else returningUserIds.push(userId);
  });
  const totalDistrictsInStore = new Set(eventStore.map(e => e.districtId)).size;
  const activeDistricts = new Set(filteredEvents.map(e => e.districtId)).size;

  let userGrowthPct: number | null = null;
  if (filters.dateRange?.start && filters.dateRange?.end) {
    const mid = new Date((new Date(filters.dateRange.start).getTime() + new Date(filters.dateRange.end).getTime()) / 2).toISOString().slice(0, 10);
    const firstHalfUsers = new Set(filteredEvents.filter(e => e.timestamp.slice(0, 10) < mid).map(e => e.userId)).size;
    const secondHalfUsers = new Set(filteredEvents.filter(e => e.timestamp.slice(0, 10) >= mid).map(e => e.userId)).size;
    if (firstHalfUsers > 0) userGrowthPct = ((secondHalfUsers - firstHalfUsers) / firstHalfUsers) * 100;
  }
  return { newUserCount: newUserIds.length, returningUserCount: returningUserIds.length, newUserIds, returningUserIds, totalDistrictsInStore, activeDistricts, adoptionRate: totalDistrictsInStore > 0 ? activeDistricts / totalDistrictsInStore : 0, userGrowthPct };
}

export async function getSchoolieSessionEvents(sessionId: string): Promise<SchoolieUsageEvent[]> {
  await delay(80);
  return eventStore.filter(e => e.sessionId === sessionId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export async function getSatisfactionStats(filters: SchoolieUsageFilters = {}): Promise<ScholieSatisfactionStats> {
  await delay(80);
  const feedback = mockFeedbackStore.filter(r => r.feedbackType === 'Schoolie');

  const thumbsUp = feedback.filter(r => r.feedbackValue === 'thumbs_up');
  const thumbsDown = feedback.filter(r => r.feedbackValue === 'thumbs_down');
  const total = feedback.length;

  const reasonCounts = new Map<string, number>();
  thumbsDown.forEach(r => {
    r.reasonCodes?.forEach(code => {
      reasonCounts.set(code, (reasonCounts.get(code) ?? 0) + 1);
    });
  });

  const analysisCounts = new Map<string, { thumbsUp: number; thumbsDown: number }>();
  feedback.forEach(r => {
    const key = r.kpiIdentifier ?? r.analysisIdentifier ?? 'Unknown';
    if (!analysisCounts.has(key)) analysisCounts.set(key, { thumbsUp: 0, thumbsDown: 0 });
    const row = analysisCounts.get(key)!;
    if (r.feedbackValue === 'thumbs_up') row.thumbsUp++;
    else row.thumbsDown++;
  });

  return {
    totalFeedback: total,
    thumbsUpCount: thumbsUp.length,
    thumbsDownCount: thumbsDown.length,
    satisfactionRate: total > 0 ? thumbsUp.length / total : 0,
    topReasonCodes: [...reasonCounts.entries()]
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count),
    byAnalysis: [...analysisCounts.entries()].map(([analysisIdentifier, counts]) => ({
      analysisIdentifier,
      thumbsUp: counts.thumbsUp,
      thumbsDown: counts.thumbsDown,
      satisfactionRate: (counts.thumbsUp + counts.thumbsDown) > 0
        ? counts.thumbsUp / (counts.thumbsUp + counts.thumbsDown)
        : 0,
    })).sort((a, b) => (b.thumbsUp + b.thumbsDown) - (a.thumbsUp + a.thumbsDown)),
  };
}

export interface SchoolieFeedbackTrendPoint {
  key: string;
  thumbsUp: number;
  thumbsDown: number;
}

export async function getSchoolieSatisfactionTrend(): Promise<SchoolieFeedbackTrendPoint[]> {
  await delay(80);
  const feedback = mockFeedbackStore.filter(r => r.feedbackType === 'Schoolie');
  const buckets = new Map<string, { thumbsUp: number; thumbsDown: number }>();
  feedback.forEach(r => {
    const key = r.createdAt.slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, { thumbsUp: 0, thumbsDown: 0 });
    const b = buckets.get(key)!;
    if (r.feedbackValue === 'thumbs_up') b.thumbsUp++;
    else b.thumbsDown++;
  });
  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, b]) => ({ key, thumbsUp: b.thumbsUp, thumbsDown: b.thumbsDown }));
}

export interface SchoolieFeedbackDistrictRow {
  districtId: string;
  districtName: string;
  thumbsUp: number;
  thumbsDown: number;
  total: number;
  satisfactionRate: number;
}

export async function getSchoolieSatisfactionByDistrict(): Promise<SchoolieFeedbackDistrictRow[]> {
  await delay(80);
  const feedback = mockFeedbackStore.filter(r => r.feedbackType === 'Schoolie');
  const map = new Map<string, { thumbsUp: number; thumbsDown: number }>();
  feedback.forEach(r => {
    if (!map.has(r.districtId)) map.set(r.districtId, { thumbsUp: 0, thumbsDown: 0 });
    const b = map.get(r.districtId)!;
    if (r.feedbackValue === 'thumbs_up') b.thumbsUp++;
    else b.thumbsDown++;
  });
  return [...map.entries()].map(([districtId, b]) => ({
    districtId,
    districtName: SCHOOLIE_DISTRICT_NAMES[districtId] ?? districtId,
    thumbsUp: b.thumbsUp,
    thumbsDown: b.thumbsDown,
    total: b.thumbsUp + b.thumbsDown,
    satisfactionRate: (b.thumbsUp + b.thumbsDown) > 0 ? b.thumbsUp / (b.thumbsUp + b.thumbsDown) : 0,
  })).sort((a, b) => b.total - a.total);
}

export interface SchoolieFeedbackSourceRow {
  sourceEntryPoint: string;
  thumbsUp: number;
  thumbsDown: number;
  total: number;
  satisfactionRate: number;
}

export async function getSchoolieSatisfactionBySource(): Promise<SchoolieFeedbackSourceRow[]> {
  await delay(80);
  const feedback = mockFeedbackStore.filter(r => r.feedbackType === 'Schoolie');
  const map = new Map<string, { thumbsUp: number; thumbsDown: number }>();
  feedback.forEach(r => {
    const key = r.sourceEntryPoint;
    if (!map.has(key)) map.set(key, { thumbsUp: 0, thumbsDown: 0 });
    const b = map.get(key)!;
    if (r.feedbackValue === 'thumbs_up') b.thumbsUp++;
    else b.thumbsDown++;
  });
  return [...map.entries()].map(([sourceEntryPoint, b]) => ({
    sourceEntryPoint,
    thumbsUp: b.thumbsUp,
    thumbsDown: b.thumbsDown,
    total: b.thumbsUp + b.thumbsDown,
    satisfactionRate: (b.thumbsUp + b.thumbsDown) > 0 ? b.thumbsUp / (b.thumbsUp + b.thumbsDown) : 0,
  })).sort((a, b) => b.total - a.total);
}

export async function getSchoolieFeedbackRecords(): Promise<FeedbackRecord[]> {
  await delay(80);
  return mockFeedbackStore
    .filter(r => r.feedbackType === 'Schoolie')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
}
