import React from 'react';
import { BarChart2, Settings, Target } from 'lucide-react';
import { DemoSchoolSelector } from '../Common/DemoSchoolSelector'; 
import { TimeframeSelector } from '../Common/TimeframeSelector';
import { SchoolieIcon } from '../Common/Icons';
import { DashExportMenu, ExportOptions } from '../Common/ExportMenu/DashExportMenu';

interface SimpleHeaderProps {
  onExportTriggered: (options: ExportOptions) => void;
  isGenerating?: boolean;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ 
  onExportTriggered, 
  isGenerating = false 
}) => {
  const handleSchoolChange = (filters: any) => {
    console.log("Header Filter Update:", filters);
  };

  return (
    <div className="flex justify-between items-center mb-8">
      {/* Left Side: Title */}
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-50 p-2 rounded-lg">
          <BarChart2 className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Insights
        </h1>
      </div>

      {/* Right Side: Filters & Tiled Actions */}
      <div className="flex items-center gap-3">
        
        {/* Date Range Selector */}
        <div className="min-w-[140px] relative z-50">
          <TimeframeSelector />
        </div>

        {/* School Selector */}
        <div className="min-w-[180px] relative z-[45]">
          <DemoSchoolSelector onApply={handleSchoolChange} />
        </div>

        {/* Action Buttons Group (White Tiled Look) */}
        <div className="flex items-center gap-2 ml-2">
          
          <DashExportMenu 
            isGenerating={isGenerating} 
            onExport={onExportTriggered} 
          />

          <button 
            title="Configure KPIs"
            className="p-2 bg-white rounded-lg text-gray-500 hover:text-indigo-600 hover:shadow-sm transition-all border-none"
          >
            <Settings size={20} />
          </button>

          <button
            title="Ask Schoolie"
            className="flex items-center justify-center bg-white rounded-lg hover:shadow-sm transition-all border-none overflow-hidden"
            style={{ width: '40px', height: '40px' }}
          >
            <SchoolieIcon size={60} />
          </button>

          <button 
            title="Configure Benchmarks"
            className="p-2 bg-white rounded-lg text-gray-500 hover:text-indigo-600 hover:shadow-sm transition-all border-none"
          >
            <Target size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};