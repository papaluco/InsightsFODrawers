import { useEffect, useRef, useState } from 'react';
import type { ErrorTelemetryEvent } from '../../../telemetry/types';
import {
  getErrorData,
  DEFAULT_ERROR_FILTERS,
  type ErrorFilters,
  type ErrorKpis,
} from '../../../services/errorsService';
import ErrorFiltersBar from './ErrorFilters';
import ErrorSeverityChart from './ErrorSeverityChart';
import ErrorCategoryChart from './ErrorCategoryChart';
import ErrorsGrid from './ErrorsGrid';
import ErrorDetailDrawer from './ErrorDetailDrawer';

interface Props {
  onDataUpdate?: (payload: Record<string, unknown>) => void;
}

const DEFAULT_KPIS: ErrorKpis = {
  total: 0, critical: 0, high: 0, medium: 0, low: 0,
  userBlocking: 0, affectedSessions: 0,
};

const ErrorsDashboard: React.FC<Props> = ({ onDataUpdate: _ }) => {
  const [allEvents,     setAllEvents]     = useState<ErrorTelemetryEvent[]>([]);
  const [filtered,      setFiltered]      = useState<ErrorTelemetryEvent[]>([]);
  const [kpis,          setKpis]          = useState<ErrorKpis>(DEFAULT_KPIS);
  const [loading,       setLoading]       = useState(true);
  const [filters,       setFilters]       = useState<ErrorFilters>({ ...DEFAULT_ERROR_FILTERS });
  const [selectedEvent, setSelectedEvent] = useState<ErrorTelemetryEvent | null>(null);
  const [detailOpen,    setDetailOpen]    = useState(false);
  const initializedRef  = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getErrorData(filters).then(({ events, kpis: k }) => {
      if (cancelled) return;
      if (!initializedRef.current) {
        setAllEvents(events);
        initializedRef.current = true;
      }
      setFiltered(events);
      setKpis(k);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = (e: ErrorTelemetryEvent) => {
    setSelectedEvent(e);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-5">

      {/* Filters */}
      <ErrorFiltersBar filters={filters} onChange={setFilters} allEvents={allEvents} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {[
          { label: 'Total',            value: kpis.total,            sub: 'All errors',           accent: 'text-gray-900',  border: '' },
          { label: 'Critical',         value: kpis.critical,         sub: 'Crash-level severity', accent: 'text-rose-600',  border: 'border-rose-100' },
          { label: 'High',             value: kpis.high,             sub: 'Workflow failures',    accent: 'text-orange-600',border: 'border-orange-100' },
          { label: 'Medium',           value: kpis.medium,           sub: 'Degraded experience',  accent: 'text-amber-600', border: 'border-amber-100' },
          { label: 'Low',              value: kpis.low,              sub: 'Minor issues',         accent: 'text-gray-500',  border: '' },
          { label: 'User-Blocking',    value: kpis.userBlocking,     sub: 'Blocked workflows',    accent: 'text-rose-700',  border: 'border-rose-100' },
          { label: 'Affected Sessions',value: kpis.affectedSessions, sub: 'Unique sessions',      accent: 'text-blue-600',  border: '' },
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
          <ErrorSeverityChart kpis={kpis} />
        </div>
        <div className="md:col-span-3">
          <ErrorCategoryChart events={filtered} />
        </div>
      </div>

      {/* Grid */}
      <ErrorsGrid events={filtered} onRowClick={handleRowClick} />

      {/* Detail drawer */}
      <ErrorDetailDrawer
        event={selectedEvent}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        zIndex={70}
      />
    </div>
  );
};

export default ErrorsDashboard;
