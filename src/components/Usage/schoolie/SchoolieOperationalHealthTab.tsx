import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { AlertCircle, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import {
  SchoolieUsageFilters,
  SchoolieUsageSummary,
  SchoolieUserStatRow,
  SchoolieDistrictStatRow,
  SchoolieSessionStatRow,
  SchoolieEventStatRow,
  SchoolieOperationalStats,
} from '../../../types/schoolieUsageTypes';
import { SchoolieUsageEvent } from '../../../data/mockSchoolieUsageData';
import {
  getSchoolieUsageSummary,
  getSchoolieRawEvents,
  getSchoolieUserStats,
  getSchoolieDistrictStats,
  getSchoolieSessionStats,
  getSchoolieEventStats,
  getSchoolieOperationalStats,
} from '../../../services/schoolieUsageService';
import {
  TOPIC_COLORS, TOPIC_TAILWIND, USAGE_ICONS,
} from '../common/usageHelpers';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import SchoolieUserDetailDrawer from './SchoolieUserDetailDrawer';
import SchoolieDistrictDetailDrawer from './SchoolieDistrictDetailDrawer';
import SchoolieEventListDrawer from './SchoolieEventListDrawer';
import SchoolieEventGrid from './SchoolieEventGrid';

interface Props {
  filters: SchoolieUsageFilters;
  onTabChange: (tab: string) => void;
}

type Grouping = 'daily' | 'weekly' | 'monthly';
type EventListTarget = { events: SchoolieUsageEvent[]; title: string };

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

function failureRateColor(rate: number): string {
  if (rate < 0.05) return 'bg-emerald-50 text-emerald-600';
  if (rate < 0.10) return 'bg-amber-50 text-amber-600';
  return 'bg-red-50 text-red-600';
}

const SchoolieOperationalHealthTab: React.FC<Props> = ({ filters }) => {
  const [summary, setSummary] = useState<SchoolieUsageSummary | null>(null);
  const [operationalStats, setOperationalStats] = useState<SchoolieOperationalStats | null>(null);
  const [rawEvents, setRawEvents] = useState<SchoolieUsageEvent[]>([]);
  const [users, setUsers] = useState<SchoolieUserStatRow[]>([]);
  const [districts, setDistricts] = useState<SchoolieDistrictStatRow[]>([]);
  const [sessions, setSessions] = useState<SchoolieSessionStatRow[]>([]);
  const [eventStats, setEventStats] = useState<SchoolieEventStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [kpiExpanded, setKpiExpanded] = useState(true);
  const [reqTrendExpanded, setReqTrendExpanded] = useState(true);
  const [respTimeTrendExpanded, setRespTimeTrendExpanded] = useState(true);
  const [failureExpanded, setFailureExpanded] = useState(true);
  const [errorTypesExpanded, setErrorTypesExpanded] = useState(true);
  const [healthBySurfaceExpanded, setHealthBySurfaceExpanded] = useState(true);
  const [promptModelExpanded, setPromptModelExpanded] = useState(true);

  const [grouping, setGrouping] = useState<Grouping>('daily');

  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [eventListTarget, setEventListTarget] = useState<EventListTarget | null>(null);
  const [selectedUser, setSelectedUser] = useState<SchoolieUserStatRow | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSchoolieUsageSummary(filters),
      getSchoolieOperationalStats(filters),
      getSchoolieRawEvents(filters),
      getSchoolieUserStats(filters),
      getSchoolieDistrictStats(filters),
      getSchoolieSessionStats(filters),
      getSchoolieEventStats(filters),
    ]).then(([sum, ops, evts, usr, dist, sess, evtStats]) => {
      setSummary(sum);
      setOperationalStats(ops);
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

  const errorEvents   = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_RESPONSE_ERROR'), [rawEvents]);
  const successEvents = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_RESPONSE_SUCCESS'), [rawEvents]);
  const timeoutEvents = useMemo(() => rawEvents.filter(e => e.eventType === 'AI_RESPONSE_ERROR' && (e.responseTimeMs ?? 0) > 10000), [rawEvents]);
  const slowEvents    = useMemo(() => rawEvents.filter(e => (e.responseTimeMs ?? 0) > 4000 && (e.eventType === 'AI_RESPONSE_SUCCESS' || e.eventType === 'AI_RESPONSE_ERROR')), [rawEvents]);

  const reqTrendData = useMemo(() => {
    const buckets = new Map<string, { requests: number; errors: number }>();
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED' && e.eventType !== 'AI_RESPONSE_ERROR') return;
      const key = formatKey(e.timestamp, grouping);
      if (!buckets.has(key)) buckets.set(key, { requests: 0, errors: 0 });
      const b = buckets.get(key)!;
      if (e.eventType === 'AI_REQUEST_STARTED') b.requests++;
      if (e.eventType === 'AI_RESPONSE_ERROR') b.errors++;
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, b]) => ({ label: formatLabel(key, grouping), ...b }));
  }, [rawEvents, grouping]);

  const respTimeTrendData = useMemo(() => {
    const buckets = new Map<string, { total: number; count: number }>();
    rawEvents.forEach(e => {
      if (e.responseTimeMs == null) return;
      const key = formatKey(e.timestamp, grouping);
      if (!buckets.has(key)) buckets.set(key, { total: 0, count: 0 });
      const b = buckets.get(key)!;
      b.total += e.responseTimeMs;
      b.count++;
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, b]) => ({
      label: formatLabel(key, grouping),
      avgMs: b.count > 0 ? Math.round(b.total / b.count) : 0,
    }));
  }, [rawEvents, grouping]);

  const errorTrendData = useMemo(() => {
    const buckets = new Map<string, { errors: number; total: number }>();
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_RESPONSE_SUCCESS' && e.eventType !== 'AI_RESPONSE_ERROR') return;
      const key = formatKey(e.timestamp, grouping);
      if (!buckets.has(key)) buckets.set(key, { errors: 0, total: 0 });
      const b = buckets.get(key)!;
      if (e.eventType === 'AI_RESPONSE_ERROR') b.errors++;
      b.total++;
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, b]) => ({
      label: formatLabel(key, grouping),
      errors: b.errors,
      errorRate: b.total > 0 ? +(b.errors / b.total * 100).toFixed(1) : 0,
    }));
  }, [rawEvents, grouping]);

  const analysisTimeouts = useMemo(() => {
    const map = new Map<string, number>();
    rawEvents.forEach(e => {
      if (e.eventType === 'AI_RESPONSE_ERROR' && (e.responseTimeMs ?? 0) > 10000) {
        map.set(e.analysisIdentifier, (map.get(e.analysisIdentifier) ?? 0) + 1);
      }
    });
    return map;
  }, [rawEvents]);

  const promptModelData = useMemo(() => {
    const map = new Map<string, { requests: number; errors: number; times: number[] }>();
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED' && e.eventType !== 'AI_RESPONSE_SUCCESS' && e.eventType !== 'AI_RESPONSE_ERROR') return;
      const key = `Prompt v${e.promptVersion} / ${e.modelVersion}`;
      if (!map.has(key)) map.set(key, { requests: 0, errors: 0, times: [] });
      const b = map.get(key)!;
      if (e.eventType === 'AI_REQUEST_STARTED') b.requests++;
      if (e.eventType === 'AI_RESPONSE_ERROR') b.errors++;
      if (e.responseTimeMs != null) b.times.push(e.responseTimeMs);
    });
    return [...map.entries()].map(([key, b]) => ({
      key,
      requests: b.requests,
      failureRate: b.requests > 0 ? b.errors / b.requests : 0,
      avgResponseTimeMs: b.times.length > 0 ? Math.round(b.times.reduce((s, t) => s + t, 0) / b.times.length) : 0,
    })).sort((a, b) => b.requests - a.requests);
  }, [rawEvents]);

  const slowestRequests = useMemo(() =>
    rawEvents
      .filter(e => (e.eventType === 'AI_RESPONSE_SUCCESS' || e.eventType === 'AI_RESPONSE_ERROR') && e.responseTimeMs != null)
      .sort((a, b) => (b.responseTimeMs ?? 0) - (a.responseTimeMs ?? 0))
      .slice(0, 10),
    [rawEvents]);

  const Spinner = () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
    </div>
  );

  const failureRate = operationalStats?.errorRate ?? 0;
  const timeoutRate = summary && summary.totalRequests > 0 ? (operationalStats?.timeoutCount ?? 0) / summary.totalRequests : 0;

  return (
    <div className="space-y-5">

      {/* KPI Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button onClick={() => setKpiExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <span className="text-sm font-semibold text-slate-700">Operational Overview</span>
          <CollapseChevron expanded={kpiExpanded} />
        </button>
        {kpiExpanded && (
          <div className="border-t border-gray-100 px-5 py-4">
            {loading ? <Spinner /> : !summary || !operationalStats ? (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <ClickableCard onClick={() => openEventList(rawEvents.filter(e => e.eventType === 'AI_REQUEST_STARTED'), 'All Requests')}>
                  <FeedbackKPICard label="Total Requests" value={summary.totalRequests.toLocaleString()} icon={<Zap size={20} />} colorClass={TOPIC_TAILWIND.AI} />
                </ClickableCard>
                <ClickableCard onClick={() => openEventList(errorEvents, 'Failed Requests')}>
                  <FeedbackKPICard label="Failed Requests" value={operationalStats.totalErrors.toLocaleString()} icon={<XCircle size={20} />} colorClass={TOPIC_TAILWIND.Errors} />
                </ClickableCard>
                <FeedbackKPICard label="Failure Rate" value={`${Math.round(failureRate * 100)}%`} icon={<AlertCircle size={20} />} colorClass={failureRateColor(failureRate)} />
                <ClickableCard onClick={() => openEventList(successEvents, 'Successful Responses')}>
                  <FeedbackKPICard label="Avg Response Time" value={operationalStats.avgResponseTimeMs > 0 ? `${Math.round(operationalStats.avgResponseTimeMs).toLocaleString()}ms` : '—'} icon={<Clock size={20} />} colorClass="bg-slate-50 text-slate-600" />
                </ClickableCard>
                <ClickableCard onClick={() => openEventList(timeoutEvents, 'Timeout Errors')}>
                  <FeedbackKPICard label="Timeouts" value={operationalStats.timeoutCount.toLocaleString()} icon={<Clock size={20} />} colorClass={operationalStats.timeoutCount > 0 ? TOPIC_TAILWIND.Errors : 'bg-slate-50 text-slate-600'} />
                </ClickableCard>
                <ClickableCard onClick={() => openEventList(slowEvents, 'Slow Requests (> 4s)')}>
                  <FeedbackKPICard label="Slow Requests" value={slowEvents.length.toLocaleString()} icon={<Clock size={20} />} colorClass={slowEvents.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'} />
                </ClickableCard>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Volume + Response Time Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setReqTrendExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <USAGE_ICONS.Trends size={16} style={{ color: TOPIC_COLORS.AI }} />
              <span className="text-sm font-semibold text-gray-900">Request Volume</span>
            </button>
            <div className="flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
                <button key={g} onClick={() => setGrouping(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${grouping === g ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}>
                  {g}
                </button>
              ))}
              <button onClick={() => setReqTrendExpanded(e => !e)}><CollapseChevron expanded={reqTrendExpanded} /></button>
            </div>
          </div>
          {reqTrendExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-2">
              {loading ? <Spinner /> : reqTrendData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={reqTrendData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="requests" name="Requests" stroke={TOPIC_COLORS.AI} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="errors" name="Errors" stroke={TOPIC_COLORS.Errors} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => openEventList(rawEvents, 'All Events')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View all events →</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setRespTimeTrendExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <Clock size={16} style={{ color: TOPIC_COLORS.Interactions }} />
              <span className="text-sm font-semibold text-gray-900">Response Time Trend</span>
            </button>
            <button onClick={() => setRespTimeTrendExpanded(e => !e)}><CollapseChevron expanded={respTimeTrendExpanded} /></button>
          </div>
          {respTimeTrendExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-2">
              {loading ? <Spinner /> : respTimeTrendData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No response time data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={respTimeTrendData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit="ms" />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} formatter={(v: any) => [`${v?.toLocaleString()}ms`, 'Avg Response']} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={4000} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Slow threshold', position: 'right', fontSize: 9, fill: '#f59e0b' }} />
                      <Line type="monotone" dataKey="avgMs" name="Avg Response" stroke={TOPIC_COLORS.Interactions} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => openEventList(slowEvents, 'Slow Requests')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View slow requests →</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Failure Analytics + Error Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setFailureExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <USAGE_ICONS.Errors size={16} style={{ color: TOPIC_COLORS.Errors }} />
              <span className="text-sm font-semibold text-slate-700">Failure Analytics</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => openEventList(errorEvents, 'Failed Requests')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View errors</button>
              <button onClick={() => setFailureExpanded(e => !e)}><CollapseChevron expanded={failureExpanded} /></button>
            </div>
          </div>
          {failureExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
              {loading || !operationalStats ? <Spinner /> : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className={`text-2xl font-bold ${failureRateColor(failureRate).split(' ')[1]}`}>{Math.round(failureRate * 100)}%</p>
                      <p className="text-xs text-gray-400 mt-0.5">Failure Rate</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${timeoutRate > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{Math.round(timeoutRate * 100)}%</p>
                      <p className="text-xs text-gray-400 mt-0.5">Timeout Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-700">{operationalStats.totalErrors.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Total Errors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-700">{operationalStats.timeoutCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Timeouts</p>
                    </div>
                  </div>
                  {errorTrendData.length > 1 && (
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={errorTrendData} margin={{ top: 2, right: 4, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                        <Line type="monotone" dataKey="errors" name="Errors" stroke={TOPIC_COLORS.Errors} strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setErrorTypesExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <AlertCircle size={16} style={{ color: TOPIC_COLORS.Errors }} />
              <span className="text-sm font-semibold text-slate-700">Error Type Breakdown</span>
            </button>
            <button onClick={() => setErrorTypesExpanded(e => !e)}><CollapseChevron expanded={errorTypesExpanded} /></button>
          </div>
          {errorTypesExpanded && (
            <div className="border-t border-gray-100 px-5 py-4">
              {loading || !operationalStats ? <Spinner /> : operationalStats.errorsByType.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CheckCircle size={28} className="text-emerald-300 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No error type data</p>
                  <p className="text-xs text-gray-300 mt-1">No categorized errors recorded in this period.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {operationalStats.errorsByType.map(e => {
                    const pct = operationalStats.totalErrors > 0 ? Math.round(e.count / operationalStats.totalErrors * 100) : 0;
                    return (
                      <div key={e.errorMessage} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-600 flex-1 truncate" title={e.errorMessage}>{e.errorMessage}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums w-12 text-right">{e.count} ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Operational Health by Surface */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setHealthBySurfaceExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Drawers size={16} style={{ color: TOPIC_COLORS.AI }} />
            <span className="text-sm font-semibold text-slate-700">Operational Health by Analysis</span>
          </button>
          <button onClick={() => setHealthBySurfaceExpanded(e => !e)}><CollapseChevron expanded={healthBySurfaceExpanded} /></button>
        </div>
        {healthBySurfaceExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : eventStats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Analysis</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Requests</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Failure Rate</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Avg Response</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Timeouts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {eventStats.map(es => {
                      const fr = es.totalRequests > 0 ? es.errorCount / es.totalRequests : 0;
                      const timeouts = analysisTimeouts.get(es.analysisIdentifier) ?? 0;
                      return (
                        <tr key={es.analysisIdentifier} className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => openEventList(rawEvents.filter(e => e.analysisIdentifier === es.analysisIdentifier), `Events — ${es.analysisIdentifier}`)}>
                          <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{es.analysisIdentifier}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums text-right">{es.totalRequests.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`text-sm font-semibold tabular-nums ${fr < 0.05 ? 'text-emerald-600' : fr < 0.10 ? 'text-amber-600' : 'text-red-600'}`}>
                              {Math.round(fr * 100)}%
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums text-right">{Math.round(es.avgResponseTimeMs).toLocaleString()}ms</td>
                          <td className="px-4 py-2.5 text-sm tabular-nums text-right">
                            <span className={timeouts > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'}>{timeouts}</span>
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

      <SchoolieEventGrid
        events={slowestRequests}
        title="Slowest Requests"
        onUserClick={userId => {
          const user = users.find(u => u.userId === userId);
          if (user) { setSelectedUser(user); setIsUserDetailOpen(true); }
        }}
        onDistrictClick={districtId => {
          const district = districts.find(d => d.districtId === districtId);
          if (district) { setSelectedDistrict(district); setIsDistrictDetailOpen(true); }
        }}
        onEventTypeClick={eventType => openEventList(rawEvents.filter(e => e.eventType === eventType), eventType)}
        onAnalysisClick={analysis => openEventList(rawEvents.filter(e => e.analysisIdentifier === analysis), analysis)}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setPromptModelExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <USAGE_ICONS.KPI size={16} style={{ color: TOPIC_COLORS.AI }} />
              <span className="text-sm font-semibold text-slate-700">Prompt &amp; Model Versions</span>
            </button>
            <button onClick={() => setPromptModelExpanded(e => !e)}><CollapseChevron expanded={promptModelExpanded} /></button>
          </div>
          {promptModelExpanded && (
            <div className="border-t border-gray-100">
              {loading ? <Spinner /> : promptModelData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No version data</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Version</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Requests</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Failure</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Avg RT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {promptModelData.map(d => (
                      <tr key={d.key} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 text-sm font-medium text-slate-700 whitespace-nowrap">{d.key}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums text-right">{d.requests.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`text-sm font-semibold tabular-nums ${d.failureRate < 0.05 ? 'text-emerald-600' : d.failureRate < 0.10 ? 'text-amber-600' : 'text-red-600'}`}>
                            {Math.round(d.failureRate * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums text-right">{d.avgResponseTimeMs.toLocaleString()}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

      <SchoolieEventGrid
        events={rawEvents}
        title="Recent Events"
        onUserClick={userId => {
          const user = users.find(u => u.userId === userId);
          if (user) { setSelectedUser(user); setIsUserDetailOpen(true); }
        }}
        onDistrictClick={districtId => {
          const district = districts.find(d => d.districtId === districtId);
          if (district) { setSelectedDistrict(district); setIsDistrictDetailOpen(true); }
        }}
        onEventTypeClick={eventType => openEventList(rawEvents.filter(e => e.eventType === eventType), eventType)}
        onAnalysisClick={analysis => openEventList(rawEvents.filter(e => e.analysisIdentifier === analysis), analysis)}
      />

      <SchoolieEventListDrawer
        events={eventListTarget?.events ?? []}
        title={eventListTarget?.title ?? 'Events'}
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
        zIndex={52}
        isTopmost={isEventListOpen && !isUserDetailOpen && !isDistrictDetailOpen}
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

export default SchoolieOperationalHealthTab;
