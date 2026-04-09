import React, { useEffect, useMemo, useState } from 'react';
import { X, Target, Loader2, ChevronLeft } from 'lucide-react';
import { mockSchoolENPData } from '../../data/mockENPData'; 
import { ENPAbout } from './ENPAbout';
import { ENPSummary } from './ENPSummary';
import { ENPProgramGrid } from './ENPProgramGrid';

interface SingleSchoolENPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string | null;
  onBack?: () => void;
  isLoading?: boolean;
}

export function SingleSchoolENPDrawer({
  isOpen,
  onClose,
  schoolName,
  onBack,
  isLoading = false
}: SingleSchoolENPDrawerProps) {
  const [isProgramExpanded, setIsProgramExpanded] = useState(true);

  const schoolData = useMemo(() => {
    if (!schoolName) return null;
    return mockSchoolENPData.find(s => s.schoolName === schoolName);
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
        
        {/* Header - Fixed: Added padding and bottom border to stop the squishing */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-left">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors group"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                </button>
              )}

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{schoolData.schoolName}</h2>
                  <p className="text-sm text-gray-500">Analysis for Jul 1, 2025 - Apr 3, 2026</p>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left">
          
          <div>
            <ENPSummary 
              actualENP={schoolData.snp.percentage} 
              benchmarkENP={schoolData.snpTarget} 
            />
          </div>

          <div>
            <ENPProgramGrid 
              isExpanded={isProgramExpanded}
              onToggle={() => setIsProgramExpanded(!isProgramExpanded)}
              sortedProgramData={schoolData.eligibilityBreakdown}
              benchmarkENP={schoolData.snpTarget}
              onSort={() => {}} 
              programSortConfig={null}
            />
          </div>

          <ENPAbout />
        </div>
      </div>
    </div>
  );
}