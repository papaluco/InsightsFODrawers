import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, GitCompareArrows } from 'lucide-react';
import { SchoolieIcon } from '../../../components/Common/Icons';
import { SCHOOLIE_PANEL_RESERVED_SPACE_CLASS, SchoolieDrawer } from '../../../components/InsightsDashboard/SchoolieDrawer';
import { ToastProvider } from '../../../components/Common/Toast';
import type { SiteSelection } from '../../../data/siteRegistry';
import type { TimeframeSelection } from '../../../services/comparisonDataService';
import { PERFORMANCE_COMPARISON_PROMPT_ID } from '../../../services/schoolieService';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { useComparison } from '../hooks/useComparison';
import { useSchoolieComparisonContext } from '../hooks/useSchoolieComparisonContext';
import { ComparisonSideKey, isSideComplete, useComparisonStore } from '../store/useComparisonStore';
import { trackComparisonEvent } from '../telemetry';
import { PageDownloadMenu } from './ComparisonExportControls';
import { ComparisonResultsArea } from './ComparisonResultsArea';
import { ComparisonSetup } from './ComparisonSetup';
import { SiteDriversDrawer } from './SiteDriversDrawer';

interface PerformanceComparisonContentProps {
  isSchoolieOpen: boolean;
  onCloseSchoolie: () => void;
}

/** Page body: Setup → Summary / KPI Comparison (with the filters) / Performance Trend (spec §6). */
const PerformanceComparisonContent: React.FC<PerformanceComparisonContentProps> = ({ isSchoolieOpen, onCloseSchoolie }) => {
  const comparison = useComparison();
  const { contextKey, analysisContext } = useSchoolieComparisonContext(comparison);
  const setSideSites = useComparisonStore(s => s.setSideSites);
  const setSideTimeframe = useComparisonStore(s => s.setSideTimeframe);
  const swapSides = useComparisonStore(s => s.swapSides);
  const setFocusedKpi = useComparisonStore(s => s.setFocusedKpi);
  /** KPI shown in the Site Drivers drawer; null = closed. */
  const [siteDriversKpi, setSiteDriversKpi] = useState<ComparisonKpiKey | null>(null);
  const closeSiteDrivers = useCallback(() => setSiteDriversKpi(null), []);

  // NXT-77212 §8: the drawer refreshes in place when the comparison changes, and closes once the
  // (loaded) comparison no longer has a side with more than one site, or a side is cleared.
  const { results, isLoading } = comparison;
  useEffect(() => {
    if (!siteDriversKpi || isLoading) return;
    if (!results?.siteDrivers[siteDriversKpi].available) setSiteDriversKpi(null);
  }, [siteDriversKpi, results, isLoading]);

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

  const handleFocusKpi = (kpi: ComparisonKpiKey | null) => {
    setFocusedKpi(kpi);
    if (kpi) trackComparisonEvent('COMPARISON_KPI_FOCUSED', { kpi });
  };

  const handleViewSites = (kpi: ComparisonKpiKey) => {
    setSiteDriversKpi(kpi);
    trackComparisonEvent('COMPARISON_SITE_DRIVERS_OPENED', { kpi });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      <ComparisonSetup
        comparison={comparison}
        onSitesChange={handleSitesChange}
        onTimeframeChange={handleTimeframeChange}
        onSwap={handleSwap}
      />
      <ComparisonResultsArea comparison={comparison} onFocusKpi={handleFocusKpi} onViewSites={handleViewSites} />
      <SiteDriversDrawer kpi={siteDriversKpi} comparison={comparison} onClose={closeSiteDrivers} isSchoolieOpen={isSchoolieOpen} />
      {/* NXT-77214 §11: a z-[60] panel beside the comparison. On desktop the overlay reserves its width, so
          every page control stays visible and clickable; at tablet width it overlays the page. */}
      {createPortal(
        <SchoolieDrawer
          isOpen={isSchoolieOpen}
          onClose={onCloseSchoolie}
          title="Schoolie AI — Performance Comparison"
          subtitle="AI analysis of the current comparison"
          promptId={PERFORMANCE_COMPARISON_PROMPT_ID}
          sourceEntryPoint="CompareSites"
          width="panel"
          loadingText={
            analysisContext
              ? `Analyzing ${analysisContext.facts.orientation.from} vs ${analysisContext.facts.orientation.to}…`
              : 'Analyzing the current comparison…'
          }
          analysisContext={analysisContext}
          contextKey={contextKey}
          feedbackAttribution="actual"
        />,
        document.body,
      )}
    </div>
  );
};

interface SchoolieHeaderActionProps {
  disabled: boolean;
  onClick: () => void;
}

/** Header Schoolie action (NXT-77214 §11). Disabled, with a tooltip, until both sides are set. */
const SchoolieHeaderAction: React.FC<SchoolieHeaderActionProps> = ({ disabled, onClick }) => {
  const title = disabled ? 'Set both sides to analyze this comparison with Schoolie' : 'Ask Schoolie about this comparison';
  // The title sits on a wrapper because disabled buttons don't show tooltips in every browser.
  return (
    <span title={title} className="inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={title}
        className={`flex items-center justify-center px-2 py-1.5 rounded-lg text-gray-500 transition-colors ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
      >
        <SchoolieIcon size={52} />
      </button>
    </span>
  );
};

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
  const bothSidesSet = useComparisonStore(s => isSideComplete(s.left) && isSideComplete(s.right));
  const [isSchoolieOpen, setIsSchoolieOpen] = useState(false);
  const closeSchoolie = useCallback(() => setIsSchoolieOpen(false), []);

  // Schoolie closes with the overlay, and if a side is cleared there is nothing left to analyze.
  useEffect(() => {
    if (!isOpen || !bothSidesSet) setIsSchoolieOpen(false);
  }, [isOpen, bothSidesSet]);

  const handleOpenSchoolie = () => {
    setIsSchoolieOpen(true);
    trackComparisonEvent('COMPARISON_SCHOOLIE_OPENED');
  };

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
    <ToastProvider>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="performance-comparison-title"
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-[transform,padding] duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${
          isSchoolieOpen ? SCHOOLIE_PANEL_RESERVED_SPACE_CLASS : ''
        }`}
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

          {/* Schoolie (NXT-77214). Download is the page PDF (NXT-77213, UI only). */}
          <div className="flex items-center gap-1 shrink-0">
            <SchoolieHeaderAction disabled={!bothSidesSet} onClick={handleOpenSchoolie} />
            <PageDownloadMenu disabled={!bothSidesSet} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">{isOpen && <PerformanceComparisonContent isSchoolieOpen={isSchoolieOpen} onCloseSchoolie={closeSchoolie} />}</div>
      </div>
    </ToastProvider>
  );
};
