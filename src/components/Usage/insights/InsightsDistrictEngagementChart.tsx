import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { InsightsDistrictStatRow } from '../../../types/insightsUsageTypes';
import { ENGAGEMENT_TIERS, EngagementTierKey, calcInsightsDistrictScore, getEngagementTier } from '../../../utils/engagementTiers';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const TIER_ORDER: EngagementTierKey[] = ['power_user', 'high', 'medium', 'low', 'at_risk'];

// Remap "Power User" to a district-appropriate label
const DISTRICT_TIER_LABELS: Record<EngagementTierKey, string> = {
  power_user: 'Top District',
  high:       'High Engagement',
  medium:     'Medium',
  low:        'Low',
  at_risk:    'At Risk',
};

interface Props {
  data: InsightsDistrictStatRow[];
}

const InsightsDistrictEngagementChart: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(true);

  const chartData = useMemo(() => {
    const total = data.length;
    if (total === 0) return [];

    const allScores = data.map(calcInsightsDistrictScore);
    const counts: Record<EngagementTierKey, number> = {
      power_user: 0, high: 0, medium: 0, low: 0, at_risk: 0,
    };

    data.forEach((district, i) => {
      const tier = getEngagementTier(allScores[i], allScores);
      counts[tier.key]++;
    });

    return TIER_ORDER.map(key => ({
      key,
      label: DISTRICT_TIER_LABELS[key],
      count: counts[key],
      pct: (counts[key] / total) * 100,
      color: ENGAGEMENT_TIERS[key].color,
      badgeBg: ENGAGEMENT_TIERS[key].badgeBg,
      badgeText: ENGAGEMENT_TIERS[key].badgeText,
      badgeBorder: ENGAGEMENT_TIERS[key].badgeBorder,
    }));
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <span className="text-sm font-semibold text-slate-700">District Engagement Distribution</span>
          <span className="ml-2 text-[11px] text-gray-400">Per-user depth score, percentile ranked</span>
        </div>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-3">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">
              No data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ left: 8, right: 24, top: 20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as typeof chartData[0];
                      return (
                        <div className="bg-white shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                          <p className="font-semibold text-slate-700 mb-1">{d.label}</p>
                          <p className="text-gray-500">{d.count.toLocaleString()} district{d.count !== 1 ? 's' : ''}</p>
                          <p className="text-gray-400">{d.pct.toFixed(1)}% of total</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="pct"
                      position="top"
                      formatter={(v: number) => `${v.toFixed(0)}%`}
                      style={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    />
                    {chartData.map(d => (
                      <Cell key={d.key} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap gap-3 mt-2">
                {chartData.map(d => (
                  <div
                    key={d.key}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${d.badgeBg} ${d.badgeBorder}`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className={`font-semibold ${d.badgeText}`}>{d.label}</span>
                    <span className="text-gray-500 font-medium">{d.count} district{d.count !== 1 ? 's' : ''}</span>
                    <span className="text-gray-400">({d.pct.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsDistrictEngagementChart);
