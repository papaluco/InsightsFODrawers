import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { MenuMetricUsageStat } from '../../../types/menuUsageTypes';
import { USAGE_ICONS, CHART_COLORS } from '../common/usageHelpers';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  data: MenuMetricUsageStat[];
}

const MenuMetricUsageChart: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(true);

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <USAGE_ICONS.Filters size={16} className="text-violet-500" />
          <span className="text-sm font-semibold text-gray-900">Metric Usage</span>
          {total > 0 && (
            <span className="text-xs text-gray-400 font-normal">{total.toLocaleString()} metric selections</span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {total === 0 ? (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No metric selection events</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis
                    type="category"
                    dataKey="metric"
                    tick={{ fontSize: 11, fill: '#374151' }}
                    width={130}
                  />
                  <Tooltip
                    formatter={(value) => { const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                      return [`${numericValue.toLocaleString()} selections`]; }}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-1.5">
                {data.map((d, i) => (
                  <div key={d.metric} className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-gray-700">{d.metric}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{d.count.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 w-10 text-right">{d.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuMetricUsageChart;
