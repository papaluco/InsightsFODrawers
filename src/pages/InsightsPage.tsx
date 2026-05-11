import { useState, lazy, Suspense, useCallback, useRef, useEffect } from 'react';
import { SchoolieDrawer } from '../components/InsightsDashboard/SchoolieDrawer';
import type { SchoolieSourceEntryPoint } from '../types/schoolieFeedbackTypes';
import { trackInsightsEvent } from '../services/insightsUsageService';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { DASHBOARD_METRICS, DASHBOARD_GRID_DATA } from '../data/mockDashData';
import { toPng } from 'html-to-image'; // You will need to npm install html-to-image

// Components
import { SimpleHeader } from '../components/InsightsDashboard/SimpleHeader';
import { KPICards } from '../components/InsightsDashboard/KPICards';
import { SchoolPerformanceGrid } from '../components/InsightsDashboard/SchoolPerformanceGrid';
import { TestLinks } from '../components/InsightsDashboard/TestLinks';
import { PerformanceTrends } from '../components/InsightsDashboard/PerformanceTrends';

// PDF Logic
import { PDFDashRenderer } from '../components/Downloading/PDFGen/PDFDashRenderer';
import { prepareDashboardPDFData } from '../components/Downloading/PDFGen/adapters/PDFDashAdapter';
import { ExportOptions } from '../components/Downloading/ExportMenu/DashExportMenu';

// Data
import { generateMockMPLHData, calculateDistrictMPLH } from '../data/mockMPLHData';
import { districtENPActual, districtENPBenchmark } from '../data/mockENPProgramData';

// --- LAZY LOADED COMPONENTS ---
const MPLHDrawer = lazy(() => import('../components/InsightsDashboard/MPLH/MPLHDrawer').then(m => ({ default: m.MPLHDrawer })));
const SingleSchoolMPLHDrawer = lazy(() => import('../components/InsightsDashboard/MPLH/SingleSchoolMPLHDrawer').then(m => ({ default: m.SingleSchoolMPLHDrawer })));
const PNADrawer = lazy(() => import('../components/InsightsDashboard/PNA/PNADrawer').then(m => ({ default: m.PNADrawer })));
const SingleSchoolPNADrawer = lazy(() => import('../components/InsightsDashboard/PNA/SingleSchoolPNADrawer').then(m => ({ default: m.SingleSchoolPNADrawer })));
const ENPDrawer = lazy(() => import('../components/InsightsDashboard/ENP/ENPDrawer').then(m => ({ default: m.ENPDrawer })));
const SingleSchoolENPDrawer = lazy(() => import('../components/InsightsDashboard/ENP/SingleSchoolENPDrawer').then(m => ({ default: m.SingleSchoolENPDrawer })));

// Types for navigation tracking
type NavOrigin = 'DASHBOARD' | 'MPLH_LIST' | 'PNA_LIST' | 'ENP_LIST';

