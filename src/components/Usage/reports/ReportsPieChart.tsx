import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, pct, TOPIC_COLORS } from '../../Usage/common/usageHelpers';

export interface ReportPieItem {
  name: string;
  value: number;
}

interface Props {
  data: ReportPieItem[];
  title: string;
  colors?: string[];
  onSegmentClick?: (name: string) => void;
  emptyMessage?: string;
  // New Optional Props
  subText?: string;
  icon?: React.ElementType; 
  primaryColor?: string; // New optional prop for specific branding
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ReportPieItem; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{d.name}</p>
      <p className="text-gray-500">{d.value.toLocaleString()} events</p>
    </div>
  );
};

const ReportsPieChart: React.FC<Props> = ({ 
  data, 
  title, 
  colors = CHART_COLORS, 
  onSegmentClick, 
  emptyMessage,
  subText,
  icon: Icon, // Rename to capital for JSX usage
  primaryColor
}) => {
  const [expanded, setExpanded] = useState(true);

  const total = data.reduce((s, d) => s + d.value, 0);
  const isEmpty = total === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50">
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="min-w-0 flex-1 flex items-center gap-2.5 text-left focus:outline-none"
        >
          {/* Render Icon if provided */}
          {Icon && (
            <Icon 
              size={16} 
              style={{ color: primaryColor ?? TOPIC_COLORS.Events }} 
            />
          )}
          
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          
          {/* Render Subtext if provided */}
          {subText && <span className="text-[11px] text-gray-400">{subText}</span>}
        </button>
        <button type="button" onClick={() => setExpanded(e => !e)} className="ml-4">
          <CollapseChevron expanded={expanded} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {isEmpty ? (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">
              {emptyMessage ?? 'No data available'}
            </div>
          ) : (
            <div className="flex justify-center items-center py-2">
              <div className="flex items-center gap-10"> 
                
                <div style={{ width: 148, height: 148, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={64}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        onClick={
                          onSegmentClick
                            ? (entry) => {
                                if (typeof entry.name === 'string') {
                                  onSegmentClick(entry.name);
                                }
                              }
                            : undefined
                        }
                        className={onSegmentClick ? 'cursor-pointer' : ''}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        <Label
                          content={(props) => {
                            const vb = props.viewBox as { cx: number; cy: number };
                            return (
                              <g>
                                <text x={vb.cx} y={vb.cy - 7} textAnchor="middle" fill="#111827" fontSize="20" fontWeight="700">
                                  {total.toLocaleString()}
                                </text>
                                <text x={vb.cx} y={vb.cy + 10} textAnchor="middle" fill="#9ca3af" fontSize="10">
                                  Total
                                </text>
                              </g>
                            );
                          }}
                          position="center"
                        />
                        {data.map((_, i) => (
                          <Cell key={i} fill={colors[i % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-64 space-y-1">
                  {data.map((item, i) => (
                    <button
                      key={item.name}
                      onClick={() => onSegmentClick?.(item.name)}
                      className={`w-full flex items-center py-1.5 px-2 rounded-lg transition-colors text-left ${
                        onSegmentClick ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0 mr-3" 
                        style={{ backgroundColor: colors[i % colors.length] }} 
                      />
                      
                      <span className="text-xs text-gray-600 truncate flex-1 font-medium">
                        {item.name}
                      </span>
                      
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-sm font-bold text-gray-800 tabular-nums text-right w-12">
                          {item.value.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 text-right w-10">
                          {pct(item.value, total)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPieChart;