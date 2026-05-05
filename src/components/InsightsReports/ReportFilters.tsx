import React, { useState, useMemo, useEffect } from 'react';
import { ReportSource } from '../../types/ReportTypes';
import { FilterIcon, ChevronDownIcon, ChevronUpIcon } from '../Common/Icons';
import { REPORT_MODULES, getDataSourceOptions } from '../../constants/reportDataSources';

interface Props {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedModule: string;
  setSelectedModule: (val: string) => void;
  selectedSource: ReportSource | 'All';
  setSelectedSource: (val: ReportSource | 'All') => void;
  selectedDataSource: string;
  setSelectedDataSource: (val: string) => void;
}

const SOURCE_TYPES: { label: string; value: ReportSource | 'All' }[] = [
  { label: 'All Types',        value: 'All' },
  { label: 'Custom Reports',   value: ReportSource.Custom },
  { label: 'Managed View',     value: ReportSource.ManagedView },
  { label: 'Power BI',         value: ReportSource.PowerBI },
  { label: 'Insights',         value: ReportSource.Insights },
  { label: 'Download',         value: ReportSource.Download },
  { label: 'Distributed',      value: ReportSource.Distributed },
];

const MODULE_OPTIONS = ['All', ...REPORT_MODULES];

const ReportFilters: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  selectedModule,
  setSelectedModule,
  selectedSource,
  setSelectedSource,
  selectedDataSource,
  setSelectedDataSource,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Data source options driven by the same constants as the Usage Dashboard
  const dataSourceOptions = useMemo(
    () => getDataSourceOptions(selectedModule !== 'All' ? selectedModule : undefined),
    [selectedModule]
  );

  // Reset data source if module changes and current selection is no longer available
  useEffect(() => {
    if (selectedDataSource !== 'All' && !dataSourceOptions.some(ds => ds.label === selectedDataSource)) {
      setSelectedDataSource('All');
    }
  }, [selectedModule, dataSourceOptions, selectedDataSource, setSelectedDataSource]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
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

      {isOpen && (
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Search */}
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

            {/* Module — from canonical REPORT_MODULES list */}
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
                {MODULE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Data Source — from same constants as Usage Dashboard, cascaded by module */}
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
                {dataSourceOptions.map(ds => (
                  <option key={ds.key} value={ds.label}>{ds.label}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[10px] text-gray-400 italic">
                {selectedModule === 'All' ? 'Select a module to filter sources' : `Sources for ${selectedModule}`}
              </p>
            </div>

            {/* Source Type — same options as Usage Dashboard */}
            <div>
              <label htmlFor="type-filter" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Source Type
              </label>
              <select
                id="type-filter"
                className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm p-2.5 border bg-white cursor-pointer"
                value={selectedSource === 'All' ? 'All' : String(selectedSource)}
                onChange={(e) => setSelectedSource(e.target.value === 'All' ? 'All' : Number(e.target.value) as ReportSource)}
              >
                {SOURCE_TYPES.map(({ label, value }) => (
                  <option key={String(value)} value={String(value)}>{label}</option>
                ))}
              </select>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
