import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAppFunnelData } from '../../../services/appUsageService';
import { APP_FUNNELS } from './appUsageHelpers';
import AppEventListDrawer from './AppEventListDrawer';
import {
  AppUsageFilters,
  AppFunnelStepResult,
  AppFunnelDef,
  AppUsageEvent,
  AppUserStatRow,
  AppSessionStatRow,
} from '../../../types/appUsageTypes';
import { getTopicTailwind } from '../common/usageHelpers';


interface Props {
  filters: AppUsageFilters;
  filteredEvents: AppUsageEvent[];
  users: AppUserStatRow[];
  sessions: AppSessionStatRow[];
  onUserClick: (user: AppUserStatRow) => void;
  onSessionClick: (session: AppSessionStatRow) => void;
}

const formatPercent = (value: number) => `${Math.round(value * 10) / 10}%`;

function isLightColor(percentOfStart: number): boolean {
  return percentOfStart < 60;
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}


function getCategoryIntroText(
  category: string,
  funnels: AppFunnelDef[],
  allFunnelData: Record<string, AppFunnelStepResult[]>
): string {
  // Step 1 = Workspace, Step 2 = category page — use step 2 for "reached" count
  const allSteps = funnels.flatMap(f => allFunnelData[f.funnelId] ?? []);
  const categoryStep = allSteps.find(s => s.stepOrder === 2);
  const reachedCount = categoryStep?.count ?? 0;

  const finalSteps = funnels
    .map(f => {
      const steps = allFunnelData[f.funnelId] ?? [];
      return steps.length > 2 ? steps[steps.length - 1] : null;
    })
    .filter(Boolean) as AppFunnelStepResult[];

  if (finalSteps.length === 0) {
    return `${reachedCount.toLocaleString()} users reached ${category}.`;
  }

  const pieces = finalSteps.map(s => {
    const label = s.label.charAt(0).toLowerCase() + s.label.slice(1);
    return `${s.count.toLocaleString()} ${label}`;
  });

  const joined =
    pieces.length === 1
      ? pieces[0]
      : `${pieces.slice(0, -1).join(', ')}, and ${pieces[pieces.length - 1]}`;

  return `${reachedCount.toLocaleString()} users reached ${category}; ${joined}.`;
}

const FunnelCard = ({ funnel, steps, onStepClick }: any) => {
  const maxCount = steps.length > 0 ? steps[0].count : 1;
  const getStepColor = (stepKey: string): string =>
    funnel.steps.find((s: any) => s.stepKey === stepKey)?.color ?? '#6366f1';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h4 className="text-sm font-bold text-slate-800 mb-3">{funnel.funnelName}</h4>

      <div className="space-y-2">
        {steps.map((step: any, idx: number) => {
          const isFinalStep = idx === steps.length - 1;
          const stepColor = getStepColor(step.stepKey);
          const barWidthPct = Math.min(Math.max((step.count / maxCount) * 100, 2), 100);

          return (
            <React.Fragment key={step.stepKey}>
              <button
                onClick={() => onStepClick(funnel, step)}
                className={`w-full text-left group ${isFinalStep ? 'bg-slate-50 p-2 -mx-2 rounded-lg' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold flex-1 truncate text-slate-700">
                    {step.label}
                  </span>
                  <span className="text-xs font-bold tabular-nums text-slate-800">
                    {step.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 w-20 text-right">
                    {formatPercent(step.percentOfStart)}
                  </span>
                </div>

                <div className="relative h-5 bg-slate-100 rounded-md overflow-hidden group-hover:ring-1 group-hover:ring-indigo-300 transition-all">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                    style={{ width: `${barWidthPct}%`, backgroundColor: stepColor }}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span
                      className={`text-[10px] font-medium truncate ${
                        isLightColor(step.percentOfStart) ? 'text-slate-700' : 'text-white drop-shadow-sm'
                      }`}
                    >
                      {step.description}
                    </span>
                  </div>
                </div>

                {step.dropOffFromPrevious > 0 && (
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-rose-500 font-medium">Drop-off</span>
                      <span className="text-[10px] text-rose-500 font-semibold tabular-nums">
                        {formatPercent(step.dropOffFromPrevious)}
                      </span>
                    </div>
                    <div className="h-1 bg-rose-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{ width: `${Math.min(step.dropOffFromPrevious, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>

              {idx < steps.length - 1 && (
                <div className="flex justify-center -my-1">
                  <span className="text-[11px] text-gray-300">↓</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const AppFunnelPanel: React.FC<Props> = ({
  filters,
  filteredEvents,
  users,
  sessions,
  onUserClick,
  onSessionClick,
}) => {
  const [allFunnelData, setAllFunnelData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [drill, setDrill] = useState<any>(null);
  const [insightsExpanded, setInsightsExpanded] = useState(true);
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all(
      APP_FUNNELS.map(f =>
        getAppFunnelData(f, filters).then(steps => ({ id: f.funnelId, steps }))
      )
    ).then(results => {
      const map: any = {};
      results.forEach(r => (map[r.id] = r.steps));
      setAllFunnelData(map);
      setLoading(false);
    });
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const funnelsByCategory = useMemo(() => {
    const map = new Map<string, typeof APP_FUNNELS>();
    APP_FUNNELS.forEach(f => {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    });
    return map;
  }, []);

  const handleStepClick = useCallback(
    (funnel: AppFunnelDef, step: AppFunnelStepResult) => {
      const stepDef = funnel.steps.find(s => s.stepKey === step.stepKey);
      if (!stepDef) return;
      const matchedEvents = filteredEvents.filter(e => stepDef.match([e]));
      setDrill({ events: matchedEvents, title: `${funnel.funnelName} — ${step.label}` });
    },
    [filteredEvents]
  );

  if (loading) {
    return <div className="flex justify-center h-64 items-center">Loading...</div>;
  }

const renderCategory = (
  category: string,
  expanded: boolean,
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const funnels = funnelsByCategory.get(category);
  if (!funnels) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
  <h3
    className={`text-xs font-bold uppercase tracking-widest ${
      getTopicTailwind(category).split(' ')[1] ?? 'text-gray-500'
    }`}
  >
    {category}
  </h3>

  <p className="text-xs text-slate-500 mt-1 normal-case font-normal tracking-normal">
    {getCategoryIntroText(category, funnels, allFunnelData)}
  </p>
</div>

        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <div className="space-y-4">
            {funnels.map(funnel => (
              <FunnelCard
                key={funnel.funnelId}
                funnel={funnel}
                steps={allFunnelData[funnel.funnelId] ?? []}
                onStepClick={handleStepClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

  return (
  <>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div>
        {renderCategory('Insights', insightsExpanded, setInsightsExpanded)}
      </div>

      <div className="space-y-6">
        {renderCategory('Menu Analysis', menuExpanded, setMenuExpanded)}
        {renderCategory('Reports', reportsExpanded, setReportsExpanded)}
      </div>
    </div>

    <AppEventListDrawer
        events={drill?.events ?? []}
        title={drill?.title ?? ''}
        isOpen={drill !== null}
        onClose={() => setDrill(null)}
        users={users}
        sessions={sessions}
        onUserClick={onUserClick}
        onSessionClick={onSessionClick}
      />
  </>
);
};

export default AppFunnelPanel;