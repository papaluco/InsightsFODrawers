import {
  AppUsageEvent,
  AppUsageFilters,
  AppUsageSummary,
  AppUserStatRow,
  AppDistrictStatRow,
  AppSessionStatRow,
  AppTimingData,
  AppFunnelDef,
  AppFunnelStepResult,
  APP_INTERACTION_TYPES,
  AppPage,
  AppEntryPoint,
} from '../types/appUsageTypes';
import {
  mockAppUsageEvents,
  APP_USER_NAMES,
  APP_DISTRICT_NAMES,
  APP_DISTRICT_TIMEZONES,
  APP_USER_FIRST_SEEN,
} from '../data/mockAppUsageData';
import { getTimeOfDay } from '../utils/timeOfDay';

// In-memory event store seeded from mock data
const eventStore: AppUsageEvent[] = [...mockAppUsageEvents];

async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function applyFilters(events: AppUsageEvent[], filters: Partial<AppUsageFilters>): AppUsageEvent[] {
  return events.filter(e => {
    if (filters.startDate && e.timestamp.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && e.timestamp.slice(0, 10) > filters.endDate) return false;
    if (filters.platform && e.platform !== filters.platform) return false;
    if (filters.districts?.length && !filters.districts.includes(e.districtId)) return false;
    if (filters.userIds?.length && !filters.userIds.includes(e.userId)) return false;
    if (filters.eventTypes?.length && !filters.eventTypes.includes(e.eventType)) return false;
    return true;
  });
}

interface ComputedSession {
  sessionId: string;
  userId: string;
  districtId: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  entryPoint: AppEntryPoint;
  startTime: string;
  lastEventTime: string;
  hasAppClosed: boolean;
  derivedDuration: number;
  isDerivedDuration: boolean;
  eventCount: number;
  isDropOff: boolean;
  events: AppUsageEvent[];
  pages: AppPage[];
}

