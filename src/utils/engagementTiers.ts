/**
 * Engagement tier classification based on score percentile.
 * Reused across Reports, Insights, App Usage, and any future usage dashboards.
 *
 * Each feature supplies its own score calculation — percentile logic is shared.
 */

export type EngagementTierKey = 'power_user' | 'high' | 'medium' | 'low' | 'at_risk';

export interface EngagementTier {
  key: EngagementTierKey;
  label: string;
  color: string;        // dot/accent color (hex)
  badgeBg: string;      // Tailwind bg class
  badgeText: string;    // Tailwind text class
  badgeBorder: string;  // Tailwind border class
}

export const ENGAGEMENT_TIERS: Record<EngagementTierKey, EngagementTier> = {
  power_user: {
    key: 'power_user',
    label: 'Power User',
    color: '#8b5cf6',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
  },
  high: {
    key: 'high',
    label: 'High Engagement',
    color: '#3b82f6',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    color: '#f59e0b',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
  },
  low: {
    key: 'low',
    label: 'Low',
    color: '#f97316',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
  },
  at_risk: {
    key: 'at_risk',
    label: 'At Risk',
    color: '#ef4444',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
  },
};

/**
 * Returns the percentile rank (0–100) of `score` within `allScores`.
 * Uses the "percentage of values strictly below" method.
 */
export function percentileRank(score: number, allScores: number[]): number {
  if (allScores.length <= 1) return 50;
  const below = allScores.filter(s => s < score).length;
  return (below / allScores.length) * 100;
}

/**
 * Classifies a user based on their percentile rank among all users.
 *   Top 10%     → Power User
 *   75–90%      → High Engagement
 *   25–75%      → Medium
 *   10–25%      → Low
 *   Bottom 10%  → At Risk
 */
export function getEngagementTier(score: number, allScores: number[]): EngagementTier {
  const p = percentileRank(score, allScores);
  if (p >= 90) return ENGAGEMENT_TIERS.power_user;
  if (p >= 75) return ENGAGEMENT_TIERS.high;
  if (p >= 25) return ENGAGEMENT_TIERS.medium;
  if (p >= 10) return ENGAGEMENT_TIERS.low;
  return ENGAGEMENT_TIERS.at_risk;
}

// ─── Feature-specific score calculations ────────────────────────────────────

/** Reports: activity depth — views deliberately excluded (passive). */
export function calcReportUserScore(user: {
  runs: number;
  downloads: number;
  emails: number;
  distributions: number;
}): number {
  return user.runs + user.downloads + user.emails + user.distributions;
}

/** Insights: depth-weighted score — drawer opens and Schoolie carry more weight than raw interactions. */
export function calcInsightsUserScore(user: {
  interactions: number;
  drawerOpens: number;
  schoolieUsage: number;
  downloads: number;
}): number {
  return user.interactions + user.drawerOpens * 2 + user.schoolieUsage * 3 + user.downloads;
}

/**
 * Insights district score — normalized per active user so large districts don't
 * automatically outrank small ones. Compares engagement depth, not raw volume.
 */
export function calcInsightsDistrictScore(district: {
  interactions: number;
  drawerOpens: number;
  schoolieUsage: number;
  downloads: number;
  activeUsers: number;
}): number {
  const raw = district.interactions + district.drawerOpens * 2 + district.schoolieUsage * 3 + district.downloads;
  return raw / Math.max(1, district.activeUsers);
}

// App score: TBD — will be added when App Usage user grid is built.
