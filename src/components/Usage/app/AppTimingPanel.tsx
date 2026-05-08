import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, SlidersHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { AppUsageEvent, AppDistrictStatRow, AppSessionStatRow, AppUserStatRow } from '../../../types/appUsageTypes';
import { getTimeOfDay } from '../../../utils/timeOfDay';
import AppSessionListDrawer from './AppSessionListDrawer';


interface Props {
  districtStats: AppDistrictStatRow[];
  filteredEvents: AppUsageEvent[];
  sessionStats: AppSessionStatRow[];
  users: AppUserStatRow[];
  onSessionClick: (session: AppSessionStatRow) => void;
  onUsersClick: (title: string, users: AppUserStatRow[]) => void;
  onEventsClick: (title: string, events: AppUsageEvent[]) => void;
}

type TimeBasis = 'ServerTime' | 'CustomerLocalTime';
type CalendarCountMode = 'sessions' | 'pageViews';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function interpolateColor(a: string, b: string, t: number): string {
  const hr = (h: string, o: number) => parseInt(h.replace('#', '').substring(o, o + 2), 16);
  const r = Math.round(hr(a, 0) + (hr(b, 0) - hr(a, 0)) * t);
  const g = Math.round(hr(a, 2) + (hr(b, 2) - hr(a, 2)) * t);
  const bl = Math.round(hr(a, 4) + (hr(b, 4) - hr(a, 4)) * t);
  return `rgb(${r},${g},${bl})`;
}

function getHeatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '#f8fafc';
  return interpolateColor('#ecfdf5', '#0f766e', Math.min(value / max, 1));
}

function getLocalDate(timestamp: string, timezone?: string): string {
  if (!timezone) return timestamp.slice(0, 10);
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: timezone,
  }).format(new Date(timestamp));
}

function getLocalDow(timestamp: string, timezone?: string): number {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (!timezone) return new Date(timestamp).getDay();
  const name = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone }).format(new Date(timestamp));
  const idx = DAYS.indexOf(name);
  return idx >= 0 ? idx : new Date(timestamp).getDay();
}

function getLocalHour(timestamp: string, timezone?: string): number {
  if (!timezone) return new Date(timestamp).getUTCHours();
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', hour12: false, timeZone: timezone,
  }).formatToParts(new Date(timestamp));
  const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
  return h === 24 ? 0 : h;
}

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const DOW_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TOD_HOUR_COLORS: Record<string, string> = { morning: '#6366f1', afternoon: '#10b981', evening: '#f59e0b' };

