import { useEffect, useRef, useState } from 'react';
import type { PerformanceTelemetryEvent } from '../../../telemetry/types';
import {
  getPerfData,
  DEFAULT_PERF_FILTERS,
  type PerfFilters,
  type PerfKpis,
  type CategoryStat,
} from '../../../services/performanceService';
import PerformanceFiltersBar from './PerformanceFilters';
import PerfDurationChart from './PerfDurationChart';
import PerfSlowChart from './PerfSlowChart';
import PerformanceGrid from './PerformanceGrid';
import PerfDetailDrawer from './PerfDetailDrawer';
import { fmtMs } from './perfHelpers';

const DEFAULT_KPIS: PerfKpis = {
  total: 0, slowCount: 0, slowPct: 0, failedCount: 0,
  p50Ms: 0, p95Ms: 0, avgMs: 0,
};

const PerformanceDashboard: React.FC = () => {
  const [allEvents,     setAllEvents]     = useState<PerformanceTelemetryEvent[]>([]);
  const [filtered,      setFiltered]      = useState<PerformanceTelemetryEvent[]>([]);
  const [kpis,          setKpis]          = useState<PerfKpis>(DEFAULT_KPIS);
  const [catStats,      setCatStats]      = useState<CategoryStat[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filters,       setFilters]       = useState<PerfFilters>({ ...DEFAULT_PERF_FILTERS });
  const [selectedEvent, setSelectedEvent] = useState<PerformanceTelemetryEvent | null>(null);
  const [detailOpen,    setDetailOpen]    = useState(false);
  const initializedRef  = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPerfData(filters).then(({ events, kpis: k, categoryStats }) => {
      if (cancelled) return;
      if (!initializedRef.current) {
        setAllEvents(events);
        initializedRef.current = true;
      }
      setFiltered(events);
      setKpis(k);
      setCatStats(categoryStats);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = (e: PerformanceTelemetryEvent) => {
    setSelectedEvent(e);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-5">

      {/* Filters */}
      <PerformanceFiltersBar filters={filters} onChange={setFilters} allEvents={allEvents} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {[
          { label: 'Total',  value: kpis.total,          sub: 'All events',        accent: 'text-gray-900',   border: '' },
          { label: 'Slow',   value: kpis.slowCount,      sub: 'Above threshold',   accent: 'text-orange-500', border: 'border-orange-100' },
          { label: 'Slow %', value: `${kpis.slowPct}%`,  sub: 'Pct slow',          accent: kpis.slowPct >= 20 ? 'text-rose-600' : 'text-amber-500', border: '' },
          { label: 'Failed', value: kpis.failedCount,    sub: 'Unsuccessful ops',  accent: 'text-rose-600',   border: 'border-rose-100' },
          { label: 'p50',    value: fmtMs(kpis.p50Ms),   sub: 'Median duration',   accent: 'text-gray-700',   border: '' },
          { label: 'p95',    value: fmtMs(kpis.p95Ms),   sub: '95th percentile',   accent: 'text-amber-600',  border: 'border-amber-100' },
          { label: 'Avg',    value: fmtMs(kpis.avgMs),   sub: 'Mean duration',     accent: 'text-gray-700',   border: '' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl border ${card.border || 'border-gray-200'} p-4 shadow-sm`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.accent} ${loading ? 'opacity-40 animate-pulse' : ''}`}>{card.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-2">
          <PerfSlowChart kpis={kpis} />
        </div>
        <div className="md:col-span-3">
          <PerfDurationChart stats={catStats} />
        </div>
      </div>

      {/* Grid */}
      <PerformanceGrid events={filtered} onRowClick={handleRowClick} />

      {/* Detail drawer */}
      <PerfDetailDrawer
        event={selectedEvent}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        zIndex={70}
      />
    </div>
  );
};

export default PerformanceDashboard;
