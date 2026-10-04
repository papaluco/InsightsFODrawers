import React from 'react';
import { ArrowLeftRight, ArrowUpDown, Info } from 'lucide-react';
import type { SiteSelection } from '../../../data/siteRegistry';
import type { TimeframeSelection } from '../../../services/comparisonDataService';
import type { ComparisonView } from '../hooks/useComparison';
import type { ComparisonSideKey } from '../store/useComparisonStore';
import { useComparisonStore } from '../store/useComparisonStore';
import { ComparisonSidePanel } from './ComparisonSidePanel';

interface ComparisonSetupProps {
  comparison: ComparisonView;
  onSitesChange: (side: ComparisonSideKey, sites: SiteSelection) => void;
  onTimeframeChange: (side: ComparisonSideKey, timeframe: TimeframeSelection) => void;
  onSwap: () => void;
}

/**
 * Comparison Setup (NXT-77202 §6): the two side panels, Swap, and the
 * informational period-length notice. Panels sit side by side from tablet width up.
 */
export const ComparisonSetup: React.FC<ComparisonSetupProps> = ({ comparison, onSitesChange, onTimeframeChange, onSwap }) => {
  const left = useComparisonStore(s => s.left);
  const right = useComparisonStore(s => s.right);
  const canSwap = comparison.bothSidesSet;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 md:items-stretch">
        <ComparisonSidePanel
          ariaLabel="First comparison"
          definition={left}
          data={comparison.left}
          onSitesChange={sites => onSitesChange('left', sites)}
          onTimeframeChange={timeframe => onTimeframeChange('left', timeframe)}
        />

        {/* NXT-77202 §6 Swap: disabled until both sides are set */}
        <div className="flex justify-center md:self-center">
          <button
            type="button"
            onClick={onSwap}
            disabled={!canSwap}
            title={canSwap ? 'Swap comparisons' : 'Select sites and a timeframe for both comparisons to swap'}
            aria-label="Swap comparisons"
            className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:text-indigo-600 hover:border-indigo-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-500 disabled:hover:border-gray-200 disabled:hover:shadow-sm"
          >
            <ArrowLeftRight className="w-5 h-5 hidden md:block" />
            <ArrowUpDown className="w-5 h-5 md:hidden" />
          </button>
        </div>

        <ComparisonSidePanel
          ariaLabel="Second comparison"
          definition={right}
          data={comparison.right}
          onSitesChange={sites => onSitesChange('right', sites)}
          onTimeframeChange={timeframe => onTimeframeChange('right', timeframe)}
        />
      </div>

      {/* NXT-77202 §6 period-length notice: informational only, never changes a selection */}
      {comparison.periodLengthNotice && (
        <p role="note" className="flex items-start gap-2 px-4 py-2.5 rounded-lg border border-indigo-100 bg-indigo-50 text-sm text-indigo-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          {comparison.periodLengthNotice}
        </p>
      )}
    </div>
  );
};
