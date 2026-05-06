import React, { useMemo, useState } from 'react';
import { InsightsUsageEvent, INSIGHTS_EVENT_FRIENDLY } from '../../../types/insightsUsageTypes';
import { DragReorderSelect, OrderedSelectItem } from '../../Common/DragReorderSelect';
import { DEFAULT_INSIGHTS_CHART_ITEMS } from './insightsUsageHelpers';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

// Smooth red → yellow → green gradient at 1% resolution.
// 0% = hard red (hue 0), 100% = hard green (hue 120).
// Lightness dips slightly at the middle-yellow range so the gradient reads clearly.
function heatColor(pct: number): string {
  const p = Math.max(0, Math.min(100, pct));
  const hue = (p / 100) * 120;
  // Lighten the yellow band (40–70°) so it doesn't wash out; darken the ends for saturation.
  const lightness = 38 + Math.sin((p / 100) * Math.PI) * 14;
  return `hsl(${hue.toFixed(1)}, 75%, ${lightness.toFixed(1)}%)`;
}

// Use dark text in the yellow/lime band where background is lighter.
function textColor(pct: number): string {
  return pct >= 28 && pct <= 72 ? '#1e293b' : '#ffffff';
}

const SHORT: Record<string, string> = {
  INSIGHTS_PAGE_VIEWED:      'Page Viewed',
  SITE_FILTER_CHANGED:       'Site Filter',
  DATE_RANGE_CHANGED:        'Date Range',
  KPI_DRAWER_OPENED:         'Drawer Open',
  TREND_KPI_CHANGED:         'Trend Change',
  BENCHMARK_CONFIG_OPENED:   'Benchmark Cfg',
  BENCHMARK_UPDATED:         'Benchmark Upd',
  BULK_UPDATE:               'Bulk Update',
  LAYOUT_CONFIG_CHANGED:     'Layout Change',
  DASHBOARD_DOWNLOAD:        'Dash DL',
  KPI_DRAWER_DOWNLOAD:       'Drawer DL',
  KPI_SCHOOLIE_OPENED:       'KPI Schoolie',
  DASHBOARD_SCHOOLIE_OPENED: 'Dash Schoolie',
};

// 11 legend stops at 0, 10, 20 … 100
const LEGEND_STOPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface Props {
  events: InsightsUsageEvent[];
}

const InsightsCoOccurrenceMatrix: React.FC<Props> = ({ events }) => {
  const [expanded, setExpanded] = useState(true);
  const [items, setItems] = useState<OrderedSelectItem[]>(DEFAULT_INSIGHTS_CHART_ITEMS);

  const activeTypes = useMemo(
    () => items.filter(i => i.selected).map(i => i.value),
    [items]
  );

  const matrix = useMemo(() => {
    const sessionMap = new Map<string, Set<string>>();
    events.forEach(e => {
      if (!sessionMap.has(e.sessionId)) sessionMap.set(e.sessionId, new Set());
      sessionMap.get(e.sessionId)!.add(e.eventType);
    });

    const result: Record<string, Record<string, number>> = {};
    activeTypes.forEach(rowType => {
      result[rowType] = {};
      const sessionsWithRow = [...sessionMap.values()].filter(s => s.has(rowType));
      activeTypes.forEach(colType => {
        if (sessionsWithRow.length === 0) {
          result[rowType][colType] = 0;
        } else if (rowType === colType) {
          result[rowType][colType] = 100;
        } else {
          result[rowType][colType] = Math.round(
            (sessionsWithRow.filter(s => s.has(colType)).length / sessionsWithRow.length) * 100
          );
        }
      });
    });
    return result;
  }, [events, activeTypes]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 text-left flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="text-sm font-semibold text-slate-700">Co-occurrence Matrix</span>
          <span className="ml-2 text-[11px] text-gray-400">% of row-sessions that also did the column action</span>
        </button>
        <div className="flex items-center gap-2">
          <DragReorderSelect
            items={items}
            onChange={setItems}
            defaultItems={DEFAULT_INSIGHTS_CHART_ITEMS}
          />
          <button onClick={() => setExpanded(e => !e)}>
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-3 overflow-x-auto">
          <table className="text-[11px] border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr>
                {/* Empty corner cell */}
                <th className="text-left text-gray-400 font-semibold px-2 pb-2 w-32" />
                {activeTypes.map(col => (
                  <th
                    key={col}
                    className="text-center text-gray-500 font-semibold pb-2 px-1 align-bottom"
                    style={{ minWidth: 72 }}
                  >
                    {SHORT[col] ?? INSIGHTS_EVENT_FRIENDLY[col as keyof typeof INSIGHTS_EVENT_FRIENDLY] ?? col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTypes.map(row => (
                <tr key={row}>
                  <td className="py-1 text-slate-600 font-medium whitespace-nowrap text-right pr-3">
                    {SHORT[row] ?? INSIGHTS_EVENT_FRIENDLY[row as keyof typeof INSIGHTS_EVENT_FRIENDLY] ?? row}
                  </td>
                  {activeTypes.map(col => {
                    const pct = matrix[row]?.[col] ?? 0;
                    return (
                      <td key={col} className="px-1 py-1 text-center">
                        <div
                          className="rounded-md w-full h-8 flex items-center justify-center font-bold tabular-nums"
                          style={{
                            backgroundColor: heatColor(pct),
                            color: textColor(pct),
                            minWidth: 60,
                          }}
                          title={`${SHORT[row]} → ${SHORT[col]}: ${pct}%`}
                        >
                          {pct > 0 ? `${pct}%` : '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Gradient legend */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex-shrink-0">0%</span>
            <div
              className="flex-1 h-3 rounded-full"
              style={{
                background: `linear-gradient(to right, ${LEGEND_STOPS.map(p => heatColor(p)).join(', ')})`,
              }}
            />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex-shrink-0">100%</span>
          </div>
          <div className="flex justify-between mt-0.5 px-0" style={{ marginLeft: 28, marginRight: 36 }}>
            {LEGEND_STOPS.map(p => (
              <span key={p} className="text-[9px] text-gray-300">{p}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsCoOccurrenceMatrix);
