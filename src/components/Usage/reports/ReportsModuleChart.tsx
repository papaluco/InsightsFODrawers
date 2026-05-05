import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ReportUsageEvent } from '../../../types/reportUsageTypes';

interface Props {
  events: ReportUsageEvent[];
  onBarClick?: (module: string) => void;
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const BAR_COLOR = '#6366f1';

const ReportsModuleChart: React.FC<Props> = ({ events, onBarClick }) => {
  const [expanded, setExpanded] = useState(true);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      const m = e.context.module || 'Unknown';
      counts[m] = (counts[m] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">By Module</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                        <p className="font-semibold text-slate-700">{(payload[0].payload as { name: string }).name}</p>
                        <p className="text-gray-500">{payload[0].value?.toLocaleString()} events</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(d) => onBarClick?.(d.name as string)} style={{ cursor: onBarClick ? 'pointer' : 'default' }}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR} opacity={0.9 - i * 0.07} />
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

export default ReportsModuleChart;
