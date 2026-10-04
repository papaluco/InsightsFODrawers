import React from 'react';
import { Info } from 'lucide-react';
import TrendIndicator, { type TrendStatus } from '../../../components/Common/TrendIndicator';
import type { KpiComparisonResult } from '../engine/types';
import { getClassificationDisplay } from '../ui/comparisonDisplay';

/** insights* tokens (spec §12): user-configurable, never raw emerald/red. */
const TONE_CLASSES: Record<TrendStatus, string> = {
  favorable: 'border-insightsFavorable text-insightsFavorable',
  unfavorable: 'border-insightsUnfavorable text-insightsUnfavorable',
  neutral: 'border-insightsNeutral text-insightsNeutral',
};

/**
 * Classification badge (NXT-77210): token color plus text plus an icon, so status is never
 * shown by color alone (spec §12). Informational rows get a neutral "Informational" badge.
 */
export const ClassificationBadge: React.FC<{ result: KpiComparisonResult }> = ({ result }) => {
  const { label, status, direction } = getClassificationDisplay(result);
  const tone = status ? TONE_CLASSES[status] : 'border-gray-300 text-gray-500';

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border bg-white px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {direction && status && <TrendIndicator direction={direction} status={status} size="small" />}
      {result.classification === 'Informational' && <Info className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
};