const AppTimingPanel: React.FC<Props> = ({
  districtStats,
  filteredEvents,
  sessionStats,
  users,
  onSessionClick,
  onUsersClick,
  onEventsClick,
}) => {
  const [timeBasis, setTimeBasis] = useState<TimeBasis>('ServerTime');
  const [calendarCountMode, setCalendarCountMode] = useState<CalendarCountMode>('sessions');
  const [todCountMode, setTodCountMode] = useState<CalendarCountMode>('sessions');
  const [calExpanded, setCalExpanded] = useState(true);
  const [dowExpanded, setDowExpanded] = useState(true);
  const [todExpanded, setTodExpanded] = useState(true);

  const [sessionDrill, setSessionDrill] = useState<{
  title: string;
  sessions: AppSessionStatRow[];
} | null>(null);

  const [currentMonthStr, setCurrentMonthStr] = useState<string>(() => {
    if (filteredEvents.length > 0) {
      const months = filteredEvents.map(e => e.timestamp.slice(0, 7)).sort();
      return months[months.length - 1];
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const districtTzMap = useMemo(() => {
    const map: Record<string, string> = {};
    districtStats.forEach(d => { map[d.districtId] = d.timezone; });
    return map;
  }, [districtStats]);

  const dataMonths = useMemo(() => {
    const set = new Set<string>();
    filteredEvents.forEach(e => set.add(e.timestamp.slice(0, 7)));
    return [...set].sort();
  }, [filteredEvents]);

  const sessionFirstEvents = useMemo(() => {
    const map = new Map<string, AppUsageEvent>();
    filteredEvents.forEach(e => {
      const existing = map.get(e.sessionId);
      if (!existing || e.timestamp < existing.timestamp) map.set(e.sessionId, e);
    });
    return [...map.values()];
  }, [filteredEvents]);

  const dayDataMap = useMemo(() => {
    type Entry = { pageViews: number; sessions: Set<string>; users: Set<string> };
    const map = new Map<string, Entry>();

    filteredEvents.forEach(e => {
      const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
      const date = getLocalDate(e.timestamp, tz);
      if (!map.has(date)) map.set(date, { pageViews: 0, sessions: new Set(), users: new Set() });
      const d = map.get(date)!;
      if (e.eventType === 'PAGE_VIEWED') d.pageViews++;
      d.users.add(e.userId);
    });

    sessionFirstEvents.forEach(e => {
      const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
      const date = getLocalDate(e.timestamp, tz);
      map.get(date)?.sessions.add(e.sessionId);
    });

    return map;
  }, [filteredEvents, sessionFirstEvents, timeBasis, districtTzMap]);

  const getUsersForIds = (userIds: Set<string>) => {
  return users.filter(u => userIds.has(u.userId));
};

const getPageViewEventsForDate = (date: string) => {
  return filteredEvents.filter(e => {
    if (e.eventType !== 'PAGE_VIEWED') return false;

    const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
    return getLocalDate(e.timestamp, tz) === date;
  });
};

    const openSessionList = (title: string, sessionIds: Set<string>) => {
  const sessions = sessionStats.filter(s => sessionIds.has(s.sessionId));
  setSessionDrill({ title, sessions });
};

  const calendarGrid = useMemo(() => {
    if (!currentMonthStr) return null;
    const [year, month] = currentMonthStr.split('-').map(Number);

    const firstDayMs = Date.UTC(year, month - 1, 1);
    const lastDayMs = Date.UTC(year, month, 0);
    const firstDow = new Date(firstDayMs).getUTCDay();
    const lastDow = new Date(lastDayMs).getUTCDay();

    const startMs = firstDayMs - firstDow * 86400000;
    const endMs = lastDayMs + (6 - lastDow) * 86400000;

    let maxValue = 1;
    for (let ms = firstDayMs; ms <= lastDayMs; ms += 86400000) {
      const dateStr = new Date(ms).toISOString().slice(0, 10);
      const d = dayDataMap.get(dateStr);
      if (d) {
        const v = calendarCountMode === 'sessions' ? d.sessions.size : d.pageViews;
        if (v > maxValue) maxValue = v;
      }
    }

    const weeks: { date: string; dayNum: number; data: { sessions: number; pageViews: number; users: number } | null; isCurrentMonth: boolean }[][] = [];
    for (let weekStart = startMs; weekStart <= endMs; weekStart += 7 * 86400000) {
      const week: typeof weeks[0] = [];
      for (let i = 0; i < 7; i++) {
        const ms = weekStart + i * 86400000;
        const d = new Date(ms);
        const dateStr = d.toISOString().slice(0, 10);
        const isCurrentMonth = d.getUTCFullYear() === year && d.getUTCMonth() === month - 1;
        const raw = dayDataMap.get(dateStr);
        week.push({
          date: dateStr,
          dayNum: d.getUTCDate(),
          data: raw ? { sessions: raw.sessions.size, pageViews: raw.pageViews, users: raw.users.size } : null,
          isCurrentMonth,
        });
      }
      weeks.push(week);
    }

    return { weeks, maxValue };
  }, [currentMonthStr, dayDataMap, calendarCountMode]);

  const monthSummary = useMemo(() => {
    if (!currentMonthStr) return null;

    const [year, month] = currentMonthStr.split('-').map(Number);
    const firstDayMs = Date.UTC(year, month - 1, 1);
    const lastDayMs = Date.UTC(year, month, 0);

    let totalSessions = 0;
    let totalPageViews = 0;
    const monthlyUsers = new Set<string>();
    let activeDays = 0;
    let peakDay: { date: string; value: number } | null = null;

    for (let ms = firstDayMs; ms <= lastDayMs; ms += 86400000) {
      const dateStr = new Date(ms).toISOString().slice(0, 10);
      const d = dayDataMap.get(dateStr);

      const sessions = d?.sessions.size ?? 0;
      const pageViews = d?.pageViews ?? 0;
      const selectedValue = calendarCountMode === 'sessions' ? sessions : pageViews;

      totalSessions += sessions;
      totalPageViews += pageViews;
      d?.users.forEach(u => monthlyUsers.add(u));

      if (selectedValue > 0) activeDays++;

      if (!peakDay || selectedValue > peakDay.value) {
        peakDay = { date: dateStr, value: selectedValue };
      }
    }

    const selectedTotal = calendarCountMode === 'sessions' ? totalSessions : totalPageViews;

    return {
      totalSessions,
      totalPageViews,
      activeUsers: monthlyUsers.size,
      activeDays,
      selectedTotal,
      averagePerActiveDay: activeDays > 0 ? Math.round((selectedTotal / activeDays) * 10) / 10 : 0,
      peakDay,
    };
  }, [currentMonthStr, dayDataMap, calendarCountMode]);

const dowData = useMemo(() => {
  const dowMap = new Map<number, { sessions: Set<string>; users: Set<string>; pageViews: number }>();
  for (let i = 0; i < 7; i++) dowMap.set(i, { sessions: new Set(), users: new Set(), pageViews: 0 });

  filteredEvents.forEach(e => {
    const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
    const dow = getLocalDow(e.timestamp, tz);

    if (e.eventType === 'PAGE_VIEWED') {
      dowMap.get(dow)!.pageViews++;
    }

    dowMap.get(dow)!.users.add(e.userId);
  });

  sessionFirstEvents.forEach(e => {
    const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
    const dow = getLocalDow(e.timestamp, tz);

    dowMap.get(dow)?.sessions.add(e.sessionId);
  });



  const total = [...dowMap.values()].reduce((s, d) => s + d.sessions.size, 0);

  return [1, 2, 3, 4, 5, 6, 0].map(i => ({
    dayOfWeek: DOW_NAMES[i],
    sessionCount: dowMap.get(i)!.sessions.size,
    pageViews: dowMap.get(i)!.pageViews,
    activeUserCount: dowMap.get(i)!.users.size,
    percentOfTotalUsage: total > 0 ? Math.round((dowMap.get(i)!.sessions.size / total) * 1000) / 10 : 0,
  }));
}, [filteredEvents, sessionFirstEvents, timeBasis, districtTzMap]);

  const todHourData = useMemo(() => {
    const hourMap = new Map<number, { sessions: Set<string>; pageViews: number; users: Set<string> }>();
    for (let h = 0; h < 24; h++) hourMap.set(h, { sessions: new Set(), pageViews: 0, users: new Set() });

    sessionFirstEvents.forEach(e => {
      const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
      const h = getLocalHour(e.timestamp, tz);
      hourMap.get(h)!.sessions.add(e.sessionId);
      hourMap.get(h)!.users.add(e.userId);
    });

    filteredEvents.forEach(e => {
      if (e.eventType !== 'PAGE_VIEWED') return;
      const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
      const h = getLocalHour(e.timestamp, tz);
      hourMap.get(h)!.pageViews++;
    });

    return Array.from({ length: 24 }, (_, h) => {
      const d = hourMap.get(h)!;
      const tod = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
      const label = h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
      return {
        hour: h, label, tod,
        sessions: d.sessions.size,
        pageViews: d.pageViews,
        activeUsers: d.users.size,
        count: todCountMode === 'sessions' ? d.sessions.size : d.pageViews,
      };
    });
  }, [sessionFirstEvents, filteredEvents, timeBasis, districtTzMap, todCountMode]);

  const todSummaryData = useMemo(() => {
    const groups = {
      morning: { sessions: new Set<string>(), pageViews: 0, users: new Set<string>(), timeRange: '12am – 11am' },
      afternoon: { sessions: new Set<string>(), pageViews: 0, users: new Set<string>(), timeRange: '12pm – 4pm' },
      evening: { sessions: new Set<string>(), pageViews: 0, users: new Set<string>(), timeRange: '5pm – 11pm' },
    };

    sessionFirstEvents.forEach(e => {
      const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
      const tod = getTimeOfDay(e.timestamp, tz);
      groups[tod].sessions.add(e.sessionId);
      groups[tod].users.add(e.userId);
    });

    filteredEvents.forEach(e => {
      if (e.eventType !== 'PAGE_VIEWED') return;
      const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
      const tod = getTimeOfDay(e.timestamp, tz);
      groups[tod].pageViews++;
    });

    const totalSessions = Object.values(groups).reduce((s, g) => s + g.sessions.size, 0);
    const totalPageViews = Object.values(groups).reduce((s, g) => s + g.pageViews, 0);
    const total = todCountMode === 'sessions' ? totalSessions : totalPageViews;

    return (['morning', 'afternoon', 'evening'] as const).map(tod => {
      const g = groups[tod];
      const count = todCountMode === 'sessions' ? g.sessions.size : g.pageViews;
      const bucket = tod.charAt(0).toUpperCase() + tod.slice(1);
      return {
        bucket, tod,
        timeRange: g.timeRange,
        sessions: g.sessions.size,
        pageViews: g.pageViews,
        activeUsers: g.users.size,
        count,
        percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      };
    });
  }, [sessionFirstEvents, filteredEvents, timeBasis, districtTzMap, todCountMode]);

  const canGoPrev = dataMonths.length > 0 && currentMonthStr > dataMonths[0];
  const canGoNext = dataMonths.length > 0 && currentMonthStr < dataMonths[dataMonths.length - 1];

  return (
    <div className="space-y-5">

      {/* Calendar Heat Map */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button
            onClick={() => setCalExpanded(e => !e)}
            className="flex-1 text-left flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Calendar size={16} className="text-teal-500" />
            <span className="text-sm font-semibold text-slate-700">Daily Usage Calendar</span>
            <span className="ml-1 text-[11px] text-gray-400">Usage intensity by calendar day</span>
          </button>

          <div className="flex items-center gap-2">
            
            {/* Month navigation */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setCurrentMonthStr(s => shiftMonth(s, -1))}
                disabled={!canGoPrev}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} className="text-slate-600" />
              </button>
              <span className="text-xs font-semibold text-slate-700 tabular-nums w-28 text-center">
                {formatMonthLabel(currentMonthStr)}
              </span>
              <button
                onClick={() => setCurrentMonthStr(s => shiftMonth(s, 1))}
                disabled={!canGoNext}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} className="text-slate-600" />
              </button>
            </div>
            
            {/* Page Views / Sessions */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
              <button
                onClick={() => setCalendarCountMode('pageViews')}
                className={`px-2.5 py-1 transition-colors ${calendarCountMode === 'pageViews' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Page Views
              </button>
              <button
                onClick={() => setCalendarCountMode('sessions')}
                className={`px-2.5 py-1 transition-colors ${calendarCountMode === 'sessions' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Sessions
              </button>
            </div>

            {/* District Time / Server Time */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
              <button
                onClick={() => setTimeBasis('CustomerLocalTime')}
                className={`px-2.5 py-1 transition-colors ${timeBasis === 'CustomerLocalTime' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                District Time
              </button>
              <button
                onClick={() => setTimeBasis('ServerTime')}
                className={`px-2.5 py-1 transition-colors ${timeBasis === 'ServerTime' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Server Time
              </button>
            </div>

            <button onClick={() => setCalExpanded(e => !e)}>
              <CollapseChevron expanded={calExpanded} />
            </button>
          </div>
        </div>

        {calExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-3">
            {calendarGrid ? (
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start">
                <div>
                  <div className="grid grid-cols-7 gap-x-1 gap-y-0.5 mb-0.5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-[10px] font-bold text-gray-400 text-center uppercase">{d}</div>
                    ))}
                  </div>
                  {calendarGrid.weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-x-1 gap-y-0.5 mb-0.5">
                      {week.map(({ date, dayNum, data, isCurrentMonth }, di) => {
                        const primaryValue = data
                          ? (calendarCountMode === 'sessions' ? data.sessions : data.pageViews)
                          : 0;
                        const hasData = isCurrentMonth && primaryValue > 0;
                        const bgColor = !isCurrentMonth
                          ? '#f1f5f9'
                          : getHeatColor(primaryValue, calendarGrid.maxValue);
                        const isLight = !isCurrentMonth || primaryValue < calendarGrid.maxValue * 0.35;
                        const dayNumClass = isCurrentMonth
                          ? (isLight ? 'text-slate-400' : 'text-white/70')
                          : 'text-slate-300';
                        const valClass = isLight ? 'text-slate-700' : 'text-white';
                        const labelClass = isLight ? 'text-slate-500' : 'text-white/75';
                        const label = calendarCountMode === 'sessions' ? 'sessions' : 'views';
                        const tooltip = isCurrentMonth && data
                          ? `${date}\n${data.sessions} sessions\n${data.pageViews} page views\n${data.users} users`
                          : date;
                        return (
                          <div
                            key={di}
                            title={tooltip}
                            className="h-24 rounded-md relative p-2 cursor-default border border-white/20 hover:ring-2 hover:ring-teal-400 hover:ring-offset-1 transition-all"
                            style={{ backgroundColor: bgColor }}
                          >
                            <div className={`absolute top-2 left-2 text-[10px] font-semibold ${dayNumClass}`}>
                              {dayNum}
                            </div>
                            {hasData && (
                              <div className={`h-full flex flex-col items-center justify-center text-center ${valClass}`}>
                                {calendarCountMode === 'sessions' ? (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();

                                      const raw = dayDataMap.get(date);
                                      if (!raw) return;

                                      openSessionList(`${date} Sessions`, raw.sessions);
                                    }}
                                    className="text-lg font-bold leading-none hover:underline cursor-pointer"
                                  >
                                    {primaryValue}
                                  </button>
                                ) : (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();

                                      const events = getPageViewEventsForDate(date);
                                      onEventsClick(`${date} Page Views`, events);
                                    }}
                                    className="text-lg font-bold leading-none hover:underline cursor-pointer"
                                  >
                                    {primaryValue}
                                  </button>
                                )}
                                <div className={`text-[10px] font-semibold mt-1 ${labelClass}`}>{label}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] text-gray-400">Less</span>
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v, i) => (
                      <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: getHeatColor(v, 1) }} />
                    ))}
                    <span className="text-[10px] text-gray-400">More</span>
                  </div>
                </div>

                {monthSummary && (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-slate-700">Month Summary</h5>
                      <p className="text-[11px] text-gray-400">{formatMonthLabel(currentMonthStr)}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sessions</div>
                        <button
                          onClick={() => {
                            const sessionIds = new Set<string>();

                            const [year, month] = currentMonthStr.split('-').map(Number);
                            const firstDayMs = Date.UTC(year, month - 1, 1);
                            const lastDayMs = Date.UTC(year, month, 0);

                            for (let ms = firstDayMs; ms <= lastDayMs; ms += 86400000) {
                              const dateStr = new Date(ms).toISOString().slice(0, 10);
                              const d = dayDataMap.get(dateStr);
                              d?.sessions.forEach(id => sessionIds.add(id));
                            }

                            openSessionList(`${formatMonthLabel(currentMonthStr)} Sessions`, sessionIds);
                          }}
                          className="text-2xl font-bold text-slate-800 tabular-nums hover:text-teal-600 hover:underline cursor-pointer"
                        >
                          {monthSummary.totalSessions.toLocaleString()}
                        </button>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Views</div>
                        <div className="text-2xl font-bold text-slate-800 tabular-nums">
                          <button
  onClick={() => {
    const [year, month] = currentMonthStr.split('-').map(Number);
    const firstDayMs = Date.UTC(year, month - 1, 1);
    const lastDayMs = Date.UTC(year, month, 0);

    const events = filteredEvents.filter(e => {
      if (e.eventType !== 'PAGE_VIEWED') return false;

      const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
      const date = getLocalDate(e.timestamp, tz);
      const ms = Date.parse(`${date}T00:00:00Z`);

      return ms >= firstDayMs && ms <= lastDayMs;
    });

    onEventsClick(`${formatMonthLabel(currentMonthStr)} Page Views`, events);
  }}
  className="text-2xl font-bold text-slate-800 tabular-nums hover:text-teal-600 hover:underline cursor-pointer"
>
  {monthSummary.totalPageViews.toLocaleString()}
</button>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Users</div>
                        <div className="text-2xl font-bold text-slate-800 tabular-nums">
                          <button
  onClick={() => {
    const userIds = new Set<string>();

    const [year, month] = currentMonthStr.split('-').map(Number);
    const firstDayMs = Date.UTC(year, month - 1, 1);
    const lastDayMs = Date.UTC(year, month, 0);

    for (let ms = firstDayMs; ms <= lastDayMs; ms += 86400000) {
      const dateStr = new Date(ms).toISOString().slice(0, 10);
      const d = dayDataMap.get(dateStr);
      d?.users.forEach(id => userIds.add(id));
    }

    onUsersClick(`${formatMonthLabel(currentMonthStr)} Active Users`, getUsersForIds(userIds));
  }}
  className="text-2xl font-bold text-slate-800 tabular-nums hover:text-teal-600 hover:underline cursor-pointer"
>
  {monthSummary.activeUsers.toLocaleString()}
</button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Days</div>
                          <div className="text-lg font-bold text-slate-800 tabular-nums">
                            {monthSummary.activeDays}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg / Day</div>
                          <div className="text-lg font-bold text-slate-800 tabular-nums">
                            {monthSummary.averagePerActiveDay.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Peak Day</div>
                        <div className="text-sm font-semibold text-slate-700">
                          {monthSummary.peakDay && monthSummary.peakDay.value > 0
                            ? `${monthSummary.peakDay.date} · ${monthSummary.peakDay.value.toLocaleString()} ${calendarCountMode === 'sessions' ? 'sessions' : 'views'}`
                            : 'No activity'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No calendar data available.</p>
            )}
          </div>
        )}
      </div>

      {/* Day of Week Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setDowExpanded(e => !e)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-teal-500" />
            <h4 className="text-sm font-semibold text-gray-900">Day-of-Week Summary</h4>
            <span className="text-[11px] text-gray-400">
              {timeBasis === 'CustomerLocalTime' ? '· District local time' : '· Server time (UTC)'}
            </span>
          </div>
          <CollapseChevron expanded={dowExpanded} />
        </button>
        {dowExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dowData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="dayOfWeek" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={d => d.slice(0, 3)} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="sessionCount" name="Sessions" radius={[4, 4, 0, 0]}>
                    {dowData.map((_, i) => <Cell key={i} fill={DOW_COLORS[i % DOW_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="overflow-x-auto pl-4">
                <table className="w-full text-sm text-left table-fixed">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 pl-6 text-[11px] font-bold text-gray-400 uppercase tracking-wide w-28">
                        Day
                      </th>
                      <th className="pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right w-20">
                        Sessions
                      </th>
                      <th className="pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right w-24">
                        Page Views
                      </th>
                      <th className="pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right w-20">
                        Users
                      </th>
                      <th className="pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right w-16">
                        %
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {dowData.map(d => (
                      <tr key={d.dayOfWeek}>
                        <td className="py-1.5 pl-6 font-medium text-slate-700">
                          {d.dayOfWeek}
                        </td>

                        <td className="py-1.5 text-right pr-1">
                          <button
                            onClick={() => {
                              const dayIndex = DOW_NAMES.indexOf(d.dayOfWeek);
                              const sessionIds = new Set<string>();

                              sessionFirstEvents.forEach(e => {
                                const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
                                const dow = getLocalDow(e.timestamp, tz);

                                if (dow === dayIndex) {
                                  sessionIds.add(e.sessionId);
                                }
                              });

                              openSessionList(`${d.dayOfWeek} Sessions`, sessionIds);
                            }}
                            className="text-slate-500 font-semibold tabular-nums hover:text-teal-600 hover:underline cursor-pointer"
                          >
                            {d.sessionCount}
                          </button>
                        </td>

                        <td className="py-1.5 text-right pr-1">
                          <button
                            onClick={() => {
                              const dayIndex = DOW_NAMES.indexOf(d.dayOfWeek);

                              const events = filteredEvents.filter(e => {
                                if (e.eventType !== 'PAGE_VIEWED') return false;

                                const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
                                return getLocalDow(e.timestamp, tz) === dayIndex;
                              });

                              onEventsClick(`${d.dayOfWeek} Page Views`, events);
                            }}
                            className="text-slate-500 font-semibold tabular-nums hover:text-teal-600 hover:underline cursor-pointer"
                          >
                            {d.pageViews}
                          </button>
                        </td>

                        <td className="py-1.5 text-right pr-1">
                          <button
                            onClick={() => {
                              const dayIndex = DOW_NAMES.indexOf(d.dayOfWeek);
                              const userIds = new Set<string>();

                              filteredEvents.forEach(e => {
                                const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
                                if (getLocalDow(e.timestamp, tz) === dayIndex) {
                                  userIds.add(e.userId);
                                }
                              });

                              onUsersClick(`${d.dayOfWeek} Active Users`, getUsersForIds(userIds));
                            }}
                            className="text-slate-500 font-semibold tabular-nums hover:text-teal-600 hover:underline cursor-pointer"
                          >
                            {d.activeUserCount}
                          </button>
                        </td>

                        <td className="py-1.5 text-right text-slate-500 font-semibold tabular-nums pr-1">
                          {d.percentOfTotalUsage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time of Day Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button
            onClick={() => setTodExpanded(e => !e)}
            className="flex-1 text-left flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Clock size={16} className="text-teal-500" />
            <h4 className="text-sm font-semibold text-gray-900">Time-of-Day Breakdown</h4>
            <span className="text-[11px] text-gray-400">
              · {todCountMode === 'sessions' ? 'Measures login time' : 'Measures page views'}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
              <button
                onClick={() => setTodCountMode('sessions')}
                className={`px-2.5 py-1 transition-colors ${todCountMode === 'sessions' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Sessions
              </button>
              <button
                onClick={() => setTodCountMode('pageViews')}
                className={`px-2.5 py-1 transition-colors ${todCountMode === 'pageViews' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Page Views
              </button>
            </div>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
              <button
                onClick={() => setTimeBasis('CustomerLocalTime')}
                className={`px-2.5 py-1 transition-colors ${timeBasis === 'CustomerLocalTime' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                District Time
              </button>
              <button
                onClick={() => setTimeBasis('ServerTime')}
                className={`px-2.5 py-1 transition-colors ${timeBasis === 'ServerTime' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Server Time
              </button>
            </div>
            <button onClick={() => setTodExpanded(e => !e)}>
              <CollapseChevron expanded={todExpanded} />
            </button>
          </div>
        </div>
        {todExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-3 space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={todHourData} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <ReferenceArea x1="12a" x2="11a" fill="#ede9fe" fillOpacity={0.5}
                  label={{ value: 'Morning', position: 'insideBottomLeft', fontSize: 10, fill: '#7c3aed', fontWeight: 700 }} />
                <ReferenceArea x1="12p" x2="4p" fill="#d1fae5" fillOpacity={0.5}
                  label={{ value: 'Afternoon', position: 'insideBottomLeft', fontSize: 10, fill: '#059669', fontWeight: 700 }} />
                <ReferenceArea x1="5p" x2="11p" fill="#fef3c7" fillOpacity={0.5}
                  label={{ value: 'Evening', position: 'insideBottomLeft', fontSize: 10, fill: '#d97706', fontWeight: 700 }} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value) => [value, todCountMode === 'sessions' ? 'Sessions' : 'Page Views']}
                  labelFormatter={(label) => `Hour: ${label}`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {todHourData.map((d, i) => <Cell key={i} fill={TOD_HOUR_COLORS[d.tod]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3">
              {todSummaryData.map(g => (
                <div key={g.bucket} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: TOD_HOUR_COLORS[g.tod] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-slate-700">{g.bucket}</span>
                      <span className="text-sm font-bold text-teal-600 tabular-nums">{g.percent}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{g.timeRange}</p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {todCountMode === 'sessions' ? (
                        <>
                          <button
                            onClick={() => {
                              const sessionIds = new Set<string>();

                              sessionFirstEvents.forEach(e => {
                                const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
                                const tod = getTimeOfDay(e.timestamp, tz);

                                if (tod === g.tod) {
                                  sessionIds.add(e.sessionId);
                                }
                              });

                              openSessionList(`${g.bucket} Sessions`, sessionIds);
                            }}
                            className="font-semibold hover:text-teal-600 hover:underline cursor-pointer"
                          >
                            {g.sessions} sessions
                          </button>
                          {' · '}
                          <button
                            onClick={() => {
                              const userIds = new Set<string>();

                              filteredEvents.forEach(e => {
                                const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
                                const tod = getTimeOfDay(e.timestamp, tz);

                                if (tod === g.tod) userIds.add(e.userId);
                              });

                              onUsersClick(`${g.bucket} Active Users`, getUsersForIds(userIds));
                            }}
                            className="font-semibold hover:text-teal-600 hover:underline cursor-pointer"
                          >
                            {g.activeUsers} users
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              const events = filteredEvents.filter(e => {
                                if (e.eventType !== 'PAGE_VIEWED') return false;

                                const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
                                return getTimeOfDay(e.timestamp, tz) === g.tod;
                              });

                              onEventsClick(`${g.bucket} Page Views`, events);
                            }}
                            className="font-semibold hover:text-teal-600 hover:underline cursor-pointer"
                          >
                            {g.pageViews} views
                          </button>
                          {' · '}
                          <button
                            onClick={() => {
                              const userIds = new Set<string>();

                              filteredEvents.forEach(e => {
                                const tz = timeBasis === 'CustomerLocalTime' ? districtTzMap[e.districtId] : undefined;
                                const tod = getTimeOfDay(e.timestamp, tz);

                                if (tod === g.tod) userIds.add(e.userId);
                              });

                              onUsersClick(`${g.bucket} Active Users`, getUsersForIds(userIds));
                            }}
                            className="font-semibold hover:text-teal-600 hover:underline cursor-pointer"
                          >
                            {g.activeUsers} users
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <AppSessionListDrawer
        sessions={sessionDrill?.sessions ?? []}
        title={sessionDrill?.title ?? 'Sessions'}
        isOpen={sessionDrill !== null}
        onClose={() => setSessionDrill(null)}
        onSessionClick={onSessionClick}
      />
    </div>
  );
};

export default AppTimingPanel;