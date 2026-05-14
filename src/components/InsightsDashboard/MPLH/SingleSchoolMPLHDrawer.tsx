import React, { useEffect } from 'react';
import { X, Target, Loader2, ChevronLeft } from 'lucide-react'; // Added ChevronLeft
import { SchoolMPLHData } from '../../../data/mockMPLHData';
import { KPIAbout } from '../KPIAbout';
import { SingleSchoolMPLHSummary } from './SingleSchoolMPLHSummary';
import { ProductFeedback } from '../../Feedback/ProductFeedback';

interface SingleSchoolMPLHDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  schoolData?: SchoolMPLHData;
  dateRange?: string;
  isLoading?: boolean;
  onBack?: () => void; // Added onBack to interface
}

export const SingleSchoolMPLHDrawer: React.FC<SingleSchoolMPLHDrawerProps> = ({
  isOpen,
  onClose,
  schoolName,
  schoolData,
  dateRange = 'Jul 1, 2025 - Apr 3, 2026',
  isLoading = false,
  onBack // Destructured here
}) => {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium">Loading School Details...</p>
        </div>
      </div>
    );
  }

  if (!schoolData) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-left">
              
              {/* --- BACK BUTTON (Conditional) --- */}
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors group"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                </button>
              )}

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">MPLH for {schoolName}</h2>
                  <p className="text-sm text-gray-500">Analysis for {dateRange}</p>
                </div>
              </div>
            </div>
            
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-left">
          <SingleSchoolMPLHSummary schoolData={schoolData} />
          <KPIAbout content={
            <div className="space-y-2">
              <p><span className="font-bold text-gray-800">Meals per Labor Hour:</span> MPLH measures operational efficiency by comparing meal equivalents (MEQs) to actual labor hours.</p>
              <p><span className="font-bold text-gray-800">Standard Factors:</span> Breakfast (0.67), Lunch (1.00), Snack (0.33), Adult Breakfast (0.67), Adult Lunch (1.00), Adult Snack (0.67), A La Carte ($4.93).</p>
            </div>
          } />
          <ProductFeedback
            feedbackType='Insights'
            variant='drawer'
            sourceEntryPoint='KpiDrawer'
            analysisIdentifier='MPLH_SingleSchool'
          />
        </div>
      </div>
    </>
  );
};