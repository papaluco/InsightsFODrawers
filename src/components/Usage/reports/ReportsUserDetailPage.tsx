import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  ChevronLeft, Star, Eye, Play, Download, Mail, Share2,
  Layers, Activity, TrendingUp,
} from 'lucide-react';
import { UserStatRow, ReportUsageEvent } from '../../../types/reportUsageTypes';
import { REPORT_DISTRICT_NAMES } from '../../../data/mockReportUsageData';
import { EVENT_LABELS } from './reportUsageHelpers';
import { fmtDate, EVENT_COLORS, CHART_COLORS } from '../common/usageHelpers';
import { calcReportUserScore, getEngagementTier } from '../../../utils/engagementTiers';
import EngagementTierBadge from '../../Common/EngagementTierBadge';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import { getTimeOfDay, TIME_OF_DAY_COLORS, TIME_OF_DAY_LABELS, TIME_OF_DAY_ORDER } from '../../../utils/timeOfDay';

// ─── Layout helpers ──────────────────────────────────────────────────────────

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}> = ({ title, children, defaultExpanded = true }) => {
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
      {expanded && <div className="border-t border-gray-100 px-5 py-4">{children}</div>}
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-medium text-slate-700">{value}</span>
  </div>
);

// ─── Timing helpers ───────────────────────────────────────────────────────────

type Granularity = 'day' | 'week' | 'month';

