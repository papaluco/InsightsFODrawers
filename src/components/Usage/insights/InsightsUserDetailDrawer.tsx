import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Star, Activity, Layers, Bot, Download, TrendingUp } from 'lucide-react';
import { InsightsUserStatRow, InsightsUsageEvent, INSIGHTS_EVENT_FRIENDLY, INSIGHTS_INTERACTION_TYPES, KPIStatRow } from '../../../types/insightsUsageTypes';
import { INSIGHTS_DISTRICT_KPIS, INSIGHTS_DISTRICT_NAMES } from '../../../data/mockInsightsUsageData';
import { fmtDate, KPI_COLORS } from '../common/usageHelpers';
import { calcInsightsUserScore, getEngagementTier } from '../../../utils/engagementTiers';
import EngagementTierBadge from '../../Common/EngagementTierBadge';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

interface Props {
  user: InsightsUserStatRow | null;
  allEvents: InsightsUsageEvent[];
  onClose: () => void;
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultExpanded?: boolean }> = ({
  title, children, defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</h4>
        <CollapseChevron expanded={expanded} />
      </button>
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">{children}</div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-medium text-slate-700">{value}</span>
  </div>
);

const InsightsUserDetailDrawer: React.FC<Props> = ({ user, allEvents, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [onClose]);

  const userEvents = useMemo(
    () => user ? allEvents.filter(e => e.userId === user.userId) : [],
    [user, allEvents]
  );

  const sessions = useMemo(() => {
    const sessionMap = new Map<string, InsightsUsageEvent[]>();
    userEvents.forEach(e => {
      if (!sessionMap.has(e.sessionId)) sessionMap.set(e.sessionId, []);
      sessionMap.get(e.sessionId)!.push(e);
    });
    return [...sessionMap.entries()]
      .map(([id, evs]) => ({
        id,
        start: evs.reduce((min, e) => e.timestamp < min ? e.timestamp : min, evs[0].timestamp),
        events: evs.length,
        interacted: evs.some(e => (INSIGHTS_INTERACTION_TYPES as string[]).includes(e.eventType)),
        openedDrawer: evs.some(e => e.eventType === 'KPI_DRAWER_OPENED'),
        usedSchoolie: evs.some(e => e.eventType === 'KPI_SCHOOLIE_OPENED' || e.eventType === 'DASHBOARD_SCHOOLIE_OPENED'),
      }))
      .sort((a, b) => b.start.localeCompare(a.start));
  }, [userEvents]);

  const kpiBreakdown = useMemo((): KPIStatRow[] => {
    if (!user) return [];
    const districtKpis = INSIGHTS_DISTRICT_KPIS[user.districtId] ?? Object.values(INSIGHTS_DISTRICT_KPIS).flat();
    const pageViewSessionCount = new Set(userEvents.filter(e => e.eventType === 'INSIGHTS_PAGE_VIEWED').map(e => e.sessionId)).size;

    return districtKpis.map(kpi => {
      const renderedEvts = userEvents.filter(e => e.eventType === 'KPI_RENDERED' && e.context.kpi === kpi);
      const availableSet = new Set(renderedEvts.map(e => e.sessionId));
      const visibleSet = new Set(renderedEvts.filter(e => !e.context.notRendered).map(e => e.sessionId));
      const hiddenSet = new Set(renderedEvts.filter(e => e.context.notRendered === true).map(e => e.sessionId));

      const available = availableSet.size;
      const visibleSessions = visibleSet.size;
      const hidden = hiddenSet.size;

      const drawerEvts = userEvents.filter(e => e.context.kpi === kpi && e.eventType === 'KPI_DRAWER_OPENED');
      const drawerOpenSessions = new Set(drawerEvts.map(e => e.sessionId));
      const drawerOpens = drawerEvts.length;
      const schoolieOpens = userEvents.filter(e => e.context.kpi === kpi && e.eventType === 'KPI_SCHOOLIE_OPENED').length;
      const downloads = userEvents.filter(e => e.context.kpi === kpi && e.eventType === 'KPI_DRAWER_DOWNLOAD').length;
      const trendSelections = userEvents.filter(e => e.context.kpi === kpi && e.eventType === 'TREND_KPI_CHANGED').length;

      const neverOpened = visibleSet.size > 0
        ? [...visibleSet].filter(sid => !drawerOpenSessions.has(sid)).length
        : 0;

      const visibilityPct = available > 0 ? visibleSessions / available : 0;
      const hiddenPct = available > 0 ? hidden / available : 0;
      const neverOpenedPct = visibleSessions > 0 ? neverOpened / visibleSessions : 0;
      const needsAttention = hiddenPct > 0.3 || neverOpenedPct > 0.8;

      const normalizedDenom = available > 0 ? visibleSessions : pageViewSessionCount;
      const normalizedUsage = normalizedDenom > 0 ? drawerOpenSessions.size / normalizedDenom : 0;
      const avgOpensPerSession = drawerOpenSessions.size > 0 ? drawerOpens / drawerOpenSessions.size : 0;

      return {
        kpi,
        renderedSessions: pageViewSessionCount,
        available,
        visibleSessions,
        hidden,
        neverOpened,
        visibilityPct,
        hiddenPct,
        neverOpenedPct,
        needsAttention,
        drawerOpens,
        schoolieOpens,
        downloads,
        trendSelections,
        uniqueUsers: drawerOpens > 0 ? 1 : 0,
        normalizedUsage,
        avgOpensPerSession,
        avgOpensPerUser: drawerOpens,
      };
    });
  }, [user, userEvents]);

  const eventBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    userEvents.forEach(e => { counts[e.eventType] = (counts[e.eventType] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, label: INSIGHTS_EVENT_FRIENDLY[type as keyof typeof INSIGHTS_EVENT_FRIENDLY] ?? type, count }))
      .sort((a, b) => b.count - a.count);
  }, [userEvents]);

  const score = user ? calcInsightsUserScore(user) : 0;
  const allUserScores = useMemo(() => [score], [score]);
  const tier = getEngagementTier(score, allUserScores);

  const unusedKPIs = useMemo(() => {
    if (!user) return [];
    const districtKpis = INSIGHTS_DISTRICT_KPIS[user.districtId] ?? Object.values(INSIGHTS_DISTRICT_KPIS).flat();
    return districtKpis.filter(kpi => !userEvents.some(e => e.eventType === 'KPI_DRAWER_OPENED' && e.context.kpi === kpi));
  }, [user, userEvents]);

  if (!user) return null;

  const initials = user.userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          {/* Left: back + identity */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm font-medium transition-colors shrink-0"
            >
              <ChevronLeft size={16} />
              Users
            </button>
            <div className="h-5 w-px bg-gray-200 shrink-0" />
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800 truncate">{user.userName}</h2>
                  {user.isPowerUser && (
                    <span title="Power User" className="shrink-0">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {INSIGHTS_DISTRICT_NAMES[user.districtId] ?? user.districtId} · {user.platform}
                </p>
              </div>
            </div>
          </div>

          {/* Right: engagement + last active */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Last Active</p>
              <p className="text-sm font-medium text-slate-700">{fmtDate(user.lastActive)}</p>
            </div>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            <EngagementTierBadge tier={tier} />
          </div>
        </div>
      </div>

      {/* Activity Summary — full width */}
      <CollapsibleSection title="Activity Summary">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <FeedbackKPICard label="Sessions" value={user.sessions} icon={<Layers size={16} />} colorClass="bg-indigo-50 text-indigo-600" />
          <FeedbackKPICard label="Interactions" value={user.interactions} icon={<Activity size={16} />} colorClass="bg-emerald-50 text-emerald-600" />
          <FeedbackKPICard label="Drawer Opens" value={user.drawerOpens} icon={<TrendingUp size={16} />} colorClass="bg-teal-50 text-teal-600" />
          <FeedbackKPICard label="Schoolie" value={user.schoolieUsage} icon={<Bot size={16} />} colorClass="bg-purple-50 text-purple-600" />
          <FeedbackKPICard label="Downloads" value={user.downloads} icon={<Download size={16} />} colorClass="bg-amber-50 text-amber-600" />
          <FeedbackKPICard
            label="Avg Sess/Week"
            value={user.avgSessionsPerWeek.toFixed(1)}
            icon={<Activity size={16} />}
            colorClass="bg-sky-50 text-sky-600"
          />
        </div>
      </CollapsibleSection>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Left column: Identity + Gap Analysis + Behavior */}
        <div className="space-y-5">
{/* Hidding for now since this info is already in the header and we want to focus on usage insights, but can easily be added back in if needed
          <CollapsibleSection title="Identity">
            <Row label="User ID" value={user.userId} />
            <Row label="District" value={user.districtName} />
            <Row label="Platform" value={user.platform} />
            <Row label="Last Active" value={fmtDate(user.lastActive)} />
            <Row label="Avg Sessions/Week" value={user.avgSessionsPerWeek.toFixed(2)} />
          </CollapsibleSection>
*/}
          {/* Event Breakout */}
          <CollapsibleSection title="Behavior Breakdown">
            {eventBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No events recorded.</p>
            ) : (
              <div className="space-y-2">
                {eventBreakdown.map(({ label, count, type }) => {
                  const max = eventBreakdown[0].count;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-500 w-36 truncate shrink-0">{label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 tabular-nums w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          {/* Unused KPIs */}
          {unusedKPIs.length > 0 && (
            <CollapsibleSection title="Gap Analysis">
              <p className="text-xs text-gray-500 mb-3">KPIs this user has never opened a drawer for:</p>
              <div className="flex gap-2 flex-wrap">
                {unusedKPIs.map(kpi => (
                  <span key={kpi} className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    {kpi} — never opened
                  </span>
                ))}
              </div>
            </CollapsibleSection>
          )}

        </div>

        {/* Right column (2/3): KPI Usage + Recent Sessions */}
        <div className="lg:col-span-2 space-y-5">

          <CollapsibleSection title="KPI Usage">
            <div className="space-y-5">
              {kpiBreakdown.map(k => (
                <div key={k.kpi} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
                  {/* KPI header + usage bar */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${KPI_COLORS[k.kpi]}20`, color: KPI_COLORS[k.kpi] }}
                      >
                        {k.kpi}
                      </span>
                      <span className="text-[11px] text-gray-400">Usage rate</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{(k.normalizedUsage * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${k.normalizedUsage * 100}%`, backgroundColor: KPI_COLORS[k.kpi] }}
                    />
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { label: 'Drawer Opens', value: k.drawerOpens, color: 'text-indigo-600' },
                      { label: 'Schoolie', value: k.schoolieOpens, color: 'text-purple-600' },
                      { label: 'Downloads', value: k.downloads, color: 'text-amber-600' },
                      { label: 'Trend Changes', value: k.trendSelections, color: 'text-emerald-600' },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 rounded-lg py-2.5 text-center">
                        <p className={`text-base font-bold ${item.color} tabular-nums`}>{item.value}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Recent Sessions">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No sessions recorded.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-xs font-medium text-slate-700">{fmtDate(s.start)}</p>
                      <p className="text-[11px] text-gray-400">{s.events} event{s.events !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {s.openedDrawer && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Drawer</span>
                      )}
                      {s.usedSchoolie && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">Schoolie</span>
                      )}
                      {!s.interacted && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-semibold">View only</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

        </div>
      </div>
    </div>
  );
};

export default InsightsUserDetailDrawer;
