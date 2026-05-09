import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppUsageEvent } from '../../../types/appUsageTypes';
import { APP_EVENT_COLORS, PAGE_COLORS, APP_ICONS, TAB_COLORS } from './appUsageHelpers';

type Grouping = 'daily' | 'weekly' | 'monthly';
type CountMode = 'sessions' | 'pageViews'; // Added count mode type

interface Props {
  events: AppUsageEvent[];
}

const SESSIONS_COLOR = APP_EVENT_COLORS.REPORT_DISTRIBUTED; // #8b5cf6
const PAGE_VIEWS_COLOR = APP_EVENT_COLORS.PAGE_VIEWED;      // #6366f1
const TAB_COLOR = TAB_COLORS.Overview;      // #6366f1
const TIME_ANALYSIS_COLOR = PAGE_COLORS.TimeAnalysis;      // Teal #14b8a6
const SectionIcon = APP_ICONS.SESSIONS; // Assuming you have an icon defined for this in your helpers

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
  const [countMode, setCountMode] = useState<CountMode>('sessions'); // Added state

  const chartData = useMemo(() => {
    // Map of Period -> Map of UserID -> { sessions: Set, pageViews: number }
    const periods = new Map<string, Map<string, { sessions: Set<string>; pageViews: number }>>();

    for (const e of events) {
      const periodKey = formatPeriodKey(e.timestamp, grouping);

      if (!periods.has(periodKey)) periods.set(periodKey, new Map());
      const period = periods.get(periodKey)!;

      if (!period.has(e.userId)) {
        period.set(e.userId, { sessions: new Set(), pageViews: 0 });
      }
      
      const userStats = period.get(e.userId)!;
      userStats.sessions.add(e.sessionId);
      if (e.eventType === 'PAGE_VIEWED') {
        userStats.pageViews++;
      }
    }

    const userMetrics = new Map<string, number>();

    periods.forEach(period => {
      period.forEach((stats, userId) => {
        const value = countMode === 'sessions' ? stats.sessions.size : stats.pageViews;
        userMetrics.set(userId, (userMetrics.get(userId) ?? 0) + value);
      });
    });

    const frequencyMap = new Map<number, number>();

    userMetrics.forEach(count => {
      if (count > 0) { // Only chart users who have activity in the selected mode
        frequencyMap.set(count, (frequencyMap.get(count) ?? 0) + 1);
      }
    });

    return Array.from(frequencyMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([count, users]) => ({
        count,
        label: `${count}`,
        users,
      }));
  }, [events, grouping, countMode]);

  const modeLabel = countMode === 'sessions' ? 'Sessions' : 'Page Views';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex w-full items-center justify-between px-5 py-4">
        <button onClick={() => setExpanded(e => !e)} className="text-left focus:outline-none flex-1 flex items-center gap-2">
          {/* Topic Icon */}
          <SectionIcon size={16} style={{ color: TAB_COLOR }} />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">User Activity Distribution</h4>
            <p className="text-xs text-gray-400 mt-0.5">Users by number of {countMode === 'sessions' ? 'sessions' : 'page views'}</p>
          </div>
        </button>
        
        <div className="flex items-center gap-4">
          {/* Page Views / Sessions Toggle (Copied style from Timing Panel) */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold shadow-sm mr-4">
            <button
              onClick={() => setCountMode('pageViews')}
              className="px-2.5 py-1 transition-all"
              style={{
                backgroundColor: countMode === 'pageViews' ? PAGE_VIEWS_COLOR : '#fff',
                color: countMode === 'pageViews' ? '#fff' : '#64748b'
              }}
            >
              Page Views
            </button>
            <button
              onClick={() => setCountMode('sessions')}
              className="px-2.5 py-1 transition-all border-l border-gray-200"
              style={{
                backgroundColor: countMode === 'sessions' ? SESSIONS_COLOR : '#fff',
                color: countMode === 'sessions' ? '#fff' : '#64748b'
              }}
            >
              Sessions
            </button>
          </div>

          { }
          <div className="flex items-center gap-2">
            {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
              <button
                key={g}
                onClick={() => setGrouping(g)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                style={{
                  backgroundColor: grouping === g ? TIME_ANALYSIS_COLOR : 'transparent',
                  color: grouping === g ? '#fff' : '#94a3b8', // White text when active, slate when not
                }}
              >
                {g}
              </button>
            ))}
          </div>

          <button onClick={() => setExpanded(e => !e)}>
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-2">
          {chartData.length === 0 ? (
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
                  labelFormatter={(label) => `${label} ${modeLabel.toLowerCase()}`}
                />
                <Bar dataKey="users" fill={countMode === 'sessions' ? SESSIONS_COLOR : PAGE_VIEWS_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default AppSessionFreqChart;