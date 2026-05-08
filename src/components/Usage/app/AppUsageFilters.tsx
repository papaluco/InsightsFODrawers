import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { AppUsageEvent, AppUsageFilters, DEFAULT_APP_FILTERS, APP_EVENT_FRIENDLY } from '../../../types/appUsageTypes';
import { MultiSelectDropdown, SelectOption } from '../../Common/MultiSelectDropdown';
import { APP_USER_NAMES, APP_DISTRICT_NAMES } from '../../../data/mockAppUsageData';

interface Props {
  filters: AppUsageFilters;
  onChange: (f: AppUsageFilters) => void;
  allEvents: AppUsageEvent[];
}

const AppUsageFiltersBar: React.FC<Props> = ({ filters, onChange, allEvents }) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = [
    filters.startDate !== '',
    filters.endDate !== '',
    filters.platform !== '',
    filters.districts.length > 0,
    filters.userIds.length > 0,
    filters.eventTypes.length > 0,
  ].filter(Boolean).length;

  const clearAll = () => onChange({ ...DEFAULT_APP_FILTERS });

  const districtOptions = useMemo((): SelectOption[] => {
    const src = filters.platform ? allEvents.filter(e => e.platform === filters.platform) : allEvents;
    const ids = [...new Set(src.map(e => e.districtId))].sort();
    return ids.map(id => ({ value: id, label: APP_DISTRICT_NAMES[id] ?? id }));
  }, [allEvents, filters.platform]);

  const userOptions = useMemo((): SelectOption[] => {
    let src = allEvents;
    if (filters.platform) src = src.filter(e => e.platform === filters.platform);
    if (filters.districts.length) src = src.filter(e => filters.districts.includes(e.districtId));
    const ids = [...new Set(src.map(e => e.userId))].sort();
    return ids.map(id => ({ value: id, label: APP_USER_NAMES[id] ?? id }));
  }, [allEvents, filters.platform, filters.districts]);

  const eventTypeOptions = useMemo((): SelectOption[] => {
    const types = [...new Set(allEvents.map(e => e.eventType))].sort();
    return types.map(t => ({ value: t, label: APP_EVENT_FRIENDLY[t as keyof typeof APP_EVENT_FRIENDLY] ?? t }));
  }, [allEvents]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-teal-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-teal-600 font-semibold hover:underline"
            >
              <X size={11} />
              Clear all
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => onChange({ ...filters, startDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onChange({ ...filters, endDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</label>
            <select
              value={filters.platform}
              onChange={e => onChange({ ...filters, platform: e.target.value, districts: [], userIds: [] })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            >
              <option value="">All</option>
              <option value="SchoolCafe">SchoolCafe</option>
              <option value="PrimeroEdge">PrimeroEdge</option>
            </select>
          </div>

          <MultiSelectDropdown
            label="District"
            options={districtOptions}
            selected={filters.districts}
            onChange={values => onChange({ ...filters, districts: values, userIds: [] })}
            placeholder="Search districts..."
          />

          {/* <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</label>
            <select
              value={filters.userId}
              onChange={e => onChange({ ...filters, userId: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            >
              <option value="">All</option>
              {userOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div> */}

          <MultiSelectDropdown
            label="User"
            options={userOptions}
            selected={filters.userIds}
            onChange={values => onChange({ ...filters, userIds: values })}
            placeholder="Search users..."
          />

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

export default AppUsageFiltersBar;
