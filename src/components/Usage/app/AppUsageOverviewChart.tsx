import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AppUsageEvent } from '../../../types/appUsageTypes';

type Grouping = 'daily' | 'weekly' | 'monthly';
type Metric = 'sessions' | 'users' | 'districts';

interface Props {
  events: AppUsageEvent[];
}

function formatKey(ts: string, grouping: Grouping): string {
  const d = new Date(ts);
  if (grouping === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (grouping === 'weekly') {
    const week = new Date(d);
    week.setDate(week.getDate() - week.getDay());
    return week.toISOString().slice(0, 10);
  }
  return ts.slice(0, 10);
}

function formatLabel(key: string, grouping: Grouping): string {
  if (grouping === 'monthly') {
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  const d = new Date(key);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const AppUsageOverviewChart: React.FC<Props> = ({ events }) => {
  const [expanded, setExpanded] = useState(true);
  const [grouping, setGrouping] = useState<Grouping>('daily');
  const [metrics, setMetrics] = useState<Set<Metric>>(new Set(['sessions', 'users']));

  const chartData = useMemo(() => {
    const buckets = new Map<string, { sessions: Set<string>; users: Set<string>; districts: Set<string> }>();

    for (const e of events) {
      if (e.eventType !== 'PAGE_VIEWED') continue;
      const key = formatKey(e.timestamp, grouping);
      if (!buckets.has(key)) buckets.set(key, { sessions: new Set(), users: new Set(), districts: new Set() });
      const b = buckets.get(key)!;
      b.sessions.add(e.sessionId);
      b.users.add(e.userId);
      b.districts.add(e.districtId);
    }

    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, b]) => ({
      key,
      label: formatLabel(key, grouping),
      sessions: b.sessions.size,
      users: b.users.size,
      districts: b.districts.size,
    }));
  }, [events, grouping]);

  const toggleMetric = (m: Metric) =>
    setMetrics(prev => {
      const next = new Set(prev);
      if (next.has(m)) { if (next.size > 1) next.delete(m); } else next.add(m);
      return next;
    });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex w-full items-center justify-between px-5 py-4">
        <button onClick={() => setExpanded(e => !e)} className="text-left focus:outline-none flex-1">
          <h4 className="text-sm font-semibold text-gray-900">Usage Over Time</h4>
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
          {/* Metric toggles */}
          <div className="flex items-center gap-3 mb-3">
            {(
              [
                { key: 'sessions', color: '#6366f1', label: 'Sessions' },
                { key: 'users', color: '#10b981', label: 'Active Users' },
                { key: 'districts', color: '#f59e0b', label: 'Active Districts' },
              ] as const
            ).map(({ key, color, label }) => (
              <button
                key={key}
                onClick={() => toggleMetric(key)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border transition-all ${metrics.has(key) ? 'border-transparent' : 'border-gray-200 opacity-40'}`}
                style={metrics.has(key) ? { backgroundColor: `${color}15`, color } : {}}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </button>
            ))}
          </div>

          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {metrics.has('sessions') && <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" strokeWidth={2} dot={false} />}
                {metrics.has('users') && <Line type="monotone" dataKey="users" name="Active Users" stroke="#10b981" strokeWidth={2} dot={false} />}
                {metrics.has('districts') && <Line type="monotone" dataKey="districts" name="Active Districts" stroke="#f59e0b" strokeWidth={2} dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default AppUsageOverviewChart;
