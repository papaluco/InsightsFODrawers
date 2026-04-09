import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PNASummaryProps {
  actualPNA: number;
  targetPNA: number;
}

export const PNASummary: React.FC<PNASummaryProps> = ({ actualPNA, targetPNA }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const difference = actualPNA - targetPNA;
  const isHigher = difference > 0;

  return (
    <div className="mb-8 pb-4 border-b border-gray-100">
      {/* Clickable Header for Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 group mb-4 outline-none"
      >
        <h3 className="text-lg font-semibold text-gray-900">PNA Overview</h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? '' : '-rotate-90'
          }`} 
        />
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Actual PNA</div>
              <div className={`text-xl font-bold ${isHigher ? 'text-red-600' : 'text-emerald-600'}`}>
                {actualPNA.toFixed(2)}%
              </div>
            </div>

            <div className="text-sm font-bold text-gray-300">vs</div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Benchmark</div>
              <div className="text-xl font-bold text-gray-900">{targetPNA.toFixed(2)}%</div>
            </div>

            <div className="text-sm font-bold text-gray-300">=</div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Difference</div>
              <div className={`text-xl font-bold ${isHigher ? 'text-red-600' : 'text-emerald-600'}`}>
                {isHigher ? '+' : ''}{difference.toFixed(2)}%
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4 px-1">
            Currently, {actualPNA.toFixed(2)}% of students are categorized as Paid by default, which is{' '}
            <span className={isHigher ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {Math.abs(difference).toFixed(2)}% {isHigher ? 'higher' : 'lower'}
            </span>{' '}
            than the district benchmark of {targetPNA.toFixed(2)}%.
          </p>
        </div>
      )}
    </div>
  );
};