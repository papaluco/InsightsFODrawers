import React, { useMemo, useState } from 'react';
import { Users, Layers, Activity, TrendingUp, BookOpen } from 'lucide-react';
import { InsightsUserStatRow, InsightsUsageEvent } from '../../../types/insightsUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function avg(total: number, count: number): string {
  if (count === 0) return '—';
  return (total / count).toFixed(1);
}

interface Props {
  data: InsightsUserStatRow[];
  events: InsightsUsageEvent[];
}

const InsightsUserKPICards: React.FC<Props> = ({ data, events }) => {
  const [expanded, setExpanded] = useState(true);

  const metrics = useMemo(() => {
    const userCount = data.length;
    const totalSessions = data.reduce((sum, u) => sum + u.sessions, 0);
    const totalInteractions = data.reduce((sum, u) => sum + u.interactions, 0);
    const totalDrawerOpens = data.reduce((sum, u) => sum + u.drawerOpens, 0);

    // Avg KPI depth: distinct KPIs opened per session (across sessions that had at least one drawer open)
    const sessionKpiMap = new Map<string, Set<string>>();
    events
      .filter(e => e.eventType === 'KPI_DRAWER_OPENED' && e.context.kpi)
      .forEach(e => {
        if (!sessionKpiMap.has(e.sessionId)) sessionKpiMap.set(e.sessionId, new Set());
        sessionKpiMap.get(e.sessionId)!.add(e.context.kpi!);
      });
    const sessionCount = sessionKpiMap.size;
    const totalKpiDepth = [...sessionKpiMap.values()].reduce((sum, s) => sum + s.size, 0);

    return { userCount, totalSessions, totalInteractions, totalDrawerOpens, totalKpiDepth, sessionCount };
  }, [data, events]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">User Summary</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <FeedbackKPICard
              label="Active Users"
              value={metrics.userCount.toLocaleString()}
              icon={<Users size={20} />}
              colorClass="bg-pink-50 text-pink-600"
            />
            <FeedbackKPICard
              label="Avg Sessions / User"
              value={avg(metrics.totalSessions, metrics.userCount)}
              icon={<Layers size={20} />}
              colorClass="bg-indigo-50 text-indigo-600"
            />
            <FeedbackKPICard
              label="Avg Interactions / User"
              value={avg(metrics.totalInteractions, metrics.userCount)}
              icon={<Activity size={20} />}
              colorClass="bg-violet-50 text-violet-600"
            />
            <FeedbackKPICard
              label="Avg Drawer Opens / User"
              value={avg(metrics.totalDrawerOpens, metrics.userCount)}
              icon={<TrendingUp size={20} />}
              colorClass="bg-teal-50 text-teal-600"
            />
            <FeedbackKPICard
              label="Avg KPI Depth / Session"
              value={avg(metrics.totalKpiDepth, metrics.sessionCount)}
              icon={<BookOpen size={20} />}
              colorClass="bg-amber-50 text-amber-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsUserKPICards);
