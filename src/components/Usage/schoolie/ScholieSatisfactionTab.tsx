import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import ReportsPieChart from '../reports/ReportsPieChart';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import {
  SchoolieUsageFilters,
  SchoolieDistrictStatRow,
  SchoolieSessionStatRow,
  SchoolieUserStatRow,
  ScholieSatisfactionStats,
} from '../../../types/schoolieUsageTypes';
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
  TOPIC_COLORS, TOPIC_TAILWIND, TAB_COLORS, USAGE_ICONS,
} from '../common/usageHelpers';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import SchoolieUserDetailDrawer from './SchoolieUserDetailDrawer';
import SchoolieDistrictDetailDrawer from './SchoolieDistrictDetailDrawer';
import SchoolieFeedbackGrid from './SchoolieFeedbackGrid';
import SchoolieFeedbackDetail from './SchoolieFeedbackDetail';
import SchoolieFeedbackListDrawer from './SchoolieFeedbackListDrawer';

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
  const [bySourceExpanded, setBySourceExpanded] = useState(true);
  const [posReasonsExpanded, setPosReasonsExpanded] = useState(true);
  const [negReasonsExpanded, setNegReasonsExpanded] = useState(true);
  const [byDistrictExpanded, setByDistrictExpanded] = useState(true);
  const [trendGrouping, setTrendGrouping] = useState<Grouping>('daily');
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SchoolieUserStatRow | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedFeedbackRecord, setSelectedFeedbackRecord] = useState<FeedbackRecord | null>(null);
  const [isFeedbackDetailOpen, setIsFeedbackDetailOpen] = useState(false);
  const [feedbackListRecords, setFeedbackListRecords] = useState<FeedbackRecord[]>([]);
  const [feedbackListTitle, setFeedbackListTitle] = useState('');
  const [isFeedbackListOpen, setIsFeedbackListOpen] = useState(false);

  const openFeedbackList = (records: FeedbackRecord[], title: string) => {
    setFeedbackListRecords(records);
    setFeedbackListTitle(title);
    setIsFeedbackListOpen(true);
  };

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
    <div className="space-y-5">

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
                <ClickableCard onClick={() => openFeedbackList(feedbackRecords.filter(r => r.feedbackValue === 'thumbs_up'), 'Positive Feedback')}>
                  <FeedbackKPICard label="Positive Feedback" value={`${posRate}%`} icon={<ThumbsUp size={20} />} colorClass="bg-emerald-50 text-emerald-600" />
                </ClickableCard>
                <ClickableCard onClick={() => openFeedbackList(feedbackRecords.filter(r => r.feedbackValue === 'thumbs_down'), 'Negative Feedback')}>
                  <FeedbackKPICard label="Negative Feedback" value={`${negRate}%`} icon={<ThumbsDown size={20} />} colorClass={TOPIC_TAILWIND.Errors} />
                </ClickableCard>
                <ClickableCard onClick={() => openFeedbackList(feedbackRecords, 'All Feedback — Participation')}>
                  <FeedbackKPICard label="Participation Rate" value={`${participation}%`} icon={<MessageSquare size={20} />} colorClass="bg-slate-50 text-slate-600" />
                </ClickableCard>
                <ClickableCard onClick={() => openFeedbackList(feedbackRecords, 'All Feedback')}>
                  <FeedbackKPICard label="Total Feedback" value={satisfactionStats.totalFeedback.toLocaleString()} icon={<MessageSquare size={20} />} colorClass={TOPIC_TAILWIND.AI} />
                </ClickableCard>
                <ClickableCard onClick={() => openFeedbackList(feedbackRecords.filter(r => r.feedbackValue === 'thumbs_up'), 'Positive Feedback')}>
                  <FeedbackKPICard label="Positive Count" value={satisfactionStats.thumbsUpCount.toLocaleString()} icon={<ThumbsUp size={20} />} colorClass="bg-emerald-50 text-emerald-600" />
                </ClickableCard>
                <ClickableCard onClick={() => openFeedbackList(feedbackRecords.filter(r => r.feedbackValue === 'thumbs_down'), 'Negative Feedback')}>
                  <FeedbackKPICard label="Negative Count" value={satisfactionStats.thumbsDownCount.toLocaleString()} icon={<ThumbsDown size={20} />} colorClass={TOPIC_TAILWIND.Errors} />
                </ClickableCard>
              </div>
            )}
          </div>
        )}
      </div>

