import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  MenuUsageEvent, MenuUsageFilters, DEFAULT_MENU_FILTERS,
  MENU_EVENT_FRIENDLY, MENU_METRICS,
} from '../../../types/menuUsageTypes';
import { MultiSelectDropdown, SelectOption } from '../../Common/MultiSelectDropdown';
import { MENU_USER_NAMES, MENU_DISTRICT_NAMES } from '../../../data/mockMenuUsageData';

interface Props {
  filters: MenuUsageFilters;
  onChange: (f: MenuUsageFilters) => void;
  allEvents: MenuUsageEvent[];
}

const MenuUsageFiltersBar: React.FC<Props> = ({ filters, onChange, allEvents }) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = [
    filters.startDate !== '',
    filters.endDate !== '',
    filters.platform !== '',
    filters.districts.length > 0,
    filters.userIds.length > 0,
    filters.eventTypes.length > 0,
    filters.drawerTypes.length > 0,
    filters.metrics.length > 0,
  ].filter(Boolean).length;

  const clearAll = () => onChange({ ...DEFAULT_MENU_FILTERS });

  const districtOptions = useMemo((): SelectOption[] => {
    const src = filters.platform ? allEvents.filter(e => e.platform === filters.platform) : allEvents;
    const ids = [...new Set(src.map(e => e.districtId))].sort();
    return ids.map(id => ({ value: id, label: MENU_DISTRICT_NAMES[id] ?? id }));
  }, [allEvents, filters.platform]);

  const userOptions = useMemo((): SelectOption[] => {
    let src = allEvents;
    if (filters.platform) src = src.filter(e => e.platform === filters.platform);
    if (filters.districts.length) src = src.filter(e => filters.districts.includes(e.districtId));
    const ids = [...new Set(src.map(e => e.userId))].sort();
    return ids.map(id => ({ value: id, label: MENU_USER_NAMES[id] ?? id }));
  }, [allEvents, filters.platform, filters.districts]);

  const eventTypeOptions = useMemo((): SelectOption[] => {
    const types = [...new Set(allEvents.map(e => e.eventType))].sort();
    return types.map(t => ({ value: t, label: MENU_EVENT_FRIENDLY[t as keyof typeof MENU_EVENT_FRIENDLY] ?? t }));
  }, [allEvents]);

  const drawerTypeOptions: SelectOption[] = [
    { value: 'Menu Items', label: 'Menu Items' },
    { value: 'School Performance', label: 'School Performance' },
  ];

  const metricOptions: SelectOption[] = MENU_METRICS.map(m => ({ value: m, label: m }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-orange-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-orange-600 font-semibold hover:underline"
            >
              <X size={11} />
              Clear all
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => onChange({ ...filters, startDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onChange({ ...filters, endDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</label>
            <select
              value={filters.platform}
              onChange={e => onChange({ ...filters, platform: e.target.value, districts: [], userIds: [] })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
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

          <MultiSelectDropdown
            label="Drawer Type"
            options={drawerTypeOptions}
            selected={filters.drawerTypes}
            onChange={values => onChange({ ...filters, drawerTypes: values })}
            placeholder="All drawers..."
          />

          <MultiSelectDropdown
            label="Metric"
            options={metricOptions}
            selected={filters.metrics}
            onChange={values => onChange({ ...filters, metrics: values })}
            placeholder="All metrics..."
          />
        </div>
      )}
    </div>
  );
};

export default MenuUsageFiltersBar;
