import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import {
  InsightsUsageEvent,
  InsightsUsageFilters,
  InsightsUsageSummary,
  KPIStatRow,
  InsightsUserStatRow,
  InsightsDistrictStatRow,
  DEFAULT_INSIGHTS_FILTERS,
} from '../../../types/insightsUsageTypes';
import {
  getAllInsightsEvents,
  getInsightsUsageSummary,
  getKPIStats,
  getInsightsUserStats,
  getInsightsDistrictStats,
} from '../../../services/insightsUsageService';
import { applyInsightsFilters, isInsightsInteraction, computeFunnelSteps, INSIGHT_FUNNELS } from './insightsUsageHelpers';
import InsightsUsageFiltersBar from './InsightsUsageFilters';
import InsightsKPICards from './InsightsKPICards';
import InsightsFunnelChart from './InsightsFunnelChart';
import InsightsInteractionChart from './InsightsInteractionChart';
import InsightsCoOccurrenceMatrix from './InsightsCoOccurrenceMatrix';
import InsightsKPIUsageChart from './InsightsKPIUsageChart';
import InsightsSessionFreqChart from './InsightsSessionFreqChart';
import InsightsKPIGrid from './InsightsKPIGrid';
import InsightsUserGrid from './InsightsUserGrid';
import InsightsUserKPICards from './InsightsUserKPICards';
import InsightsUserEngagementChart from './InsightsUserEngagementChart';
import InsightsUserActivityTrend from './InsightsUserActivityTrend';
import InsightsDistrictKPICards from './InsightsDistrictKPICards';
import InsightsDistrictEngagementChart from './InsightsDistrictEngagementChart';
import InsightsDistrictSessionFreqChart from './InsightsDistrictSessionFreqChart';
import InsightsDistrictActivityTrend from './InsightsDistrictActivityTrend';
import InsightsDistrictGrid from './InsightsDistrictGrid';
import InsightsKPITabCards from './InsightsKPITabCards';
import InsightsKPICoOccurrenceMatrix from './InsightsKPICoOccurrenceMatrix';
import InsightsKPIAbout from './InsightsKPIAbout';
import InsightsOverviewActivityTrend from './InsightsOverviewActivityTrend';
import InsightsUserDetailDrawer from './InsightsUserDetailDrawer';
const InsightsEventListDrawer = lazy(() => import('./InsightsEventListDrawer'));

type Tab = 'overview' | 'kpis' | 'users' | 'districts';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'kpis', label: 'KPIs' },
  { id: 'users', label: 'Users' },
  { id: 'districts', label: 'Districts' },
];

interface EventDrill { events: InsightsUsageEvent[]; title: string; }

interface Props {
  onDataUpdate?: (payload: Record<string, unknown>) => void;
}

