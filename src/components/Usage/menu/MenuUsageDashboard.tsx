import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  MenuUsageEvent,
  MenuUsageFilters,
  MenuUsageSummary,
  MenuUserStatRow,
  MenuDistrictStatRow,
  MenuDrawerUsageStat,
  MenuMetricUsageStat,
  MenuFilterUsageStat,
  MenuSessionRow,
  DEFAULT_MENU_FILTERS,
  MENU_INTERACTION_TYPES,
} from '../../../types/menuUsageTypes';
import {
  getAllMenuEvents,
  getMenuUsageSummary,
  getMenuUserStats,
  getMenuDistrictStats,
  getMenuDrawerStats,
  getMenuMetricStats,
  getMenuFilterStats,
} from '../../../services/menuUsageService';
import { applyMenuFilters, deriveMenuSessions } from './menuUsageHelpers';
import { TAB_COLORS } from '../common/usageHelpers';
import MenuUsageFiltersBar from './MenuUsageFilters';
import MenuOverviewKPICards from './MenuOverviewKPICards';
import MenuDrawerUsageChart from './MenuDrawerUsageChart';
import MenuMetricUsageChart from './MenuMetricUsageChart';
import MenuFilterUsageChart from './MenuFilterUsageChart';
import MenuUsersGrid from './MenuUsersGrid';
import MenuDistrictsGrid from './MenuDistrictsGrid';
import MenuEventListDrawer from './MenuEventListDrawer';
import MenuUserDetailDrawer from './MenuUserDetailDrawer';
import MenuUserListDrawer from './MenuUserListDrawer';
import MenuDistrictDetailDrawer from './MenuDistrictDetailDrawer';
import MenuDistrictListDrawer from './MenuDistrictListDrawer';
import MenuSessionListDrawer from './MenuSessionListDrawer';
import MenuSessionDetailDrawer from './MenuSessionDetailDrawer';

type Tab = 'overview' | 'menuItems' | 'schoolPerf' | 'users' | 'districts';

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'overview',   label: 'Overview',           color: TAB_COLORS.Overview },
  { id: 'menuItems',  label: 'Menu Items',         color: TAB_COLORS.MenuAnalysis },
  { id: 'schoolPerf', label: 'School Performance', color: TAB_COLORS.SchoolPerformance },
  { id: 'users',      label: 'Users',              color: TAB_COLORS.Users },
  { id: 'districts',  label: 'Districts',          color: TAB_COLORS.Districts },
];

interface EventDrill { events: MenuUsageEvent[]; title: string; }

interface Props {
  onDataUpdate?: (payload: Record<string, unknown>) => void;
}

