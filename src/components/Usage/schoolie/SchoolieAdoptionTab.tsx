import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { Users, TrendingUp, Percent } from 'lucide-react';
import {
  SchoolieUsageFilters,
  SchoolieUsageSummary,
  SchoolieUserStatRow,
  SchoolieDistrictStatRow,
  SchoolieSessionStatRow,
  SchoolieEventStatRow,
} from '../../../types/schoolieUsageTypes';
import { SchoolieUsageEvent } from '../../../data/mockSchoolieUsageData';
import {
  getSchoolieUsageSummary,
  getSchoolieRawEvents,
  getSchoolieUserStats,
  getSchoolieDistrictStats,
  getSchoolieSessionStats,
  getSchoolieAdoptionStats,
  getSchoolieEventStats,
  SchoolieAdoptionStats,
} from '../../../services/schoolieUsageService';
import {
  TOPIC_COLORS, TOPIC_TAILWIND, TAB_COLORS, USAGE_ICONS, fmtDate,
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

const ANALYSIS_BAR_COLORS = [
  TOPIC_COLORS.AI,
  TOPIC_COLORS.Insights,
  TOPIC_COLORS.Usage,
  TOPIC_COLORS.Sessions,
  TOPIC_COLORS.Workspace,
  TOPIC_COLORS.Events,
];

const SchoolieAdoptionTab: React.FC<Props> = ({ filters }) => {
  const [summary, setSummary] = useState<SchoolieUsageSummary | null>(null);
  const [rawEvents, setRawEvents] = useState<SchoolieUsageEvent[]>([]);
  const [users, setUsers] = useState<SchoolieUserStatRow[]>([]);
  const [districts, setDistricts] = useState<SchoolieDistrictStatRow[]>([]);
  const [sessions, setSessions] = useState<SchoolieSessionStatRow[]>([]);
  const [adoptionStats, setAdoptionStats] = useState<SchoolieAdoptionStats | null>(null);
  const [eventStats, setEventStats] = useState<SchoolieEventStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [kpiExpanded, setKpiExpanded] = useState(true);
  const [userTrendExpanded, setUserTrendExpanded] = useState(true);
  const [newVsReturnExpanded, setNewVsReturnExpanded] = useState(true);
  const [districtGridExpanded, setDistrictGridExpanded] = useState(true);
  const [analysisExpanded, setAnalysisExpanded] = useState(true);
  const [topDistrictsExpanded, setTopDistrictsExpanded] = useState(true);
  const [userRoleExpanded, setUserRoleExpanded] = useState(true);

  const [userGrouping, setUserGrouping] = useState<Grouping>('daily');
  const [newReturnGrouping, setNewReturnGrouping] = useState<Grouping>('daily');
  const [districtSort, setDistrictSort] = useState<{ key: keyof SchoolieDistrictStatRow; dir: 'asc' | 'desc' }>({ key: 'totalRequests', dir: 'desc' });

  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [userListData, setUserListData] = useState<SchoolieUserStatRow[]>([]);
  const [userListTitle, setUserListTitle] = useState('Users');
  const [isDistrictListOpen, setIsDistrictListOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);
  const [eventListTarget, setEventListTarget] = useState<EventListTarget | null>(null);
  const [isEventListOpen, setIsEventListOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSchoolieUsageSummary(filters),
      getSchoolieRawEvents(filters),
      getSchoolieUserStats(filters),
      getSchoolieDistrictStats(filters),
      getSchoolieSessionStats(filters),
      getSchoolieAdoptionStats(filters),
      getSchoolieEventStats(filters),
    ]).then(([sum, evts, usr, dist, sess, adopt, evtStats]) => {
      setSummary(sum);
      setRawEvents(evts);
      setUsers(usr);
      setDistricts(dist);
      setSessions(sess);
      setAdoptionStats(adopt);
      setEventStats(evtStats);
      setLoading(false);
    });
  }, [filters]);

  const openUserList = (filteredUsers: SchoolieUserStatRow[], title: string) => {
    setUserListData(filteredUsers);
    setUserListTitle(title);
    setIsUserListOpen(true);
  };

  const openEventList = (events: SchoolieUsageEvent[], title: string) => {
    setEventListTarget({ events, title });
    setIsEventListOpen(true);
  };

  const newUsers = useMemo(() => {
    if (!adoptionStats) return [];
    const newSet = new Set(adoptionStats.newUserIds);
    return users.filter(u => newSet.has(u.userId));
  }, [users, adoptionStats]);

  const returningUsers = useMemo(() => {
    if (!adoptionStats) return [];
    const retSet = new Set(adoptionStats.returningUserIds);
    return users.filter(u => retSet.has(u.userId));
  }, [users, adoptionStats]);

  const userTrendData = useMemo(() => {
    const buckets = new Map<string, Set<string>>();
    rawEvents.forEach(e => {
      const key = formatKey(e.timestamp, userGrouping);
      if (!buckets.has(key)) buckets.set(key, new Set());
      buckets.get(key)!.add(e.userId);
    });
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, s]) => ({ label: formatLabel(key, userGrouping), users: s.size }));
  }, [rawEvents, userGrouping]);

  const newVsReturnData = useMemo(() => {
    if (!adoptionStats) return [];
    const newSet = new Set(adoptionStats.newUserIds);
    const retSet = new Set(adoptionStats.returningUserIds);
    const buckets = new Map<string, { newUsers: Set<string>; returningUsers: Set<string> }>();
    rawEvents.forEach(e => {
      const key = formatKey(e.timestamp, newReturnGrouping);
      if (!buckets.has(key)) buckets.set(key, { newUsers: new Set(), returningUsers: new Set() });
      const b = buckets.get(key)!;
      if (newSet.has(e.userId)) b.newUsers.add(e.userId);
      if (retSet.has(e.userId)) b.returningUsers.add(e.userId);
    });
    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, b]) => ({
        label: formatLabel(key, newReturnGrouping),
        new: b.newUsers.size,
        returning: b.returningUsers.size,
      }));
  }, [rawEvents, adoptionStats, newReturnGrouping]);

  const analysisData = useMemo(() => {
    const map = new Map<string, number>();
    eventStats.forEach(es => {
      map.set(es.analysisIdentifier, (map.get(es.analysisIdentifier) ?? 0) + es.totalRequests);
    });
    return [...map.entries()].map(([name, requests]) => ({ name, requests })).sort((a, b) => b.requests - a.requests);
  }, [eventStats]);

  const districtTopSurface = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    rawEvents.forEach(e => {
      if (e.eventType !== 'AI_REQUEST_STARTED') return;
      if (!map.has(e.districtId)) map.set(e.districtId, new Map());
      const sMap = map.get(e.districtId)!;
      sMap.set(e.sourceEntryPoint, (sMap.get(e.sourceEntryPoint) ?? 0) + 1);
    });
    const result = new Map<string, string>();
    map.forEach((sMap, districtId) => {
      const top = [...sMap.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top) result.set(districtId, top[0]);
    });
    return result;
  }, [rawEvents]);

  const sortedDistricts = useMemo(() => {
    return [...districts].sort((a, b) => {
      const av = a[districtSort.key];
      const bv = b[districtSort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
      return districtSort.dir === 'asc' ? cmp : -cmp;
    });
  }, [districts, districtSort]);

  const requestDistrictSort = (key: keyof SchoolieDistrictStatRow) => {
    setDistrictSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const growthColorClass = adoptionStats?.userGrowthPct === null || adoptionStats?.userGrowthPct === undefined
    ? 'bg-slate-50 text-slate-600'
    : adoptionStats.userGrowthPct >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600';

  const Spinner = () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* KPI Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button onClick={() => setKpiExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <span className="text-sm font-semibold text-slate-700">Adoption Overview</span>
          <CollapseChevron expanded={kpiExpanded} />
        </button>
        {kpiExpanded && (
          <div className="border-t border-gray-100 px-5 py-4">
            {loading ? <Spinner /> : !summary || !adoptionStats ? (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <ClickableCard onClick={() => setIsDistrictListOpen(true)}>
                  <FeedbackKPICard label="Active Districts" value={summary.activeDistricts.toLocaleString()} icon={<USAGE_ICONS.District size={20} />} colorClass={TOPIC_TAILWIND.Districts} />
                </ClickableCard>
                <ClickableCard onClick={() => openUserList(users, 'Active Users')}>
                  <FeedbackKPICard label="Active Users" value={summary.activeUsers.toLocaleString()} icon={<Users size={20} />} colorClass={TOPIC_TAILWIND.Users} />
                </ClickableCard>
                <ClickableCard onClick={() => openUserList(newUsers, 'New Users')}>
                  <FeedbackKPICard label="New Users" value={adoptionStats.newUserCount.toLocaleString()} icon={<Users size={20} />} colorClass="bg-emerald-50 text-emerald-600" />
                </ClickableCard>
                <ClickableCard onClick={() => openUserList(returningUsers, 'Returning Users')}>
                  <FeedbackKPICard label="Returning Users" value={adoptionStats.returningUserCount.toLocaleString()} icon={<Users size={20} />} colorClass="bg-sky-50 text-sky-600" />
                </ClickableCard>
                <FeedbackKPICard
                  label="District Adoption"
                  value={`${Math.round(adoptionStats.adoptionRate * 100)}%`}
                  icon={<Percent size={20} />}
                  colorClass="bg-violet-50 text-violet-600"
                />
                <FeedbackKPICard
                  label="User Growth"
                  value={adoptionStats.userGrowthPct !== null ? `${adoptionStats.userGrowthPct > 0 ? '+' : ''}${Math.round(adoptionStats.userGrowthPct)}%` : '—'}
                  icon={<TrendingUp size={20} />}
                  colorClass={growthColorClass}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Users Trend + New vs Returning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="users" name="Active Users" stroke={TOPIC_COLORS.Users} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => openUserList(users, 'Active Users')} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">
                      View all users →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setNewVsReturnExpanded(e => !e)} className="text-left flex-1 flex items-center gap-3">
              <TrendingUp size={16} style={{ color: TOPIC_COLORS.AI }} />
              <span className="text-sm font-semibold text-gray-900">New vs Returning Users</span>
            </button>
            <div className="flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
                <button key={g} onClick={() => setNewReturnGrouping(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${newReturnGrouping === g ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}>
                  {g}
                </button>
              ))}
              <button onClick={() => setNewVsReturnExpanded(e => !e)}><CollapseChevron expanded={newVsReturnExpanded} /></button>
            </div>
          </div>
          {newVsReturnExpanded && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-2">
              {loading ? <Spinner /> : newVsReturnData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No user data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={newVsReturnData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="new" name="New Users" stackId="a" fill="#10b981"
                        cursor="pointer" onClick={() => openUserList(newUsers, 'New Users')} />
                      <Bar dataKey="returning" name="Returning Users" stackId="a" fill={TOPIC_COLORS.AI} radius={[4, 4, 0, 0]}
                        cursor="pointer" onClick={() => openUserList(returningUsers, 'Returning Users')} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* District Adoption Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setDistrictGridExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
            <USAGE_ICONS.District size={16} style={{ color: TAB_COLORS.Districts }} />
            <span className="text-sm font-semibold text-slate-700">District Adoption</span>
            {!loading && adoptionStats && (
              <span className="text-[11px] text-gray-400 ml-1">
                {adoptionStats.activeDistricts} of {adoptionStats.totalDistrictsInStore} districts active
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDistrictListOpen(true)} className="text-xs text-violet-600 hover:underline font-medium cursor-pointer">View all</button>
            <button onClick={() => setDistrictGridExpanded(e => !e)}><CollapseChevron expanded={districtGridExpanded} /></button>
          </div>
        </div>
        {districtGridExpanded && (
          <div className="border-t border-gray-100">
            {loading ? <Spinner /> : sortedDistricts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No district data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      {([
                        { key: 'districtName' as const,  label: 'District' },
                        { key: 'activeUsers' as const,    label: 'Users' },
                        { key: 'totalRequests' as const,  label: 'Requests' },
                        { key: 'successRate' as const,    label: 'Success' },
                        { key: 'lastActivity' as const,   label: 'Last Active' },
                      ] as { key: keyof SchoolieDistrictStatRow; label: string }[]).map(col => (
                        <th key={col.key} onClick={() => requestDistrictSort(col.key)}
                          className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {col.label}
                            {districtSort.key === col.key && (
                              <span className="text-violet-500">{districtSort.dir === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Top Surface</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedDistricts.slice(0, 10).map(d => (
                      <tr key={d.districtId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5">
                          <button onClick={() => { setSelectedDistrict(d); setIsDistrictDetailOpen(true); }}
                            className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer text-left">
                            {d.districtName}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums">{d.activeUsers.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums">{d.totalRequests.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums">{Math.round(d.successRate * 100)}%</td>
                        <td className="px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap">{d.lastActivity ? fmtDate(d.lastActivity) : '—'}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{districtTopSurface.get(d.districtId) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
          <div className="border-t border-gray-100 px-5 pb-5 pt-2">
            {loading ? <Spinner /> : analysisData.length === 0 ? (
              <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No analysis data</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, analysisData.length * 36)}>
                <BarChart data={analysisData} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} labelStyle={{ fontWeight: 600 }} />
                  <Bar 
  dataKey="requests" 
  name="Requests" 
  radius={[0, 4, 4, 0]} 
  cursor="pointer"
  onClick={(data: any) => {
    if (data?.name) {
      openEventList(
        rawEvents.filter(e => e.analysisIdentifier === data.name),
        `Events — ${data.name}`
      );
    }
  }}
>
  {analysisData.map((entry, index) => (
    <Cell key={entry.name} fill={ANALYSIS_BAR_COLORS[index % ANALYSIS_BAR_COLORS.length]} />
  ))}
</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Top Districts + User Role */}
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
            <div className="border-t border-gray-100 px-5 py-4">
              {loading ? <Spinner /> : districts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No district data</p>
              ) : (
                <div className="space-y-3">
                  {districts.slice(0, 5).map((d, i) => (
                    <div key={d.districtId} className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-gray-300 w-5 text-right tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => { setSelectedDistrict(d); setIsDistrictDetailOpen(true); }}
                          className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer text-left truncate w-full block"
                        >
                          {d.districtName}
                        </button>
                        <p className="text-xs text-gray-400">{d.activeUsers} users · {d.totalRequests.toLocaleString()} reqs</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-700 tabular-nums">{Math.round(d.successRate * 100)}%</p>
                        <p className="text-[10px] text-gray-400">success</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => setUserRoleExpanded(e => !e)} className="flex-1 flex items-center gap-2.5">
              <Users size={16} style={{ color: TOPIC_COLORS.Users }} />
              <span className="text-sm font-semibold text-slate-700">Usage by User Role</span>
            </button>
            <button onClick={() => setUserRoleExpanded(e => !e)}><CollapseChevron expanded={userRoleExpanded} /></button>
          </div>
          {userRoleExpanded && (
            <div className="border-t border-gray-100 px-5 py-10 flex flex-col items-center justify-center text-center">
              <Users size={28} className="text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No role data available</p>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">User role information is not captured in the current data model.</p>
            </div>
          )}
        </div>
      </div>

      <SchoolieUserListDrawer
        users={userListData}
        sessions={sessions}
        title={userListTitle}
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

export default SchoolieAdoptionTab;
