import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { InsightsUsageEvent, InsightsUserStatRow } from '../../../types/insightsUsageTypes';
import { getTimeOfDay, TIME_OF_DAY_COLORS, TIME_OF_DAY_LABELS, TIME_OF_DAY_ORDER } from '../../../utils/timeOfDay';

type Granularity = 'day' | 'week' | 'month';
type TimeMode = 'district' | 'server';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function getBucket(isoTimestamp: string, granularity: Granularity): string {
  const date = new Date(isoTimestamp);
  if (granularity === 'day') return isoTimestamp.slice(0, 10);
  if (granularity === 'month') return isoTimestamp.slice(0, 7);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function formatBucketLabel(bucket: string, granularity: Granularity): string {
  if (granularity === 'month') {
    const [y, m] = bucket.split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  const date = new Date(bucket + 'T12:00:00');
  if (granularity === 'week') {
    return `Wk ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  data: InsightsUserStatRow[];
  events: InsightsUsageEvent[];
  districtTimezones: Record<string, string>;
}

const GRAN_OPTS: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const InsightsUserActivityTrend: React.FC<Props> = ({ data, events, districtTimezones }) => {
  const [expanded, setExpanded] = useState(true);
  const [granularity, setGranularity] = useState<Granularity>('week');
  const [timeMode, setTimeMode] = useState<TimeMode>('district');

  const chartData = useMemo(() => {
    const userIdSet = new Set(data.map(u => u.userId));
    if (userIdSet.size === 0) return [];

    const bucketMap = new Map<string, { morning: number; afternoon: number; evening: number }>();

    events
      .filter(e => userIdSet.has(e.userId))
      .forEach(e => {
        const bucket = getBucket(e.timestamp, granularity);
        const tz = timeMode === 'district' ? districtTimezones[e.districtId] : undefined;
        const tod = getTimeOfDay(e.timestamp, tz);

        if (!bucketMap.has(bucket)) bucketMap.set(bucket, { morning: 0, afternoon: 0, evening: 0 });
        bucketMap.get(bucket)![tod]++;
      });

    return [...bucketMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucket, counts]) => ({
        label: formatBucketLabel(bucket, granularity),
        ...counts,
      }));
  }, [data, events, granularity, timeMode, districtTimezones]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 text-left flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="text-sm font-semibold text-slate-700">User Activity Trend</span>
          <span className="ml-2 text-[11px] text-gray-400">Activity by time of day per period</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
            <button
              onClick={() => setTimeMode('district')}
              className={`px-2.5 py-1 transition-colors ${timeMode === 'district' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              District Time
            </button>
            <button
              onClick={() => setTimeMode('server')}
              className={`px-2.5 py-1 transition-colors ${timeMode === 'server' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Server Time
            </button>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
            {GRAN_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGranularity(opt.value)}
                className={`px-2.5 py-1 transition-colors ${granularity === opt.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => setExpanded(e => !e)}>
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-3">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const total = payload.reduce((s, p) => s + ((p.value as number) ?? 0), 0);
                    return (
                      <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs min-w-[160px]">
                        <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
                        {TIME_OF_DAY_ORDER.map(tod => {
                          const entry = payload.find(p => p.dataKey === tod);
                          const val = (entry?.value as number) ?? 0;
                          return (
                            <div key={tod} className="flex items-center justify-between gap-3 py-0.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIME_OF_DAY_COLORS[tod] }} />
                                <span className="text-gray-500">{tod.charAt(0).toUpperCase() + tod.slice(1)}</span>
                              </div>
                              <span className="font-medium text-slate-700 tabular-nums">
                                {val} {total > 0 ? `(${((val / total) * 100).toFixed(0)}%)` : ''}
                              </span>
                            </div>
                          );
                        })}
                        <div className="border-t border-gray-100 mt-1.5 pt-1.5 flex justify-between font-semibold">
                          <span className="text-gray-500">Total</span>
                          <span className="text-slate-700 tabular-nums">{total}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-[11px] text-slate-600">
                      {TIME_OF_DAY_LABELS[value as keyof typeof TIME_OF_DAY_LABELS] ?? value}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: 8 }}
                />
                <Bar dataKey="morning" stackId="tod" fill={TIME_OF_DAY_COLORS.morning} name="morning" radius={[0, 0, 0, 0]} />
                <Bar dataKey="afternoon" stackId="tod" fill={TIME_OF_DAY_COLORS.afternoon} name="afternoon" radius={[0, 0, 0, 0]} />
                <Bar dataKey="evening" stackId="tod" fill={TIME_OF_DAY_COLORS.evening} name="evening" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsUserActivityTrend);
