export type InsightsColorScheme =
  | 'default'
  | 'highContrast'
  | 'colorVisionFriendly'
  | 'alternative'
  | 'custom';

export type InsightsTrendSize = 'small' | 'medium' | 'large';

export interface InsightsColors {
  favorable: string;
  unfavorable: string;
  neutral: string;
}

export const COLOR_PRESETS: Record<Exclude<InsightsColorScheme, 'custom'>, InsightsColors> = {
  default: {
    favorable: '#16A34A',
    unfavorable: '#DC2626',
    neutral: '#6B7280',
  },
  highContrast: {
    favorable: '#005FCC',
    unfavorable: '#C2410C',
    neutral: '#374151',
  },
  colorVisionFriendly: {
    favorable: '#0072B2',
    unfavorable: '#D55E00',
    neutral: '#6B7280',
  },
  alternative: {
    favorable: '#7C3AED',
    unfavorable: '#EA580C',
    neutral: '#64748B',
  },
};

export const DEFAULT_INSIGHTS_PREFERENCES = {
  scheme: 'default' as InsightsColorScheme,
  colors: COLOR_PRESETS.default,
  trendIndicatorSize: 'medium' as InsightsTrendSize,
};
