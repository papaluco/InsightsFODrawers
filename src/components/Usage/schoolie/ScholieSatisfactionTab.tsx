import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import {
  SchoolieUsageFilters,
  SchoolieDistrictStatRow,
  SchoolieSessionStatRow,
  SchoolieUserStatRow,
  ScholieSatisfactionStats,
} from '../../../types/schoolieUsageTypes';
import { SCHOOLIE_USER_NAMES, SCHOOLIE_DISTRICT_NAMES } from '../../../data/mockSchoolieUsageData';
import {
  getSatisfactionStats,
  getSchoolieSatisfactionTrend,
  getSchoolieSatisfactionByDistrict,
  getSchoolieSatisfactionBySource,
  getSchoolieFeedbackRecords,
  getSchoolieDistrictStats,
  getSchoolieSessionStats,
  getSchoolieUserStats,
  SchoolieFeedbackTrendPoint,
  SchoolieFeedbackDistrictRow,
  SchoolieFeedbackSourceRow,
} from '../../../services/schoolieUsageService';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import {
  TOPIC_COLORS, TOPIC_TAILWIND, TAB_COLORS, USAGE_ICONS, fmtDate, fmtDateTime,
} from '../common/usageHelpers';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import SchoolieUserDetailDrawer from './SchoolieUserDetailDrawer';
import SchoolieDistrictDetailDrawer from './SchoolieDistrictDetailDrawer';

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

