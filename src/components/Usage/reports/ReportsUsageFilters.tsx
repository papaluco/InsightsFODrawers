import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ReportUsageEvent } from '../../../types/reportUsageTypes';
import { DEFAULT_REPORT_FILTERS } from '../../../types/reportUsageTypes';
import type { ReportUsageFilters } from '../../../types/reportUsageTypes';
import { getUsageEventFriendlyName } from '../../../constants/usageEventTypes';
import { REPORT_MODULES, getDataSourceOptions } from '../../../constants/reportDataSources';

interface Props {
  filters: ReportUsageFilters;
  onChange: (f: ReportUsageFilters) => void;
  allEvents: ReportUsageEvent[];
}

const uniq = <T,>(arr: T[]) => [...new Set(arr)].filter(Boolean).sort() as T[];

const ENTRY_POINT_DISPLAY: Record<string, string> = {
  FullDirectory: 'Full Directory',
  Starred: 'Starred',
  Recent: 'Recent',
};

const Select: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
    >
      <option value="">All</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const SC_REPORT_TYPES = ['Insights', 'MVR', 'Custom', 'PowerBI', 'Download'];
const PE_REPORT_TYPES = ['Distributed'];

const MODULE_OPTIONS = REPORT_MODULES.map(m => ({ value: m, label: m }));

const ReportsUsageFilters: React.FC<Props> = ({ filters, onChange, allEvents }) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = Object.values(filters).filter(v => v !== '').length;
  const set = (key: keyof ReportUsageFilters, val: string) => onChange({ ...filters, [key]: val });
  const clearAll = () => onChange({ ...DEFAULT_REPORT_FILTERS });

  // Platform-aware district options
  const districtOptions = uniq(
    (filters.platform ? allEvents.filter(e => e.platform === filters.platform) : allEvents)
      .map(e => e.districtId)
  );

  // Platform-aware report type options
  const reportTypeOptions: string[] =
    filters.platform === 'PrimeroEdge' ? PE_REPORT_TYPES
      : filters.platform === 'SchoolCafe' ? SC_REPORT_TYPES
        : [...SC_REPORT_TYPES, ...PE_REPORT_TYPES];

  // Data source options — driven by module + report type from constants
  const dataSourceOptions = useMemo(
    () => getDataSourceOptions(filters.module || undefined, filters.reportType || undefined),
    [filters.module, filters.reportType]
  );

  // Report name options — filtered by module and data source
  const reportNameOptions = useMemo(() => {
    let events = allEvents;
    if (filters.module) events = events.filter(e => e.context.module === filters.module);
    if (filters.dataSource) events = events.filter(e => e.context.dataSource === filters.dataSource);
    return uniq(events.map(e => e.context.reportName));
  }, [allEvents, filters.module, filters.dataSource]);

  // Entry point options with friendly display
  const entryPointOptions = uniq(allEvents.map(e => e.context.entryPoint));

  // Event type options with friendly names
  const eventTypeRaw = uniq(allEvents.map(e => e.eventType));

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
              <X size={11} />
              Clear all
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Date range */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
            <input type="date" value={filters.startDate} onChange={e => set('startDate', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
            <input type="date" value={filters.endDate} onChange={e => set('endDate', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none" />
          </div>

          {/* Platform — drives district + report type */}
          <Select
            label="Platform"
            value={filters.platform}
            onChange={v => onChange({ ...filters, platform: v, district: '', reportType: '', dataSource: '', reportName: '' })}
            options={[{ value: 'SchoolCafe', label: 'SchoolCafe' }, { value: 'PrimeroEdge', label: 'PrimeroEdge' }]}
          />

          {/* District — filtered by platform */}
          <Select
            label="District"
            value={filters.district}
            onChange={v => set('district', v)}
            options={districtOptions.map(id => ({
              value: id,
              label: allEvents.find(e => e.districtId === id)?.districtId ?? id,
            }))}
          />

          {/* Report type — filtered by platform; clears data source + report name */}
          <Select
            label="Report Type"
            value={filters.reportType}
            onChange={v => onChange({ ...filters, reportType: v, dataSource: '', reportName: '' })}
            options={reportTypeOptions.map(t => ({ value: t, label: t }))}
          />

          {/* Module — from canonical list; clears data source + report name */}
          <Select
            label="Module"
            value={filters.module}
            onChange={v => onChange({ ...filters, module: v, dataSource: '', reportName: '' })}
            options={MODULE_OPTIONS}
          />

          {/* Data Source — driven by module + report type from constants */}
          <Select
            label="Data Source"
            value={filters.dataSource}
            onChange={v => onChange({ ...filters, dataSource: v, reportName: '' })}
            options={dataSourceOptions.map(ds => ({ value: ds.key, label: ds.label }))}
          />

          {/* Report Name — filtered by module + data source */}
          <Select
            label="Report Name"
            value={filters.reportName}
            onChange={v => set('reportName', v)}
            options={reportNameOptions.map(n => ({ value: n, label: n }))}
          />

          {/* Entry Point — with friendly display */}
          <Select
            label="Entry Point"
            value={filters.entryPoint}
            onChange={v => set('entryPoint', v)}
            options={entryPointOptions.map(ep => ({ value: ep, label: ENTRY_POINT_DISPLAY[ep] ?? ep }))}
          />

          {/* Event Type — with friendly names */}
          <Select
            label="Event Type"
            value={filters.eventType}
            onChange={v => set('eventType', v)}
            options={eventTypeRaw.map(et => ({ value: et, label: getUsageEventFriendlyName(et) }))}
          />
        </div>
      )}
    </div>
  );
};

export default ReportsUsageFilters;
