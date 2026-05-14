import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Users, Zap, Clock } from 'lucide-react';
import {
  SchoolieUsageFilters,
  SchoolieUsageSummary,
  SchoolieUserStatRow,
  SchoolieDistrictStatRow,
  SchoolieSessionStatRow,
  SchoolieEventStatRow,
} from '../../../types/schoolieUsageTypes';
import { SchoolieUsageEvent, SCHOOLIE_USER_NAMES, SCHOOLIE_DISTRICT_NAMES } from '../../../data/mockSchoolieUsageData';
import {
  getSchoolieUsageSummary,
  getSchoolieRawEvents,
  getSchoolieUserStats,
  getSchoolieDistrictStats,
  getSchoolieSessionStats,
  getSchoolieEventStats,
} from '../../../services/schoolieUsageService';
import {
  TOPIC_COLORS, TOPIC_TAILWIND, TAB_COLORS, USAGE_ICONS, fmtDateTime, fmtDate,
} from '../common/usageHelpers';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import SchoolieUserDetailDrawer from './SchoolieUserDetailDrawer';
import SchoolieDistrictDetailDrawer from './SchoolieDistrictDetailDrawer';
import SchoolieEventListDrawer from './SchoolieEventListDrawer';
import SchoolieSessionListDrawer from './SchoolieSessionListDrawer';

interface Props {
  filters: SchoolieUsageFilters;
  onTabChange: (tab: string) => void;
}

