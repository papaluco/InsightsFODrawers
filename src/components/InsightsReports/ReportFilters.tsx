import React, { useState, useMemo } from 'react';
import { ReportSource } from '../../data/ReportTypes';
// Assuming icons are imported from your Icons.tsx file as discussed
import { FilterIcon, ChevronDownIcon, ChevronUpIcon } from '../Common/Icons'; 

interface Props {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedModule: string;
  setSelectedModule: (val: string) => void;
  selectedSource: ReportSource | 'All';
  setSelectedSource: (val: ReportSource | 'All') => void;
  selectedDataSource: string;
  setSelectedDataSource: (val: string) => void;
  availableDataSources: Array<{ name: string; module: string }>;
}

const modules = ["All", "Accountability", "Eligibility", "Account Management", "Item Management", "Inventory", "Menu Planning", "Production", "Financials", "Reports", "Insights", "System"];

const ReportFilters: React.FC<Props> = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedModule, 
  setSelectedModule, 
  selectedSource, 
  setSelectedSource,
  selectedDataSource,
  setSelectedDataSource,
  availableDataSources = [] 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Filter data sources based on selected module
  const filteredDataSources = useMemo(() => {
    const sources = availableDataSources || [];
    if (selectedModule === 'All') {
      return Array.from(new Set(sources.map(ds => ds.name))).sort();
    }
    return sources
      .filter(ds => ds.module === selectedModule)
      .map(ds => ds.name)
      .sort();
  }, [selectedModule, availableDataSources]);

  // Reset data source if module changes and the current selection isn't in the new list
  React.useEffect(() => {
    if (selectedDataSource !== 'All' && !filteredDataSources.includes(selectedDataSource)) {
      setSelectedDataSource('All');
    }
  }, [selectedModule, filteredDataSources, selectedDataSource, setSelectedDataSource]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Collapsible Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <FilterIcon size={18} className="text-slate-500" />
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Report Filters & Configuration
          </span>
        </div>
        {isOpen ? (
          <ChevronUpIcon size={20} className="text-gray-400" />
        ) : (
          <ChevronDownIcon size={20} className="text-gray-400" />
        )}
      </button>

      {/* Filter Body */}
      {isOpen && (
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Search Field */}
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Search Reports
              </label>
              <input
                id="search"
                type="text"
                className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm p-2.5 border transition-all"
                placeholder="Find a report..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Module Filter */}
            <div>
              <label htmlFor="module-filter" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Module
              </label>
              <select
                id="module-filter"
                className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm p-2.5 border bg-white cursor-pointer"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Data Source Filter (Filtered by Module) */}
            <div>
              <label htmlFor="data-source-filter" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Data Source
              </label>
              <select
                id="data-source-filter"
                className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm p-2.5 border bg-white cursor-pointer"
                value={selectedDataSource}
                onChange={(e) => setSelectedDataSource(e.target.value)}
              >
                <option value="All">All Data Sources</option>
                {filteredDataSources.map(ds => (
                  <option key={ds} value={ds}>{ds}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[10px] text-gray-400 italic">
                {selectedModule === 'All' ? 'Showing all available sources' : `Sources for ${selectedModule}`}
              </p>
            </div>

            {/* Source Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Source Type
              </label>
              <select
                id="type-filter"
                className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm p-2.5 border bg-white cursor-pointer"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              >
                <option value="All">All Types</option>
                <option value={ReportSource.Custom}>Custom</option>
                <option value={ReportSource.ManagedView}>Managed View</option>
                <option value={ReportSource.PowerBI}>Power BI</option>
                <option value={ReportSource.Insights}>Insights</option>
              </select>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;