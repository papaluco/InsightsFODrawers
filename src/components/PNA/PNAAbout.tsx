import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

export const PNAAbout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-8">
      {/* Clickable Header for Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 group mb-4 outline-none"
      >
        <h3 className="text-lg font-semibold text-gray-900">About this Metric</h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? '' : '-rotate-90'
          }`} 
        />
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 items-start text-left">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Paid Not Applied (PNA):</strong> Calculated as (Count of students where 
              Eligibility = Paid AND Reason = Default) ÷ Total relevant student population × 100. 
              PNA represents the percentage of students who are identified as 'Paid' status 
              but do not actually have a meal application or direct certification on file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};