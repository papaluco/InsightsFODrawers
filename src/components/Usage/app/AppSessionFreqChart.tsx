import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppUsageEvent } from '../../../types/appUsageTypes';

type Grouping = 'daily' | 'weekly' | 'monthly';

interface Props {
  events: AppUsageEvent[];
}

function formatPeriodKey(ts: string, grouping: Grouping): string {
  const d = new Date(ts);
  if (grouping === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (grouping === 'weekly') {
    const w = new Date(d);
    w.setDate(w.getDate() - w.getDay());
    return w.toISOString().slice(0, 10);
  }
  return ts.slice(0, 10);
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const AppSessionFreqChart: React.FC<Props> = ({ events }) => {
  const [expanded, setExpanded] = useState(true);
  const [grouping, setGrouping] = useState<Grouping>('monthly');

const chartData = useMemo(() => {
  const periods = new Map<string, Map<string, Set<string>>>();

  for (const e of events) {
    if (e.eventType !== 'PAGE_VIEWED') continue;

    const periodKey = formatPeriodKey(e.timestamp, grouping);

    if (!periods.has(periodKey)) periods.set(periodKey, new Map());

    const period = periods.get(periodKey)!;

    if (!period.has(e.userId)) period.set(e.userId, new Set());

    period.get(e.userId)!.add(e.sessionId);
  }

  const userSessionCounts = new Map<string, number>();

  periods.forEach(period => {
    period.forEach((sessions, userId) => {
      userSessionCounts.set(
        userId,
        (userSessionCounts.get(userId) ?? 0) + sessions.size
      );
    });
  });

  const frequencyMap = new Map<number, number>();

  userSessionCounts.forEach(sessionCount => {
    frequencyMap.set(
      sessionCount,
      (frequencyMap.get(sessionCount) ?? 0) + 1
    );
  });

  return Array.from(frequencyMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([sessionCount, users]) => ({
      sessionCount,
      label: `${sessionCount}`,
      users,
    }));
}, [events, grouping]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex w-full items-center justify-between px-5 py-4">
        <button onClick={() => setExpanded(e => !e)} className="text-left focus:outline-none flex-1">
          <h4 className="text-sm font-semibold text-gray-900">Session Frequency Distribution</h4>
          <p className="text-xs text-gray-400 mt-0.5">Users by number of sessions</p>
        </button>
        <div className="flex items-center gap-2">
          {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
            <button
              key={g}
              onClick={() => setGrouping(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${grouping === g ? 'bg-teal-100 text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {g}
            </button>
          ))}
          <button onClick={() => setExpanded(e => !e)}>
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-2">
          {chartData.every(d => d.users === 0) ? (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(value) => [`${Number(value ?? 0)} users`, 'Users']}
                    labelFormatter={(label) => `${label} sessions`}
                  />
                <Bar dataKey="users" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default AppSessionFreqChart;
