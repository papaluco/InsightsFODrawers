import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, Target, Loader2 } from 'lucide-react';
import { MPLHDetails } from './MPLHDetails';
import { SchoolMPLHData } from '../../../data/mockMPLHData';
import { SchoolieIcon } from '../../Common/Icons';
import { AIKPIDrawer } from '../AIKPIDrawer';
import { ProductFeedback } from '../../Feedback/ProductFeedback';

// --- NEW IMPORTS FOR EXPORT ENGINE ---
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { PDFMPLHAdapter } from '../../Downloading/PDFGen/adapters/PDFMPLHAdapter';
import { PDFExpButton } from '../../Downloading/PDFGen/PDFExpButton';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import { CSVMPLHAdapter } from '../../Downloading/CSVGen/adapters/CSVMPLHAdapter';
import { CSVFullExpButton } from '../../Downloading/CSVGen/CSVFullExpButton';
import { trackInsightsEvent } from '../../../services/insightsUsageService';
import { telemetry } from '../../../telemetry';

interface MPLHDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actualMPLH: number;
  targetMPLH: number;
  schoolData: SchoolMPLHData[]; 
  onOpenSingleSchool: (schoolName: string) => void;
  dateRange?: string;
  isLoading?: boolean;
  showAIAssistant?: boolean;
}

export const MPLHDrawer: React.FC<MPLHDrawerProps> = ({
  isOpen,
  onClose,
  actualMPLH,
  targetMPLH,
  schoolData,
  onOpenSingleSchool,
  dateRange = 'Jul 1, 2025 - Apr 3, 2026',
  isLoading = false,
  showAIAssistant = false,
}) => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const openedAtRef = useRef<number | null>(null);
  const firedRef    = useRef(false);

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = performance.now();
      firedRef.current    = false;
    } else {
      openedAtRef.current = null;
      firedRef.current    = false;
    }
  }, [isOpen]);

useEffect(() => {
  if (!isOpen || isLoading || openedAtRef.current === null || firedRef.current) return;

  firedRef.current = true;

  const durationMs = Math.round(performance.now() - openedAtRef.current);

  telemetry.trackPerformance('mplh_drawer_load', {
    eventName: 'mplh_drawer_load',
    performanceCategory: 'drawer_load',
    durationMs,
    thresholdMs: 2000,
    success: true,
    module: 'insights',
    source: 'frontend',
    component: 'MPLHDrawer',
    page: 'InsightsDashboard',
  });

  openedAtRef.current = null;
}, [isOpen, isLoading]);

  // --- PDF DATA MAPPING ---
  const pdfData = useMemo(() => {
    return PDFMPLHAdapter(
      { 
        siteTypeSummary: schoolData,
        actualMPLH, 
        benchmark: targetMPLH, 
        diffValue: (actualMPLH - targetMPLH).toFixed(2),
        isHigher: actualMPLH > targetMPLH,
        percentage: ((actualMPLH/targetMPLH) * 100).toFixed(0),
        subTitle: `Analysis for ${dateRange}`
      }, 
      "Johnathon", 
      "Katy ISD"
    );
  }, [schoolData, actualMPLH, targetMPLH, dateRange]); 

  // --- CSV DATA MAPPING (Generic Approach) ---
  const csvTypeData = useMemo(() => 
    CSVMPLHAdapter(schoolData, 'Type'), 
  [schoolData]);

  const csvSchoolData = useMemo(() => 
    CSVMPLHAdapter(schoolData, 'School'), 
  [schoolData]);

  useEffect(() => {
    if (!isOpen) setIsAIOpen(false);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isAIOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAIOpen, onClose]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header Section */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Meals Per Labor Hour</h2>
                <p className="text-sm text-gray-500">Analysis for {dateRange}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">

              {/* --- EXPORT MENU --- */}
              {showAIAssistant && (
                <ExportMenu>
                  {/* Visual Section */}
                  <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Visual Report</p>
                  </div>
                  <PDFExpButton
                    data={pdfData}
                    onDownload={() => trackInsightsEvent({ eventType: 'KPI_DRAWER_DOWNLOAD', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'MPLH', format: 'PDF' } })}
                  />

                  {/* Data Section */}
                  <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
                  </div>
                  <CSVExpButton
                    title="Summary by Type (.csv)"
                    subtext="Download grid data as seen"
                    csvData={csvTypeData}
                    onClose={onClose}
                    onDownload={() => trackInsightsEvent({ eventType: 'KPI_DRAWER_DOWNLOAD', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'MPLH', format: 'CSV' } })}
                  />
                  <CSVExpButton
                    title="Summary by School (.csv)"
                    subtext="Download grid data as seen"
                    csvData={csvSchoolData}
                    onClose={onClose}
                    onDownload={() => trackInsightsEvent({ eventType: 'KPI_DRAWER_DOWNLOAD', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'MPLH', format: 'CSV' } })}
                  />
                  <CSVFullExpButton
                    title="Full Raw Data (.csv)"
                    subtext="Download all underlying data"
                    onDownload={() => trackInsightsEvent({ eventType: 'KPI_DRAWER_DOWNLOAD', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'MPLH', format: 'CSV' } })}
                  />
                </ExportMenu>
              )}

              {showAIAssistant && (
                <button
                  onClick={() => {
                    setIsAIOpen(true);
                    trackInsightsEvent({ eventType: 'KPI_SCHOOLIE_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'MPLH' } });
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-700 hover:text-indigo-600 transition-all font-bold text-sm group"
                >
                  <SchoolieIcon size={60} />
                </button>
              )}

              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 flex-1 bg-gray-50/30 overflow-y-auto">
          <div className="animate-in fade-in duration-300">
            <MPLHDetails
              actualMPLH={actualMPLH}
              targetMPLH={targetMPLH}
              schoolData={schoolData}
              onOpenSingleSchool={onOpenSingleSchool}
            />
          </div>
          <ProductFeedback
            feedbackType='Insights'
            variant='drawer'
            sourceEntryPoint='KpiDrawer'
            analysisIdentifier='MPLH'
          />
        </div>
      </div>

      <AIKPIDrawer
        isOpen={isAIOpen}
        onClose={onClose}
        onBack={() => setIsAIOpen(false)}
        title="Schoolie AI Analysis"
        subtitle="Meals Per Labor Hour"
        kpiKey="MPLH"
        kpiName="Meals Per Labor Hour"
        districtName="Mercer County District"
        dateRange={dateRange}
      />
    </>
  );
};