function buildSessions(events: AppUsageEvent[]): ComputedSession[] {
  const bySession = new Map<string, AppUsageEvent[]>();
  for (const e of events) {
    if (!bySession.has(e.sessionId)) bySession.set(e.sessionId, []);
    bySession.get(e.sessionId)!.push(e);
  }

  const sessions: ComputedSession[] = [];

  bySession.forEach((evs, sessionId) => {
    const sorted = [...evs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const nonClose = sorted.filter(e => e.eventType !== 'APP_CLOSED');
    const closeEv = sorted.find(e => e.eventType === 'APP_CLOSED');

    const startTime = sorted[0].timestamp;
    const lastEventTime = nonClose.length > 0
      ? nonClose[nonClose.length - 1].timestamp
      : sorted[sorted.length - 1].timestamp;

    const hasAppClosed = !!closeEv;

    const startMs = new Date(startTime).getTime();
    let derivedDuration: number;
    let isDerivedDuration: boolean;

    if (hasAppClosed && closeEv) {
      derivedDuration = (new Date(closeEv.timestamp).getTime() - startMs) / 60000;
      isDerivedDuration = false;
    } else {
      derivedDuration = (new Date(lastEventTime).getTime() - startMs) / 60000 + 5;
      isDerivedDuration = true;
    }
    derivedDuration = Math.max(0, Math.round(derivedDuration * 10) / 10);

    const firstPageView = sorted.find(e => e.eventType === 'PAGE_VIEWED');
    const entryPoint: AppEntryPoint = (firstPageView?.context.entryPoint as AppEntryPoint) ?? 'Workspace';

    const pages: AppPage[] = [];
    for (const e of sorted) {
      if (e.eventType === 'PAGE_VIEWED' && !pages.includes(e.page)) pages.push(e.page);
    }

    const hasInteraction = nonClose.some(e => APP_INTERACTION_TYPES.includes(e.eventType));
    const pageViews = nonClose.filter(e => e.eventType === 'PAGE_VIEWED');
    const isDropOff = (!hasInteraction && pageViews.length <= 1) || derivedDuration < 1;

    sessions.push({
      sessionId,
      userId: sorted[0].userId,
      districtId: sorted[0].districtId,
      platform: sorted[0].platform,
      entryPoint,
      startTime,
      lastEventTime,
      hasAppClosed,
      derivedDuration,
      isDerivedDuration,
      eventCount: sorted.length,
      isDropOff,
      events: sorted,
      pages,
    });
  });

  return sessions.sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export async function getAllAppEvents(filters?: Partial<AppUsageFilters>): Promise<AppUsageEvent[]> {
  await delay(60);
  const events = [...eventStore];
  return filters ? applyFilters(events, filters) : events;
}

export async function getAppUsageSummary(filters?: Partial<AppUsageFilters>): Promise<AppUsageSummary> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const sessions = buildSessions(events);

  const activeUserIds = new Set(events.map(e => e.userId));
  const activeDistrictIds = new Set(events.map(e => e.districtId));

  const avgSessionDuration = sessions.length > 0
    ? sessions.reduce((s, sess) => s + sess.derivedDuration, 0) / sessions.length
    : 0;

  // DAU/WAU/MAU based on sessions in the last day/week/month relative to the newest event
  const allTimestamps = sessions.map(s => s.startTime).sort();
  const newestDate = allTimestamps.length > 0 ? new Date(allTimestamps[allTimestamps.length - 1]) : new Date();

  const dauCutoff = new Date(newestDate); dauCutoff.setDate(dauCutoff.getDate() - 1);
  const wauCutoff = new Date(newestDate); wauCutoff.setDate(wauCutoff.getDate() - 7);
  const mauCutoff = new Date(newestDate); mauCutoff.setDate(mauCutoff.getDate() - 30);

  const dau = new Set(sessions.filter(s => new Date(s.startTime) >= dauCutoff).map(s => s.userId)).size;
  const wau = new Set(sessions.filter(s => new Date(s.startTime) >= wauCutoff).map(s => s.userId)).size;
  const mau = activeUserIds.size;

  // New vs returning based on first-seen date
  const startDate = filters?.startDate ?? '';
  const endDate = filters?.endDate ?? '';
  let newUsers = 0;
  let returningUsers = 0;
  activeUserIds.forEach(uid => {
    const firstSeen = APP_USER_FIRST_SEEN[uid] ?? '2026-01-01';
    if (startDate && firstSeen >= startDate && (!endDate || firstSeen <= endDate)) {
      newUsers++;
    } else {
      returningUsers++;
    }
  });
  if (!startDate) {
    // Default: users first seen in last 30 days of data are "new"
    const cutoff = '2026-04-15';
    newUsers = 0; returningUsers = 0;
    activeUserIds.forEach(uid => {
      const firstSeen = APP_USER_FIRST_SEEN[uid] ?? '2026-01-01';
      if (firstSeen >= cutoff) newUsers++; else returningUsers++;
    });
  }

  const retentionPercent = activeUserIds.size > 0
    ? Math.round((returningUsers / activeUserIds.size) * 1000) / 10
    : 0;

  return {
    activeUsers: activeUserIds.size,
    activeDistricts: activeDistrictIds.size,
    totalSessions: sessions.length,
    avgSessionDuration: Math.round(avgSessionDuration * 10) / 10,
    dau,
    wau,
    mau,
    newUsers,
    returningUsers,
    retentionPercent,
  };
}

export async function getAppUserStats(filters?: Partial<AppUsageFilters>): Promise<AppUserStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const sessions = buildSessions(events);

  const userMap = new Map<string, {
    sessions: ComputedSession[];
    events: AppUsageEvent[];
  }>();

  for (const s of sessions) {
    if (!userMap.has(s.userId)) userMap.set(s.userId, { sessions: [], events: [] });
    userMap.get(s.userId)!.sessions.push(s);
  }
  for (const e of events) {
    if (userMap.has(e.userId)) userMap.get(e.userId)!.events.push(e);
  }

  const rows: AppUserStatRow[] = [];
  userMap.forEach((data, userId) => {
    const { sessions: userSessions, events: userEvents } = data;
    const lastSession = userSessions.reduce((a, b) => a.startTime > b.startTime ? a : b);
    const avgDur = userSessions.reduce((s, sess) => s + sess.derivedDuration, 0) / userSessions.length;
    const firstUser = userSessions[0];
    rows.push({
      userId,
      userName: APP_USER_NAMES[userId] ?? userId,
      districtId: firstUser.districtId,
      districtName: APP_DISTRICT_NAMES[firstUser.districtId] ?? firstUser.districtId,
      platform: firstUser.platform,
      sessions: userSessions.length,
      eventCount: userEvents.length,
      lastActive: lastSession.startTime,
      avgSessionDuration: Math.round(avgDur * 10) / 10,
      isPowerUser: false,
    });
  });

  const avgSessions = rows.reduce((s, r) => s + r.sessions, 0) / Math.max(rows.length, 1);
  rows.forEach(r => { r.isPowerUser = r.sessions > avgSessions * 1.5; });

  return rows.sort((a, b) => b.sessions - a.sessions);
}