const MenuUsageDashboard: React.FC<Props> = ({ onDataUpdate }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<MenuUsageFilters>({ ...DEFAULT_MENU_FILTERS });

  const [allEvents, setAllEvents] = useState<MenuUsageEvent[]>([]);
  const [summary, setSummary] = useState<MenuUsageSummary | null>(null);
  const [userStats, setUserStats] = useState<MenuUserStatRow[]>([]);
  const [districtStats, setDistrictStats] = useState<MenuDistrictStatRow[]>([]);
  const [drawerStats, setDrawerStats] = useState<MenuDrawerUsageStat[]>([]);
  const [metricStats, setMetricStats] = useState<MenuMetricUsageStat[]>([]);
  const [filterStats, setFilterStats] = useState<MenuFilterUsageStat[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Event list drawer ──────────────────────────────────────────────────────
  const [drill, setDrill] = useState<EventDrill | null>(null);
  // ── User drawers ───────────────────────────────────────────────────────────
  const [userListDrill, setUserListDrill] = useState<{ users: MenuUserStatRow[]; title: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<MenuUserStatRow | null>(null);
  // ── District drawers ───────────────────────────────────────────────────────
  const [districtListDrill, setDistrictListDrill] = useState<{ districts: MenuDistrictStatRow[]; title: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<MenuDistrictStatRow | null>(null);
  // ── Session drawers ────────────────────────────────────────────────────────
  const [sessionListDrill, setSessionListDrill] = useState<{ sessions: MenuSessionRow[]; title: string } | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Drawer stack — determines z-index layering for detail/event drawers
  const [drawerStack, setDrawerStack] = useState<string[]>([]);
  const pushDrawer = (id: string) => setDrawerStack(prev => [...prev.filter(i => i !== id), id]);
  const popDrawer  = (id: string) => setDrawerStack(prev => prev.filter(i => i !== id));
  const getZ = (id: string): number => 60 + Math.max(0, drawerStack.indexOf(id)) * 10;
  const topDrawer = drawerStack[drawerStack.length - 1] ?? null;

  useEffect(() => { getAllMenuEvents().then(setAllEvents); }, []);

  const filteredEvents = useMemo(() => applyMenuFilters(allEvents, filters), [allEvents, filters]);

  useEffect(() => {
    if (allEvents.length === 0) return;
    setLoading(true);
    Promise.all([
      getMenuUsageSummary(filters),
      getMenuUserStats(filters),
      getMenuDistrictStats(filters),
      getMenuDrawerStats(filters),
      getMenuMetricStats(filters),
      getMenuFilterStats(filters),
    ]).then(([sum, us, ds, drs, ms, fs]) => {
      setSummary(sum);
      setUserStats(us);
      setDistrictStats(ds);
      setDrawerStats(drs);
      setMetricStats(ms);
      setFilterStats(fs);
      setLoading(false);
    });
  }, [filters, allEvents]);

  const handleFiltersChange = useCallback((f: MenuUsageFilters) => setFilters(f), []);

  // ── Event list helpers ─────────────────────────────────────────────────────
  const openEventList = (d: EventDrill) => { setDrill(d); pushDrawer('event-list'); };
  const closeEventList = () => { setDrill(null); popDrawer('event-list'); };

  // ── User helpers ───────────────────────────────────────────────────────────
  const openUserList = (users: MenuUserStatRow[], title: string) => {
    setUserListDrill({ users, title });
  };
  const closeUserList = () => {
    setUserListDrill(null);
    setSelectedUser(null);
    popDrawer('user-detail');
  };
  const openUserDetail = (user: MenuUserStatRow) => {
    setSelectedUser(user);
    pushDrawer('user-detail');
  };
  const closeUserDetail = () => {
    setSelectedUser(null);
    popDrawer('user-detail');
  };
  const openUserById = (userId: string) => {
    const user = userStats.find(u => u.userId === userId);
    if (user) openUserDetail(user);
  };

  // ── District helpers ───────────────────────────────────────────────────────
  const openDistrictList = (districts: MenuDistrictStatRow[], title: string) => {
    setDistrictListDrill({ districts, title });
  };
  const closeDistrictList = () => {
    setDistrictListDrill(null);
    setSelectedDistrict(null);
    popDrawer('district-detail');
  };
  const openDistrictDetail = (district: MenuDistrictStatRow) => {
    setSelectedDistrict(district);
    pushDrawer('district-detail');
  };
  const closeDistrictDetail = () => {
    setSelectedDistrict(null);
    popDrawer('district-detail');
  };
  const openDistrictById = (districtId: string) => {
    const district = districtStats.find(d => d.districtId === districtId);
    if (district) openDistrictDetail(district);
  };

  // ── Session helpers ────────────────────────────────────────────────────────
  const openSessionList = (events: MenuUsageEvent[], title: string) => {
    setSessionListDrill({ sessions: deriveMenuSessions(events), title });
  };
  const closeSessionList = () => {
    setSessionListDrill(null);
    setSelectedSessionId(null);
    popDrawer('session-detail');
  };
  const openSessionDetail = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    pushDrawer('session-detail');
  };
  const closeSessionDetail = () => {
    setSelectedSessionId(null);
    popDrawer('session-detail');
  };

  // ── Chart drill helpers ────────────────────────────────────────────────────
  const drillByDrawerType = (drawerType: string) =>
    openEventList({
      events: filteredEvents.filter(e =>
        (drawerType === 'Menu Items' && e.eventType === 'MENU_ITEMS_DRAWER_VIEWED') ||
        (drawerType === 'School Performance' && e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED')
      ),
      title: `Events — ${drawerType} Drawer`,
    });

  const drillByFilter = (stat: MenuFilterUsageStat) =>
    openEventList({
      events: filteredEvents.filter(e => e.eventType === stat.eventType),
      title: `Events — ${stat.filter}`,
    });

  // ── KPI drill helpers ──────────────────────────────────────────────────────
  const drillPageViews = () =>
    openEventList({ events: filteredEvents.filter(e => e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED'), title: 'Events — Page Views' });

  const drillInteractions = () =>
    openEventList({ events: filteredEvents.filter(e => MENU_INTERACTION_TYPES.includes(e.eventType)), title: 'Events — Interactions' });

  const drillMenuItems = () =>
    openEventList({ events: filteredEvents.filter(e => e.eventType === 'MENU_ITEMS_DRAWER_VIEWED'), title: 'Events — Menu Items Views' });

  const drillSchoolPerf = () =>
    openEventList({ events: filteredEvents.filter(e => e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED'), title: 'Events — School Performance Views' });

  // ── Per-user/district/session drills from grids ────────────────────────────
  const drillByUser = (user: MenuUserStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.userId === user.userId), title: `Events — ${user.userName}` });

  const drillByDistrict = (district: MenuDistrictStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.districtId === district.districtId), title: `Events — ${district.districtName}` });

  const drillUserSessions = (user: MenuUserStatRow) =>
    openSessionList(filteredEvents.filter(e => e.userId === user.userId), `Sessions — ${user.userName}`);

  const drillDistrictSessions = (district: MenuDistrictStatRow) =>
    openSessionList(filteredEvents.filter(e => e.districtId === district.districtId), `Sessions — ${district.districtName}`);

  const drillUserPageViews = (user: MenuUserStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.userId === user.userId && e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED'), title: `Page Views — ${user.userName}` });

  const drillUserInteractions = (user: MenuUserStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.userId === user.userId && MENU_INTERACTION_TYPES.includes(e.eventType)), title: `Interactions — ${user.userName}` });

  const drillUserMenuItems = (user: MenuUserStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.userId === user.userId && e.eventType === 'MENU_ITEMS_DRAWER_VIEWED'), title: `Menu Items Views — ${user.userName}` });

  const drillUserSchoolPerf = (user: MenuUserStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.userId === user.userId && e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED'), title: `School Perf. Views — ${user.userName}` });

  const drillDistrictPageViews = (district: MenuDistrictStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.districtId === district.districtId && e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED'), title: `Page Views — ${district.districtName}` });

  const drillDistrictInteractions = (district: MenuDistrictStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.districtId === district.districtId && MENU_INTERACTION_TYPES.includes(e.eventType)), title: `Interactions — ${district.districtName}` });

  const drillDistrictMenuItems = (district: MenuDistrictStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.districtId === district.districtId && e.eventType === 'MENU_ITEMS_DRAWER_VIEWED'), title: `Menu Items Views — ${district.districtName}` });

  const drillDistrictSchoolPerf = (district: MenuDistrictStatRow) =>
    openEventList({ events: filteredEvents.filter(e => e.districtId === district.districtId && e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED'), title: `School Perf. Views — ${district.districtName}` });

  // Schoolie payload
  const usagePayload = useMemo(() => {
    if (!summary) return {};
    return {
      summary: { ...summary },
      drawerUsage: drawerStats.map(d => ({ drawer: d.drawerType, count: d.count, percent: d.percent })),
      metricUsage: metricStats.map(m => ({ metric: m.metric, count: m.count, percent: m.percent })),
      filterUsage: filterStats.map(f => ({ filter: f.filter, count: f.count })),
      topUsers: [...userStats].slice(0, 10).map(u => ({ userName: u.userName, sessions: u.sessions, interactions: u.interactions })),
      topDistricts: districtStats.filter(d => !d.hasNoActivity).slice(0, 8).map(d => ({ districtName: d.districtName, sessions: d.sessions, activeUsers: d.activeUsers })),
      totalEvents: filteredEvents.length,
    };
  }, [summary, drawerStats, metricStats, filterStats, userStats, districtStats, filteredEvents]);

  const onDataUpdateRef = useRef(onDataUpdate);
  onDataUpdateRef.current = onDataUpdate;
  useEffect(() => { if (summary) onDataUpdateRef.current?.(usagePayload); }, [usagePayload, summary]);

  // ── Derived lists for tab views ────────────────────────────────────────────
  const menuItemsUsers = useMemo(() => userStats.filter(u => u.menuItemsDrawerViews > 0), [userStats]);
  const schoolPerfUsers = useMemo(() => userStats.filter(u => u.schoolPerformanceDrawerViews > 0), [userStats]);
  const allSessions = useMemo(() => deriveMenuSessions(filteredEvents), [filteredEvents]);

  // Flags for child-drawer-open suppression in list drawers
  const anyDetailOpen = selectedUser !== null || selectedDistrict !== null || selectedSessionId !== null || drill !== null;

  if (loading && allEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <MenuUsageFiltersBar filters={filters} onChange={handleFiltersChange} allEvents={allEvents} />

{/* Tab bar - Updated to Flex for consistent alignment */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div className="flex flex-wrap border-b border-gray-200">
    {TABS.map(t => (
      <button
        key={t.id}
        onClick={() => setTab(t.id)}
        className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 flex-1 sm:flex-none ${
          tab === t.id 
            ? 'bg-gray-50' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-transparent'
        }`}
        style={tab === t.id ? { color: t.color, borderColor: t.color } : {}}
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
            <MenuOverviewKPICards
              summary={summary}
              onPageViewsClick={drillPageViews}
              onInteractionsClick={drillInteractions}
              onMenuItemsClick={drillMenuItems}
              onSchoolPerfClick={drillSchoolPerf}
              onActiveUsersClick={() => openUserList(userStats, 'Active Users')}
              onActiveDistrictsClick={() => openDistrictList(districtStats, 'Active Districts')}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MenuDrawerUsageChart
              data={drawerStats}
              onMenuItemsClick={() => drillByDrawerType('Menu Items')}
              onSchoolPerfClick={() => drillByDrawerType('School Performance')}
            />
            <MenuMetricUsageChart data={metricStats} />
            <MenuFilterUsageChart data={filterStats} onBarClick={drillByFilter} />
          </div>
        </div>
      )}

      {/* Menu Items tab */}
      {tab === 'menuItems' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-orange-600">{menuItemsUsers.length}</span> users opened the Menu Items drawer in this period.
            </p>
          </div>
          <MenuUsersGrid
            data={menuItemsUsers}
            onUserClick={openUserDetail}
            onSessionsClick={drillUserSessions}
            onPageViewsClick={drillUserPageViews}
            onInteractionsClick={drillUserInteractions}
            onMenuItemsClick={drillUserMenuItems}
            onSchoolPerfClick={drillUserSchoolPerf}
            onRowClick={drillByUser}
          />
        </div>
      )}

      {/* School Performance tab */}
      {tab === 'schoolPerf' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-blue-600">{schoolPerfUsers.length}</span> users opened the School Performance drawer in this period.
            </p>
          </div>
          <MenuUsersGrid
            data={schoolPerfUsers}
            onUserClick={openUserDetail}
            onSessionsClick={drillUserSessions}
            onPageViewsClick={drillUserPageViews}
            onInteractionsClick={drillUserInteractions}
            onMenuItemsClick={drillUserMenuItems}
            onSchoolPerfClick={drillUserSchoolPerf}
            onRowClick={drillByUser}
          />
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <MenuUsersGrid
          data={userStats}
          onUserClick={openUserDetail}
          onSessionsClick={drillUserSessions}
          onPageViewsClick={drillUserPageViews}
          onInteractionsClick={drillUserInteractions}
          onMenuItemsClick={drillUserMenuItems}
          onSchoolPerfClick={drillUserSchoolPerf}
          onRowClick={drillByUser}
        />
      )}

      {/* Districts tab */}
      {tab === 'districts' && (
        <MenuDistrictsGrid
          data={districtStats}
          onDistrictClick={openDistrictDetail}
          onUsersClick={district => openUserList(userStats.filter(u => u.districtId === district.districtId), `Users — ${district.districtName}`)}
          onSessionsClick={drillDistrictSessions}
          onPageViewsClick={drillDistrictPageViews}
          onInteractionsClick={drillDistrictInteractions}
          onMenuItemsClick={drillDistrictMenuItems}
          onSchoolPerfClick={drillDistrictSchoolPerf}
          onRowClick={drillByDistrict}
        />
      )}

      {/* ── User List Drawer ─────────────────────────────────────────────── */}
      {userListDrill && (
        <MenuUserListDrawer
          users={userListDrill.users}
          title={userListDrill.title}
          isOpen={!!userListDrill}
          onClose={closeUserList}
          isChildDrawerOpen={selectedUser !== null}
          onUserClick={openUserDetail}
          onSessionsClick={drillUserSessions}
          onPageViewsClick={drillUserPageViews}
          onInteractionsClick={drillUserInteractions}
          onMenuItemsClick={drillUserMenuItems}
          onSchoolPerfClick={drillUserSchoolPerf}
        />
      )}

      {/* ── District List Drawer ─────────────────────────────────────────── */}
      {districtListDrill && (
        <MenuDistrictListDrawer
          districts={districtListDrill.districts}
          title={districtListDrill.title}
          isOpen={!!districtListDrill}
          onClose={closeDistrictList}
          isChildDrawerOpen={selectedDistrict !== null}
          onDistrictClick={openDistrictDetail}
          onUsersClick={district => openUserList(userStats.filter(u => u.districtId === district.districtId), `Users — ${district.districtName}`)}
          onSessionsClick={drillDistrictSessions}
          onPageViewsClick={drillDistrictPageViews}
          onInteractionsClick={drillDistrictInteractions}
          onMenuItemsClick={drillDistrictMenuItems}
          onSchoolPerfClick={drillDistrictSchoolPerf}
        />
      )}

      {/* ── Session List Drawer ──────────────────────────────────────────── */}
      {sessionListDrill && (
        <MenuSessionListDrawer
          sessions={sessionListDrill.sessions}
          title={sessionListDrill.title}
          isOpen={!!sessionListDrill}
          onClose={closeSessionList}
          isChildDrawerOpen={selectedSessionId !== null}
          onSessionClick={s => openSessionDetail(s.sessionId)}
          onUserClick={s => { const u = userStats.find(u => u.userId === s.userId); if (u) openUserDetail(u); }}
          onDistrictClick={s => { const d = districtStats.find(d => d.districtId === s.districtId); if (d) openDistrictDetail(d); }}
        />
      )}

      {/* ── User Detail Drawer ───────────────────────────────────────────── */}
      <MenuUserDetailDrawer
        user={selectedUser}
        sessions={allSessions}
        isOpen={selectedUser !== null}
        onClose={closeUserDetail}
        zIndex={getZ('user-detail')}
        isTopmost={topDrawer === 'user-detail'}
        onSessionClick={session => { pushDrawer('session-detail'); setSelectedSessionId(session.sessionId); }}
      />

      {/* ── District Detail Drawer ───────────────────────────────────────── */}
      <MenuDistrictDetailDrawer
        district={selectedDistrict}
        users={userStats}
        isOpen={selectedDistrict !== null}
        onClose={closeDistrictDetail}
        zIndex={getZ('district-detail')}
        isTopmost={topDrawer === 'district-detail'}
        onUserClick={openUserDetail}
        onUserSessionsClick={drillUserSessions}
        onUserPageViewsClick={drillUserPageViews}
        onUserInteractionsClick={drillUserInteractions}
        onUserMenuItemsClick={drillUserMenuItems}
        onUserSchoolPerfClick={drillUserSchoolPerf}
      />

      {/* ── Session Detail Drawer ────────────────────────────────────────── */}
      <MenuSessionDetailDrawer
        sessionId={selectedSessionId}
        events={filteredEvents}
        isOpen={selectedSessionId !== null}
        onClose={closeSessionDetail}
        zIndex={getZ('session-detail')}
        isTopmost={topDrawer === 'session-detail'}
      />

      {/* ── Event List Drawer ────────────────────────────────────────────── */}
      {drill && (
        <MenuEventListDrawer
          events={drill.events}
          title={drill.title}
          isOpen={!!drill}
          onClose={closeEventList}
          zIndex={getZ('event-list')}
          isTopmost={topDrawer === 'event-list'}
          onUserClick={openUserById}
          onDistrictClick={openDistrictById}
          onSessionClick={sessionId => { pushDrawer('session-detail'); setSelectedSessionId(sessionId); }}
        />
      )}

      {/* Suppress unused-variable warning: anyDetailOpen drives isChildDrawerOpen on list drawers */}
      {anyDetailOpen && null}
    </div>
  );
};

export default MenuUsageDashboard;
