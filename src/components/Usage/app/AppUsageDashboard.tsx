import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  AppUsageEvent,
  AppUsageFilters,
  AppUsageSummary,
  AppUserStatRow,
  AppDistrictStatRow,
  AppSessionStatRow,
  DEFAULT_APP_FILTERS,
} from '../../../types/appUsageTypes';
import {
  getAllAppEvents,
  getAppUsageSummary,
  getAppUserStats,
  getAppDistrictStats,
  getAppSessionStats,
} from '../../../services/appUsageService';
import { applyAppFilters, PAGE_COLORS, ENTRY_POINT_COLORS, ENTRY_POINT_LABELS, APP_CHART_COLORS } from './appUsageHelpers';
import AppUsageFiltersBar from './AppUsageFilters';
import AppUsageOverviewKPICards from './AppUsageOverviewKPICards';
import AppUsageOverviewChart from './AppUsageOverviewChart';
import AppSessionFreqChart from './AppSessionFreqChart';
import AppUserKPICards from './AppUserKPICards';
import AppUserGrid from './AppUserGrid';
import AppDistrictKPICards from './AppDistrictKPICards';
import AppDistrictGrid from './AppDistrictGrid';
import AppSessionKPICards from './AppSessionKPICards';
import AppSessionGrid from './AppSessionGrid';
import AppEventListDrawer from './AppEventListDrawer';
import AppSessionDetailDrawer from './AppSessionDetailDrawer';
import AppTimingPanel from './AppTimingPanel';
import AppFunnelPanel from './AppFunnelPanel';
import ReportsPieChart from '../reports/ReportsPieChart';
import AppUserListDrawer from './AppUserListDrawer';
import AppDistrictListDrawer from './AppDistrictListDrawer';
import AppSessionListDrawer from './AppSessionListDrawer';
import AppUserDetailDrawer from './AppUserDetailDrawer';
import AppDistrictDetailDrawer from './AppDistrictDetailDrawer';

type Tab = 'overview' | 'users' | 'districts' | 'sessions' | 'timing' | 'funnel';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'districts', label: 'Districts' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'timing', label: 'Timing' },
  { id: 'funnel', label: 'Funnel' },
];

interface EventDrill { events: AppUsageEvent[]; title: string; }

interface Props {
  onDataUpdate?: (payload: Record<string, unknown>) => void;
}

