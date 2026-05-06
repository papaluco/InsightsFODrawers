import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InsightsDistrictStatRow } from '../../../types/insightsUsageTypes';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const BUCKETS = [
  { label: '1–5',   min: 1,  max: 5 },
  { label: '6–15',  min: 6,  max: 15 },
  { label: '16–30', min: 16, max: 30 },
  { label: '31+',   min: 31, max: Infinity },
];

const BUCKET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7'];

interface Props {
  data: InsightsDistrictStatRow[];
}

const InsightsDistrictSessionFreqChart: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(true);

  const chartData = useMemo(() =>
    BUCKETS.map((bucket, i) => ({
      label: bucket.label,
      count: data.filter(d => d.sessions >= bucket.min && d.sessions <= bucket.max).length,
      color: BUCKET_COLORS[i],
    })),
    [data]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">District Session Frequency</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {data.length === 0 || chartData.every(d => d.count === 0) ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">No data available</div>
          ) : (
            <>
              <p className="text-[11px] text-gray-400 mb-3">Number of districts by total session count</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as { label: string; count: number };
                      return (
                        <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                          <p className="font-semibold text-slate-700">{d.label} sessions</p>
                          <p className="text-gray-500">{d.count} district{d.count !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsDistrictSessionFreqChart);
