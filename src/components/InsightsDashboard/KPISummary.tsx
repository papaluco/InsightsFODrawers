import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface KPISummaryProps {
  title: string;
  actualLabel?: string;
  actualValue: number;
  targetValue: number;
  higherIsBetter: boolean;
  unit?: string;
  narrative: React.ReactNode;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  title,
  actualLabel = 'Actual',
  actualValue,
  targetValue,
  higherIsBetter,
  unit = '',
  narrative,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const difference = actualValue - targetValue;
  const isHigher = difference >= 0;
  const isGood = higherIsBetter ? isHigher : !isHigher;

  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 group mb-4 outline-none"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? '' : '-rotate-90'
          }`}
        />
      </button>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">{actualLabel}</div>
              <div className={`text-xl font-bold ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
                {actualValue.toFixed(2)}{unit}
              </div>
            </div>

            <div className="text-sm font-bold text-gray-300">vs</div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Benchmark</div>
              <div className="text-xl font-bold text-gray-900">{targetValue.toFixed(2)}{unit}</div>
            </div>

            <div className="text-sm font-bold text-gray-300">=</div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center flex-1">
              <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Difference</div>
              <div className={`text-xl font-bold ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
                {isHigher ? '+' : ''}{difference.toFixed(2)}{unit}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4 px-1 leading-relaxed">
            {narrative}
          </p>
        </div>
      )}
    </div>
  );
};
