import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useInsightsPreferencesStore } from '../../store/useInsightsPreferencesStore';
import type { InsightsTrendSize } from '../../constants/insightsColorPresets';

export type TrendDirection = 'up' | 'down' | 'flat';
export type TrendStatus = 'favorable' | 'unfavorable' | 'neutral';

interface TrendIndicatorProps {
  direction: TrendDirection;
  status: TrendStatus;
  size?: InsightsTrendSize;
}

const SIZE_CLASSES: Record<InsightsTrendSize, string> = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6',
};

const STATUS_CLASSES: Record<TrendStatus, string> = {
  favorable: 'text-insightsFavorable',
  unfavorable: 'text-insightsUnfavorable',
  neutral: 'text-insightsNeutral',
};

const DIRECTION_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const TrendIndicator = ({ direction, status, size }: TrendIndicatorProps) => {
  const defaultSize = useInsightsPreferencesStore((state) => state.trendIndicatorSize);
  const resolvedSize = size ?? defaultSize;
  const Icon = DIRECTION_ICONS[direction];

  return <Icon className={`${SIZE_CLASSES[resolvedSize]} ${STATUS_CLASSES[status]}`} />;
};

export default TrendIndicator;
