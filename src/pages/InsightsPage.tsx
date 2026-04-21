import { useState, lazy, Suspense, useCallback, useRef  } from 'react';
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
import { PDFDashRenderer } from '../components/PDFGen/PDFDashRenderer';
import { prepareDashboardPDFData } from '../components/PDFGen/adapters/PDFDashAdapter';
import { ExportOptions } from '../components/Common/ExportMenu/DashExportMenu';

// Data
import { generateMockMPLHData, calculateDistrictMPLH } from '../data/mockMPLHData';
import { districtENPActual, districtENPBenchmark } from '../data/mockENPProgramData';

// --- LAZY LOADED COMPONENTS ---
const MPLHDrawer = lazy(() => import('../components/MPLH/MPLHDrawer').then(m => ({ default: m.MPLHDrawer })));
const SingleSchoolMPLHDrawer = lazy(() => import('../components/MPLH/SingleSchoolMPLHDrawer').then(m => ({ default: m.SingleSchoolMPLHDrawer })));
const PNADrawer = lazy(() => import('../components/PNA/PNADrawer').then(m => ({ default: m.PNADrawer })));
const SingleSchoolPNADrawer = lazy(() => import('../components/PNA/SingleSchoolPNADrawer').then(m => ({ default: m.SingleSchoolPNADrawer })));
const ENPDrawer = lazy(() => import('../components/ENP/ENPDrawer').then(m => ({ default: m.ENPDrawer })));
const SingleSchoolENPDrawer = lazy(() => import('../components/ENP/SingleSchoolENPDrawer').then(m => ({ default: m.SingleSchoolENPDrawer })));

// Types for navigation tracking
type NavOrigin = 'DASHBOARD' | 'MPLH_LIST' | 'PNA_LIST' | 'ENP_LIST';

function InsightsPage() {
  const chartRef = useRef<HTMLDivElement>(null); // 1. Initialize the Ref

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSingleSchoolDrawerOpen, setIsSingleSchoolDrawerOpen] = useState(false);
  const [isPNADrawerOpen, setIsPNADrawerOpen] = useState(false);
  const [isSingleSchoolPNADrawerOpen, setIsSingleSchoolPNADrawerOpen] = useState(false);
  const [isENPDrawerOpen, setIsENPDrawerOpen] = useState(false);
  const [isSingleSchoolENPDrawerOpen, setIsSingleSchoolENPDrawerOpen] = useState(false);
  
  // AI State
  const [showAIAssistant, setShowAIAssistant] = useState(false);

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

  // AI CLICK HANDLER
  const handleOpenMPLHWithAI = () => {
    setShowAIAssistant(true);
    setIsDrawerOpen(true);
  };

  // CLOSE HANDLER
  const handleCloseMPLHDrawer = () => {
    setIsDrawerOpen(false);
    setShowAIAssistant(false); 
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
          onOpenMPLH={() => setIsDrawerOpen(true)}
          onOpenPNA={() => setIsPNADrawerOpen(true)}
          onOpenENP={() => setIsENPDrawerOpen(true)}
        />

        {/* --- SCHOOL PERFORMANCE GRID --- */}
        <SchoolPerformanceGrid />

        {/* --- PERFORMANCE Trends --- */}
        <div ref={chartRef}>
          <PerformanceTrends />
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <TestLinks 
          onOpenSingle={openSingleFromDashboard} 
          onOpenAI={handleOpenMPLHWithAI} 
        />
      </div>

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
            onClose={() => setIsPNADrawerOpen(false)}
            actualPNA={actualPNA}
            targetPNA={targetPNA}
            onOpenSingleSchool={handleOpenSingleSchoolPNA}
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
            onClose={() => setIsENPDrawerOpen(false)}
            actualENP={districtENPActual}
            benchmarkENP={districtENPBenchmark}
            onOpenSingleSchool={handleOpenSingleSchoolENP}
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