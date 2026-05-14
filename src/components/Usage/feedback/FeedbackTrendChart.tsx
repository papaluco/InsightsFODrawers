import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FeedbackRecord } from '../../../types/feedbackTypes';

type Grouping = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

function getGroupKey(dateStr: string, grouping: Grouping): string {
  switch (grouping) {
    case 'Daily':
      return dateStr;
    case 'Weekly': {
      const d = new Date(dateStr + 'T00:00:00');
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const mon = new Date(d);
      mon.setDate(d.getDate() + diff);
      return mon.toISOString().slice(0, 10);
    }
    case 'Monthly':
      return dateStr.slice(0, 7);
    case 'Yearly':
      return dateStr.slice(0, 4);
  }
}

function formatLabel(key: string, grouping: Grouping): string {
  switch (grouping) {
    case 'Daily':
      return key.slice(5);
    case 'Weekly': {
      const d = new Date(key + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    case 'Monthly': {
      const [y, m] = key.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, 1)
        .toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    case 'Yearly':
      return key;
  }
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface Props {
  data: FeedbackRecord[];
}

const GROUPINGS: Grouping[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const FeedbackTrendChart: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(true);
  const [grouping, setGrouping] = useState<Grouping>('Monthly');

  const trendData = useMemo(() => {
    const map = new Map<string, { helpful: number; notHelpful: number }>();
    data.forEach(r => {
      const key = getGroupKey(r.createdAt.slice(0, 10), grouping);
      const cur = map.get(key) ?? { helpful: 0, notHelpful: 0 };
      if (r.feedbackValue === 'thumbs_up') cur.helpful++;
      else cur.notHelpful++;
      map.set(key, cur);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, counts]) => ({
        date: formatLabel(key, grouping),
        Helpful: counts.helpful,
        'Not Helpful': counts.notHelpful,
      }));
  }, [data, grouping]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 rounded-xl">
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-expanded={expanded}
        >
          <h4 className="text-sm font-semibold text-gray-900">Feedback Trend Over Time</h4>
        </button>
        <div className="ml-4 flex shrink-0 items-center gap-3">
          {expanded && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              {GROUPINGS.map(g => (
                <button
                  key={g}
                  onClick={e => { e.stopPropagation(); setGrouping(g); }}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    grouping === g
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={expanded ? 'Collapse chart' : 'Expand chart'}
          >
            <ChevronIcon expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {!trendData.length ? (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400 italic">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Helpful" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Not Helpful" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackTrendChart;
