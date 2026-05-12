import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Ban, CheckCircle2 } from 'lucide-react';
import {
  getReliabilityData,
  type ReliabilityKpis,
  type ComponentRisk,
  type IncidentEntry,
  type SeverityTrend,
} from '../../../services/reliabilityService';
import ReliabilityTrendChart from './ReliabilityTrendChart';
import IncidentLog from './IncidentLog';

const DEFAULT_KPIS: ReliabilityKpis = {
  errorFreeSessionRate: 100, userBlockingRate: 0,
  criticalErrorCount: 0, userBlockingCount: 0,
  totalSessions: 0, sessionsWithCritical: 0, mttr: 0,
};

const ReliabilityDashboard: React.FC = () => {
  const [kpis,      setKpis]      = useState<ReliabilityKpis>(DEFAULT_KPIS);
  const [risks,     setRisks]     = useState<ComponentRisk[]>([]);
  const [incidents, setIncidents] = useState<IncidentEntry[]>([]);
  const [trend,     setTrend]     = useState<SeverityTrend[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getReliabilityData().then(({ kpis: k, componentRisks, incidentLog, severityTrend }) => {
      setKpis(k);
      setRisks(componentRisks);
      setIncidents(incidentLog);
      setTrend(severityTrend);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const slaClass = kpis.errorFreeSessionRate >= 90
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : kpis.errorFreeSessionRate >= 75
    ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-rose-50 border-rose-200 text-rose-700';

  return (
    <div className="space-y-5">

      {/* SLA banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-4 ${slaClass} ${loading ? 'opacity-60 animate-pulse' : ''}`}>
        {kpis.errorFreeSessionRate >= 90
          ? <CheckCircle2 size={22} className="shrink-0" />
          : <AlertTriangle size={22} className="shrink-0" />
        }
        <div>
          <p className="font-bold text-sm">
            {kpis.errorFreeSessionRate}% Error-Free Session Rate
          </p>
          <p className="text-xs opacity-80">
            {kpis.totalSessions - kpis.sessionsWithCritical} of {kpis.totalSessions} sessions had no critical errors
            {kpis.errorFreeSessionRate < 90 && ' — below 90% target'}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {[
          { label: 'Error-Free Sessions', value: `${kpis.errorFreeSessionRate}%`, sub: 'No errors recorded',    accent: kpis.errorFreeSessionRate >= 90 ? 'text-emerald-600' : 'text-rose-600', border: '', icon: <Shield size={16} /> },
          { label: 'Critical Errors',     value: kpis.criticalErrorCount,          sub: 'Crash-level severity', accent: 'text-rose-600',   border: 'border-rose-100',   icon: <AlertTriangle size={16} /> },
          { label: 'User-Blocking',       value: kpis.userBlockingCount,           sub: 'Blocked workflows',    accent: 'text-rose-700',   border: 'border-rose-100',   icon: <Ban size={16} /> },
          { label: 'Blocking Rate',       value: `${kpis.userBlockingRate}%`,      sub: 'Sessions with blocks', accent: kpis.userBlockingRate > 10 ? 'text-rose-600' : 'text-amber-500', border: '', icon: null },
          { label: 'Critical Sessions',   value: kpis.sessionsWithCritical,        sub: 'Had critical errors',  accent: 'text-rose-600',   border: 'border-rose-100',   icon: null },
          { label: 'Total Sessions',      value: kpis.totalSessions,               sub: 'Tracked sessions',     accent: 'text-gray-900',   border: '',                  icon: null },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl border ${card.border || 'border-gray-200'} p-4 shadow-sm`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.accent} ${loading ? 'opacity-40 animate-pulse' : ''}`}>{card.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <ReliabilityTrendChart data={trend} />

      {/* Component risk table */}
      {risks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-slate-700">Top At-Risk Components</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Ranked by critical error + user-blocking impact</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  {['Component', 'Errors', 'Critical', 'Blocking', 'Modules'].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {risks.map(r => (
                  <tr key={r.component} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{r.component}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{r.errorCount}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {r.criticalCount > 0
                        ? <span className="font-bold text-rose-600">{r.criticalCount}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {r.userBlockingCount > 0
                        ? <span className="font-semibold text-orange-500">{r.userBlockingCount}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {r.modules.slice(0, 2).join(', ')}{r.modules.length > 2 ? ` +${r.modules.length - 2}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incident log */}
      <IncidentLog incidents={incidents} />
    </div>
  );
};

export default ReliabilityDashboard;
