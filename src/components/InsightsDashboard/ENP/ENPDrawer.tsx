import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ENPDetails } from './ENPDetails';
import { SchoolieIcon } from '../../Common/Icons';
import { AIKPIDrawer } from '../AIKPIDrawer';
import { trackInsightsEvent } from '../../../services/insightsUsageService';

interface ENPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actualENP: number;
  benchmarkENP: number;
  onOpenSingleSchool: (schoolName: string) => void;
  dateRange?: string;
  showAIAssistant?: boolean;
}

export function ENPDrawer({
  isOpen,
  onClose,
  actualENP,
  benchmarkENP,
  onOpenSingleSchool,
  dateRange = 'Jul 1, 2025 - Apr 3, 2026',
  showAIAssistant = false,
}: ENPDrawerProps) {

  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsAIOpen(false);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isAIOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isAIOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-6xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">District ENP Details</h2>
              <p className="text-sm text-gray-500">Analysis for {dateRange}</p>
            </div>
            <div className="flex items-center space-x-2">
              {showAIAssistant && (
                <button
                  onClick={() => {
                    setIsAIOpen(true);
                    trackInsightsEvent({ eventType: 'KPI_SCHOOLIE_OPENED', userId: 'current-user', districtId: 'current-district', platform: 'SchoolCafe', context: { kpi: 'ENP' } });
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-700 hover:text-indigo-600 transition-all font-bold text-sm group"
                >
                  <SchoolieIcon size={60} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <ENPDetails
              actualENP={actualENP}
              benchmarkENP={benchmarkENP}
              onOpenSingleSchool={onOpenSingleSchool}
              onClose={onClose}
            />
          </div>
        </div>
      </div>

      <AIKPIDrawer
        isOpen={isAIOpen}
        onClose={onClose}
        onBack={() => setIsAIOpen(false)}
        title="Schoolie AI Analysis"
        subtitle="Eligible Not Participating"
        kpiKey="ENP"
        kpiName="Eligible Not Participating"
        districtName="Mercer County District"
        dateRange={dateRange}
      />
    </>
  );
}