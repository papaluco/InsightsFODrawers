import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { ThumbsUp, ThumbsDown, Clock, AlertCircle, Zap, Users } from 'lucide-react';
import {
  SchoolieUsageFilters,
  SchoolieUsageSummary,
  SchoolieUserStatRow,
  SchoolieDistrictStatRow,
  SchoolieSessionStatRow,
  ScholieSatisfactionStats,
} from '../../../types/schoolieUsageTypes';
import { SchoolieUsageEvent, SCHOOLIE_USER_NAMES } from '../../../data/mockSchoolieUsageData';
import {
  getSchoolieUsageSummary,
  getSatisfactionStats,
  getSchoolieRawEvents,
  getSchoolieUserStats,
  getSchoolieDistrictStats,
  getSchoolieSessionStats,
} from '../../../services/schoolieUsageService';
import {
  TOPIC_COLORS, TOPIC_TAILWIND, TAB_COLORS, USAGE_ICONS, fmtDateTime, fmtDate,
} from '../common/usageHelpers';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import SchoolieUserListDrawer from './SchoolieUserListDrawer';
import SchoolieDistrictListDrawer from './SchoolieDistrictListDrawer';
import SchoolieDistrictDetailDrawer from './SchoolieDistrictDetailDrawer';
import SchoolieEventListDrawer from './SchoolieEventListDrawer';

interface Props {
  filters: SchoolieUsageFilters;
  onTabChange: (tab: string) => void;
}

type Grouping = 'daily' | 'weekly' | 'monthly';

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

const SURFACE_COLORS: Record<string, string> = {
  KpiDrawer:   TOPIC_COLORS.AI,
  Dashboard:   TOPIC_COLORS.Insights,
  UsageScreen: TOPIC_COLORS.Usage,
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  KPI_SCHOOLIE_OPENED:       TOPIC_COLORS.AI,
  DASHBOARD_SCHOOLIE_OPENED: TOPIC_COLORS.AI,
  AI_REQUEST_STARTED:        TOPIC_COLORS.Workspace,
  AI_RESPONSE_SUCCESS:       TOPIC_COLORS.Sessions,
  AI_RESPONSE_ERROR:         TOPIC_COLORS.Errors,
};

const EVENT_TYPE_SHORT: Record<string, string> = {
  KPI_SCHOOLIE_OPENED:       'KPI Opened',
  DASHBOARD_SCHOOLIE_OPENED: 'Dashboard Opened',
  AI_REQUEST_STARTED:        'Request Started',
  AI_RESPONSE_SUCCESS:       'Response Success',
  AI_RESPONSE_ERROR:         'Response Error',
};

type EventListTarget = { events: SchoolieUsageEvent[]; title: string };

