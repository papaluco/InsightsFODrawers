import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MPLHSummaryProps {
  actualMPLH: number;
  targetMPLH: number;
}

export const MPLHSummary: React.FC<MPLHSummaryProps> = ({ actualMPLH, targetMPLH }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const difference = actualMPLH - targetMPLH;
  const isHigher = difference >= 0;

  return (
    <div className="mb-4 pb-4 border-b border-gray-100">
      {/* Collapsible Header Panel */}
      <div className="flex items-center justify-between w-full mb-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center gap-2 group transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">MPLH Overview</h3>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`} 
          />
        </button>
      </div>
      
      {/* Summary Content */}
      {isExpanded && (
        <div className="flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Actual Box */}
          <div className="bg-gray-50 rounded-lg p-3 text-center flex-1 border border-gray-100">
            <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Actual</div>
            <div className={`text-xl font-bold ${isHigher ? 'text-emerald-600' : 'text-red-600'}`}>
              {actualMPLH.toFixed(2)}
            </div>
          </div>

          <div className="text-sm font-bold text-gray-300">VS</div>

          {/* Target Box */}
          <div className="bg-gray-50 rounded-lg p-3 text-center flex-1 border border-gray-100">
            <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Benchmark</div>
            <div className="text-xl font-bold text-gray-900">{targetMPLH.toFixed(2)}</div>
          </div>

          <div className="text-sm font-bold text-gray-300">=</div>

          {/* Difference Box */}
          <div className="bg-gray-50 rounded-lg p-3 text-center flex-1 border border-gray-100">
            <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Difference</div>
            <div className={`text-xl font-bold ${isHigher ? 'text-emerald-600' : 'text-red-600'}`}>
              {isHigher ? '+' : ''}{difference.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};