export async function getAppDistrictStats(filters?: Partial<AppUsageFilters>): Promise<AppDistrictStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const sessions = buildSessions(events);

  const distMap = new Map<string, { sessions: ComputedSession[]; userIds: Set<string>; platform: string }>();

  for (const s of sessions) {
    if (!distMap.has(s.districtId)) {
      distMap.set(s.districtId, { sessions: [], userIds: new Set(), platform: s.platform });
    }
    const d = distMap.get(s.districtId)!;
    d.sessions.push(s);
    d.userIds.add(s.userId);
  }

  const rows: AppDistrictStatRow[] = [];
  distMap.forEach((data, districtId) => {
    const { sessions: distSessions, userIds, platform } = data;
    const activeUsers = userIds.size;
    const avgDur = distSessions.reduce((s, sess) => s + sess.derivedDuration, 0) / distSessions.length;
    const lastActivity = distSessions.reduce((a, b) => a.startTime > b.startTime ? a : b).startTime;
    rows.push({
      districtId,
      districtName: APP_DISTRICT_NAMES[districtId] ?? districtId,
      timezone: APP_DISTRICT_TIMEZONES[districtId] ?? 'America/New_York',
      platform,
      activeUsers,
      sessions: distSessions.length,
      avgSessionsPerUser: Math.round((distSessions.length / activeUsers) * 10) / 10,
      avgDuration: Math.round(avgDur * 10) / 10,
      lastActivity,
      hasNoActivity: false,
    });
  });

  // Mark districts with no activity in the filtered time range
  // (Any district in APP_DISTRICT_NAMES that doesn't appear in rows)
  const activeDists = new Set(rows.map(r => r.districtId));
  Object.keys(APP_DISTRICT_NAMES).forEach(id => {
    if (!activeDists.has(id)) {
      rows.push({
        districtId: id,
        districtName: APP_DISTRICT_NAMES[id],
        timezone: APP_DISTRICT_TIMEZONES[id] ?? 'America/New_York',
        platform: '',
        activeUsers: 0,
        sessions: 0,
        avgSessionsPerUser: 0,
        avgDuration: 0,
        lastActivity: '',
        hasNoActivity: true,
      });
    }
  });

  return rows.sort((a, b) => b.sessions - a.sessions);
}

export async function getAppSessionStats(filters?: Partial<AppUsageFilters>): Promise<AppSessionStatRow[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const sessions = buildSessions(events);

  return sessions.map(s => ({
    sessionId: s.sessionId,
    userId: s.userId,
    userName: APP_USER_NAMES[s.userId] ?? s.userId,
    districtId: s.districtId,
    districtName: APP_DISTRICT_NAMES[s.districtId] ?? s.districtId,
    platform: s.platform,
    entryPoint: s.entryPoint,
    startTime: s.startTime,
    lastEventTime: s.lastEventTime,
    derivedDuration: s.derivedDuration,
    isDerivedDuration: s.isDerivedDuration,
    eventCount: s.eventCount,
    isDropOff: s.isDropOff,
    hasAppClosed: s.hasAppClosed,
  }));
}

