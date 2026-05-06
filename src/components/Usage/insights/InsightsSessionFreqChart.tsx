import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InsightsUsageEvent } from '../../../types/insightsUsageTypes';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const BUCKETS = [
  { label: '1 session', min: 1, max: 1 },
  { label: '2–5', min: 2, max: 5 },
  { label: '6–10', min: 6, max: 10 },
  { label: '10+', min: 11, max: Infinity },
];

const BUCKET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7'];

interface Props {
  events: InsightsUsageEvent[];
}

const InsightsSessionFreqChart: React.FC<Props> = ({ events }) => {
  const [expanded, setExpanded] = useState(true);

  const data = useMemo(() => {
    const sessionsByUser = new Map<string, Set<string>>();
    events.forEach(e => {
      if (!sessionsByUser.has(e.userId)) sessionsByUser.set(e.userId, new Set());
      sessionsByUser.get(e.userId)!.add(e.sessionId);
    });

    return BUCKETS.map((bucket, i) => ({
      label: bucket.label,
      count: [...sessionsByUser.values()].filter(s => s.size >= bucket.min && s.size <= bucket.max).length,
      color: BUCKET_COLORS[i],
    }));
  }, [events]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">Session Frequency</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {data.every(d => d.count === 0) ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">No data available</div>
          ) : (
            <>
              <p className="text-[11px] text-gray-400 mb-3">Number of users by session count</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
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
                          <p className="text-gray-500">{d.count} user{d.count !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.map((d, i) => <Cell key={i} fill={d.color} />)}
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

export default React.memo(InsightsSessionFreqChart);
