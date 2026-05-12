import { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { ErrorTelemetryEvent } from '../../../telemetry/types';
import type { ErrorFilters } from '../../../services/errorsService';
import { DEFAULT_ERROR_FILTERS } from '../../../services/errorsService';
import { MultiSelectDropdown } from '../../Common/MultiSelectDropdown';
import { CAT_LABEL } from './errorHelpers';

const SEV_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
];

interface Props {
  filters: ErrorFilters;
  onChange: (f: ErrorFilters) => void;
  allEvents: ErrorTelemetryEvent[];
}

const ErrorFiltersBar: React.FC<Props> = ({ filters, onChange, allEvents }) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = [
    filters.startDate !== '',
    filters.endDate !== '',
    filters.severities.length > 0,
    filters.categories.length > 0,
    filters.modules.length > 0,
    filters.components.length > 0,
    filters.isUserBlocking !== '',
    filters.sessionSearch !== '',
  ].filter(Boolean).length;

  const clearAll = () => onChange({ ...DEFAULT_ERROR_FILTERS });

  const categoryOptions = useMemo(() =>
    [...new Set(allEvents.map(e => e.errorCategory))].sort()
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-rose-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-rose-600 font-semibold hover:underline"
            >
              <X size={11} /> Clear all
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
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onChange({ ...filters, endDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
          </div>

          <MultiSelectDropdown
            label="Severity"
            options={SEV_OPTIONS}
            selected={filters.severities}
            onChange={values => onChange({ ...filters, severities: values as ErrorFilters['severities'] })}
            placeholder="All severities"
          />

          <MultiSelectDropdown
            label="Category"
            options={categoryOptions}
            selected={filters.categories}
            onChange={values => onChange({ ...filters, categories: values as ErrorFilters['categories'] })}
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

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blocking</label>
            <select
              value={filters.isUserBlocking}
              onChange={e => onChange({ ...filters, isUserBlocking: e.target.value as ErrorFilters['isUserBlocking'] })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            >
              <option value="">All</option>
              <option value="true">Blocking</option>
              <option value="false">Non-blocking</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session</label>
            <input
              type="text"
              value={filters.sessionSearch}
              onChange={e => onChange({ ...filters, sessionSearch: e.target.value })}
              placeholder="Search session..."
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorFiltersBar;
