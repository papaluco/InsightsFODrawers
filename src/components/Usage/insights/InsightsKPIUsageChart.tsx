import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { KPIStatRow } from '../../../types/insightsUsageTypes';
import { KPI_COLORS } from './insightsUsageHelpers';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

type Metric =
  | 'visibleSessions' | 'available' | 'hidden' | 'neverOpened'
  | 'visibilityPct' | 'hiddenPct' | 'neverOpenedPct' | 'normalizedUsage'
  | 'drawerOpens' | 'schoolieOpens' | 'downloads' | 'trendSelections';

interface MetricDef {
  label: string;
  isPct: boolean;
  getValue: (r: KPIStatRow) => number;
}

const METRICS: Record<Metric, MetricDef> = {
  visibleSessions: { label: 'Visible Sessions', isPct: false, getValue: r => r.visibleSessions },
  available:       { label: 'Available Sessions', isPct: false, getValue: r => r.available },
  hidden:          { label: 'Hidden Sessions', isPct: false, getValue: r => r.hidden },
  neverOpened:     { label: 'Never Opened', isPct: false, getValue: r => r.neverOpened },
  visibilityPct:   { label: 'Visibility %', isPct: true, getValue: r => parseFloat((r.visibilityPct * 100).toFixed(1)) },
  hiddenPct:       { label: 'Hidden %', isPct: true, getValue: r => parseFloat((r.hiddenPct * 100).toFixed(1)) },
  neverOpenedPct:  { label: 'Never Opened %', isPct: true, getValue: r => parseFloat((r.neverOpenedPct * 100).toFixed(1)) },
  normalizedUsage: { label: 'Usage %', isPct: true, getValue: r => parseFloat((r.normalizedUsage * 100).toFixed(1)) },
  drawerOpens:     { label: 'Drawer Opens', isPct: false, getValue: r => r.drawerOpens },
  schoolieOpens:   { label: 'Schoolie Opens', isPct: false, getValue: r => r.schoolieOpens },
  downloads:       { label: 'Downloads', isPct: false, getValue: r => r.downloads },
  trendSelections: { label: 'Trend Selections', isPct: false, getValue: r => r.trendSelections },
};

interface Props {
  data: KPIStatRow[];
}

const InsightsKPIUsageChart: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(true);
  const [metric, setMetric] = useState<Metric>('visibleSessions');

  const def = METRICS[metric];

  const chartData = useMemo(() => data.map(row => ({
    name: row.kpi,
    value: def.getValue(row),
    kpi: row.kpi,
  })), [data, def]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">KPI Usage</span>
        <div className="flex items-center gap-3">
          {expanded && (
            <div onClick={e => e.stopPropagation()}>
              <select
                value={metric}
                onChange={e => setMetric(e.target.value as Metric)}
                className="text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 cursor-pointer"
              >
                <optgroup label="Visibility">
                  <option value="visibleSessions">Visible Sessions</option>
                  <option value="available">Available Sessions</option>
                  <option value="hidden">Hidden Sessions</option>
                  <option value="neverOpened">Never Opened</option>
                  <option value="visibilityPct">Visibility %</option>
                  <option value="hiddenPct">Hidden %</option>
                  <option value="neverOpenedPct">Never Opened %</option>
                </optgroup>
                <optgroup label="Usage">
                  <option value="normalizedUsage">Usage %</option>
                  <option value="drawerOpens">Drawer Opens</option>
                  <option value="schoolieOpens">Schoolie Opens</option>
                  <option value="downloads">Downloads</option>
                  <option value="trendSelections">Trend Selections</option>
                </optgroup>
              </select>
            </div>
          )}
          <CollapseChevron expanded={expanded} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => def.isPct ? `${v}%` : v}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { name: string; value: number };
                    return (
                      <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                        <p className="font-semibold text-slate-700">{d.name}</p>
                        <p className="text-gray-500">{def.isPct ? `${d.value}%` : d.value.toLocaleString()}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">{def.label}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={KPI_COLORS[d.kpi] ?? '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsKPIUsageChart);
