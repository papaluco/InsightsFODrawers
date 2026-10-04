import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { DemoSchoolSelector } from '../../../components/Common/DemoSchoolSelector';
import { TimeframeSelector } from '../../../components/Common/TimeframeSelector';
import type { SiteSelection } from '../../../data/siteRegistry';
import type { TimeframeSelection } from '../../../services/comparisonDataService';
import { getPartialPeriodLabel } from '../../../utils/timeframes';
import type { SideDatasetState } from '../hooks/useSideDataset';
import type { ComparisonSideDefinition } from '../store/useComparisonStore';

interface ComparisonSidePanelProps {
  definition: ComparisonSideDefinition;
  data: SideDatasetState;
  onSitesChange: (sites: SiteSelection) => void;
  onTimeframeChange: (timeframe: TimeframeSelection) => void;
  /** Accessible name for the panel. Never "A"/"B", "left/right side", or "baseline" (spec §2). */
  ariaLabel: string;
}

/**
 * One comparison definition: Site Scope + Timeframe (NXT-77202 §6), with its generated
 * label and partial-period badge below the selectors once the side is set.
 */
export const ComparisonSidePanel: React.FC<ComparisonSidePanelProps> = ({
  definition,
  data,
  onSitesChange,
  onTimeframeChange,
  ariaLabel,
}) => {
  const { dataset, isLoading, error } = data;
  const partialLabel = dataset && !isLoading ? getPartialPeriodLabel(dataset.timeframe) : null;

  return (
    <section aria-label={ariaLabel} className="min-w-0 bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sites</span>
          <DemoSchoolSelector value={definition.sites ?? []} onChange={onSitesChange} placeholder="Select sites" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timeframe</span>
          <TimeframeSelector value={definition.timeframe} onChange={onTimeframeChange} placeholder="Select timeframe" />
        </div>
      </div>

      <div className="min-h-[3rem] border-t border-gray-200 pt-3" aria-live="polite">
        {error ? (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Couldn't load this comparison: {error}
          </p>
        ) : dataset ? (
          // Label and partial badge share a row; the badge wraps below only when there isn't room.
          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
            {/* NXT-77202 §6 generated label */}
            <p className="text-base font-semibold text-gray-900 break-words">{dataset.label}</p>
            {partialLabel && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-700">
                <Clock className="w-3 h-3" />
                {partialLabel}
              </span>
            )}
          </div>
        ) : isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <p className="text-sm text-gray-400">Choose sites and a timeframe.</p>
        )}
      </div>
    </section>
  );
};
