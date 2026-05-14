import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
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

  const analysisOptions = useMemo(() => {
    return [...new Set(mockSchoolieUsageEvents.map(e => e.analysisIdentifier))].sort();
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
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</label>
            <select
              value={filters.districtId ?? ''}
              onChange={e => onChange({ ...filters, districtId: e.target.value || undefined, userId: undefined })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            >
              <option value="">All Districts</option>
              {districtOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</label>
            <select
              value={filters.userId ?? ''}
              onChange={e => onChange({ ...filters, userId: e.target.value || undefined })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            >
              <option value="">All Users</option>
              {userOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source Surface</label>
            <select
              value={filters.sourceEntryPoint ?? ''}
              onChange={e => onChange({ ...filters, sourceEntryPoint: (e.target.value || undefined) as SchoolieSourceEntryPoint | undefined })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            >
              <option value="">All Surfaces</option>
              <option value="KpiDrawer">KPI Drawer</option>
              <option value="Dashboard">Dashboard</option>
              <option value="UsageScreen">Usage Screen</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analysis</label>
            <select
              value={filters.analysisIdentifier ?? ''}
              onChange={e => onChange({ ...filters, analysisIdentifier: (e.target.value || undefined) as SchoolieAnalysisIdentifier | undefined })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            >
              <option value="">All Analyses</option>
              {analysisOptions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event Type</label>
            <select
              value={filters.eventType ?? ''}
              onChange={e => onChange({ ...filters, eventType: (e.target.value || undefined) as SchoolieEventType | undefined })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            >
              <option value="">All Events</option>
              <option value="KPI_SCHOOLIE_OPENED">KPI Schoolie Opened</option>
              <option value="DASHBOARD_SCHOOLIE_OPENED">Dashboard Schoolie Opened</option>
              <option value="AI_REQUEST_STARTED">AI Request Started</option>
              <option value="AI_RESPONSE_SUCCESS">AI Response Success</option>
              <option value="AI_RESPONSE_ERROR">AI Response Error</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolieUsageFiltersBar;
