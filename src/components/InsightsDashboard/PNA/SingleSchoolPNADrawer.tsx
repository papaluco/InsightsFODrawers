import React, { useEffect, useMemo } from 'react';
import { X, Target, Loader2, ChevronLeft } from 'lucide-react'; // Added ChevronLeft
import { mockPNAData } from '../../../data/mockPNAData';
import { KPISummary } from '../KPISummary';
import { KPIAbout } from '../KPIAbout';
import { PNASchoolGrid } from './PNASchoolGrid';

interface SingleSchoolPNADrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string | null;
  onBack?: () => void;
  isLoading?: boolean;
}

export function SingleSchoolPNADrawer({ 
  isOpen, 
  onClose, 
  schoolName,
  onBack, 
  isLoading = false 
}: SingleSchoolPNADrawerProps) {
  
  const schoolData = useMemo(() => {
    if (!schoolName) return null;
    return mockPNAData.find(s => s.school === schoolName);
  }, [schoolName]);

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/20 transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
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
                  <h2 className="text-lg font-semibold text-gray-900">PNA for {schoolData.school}</h2>
                  <p className="text-sm text-gray-500">Analysis for Jul 1, 2025 - Apr 3, 2026</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-left">
          <KPISummary
            title="PNA Overview"
            actualLabel="Actual PNA"
            actualValue={schoolData.pna}
            targetValue={schoolData.pnaTarget}
            higherIsBetter={false}
            unit="%"
            narrative={(() => {
              const diff = schoolData.pna - schoolData.pnaTarget;
              const isHigher = diff > 0;
              return (
                <>
                  Currently, {schoolData.pna.toFixed(2)}% of students are categorized as Paid by default, which is{' '}
                  <span className={`${isHigher ? 'text-red-600' : 'text-emerald-600'} font-semibold`}>
                    {Math.abs(diff).toFixed(2)}% {isHigher ? 'higher' : 'lower'}
                  </span>{' '}
                  than the district benchmark of {schoolData.pnaTarget.toFixed(2)}%.
                </>
              );
            })()}
          />

          <div className="mb-10">
            <PNASchoolGrid
              onOpenSingleSchool={() => {}}
              targetPNA={schoolData.pnaTarget}
              actualPNA={schoolData.pna}
              isSingleSchoolMode={true}
              singleSchoolName={schoolData.school}
              hideControls={true}
            />
          </div>

          <KPIAbout content={
            <p>
              <strong>Paid Not Applied (PNA):</strong> Calculated as (Count of students where
              Eligibility = Paid AND Reason = Default) ÷ Total relevant student population × 100.
              PNA represents the percentage of students who are identified as &apos;Paid&apos; status
              but do not actually have a meal application or direct certification on file.
            </p>
          } />
        </div>
      </div>
    </div>
  );
}