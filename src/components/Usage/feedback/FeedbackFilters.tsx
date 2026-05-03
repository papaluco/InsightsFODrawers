import React, { useId, useState } from 'react';
import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';
import { DashboardFilters, DEFAULT_FILTERS, SOURCE_DISPLAY, getPromptName } from './feedbackHelpers';

interface Props {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  allData: FeedbackRecord[];
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
      {label}: {value}
    </span>
  );
}

function hasActiveFilters(f: DashboardFilters): boolean {
  return !!(f.promptType || f.promptName || f.startDate || f.endDate || f.platform || f.district);
}

const FeedbackFilters: React.FC<Props> = ({ filters, onChange, allData }) => {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const set = (key: keyof DashboardFilters, value: string) =>
    onChange({ ...filters, [key]: value, ...(key === 'promptType' ? { promptName: '' } : {}) });

  const promptTypes = [...new Set(allData.map(r => r.sourceEntryPoint))].sort();
  const promptNames = [...new Set(
    allData
      .filter(r => !filters.promptType || r.sourceEntryPoint === filters.promptType)
      .map(r => getPromptName(r))
  )].sort();
  const platforms = [...new Set(allData.map(r => r.platform))].sort();

  const districtMap = new Map<string, string>();
  allData.forEach(r => {
    if (!districtMap.has(r.districtId)) {
      districtMap.set(r.districtId, (r.contextJson?.districtName as string) ?? r.districtId);
    }
  });
  const districts = [...districtMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));

  const chips: { label: string; value: string }[] = [];
  if (filters.promptType) chips.push({ label: 'Type', value: SOURCE_DISPLAY[filters.promptType] ?? filters.promptType });
  if (filters.promptName) chips.push({ label: 'Prompt', value: filters.promptName });
  if (filters.platform) chips.push({ label: 'Platform', value: filters.platform });
  if (filters.district) chips.push({ label: 'District', value: districtMap.get(filters.district) ?? filters.district });
  if (filters.startDate) chips.push({ label: 'From', value: filters.startDate });
  if (filters.endDate) chips.push({ label: 'To', value: filters.endDate });

  const active = hasActiveFilters(filters);
  const sel = 'w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none';

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
      <div className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 rounded-xl">
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-expanded={expanded}
          aria-controls={panelId}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {chips.map((chip, i) => (
              <FilterChip key={i} label={chip.label} value={chip.value} />
            ))}
          </div>
        </button>

        <div className="ml-4 flex shrink-0 items-center gap-3">
          {active && (
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_FILTERS })}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none"
            >
              Clear filters
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
            aria-expanded={expanded}
            aria-controls={panelId}
          >
            <ChevronIcon expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div id={panelId} className="border-t border-gray-100 px-5 py-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Prompt Type</label>
              <select value={filters.promptType} onChange={e => set('promptType', e.target.value)} className={sel}>
                <option value="">All</option>
                {promptTypes.map(t => <option key={t} value={t}>{SOURCE_DISPLAY[t] ?? t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Prompt Name</label>
              <select value={filters.promptName} onChange={e => set('promptName', e.target.value)} className={sel}>
                <option value="">All</option>
                {promptNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Platform</label>
              <select value={filters.platform} onChange={e => set('platform', e.target.value)} className={sel}>
                <option value="">All</option>
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">District</label>
              <select value={filters.district} onChange={e => set('district', e.target.value)} className={sel}>
                <option value="">All</option>
                {districts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Start Date</label>
              <input type="date" value={filters.startDate} onChange={e => set('startDate', e.target.value)} className={sel} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">End Date</label>
              <input type="date" value={filters.endDate} onChange={e => set('endDate', e.target.value)} className={sel} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeedbackFilters;
