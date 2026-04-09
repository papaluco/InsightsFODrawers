import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ENPSummaryProps {
  actualENP: number;
  benchmarkENP: number;
  totalEnrollment: number;
  totalSNPCount: number;
}

export const ENPSummary: React.FC<ENPSummaryProps> = ({ 
  actualENP, 
  benchmarkENP, 
  totalEnrollment, 
  totalSNPCount 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const difference = actualENP - benchmarkENP;
  const isHigher = difference > 0;

  return (
    <div className="mb-8 pb-4 border-b border-gray-100">
      {/* Clickable Header for Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 group mb-4 outline-none"
      >
        <h3 className="text-lg font-semibold text-gray-900">ENP Overview</h3>
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
            {/* Actual Box */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Actual ENP</div>
              <div className={`text-xl font-bold ${isHigher ? 'text-red-600' : 'text-emerald-600'}`}>
                {actualENP.toFixed(2)}%
              </div>
            </div>

            <div className="text-sm font-bold text-gray-300">vs</div>

            {/* Benchmark Box */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Benchmark</div>
              <div className="text-xl font-bold text-gray-900">{benchmarkENP.toFixed(2)}%</div>
            </div>

            <div className="text-sm font-bold text-gray-300">=</div>

            {/* Difference Box */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Difference</div>
              <div className={`text-xl font-bold ${isHigher ? 'text-red-600' : 'text-emerald-600'}`}>
                {isHigher ? '+' : ''}{difference.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Plain Language Explanation including Enrollment and SNP counts */}
          <p className="text-sm text-gray-600 mt-4 px-1 leading-relaxed">
            Out of a total enrollment of <span className="font-semibold text-gray-900">{totalEnrollment.toLocaleString()}</span> students, 
            there were <span className="font-semibold text-gray-900">{totalSNPCount.toLocaleString()}</span> non-program meals recorded. 
            This represents an ENP of <span className="font-semibold text-gray-900">{actualENP.toFixed(2)}%</span>, 
            which is{' '}
            <span className={isHigher ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {Math.abs(difference).toFixed(2)}% {isHigher ? 'higher' : 'lower'}
            </span>{' '}
            than the district benchmark of {benchmarkENP.toFixed(2)}%.
          </p>
        </div>
      )}
    </div>
  );
};