const ScholieSatisfactionTab: React.FC<Props> = ({ filters }) => {
  const [satisfactionStats, setSatisfactionStats] = useState<ScholieSatisfactionStats | null>(null);
  const [trendData, setTrendData] = useState<SchoolieFeedbackTrendPoint[]>([]);
  const [byDistrict, setByDistrict] = useState<SchoolieFeedbackDistrictRow[]>([]);
  const [bySource, setBySource] = useState<SchoolieFeedbackSourceRow[]>([]);
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>([]);
  const [districts, setDistricts] = useState<SchoolieDistrictStatRow[]>([]);
  const [sessions, setSessions] = useState<SchoolieSessionStatRow[]>([]);
  const [users, setUsers] = useState<SchoolieUserStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [kpiExpanded, setKpiExpanded] = useState(true);
  const [trendExpanded, setTrendExpanded] = useState(true);
  const [participationExpanded, setParticipationExpanded] = useState(true);
  const [bySourceExpanded, setBySourceExpanded] = useState(true);
  const [posReasonsExpanded, setPosReasonsExpanded] = useState(true);
  const [negReasonsExpanded, setNegReasonsExpanded] = useState(true);
  const [byDistrictExpanded, setByDistrictExpanded] = useState(true);
  const [activityExpanded, setActivityExpanded] = useState(true);

  const [trendGrouping, setTrendGrouping] = useState<Grouping>('daily');
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SchoolieUserStatRow | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSatisfactionStats(filters),
      getSchoolieSatisfactionTrend(),
      getSchoolieSatisfactionByDistrict(),
      getSchoolieSatisfactionBySource(),
      getSchoolieFeedbackRecords(),
      getSchoolieDistrictStats(filters),
      getSchoolieSessionStats(filters),
      getSchoolieUserStats(filters),
    ]).then(([sat, trend, dist, src, recs, districts, sess, usr]) => {
      setSatisfactionStats(sat);
      setTrendData(trend);
      setByDistrict(dist);
      setBySource(src);
      setFeedbackRecords(recs);
      setDistricts(districts);
      setSessions(sess);
      setUsers(usr);
      setLoading(false);
    });
  }, [filters]);

  const groupedTrend = useMemo(() => {
    const buckets = new Map<string, { thumbsUp: number; thumbsDown: number }>();
    trendData.forEach(p => {
      const key = formatKey(p.key + 'T00:00:00Z', trendGrouping);
      if (!buckets.has(key)) buckets.set(key, { thumbsUp: 0, thumbsDown: 0 });
      const b = buckets.get(key)!;
      b.thumbsUp += p.thumbsUp;
      b.thumbsDown += p.thumbsDown;
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, b]) => ({
      label: formatLabel(key, trendGrouping), ...b,
    }));
  }, [trendData, trendGrouping]);

  const participationData = useMemo(() => {
    if (!satisfactionStats) return [];
    const withFeedback = satisfactionStats.totalFeedback;
    const total = Math.max(withFeedback, sessions.length);
    const noFeedback = Math.max(0, total - withFeedback);
    return [
      { name: 'With Feedback', value: withFeedback, color: TOPIC_COLORS.Sessions },
      { name: 'No Feedback', value: noFeedback, color: '#e5e7eb' },
    ];
  }, [satisfactionStats, sessions.length]);

  const Spinner = () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
    </div>
  );

  const posRate = satisfactionStats ? Math.round(satisfactionStats.satisfactionRate * 100) : 0;
  const negRate = satisfactionStats ? 100 - posRate : 0;
  const participation = sessions.length > 0 && satisfactionStats
    ? Math.round((satisfactionStats.totalFeedback / sessions.length) * 100)
    : 0;

  return (
    <div className="space-y-5 p-5">

      {/* KPI Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button onClick={() => setKpiExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <span className="text-sm font-semibold text-slate-700">Satisfaction Overview</span>
          <CollapseChevron expanded={kpiExpanded} />
        </button>
        {kpiExpanded && (
          <div className="border-t border-gray-100 px-5 py-4">
            {loading ? <Spinner /> : !satisfactionStats ? (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <FeedbackKPICard label="Positive Feedback" value={`${posRate}%`} icon={<ThumbsUp size={20} />} colorClass="bg-emerald-50 text-emerald-600" />
                <FeedbackKPICard label="Negative Feedback" value={`${negRate}%`} icon={<ThumbsDown size={20} />} colorClass={TOPIC_TAILWIND.Errors} />
                <FeedbackKPICard label="Participation Rate" value={`${participation}%`} icon={<MessageSquare size={20} />} colorClass="bg-slate-50 text-slate-600" />
                <FeedbackKPICard label="Total Feedback" value={satisfactionStats.totalFeedback.toLocaleString()} icon={<MessageSquare size={20} />} colorClass={TOPIC_TAILWIND.AI} />
                <FeedbackKPICard label="Positive Count" value={satisfactionStats.thumbsUpCount.toLocaleString()} icon={<ThumbsUp size={20} />} colorClass="bg-emerald-50 text-emerald-600" />
                <FeedbackKPICard label="Negative Count" value={satisfactionStats.thumbsDownCount.toLocaleString()} icon={<ThumbsDown size={20} />} colorClass={TOPIC_TAILWIND.Errors} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sentiment Trend + Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setTrendExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <USAGE_ICONS.Trends size={16} style={{ color: TOPIC_COLORS.AI }} />
              <span className="text-sm font-semibold text-gray-900">Feedback Sentiment Trend</span>
            </button>
            <div className="flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
                <button key={g} onClick={() => setTrendGrouping(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${trendGrouping === g ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}>
                  {g}
                </button>
              ))}
              <button onClick={() => setTrendExpanded(e => !e)}><CollapseChevron expanded={trendExpanded} /></button>
            </div>
          </div>
          {trendExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-2">
              {loading ? <Spinner /> : groupedTrend.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No feedback data</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={groupedTrend} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                    <Line type="monotone" dataKey="thumbsUp" name="Positive" stroke={TOPIC_COLORS.Sessions} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="thumbsDown" name="Negative" stroke={TOPIC_COLORS.Errors} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setParticipationExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <MessageSquare size={16} style={{ color: TOPIC_COLORS.Interactions }} />
              <span className="text-sm font-semibold text-gray-900">Feedback Participation</span>
            </button>
            <button onClick={() => setParticipationExpanded(e => !e)}><CollapseChevron expanded={participationExpanded} /></button>
          </div>
          {participationExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
              {loading || !satisfactionStats ? <Spinner /> : satisfactionStats.totalFeedback === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No feedback recorded</div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={participationData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                        {participationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-slate-700">{participation}%</p>
                      <p className="text-xs text-gray-400">participation rate</p>
                    </div>
                    <div className="space-y-1.5">
                      {participationData.map(d => (
                        <div key={d.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-xs text-gray-500">{d.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-600 tabular-nums">{d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback by Surface */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setBySourceExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Drawers size={16} style={{ color: TOPIC_COLORS.Drawers }} />
            <span className="text-sm font-semibold text-slate-700">Feedback by Surface</span>
          </button>
          <button onClick={() => setBySourceExpanded(e => !e)}><CollapseChevron expanded={bySourceExpanded} /></button>
        </div>
        {bySourceExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-2">
            {loading ? <Spinner /> : bySource.length === 0 ? (
              <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No surface data</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(160, bySource.length * 44)}>
                <BarChart data={bySource.map(s => ({ name: s.sourceEntryPoint, positive: Math.round(s.satisfactionRate * 100), negative: Math.round((1 - s.satisfactionRate) * 100), total: s.total }))}
                  layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="positive" name="Positive %" stackId="s" fill={TOPIC_COLORS.Sessions} />
                  <Bar dataKey="negative" name="Negative %" stackId="s" fill={TOPIC_COLORS.Errors} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Positive + Negative Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setPosReasonsExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <ThumbsUp size={16} style={{ color: TOPIC_COLORS.Sessions }} />
              <span className="text-sm font-semibold text-slate-700">Top Positive Reasons</span>
            </button>
            <button onClick={() => setPosReasonsExpanded(e => !e)}><CollapseChevron expanded={posReasonsExpanded} /></button>
          </div>
          {posReasonsExpanded && (
            <div className="border-t border-gray-100 px-5 py-10 flex flex-col items-center justify-center text-center">
              <ThumbsUp size={28} className="text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No positive reason codes available</p>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">Positive feedback is not accompanied by reason codes in the current data model.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setNegReasonsExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <ThumbsDown size={16} style={{ color: TOPIC_COLORS.Errors }} />
              <span className="text-sm font-semibold text-slate-700">Top Negative Reasons</span>
            </button>
            <button onClick={() => setNegReasonsExpanded(e => !e)}><CollapseChevron expanded={negReasonsExpanded} /></button>
          </div>
          {negReasonsExpanded && (
            <div className="border-t border-gray-100 px-5 py-4">
              {loading ? <Spinner /> : !satisfactionStats || satisfactionStats.topReasonCodes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No negative reason codes recorded</p>
              ) : (
                <div className="space-y-2.5">
                  {satisfactionStats.topReasonCodes.map(r => {
                    const pct = satisfactionStats.thumbsDownCount > 0
                      ? Math.round((r.count / satisfactionStats.thumbsDownCount) * 100)
                      : 0;
                    return (
                      <div key={r.code} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-600 flex-1">{r.code}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums w-10 text-right">{r.count} ({pct}%)</span>
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

      {/* Feedback by District */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setByDistrictExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.District size={16} style={{ color: TAB_COLORS.Districts }} />
            <span className="text-sm font-semibold text-slate-700">Feedback by District</span>
          </button>
          <button onClick={() => setByDistrictExpanded(e => !e)}><CollapseChevron expanded={byDistrictExpanded} /></button>
        </div>
        {byDistrictExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : byDistrict.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No district feedback data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">District</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Positive</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Negative</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {byDistrict.map(d => {
                      const districtRow = districts.find(dr => dr.districtId === d.districtId);
                      return (
                        <tr key={d.districtId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5">
                            {districtRow ? (
                              <button onClick={() => { setSelectedDistrict(districtRow); setIsDistrictDetailOpen(true); }}
                                className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer text-left">
                                {d.districtName}
                              </button>
                            ) : <span className="text-sm text-slate-700">{d.districtName}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-emerald-600 tabular-nums text-right">{d.thumbsUp}</td>
                          <td className="px-4 py-2.5 text-sm text-red-500 tabular-nums text-right">{d.thumbsDown}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums text-right">{d.total}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`text-sm font-semibold tabular-nums ${d.satisfactionRate >= 0.8 ? 'text-emerald-600' : d.satisfactionRate >= 0.5 ? 'text-amber-600' : 'text-red-500'}`}>
                              {Math.round(d.satisfactionRate * 100)}%
                            </span>
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

      {/* Feedback Activity Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setActivityExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.Events size={16} style={{ color: TAB_COLORS.Events }} />
            <span className="text-sm font-semibold text-slate-700">Recent Feedback</span>
            {!loading && feedbackRecords.length > 0 && <span className="text-[11px] text-gray-400">Last {feedbackRecords.length}</span>}
          </button>
          <button onClick={() => setActivityExpanded(e => !e)}><CollapseChevron expanded={activityExpanded} /></button>
        </div>
        {activityExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : feedbackRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No feedback records</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">District</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Surface</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Analysis</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Value</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reasons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {feedbackRecords.map(r => {
                      const user = users.find(u => u.userId === r.userId);
                      const district = districts.find(d => d.districtId === r.districtId);
                      return (
                        <tr key={r.feedbackId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
                          <td className="px-4 py-2.5 text-sm whitespace-nowrap">
                            {user ? (
                              <button onClick={() => { setSelectedUser(user); setIsUserDetailOpen(true); }}
                                className="font-medium text-slate-700 hover:text-violet-600 cursor-pointer">
                                {user.userName}
                              </button>
                            ) : <span className="text-slate-500">{SCHOOLIE_USER_NAMES[r.userId] ?? r.userId}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-sm whitespace-nowrap">
                            {district ? (
                              <button onClick={() => { setSelectedDistrict(district); setIsDistrictDetailOpen(true); }}
                                className="text-slate-500 hover:text-violet-600 cursor-pointer">
                                {district.districtName}
                              </button>
                            ) : <span className="text-slate-500">{SCHOOLIE_DISTRICT_NAMES[r.districtId] ?? r.districtId}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-500">{r.sourceEntryPoint}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500">{r.kpiIdentifier ?? r.analysisIdentifier ?? '—'}</td>
                          <td className="px-4 py-2.5">
                            {r.feedbackValue === 'thumbs_up'
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full"><ThumbsUp size={9} /> Positive</span>
                              : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[11px] font-semibold rounded-full"><ThumbsDown size={9} /> Negative</span>}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-400">{r.reasonCodes?.join(', ') ?? '—'}</td>
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

export default ScholieSatisfactionTab;
