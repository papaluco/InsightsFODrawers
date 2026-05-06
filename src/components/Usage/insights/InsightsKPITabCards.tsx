import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Layers, BookOpen } from 'lucide-react';
import { KPIStatRow, InsightsUsageEvent } from '../../../types/insightsUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

interface Props {
  data: KPIStatRow[];
  events: InsightsUsageEvent[];
}

const InsightsKPITabCards: React.FC<Props> = ({ data, events }) => {
  const [expanded, setExpanded] = useState(true);

  const metrics = useMemo(() => {
    // Avg KPI Depth: unique KPIs opened per session (across all sessions with at least one drawer open)
    const sessionKpiMap = new Map<string, Set<string>>();
    events
      .filter(e => e.eventType === 'KPI_DRAWER_OPENED' && e.context.kpi)
      .forEach(e => {
        if (!sessionKpiMap.has(e.sessionId)) sessionKpiMap.set(e.sessionId, new Set());
        sessionKpiMap.get(e.sessionId)!.add(e.context.kpi!);
      });
    const drawerSessions = sessionKpiMap.size;
    const totalDepth = [...sessionKpiMap.values()].reduce((s, kpis) => s + kpis.size, 0);
    const avgKpiDepth = drawerSessions > 0 ? totalDepth / drawerSessions : 0;

    // Avg Visibility % and Avg Hidden %: across KPIs with availability data
    const withAvail = data.filter(r => r.available > 0);
    const availCount = withAvail.length || 1;
    const avgVisibility = withAvail.reduce((s, r) => s + r.visibilityPct, 0) / availCount;
    const avgHidden = withAvail.reduce((s, r) => s + r.hiddenPct, 0) / availCount;

    // % KPIs Never Opened: % of KPIs that had rendered sessions but zero drawer opens
    const renderedKpis = data.filter(r => r.visibleSessions > 0);
    const neverOpenedKpis = renderedKpis.filter(r => r.drawerOpens === 0).length;
    const pctNeverOpened = renderedKpis.length > 0 ? neverOpenedKpis / renderedKpis.length : 0;

    return { avgKpiDepth, avgVisibility, avgHidden, pctNeverOpened };
  }, [data, events]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">KPI Summary</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FeedbackKPICard
              label="Avg KPI Depth"
              value={metrics.avgKpiDepth.toFixed(1)}
              subtitle="KPIs / session"
              icon={<Layers size={20} />}
              colorClass="bg-indigo-50 text-indigo-600"
            />
            <FeedbackKPICard
              label="Avg Visibility %"
              value={fmtPct(metrics.avgVisibility)}
              icon={<Eye size={20} />}
              colorClass="bg-emerald-50 text-emerald-600"
            />
            <FeedbackKPICard
              label="Avg Hidden %"
              value={fmtPct(metrics.avgHidden)}
              icon={<EyeOff size={20} />}
              colorClass="bg-slate-50 text-slate-500"
            />
            <FeedbackKPICard
              label="% KPIs Never Opened"
              value={fmtPct(metrics.pctNeverOpened)}
              icon={<BookOpen size={20} />}
              colorClass={metrics.pctNeverOpened > 0.5 ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsKPITabCards);
