import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ReportUsageEvent,
  ReportUsageFilters,
  ReportUsageSummary,
  ReportStatRow,
  UserStatRow,
  DistrictStatRow,
  DEFAULT_REPORT_FILTERS,
} from '../../../types/reportUsageTypes';
import {
  getAllReportEvents,
  getReportUsageSummary,
  getReportStats,
  getUserStats,
  getDistrictStats,
} from '../../../services/reportUsageService';
import { applyReportFilters, EVENT_COLORS } from './reportUsageHelpers';
import { getUsageEventFriendlyName } from '../../../constants/usageEventTypes';
import ReportsUsageFilters from './ReportsUsageFilters';
import ReportsKPICards from './ReportsKPICards';
import ReportsPopularityChart from './ReportsPopularityChart';
import ReportsPieChart from './ReportsPieChart';
import ReportsModuleChart from './ReportsModuleChart';
import ReportsEntryPointChart from './ReportsEntryPointChart';
import ReportsGrid from './ReportsGrid';
import ReportsUserGrid from './ReportsUserGrid';
import ReportsDistrictGrid from './ReportsDistrictGrid';
import ReportEventListDrawer from './ReportEventListDrawer';
import ReportsUserDetailPage from './ReportsUserDetailPage';

type Tab = 'overview' | 'reports' | 'users' | 'districts';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'reports', label: 'Reports' },
  { id: 'users', label: 'Users' },
  { id: 'districts', label: 'Districts' },
];

interface EventDrill {
  events: ReportUsageEvent[];
  title: string;
}

interface Props {
  onDataUpdate?: (payload: Record<string, unknown>) => void;
}

