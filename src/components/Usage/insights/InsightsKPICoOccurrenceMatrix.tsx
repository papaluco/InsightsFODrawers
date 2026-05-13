import React, { useMemo, useState } from 'react';
import { InsightsUsageEvent } from '../../../types/insightsUsageTypes';
import { KPI_COLORS } from '../../Usage/common/usageHelpers';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function heatColor(pct: number): string {
  const p = Math.max(0, Math.min(100, pct));
  const hue = (p / 100) * 120;
  const lightness = 38 + Math.sin((p / 100) * Math.PI) * 14;
  return `hsl(${hue.toFixed(1)}, 75%, ${lightness.toFixed(1)}%)`;
}

function textColor(pct: number): string {
  return pct >= 28 && pct <= 72 ? '#1e293b' : '#ffffff';
}

const LEGEND_STOPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

type FilterMode = 'available' | 'rendered' | 'hidden' | 'drawer';

const FILTER_OPTS: { value: FilterMode; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'rendered', label: 'Rendered' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'drawer', label: 'Drawer Opened' },
];

interface Props {
  events: InsightsUsageEvent[];
}

const InsightsKPICoOccurrenceMatrix: React.FC<Props> = ({ events }) => {
  const [expanded, setExpanded] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('rendered');

  // Build per-KPI session sets for each filter mode
  const kpiSessionSets = useMemo(() => {
    const sets: Record<FilterMode, Map<string, Set<string>>> = {
      available: new Map(),
      rendered: new Map(),
      hidden: new Map(),
      drawer: new Map(),
    };

    events.forEach(e => {
      const kpi = e.context.kpi;
      if (!kpi) return;

      if (e.eventType === 'KPI_RENDERED') {
        if (!sets.available.has(kpi)) sets.available.set(kpi, new Set());
        sets.available.get(kpi)!.add(e.sessionId);

        if (!e.context.notRendered) {
          if (!sets.rendered.has(kpi)) sets.rendered.set(kpi, new Set());
          sets.rendered.get(kpi)!.add(e.sessionId);
        } else {
          if (!sets.hidden.has(kpi)) sets.hidden.set(kpi, new Set());
          sets.hidden.get(kpi)!.add(e.sessionId);
        }
      }

      if (e.eventType === 'KPI_DRAWER_OPENED') {
        if (!sets.drawer.has(kpi)) sets.drawer.set(kpi, new Set());
        sets.drawer.get(kpi)!.add(e.sessionId);
      }
    });

    return sets;
  }, [events]);

  const activeKpis = useMemo(() => {
    const map = kpiSessionSets[filterMode];
    return [...map.keys()].filter(k => (map.get(k)?.size ?? 0) > 0).sort();
  }, [kpiSessionSets, filterMode]);

  const matrix = useMemo(() => {
    const map = kpiSessionSets[filterMode];
    const result: Record<string, Record<string, number>> = {};
    activeKpis.forEach(rowKpi => {
      result[rowKpi] = {};
      const rowSessions = map.get(rowKpi) ?? new Set<string>();
      activeKpis.forEach(colKpi => {
        if (rowKpi === colKpi) { result[rowKpi][colKpi] = 100; return; }
        if (rowSessions.size === 0) { result[rowKpi][colKpi] = 0; return; }
        const colSessions = map.get(colKpi) ?? new Set<string>();
        const overlap = [...rowSessions].filter(sid => colSessions.has(sid)).length;
        result[rowKpi][colKpi] = Math.round((overlap / rowSessions.size) * 100);
      });
    });
    return result;
  }, [kpiSessionSets, filterMode, activeKpis]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 text-left flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="text-sm font-semibold text-slate-700">KPI Co-occurrence Matrix</span>
          <span className="ml-2 text-[11px] text-gray-400">% of row-sessions that also included the column KPI</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
            {FILTER_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterMode(opt.value)}
                className={`px-2.5 py-1 transition-colors ${filterMode === opt.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => setExpanded(e => !e)}>
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-3 overflow-x-auto">
          {activeKpis.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm italic">
              No data for the selected filter.
            </div>
          ) : (
            <>
              <table className="text-[11px] border-collapse" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th className="text-left text-gray-400 font-semibold px-2 pb-2 w-20" />
                    {activeKpis.map(col => (
                      <th
                        key={col}
                        className="text-center text-gray-500 font-bold pb-2 px-1 align-bottom"
                        style={{ minWidth: 60 }}
                      >
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{ color: KPI_COLORS[col] ?? '#6366f1' }}
                        >
                          {col}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeKpis.map(row => (
                    <tr key={row}>
                      <td className="py-1 font-bold whitespace-nowrap text-right pr-3" style={{ color: KPI_COLORS[row] ?? '#6366f1' }}>
                        {row}
                      </td>
                      {activeKpis.map(col => {
                        const pctVal = matrix[row]?.[col] ?? 0;
                        return (
                          <td key={col} className="px-1 py-1 text-center">
                            <div
                              className="rounded-md w-full h-8 flex items-center justify-center font-bold tabular-nums"
                              style={{
                                backgroundColor: heatColor(pctVal),
                                color: textColor(pctVal),
                                minWidth: 48,
                              }}
                              title={`${row} → ${col}: ${pctVal}%`}
                            >
                              {pctVal > 0 ? `${pctVal}%` : '—'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider flex-shrink-0">0%</span>
                <div
                  className="flex-1 h-3 rounded-full"
                  style={{ background: `linear-gradient(to right, ${LEGEND_STOPS.map(p => heatColor(p)).join(', ')})` }}
                />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider flex-shrink-0">100%</span>
              </div>
              <div className="flex justify-between mt-0.5 px-0" style={{ marginLeft: 28, marginRight: 36 }}>
                {LEGEND_STOPS.map(p => (
                  <span key={p} className="text-[9px] text-gray-300">{p}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsKPICoOccurrenceMatrix);
