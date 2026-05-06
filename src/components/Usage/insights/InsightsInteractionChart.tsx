import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InsightsUsageEvent, INSIGHTS_EVENT_FRIENDLY } from '../../../types/insightsUsageTypes';
import { INSIGHTS_EVENT_COLORS, DEFAULT_INSIGHTS_CHART_ITEMS } from './insightsUsageHelpers';
import { DragReorderSelect, OrderedSelectItem } from '../../Common/DragReorderSelect';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  events: InsightsUsageEvent[];
  onBarClick?: (eventType: string) => void;
}

const InsightsInteractionChart: React.FC<Props> = ({ events, onBarClick }) => {
  const [expanded, setExpanded] = useState(true);
  const [items, setItems] = useState<OrderedSelectItem[]>(DEFAULT_INSIGHTS_CHART_ITEMS);

  const data = useMemo(() => {
    const counts = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] ?? 0) + 1;
      return acc;
    }, {});

    return items
      .filter(item => item.selected)
      .map(item => ({
        fullLabel: item.label,
        eventType: item.value,
        count: counts[item.value] ?? 0,
      }));
  }, [events, items]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 text-left flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="text-sm font-semibold text-slate-700">Interaction Breakdown</span>
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
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="fullLabel"
                  width={180}
                  interval={0}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { fullLabel: string; count: number };
                    return (
                      <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                        <p className="font-semibold text-slate-700">{d.fullLabel}</p>
                        <p className="text-gray-500">{d.count.toLocaleString()} events</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  onClick={d => onBarClick?.(d.eventType as string)}
                  style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={INSIGHTS_EVENT_COLORS[d.eventType] ?? '#6366f1'} opacity={0.85} />
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

export default InsightsInteractionChart;