function InsightsPage() {
  const chartRef = useRef<HTMLDivElement>(null); // 1. Initialize the Ref

  useEffect(() => {
    trackInsightsEvent({
      eventType: 'INSIGHTS_PAGE_VIEWED',
      userId: 'current-user',
      districtId: 'current-district',
      platform: 'SchoolCafe',
      context: {},
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSingleSchoolDrawerOpen, setIsSingleSchoolDrawerOpen] = useState(false);
  const [isPNADrawerOpen, setIsPNADrawerOpen] = useState(false);
  const [isSingleSchoolPNADrawerOpen, setIsSingleSchoolPNADrawerOpen] = useState(false);
  const [isENPDrawerOpen, setIsENPDrawerOpen] = useState(false);
  const [isSingleSchoolENPDrawerOpen, setIsSingleSchoolENPDrawerOpen] = useState(false);
  
  // AI State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showENPAIAssistant, setShowENPAIAssistant] = useState(false);
  const [showPNAAIAssistant, setShowPNAAIAssistant] = useState(false);

  // Schoolie Drawer State (shared for Trends + Grid)
  const [schoolieDrawer, setSchoolieDrawer] = useState<{
    promptId: string;
    title: string;
    subtitle: string;
    sourceEntryPoint: SchoolieSourceEntryPoint;
  } | null>(null);

  // PDF Export State
  const [isExporting, setIsExporting] = useState(false);

  // Navigation State
  const [navOrigin, setNavOrigin] = useState<NavOrigin>('DASHBOARD');

  // Selection State
  const [selectedSchool, setSelectedSchool] = useState<string>('Lincoln Elementary');

  // Data Mocking
  const schoolData = generateMockMPLHData();
  const { actualMPLH, targetMPLH } = calculateDistrictMPLH(schoolData);
  const actualPNA = 11.85;
  const targetPNA = 10.00;

  // --- PDF EXPORT HANDLER ---
  const handleDashboardExport = async (options: ExportOptions) => {
    setIsExporting(true);

    try {
      // 1. Capture the chart image as a Base64 string
      let chartImage = '';
      if (chartRef.current) {
        // We use a higher pixelRatio to make sure the chart looks crisp in the PDF
        chartImage = await toPng(chartRef.current, { 
          pixelRatio: 5, quality: 1, backgroundColor: '#ffffff' });
      }

      // 1. Prepare data via Adapter with ALL dashboard metrics
      const pdfData = prepareDashboardPDFData(
        DASHBOARD_GRID_DATA,
        DASHBOARD_METRICS,
        options,
        chartImage // <--- THE MISSING LINK
      );

  // 2. Generate PDF Blob
  const doc = <PDFDashRenderer data={pdfData} />;
  const blob = await pdf(doc).toBlob();
 
  // 3. Trigger Download
  saveAs(blob, `Schoolie_Insights_${new Date().toISOString().split('T')[0]}.pdf`);
  trackInsightsEvent({ eventType: 'DASHBOARD_DOWNLOAD', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { format: 'PDF' } });
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    setIsExporting(false);
  }
 };

  // --- REUSABLE BACK HANDLER ---
  const handleBack = useCallback(() => {
    setIsSingleSchoolDrawerOpen(false);
    setIsSingleSchoolPNADrawerOpen(false);
    setIsSingleSchoolENPDrawerOpen(false);

    if (navOrigin === 'MPLH_LIST') setIsDrawerOpen(true);
    if (navOrigin === 'PNA_LIST') setIsPNADrawerOpen(true);
    if (navOrigin === 'ENP_LIST') setIsENPDrawerOpen(true);
  }, [navOrigin]);

  // AI CLICK HANDLERS
  const handleOpenMPLHWithAI = () => {
    setShowAIAssistant(true);
    setIsDrawerOpen(true);
    trackInsightsEvent({ eventType: 'KPI_SCHOOLIE_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'MPLH' } });
  };

  const handleOpenENPWithAI = () => {
    setShowENPAIAssistant(true);
    setIsENPDrawerOpen(true);
    trackInsightsEvent({ eventType: 'KPI_SCHOOLIE_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'ENP' } });
  };

  const handleOpenPNAWithAI = () => {
    setShowPNAAIAssistant(true);
    setIsPNADrawerOpen(true);
    trackInsightsEvent({ eventType: 'KPI_SCHOOLIE_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'PNA' } });
  };

  const handleOpenTrendsSchoolie = () => {
    setSchoolieDrawer({
      promptId: 'trend_analysis',
      title: 'Schoolie AI — Performance Trends',
      subtitle: 'AI analysis of your performance trend data',
      sourceEntryPoint: 'TrendAnalysis',
    });
    trackInsightsEvent({ eventType: 'DASHBOARD_SCHOOLIE_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'TREND' } });
  };

  const handleOpenGridSchoolie = () => {
    setSchoolieDrawer({
      promptId: 'insights',
      title: 'Schoolie AI — School Performance',
      subtitle: 'AI analysis of school performance metrics',
      sourceEntryPoint: 'Dashboard',
    });
    trackInsightsEvent({ eventType: 'DASHBOARD_SCHOOLIE_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'INSIGHTS_GRID' } });
  };

  // CLOSE HANDLERS
  const handleCloseMPLHDrawer = () => {
    setIsDrawerOpen(false);
    setShowAIAssistant(false);
  };

  const handleCloseENPDrawer = () => {
    setIsENPDrawerOpen(false);
    setShowENPAIAssistant(false);
  };

  const handleClosePNADrawer = () => {
    setIsPNADrawerOpen(false);
    setShowPNAAIAssistant(false);
  };

  const openSingleFromDashboard = (metric: 'MPLH' | 'PNA' | 'ENP') => {
    setSelectedSchool('Lincoln Elementary'); 
    setNavOrigin('DASHBOARD');
    
    if (metric === 'MPLH') setIsSingleSchoolDrawerOpen(true);
    if (metric === 'PNA') setIsSingleSchoolPNADrawerOpen(true);
    if (metric === 'ENP') setIsSingleSchoolENPDrawerOpen(true);
  };

  const handleOpenSingleSchoolMPLH = useCallback((schoolName: string) => {
    setSelectedSchool(schoolName);
    setNavOrigin('MPLH_LIST');
    setIsDrawerOpen(false); 
    setIsSingleSchoolDrawerOpen(true);
  }, []);

  const handleOpenSingleSchoolPNA = useCallback((schoolName: string) => {
    setSelectedSchool(schoolName);
    setNavOrigin('PNA_LIST');
    setIsPNADrawerOpen(false);
    setIsSingleSchoolPNADrawerOpen(true);
  }, []);

  const handleOpenSingleSchoolENP = useCallback((schoolName: string) => {
    setSelectedSchool(schoolName);
    setNavOrigin('ENP_LIST');
    setIsENPDrawerOpen(false);
    setIsSingleSchoolENPDrawerOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-left p-6">
      <div className="w-full mx-auto">
        <SimpleHeader 
          onExportTriggered={handleDashboardExport}
          isGenerating={isExporting}
        />

        {/* --- KPI SECTION --- */}
        <KPICards
          actualMPLH={actualMPLH} 
          targetMPLH={targetMPLH}
          actualPNA={actualPNA}
          targetPNA={targetPNA}
          districtENPActual={districtENPActual}
          districtENPBenchmark={districtENPBenchmark}
          onOpenMPLH={() => {
            setIsDrawerOpen(true);
            trackInsightsEvent({ eventType: 'KPI_DRAWER_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'MPLH', isDistrictDrawer: true } });
          }}
          onOpenPNA={() => {
            setIsPNADrawerOpen(true);
            trackInsightsEvent({ eventType: 'KPI_DRAWER_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'PNA', isDistrictDrawer: true } });
          }}
          onOpenENP={() => {
            setIsENPDrawerOpen(true);
            trackInsightsEvent({ eventType: 'KPI_DRAWER_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'ENP', isDistrictDrawer: true } });
          }}
        />

        {/* --- SCHOOL PERFORMANCE GRID --- */}
        <SchoolPerformanceGrid onSchoolieClick={handleOpenGridSchoolie} />

        {/* --- PERFORMANCE Trends --- */}
        <div ref={chartRef}>
          <PerformanceTrends onSchoolieClick={handleOpenTrendsSchoolie} />
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <TestLinks
          onOpenSingle={openSingleFromDashboard}
          onOpenAI={handleOpenMPLHWithAI}
          onOpenAIENP={handleOpenENPWithAI}
          onOpenAIPNA={handleOpenPNAWithAI}
        />
      </div>

      {schoolieDrawer && (
        <SchoolieDrawer
          isOpen={schoolieDrawer !== null}
          onClose={() => setSchoolieDrawer(null)}
          title={schoolieDrawer.title}
          subtitle={schoolieDrawer.subtitle}
          promptId={schoolieDrawer.promptId}
          sourceEntryPoint={schoolieDrawer.sourceEntryPoint}
        />
      )}

      <Suspense fallback={<div className="fixed inset-0 bg-black/20 z-50" />}>
        {/* MPLH Drawers */}
        {isDrawerOpen && (
          <MPLHDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseMPLHDrawer}
            actualMPLH={actualMPLH}
            targetMPLH={targetMPLH}
            schoolData={schoolData}
            onOpenSingleSchool={handleOpenSingleSchoolMPLH}
            showAIAssistant={showAIAssistant}
          />
        )}

        {isSingleSchoolDrawerOpen && (
          <SingleSchoolMPLHDrawer
            isOpen={isSingleSchoolDrawerOpen}
            onClose={() => setIsSingleSchoolDrawerOpen(false)}
            schoolName={selectedSchool}
            schoolData={schoolData.find(s => s.schoolName === selectedSchool)}
            onBack={navOrigin !== 'DASHBOARD' ? handleBack : undefined}
          />
        )}

        {/* PNA Drawers */}
        {isPNADrawerOpen && (
          <PNADrawer
            isOpen={isPNADrawerOpen}
            onClose={handleClosePNADrawer}
            actualPNA={actualPNA}
            targetPNA={targetPNA}
            onOpenSingleSchool={handleOpenSingleSchoolPNA}
            showAIAssistant={showPNAAIAssistant}
          />
        )}

        {isSingleSchoolPNADrawerOpen && (
          <SingleSchoolPNADrawer
            isOpen={isSingleSchoolPNADrawerOpen}
            onClose={() => setIsSingleSchoolPNADrawerOpen(false)}
            schoolName={selectedSchool} 
            onBack={navOrigin !== 'DASHBOARD' ? handleBack : undefined}
          />
        )}

        {/* ENP Drawers */}
        {isENPDrawerOpen && (
          <ENPDrawer
            isOpen={isENPDrawerOpen}
            onClose={handleCloseENPDrawer}
            actualENP={districtENPActual}
            benchmarkENP={districtENPBenchmark}
            onOpenSingleSchool={handleOpenSingleSchoolENP}
            showAIAssistant={showENPAIAssistant}
          />
        )}

        {isSingleSchoolENPDrawerOpen && (
          <SingleSchoolENPDrawer
            isOpen={isSingleSchoolENPDrawerOpen}
            onClose={() => setIsSingleSchoolENPDrawerOpen(false)}
            schoolName={selectedSchool}
            onBack={navOrigin !== 'DASHBOARD' ? handleBack : undefined}
          />
        )}
      </Suspense>
    </div>
  );
}

export default InsightsPage;