const InsightsUsageDashboard: React.FC<Props> = ({ onDataUpdate }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<InsightsUsageFilters>({ ...DEFAULT_INSIGHTS_FILTERS });

  const [allEvents, setAllEvents] = useState<InsightsUsageEvent[]>([]);
  const [summary, setSummary] = useState<InsightsUsageSummary | null>(null);
  const [kpiStats, setKpiStats] = useState<KPIStatRow[]>([]);
  const [userStats, setUserStats] = useState<InsightsUserStatRow[]>([]);
  const [districtStats, setDistrictStats] = useState<InsightsDistrictStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [drill, setDrill] = useState<EventDrill | null>(null);
  const [selectedUser, setSelectedUser] = useState<InsightsUserStatRow | null>(null);

  useEffect(() => {
    getAllInsightsEvents().then(setAllEvents);
  }, []);

  const filteredEvents = useMemo(() => applyInsightsFilters(allEvents, filters), [allEvents, filters]);

  useEffect(() => {
    if (allEvents.length === 0) return;
    setLoading(true);
    Promise.all([
      getInsightsUsageSummary(filters),
      getKPIStats(filters),
      getInsightsUserStats(filters),
      getInsightsDistrictStats(filters),
    ]).then(([sum, ks, us, ds]) => {
      setSummary(sum);
      setKpiStats(ks);
      setUserStats(us);
      setDistrictStats(ds);
      setLoading(false);
    });
  }, [filters, allEvents]);

  const handleFiltersChange = useCallback((f: InsightsUsageFilters) => setFilters(f), []);

  const drillByEventType = (eventType: string) => {
    setDrill({
      events: filteredEvents.filter(e => e.eventType === eventType),
      title: `${eventType} Events`,
    });
  };

  const drillInteractions = () => {
    setDrill({
      events: filteredEvents.filter(isInsightsInteraction),
      title: 'All Interactions',
    });
  };

  // Total distinct districts across all time (denominator for "no activity" card)
  const totalDistrictCount = useMemo(
    () => new Set(allEvents.map(e => e.districtId)).size,
    [allEvents]
  );

  // Map of districtId -> timezone, built from districtStats for the user activity trend
  const districtTimezones = useMemo(() => {
    const map: Record<string, string> = {};
    districtStats.forEach(d => { map[d.districtId] = d.timezone; });
    return map;
  }, [districtStats]);

  // Engagement funnel steps used for Schoolie chat context (always funnel 1)
  const funnelSteps = useMemo(
    () => computeFunnelSteps(filteredEvents, INSIGHT_FUNNELS[0]),
    [filteredEvents]
  );

  // Usage payload for Schoolie chat
  const usagePayload = useMemo(() => {
    if (!summary) return {};
    return {
      summary: { ...summary, interactionRatePct: (summary.interactionRate * 100).toFixed(1) },
      kpiStats: kpiStats.map(k => ({ ...k, normalizedUsagePct: (k.normalizedUsage * 100).toFixed(1) })),
      topUsers: userStats.slice(0, 5).map(u => ({ name: u.userName, district: u.districtName, sessions: u.sessions, interactions: u.interactions })),
      funnelSteps,
      totalEvents: filteredEvents.length,
    };
  }, [summary, kpiStats, userStats, funnelSteps, filteredEvents]);

  const onDataUpdateRef = useRef(onDataUpdate);
  onDataUpdateRef.current = onDataUpdate;
  useEffect(() => {
    if (summary) onDataUpdateRef.current?.(usagePayload);
  }, [usagePayload, summary]);

  if (loading && allEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InsightsUsageFiltersBar filters={filters} onChange={handleFiltersChange} />

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200 px-2 pt-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedUser(null); }}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors -mb-px ${
                tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {summary && (
            <InsightsKPICards
              summary={summary}
              onDrill={drillByEventType}
              onDrillInteractions={drillInteractions}
              onTabSwitch={setTab}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InsightsFunnelChart events={filteredEvents} />
            <InsightsInteractionChart events={filteredEvents} onBarClick={drillByEventType} />
          </div>
          <InsightsCoOccurrenceMatrix events={filteredEvents} />
          <InsightsOverviewActivityTrend events={filteredEvents} districtTimezones={districtTimezones} />
        </div>
      )}

      {/* KPIs */}
      {tab === 'kpis' && (
        <div className="space-y-5">
          <InsightsKPITabCards data={kpiStats} events={filteredEvents} />
          <InsightsKPIUsageChart data={kpiStats} />
          <InsightsKPIGrid data={kpiStats} />
          <InsightsKPICoOccurrenceMatrix events={filteredEvents} />
          
          <InsightsKPIAbout />
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        selectedUser ? (
          <InsightsUserDetailDrawer
            user={selectedUser}
            allEvents={allEvents}
            onClose={() => setSelectedUser(null)}
          />
        ) : (
          <div className="space-y-5">
            <InsightsUserKPICards data={userStats} events={filteredEvents} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InsightsUserEngagementChart data={userStats} />
              <InsightsSessionFreqChart events={filteredEvents} />
            </div>
            <InsightsUserGrid
              data={userStats}
              onRowClick={row => setSelectedUser(row)}
            />
            <InsightsUserActivityTrend data={userStats} events={filteredEvents} districtTimezones={districtTimezones} />
          </div>
        )
      )}

      {/* Districts */}
      {tab === 'districts' && (
        <div className="space-y-5">
          <InsightsDistrictKPICards data={districtStats} totalDistricts={totalDistrictCount} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InsightsDistrictEngagementChart data={districtStats} />
            <InsightsDistrictSessionFreqChart data={districtStats} />
          </div>
          <InsightsDistrictGrid data={districtStats} />
          <InsightsDistrictActivityTrend data={districtStats} events={filteredEvents} totalDistricts={totalDistrictCount} />
        </div>
      )}

      <Suspense fallback={null}>
        <InsightsEventListDrawer
          events={drill?.events ?? []}
          title={drill?.title ?? ''}
          isOpen={drill !== null}
          onClose={() => setDrill(null)}
        />
      </Suspense>

    </div>
  );
};

export default InsightsUsageDashboard;
