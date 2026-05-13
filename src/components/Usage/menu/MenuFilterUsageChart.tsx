import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { MenuFilterUsageStat } from '../../../types/menuUsageTypes';
import { USAGE_ICONS, EVENT_COLORS } from '../common/usageHelpers';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  data: MenuFilterUsageStat[];
  onBarClick?: (stat: MenuFilterUsageStat) => void;
}

const MenuFilterUsageChart: React.FC<Props> = ({ data, onBarClick }) => {
  const [expanded, setExpanded] = useState(true);

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <USAGE_ICONS.Filters size={16} className="text-teal-500" />
          <span className="text-sm font-semibold text-gray-900">Filter Usage</span>
          {total > 0 && (
            <span className="text-xs text-gray-400 font-normal">{total.toLocaleString()} filter events</span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {total === 0 ? (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No filter events</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis
                    type="category"
                    dataKey="filter"
                    tick={{ fontSize: 11, fill: '#374151' }}
                    width={160}
                    />
                    <Tooltip
                      formatter={(value) => {
                        const numericValue =
                          typeof value === 'number' ? value : Number(value ?? 0);

                        return [`${numericValue.toLocaleString()} uses`, 'Uses'];
                      }}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                      }}
                    />

                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={22}
                      onClick={(_, index) => {
                        const item = data[index];

                        if (!item) return;

                        onBarClick?.(item);
                      }}
                      style={{ cursor: onBarClick ? 'pointer' : undefined }}
                    >
                      {data.map((d) => (
                        <Cell
                          key={d.eventType}
                          fill={EVENT_COLORS[d.eventType] ?? '#64748b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-1.5">
                {data.map(d => (
                  <button
                    key={d.eventType}
                    onClick={() => onBarClick?.(d)}
                    className="w-full flex items-center justify-between px-1 py-0.5 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: EVENT_COLORS[d.eventType] ?? '#64748b' }} />
                      <span className="text-sm text-gray-700">{d.filter}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{d.count.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuFilterUsageChart;
