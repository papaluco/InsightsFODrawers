import { useState, lazy, Suspense, useCallback } from 'react';
import { SimpleHeader } from '../components/InsightsDashboard/SimpleHeader';
import { MPLHCard } from '../components/InsightsDashboard/MPLHCard';
import { PNACard } from '../components/InsightsDashboard/PNACard';
import { ENPCard } from '../components/InsightsDashboard/ENPCard';
import { generateMockMPLHData, calculateDistrictMPLH } from '../data/mockMPLHData';
import { districtENPActual, districtENPBenchmark } from '../data/mockENPProgramData';
import { ChevronRight, Sparkles } from 'lucide-react'; // Added Sparkles

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
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSingleSchoolDrawerOpen, setIsSingleSchoolDrawerOpen] = useState(false);
  const [isPNADrawerOpen, setIsPNADrawerOpen] = useState(false);
  const [isSingleSchoolPNADrawerOpen, setIsSingleSchoolPNADrawerOpen] = useState(false);
  const [isENPDrawerOpen, setIsENPDrawerOpen] = useState(false);
  const [isSingleSchoolENPDrawerOpen, setIsSingleSchoolENPDrawerOpen] = useState(false);
  
  // --- NEW: AI STATE ---
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Navigation State
  const [navOrigin, setNavOrigin] = useState<NavOrigin>('DASHBOARD');

  // Selection State
  const [selectedSchool, setSelectedSchool] = useState<string>('Lincoln Elementary');

  // Data Mocking
  const schoolData = generateMockMPLHData();
  const { actualMPLH, targetMPLH } = calculateDistrictMPLH(schoolData);
  const actualPNA = 11.85;
  const targetPNA = 10.00;

  // --- REUSABLE BACK HANDLER ---
  const handleBack = useCallback(() => {
    setIsSingleSchoolDrawerOpen(false);
    setIsSingleSchoolPNADrawerOpen(false);
    setIsSingleSchoolENPDrawerOpen(false);

    if (navOrigin === 'MPLH_LIST') setIsDrawerOpen(true);
    if (navOrigin === 'PNA_LIST') setIsPNADrawerOpen(true);
    if (navOrigin === 'ENP_LIST') setIsENPDrawerOpen(true);
  }, [navOrigin]);

  // --- NEW: AI CLICK HANDLER ---
  const handleOpenMPLHWithAI = () => {
    setShowAIAssistant(true);
    setIsDrawerOpen(true);
  };

  // --- UPDATED: CLOSE HANDLER ---
  const handleCloseMPLHDrawer = () => {
    setIsDrawerOpen(false);
    setShowAIAssistant(false); // Reset AI state on close
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
    <div className="min-h-screen bg-gray-50 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SimpleHeader />

        <div className="max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MPLH Column */}
          <div className="space-y-4">
            <MPLHCard
              actualMPLH={actualMPLH}
              targetMPLH={targetMPLH}
              onClick={() => setIsDrawerOpen(true)}
            />
            
            <button 
              onClick={() => openSingleFromDashboard('MPLH')} 
              className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all p-4 flex items-center justify-between group"
            >
              <span className="text-base font-semibold text-gray-900">Single School MPLH</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            {/* --- NEW: ASK SCHOOLIE BUTTON --- */}
            <button 
              onClick={handleOpenMPLHWithAI} 
              className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all p-4 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-base font-semibold text-gray-900">MPLH with Schoolie</span>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* PNA Column */}
          <div className="space-y-4">
            <PNACard
              actualPNA={actualPNA}
              targetPNA={targetPNA}
              onClick={() => setIsPNADrawerOpen(true)}
            />
            <button 
              onClick={() => openSingleFromDashboard('PNA')} 
              className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all p-4 flex items-center justify-between group"
            >
              <span className="text-base font-semibold text-gray-900">Single School PNA</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>

          {/* ENP Column */}
          <div className="space-y-4">
            <ENPCard
              actualENP={districtENPActual}
              benchmarkENP={districtENPBenchmark}
              onClick={() => setIsENPDrawerOpen(true)}
            />
            <button 
              onClick={() => openSingleFromDashboard('ENP')} 
              className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all p-4 flex items-center justify-between group"
            >
              <span className="text-base font-semibold text-gray-900">Single School ENP</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="fixed inset-0 bg-black/20 z-50" />}>
        {/* MPLH Drawers */}
        {isDrawerOpen && (
          <MPLHDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseMPLHDrawer} // Using updated handler
            actualMPLH={actualMPLH}
            targetMPLH={targetMPLH}
            schoolData={schoolData}
            onOpenSingleSchool={handleOpenSingleSchoolMPLH}
            showAIAssistant={showAIAssistant} // Passing AI mode
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

        {/* PNA and ENP Drawers remain unchanged... */}
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