import React, { useMemo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { MultiSelectDropdown, SelectOption } from '../../../components/Common/MultiSelectDropdown';
import { COMPARISON_KPI_KEYS, KPI_DEFINITIONS } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import { useComparisonStore } from '../store/useComparisonStore';

const KPI_OPTIONS: SelectOption[] = KPI_DEFINITIONS.map(d => ({ value: d.key, label: d.name }));
const KPI_KEY_SET = new Set<string>(COMPARISON_KPI_KEYS);
const isKpiKey = (value: string): value is ComparisonKpiKey => KPI_KEY_SET.has(value);

/**
 * Filters (NXT-77202 §6): KPI multi-select (default all 17), Needs Attention toggle, and Clear
 * Filters, which resets these two filters only — never the sides. Compact, for the KPI Comparison
 * title row. They set the comparison scope, so the KPI table, Summary, Site Drivers, exports and
 * the Schoolie payload all follow them.
 */
export const ComparisonFilters: React.FC = () => {
  const kpiFilter = useComparisonStore(s => s.kpiFilter);
  const needsAttentionOnly = useComparisonStore(s => s.needsAttentionOnly);
  const setKpiFilter = useComparisonStore(s => s.setKpiFilter);
  const setNeedsAttentionOnly = useComparisonStore(s => s.setNeedsAttentionOnly);
  const resetFilters = useComparisonStore(s => s.resetFilters);

  const selectedKpis = useMemo(() => [...kpiFilter], [kpiFilter]);
  const filtersAreDefault = kpiFilter.length === COMPARISON_KPI_KEYS.length && !needsAttentionOnly;

  return (
    <div role="group" aria-label="KPI filters" className="flex flex-wrap items-center gap-2">
      <div className="w-44">
        <MultiSelectDropdown
          label="KPIs"
          hideLabel
          options={KPI_OPTIONS}
          selected={selectedKpis}
          onChange={values => setKpiFilter(values.filter(isKpiKey))}
          placeholder="Search KPIs..."
          allSelectedLabel="All KPIs"
          emptyLabel="No KPIs selected"
          maxListHeight={280}
        />
      </div>

      {/* Same pill toggle as MPLHSchoolTable, using the insights unfavorable token (spec §12) */}
      <button
        type="button"
        aria-pressed={needsAttentionOnly}
        onClick={() => setNeedsAttentionOnly(!needsAttentionOnly)}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wide uppercase transition-all duration-200 ${
          needsAttentionOnly
            ? 'bg-insightsUnfavorable border-insightsUnfavorable text-white shadow-md'
            : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Needs Attention
      </button>

      <button
        type="button"
        onClick={resetFilters}
        disabled={filtersAreDefault}
        className="inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Clear Filters
      </button>
    </div>
  );
};