const SchoolieOverviewTab: React.FC<Props> = ({ filters, onTabChange }) => {
  const [summary, setSummary] = useState<SchoolieUsageSummary | null>(null);
  const [satisfactionStats, setSatisfactionStats] = useState<ScholieSatisfactionStats | null>(null);
  const [rawEvents, setRawEvents] = useState<SchoolieUsageEvent[]>([]);
  const [users, setUsers] = useState<SchoolieUserStatRow[]>([]);
  const [districts, setDistricts] = useState<SchoolieDistrictStatRow[]>([]);
  const [sessions, setSessions] = useState<SchoolieSessionStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [kpiExpanded, setKpiExpanded] = useState(true);
  const [reqTrendExpanded, setReqTrendExpanded] = useState(true);
  const [userTrendExpanded, setUserTrendExpanded] = useState(true);
  const [surfaceExpanded, setSurfaceExpanded] = useState(true);
  const [topDistrictsExpanded, setTopDistrictsExpanded] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(true);

  const [reqGrouping, setReqGrouping] = useState<Grouping>('daily');
  const [userGrouping, setUserGrouping] = useState<Grouping>('daily');

  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [isDistrictListOpen, setIsDistrictListOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);
  const [eventListTarget, setEventListTarget] = useState<EventListTarget | null>(null);
  const [isEventListOpen, setIsEventListOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSchoolieUsageSummary(filters),
      getSatisfactionStats(filters),
      getSchoolieRawEvents(filters),
      getSchoolieUserStats(filters),
      getSchoolieDistrictStats(filters),
      getSchoolieSessionStats(filters),
    ]).then(([sum, sat, evts, usr, dist, sess]) => {
      setSummary(sum);
      setSatisfactionStats(sat);
      setRawEvents(evts);
      setUsers(usr);
      setDistricts(dist);
      setSessions(sess);
      setLoading(false);
    });
  }, [filters]);

  const openEventList = (events: SchoolieUsageEvent[], title: string) => {
    setEventListTarget({ events, title });
    setIsEventListOpen(true);
  };

  const requestEvents = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_REQUEST_STARTED'), [rawEvents]);
  const successEvents = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_RESPONSE_SUCCESS'), [rawEvents]);
  const errorEvents   = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_RESPONSE_ERROR'), [rawEvents]);

  const reqTrendData = useMemo(() => {
    const buckets = new Map<string, { requests: number; successes: number; errors: number }>();
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED' && e.eventType !== 'AI_RESPONSE_SUCCESS' && e.eventType !== 'AI_RESPONSE_ERROR') return;
      const key = formatKey(e.timestamp, reqGrouping);
      if (!buckets.has(key)) buckets.set(key, { requests: 0, successes: 0, errors: 0 });
      const b = buckets.get(key)!;
      if (e.eventType === 'AI_REQUEST_STARTED') b.requests++;
      if (e.eventType === 'AI_RESPONSE_SUCCESS') b.successes++;
      if (e.eventType === 'AI_RESPONSE_ERROR') b.errors++;
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, b]) => ({ label: formatLabel(key, reqGrouping), ...b }));
  }, [rawEvents, reqGrouping]);

  const userTrendData = useMemo(() => {
    const buckets = new Map<string, Set<string>>();
    rawEvents.forEach(e => {
      const key = formatKey(e.timestamp, userGrouping);
      if (!buckets.has(key)) buckets.set(key, new Set());
      buckets.get(key)!.add(e.userId);
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, s]) => ({ label: formatLabel(key, userGrouping), users: s.size }));
  }, [rawEvents, userGrouping]);

  const surfaceData = useMemo(() => {
    if (!summary) return [];
    return [
      { rawName: 'KpiDrawer',   label: 'KPI Drawer',   requests: summary.kpiInteractions },
      { rawName: 'Dashboard',   label: 'Dashboard',    requests: summary.dashboardInteractions },
      { rawName: 'UsageScreen', label: 'Usage Screen', requests: summary.usageScreenInteractions },
    ].filter(d => d.requests > 0);
  }, [summary]);

  const topDistricts = districts.slice(0, 5);
  const recentEvents = rawEvents.slice(0, 10);

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
          <span className="text-sm font-semibold text-slate-700">Schoolie Overview</span>
          <CollapseChevron expanded={kpiExpanded} />
        </button>
        {kpiExpanded && (
          <div className="border-t border-gray-100 px-5 py-4">
            {loading ? <Spinner /> : !summary ? (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <ClickableCard onClick={() => setIsDistrictListOpen(true)}>
                  <FeedbackKPICard label="Active Districts" value={summary.activeDistricts.toLocaleString()} icon={<USAGE_ICONS.District size={20} />} colorClass={TOPIC_TAILWIND.Districts} />
                </ClickableCard>
                <ClickableCard onClick={() => setIsUserListOpen(true)}>
                  <FeedbackKPICard label="Active Users" value={summary.activeUsers.toLocaleString()} icon={<Users size={20} />} colorClass={TOPIC_TAILWIND.Users} />
                </ClickableCard>
                <ClickableCard onClick={() => openEventList(requestEvents, 'AI Requests')}>
                  <FeedbackKPICard label="Total Requests" value={summary.totalRequests.toLocaleString()} icon={<Zap size={20} />} colorClass={TOPIC_TAILWIND.AI} />
                </ClickableCard>
                <ClickableCard onClick={() => onTabChange('satisfaction')}>
                  <FeedbackKPICard
                    label="Positive Feedback"
                    value={satisfactionStats ? `${Math.round(satisfactionStats.satisfactionRate * 100)}%` : '—'}
                    icon={<ThumbsUp size={20} />}
                    colorClass="bg-emerald-50 text-emerald-600"
                  />
                </ClickableCard>
                <ClickableCard onClick={() => openEventList(successEvents, 'Successful Responses')}>
                  <FeedbackKPICard
                    label="Avg Response Time"
                    value={summary.avgResponseTimeMs > 0 ? `${Math.round(summary.avgResponseTimeMs).toLocaleString()}ms` : '—'}
                    icon={<Clock size={20} />}
                    colorClass="bg-slate-50 text-slate-600"
                  />
                </ClickableCard>
                <ClickableCard onClick={() => openEventList(errorEvents, 'Failed Requests')}>
                  <FeedbackKPICard label="Failed Requests" value={summary.errorCount.toLocaleString()} icon={<AlertCircle size={20} />} colorClass={TOPIC_TAILWIND.Errors} />
                </ClickableCard>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trend Charts */}
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
                      <Line type="monotone" dataKey="requests" name="Requests"  stroke={TOPIC_COLORS.AI}      strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="successes" name="Successes" stroke={TOPIC_COLORS.Sessions} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="errors"   name="Errors"    stroke={TOPIC_COLORS.Errors}   strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => openEventList(rawEvents.filter(e => ['AI_REQUEST_STARTED', 'AI_RESPONSE_SUCCESS', 'AI_RESPONSE_ERROR'].includes(e.eventType)), 'All AI Events')}
                      className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">
                      View all events →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setUserTrendExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <Users size={16} style={{ color: TOPIC_COLORS.Users }} />
              <span className="text-sm font-semibold text-gray-900">Active Users Over Time</span>
            </button>
            <div className="flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
                <button key={g} onClick={() => setUserGrouping(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${userGrouping === g ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}>
                  {g}
                </button>
              ))}
              <button onClick={() => setUserTrendExpanded(e => !e)}><CollapseChevron expanded={userTrendExpanded} /></button>
            </div>
          </div>
          {userTrendExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-2">
              {loading ? <Spinner /> : userTrendData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No user data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={userTrendData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                      <Line type="monotone" dataKey="users" name="Active Users" stroke={TOPIC_COLORS.Users} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => setIsUserListOpen(true)} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">
                      View all users →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Usage by Surface */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => setSurfaceExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
            <USAGE_ICONS.Drawers size={16} style={{ color: TOPIC_COLORS.Drawers }} />
            <span className="text-sm font-semibold text-gray-900">Usage by Surface</span>
          </button>
          <button onClick={() => setSurfaceExpanded(e => !e)}><CollapseChevron expanded={surfaceExpanded} /></button>
        </div>
        {surfaceExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-2">
            {loading ? <Spinner /> : surfaceData.length === 0 ? (
              <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No surface data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={surfaceData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                  <Bar dataKey="requests" name="Requests" radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={(data: { rawName: string; label: string }) => openEventList(rawEvents.filter(e => e.sourceEntryPoint === data.rawName), `Events — ${data.label}`)}>
                    {surfaceData.map(entry => (
                      <Cell key={entry.rawName} fill={SURFACE_COLORS[entry.rawName] ?? TOPIC_COLORS.AI} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Top Districts + Feedback Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setTopDistrictsExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <USAGE_ICONS.District size={16} style={{ color: TAB_COLORS.Districts }} />
              <span className="text-sm font-semibold text-slate-700">Top Districts</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDistrictListOpen(true)} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View all</button>
              <button onClick={() => setTopDistrictsExpanded(e => !e)}><CollapseChevron expanded={topDistrictsExpanded} /></button>
            </div>
          </div>
          {topDistrictsExpanded && (
            <div className="border-t border-gray-100">
              {loading ? <Spinner /> : topDistricts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No district data</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">District</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Requests</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Success</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topDistricts.map(d => (
                      <tr key={d.districtId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5">
                          <button onClick={() => { setSelectedDistrict(d); setIsDistrictDetailOpen(true); }}
                            className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer text-left">
                            {d.districtName}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 text-right tabular-nums">{d.totalRequests}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 text-right tabular-nums">{Math.round(d.successRate * 100)}%</td>
                        <td className="px-4 py-2.5 text-sm text-slate-400 text-right">{d.lastActivity ? fmtDate(d.lastActivity) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setFeedbackExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <ThumbsUp size={16} style={{ color: TOPIC_COLORS.Sessions }} />
              <span className="text-sm font-semibold text-slate-700">Feedback Summary</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => onTabChange('satisfaction')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">Full report</button>
              <button onClick={() => setFeedbackExpanded(e => !e)}><CollapseChevron expanded={feedbackExpanded} /></button>
            </div>
          </div>
          {feedbackExpanded && (
            <div className="border-t border-gray-100 px-5 py-4">
              {loading || !satisfactionStats ? <Spinner /> : satisfactionStats.totalFeedback === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No feedback recorded</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{Math.round(satisfactionStats.satisfactionRate * 100)}%</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1"><ThumbsUp size={10} /> Positive</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-500">{100 - Math.round(satisfactionStats.satisfactionRate * 100)}%</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1"><ThumbsDown size={10} /> Negative</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-700">{satisfactionStats.totalFeedback}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.round(satisfactionStats.satisfactionRate * 100)}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap tabular-nums">
                      {satisfactionStats.thumbsUpCount} ↑ · {satisfactionStats.thumbsDownCount} ↓
                    </span>
                  </div>
                  {satisfactionStats.topReasonCodes.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Top Negative Reasons</p>
                      <div className="space-y-1">
                        {satisfactionStats.topReasonCodes.slice(0, 3).map(r => (
                          <div key={r.code} className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{r.code}</span>
                            <span className="text-xs text-gray-400 tabular-nums">{r.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setRecentExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Events size={16} style={{ color: TAB_COLORS.Events }} />
            <span className="text-sm font-semibold text-slate-700">Recent Activity</span>
            {!loading && recentEvents.length > 0 && <span className="text-[11px] text-gray-400">Last {recentEvents.length} events</span>}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => openEventList(rawEvents, 'All Events')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View all</button>
            <button onClick={() => setRecentExpanded(e => !e)}><CollapseChevron expanded={recentExpanded} /></button>
          </div>
        </div>
        {recentExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : recentEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Time</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">User</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Event</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentEvents.map((e, i) => (
                    <tr key={`${e.sessionId}-${i}`}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => openEventList(rawEvents, 'All Events')}>
                      <td className="px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap">{fmtDateTime(e.timestamp)}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-700 whitespace-nowrap">{SCHOOLIE_USER_NAMES[e.userId] ?? e.userId}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: EVENT_TYPE_COLORS[e.eventType] ?? TOPIC_COLORS.Events }} />
                          <span className="text-xs text-slate-600 whitespace-nowrap">{EVENT_TYPE_SHORT[e.eventType] ?? e.eventType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-500">{e.analysisIdentifier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <SchoolieUserListDrawer
        users={users}
        sessions={sessions}
        title="Active Users"
        isOpen={isUserListOpen}
        onClose={() => setIsUserListOpen(false)}
      />
      <SchoolieDistrictListDrawer
        districts={districts}
        sessions={sessions}
        title="Active Districts"
        isOpen={isDistrictListOpen}
        onClose={() => setIsDistrictListOpen(false)}
      />
      <SchoolieDistrictDetailDrawer
        district={selectedDistrict}
        sessions={sessions}
        isOpen={isDistrictDetailOpen}
        onClose={() => setIsDistrictDetailOpen(false)}
        zIndex={60}
        isTopmost={isDistrictDetailOpen}
      />
      <SchoolieEventListDrawer
        events={eventListTarget?.events ?? []}
        title={eventListTarget?.title ?? 'Events'}
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
        zIndex={52}
        isTopmost={isEventListOpen && !isDistrictDetailOpen}
      />
    </div>
  );
};

export default SchoolieOverviewTab;
