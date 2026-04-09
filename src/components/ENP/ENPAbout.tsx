import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

export function ENPAbout() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="pt-4 border-t border-gray-100">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between w-full mb-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center gap-2 group transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">About this Metric</h3>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`} 
          />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 items-start text-left animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="p-1">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </span>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Eligible Not Participating:</strong> ENP is the percentage of students who are officially certified for Free or Reduced-price meals but choose not to eat the school meal on a given day.
          </p>
        </div>
      )}
    </div>
  );
}