const AppUsageDashboard: React.FC<Props> = ({ onDataUpdate }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<AppUsageFilters>({ ...DEFAULT_APP_FILTERS });

  const [allEvents, setAllEvents] = useState<AppUsageEvent[]>([]);
  const [summary, setSummary] = useState<AppUsageSummary | null>(null);
  const [userStats, setUserStats] = useState<AppUserStatRow[]>([]);
  const [districtStats, setDistrictStats] = useState<AppDistrictStatRow[]>([]);
  const [sessionStats, setSessionStats] = useState<AppSessionStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [drill, setDrill] = useState<EventDrill | null>(null);
  const [selectedSession, setSelectedSession] = useState<AppSessionStatRow | null>(null);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);
  const [userDrill, setUserDrill] = useState<{ users: AppUserStatRow[]; title: string } | null>(null);
  const [districtDrill, setDistrictDrill] = useState<{ districts: AppDistrictStatRow[]; title: string } | null>(null);
  const [sessionDrill, setSessionDrill] = useState<{ sessions: AppSessionStatRow[]; title: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<AppUserStatRow | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<AppDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);

  // Tracks which drawers are open in order; last item = topmost = highest z-index.
  const [drawerStack, setDrawerStack] = useState<string[]>([]);

  useEffect(() => {
    getAllAppEvents().then(setAllEvents);
  }, []);

  const filteredEvents = useMemo(() => applyAppFilters(allEvents, filters), [allEvents, filters]);

  useEffect(() => {
    if (allEvents.length === 0) return;
    setLoading(true);
    Promise.all([
      getAppUsageSummary(filters),
      getAppUserStats(filters),
      getAppDistrictStats(filters),
      getAppSessionStats(filters),
    ]).then(([sum, us, ds, ss]) => {
      setSummary(sum);
      setUserStats(us);
      setDistrictStats(ds);
      setSessionStats(ss);
      setLoading(false);
    });
  }, [filters, allEvents]);

  const handleFiltersChange = useCallback((f: AppUsageFilters) => setFilters(f), []);

  // --- Chart data ---

  const pageUsageData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of filteredEvents) {
      if (e.eventType !== 'PAGE_VIEWED') continue;
      counts.set(e.page, (counts.get(e.page) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEvents]);

  const pageUsageColors = pageUsageData.map(d => PAGE_COLORS[d.name] ?? APP_CHART_COLORS[0]);

  const entryPointData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of filteredEvents) {
      if (e.eventType !== 'PAGE_VIEWED' || !e.context.entryPoint) continue;
      const label = ENTRY_POINT_LABELS[e.context.entryPoint] ?? e.context.entryPoint;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEvents]);

  const entryPointColors = entryPointData.map(d => {
    const key = Object.entries(ENTRY_POINT_LABELS).find(([, v]) => v === d.name)?.[0];
    return key ? (ENTRY_POINT_COLORS[key] ?? APP_CHART_COLORS[0]) : APP_CHART_COLORS[0];
  });

  const platformData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of filteredEvents) {
      const platform = e.platform || 'Unknown';
      counts.set(platform, (counts.get(platform) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEvents]);

  const platformColors = platformData.map((_, i) => APP_CHART_COLORS[i % APP_CHART_COLORS.length]);

  // --- Drawer stack helpers ---

  // Returns the z-index for the backdrop of a given drawer (panel = z + 1).
  const getZ = (id: string): number => {
    const idx = drawerStack.indexOf(id);
    return 60 + Math.max(0, idx) * 10;
  };

  const pushDrawer = (id: string) =>
    setDrawerStack(prev => [...prev.filter(i => i !== id), id]);

  const popDrawer = (id: string) =>
    setDrawerStack(prev => prev.filter(i => i !== id));

  // --- Open / close functions ---

  const openEventList = (d: EventDrill) => { setDrill(d); pushDrawer('event-list'); };
  const closeEventList = () => { setDrill(null); popDrawer('event-list'); };

  const openSessionDetail = (session: AppSessionStatRow) => {
    setSelectedSession(session);
    setIsSessionDetailOpen(true);
    pushDrawer('session-detail');
  };
  const closeSessionDetail = () => { setIsSessionDetailOpen(false); popDrawer('session-detail'); };

  const openUserDetail = (user: AppUserStatRow) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
    pushDrawer('user-detail');
  };
  const closeUserDetail = () => { setIsUserDetailOpen(false); popDrawer('user-detail'); };

  const openDistrictDetail = (district: AppDistrictStatRow) => {
    setSelectedDistrict(district);
    setIsDistrictDetailOpen(true);
    pushDrawer('district-detail');
  };
  const closeDistrictDetail = () => { setIsDistrictDetailOpen(false); popDrawer('district-detail'); };

  // --- Drill helpers ---

  const drillByPage = (pageName: string) =>
    openEventList({ events: filteredEvents.filter(e => e.page === pageName), title: `Events — ${pageName}` });

  const drillByEntryPoint = (label: string) => {
    const key = Object.entries(ENTRY_POINT_LABELS).find(([, v]) => v === label)?.[0];
    if (!key) return;
    openEventList({ events: filteredEvents.filter(e => e.context.entryPoint === key), title: `Entry Point — ${label}` });
  };

  const drillByPlatform = (platformName: string) =>
    openEventList({ events: filteredEvents.filter(e => e.platform === platformName), title: `Events — Platform: ${platformName}` });

  const drillByUser = (user: AppUserStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.userId === user.userId), title: `Events — ${user.userName}` });

  const drillToUsers = (title: string, users: AppUserStatRow[]) => setUserDrill({ title, users });
  const drillToDistricts = (title: string, districts: AppDistrictStatRow[]) => setDistrictDrill({ title, districts });
  const drillToSessions = (title: string, sessions: AppSessionStatRow[]) => setSessionDrill({ title, sessions });

  // --- Usage payload for Schoolie ---

  const usagePayload = useMemo(() => {
    if (!summary) return {};
    return {
      summary: { ...summary },
      pageUsage: pageUsageData.map(d => ({ page: d.name, views: d.value })),
      entryPoints: entryPointData.map(d => ({ entryPoint: d.name, sessions: d.value })),
      topUsers: [...userStats]
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10)
        .map(u => ({ userName: u.userName, sessions: u.sessions, eventCount: u.eventCount })),
      topDistricts: [...districtStats.filter(d => !d.hasNoActivity)]
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10)
        .map(d => ({ districtName: d.districtName, sessions: d.sessions, activeUsers: d.activeUsers })),
      totalEvents: filteredEvents.length,
    };
  }, [summary, pageUsageData, entryPointData, userStats, districtStats, filteredEvents]);

  const onDataUpdateRef = useRef(onDataUpdate);
  onDataUpdateRef.current = onDataUpdate;
  useEffect(() => {
    if (summary) onDataUpdateRef.current?.(usagePayload);
  }, [usagePayload, summary]);

  const topDrawer = drawerStack[drawerStack.length - 1] ?? null;

  if (loading && allEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AppUsageFiltersBar filters={filters} onChange={handleFiltersChange} allEvents={allEvents} />

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200 px-2 pt-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors -mb-px ${
                tab === t.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {summary && (
            <AppUsageOverviewKPICards
              summary={summary}
              onActiveUsersClick={() => drillToUsers('Active Users', userStats)}
              onActiveDistrictsClick={() => drillToDistricts('Active Districts', districtStats.filter(d => !d.hasNoActivity))}
              onSessionsClick={() => drillToSessions('Sessions', sessionStats)}
              onNewUsersClick={() => drillToUsers('New Users', userStats)}
            />
          )}
          <AppUsageOverviewChart events={filteredEvents} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ReportsPieChart
              data={pageUsageData}
              title="Page Usage Breakdown"
              colors={pageUsageColors}
              onSegmentClick={drillByPage}
              emptyMessage="No page view data available"
            />
            <ReportsPieChart
              data={entryPointData}
              title="Entry Point Breakdown"
              colors={entryPointColors}
              onSegmentClick={drillByEntryPoint}
              emptyMessage="No entry point data available"
            />
            <ReportsPieChart
              data={platformData}
              title="Platform Breakdown"
              colors={platformColors}
              onSegmentClick={drillByPlatform}
              emptyMessage="No platform data available"
            />
          </div>
          <AppSessionFreqChart events={filteredEvents} />
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-5">
          <AppUserKPICards
            data={userStats}
            onActiveUsersClick={() => drillToUsers('Active Users', userStats)}
            onNewUsersClick={() => drillToUsers('New Users', userStats.filter(u => u.isPowerUser === false && u.sessions <= 2))}
            onReturningUsersClick={() => drillToUsers('Returning Users', userStats.filter(u => u.sessions > 2))}
            onPowerUsersClick={() => drillToUsers('Power Users', userStats.filter(u => u.isPowerUser))}
            onAvgSessionsClick={() => drillToSessions('User Sessions', sessionStats)}
          />
          <AppUserGrid
            data={userStats}
            onUserClick={openUserDetail}
            onSessionsClick={user =>
              drillToSessions(
                `Sessions — ${user.userName}`,
                sessionStats.filter(s => s.userId === user.userId)
              )
            }
            onDistrictClick={user => {
              const district = districtStats.find(d => d.districtId === user.districtId);
              if (district) openDistrictDetail(district);
            }}
            onRowClick={drillByUser}
          />
        </div>
      )}

      {/* Districts tab */}
      {tab === 'districts' && (
        <div className="space-y-5">
          <AppDistrictKPICards
            data={districtStats}
            onActiveDistrictsClick={() => drillToDistricts('Active Districts', districtStats.filter(d => !d.hasNoActivity))}
            onNoActivityClick={() => drillToDistricts('Districts with No Activity', districtStats.filter(d => d.hasNoActivity))}
            onAvgUsersClick={() => drillToUsers('Users by District', userStats)}
            onAvgSessionsClick={() => drillToSessions('District Sessions', sessionStats)}
          />
          <AppDistrictGrid
            data={districtStats}
            onRowClick={openDistrictDetail}
            onUsersClick={district =>
              drillToUsers(
                `Users — ${district.districtName}`,
                userStats.filter(u => u.districtId === district.districtId)
              )
            }
            onSessionsClick={district =>
              drillToSessions(
                `Sessions — ${district.districtName}`,
                sessionStats.filter(s => s.districtId === district.districtId)
              )
            }
          />
        </div>
      )}

      {/* Sessions tab */}
      {tab === 'sessions' && (
        <div className="space-y-5">
          <AppSessionKPICards
            data={sessionStats}
            onTotalSessionsClick={() => drillToSessions('Total Sessions', sessionStats)}
            onSessionsPerUserClick={() => drillToSessions('Sessions by User', sessionStats)}
            onAppClosedClick={() => drillToSessions('Sessions with App Closed', sessionStats.filter(s => s.hasAppClosed))}
            onNoAppCloseClick={() => drillToSessions('Sessions without App Close', sessionStats.filter(s => !s.hasAppClosed))}
          />
          <AppSessionGrid
            data={sessionStats}
            onRowClick={openSessionDetail}
            onEventsClick={session =>
              openEventList({
                events: filteredEvents.filter(e => e.sessionId === session.sessionId),
                title: `Events — ${session.sessionId}`,
              })
            }
            onUserClick={session => {
              const user = userStats.find(u => u.userId === session.userId);
              if (user) openUserDetail(user);
            }}
            onDistrictClick={session => {
              const district = districtStats.find(d => d.districtId === session.districtId);
              if (district) openDistrictDetail(district);
            }}
          />
        </div>
      )}

      {/* Timing tab */}
      {tab === 'timing' && (
        <AppTimingPanel
          districtStats={districtStats}
          filteredEvents={filteredEvents}
          sessionStats={sessionStats}
          users={userStats}
          onSessionClick={openSessionDetail}
          onUsersClick={(title, users) => drillToUsers(title, users)}
          onEventsClick={(title, events) => openEventList({ title, events })}
        />
      )}

      {/* Funnel tab */}
      {tab === 'funnel' && (
        <AppFunnelPanel
          filters={filters}
          filteredEvents={filteredEvents}
          users={userStats}
          sessions={sessionStats}
          onUserClick={openUserDetail}
          onSessionClick={openSessionDetail}
        />
      )}

      {/* Event list drawer */}
      <AppEventListDrawer
        events={drill?.events ?? []}
        title={drill?.title ?? ''}
        isOpen={drill !== null}
        zIndex={getZ('event-list')}
        isTopmost={topDrawer === 'event-list'}
        onClose={closeEventList}
        users={userStats}
        sessions={sessionStats}
        onUserClick={openUserDetail}
        onSessionClick={openSessionDetail}
      />

      {/* Session list drawer */}
      <AppSessionListDrawer
        sessions={sessionDrill?.sessions ?? []}
        title={sessionDrill?.title ?? ''}
        isOpen={sessionDrill !== null}
        onClose={() => setSessionDrill(null)}
        isChildDrawerOpen={isSessionDetailOpen || isUserDetailOpen || isDistrictDetailOpen}
        onSessionClick={openSessionDetail}
        onEventsClick={session =>
          openEventList({
            events: filteredEvents.filter(e => e.sessionId === session.sessionId),
            title: `Events — ${session.sessionId}`,
          })
        }
        onUserClick={session => {
          const user = userStats.find(u => u.userId === session.userId);
          if (user) openUserDetail(user);
        }}
        onDistrictClick={session => {
          const district = districtStats.find(d => d.districtId === session.districtId);
          if (district) openDistrictDetail(district);
        }}
      />

      {/* Session detail drawer */}
      <AppSessionDetailDrawer
        session={selectedSession}
        isOpen={isSessionDetailOpen}
        zIndex={getZ('session-detail')}
        isTopmost={topDrawer === 'session-detail'}
        onClose={closeSessionDetail}
      />

      {/* User list drawer */}
      <AppUserListDrawer
        users={userDrill?.users ?? []}
        title={userDrill?.title ?? ''}
        isOpen={userDrill !== null}
        onClose={() => setUserDrill(null)}
        isChildDrawerOpen={isUserDetailOpen || isSessionDetailOpen}
        onUserClick={openUserDetail}
        onSessionsClick={user => {
          setUserDrill(null);
          drillToSessions(
            `Sessions — ${user.userName}`,
            sessionStats.filter(s => s.userId === user.userId)
          );
        }}
        onEventsClick={user => {
          setUserDrill(null);
          openEventList({
            events: filteredEvents.filter(e => e.userId === user.userId),
            title: `Events — ${user.userName}`,
          });
        }}
      />

      {/* District list drawer */}
      <AppDistrictListDrawer
        districts={districtDrill?.districts ?? []}
        title={districtDrill?.title ?? ''}
        isOpen={districtDrill !== null}
        onClose={() => setDistrictDrill(null)}
        isChildDrawerOpen={isDistrictDetailOpen}
        onDistrictClick={openDistrictDetail}
        onUsersClick={district => {
          setDistrictDrill(null);
          drillToUsers(
            `Users — ${district.districtName}`,
            userStats.filter(u => u.districtId === district.districtId)
          );
        }}
        onSessionsClick={district => {
          setDistrictDrill(null);
          drillToSessions(
            `Sessions — ${district.districtName}`,
            sessionStats.filter(s => s.districtId === district.districtId)
          );
        }}
      />

      {/* User detail drawer */}
      <AppUserDetailDrawer
        user={selectedUser}
        sessions={sessionStats}
        isOpen={isUserDetailOpen}
        zIndex={getZ('user-detail')}
        isTopmost={topDrawer === 'user-detail'}
        onClose={closeUserDetail}
        onSessionClick={openSessionDetail}
        onSessionEventsClick={session =>
          openEventList({
            events: filteredEvents.filter(e => e.sessionId === session.sessionId),
            title: `Events — ${session.sessionId}`,
          })
        }
        onSessionUserClick={session => {
          const user = userStats.find(u => u.userId === session.userId);
          if (user) openUserDetail(user);
        }}
        onSessionDistrictClick={session => {
          const district = districtStats.find(d => d.districtId === session.districtId);
          if (district) openDistrictDetail(district);
        }}
      />

      {/* District detail drawer */}
      <AppDistrictDetailDrawer
        district={selectedDistrict}
        sessions={sessionStats}
        isOpen={isDistrictDetailOpen}
        zIndex={getZ('district-detail')}
        isTopmost={topDrawer === 'district-detail'}
        onClose={closeDistrictDetail}
        onSessionClick={openSessionDetail}
      />
    </div>
  );
};

export default AppUsageDashboard;