function getBucket(ts: string, g: Granularity): string {
  if (g === 'day') return ts.slice(0, 10);
  if (g === 'month') return ts.slice(0, 7);
  const date = new Date(ts);
  const diff = date.getDay() === 0 ? -6 : 1 - date.getDay();
  const mon = new Date(date);
  mon.setDate(date.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function fmtBucket(bucket: string, g: Granularity): string {
  if (g === 'month') {
    const [y, m] = bucket.split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  const d = new Date(bucket + 'T12:00:00');
  return g === 'week'
    ? `Wk ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  user: UserStatRow;
  allEvents: ReportUsageEvent[];
  onClose: () => void;
}

const GRAN_OPTS: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const ReportsUserDetailPage: React.FC<Props> = ({ user, allEvents, onClose }) => {
  const [granularity, setGranularity] = useState<Granularity>('week');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [onClose]);

  // All events for this user
  const userEvents = useMemo(
    () => allEvents.filter(e => e.userId === user.userId),
    [allEvents, user.userId]
  );

  // ── Sessions ────────────────────────────────────────────────────────────────
  const sessions = useMemo(() => {
    const map = new Map<string, ReportUsageEvent[]>();
    userEvents.forEach(e => {
      if (!map.has(e.sessionId)) map.set(e.sessionId, []);
      map.get(e.sessionId)!.push(e);
    });
    return [...map.entries()]
      .map(([id, evs]) => {
        const sorted = [...evs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const durationMs = new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime();
        const durationMin = Math.round(durationMs / 60000);
        return {
          id,
          start: first.timestamp,
          entryPoint: first.context.entryPoint ?? '—',
          durationMin,
          reportsViewed: new Set(evs.filter(e => e.eventType === 'REPORT_VIEWED').map(e => e.context.reportId)).size,
          reportsRun: evs.filter(e => e.eventType === 'REPORT_RUN').length,
          downloads: evs.filter(e => e.eventType === 'REPORT_DOWNLOADED').length,
          emails: evs.filter(e => e.eventType === 'REPORT_EMAILED').length,
          distributions: evs.filter(e => e.eventType === 'REPORT_DISTRIBUTED').length,
          uniqueReports: new Set(evs.map(e => e.context.reportId)).size,
        };
      })
      .sort((a, b) => b.start.localeCompare(a.start));
  }, [userEvents]);

  const totalSessions = sessions.length;

  // ── Activity summary metrics ─────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const views = userEvents.filter(e => e.eventType === 'REPORT_VIEWED').length;
    const runs = userEvents.filter(e => e.eventType === 'REPORT_RUN').length;
    const downloads = userEvents.filter(e => e.eventType === 'REPORT_DOWNLOADED').length;
    const emails = userEvents.filter(e => e.eventType === 'REPORT_EMAILED').length;
    const distributions = userEvents.filter(e => e.eventType === 'REPORT_DISTRIBUTED').length;

    const totalReports = sessions.reduce((s, ses) => s + ses.uniqueReports, 0);
    const avgReportsPerSession = totalSessions > 0 ? totalReports / totalSessions : 0;
    const avgRunsPerSession = totalSessions > 0 ? runs / totalSessions : 0;
    const avgOutputsPerSession = totalSessions > 0 ? (downloads + emails + distributions) / totalSessions : 0;

    return { views, runs, downloads, emails, distributions, avgReportsPerSession, avgRunsPerSession, avgOutputsPerSession };
  }, [userEvents, sessions, totalSessions]);

  // ── Report breakdown ─────────────────────────────────────────────────────────
  const reportBreakdown = useMemo(() => {
    const map = new Map<string, {
      reportId: string; reportName: string; module: string; dataSource: string;
      views: number; runs: number; downloads: number; emails: number; distributions: number;
      sessionSet: Set<string>;
    }>();
    userEvents.forEach(e => {
      const { reportId, reportName, module, dataSource } = e.context;
      if (!map.has(reportId)) {
        map.set(reportId, { reportId, reportName, module, dataSource, views: 0, runs: 0, downloads: 0, emails: 0, distributions: 0, sessionSet: new Set() });
      }
      const r = map.get(reportId)!;
      r.sessionSet.add(e.sessionId);
      if (e.eventType === 'REPORT_VIEWED') r.views++;
      if (e.eventType === 'REPORT_RUN') r.runs++;
      if (e.eventType === 'REPORT_DOWNLOADED') r.downloads++;
      if (e.eventType === 'REPORT_EMAILED') r.emails++;
      if (e.eventType === 'REPORT_DISTRIBUTED') r.distributions++;
    });
    return [...map.values()]
      .map(r => ({
        ...r,
        sessions: r.sessionSet.size,
        usagePct: totalSessions > 0 ? r.sessionSet.size / totalSessions : 0,
        avgRunsPerSession: r.sessionSet.size > 0 ? r.runs / r.sessionSet.size : 0,
      }))
      .sort((a, b) => b.runs - a.runs);
  }, [userEvents, totalSessions]);

  // ── Behavior breakdown ────────────────────────────────────────────────────────
  const behaviorBreakdown = useMemo(() => {
    const counts: Partial<Record<string, number>> = {};
    userEvents.forEach(e => { counts[e.eventType] = (counts[e.eventType] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, label: EVENT_LABELS[type as keyof typeof EVENT_LABELS] ?? type, count: count! }))
      .sort((a, b) => b.count - a.count);
  }, [userEvents]);

  // ── Output behavior profile ───────────────────────────────────────────────────
  const outputProfile = useMemo(() => {
    const withDownload = sessions.filter(s => s.downloads > 0).length;
    const withEmail = sessions.filter(s => s.emails > 0).length;
    const withDistribution = sessions.filter(s => s.distributions > 0).length;
    return [
      { label: 'Download', pct: totalSessions > 0 ? withDownload / totalSessions : 0, color: EVENT_COLORS.REPORT_DOWNLOADED },
      { label: 'Email', pct: totalSessions > 0 ? withEmail / totalSessions : 0, color: EVENT_COLORS.REPORT_EMAILED },
      { label: 'Distribution', pct: totalSessions > 0 ? withDistribution / totalSessions : 0, color: EVENT_COLORS.REPORT_DISTRIBUTED },
    ];
  }, [sessions, totalSessions]);

  // ── Report depth buckets ──────────────────────────────────────────────────────
  const depthBuckets = useMemo(() => {
    const counts = { '1': 0, '2–3': 0, '4–5': 0, '5+': 0 };
    sessions.forEach(s => {
      const n = s.uniqueReports;
      if (n <= 1) counts['1']++;
      else if (n <= 3) counts['2–3']++;
      else if (n <= 5) counts['4–5']++;
      else counts['5+']++;
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(counts).map(([label, count]) => ({ label, count, pct: count / max }));
  }, [sessions]);

  // ── Usage timing ─────────────────────────────────────────────────────────────
  const timingData = useMemo(() => {
    const bucketMap = new Map<string, { morning: number; afternoon: number; evening: number }>();
    userEvents.forEach(e => {
      const bucket = getBucket(e.timestamp, granularity);
      const tod = getTimeOfDay(e.timestamp); // server time — no district tz map for reports
      if (!bucketMap.has(bucket)) bucketMap.set(bucket, { morning: 0, afternoon: 0, evening: 0 });
      bucketMap.get(bucket)![tod]++;
    });
    return [...bucketMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucket, counts]) => ({ label: fmtBucket(bucket, granularity), ...counts }));
  }, [userEvents, granularity]);

  // ── Engagement ───────────────────────────────────────────────────────────────
  const score = calcReportUserScore(user);
  const tier = getEngagementTier(score, [score]);
  const initials = user.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
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
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
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
                  {REPORT_DISTRICT_NAMES[user.districtId] ?? user.districtId} · {user.platform}
                </p>
              </div>
            </div>
          </div>
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

      {/* ── Activity Summary ── */}
      <CollapsibleSection title="Activity Summary">
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <FeedbackKPICard label="Sessions" value={totalSessions} icon={<Layers size={16} />} colorClass="bg-indigo-50 text-indigo-600" />
            <FeedbackKPICard label="Views" value={metrics.views} icon={<Eye size={16} />} colorClass="bg-sky-50 text-sky-600" />
            <FeedbackKPICard label="Runs" value={metrics.runs} icon={<Play size={16} />} colorClass="bg-emerald-50 text-emerald-600" />
            <FeedbackKPICard label="Downloads" value={metrics.downloads} icon={<Download size={16} />} colorClass="bg-amber-50 text-amber-600" />
            <FeedbackKPICard label="Emails" value={metrics.emails} icon={<Mail size={16} />} colorClass="bg-blue-50 text-blue-600" />
            <FeedbackKPICard label="Distributions" value={metrics.distributions} icon={<Share2 size={16} />} colorClass="bg-violet-50 text-violet-600" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FeedbackKPICard
              label="Avg Reports / Session"
              value={metrics.avgReportsPerSession.toFixed(1)}
              icon={<Activity size={16} />}
              colorClass="bg-teal-50 text-teal-600"
            />
            <FeedbackKPICard
              label="Avg Runs / Session"
              value={metrics.avgRunsPerSession.toFixed(1)}
              icon={<TrendingUp size={16} />}
              colorClass="bg-rose-50 text-rose-600"
            />
            <FeedbackKPICard
              label="Avg Outputs / Session"
              value={metrics.avgOutputsPerSession.toFixed(1)}
              subtitle="dl + email + dist"
              icon={<Share2 size={16} />}
              colorClass="bg-orange-50 text-orange-600"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Left column */}
        <div className="space-y-5">

          {/* Behavior Breakdown */}
          <CollapsibleSection title="Behavior Breakdown">
            {behaviorBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No events recorded.</p>
            ) : (
              <div className="space-y-2">
                {behaviorBreakdown.map(({ type, label, count }) => {
                  const max = behaviorBreakdown[0].count;
                  const color = EVENT_COLORS[type as keyof typeof EVENT_COLORS] ?? '#6366f1';
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-500 w-28 truncate shrink-0">{label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(count / max) * 100}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 tabular-nums w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          {/* Output Behavior Profile */}
          <CollapsibleSection title="Output Profile">
            <p className="text-[11px] text-gray-400 mb-3">% of sessions where output occurred</p>
            <div className="space-y-3">
              {outputProfile.map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold text-slate-700">{(pct * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Report Depth */}
          <CollapsibleSection title="Report Depth">
            <p className="text-[11px] text-gray-400 mb-3">Unique reports opened per session</p>
            <div className="space-y-2">
              {depthBuckets.map(({ label, count, pct }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500 w-12 shrink-0">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${pct * 100}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 tabular-nums w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>

        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Session History */}
          <CollapsibleSection title="Session History">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No sessions recorded.</p>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Date', 'Entry Point', 'Duration', 'Viewed', 'Runs', 'DL', 'Email', 'Dist'].map(h => (
                        <th key={h} className="pb-2 pr-4 font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 pr-4 whitespace-nowrap font-medium text-slate-700">{fmtDate(s.start)}</td>
                        <td className="py-2 pr-4 whitespace-nowrap text-gray-500">{s.entryPoint}</td>
                        <td className="py-2 pr-4 whitespace-nowrap text-gray-400">
                          {s.durationMin > 0 ? `${s.durationMin}m` : '<1m'}
                        </td>
                        <td className="py-2 pr-4 tabular-nums text-sky-600 font-semibold">{s.reportsViewed || '—'}</td>
                        <td className="py-2 pr-4 tabular-nums text-emerald-600 font-semibold">{s.reportsRun || '—'}</td>
                        <td className="py-2 pr-4 tabular-nums text-amber-600 font-semibold">{s.downloads || '—'}</td>
                        <td className="py-2 pr-4 tabular-nums text-blue-600 font-semibold">{s.emails || '—'}</td>
                        <td className="py-2 pr-4 tabular-nums text-violet-600 font-semibold">{s.distributions || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>

          {/* Usage Timing */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Usage Timing</h4>
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
            </div>
            <div className="border-t border-gray-100 px-4 pb-4 pt-2">
              {timingData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm italic">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timingData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const total = payload.reduce((s, p) => s + ((p.value as number) ?? 0), 0);
                        return (
                          <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs min-w-[140px]">
                            <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
                            {TIME_OF_DAY_ORDER.map(tod => {
                              const entry = payload.find(p => p.dataKey === tod);
                              const val = (entry?.value as number) ?? 0;
                              return (
                                <div key={tod} className="flex items-center justify-between gap-3 py-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIME_OF_DAY_COLORS[tod] }} />
                                    <span className="text-gray-500 capitalize">{tod}</span>
                                  </div>
                                  <span className="font-medium text-slate-700 tabular-nums">
                                    {val}{total > 0 ? ` (${((val / total) * 100).toFixed(0)}%)` : ''}
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
                      formatter={v => <span className="text-[11px] text-slate-600">{TIME_OF_DAY_LABELS[v as keyof typeof TIME_OF_DAY_LABELS] ?? v}</span>}
                      wrapperStyle={{ paddingTop: 8 }}
                    />
                    <Bar dataKey="morning" stackId="tod" fill={TIME_OF_DAY_COLORS.morning} name="morning" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="afternoon" stackId="tod" fill={TIME_OF_DAY_COLORS.afternoon} name="afternoon" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="evening" stackId="tod" fill={TIME_OF_DAY_COLORS.evening} name="evening" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Report Usage */}
          <CollapsibleSection title="Report Usage">
            {reportBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No report usage recorded.</p>
            ) : (
              <div className="space-y-5">
                {reportBreakdown.map((r, i) => (
                  <div key={r.reportId} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
                    <div className="flex items-start justify-between mb-1.5 gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{r.reportName}</p>
                        <p className="text-[11px] text-gray-400 truncate">{r.module} · {r.dataSource}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700 shrink-0">{(r.usagePct * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${r.usagePct * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: 'Views', value: r.views, color: 'text-sky-600' },
                        { label: 'Runs', value: r.runs, color: 'text-emerald-600' },
                        { label: 'Downloads', value: r.downloads, color: 'text-amber-600' },
                        { label: 'Emails', value: r.emails, color: 'text-blue-600' },
                        { label: 'Dist.', value: r.distributions, color: 'text-violet-600' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-slate-50 rounded-lg py-2 text-center">
                          <p className={`text-sm font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
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

export default ReportsUserDetailPage;
