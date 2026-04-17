import React, { useEffect, useState } from 'react';
import { X, Target, Loader2, Sparkles, ChevronLeft } from 'lucide-react';
import { MPLHDetails } from './MPLHDetails';
import { MPLHAIDrawer } from './MPLHAIDrawer'; 
import { SchoolMPLHData } from '../../data/mockMPLHData';
import { SchoolieIcon } from '../Common/Icons';

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
  // FIX: Always start with 'details' view regardless of showAIAssistant prop
  const [view, setView] = useState<'details' | 'ai_analysis'>('details');

  // Reset view to 'details' whenever the drawer is closed so it's fresh for next open
  useEffect(() => {
    if (!isOpen) {
      setView('details');
    }
  }, [isOpen]);

  // Escape key listener
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
              {view === 'ai_analysis' && (
                <button 
                  onClick={() => setView('details')} 
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              <div className={`p-2 rounded-full ${view === 'ai_analysis' ? 'bg-indigo-100' : 'bg-blue-100'}`}>
                {view === 'ai_analysis' ? <Sparkles className="h-5 w-5 text-indigo-600" /> : <Target className="h-5 w-5 text-blue-600" />}
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">
                  {view === 'ai_analysis' ? 'Schoolie AI Analysis' : 'Meals Per Labor Hour'}
                </h2>
                <p className="text-sm text-gray-500">
                  {view === 'ai_analysis' ? 'Advanced KPI Insights' : `Analysis for ${dateRange}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* The Button Logic: 
                  - If showAIAssistant is true (from dashboard button), the button is visible.
                  - If we are already looking at AI Analysis, hide the button.
              */}
              {showAIAssistant && view === 'details' && (
                <button
                onClick={() => setView('ai_analysis')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-700 hover:text-indigo-600 transition-all font-bold text-sm animate-in fade-in zoom-in duration-300 group"
              >
                {/* Replacing Sparkles with your Schoolie Icon once ready */}
                <SchoolieIcon size={60}  />
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
          {view === 'details' ? (
            <div className="animate-in fade-in duration-300">
              <MPLHDetails
                actualMPLH={actualMPLH}
                targetMPLH={targetMPLH}
                schoolData={schoolData}
                onOpenSingleSchool={onOpenSingleSchool}
              />
            </div>
          ) : (
            <MPLHAIDrawer dateRange={dateRange} />
          )}
        </div>
      </div>
    </>
  );
};