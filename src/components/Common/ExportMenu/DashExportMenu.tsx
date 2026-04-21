import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DownloadIcon, SettingsIcon, CheckIcon } from '../Icons';

interface DashExportMenuProps {
  onExport: (options: ExportOptions) => void;
  isGenerating: boolean;
}

export interface ExportOptions {
  includeKPIs: boolean;
  includeGrid: boolean;
  includeTrends: boolean;
}

export const DashExportMenu: React.FC<DashExportMenuProps> = ({ onExport, isGenerating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeKPIs: true,
    includeGrid: true,
    includeTrends: true,
  });
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic Subtext Logic
  const subtext = useMemo(() => {
    const { includeKPIs: k, includeGrid: g, includeTrends: t } = options;
    if (k && g && t) return "All";
    if (k && !g && !t) return "Cards Only";
    if (!k && g && !t) return "Grid Only";
    if (!k && !g && t) return "Chart Only";
    if (k && g && !t) return "Cards and Grid";
    if (k && !g && t) return "Cards and Trend";
    if (!k && g && t) return "Grid and Chart";
    return "None selected";
  }, [options]);

  // Accessibility: Click Outside & Escape Key
  useEffect(() => {
    const handleEvents = (event: any) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowOptions(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleEvents);
    document.addEventListener('keydown', handleEvents);
    return () => {
      document.removeEventListener('mousedown', handleEvents);
      document.removeEventListener('keydown', handleEvents);
    };
  }, []);

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Updated: Small white box style to match other icons */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        disabled={isGenerating}
        title="Download Visualization"
        className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-lg hover:shadow-sm transition-all group border-none"
      >
        <DownloadIcon 
          size={20} 
          className={`${isGenerating ? 'animate-pulse text-indigo-400' : 'text-gray-500 group-hover:text-indigo-600'} transition-colors`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dashboard Reports</p>
          </div>

          <div className="p-1">
            <div className="flex items-stretch rounded-lg hover:bg-indigo-50 group transition-colors">
              {/* Main Area: Download Visualization (.PDF) */}
              <button 
                disabled={isGenerating || subtext === "None selected"}
                onClick={() => {
                  onExport(options);
                  setIsOpen(false);
                }}
                className="flex-grow flex items-center p-3 text-left disabled:opacity-50"
              >
                {/* Updated: Using standard DownloadIcon instead of PDF box */}
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mr-3">
                  <DownloadIcon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Download Visualization (.PDF)</p>
                  <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-tight">{subtext}</p>
                </div>
              </button>

              {/* Options Toggle */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className={`px-3 border-l border-gray-100 flex items-center hover:bg-indigo-100 transition-colors ${showOptions ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
              >
                <SettingsIcon size={16} />
              </button>
            </div>

            {showOptions && (
              <div className="mx-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200 animate-in slide-in-from-top-1">
                <OptionItem label="KPI Summary Cards" isActive={options.includeKPIs} onClick={() => toggleOption('includeKPIs')} />
                <OptionItem label="School Performance Grid" isActive={options.includeGrid} onClick={() => toggleOption('includeGrid')} />
                <OptionItem label="Performance Trend Chart" isActive={options.includeTrends} onClick={() => toggleOption('includeTrends')} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionItem = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="flex items-center justify-between w-full p-2 text-[11px] font-medium text-gray-600 hover:bg-white hover:rounded-md transition-all"
  >
    <span>{label}</span>
    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
      {isActive && <CheckIcon size={10} className="text-white" />}
    </div>
  </button>
);