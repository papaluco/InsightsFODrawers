import React from 'react';
import { X } from 'lucide-react';
import { ENPDetails } from './ENPDetails';

interface ENPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actualENP: number;
  benchmarkENP: number;
  onOpenSingleSchool: (schoolName: string) => void;
}

export function ENPDrawer({ 
  isOpen, 
  onClose, 
  actualENP, 
  benchmarkENP, 
  onOpenSingleSchool 
}: ENPDrawerProps) {
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
        className={`fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
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
              <p className="text-sm text-gray-500">
                Analysis for Jul 1, 2025 - Apr 3, 2026
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
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
    </>
  );
}