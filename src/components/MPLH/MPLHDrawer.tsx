import React, { useEffect } from 'react';
import { X, Target, Loader2 } from 'lucide-react';
import { MPLHDetails } from './MPLHDetails';
import { SchoolMPLHData } from '../../data/mockMPLHData';

interface MPLHDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actualMPLH: number;
  targetMPLH: number;
  schoolData: SchoolMPLHData[];
  onOpenSingleSchool: (schoolName: string) => void; // ADDED THIS
  dateRange?: string;
  isLoading?: boolean;
}

export const MPLHDrawer: React.FC<MPLHDrawerProps> = ({
  isOpen,
  onClose,
  actualMPLH,
  targetMPLH,
  schoolData,
  onOpenSingleSchool, // ADDED THIS
  dateRange = 'Jul 1, 2025 - Apr 3, 2026',
  isLoading = false,
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
          <p className="text-gray-500 font-medium">Loading Analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-2xl z-50 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Meals Per Labor Hour
                </h2>
                <p className="text-sm text-gray-500">
                  Analysis for {dateRange}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1">
          <MPLHDetails
            actualMPLH={actualMPLH}
            targetMPLH={targetMPLH}
            schoolData={schoolData}
            onOpenSingleSchool={onOpenSingleSchool} // PASSED IT DOWN HERE
          />
        </div>
      </div>
    </>
  );
};