const ReportsUsageDashboard: React.FC<Props> = ({ onDataUpdate }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<ReportUsageFilters>({ ...DEFAULT_REPORT_FILTERS });

  const [allEvents, setAllEvents] = useState<ReportUsageEvent[]>([]);
  const [summary, setSummary] = useState<ReportUsageSummary | null>(null);
  const [reportStats, setReportStats] = useState<ReportStatRow[]>([]);
  const [userStats, setUserStats] = useState<UserStatRow[]>([]);
  const [districtStats, setDistrictStats] = useState<DistrictStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [drill, setDrill] = useState<EventDrill | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserStatRow | null>(null);

  useEffect(() => {
    getAllReportEvents().then(setAllEvents);
  }, []);

  const filteredEvents = useMemo(() => applyReportFilters(allEvents, filters), [allEvents, filters]);

  useEffect(() => {
    if (allEvents.length === 0) return;
    setLoading(true);
    const f = { ...filters };
    Promise.all([
      getReportUsageSummary(f),
      getReportStats(f),
      getUserStats(f),
      getDistrictStats(f),
    ]).then(([sum, rs, us, ds]) => {
      setSummary(sum);
      setReportStats(rs);
      setUserStats(us);
      setDistrictStats(ds);
      setLoading(false);
    });
  }, [filters, allEvents]);

  const handleFiltersChange = useCallback((f: ReportUsageFilters) => setFilters(f), []);

  const drillByEventType = (eventType: string) => {
    setDrill({
      events: filteredEvents.filter(e => e.eventType === eventType),
      title: `${getUsageEventFriendlyName(eventType)} Events`,
    });
  };

  const drillByReport = (reportName: string) => {
    setDrill({
      events: filteredEvents.filter(e => e.context.reportName === reportName),
      title: `Events — ${reportName}`,
    });
  };

  const drillBySegment = (field: keyof ReportUsageEvent['context'], value: string, label: string) => {
    setDrill({
      events: filteredEvents.filter(e => (e.context[field] as string) === value),
      title: `${label}: ${value}`,
    });
  };

  // Event type breakdown using friendly names
  const eventTypePieData = useMemo(() => {
    const counts: Record<string, { eventType: string; count: number }> = {};
    for (const e of filteredEvents) {
      const friendly = getUsageEventFriendlyName(e.eventType);
      if (!counts[friendly]) counts[friendly] = { eventType: e.eventType, count: 0 };
      counts[friendly].count++;
    }
    return Object.entries(counts)
      .map(([name, { count }]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEvents]);

  const eventTypeColors = Object.values(EVENT_COLORS);

  const usagePayload = useMemo(() => {
    if (!summary) return {};
    const total = summary.views + summary.runs + summary.downloads + summary.emails + summary.distributions;
    const moduleBreakdown: Record<string, number> = {};
    const dataSourceBreakdown: Record<string, number> = {};
    for (const e of filteredEvents) {
      moduleBreakdown[e.context.module] = (moduleBreakdown[e.context.module] ?? 0) + 1;
      dataSourceBreakdown[e.context.dataSource] = (dataSourceBreakdown[e.context.dataSource] ?? 0) + 1;
    }
    const topReports = [...reportStats]
      .sort((a, b) => (b.views + b.runs) - (a.views + a.runs))
      .slice(0, 10)
      .map(r => ({ name: r.reportName, type: r.reportType, module: r.module, dataSource: r.dataSource, views: r.views, runs: r.runs, downloads: r.downloads, uniqueUsers: r.uniqueUsers }));
    const topUsers = [...userStats]
      .sort((a, b) => (b.runs + b.downloads) - (a.runs + a.downloads))
      .slice(0, 5)
      .map(u => ({ name: u.userName, district: u.districtName, runs: u.runs, downloads: u.downloads, emails: u.emails }));
    return {
      summaryKPIs: { ...summary },
      actionBreakdown: total > 0 ? {
        viewPct: ((summary.views / total) * 100).toFixed(1),
        runPct: ((summary.runs / total) * 100).toFixed(1),
        downloadPct: ((summary.downloads / total) * 100).toFixed(1),
        emailPct: ((summary.emails / total) * 100).toFixed(1),
        distributePct: ((summary.distributions / total) * 100).toFixed(1),
      } : {},
      topReports,
      moduleBreakdown,
      dataSourceBreakdown,
      topUsers,
      totalEvents: filteredEvents.length,
    };
  }, [summary, filteredEvents, reportStats, userStats]);

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
      <ReportsUsageFilters filters={filters} onChange={handleFiltersChange} allEvents={allEvents} />

      {/* Tab bar — white background so it stands out from the gray page */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200 px-2 pt-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedUser(null); }}
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
            <ReportsKPICards summary={summary} onDrill={drillByEventType} />
          )}
          {/* Row 1: two bar charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ReportsPopularityChart
              data={reportStats}
              onBarClick={drillByReport}
            />
            <ReportsModuleChart
              events={filteredEvents}
              onBarClick={m => drillBySegment('module', m, 'Module')}
            />
          </div>
          {/* Row 2: two donut charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ReportsPieChart
              data={eventTypePieData}
              title="Event Type Breakdown"
              colors={eventTypeColors}
              onSegmentClick={friendlyName => {
                const entry = filteredEvents.find(e => getUsageEventFriendlyName(e.eventType) === friendlyName);
                if (entry) drillByEventType(entry.eventType);
              }}
            />
            <ReportsEntryPointChart
              events={filteredEvents}
              onSegmentClick={ep => drillBySegment('entryPoint', ep, 'Entry Point')}
            />
          </div>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="space-y-5">
          <ReportsPopularityChart data={reportStats} onBarClick={drillByReport} />
          <ReportsGrid
            data={reportStats}
            onRowClick={row => drillByReport(row.reportName)}
          />
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        selectedUser ? (
          <ReportsUserDetailPage
            user={selectedUser}
            allEvents={allEvents}
            onClose={() => setSelectedUser(null)}
          />
        ) : (
          <div className="space-y-5">
            <ReportsUserGrid data={userStats} onRowClick={row => setSelectedUser(row)} />
          </div>
        )
      )}

      {/* Districts tab */}
      {tab === 'districts' && (
        <div className="space-y-5">
          <ReportsDistrictGrid data={districtStats} />
        </div>
      )}

      <ReportEventListDrawer
        events={drill?.events ?? []}
        title={drill?.title ?? ''}
        isOpen={drill !== null}
        onClose={() => setDrill(null)}
      />
    </div>
  );
};

export default ReportsUsageDashboard;