type Grouping = 'daily' | 'weekly' | 'monthly';
type EventListTarget = { events: SchoolieUsageEvent[]; title: string };
type DayTimeMode = 'hour' | 'day';

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatKey(ts: string, g: Grouping): string {
  const d = new Date(ts);
  if (g === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (g === 'weekly') {
    const w = new Date(d); w.setDate(w.getDate() - w.getDay());
    return w.toISOString().slice(0, 10);
  }
  return ts.slice(0, 10);
}

function formatLabel(key: string, g: Grouping): string {
  if (g === 'monthly') {
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  return new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const ClickableCard: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => {
  if (!onClick) return <>{children}</>;
  return (
    <button type="button" onClick={onClick} className="text-left w-full rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-200">
      {children}
    </button>
  );
};

const ANALYSIS_COLORS = [
  TOPIC_COLORS.AI, TOPIC_COLORS.Insights, TOPIC_COLORS.Usage,
  TOPIC_COLORS.Sessions, TOPIC_COLORS.Workspace, TOPIC_COLORS.Events,
];

const SchoolieEngagementTab: React.FC<Props> = ({ filters }) => {
  const [summary, setSummary] = useState<SchoolieUsageSummary | null>(null);
  const [rawEvents, setRawEvents] = useState<SchoolieUsageEvent[]>([]);
  const [users, setUsers] = useState<SchoolieUserStatRow[]>([]);
  const [districts, setDistricts] = useState<SchoolieDistrictStatRow[]>([]);
  const [sessions, setSessions] = useState<SchoolieSessionStatRow[]>([]);
  const [eventStats, setEventStats] = useState<SchoolieEventStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [kpiExpanded, setKpiExpanded] = useState(true);
  const [reqTrendExpanded, setReqTrendExpanded] = useState(true);
  const [sessionExpanded, setSessionExpanded] = useState(true);
  const [analysisExpanded, setAnalysisExpanded] = useState(true);
  const [dayTimeExpanded, setDayTimeExpanded] = useState(true);
  const [topUsersExpanded, setTopUsersExpanded] = useState(true);
  const [eventGridExpanded, setEventGridExpanded] = useState(true);

  const [reqGrouping, setReqGrouping] = useState<Grouping>('daily');
  const [dayTimeMode, setDayTimeMode] = useState<DayTimeMode>('hour');

  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [eventListTarget, setEventListTarget] = useState<EventListTarget | null>(null);
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SchoolieUserStatRow | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSchoolieUsageSummary(filters),
      getSchoolieRawEvents(filters),
      getSchoolieUserStats(filters),
      getSchoolieDistrictStats(filters),
      getSchoolieSessionStats(filters),
      getSchoolieEventStats(filters),
    ]).then(([sum, evts, usr, dist, sess, evtStats]) => {
      setSummary(sum);
      setRawEvents(evts);
      setUsers(usr);
      setDistricts(dist);
      setSessions(sess);
      setEventStats(evtStats);
      setLoading(false);
    });
  }, [filters]);

  const openEventList = (events: SchoolieUsageEvent[], title: string) => {
    setEventListTarget({ events, title });
    setIsEventListOpen(true);
  };

  const requestEvents = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_REQUEST_STARTED'), [rawEvents]);
  const successEvents = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_RESPONSE_SUCCESS'), [rawEvents]);

  const avgRequestsPerUser = summary && summary.activeUsers > 0
    ? (summary.totalRequests / summary.activeUsers).toFixed(1)
    : '—';
  const totalSessions = sessions.length;
  const avgSessionsPerUser = summary && summary.activeUsers > 0
    ? (totalSessions / summary.activeUsers).toFixed(1)
    : '—';
  const avgRequestsPerSession = totalSessions > 0 && summary
    ? (summary.totalRequests / totalSessions).toFixed(1)
    : '—';

  const reqTrendData = useMemo(() => {
    const buckets = new Map<string, number>();
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED') return;
      const key = formatKey(e.timestamp, reqGrouping);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, requests]) => ({ label: formatLabel(key, reqGrouping), requests }));
  }, [rawEvents, reqGrouping]);

  const sessionTrendData = useMemo(() => {
    const buckets = new Map<string, number>();
    sessions.forEach(s => {
      const key = s.requestedAt.slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, count]) => ({ sessions: count }));
  }, [sessions]);

  const analysisStats = useMemo(() => {
    const map = new Map<string, { requests: number; users: Set<string> }>();
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED') return;
      if (!map.has(e.analysisIdentifier)) map.set(e.analysisIdentifier, { requests: 0, users: new Set() });
      const b = map.get(e.analysisIdentifier)!;
      b.requests++;
      b.users.add(e.userId);
    });
    return [...map.entries()]
      .map(([name, b]) => ({ name, requests: b.requests, users: b.users.size }))
      .sort((a, b) => b.requests - a.requests);
  }, [rawEvents]);

  const hourData = useMemo(() => {
    const counts = new Array(24).fill(0);
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED') return;
      counts[new Date(e.timestamp).getHours()]++;
    });
    return counts.map((requests, hour) => ({ label: `${String(hour).padStart(2, '0')}:00`, requests }));
  }, [rawEvents]);

  const dayData = useMemo(() => {
    const counts = new Array(7).fill(0);
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED') return;
      counts[new Date(e.timestamp).getDay()]++;
    });
    return counts.map((requests, i) => ({ label: DOW_LABELS[i], requests }));
  }, [rawEvents]);

  const userSessionData = useMemo(() => {
    const sessionMap = new Map<string, number>();
    const surfaceMap = new Map<string, Map<string, number>>();
    sessions.forEach(s => {
      sessionMap.set(s.userId, (sessionMap.get(s.userId) ?? 0) + 1);
      if (!surfaceMap.has(s.userId)) surfaceMap.set(s.userId, new Map());
      const sm = surfaceMap.get(s.userId)!;
      sm.set(s.sourceEntryPoint, (sm.get(s.sourceEntryPoint) ?? 0) + 1);
    });
    return { sessionMap, surfaceMap };
  }, [sessions]);

  const recentEvents = rawEvents.slice(0, 20);

  const Spinner = () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-5 p-5">

      {/* KPI Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button onClick={() => setKpiExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <span className="text-sm font-semibold text-slate-700">Engagement Overview</span>
          <CollapseChevron expanded={kpiExpanded} />
        </button>
        {kpiExpanded && (
          <div className="border-t border-gray-100 px-5 py-4">
            {loading ? <Spinner /> : !summary ? (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <ClickableCard onClick={() => openEventList(requestEvents, 'AI Requests')}>
                  <FeedbackKPICard label="Total Requests" value={summary.totalRequests.toLocaleString()} icon={<Zap size={20} />} colorClass={TOPIC_TAILWIND.AI} />
                </ClickableCard>
                <FeedbackKPICard label="Avg Req / User" value={avgRequestsPerUser} icon={<Users size={20} />} colorClass="bg-slate-50 text-slate-600" />
                <ClickableCard onClick={() => setIsSessionListOpen(true)}>
                  <FeedbackKPICard label="Total Sessions" value={totalSessions.toLocaleString()} icon={<USAGE_ICONS.Sessions size={20} />} colorClass={TOPIC_TAILWIND.Sessions} />
                </ClickableCard>
                <FeedbackKPICard label="Avg Sessions / User" value={avgSessionsPerUser} icon={<Users size={20} />} colorClass="bg-slate-50 text-slate-600" />
                <ClickableCard onClick={() => openEventList(successEvents, 'Successful Responses')}>
                  <FeedbackKPICard label="Avg Response Time" value={summary.avgResponseTimeMs > 0 ? `${Math.round(summary.avgResponseTimeMs).toLocaleString()}ms` : '—'} icon={<Clock size={20} />} colorClass="bg-slate-50 text-slate-600" />
                </ClickableCard>
                <FeedbackKPICard label="Avg Req / Session" value={avgRequestsPerSession} icon={<Zap size={20} />} colorClass={TOPIC_TAILWIND.AI} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Requests Trend + Session Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setReqTrendExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <USAGE_ICONS.Trends size={16} style={{ color: TOPIC_COLORS.AI }} />
              <span className="text-sm font-semibold text-gray-900">Requests Over Time</span>
            </button>
            <div className="flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
                <button key={g} onClick={() => setReqGrouping(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${reqGrouping === g ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}>
                  {g}
                </button>
              ))}
              <button onClick={() => setReqTrendExpanded(e => !e)}><CollapseChevron expanded={reqTrendExpanded} /></button>
            </div>
          </div>
          {reqTrendExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-2">
              {loading ? <Spinner /> : reqTrendData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No request data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={reqTrendData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                      <Line type="monotone" dataKey="requests" name="Requests" stroke={TOPIC_COLORS.AI} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => openEventList(requestEvents, 'AI Requests')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View all events →</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setSessionExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <USAGE_ICONS.Sessions size={16} style={{ color: TOPIC_COLORS.Sessions }} />
              <span className="text-sm font-semibold text-gray-900">Session Activity</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSessionListOpen(true)} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View all</button>
              <button onClick={() => setSessionExpanded(e => !e)}><CollapseChevron expanded={sessionExpanded} /></button>
            </div>
          </div>
          {sessionExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
              {loading ? <Spinner /> : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-700">{totalSessions.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Total Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-700">{avgSessionsPerUser}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Avg / User</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-700">{avgRequestsPerSession}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Avg Req / Session</p>
                    </div>
                  </div>
                  {sessionTrendData.length > 1 && (
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={sessionTrendData} margin={{ top: 2, right: 4, left: -32, bottom: 0 }}>
                        <Line type="monotone" dataKey="sessions" stroke={TOPIC_COLORS.Sessions} strokeWidth={2} dot={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} labelFormatter={() => ''} formatter={(v: number) => [v, 'Sessions']} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Usage by Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setAnalysisExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Trends size={16} style={{ color: TOPIC_COLORS.AI }} />
            <span className="text-sm font-semibold text-slate-700">Usage by Analysis</span>
          </button>
          <button onClick={() => setAnalysisExpanded(e => !e)}><CollapseChevron expanded={analysisExpanded} /></button>
        </div>
        {analysisExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : analysisStats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No analysis data</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="px-5 pb-5 pt-2">
                  <ResponsiveContainer width="100%" height={Math.max(160, analysisStats.length * 36)}>
                    <BarChart data={analysisStats} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                      <Bar dataKey="requests" name="Requests" radius={[0, 4, 4, 0]} cursor="pointer"
                        onClick={(data: { name: string }) => openEventList(rawEvents.filter(e => e.analysisIdentifier === data.name), `Events — ${data.name}`)}>
                        {analysisStats.map((entry, i) => (
                          <Cell key={entry.name} fill={ANALYSIS_COLORS[i % ANALYSIS_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="border-t lg:border-t-0 lg:border-l border-gray-100">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Analysis</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Requests</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {analysisStats.map((a, i) => (
                        <tr key={a.name} className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => openEventList(rawEvents.filter(e => e.analysisIdentifier === a.name), `Events — ${a.name}`)}>
                          <td className="px-4 py-2.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ANALYSIS_COLORS[i % ANALYSIS_COLORS.length] }} />
                            <span className="text-sm font-medium text-slate-700">{a.name}</span>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 text-right tabular-nums">{a.requests.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 text-right tabular-nums">{a.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage by Day / Time */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setDayTimeExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Time size={16} style={{ color: TOPIC_COLORS.Interactions }} />
            <span className="text-sm font-semibold text-slate-700">Usage by Time</span>
          </button>
          <div className="flex items-center gap-2">
            {(['hour', 'day'] as DayTimeMode[]).map(m => (
              <button key={m} onClick={() => setDayTimeMode(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${dayTimeMode === m ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}>
                {m === 'hour' ? 'Hour of Day' : 'Day of Week'}
              </button>
            ))}
            <button onClick={() => setDayTimeExpanded(e => !e)}><CollapseChevron expanded={dayTimeExpanded} /></button>
          </div>
        </div>
        {dayTimeExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-2">
            {loading ? <Spinner /> : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dayTimeMode === 'hour' ? hourData : dayData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} interval={dayTimeMode === 'hour' ? 2 : 0} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                  <Bar dataKey="requests" name="Requests" fill={TOPIC_COLORS.AI} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setTopUsersExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Users size={16} style={{ color: TAB_COLORS.Users }} />
            <span className="text-sm font-semibold text-slate-700">Top Users</span>
          </button>
          <button onClick={() => setTopUsersExpanded(e => !e)}><CollapseChevron expanded={topUsersExpanded} /></button>
        </div>
        {topUsersExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : users.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No user data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Requests</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Sessions</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Surface</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.slice(0, 10).map(u => {
                      const topSurfaceEntry = [...(userSessionData.surfaceMap.get(u.userId) ?? new Map()).entries()].sort((a, b) => b[1] - a[1])[0];
                      return (
                        <tr key={u.userId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5">
                            <button onClick={() => { setSelectedUser(u); setIsUserDetailOpen(true); }}
                              className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer text-left">
                              {u.userName}
                            </button>
                            <p className="text-xs text-gray-400">{u.districtName}</p>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums text-right">{u.totalRequests.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums text-right">{userSessionData.sessionMap.get(u.userId) ?? 0}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500">{topSurfaceEntry?.[0] ?? '—'}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap">{fmtDate(u.lastActive)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Activity Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setEventGridExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Events size={16} style={{ color: TAB_COLORS.Events }} />
            <span className="text-sm font-semibold text-slate-700">Recent Activity</span>
            {!loading && recentEvents.length > 0 && <span className="text-[11px] text-gray-400">Last {recentEvents.length}</span>}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => openEventList(rawEvents, 'All Events')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View all</button>
            <button onClick={() => setEventGridExpanded(e => !e)}><CollapseChevron expanded={eventGridExpanded} /></button>
          </div>
        </div>
        {eventGridExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : recentEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No events</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">District</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Analysis</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentEvents.map((e, i) => {
                      const user = users.find(u => u.userId === e.userId);
                      const district = districts.find(d => d.districtId === e.districtId);
                      return (
                        <tr key={`${e.sessionId}-${i}`} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap">{fmtDateTime(e.timestamp)}</td>
                          <td className="px-4 py-2.5 text-sm whitespace-nowrap">
                            {user ? (
                              <button onClick={() => { setSelectedUser(user); setIsUserDetailOpen(true); }}
                                className="font-medium text-slate-700 hover:text-violet-600 cursor-pointer">
                                {user.userName}
                              </button>
                            ) : <span className="text-slate-500">{SCHOOLIE_USER_NAMES[e.userId] ?? e.userId}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-sm whitespace-nowrap">
                            {district ? (
                              <button onClick={() => { setSelectedDistrict(district); setIsDistrictDetailOpen(true); }}
                                className="text-slate-500 hover:text-violet-600 cursor-pointer">
                                {district.districtName}
                              </button>
                            ) : <span className="text-slate-500">{SCHOOLIE_DISTRICT_NAMES[e.districtId] ?? e.districtId}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-500">{e.analysisIdentifier}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 text-right tabular-nums">
                            {e.responseTimeMs != null ? `${e.responseTimeMs.toLocaleString()}ms` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <SchoolieEventListDrawer
        events={eventListTarget?.events ?? []}
        title={eventListTarget?.title ?? 'Events'}
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
        zIndex={52}
        isTopmost={isEventListOpen && !isUserDetailOpen && !isDistrictDetailOpen}
      />
      <SchoolieSessionListDrawer
        sessions={sessions}
        title="Sessions"
        isOpen={isSessionListOpen}
        onClose={() => setIsSessionListOpen(false)}
      />
      <SchoolieUserDetailDrawer
        user={selectedUser}
        sessions={sessions}
        isOpen={isUserDetailOpen}
        onClose={() => setIsUserDetailOpen(false)}
        zIndex={60}
        isTopmost={isUserDetailOpen}
      />
      <SchoolieDistrictDetailDrawer
        district={selectedDistrict}
        sessions={sessions}
        isOpen={isDistrictDetailOpen}
        onClose={() => setIsDistrictDetailOpen(false)}
        zIndex={60}
        isTopmost={isDistrictDetailOpen}
      />
    </div>
  );
};

export default SchoolieEngagementTab;
