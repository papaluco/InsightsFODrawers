import React from 'react';
import { Target, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { mockSchoolieData } from '../../data/mockSchoolieData';
import { DemoSchoolSelector } from '../Common/DemoSchoolSelector'; 

interface FiltersProps {
  selectedKPI: string;
  setSelectedKPI: (val: string) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  prompts: mockSchoolieData[];
}

export const AIPromptFilters = ({ 
  selectedKPI, 
  setSelectedKPI, 
  isExpanded, 
  setIsExpanded,
  prompts 
}: FiltersProps) => {

  const handleSchoolChange = (filters: any) => {
    console.log("Playground Filter Update:", filters);
  };

  return (
    /* Removed overflow-hidden to allow the dropdown to pop out */
    <section className="border border-gray-200 rounded-xl bg-white shadow-sm relative z-40">
      
      {/* Collapsible Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-tight text-sm">
          <Target size={18} className="text-amber-500" />
          AI Prompt Configuration
        </div>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>

      {/* Filter Body */}
      {isExpanded && (
        /* Added overflow-visible to ensure animation doesn't clip the dropdown */
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300 overflow-visible">
          
          {/* 1. Schoolie Prompt Selector - RESTORED LIST */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Schoolie Prompt
            </label>
            <select 
              value={selectedKPI}
              onChange={(e) => setSelectedKPI(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
            >
              {/* Mapping through your actual prompts array again */}
              {prompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Real Demo School Selector - High Z-Index Column */}
          <div className="space-y-1.5 relative z-50">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Test Site Context
            </label>
            <div className="w-full">
              <DemoSchoolSelector onApply={handleSchoolChange} />
            </div>
            <p className="text-[9px] text-gray-400 italic">Simulating production site filtering</p>
          </div>

          {/* 3. Test Date Range */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarCheck size={12} className="text-amber-500" /> Test Date Range
            </label>
            <div className="p-2.5 bg-gray-100 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg">
              Mar 20, 2026
            </div>
            <p className="text-[9px] text-gray-400 italic">Matches Workspace Mock Data</p>
          </div>

        </div>
      )}
    </section>
  );
};