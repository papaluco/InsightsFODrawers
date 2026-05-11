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
  DEFAULT_MENU_FILTERS,
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
import { applyMenuFilters, MENU_TAB_COLORS } from './menuUsageHelpers';
import MenuUsageFiltersBar from './MenuUsageFilters';
import MenuOverviewKPICards from './MenuOverviewKPICards';
import MenuDrawerUsageChart from './MenuDrawerUsageChart';
import MenuMetricUsageChart from './MenuMetricUsageChart';
import MenuFilterUsageChart from './MenuFilterUsageChart';
import MenuUsersGrid from './MenuUsersGrid';
import MenuDistrictsGrid from './MenuDistrictsGrid';
import MenuEventListDrawer from './MenuEventListDrawer';

type Tab = 'overview' | 'menuItems' | 'schoolPerf' | 'users' | 'districts';

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'overview',   label: 'Overview',          color: MENU_TAB_COLORS['Overview'] },
  { id: 'menuItems',  label: 'Menu Items',         color: MENU_TAB_COLORS['Menu Items'] },
  { id: 'schoolPerf', label: 'School Performance', color: MENU_TAB_COLORS['School Performance'] },
  { id: 'users',      label: 'Users',              color: MENU_TAB_COLORS['Users'] },
  { id: 'districts',  label: 'Districts',          color: MENU_TAB_COLORS['Districts'] },
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

  const [drill, setDrill] = useState<EventDrill | null>(null);
  const [drawerStack, setDrawerStack] = useState<string[]>([]);

  useEffect(() => {
    getAllMenuEvents().then(setAllEvents);
  }, []);

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

  // Drawer stack helpers
  const getZ = (id: string): number => {
    const idx = drawerStack.indexOf(id);
    return 60 + Math.max(0, idx) * 10;
  };
  const pushDrawer = (id: string) => setDrawerStack(prev => [...prev.filter(i => i !== id), id]);
  const popDrawer = (id: string) => setDrawerStack(prev => prev.filter(i => i !== id));

  const openEventList = (d: EventDrill) => { setDrill(d); pushDrawer('event-list'); };
  const closeEventList = () => { setDrill(null); popDrawer('event-list'); };

  // Drill helpers
  const drillByDrawer = (drawerType: string) =>
    openEventList({
      events: filteredEvents.filter(e =>
        e.eventType === 'MENU_ITEMS_DRAWER_VIEWED' && drawerType === 'Menu Items' ||
        e.eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED' && drawerType === 'School Performance'
      ),
      title: `Events — ${drawerType} Drawer`,
    });

  const drillByFilter = (stat: MenuFilterUsageStat) =>
    openEventList({
      events: filteredEvents.filter(e => e.eventType === stat.eventType),
      title: `Events — ${stat.filter}`,
    });

  const drillByUser = (user: MenuUserStatRow) =>
    openEventList({
      events: filteredEvents.filter(e => e.userId === user.userId),
      title: `Events — ${user.userName}`,
    });

  const drillByDistrict = (district: MenuDistrictStatRow) =>
    openEventList({
      events: filteredEvents.filter(e => e.districtId === district.districtId),
      title: `Events — ${district.districtName}`,
    });

  // Menu Items tab users (users who opened Menu Items drawer)
  const menuItemsUsers = useMemo(
    () => userStats.filter(u => u.menuItemsDrawerViews > 0),
    [userStats]
  );

  // School Performance tab users
  const schoolPerfUsers = useMemo(
    () => userStats.filter(u => u.schoolPerformanceDrawerViews > 0),
    [userStats]
  );

  // Schoolie payload
  const usagePayload = useMemo(() => {
    if (!summary) return {};
    return {
      summary: { ...summary },
      drawerUsage: drawerStats.map(d => ({ drawer: d.drawerType, count: d.count, percent: d.percent })),
      metricUsage: metricStats.map(m => ({ metric: m.metric, count: m.count, percent: m.percent })),
      filterUsage: filterStats.map(f => ({ filter: f.filter, count: f.count })),
      topUsers: [...userStats]
        .slice(0, 10)
        .map(u => ({ userName: u.userName, sessions: u.sessions, interactions: u.interactions })),
      topDistricts: districtStats.filter(d => !d.hasNoActivity).slice(0, 8)
        .map(d => ({ districtName: d.districtName, sessions: d.sessions, activeUsers: d.activeUsers })),
      totalEvents: filteredEvents.length,
    };
  }, [summary, drawerStats, metricStats, filterStats, userStats, districtStats, filteredEvents]);

  const onDataUpdateRef = useRef(onDataUpdate);
  onDataUpdateRef.current = onDataUpdate;
  useEffect(() => {
    if (summary) onDataUpdateRef.current?.(usagePayload);
  }, [usagePayload, summary]);

  const topDrawer = drawerStack[drawerStack.length - 1] ?? null;

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

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200 px-2 pt-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap -mb-px ${
                tab === t.id
                  ? 'border-b-2'
                  : 'text-gray-400 hover:text-gray-600'
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
              onActiveUsersClick={() => setTab('users')}
              onActiveDistrictsClick={() => setTab('districts')}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MenuDrawerUsageChart
              data={drawerStats}
              onMenuItemsClick={() => drillByDrawer('Menu Items')}
              onSchoolPerfClick={() => drillByDrawer('School Performance')}
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
          <MenuUsersGrid data={menuItemsUsers} onRowClick={drillByUser} />
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
          <MenuUsersGrid data={schoolPerfUsers} onRowClick={drillByUser} />
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <MenuUsersGrid data={userStats} onRowClick={drillByUser} />
      )}

      {/* Districts tab */}
      {tab === 'districts' && (
        <MenuDistrictsGrid
          data={districtStats}
          onRowClick={drillByDistrict}
          onUsersClick={district => {
            const distUsers = userStats.filter(u => u.districtId === district.districtId);
            openEventList({
              events: filteredEvents.filter(e => e.districtId === district.districtId),
              title: `Events — ${district.districtName}`,
            });
            void distUsers;
          }}
        />
      )}

      {/* Event List Drawer */}
      {drill && (
        <MenuEventListDrawer
          events={drill.events}
          title={drill.title}
          isOpen={!!drill}
          onClose={closeEventList}
          zIndex={getZ('event-list')}
          isTopmost={topDrawer === 'event-list'}
        />
      )}
    </div>
  );
};

export default MenuUsageDashboard;
