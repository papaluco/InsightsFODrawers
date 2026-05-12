import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { SessionRow } from '../../../services/sessionsService';
import {
  getSessionData,
  DEFAULT_SESSION_FILTERS,
  type SessionFilters,
  type SessionKpis,
} from '../../../services/sessionsService';
import SessionFiltersBar from './SessionFilters';
import SessionsGrid from './SessionsGrid';
import SessionTimelineDrawer from './SessionTimelineDrawer';
import { HEALTH_COLORS } from './sessionsHelpers';

const DEFAULT_KPIS: SessionKpis = {
  total: 0, healthy: 0, slow: 0, degraded: 0, failed: 0,
  healthyPct: 0, errorFreeRate: 0,
};

const SessionsDashboard: React.FC = () => {
  const [sessions,   setSessions]   = useState<SessionRow[]>([]);
  const [kpis,       setKpis]       = useState<SessionKpis>(DEFAULT_KPIS);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState<SessionFilters>({ ...DEFAULT_SESSION_FILTERS });
  const [selected,   setSelected]   = useState<SessionRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getSessionData(filters).then(({ sessions: rows, kpis: k }) => {
      if (cancelled) return;
      setSessions(rows);
      setKpis(k);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = (s: SessionRow) => {
    setSelected(s);
    setDetailOpen(true);
  };

  const pieData = [
    { name: 'Healthy',  value: kpis.healthy,  health: 'healthy'  },
    { name: 'Slow',     value: kpis.slow,      health: 'slow'     },
    { name: 'Degraded', value: kpis.degraded,  health: 'degraded' },
    { name: 'Failed',   value: kpis.failed,    health: 'failed'   },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-5">

      {/* Filters */}
      <SessionFiltersBar filters={filters} onChange={setFilters} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {[
          { label: 'Total',        value: kpis.total,        sub: 'All sessions',        accent: 'text-gray-900',   border: '' },
          { label: 'Healthy',      value: kpis.healthy,      sub: 'No issues',           accent: 'text-emerald-600',border: 'border-emerald-100' },
          { label: 'Slow',         value: kpis.slow,         sub: 'Perf degraded',       accent: 'text-amber-500',  border: 'border-amber-100' },
          { label: 'Degraded',     value: kpis.degraded,     sub: 'Non-critical errors', accent: 'text-orange-500', border: 'border-orange-100' },
          { label: 'Failed',       value: kpis.failed,       sub: 'Critical errors',     accent: 'text-rose-600',   border: 'border-rose-100' },
          { label: 'Healthy %',    value: `${kpis.healthyPct}%`,    sub: 'Of all sessions',  accent: kpis.healthyPct >= 80 ? 'text-emerald-600' : 'text-amber-500', border: '' },
          { label: 'Error-Free %', value: `${kpis.errorFreeRate}%`, sub: 'No errors at all', accent: kpis.errorFreeRate >= 70 ? 'text-emerald-600' : 'text-rose-600', border: '' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl border ${card.border || 'border-gray-200'} p-4 shadow-sm`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.accent} ${loading ? 'opacity-40 animate-pulse' : ''}`}>{card.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Health donut */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Session Health Distribution</h3>
        {kpis.total > 0 ? (
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={HEALTH_COLORS[d.health as keyof typeof HEALTH_COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [`${v} sessions`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                { label: 'Healthy',  value: kpis.healthy,  color: HEALTH_COLORS.healthy  },
                { label: 'Slow',     value: kpis.slow,     color: HEALTH_COLORS.slow     },
                { label: 'Degraded', value: kpis.degraded, color: HEALTH_COLORS.degraded },
                { label: 'Failed',   value: kpis.failed,   color: HEALTH_COLORS.failed   },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                  <div>
                    <p className="text-xs font-medium text-gray-600">{row.label}</p>
                    <p className="text-lg font-bold text-gray-900">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">
            {loading ? 'Loading sessions…' : 'No sessions match the current filters'}
          </p>
        )}
      </div>

      {/* Sessions grid */}
      <SessionsGrid rows={sessions} onRowClick={handleRowClick} />

      {/* Timeline drawer */}
      <SessionTimelineDrawer
        session={selected}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        zIndex={70}
      />
    </div>
  );
};

export default SessionsDashboard;