export async function getAppTimingData(
  filters?: Partial<AppUsageFilters>,
  districtTzMap?: Record<string, string>,
): Promise<AppTimingData> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const sessions = buildSessions(events);
  const total = sessions.length;

  // Calendar usage
  const calMap = new Map<string, { sessions: number; users: Set<string> }>();
  for (const s of sessions) {
    const date = s.startTime.slice(0, 10);
    if (!calMap.has(date)) calMap.set(date, { sessions: 0, users: new Set() });
    const d = calMap.get(date)!;
    d.sessions++;
    d.users.add(s.userId);
  }

  const calendarUsage = [...calMap.entries()].sort().map(([date, d]) => ({
    date,
    sessionCount: d.sessions,
    activeUserCount: d.users.size,
    percentOfTotalUsage: total > 0 ? Math.round((d.sessions / total) * 1000) / 10 : 0,
  }));

  // Day of week summary
  const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dowMap = new Map<number, { sessions: number; users: Set<string> }>();
  for (let i = 0; i < 7; i++) dowMap.set(i, { sessions: 0, users: new Set() });
  for (const s of sessions) {
    const dow = new Date(s.startTime).getDay();
    const d = dowMap.get(dow)!;
    d.sessions++;
    d.users.add(s.userId);
  }
  const dayOfWeekSummary = [1, 2, 3, 4, 5, 6, 0].map(i => ({
    dayOfWeek: DOW[i],
    sessionCount: dowMap.get(i)!.sessions,
    activeUserCount: dowMap.get(i)!.users.size,
    percentOfTotalUsage: total > 0 ? Math.round((dowMap.get(i)!.sessions / total) * 1000) / 10 : 0,
  }));

  // Time of day breakdown — uses district timezone if provided, otherwise UTC server time
  const todMap = { Morning: { sessions: 0, users: new Set<string>() }, Afternoon: { sessions: 0, users: new Set<string>() }, Evening: { sessions: 0, users: new Set<string>() } };
  for (const s of sessions) {
    const tz = districtTzMap?.[s.districtId];
    const tod = getTimeOfDay(s.startTime, tz);
    const bucket = (tod.charAt(0).toUpperCase() + tod.slice(1)) as 'Morning' | 'Afternoon' | 'Evening';
    todMap[bucket].sessions++;
    todMap[bucket].users.add(s.userId);
  }
  const timeOfDayBreakdown = (
    [
      { bucket: 'Morning' as const, timeRange: 'Before 12 PM' },
      { bucket: 'Afternoon' as const, timeRange: '12 PM – 5 PM' },
      { bucket: 'Evening' as const, timeRange: 'After 5 PM' },
    ] as const
  ).map(({ bucket, timeRange }) => ({
    bucket,
    timeRange,
    sessionCount: todMap[bucket].sessions,
    activeUserCount: todMap[bucket].users.size,
    percentOfTotalUsage: total > 0 ? Math.round((todMap[bucket].sessions / total) * 1000) / 10 : 0,
  }));

  return { calendarUsage, dayOfWeekSummary, timeOfDayBreakdown };
}

export async function getAppFunnelData(
  funnelDef: AppFunnelDef,
  filters?: Partial<AppUsageFilters>
): Promise<AppFunnelStepResult[]> {
  await delay(80);
  const events = applyFilters([...eventStore], filters ?? {});
  const sessions = buildSessions(events);

  const steps = funnelDef.steps;
  const stepCounts: number[] = new Array(steps.length).fill(0);

  for (const session of sessions) {
    for (let i = 0; i < steps.length; i++) {
      // All prior steps must match (strict funnel)
      const allPriorMatch = i === 0 || stepCounts.length > 0;
      if (!allPriorMatch) break;

      // Check if this step matches for this session
      // To enforce order: check that all steps 0..i match
      let matches = true;
      for (let j = 0; j <= i; j++) {
        if (!steps[j].match(session.events)) { matches = false; break; }
      }
      if (matches) stepCounts[i]++;
    }
  }

  const startCount = stepCounts[0] || 1;

  return steps.map((step, i) => {
    const count = stepCounts[i];
    const prevCount = i === 0 ? count : stepCounts[i - 1];
    return {
      stepOrder: i + 1,
      stepKey: step.stepKey,
      label: step.label,
      description: step.description,
      count,
      percentOfStart: Math.round((count / startCount) * 1000) / 10,
      dropOffFromPrevious: i === 0 ? 0 : Math.round(((prevCount - count) / Math.max(prevCount, 1)) * 1000) / 10,
    };
  });
}

export async function getAppSessionEvents(
  sessionId: string
): Promise<AppUsageEvent[]> {
  await delay(40);
  return [...eventStore].filter(e => e.sessionId === sessionId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
