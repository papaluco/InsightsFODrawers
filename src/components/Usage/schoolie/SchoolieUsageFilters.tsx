import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { MultiSelectDropdown, SelectOption } from '../../Common/MultiSelectDropdown';
import {
  SchoolieUsageFilters,
  DEFAULT_SCHOOLIE_FILTERS,
  SchoolieSourceEntryPoint,
  SchoolieAnalysisIdentifier,
  SchoolieEventType,
} from '../../../types/schoolieUsageTypes';
import {
  mockSchoolieUsageEvents,
  SCHOOLIE_USER_NAMES,
  SCHOOLIE_DISTRICT_NAMES,
} from '../../../data/mockSchoolieUsageData';

interface Props {
  filters: SchoolieUsageFilters;
  onChange: (f: SchoolieUsageFilters) => void;
}

const SchoolieUsageFiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = [
    filters.dateRange?.start,
    filters.dateRange?.end,
    filters.districtId,
    filters.userId,
    filters.sourceEntryPoint,
    filters.analysisIdentifier,
    filters.eventType,
  ].filter(Boolean).length;

  const clearAll = () => onChange({ ...DEFAULT_SCHOOLIE_FILTERS });

  const districtOptions = useMemo(() => {
    const ids = [...new Set(mockSchoolieUsageEvents.map(e => e.districtId))].sort();
    return ids.map(id => ({ value: id, label: SCHOOLIE_DISTRICT_NAMES[id] ?? id }));
  }, []);

  const userOptions = useMemo(() => {
    const src = filters.districtId
      ? mockSchoolieUsageEvents.filter(e => e.districtId === filters.districtId)
      : mockSchoolieUsageEvents;
    const ids = [...new Set(src.map(e => e.userId))].sort();
    return ids.map(id => ({ value: id, label: SCHOOLIE_USER_NAMES[id] ?? id }));
  }, [filters.districtId]);

  const analysisOptions = useMemo((): SelectOption[] => {
    return [...new Set(mockSchoolieUsageEvents.map(e => e.analysisIdentifier))].sort()
      .map(a => ({ value: a, label: a }));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-violet-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-violet-600 font-semibold hover:underline"
            >
              <X size={11} />
              Clear all
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
            <input
              type="date"
              value={filters.dateRange?.start ?? ''}
              onChange={e => onChange({ ...filters, dateRange: { start: e.target.value, end: filters.dateRange?.end ?? '' } })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={filters.dateRange?.end ?? ''}
              onChange={e => onChange({ ...filters, dateRange: { start: filters.dateRange?.start ?? '', end: e.target.value } })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <MultiSelectDropdown
              label="District"
              options={districtOptions}
              selected={filters.districtId ? [filters.districtId] : []}
              onChange={values => onChange({ ...filters, districtId: values[0] ?? undefined, userId: undefined })}
              placeholder="Search districts..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <MultiSelectDropdown
              label="User"
              options={userOptions}
              selected={filters.userId ? [filters.userId] : []}
              onChange={values => onChange({ ...filters, userId: values[0] ?? undefined })}
              placeholder="Search users..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <MultiSelectDropdown
              label="Source Surface"
              options={[
                { value: 'KpiDrawer', label: 'KPI Drawer' },
                { value: 'Dashboard', label: 'Dashboard' },
                { value: 'UsageScreen', label: 'Usage Screen' },
              ]}
              selected={filters.sourceEntryPoint ? [filters.sourceEntryPoint] : []}
              onChange={values => onChange({ ...filters, sourceEntryPoint: (values[0] ?? undefined) as SchoolieSourceEntryPoint | undefined })}
              placeholder="Search surfaces..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <MultiSelectDropdown
              label="Analysis"
              options={analysisOptions}
              selected={filters.analysisIdentifier ? [filters.analysisIdentifier] : []}
              onChange={values => onChange({ ...filters, analysisIdentifier: (values[0] ?? undefined) as SchoolieAnalysisIdentifier | undefined })}
              placeholder="Search analyses..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <MultiSelectDropdown
              label="Event Type"
              options={[
                { value: 'KPI_SCHOOLIE_OPENED', label: 'KPI Schoolie Opened' },
                { value: 'DASHBOARD_SCHOOLIE_OPENED', label: 'Dashboard Schoolie Opened' },
                { value: 'AI_REQUEST_STARTED', label: 'AI Request Started' },
                { value: 'AI_RESPONSE_SUCCESS', label: 'AI Response Success' },
                { value: 'AI_RESPONSE_ERROR', label: 'AI Response Error' },
              ]}
              selected={filters.eventType ? [filters.eventType] : []}
              onChange={values => onChange({ ...filters, eventType: (values[0] ?? undefined) as SchoolieEventType | undefined })}
              placeholder="Search event types..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolieUsageFiltersBar;
