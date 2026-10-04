import React, { useCallback, useEffect } from 'react';
import { ChevronLeft, Download, GitCompareArrows } from 'lucide-react';
import { SchoolieIcon } from '../../../components/Common/Icons';
import { MOCK_CURRENT_USER } from '../../../data/mockCurrentUser';
import type { SiteSelection } from '../../../data/siteRegistry';
import type { TimeframeSelection } from '../../../services/comparisonDataService';
import { trackInsightsEvent } from '../../../services/insightsUsageService';
import type { InsightsEventContext, InsightsEventType } from '../../../types/insightsUsageTypes';
import { useComparison } from '../hooks/useComparison';
import { ComparisonSideKey, useComparisonStore } from '../store/useComparisonStore';
import { ComparisonFilters } from './ComparisonFilters';
import { ComparisonResultsArea } from './ComparisonResultsArea';
import { ComparisonSetup } from './ComparisonSetup';

/** NXT-77202 §6 materiality note. */
const MATERIALITY_NOTE =
  'Percentage-based KPIs are classified as Improved or Declined when they change by at least 0.5 percentage points. ' +
  'Dollar, count, and MPLH KPIs use a 2% relative-change threshold. Inventory KPIs are informational and are not classified.';

const trackComparisonEvent = (eventType: InsightsEventType, context: InsightsEventContext = {}) =>
  trackInsightsEvent({
    eventType,
    userId: MOCK_CURRENT_USER.userId,
    districtId: MOCK_CURRENT_USER.districtId,
    platform: 'SchoolCafe',
    context: { entryPoint: 'PerformanceComparison', ...context },
  });

/** Page body: Setup → Filters → Summary / KPI Comparison / Performance Trend → materiality note (spec §6). */
const PerformanceComparisonContent: React.FC = () => {
  const comparison = useComparison();
  const setSideSites = useComparisonStore(s => s.setSideSites);
  const setSideTimeframe = useComparisonStore(s => s.setSideTimeframe);
  const swapSides = useComparisonStore(s => s.swapSides);

  const handleSitesChange = (side: ComparisonSideKey, sites: SiteSelection) => {
    setSideSites(side, sites);
    trackComparisonEvent('COMPARISON_SIDE_CHANGED', { comparisonSide: side, comparisonField: 'sites' });
  };

  const handleTimeframeChange = (side: ComparisonSideKey, timeframe: TimeframeSelection) => {
    setSideTimeframe(side, timeframe);
    trackComparisonEvent('COMPARISON_SIDE_CHANGED', { comparisonSide: side, comparisonField: 'timeframe' });
  };

  const handleSwap = () => {
    swapSides();
    trackComparisonEvent('COMPARISON_SWAPPED');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      <ComparisonSetup
        comparison={comparison}
        onSitesChange={handleSitesChange}
        onTimeframeChange={handleTimeframeChange}
        onSwap={handleSwap}
      />
      <ComparisonFilters />
      <ComparisonResultsArea comparison={comparison} />
      <p className="text-xs italic text-gray-500">{MATERIALITY_NOTE}</p>
    </div>
  );
};

interface DisabledHeaderActionProps {
  title: string;
  children: React.ReactNode;
}

/** Header action that isn't available yet. The title sits on a wrapper because disabled buttons don't show tooltips in every browser. */
const DisabledHeaderAction: React.FC<DisabledHeaderActionProps> = ({ title, children }) => (
  <span title={title} className="inline-flex">
    <button type="button" disabled aria-label={title} className="flex items-center justify-center px-2 py-1.5 text-gray-500 opacity-40 cursor-not-allowed">
      {children}
    </button>
  </span>
);

interface PerformanceComparisonOverlayProps {
  isOpen: boolean;
  /** Back navigation to the Insights Dashboard. */
  onClose: () => void;
}

/**
 * Performance Comparison full-screen overlay (NXT-77202 §6), following the AppUsageDrawer
 * pattern: z-50, slides in from the right, sticky header, scrolling gray body.
 */
export const PerformanceComparisonOverlay: React.FC<PerformanceComparisonOverlayProps> = ({ isOpen, onClose }) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open dropdowns and the date picker handle Escape first (capture phase) and stop it,
      // so this only runs when nothing inside the overlay is open.
      if (e.key === 'Escape' && isOpen) onClose();
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="performance-comparison-title"
      aria-hidden={!isOpen}
      className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            title="Back to Insights"
            aria-label="Back to Insights"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl hidden sm:flex items-center justify-center shrink-0">
            <GitCompareArrows size={20} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h2 id="performance-comparison-title" className="text-xl font-bold text-gray-900 truncate">
              Performance Comparison
            </h2>
            <p className="text-xs text-gray-500 truncate">Compare KPI performance across sites and timeframes</p>
          </div>
        </div>

        {/* Schoolie (NXT-77214) and Download (NXT-77213) arrive in later phases */}
        <div className="flex items-center gap-1 shrink-0">
          <DisabledHeaderAction title="Ask Schoolie (coming soon)">
            <SchoolieIcon size={52} />
          </DisabledHeaderAction>
          <DisabledHeaderAction title="Download (coming soon)">
            <Download size={20} />
          </DisabledHeaderAction>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">{isOpen && <PerformanceComparisonContent />}</div>
    </div>
  );
};
