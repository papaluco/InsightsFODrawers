import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InsightsUsageEvent } from '../../../types/insightsUsageTypes';
import { INSIGHT_FUNNELS, computeFunnelSteps } from './insightsUsageHelpers';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const FUNNEL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7'];

interface Props {
  events: InsightsUsageEvent[];
}

const InsightsFunnelChart: React.FC<Props> = ({ events }) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedId, setSelectedId] = useState(INSIGHT_FUNNELS[0].id);

  const selectedFunnel = INSIGHT_FUNNELS.find(f => f.id === selectedId) ?? INSIGHT_FUNNELS[0];

  const steps = useMemo(
    () => computeFunnelSteps(events, selectedFunnel),
    [events, selectedFunnel]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 flex items-center text-left hover:opacity-80 transition-opacity"
        >
          <span className="text-sm font-semibold text-slate-700">Engagement Funnel</span>
        </button>
        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="text-sm font-semibold text-slate-700 border border-gray-200 rounded-lg px-2.5 py-1 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
          >
            {INSIGHT_FUNNELS.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button onClick={() => setExpanded(e => !e)}>
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <p className="text-[11px] text-gray-400 italic mb-3">
            {selectedFunnel.description}
          </p>

          {steps.length === 0 || steps.every(s => s.count === 0) ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">
              No data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={steps} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as typeof steps[0];
                      return (
                        <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                          <p className="font-semibold text-slate-700">{d.label}</p>
                          <p className="text-gray-500">
                            {d.count.toLocaleString()} sessions ({d.pct.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {steps.map((_, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Drop-off row */}
              <div className="flex gap-3 mt-2 flex-wrap">
                {steps.slice(1).map((step, i) => {
                  const prev = steps[i];
                  const dropPct = prev.count > 0
                    ? ((prev.count - step.count) / prev.count) * 100
                    : 0;
                  return (
                    <div key={step.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <span className="font-medium text-slate-600">
                        {prev.label} → {step.label}:
                      </span>
                      <span className="font-bold text-rose-500">
                        -{dropPct.toFixed(0)}% drop
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsFunnelChart);
