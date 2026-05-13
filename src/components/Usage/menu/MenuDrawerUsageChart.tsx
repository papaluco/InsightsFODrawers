import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { MenuDrawerUsageStat } from '../../../types/menuUsageTypes';
import { USAGE_ICONS, getTopicColor } from '../common/usageHelpers';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  data: MenuDrawerUsageStat[];
  onMenuItemsClick?: () => void;
  onSchoolPerfClick?: () => void;
}

const RADIAN = Math.PI / 180;

const renderLabel = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  } = props;

  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof innerRadius !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof percent !== 'number'
  ) {
    return null;
  }

  if (percent < 0.05) return null;

  const r = innerRadius + (outerRadius - innerRadius) * 0.55;

  const x = cx + r * Math.cos(-midAngle * RADIAN);

  const y = cy + r * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MenuDrawerUsageChart: React.FC<Props> = ({ data, onMenuItemsClick, onSchoolPerfClick }) => {
  const [expanded, setExpanded] = useState(true);

  const total = data.reduce((s, d) => s + d.count, 0);

  const handleSliceClick = (entry: MenuDrawerUsageStat) => {
    if (entry.drawerType === 'Menu Items') onMenuItemsClick?.();
    if (entry.drawerType === 'School Performance') onSchoolPerfClick?.();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <USAGE_ICONS.Chart size={16} className="text-orange-500" />
          <span className="text-sm font-semibold text-gray-900">Drawer Usage</span>
          {total > 0 && (
            <span className="text-xs text-gray-400 font-normal">{total.toLocaleString()} total opens</span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-2">
          {total === 0 ? (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No drawer events</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="count"
                      nameKey="drawerType"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      labelLine={false}
                      label={renderLabel}
                      style={{ cursor: 'pointer' }}
                    >
                      {data.map((entry) => (
                        <Cell
                          key={entry.drawerType}
                          fill={getTopicColor(entry.drawerType) ?? '#64748b'}
                          onClick={() => handleSliceClick(entry)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                    formatter={(value, name) => {
  const numericValue =
    typeof value === 'number' ? value : Number(value ?? 0);

  return [
    `${numericValue.toLocaleString()} opens`,
    String(name ?? ''),
  ];
}}
                    
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-2">
                {data.map(d => (
                  <button
                    key={d.drawerType}
                    onClick={() => handleSliceClick(d)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getTopicColor(d.drawerType) ?? '#64748b' }} />
                      <span className="text-sm text-gray-700">{d.drawerType}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{d.count.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 w-10 text-right">{d.percent}%</span>
                    </div>
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

export default MenuDrawerUsageChart;
