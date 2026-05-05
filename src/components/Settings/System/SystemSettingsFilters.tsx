import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, RotateCcw } from 'lucide-react';
import { ValueType, Scope, MOCK_MODULES } from '../../../data/mockSystemSettingsData';

export interface SystemSettingsFilterState {
  search: string;
  module: string;
  scope: Scope | '';
  valueType: ValueType | '';
}

interface SystemSettingsFiltersProps {
  filters: SystemSettingsFilterState;
  onChange: (filters: SystemSettingsFilterState) => void;
}

export const defaultFilters: SystemSettingsFilterState = {
  search: '',
  module: '',
  scope: '',
  valueType: '',
};

export const SystemSettingsFilters: React.FC<SystemSettingsFiltersProps> = ({ filters, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const set = (partial: Partial<SystemSettingsFilterState>) => onChange({ ...filters, ...partial });

  const hasActive =
    !!filters.search || !!filters.module || !!filters.scope || !!filters.valueType;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>Filters</span>
          {hasActive && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">Active</span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {isExpanded && (
        <div className="px-5 pb-4 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-2 mt-3 flex-wrap">

            {/* Search */}
            <div className="relative w-44">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={e => set({ search: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Module */}
            <select
              value={filters.module}
              onChange={e => set({ module: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 w-32"
            >
              <option value="">All Modules</option>
              {MOCK_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* Scope */}
            <select
              value={filters.scope}
              onChange={e => set({ scope: e.target.value as Scope | '' })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 w-32"
            >
              <option value="">All Scopes</option>
              <option value="Global">Global</option>
              <option value="District">District</option>
            </select>

            {/* Value Type */}
            <select
              value={filters.valueType}
              onChange={e => set({ valueType: e.target.value as ValueType | '' })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 w-32"
            >
              <option value="">All Types</option>
              <option value="Boolean">Boolean</option>
              <option value="String">String</option>
              <option value="Number">Number</option>
              <option value="Date">Date</option>
              <option value="JSON">JSON</option>
            </select>

            {/* Reset icon */}
            {hasActive && (
              <button
                onClick={() => onChange(defaultFilters)}
                title="Clear filters"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
