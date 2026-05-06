import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { InsightsUsageFilters, DEFAULT_INSIGHTS_FILTERS } from '../../../types/insightsUsageTypes';
import { MultiSelectDropdown, SelectOption } from '../../Common/MultiSelectDropdown';
import {
  getPlatformOptions,
  getDistrictOptions,
  getUserOptions,
  getKPIOptions,
  getEventTypeOptions,
} from '../../../services/insightsFilterOptionsService';

interface Props {
  filters: InsightsUsageFilters;
  onChange: (f: InsightsUsageFilters) => void;
}

const InsightsUsageFiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  const [expanded, setExpanded] = useState(true);

  const [platformOptions, setPlatformOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [kpiOptions, setKpiOptions] = useState<SelectOption[]>([]);
  const [eventTypeOptions, setEventTypeOptions] = useState<SelectOption[]>([]);

  // Load static option lists once
  useEffect(() => {
    getPlatformOptions().then(setPlatformOptions);
    getKPIOptions().then(setKpiOptions);
    getEventTypeOptions().then(setEventTypeOptions);
  }, []);

  // Reload districts when platform changes
  useEffect(() => {
    getDistrictOptions(filters.platform || undefined).then(setDistrictOptions);
  }, [filters.platform]);

  // Reload users when platform or districts change
  useEffect(() => {
    getUserOptions(
      filters.platform || undefined,
      filters.districts.length ? filters.districts : undefined
    ).then(setUserOptions);
  }, [filters.platform, filters.districts]);

  const activeCount = useMemo(() => [
    filters.startDate !== '',
    filters.endDate !== '',
    filters.platform !== '',
    filters.districts.length > 0,
    filters.userIds.length > 0,
    filters.kpi !== '',
    filters.eventTypes.length > 0,
  ].filter(Boolean).length, [filters]);

  const handlePlatformChange = (v: string) =>
    onChange({ ...filters, platform: v, districts: [], userIds: [] });

  const handleDistrictsChange = (values: string[]) =>
    onChange({ ...filters, districts: values, userIds: [] });

  const clearAll = () => onChange({ ...DEFAULT_INSIGHTS_FILTERS });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-indigo-600 font-semibold hover:underline"
            >
              <X size={11} /> Clear all
            </button>
          )}
          {expanded
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => onChange({ ...filters, startDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onChange({ ...filters, endDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>

          {/* Platform — single select (cascade clears district + users) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={e => handlePlatformChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            >
              <option value="">All</option>
              {platformOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* District — multi-select searchable */}
          <MultiSelectDropdown
            label="District"
            options={districtOptions}
            selected={filters.districts}
            onChange={handleDistrictsChange}
            placeholder="Search districts..."
          />

          {/* User — multi-select searchable */}
          <MultiSelectDropdown
            label="User"
            options={userOptions}
            selected={filters.userIds}
            onChange={values => onChange({ ...filters, userIds: values })}
            placeholder="Search users..."
          />

          {/* KPI — single select with long names */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              KPI
            </label>
            <select
              value={filters.kpi}
              onChange={e => onChange({ ...filters, kpi: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            >
              <option value="">All</option>
              {kpiOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Event Type — multi-select searchable */}
          <MultiSelectDropdown
            label="Event Type"
            options={eventTypeOptions}
            selected={filters.eventTypes}
            onChange={values => onChange({ ...filters, eventTypes: values })}
            placeholder="Search event types..."
          />
        </div>
      )}
    </div>
  );
};

export default InsightsUsageFiltersBar;
