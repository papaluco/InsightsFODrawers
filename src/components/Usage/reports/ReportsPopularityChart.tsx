import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ReportStatRow } from '../../../types/reportUsageTypes';

type Metric = 'views' | 'runs' | 'downloads';

interface Props {
  data: ReportStatRow[];
  onBarClick?: (reportName: string) => void;
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const METRIC_COLORS: Record<Metric, string> = {
  views: '#6366f1',
  runs: '#10b981',
  downloads: '#f59e0b',
};

const ReportsPopularityChart: React.FC<Props> = ({ data, onBarClick }) => {
  const [expanded, setExpanded] = useState(true);
  const [metric, setMetric] = useState<Metric>('views');

  const top10 = [...data]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 10)
    .map(r => ({ name: r.reportName.length > 22 ? r.reportName.slice(0, 22) + '…' : r.reportName, fullName: r.reportName, value: r[metric] }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">Report Popularity</span>
        <div className="flex items-center gap-3">
          {expanded && (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              {(['views', 'runs', 'downloads'] as Metric[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors ${metric === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
          <CollapseChevron expanded={expanded} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {top10.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={top10} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                        <p className="font-semibold text-slate-700">{(payload[0].payload as { fullName: string }).fullName}</p>
                        <p className="text-gray-500">{payload[0].value?.toLocaleString()} {metric}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(d) => onBarClick?.(d.fullName as string)} style={{ cursor: onBarClick ? 'pointer' : 'default' }}>
                  {top10.map((_, i) => <Cell key={i} fill={METRIC_COLORS[metric]} opacity={0.85 - i * 0.04} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPopularityChart;
