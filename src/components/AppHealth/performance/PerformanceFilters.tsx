import { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { PerformanceTelemetryEvent } from '../../../telemetry/types';
import type { PerfFilters } from '../../../services/performanceService';
import { DEFAULT_PERF_FILTERS } from '../../../services/performanceService';
import { MultiSelectDropdown } from '../../Common/MultiSelectDropdown';
import { CAT_LABEL } from './perfHelpers';

interface Props {
  filters: PerfFilters;
  onChange: (f: PerfFilters) => void;
  allEvents: PerformanceTelemetryEvent[];
}

const PerformanceFiltersBar: React.FC<Props> = ({ filters, onChange, allEvents }) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = [
    filters.startDate !== '',
    filters.endDate !== '',
    filters.categories.length > 0,
    filters.modules.length > 0,
    filters.components.length > 0,
    filters.users.length > 0,
    filters.districts.length > 0,
    filters.isSlow !== '',
    filters.isSuccess !== '',
    filters.eventSearch !== '',
  ].filter(Boolean).length;

  const clearAll = () => onChange({ ...DEFAULT_PERF_FILTERS });

  const catOptions = useMemo(() =>
    [...new Set(allEvents.map(e => e.performanceCategory))].sort()
      .map(v => ({ value: v, label: CAT_LABEL[v] ?? v })),
    [allEvents],
  );

  const moduleOptions = useMemo(() =>
    [...new Set(allEvents.map(e => e.module))].sort()
      .map(v => ({ value: v, label: v.replace(/_/g, ' ') })),
    [allEvents],
  );

  const componentOptions = useMemo(() =>
    [...new Set(allEvents.map(e => e.component).filter((c): c is string => c != null))].sort()
      .map(v => ({ value: v, label: v })),
    [allEvents],
  );

  const userOptions = useMemo(() =>
    [...new Set(allEvents.map(e => e.userId).filter((u): u is string => u != null))].sort()
      .map(v => ({ value: v, label: v })),
    [allEvents],
  );

  const districtOptions = useMemo(() =>
    [...new Set(allEvents.map(e => e.districtId).filter((d): d is string => d != null))].sort()
      .map(v => ({ value: v, label: v })),
    [allEvents],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-amber-600 font-semibold hover:underline"
            >
              <X size={11} /> Clear all
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => onChange({ ...filters, startDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onChange({ ...filters, endDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            />
          </div>

          <MultiSelectDropdown
            label="Category"
            options={catOptions}
            selected={filters.categories}
            onChange={values => onChange({ ...filters, categories: values as PerfFilters['categories'] })}
            placeholder="All categories"
          />

          <MultiSelectDropdown
            label="Module"
            options={moduleOptions}
            selected={filters.modules}
            onChange={values => onChange({ ...filters, modules: values })}
            placeholder="All modules"
          />

          <MultiSelectDropdown
            label="Component"
            options={componentOptions}
            selected={filters.components}
            onChange={values => onChange({ ...filters, components: values })}
            placeholder="All components"
          />

          <MultiSelectDropdown
            label="User"
            options={userOptions}
            selected={filters.users}
            onChange={values => onChange({ ...filters, users: values })}
            placeholder="All users"
          />

          <MultiSelectDropdown
            label="District"
            options={districtOptions}
            selected={filters.districts}
            onChange={values => onChange({ ...filters, districts: values })}
            placeholder="All districts"
          />

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speed</label>
            <select
              value={filters.isSlow}
              onChange={e => onChange({ ...filters, isSlow: e.target.value as PerfFilters['isSlow'] })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            >
              <option value="">All</option>
              <option value="true">Slow only</option>
              <option value="false">Fast only</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
            <select
              value={filters.isSuccess}
              onChange={e => onChange({ ...filters, isSuccess: e.target.value as PerfFilters['isSuccess'] })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            >
              <option value="">All</option>
              <option value="true">Success</option>
              <option value="false">Failed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event Name</label>
            <input
              type="text"
              value={filters.eventSearch}
              onChange={e => onChange({ ...filters, eventSearch: e.target.value })}
              placeholder="Search events..."
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceFiltersBar;
