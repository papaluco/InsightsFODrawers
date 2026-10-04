import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Square, CheckSquare } from 'lucide-react';
import {
  ALL_SITES_ID,
  DEMO_SITES,
  getSiteSelectorLabel,
  SiteRegistry,
  SiteSelection,
} from '../../data/siteRegistry';

// Builds the { siteIdList, siteTypeIdList } filter shape emitted by onApply (both empty for "All")
const buildFilters = (filtersArray: SiteSelection, sitesData: SiteRegistry) => {
  if (filtersArray.includes(ALL_SITES_ID)) return { siteIdList: [], siteTypeIdList: [] };

  const siteIds = sitesData.siteList.map(s => s.siteId);
  const siteTypeIds = sitesData.siteTypeList.map(st => st.siteTypeId);

  return {
    siteIdList: filtersArray.filter(f => siteIds.includes(f)),
    siteTypeIdList: filtersArray.filter(f => siteTypeIds.includes(f)),
  };
};

export type DemoSchoolFilters = ReturnType<typeof buildFilters>;

interface DemoSchoolSelectorProps {
  onApply?: (filters: DemoSchoolFilters) => void;
  darkMode?: boolean;
}

export const DemoSchoolSelector: React.FC<DemoSchoolSelectorProps> = ({ onApply, darkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState<number[]>([0]); // Default to "All Schools"
  const [applied, setApplied] = useState<number[]>([0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = (id: number) => {
    setPending(prev => {
      const next = new Set(prev);
      if (id === 0) {
        // Toggle All Schools logic
        if (next.has(0)) return [];
        const allIds = [0, ...DEMO_SITES.siteTypeList.map(t => t.siteTypeId), ...DEMO_SITES.siteList.map(s => s.siteId)];
        return allIds;
      }
      
      if (next.has(id)) next.delete(id); else next.add(id);
      
      // Remove "All Schools" (0) if any individual item is manually unchecked
      if (next.has(0) && !next.has(id)) next.delete(0);
      
      return Array.from(next);
    });
  };

  const handleApply = () => {
    setApplied(pending);
    setIsOpen(false);
    if (onApply) onApply(buildFilters(pending, DEMO_SITES));
  };

  const getLabel = () => getSiteSelectorLabel(applied);

  const isSelected = (id: number) => pending.includes(id);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
          darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
        }`}
      >
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium truncate max-w-[150px]">{getLabel()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-xl shadow-2xl bg-white border border-gray-100 overflow-hidden z-[100]">
          <div className="max-h-80 overflow-y-auto py-2">
            
            {/* Master Toggle */}
            <div onClick={() => handleToggle(0)} className="flex items-center px-4 py-2 hover:bg-indigo-50 cursor-pointer group">
              {isSelected(0) ? <CheckSquare className="w-4 h-4 text-indigo-600 mr-3" /> : <Square className="w-4 h-4 text-gray-300 mr-3" />}
              <Building2 className="w-4 h-4 text-indigo-600 mr-3" />
              <span className="text-sm font-semibold text-indigo-600">All Schools</span>
            </div>

            <div className="border-t border-gray-100 my-1" />

            {/* Site Types */}
            {DEMO_SITES.siteTypeList.map(type => (
              <div key={type.siteTypeId} onClick={() => handleToggle(type.siteTypeId)} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                {isSelected(type.siteTypeId) ? <CheckSquare className="w-4 h-4 text-indigo-600 mr-3" /> : <Square className="w-4 h-4 text-gray-300 mr-3" />}
                <Building2 className="w-4 h-4 text-indigo-500 mr-3" />
                <span className="text-sm text-gray-700">{type.siteTypeName}</span>
              </div>
            ))}

            <div className="border-t border-gray-100 my-1" />

            {/* Individual Schools */}
            {DEMO_SITES.siteList.map(school => (
              <div key={school.siteId} onClick={() => handleToggle(school.siteId)} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                {isSelected(school.siteId) ? <CheckSquare className="w-4 h-4 text-indigo-600 mr-3" /> : <Square className="w-4 h-4 text-gray-300 mr-3" />}
                <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600 truncate">{school.siteName}</span>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 p-3 border-t bg-gray-50">
            <button 
              onClick={() => setPending([])}
              className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
            <button 
              onClick={handleApply}
              className="flex-1 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};