{/* Sentiment Trend + Participation + Feedback by Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Section 1: Sentiment Trend */}
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
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="thumbsUp" name="Positive" stroke={TOPIC_COLORS.Sessions} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="thumbsDown" name="Negative" stroke={TOPIC_COLORS.Errors} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Participation */}
        <ReportsPieChart
          data={participationData.map(d => ({ name: d.name, value: d.value }))}
          title="Feedback Participation"
          colors={participationData.map(d => d.color)}
          emptyMessage="No feedback recorded"
          icon={USAGE_ICONS.SchoolieFeedback} 
          primaryColor={TOPIC_COLORS.Feedback} 
        />

        {/* Section 3: Feedback by Surface */}
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
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={(v: any) => `${v}%`} />
                    <Bar dataKey="positive" name="Positive %" stackId="s" fill={TOPIC_COLORS.Sessions} />
                    <Bar dataKey="negative" name="Negative %" stackId="s" fill={TOPIC_COLORS.Errors} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Positive Reasons + Negative Reasons + Feedback by District */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Section 1: Positive Reasons */}
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

        {/* Section 2: Negative Reasons */}
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

        {/* Section 3: Feedback by District */}
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
                <div className="overflow-x-auto max-h-[250px] overflow-y-auto"> {/* Added max-height to keep row alignment clean */}
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">District</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">Satisf.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {byDistrict.slice(0, 5).map(d => {
                        const districtRow = districts.find(dr => dr.districtId === d.districtId);
                        return (
                          <tr key={d.districtId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2">
                              {districtRow ? (
                                <button onClick={() => { setSelectedDistrict(districtRow); setIsDistrictDetailOpen(true); }}
                                  className="text-xs font-medium text-slate-700 hover:text-violet-600 truncate max-w-[120px] block">
                                  {d.districtName}
                                </button>
                              ) : <span className="text-xs text-slate-700">{d.districtName}</span>}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <span className={`text-xs font-semibold ${d.satisfactionRate >= 0.8 ? 'text-emerald-600' : d.satisfactionRate >= 0.5 ? 'text-amber-600' : 'text-red-500'}`}>
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

      </div>

      {/* Feedback Activity Grid */}
      <SchoolieFeedbackGrid
        records={feedbackRecords}
        title="Recent Feedback"
        onUserClick={userId => {
          const user = users.find(u => u.userId === userId);
          if (user) { setSelectedUser(user); setIsUserDetailOpen(true); }
        }}
        onDistrictClick={districtId => {
          const district = districts.find(d => d.districtId === districtId);
          if (district) { setSelectedDistrict(district); setIsDistrictDetailOpen(true); }
        }}
        onFeedbackDetailClick={record => {
          setSelectedFeedbackRecord(record);
          setIsFeedbackDetailOpen(true);
        }}
      />

      <SchoolieFeedbackListDrawer
        records={feedbackListRecords}
        title={feedbackListTitle}
        isOpen={isFeedbackListOpen}
        onClose={() => setIsFeedbackListOpen(false)}
        zIndex={52}
        isTopmost={isFeedbackListOpen && !isDistrictDetailOpen && !isUserDetailOpen}
        onUserClick={userId => {
          const user = users.find(u => u.userId === userId);
          if (user) { setSelectedUser(user); setIsUserDetailOpen(true); }
        }}
        onDistrictClick={districtId => {
          const district = districts.find(d => d.districtId === districtId);
          if (district) { setSelectedDistrict(district); setIsDistrictDetailOpen(true); }
        }}
      />
      <SchoolieFeedbackDetail
        record={selectedFeedbackRecord}
        isOpen={isFeedbackDetailOpen}
        onClose={() => setIsFeedbackDetailOpen(false)}
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

export default ScholieSatisfactionTab;
