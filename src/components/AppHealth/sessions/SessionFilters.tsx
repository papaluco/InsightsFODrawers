import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { SessionHealth } from '../../../telemetry/types';
import type { SessionFilters } from '../../../services/sessionsService';
import { DEFAULT_SESSION_FILTERS } from '../../../services/sessionsService';
import { MultiSelectDropdown } from '../../Common/MultiSelectDropdown';

const HEALTH_OPTIONS: { value: SessionHealth; label: string }[] = [
  { value: 'healthy',   label: 'Healthy' },
  { value: 'slow',      label: 'Slow' },
  { value: 'degraded',  label: 'Degraded' },
  { value: 'failed',    label: 'Failed' },
];

interface Props {
  filters: SessionFilters;
  onChange: (f: SessionFilters) => void;
}

const SessionFiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = [
    filters.startDate !== '',
    filters.endDate !== '',
    filters.health.length > 0,
    filters.districtSearch !== '',
    filters.sessionSearch !== '',
  ].filter(Boolean).length;

  const clearAll = () => onChange({ ...DEFAULT_SESSION_FILTERS });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-blue-600 font-semibold hover:underline"
            >
              <X size={11} /> Clear all
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => onChange({ ...filters, startDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onChange({ ...filters, endDate: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
          </div>

          <MultiSelectDropdown
            label="Health"
            options={HEALTH_OPTIONS}
            selected={filters.health}
            onChange={values => onChange({ ...filters, health: values as SessionHealth[] })}
            placeholder="All health states"
          />

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</label>
            <input
              type="text"
              value={filters.districtSearch}
              onChange={e => onChange({ ...filters, districtSearch: e.target.value })}
              placeholder="Search district..."
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session ID</label>
            <input
              type="text"
              value={filters.sessionSearch}
              onChange={e => onChange({ ...filters, sessionSearch: e.target.value })}
              placeholder="Search session..."
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionFiltersBar;
