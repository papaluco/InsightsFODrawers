import { create } from 'zustand';
import { COMPARISON_KPI_KEYS } from '../../../constants/kpiDefinitions';
import type { SiteSelection } from '../../../data/siteRegistry';
import type { TimeframeSelection } from '../../../services/comparisonDataService';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { TrendInterval } from '../trend/trendRules';

/**
 * Performance Comparison state (NXT-77202, spec §6). One store holds both side
 * definitions, the filters, the focused KPI, the trend interval, and which page
 * sections are collapsed. Derived data
 * (datasets and engine results) is never stored here; it comes from
 * useComparison / useComparisonResults so every component reads the same results.
 *
 * Kept in memory only (no persist): sides survive closing and reopening the overlay,
 * and a page reload starts both sides empty (spec §3 "Default comparison: None").
 */

export type ComparisonSideKey = 'left' | 'right';

/** A side's definition: Site Scope + Timeframe (spec §2). null = not chosen yet. */
export interface ComparisonSideDefinition {
  sites: SiteSelection | null;
  timeframe: TimeframeSelection | null;
}

/** Collapsible page sections, in page order (NXT-77202 §6 layout order). */
export const COMPARISON_SECTION_IDS = ['setup', 'summary', 'kpiTable', 'trend'] as const;
export type ComparisonSectionId = (typeof COMPARISON_SECTION_IDS)[number];

/** Every section starts expanded. */
const ALL_SECTIONS_EXPANDED: Record<ComparisonSectionId, boolean> = {
  setup: true,
  summary: true,
  kpiTable: true,
  trend: true,
};

export const EMPTY_SIDE: ComparisonSideDefinition = { sites: null, timeframe: null };

/** A side is set once it has a site scope and a timeframe; nothing is calculated before both sides are set. */
export function isSideComplete(side: ComparisonSideDefinition): boolean {
  return side.sites !== null && side.sites.length > 0 && side.timeframe !== null;
}

interface ComparisonState {
  left: ComparisonSideDefinition;
  right: ComparisonSideDefinition;
  /** KPI filter; defaults to all 17 KPIs, in spec §4 order. */
  kpiFilter: ComparisonKpiKey[];
  needsAttentionOnly: boolean;
  /** KPI chosen in the KPI Comparison table. Separate from the KPI filter and never changes it. */
  focusedKpi: ComparisonKpiKey | null;
  /** Trend interval chosen by the user; null = use the default interval (spec §3). */
  trendInterval: TrendInterval | null;
  /** Expanded/collapsed state per page section. */
  expandedSections: Record<ComparisonSectionId, boolean>;

  /** Sets a side's sites. A left-side choice also fills the right side's sites while they're still empty. */
  setSideSites: (side: ComparisonSideKey, sites: SiteSelection) => void;
  /** Sets a side's timeframe. A left-side choice also fills the right side's timeframe while it's still empty. */
  setSideTimeframe: (side: ComparisonSideKey, timeframe: TimeframeSelection) => void;
  /** Exchanges the complete side definitions. No-op until both sides are set (spec §6 Swap). */
  swapSides: () => void;
  /** Clears the focused KPI if the new filter removes it (spec §6 Focused KPI). */
  setKpiFilter: (kpis: readonly ComparisonKpiKey[]) => void;
  setNeedsAttentionOnly: (needsAttentionOnly: boolean) => void;
  /** Clear Filters/Reset: KPI filter and Needs Attention only, never the sides (spec §6). */
  resetFilters: () => void;
  setFocusedKpi: (kpi: ComparisonKpiKey | null) => void;
  setTrendInterval: (interval: TrendInterval | null) => void;
  toggleSection: (section: ComparisonSectionId) => void;
  /** Back to the initial empty comparison. */
  resetComparison: () => void;
}

const DEFAULT_FILTERS = {
  kpiFilter: [...COMPARISON_KPI_KEYS],
  needsAttentionOnly: false,
};

const INITIAL_STATE = {
  left: EMPTY_SIDE,
  right: EMPTY_SIDE,
  ...DEFAULT_FILTERS,
  focusedKpi: null,
  trendInterval: null,
  expandedSections: ALL_SECTIONS_EXPANDED,
};

export const useComparisonStore = create<ComparisonState>()(set => ({
  ...INITIAL_STATE,

  setSideSites: (side, sites) =>
    set(state => {
      const value = sites.length > 0 ? [...sites] : null;
      return {
        [side]: { ...state[side], sites: value },
        // Auto-fill: copy left → right per field, only into an empty right field; never right → left.
        ...(side === 'left' && value !== null && state.right.sites === null ? { right: { ...state.right, sites: [...value] } } : {}),
      };
    }),

  setSideTimeframe: (side, timeframe) =>
    set(state => ({
      [side]: { ...state[side], timeframe },
      // Auto-fill, as for sites.
      ...(side === 'left' && state.right.timeframe === null ? { right: { ...state.right, timeframe } } : {}),
    })),

  swapSides: () =>
    set(state =>
      isSideComplete(state.left) && isSideComplete(state.right) ? { left: state.right, right: state.left } : {},
    ),

  setKpiFilter: kpis =>
    set(state => {
      const selected = new Set(kpis);
      return {
        // Keep spec §4 order regardless of click order.
        kpiFilter: COMPARISON_KPI_KEYS.filter(kpi => selected.has(kpi)),
        focusedKpi: state.focusedKpi && selected.has(state.focusedKpi) ? state.focusedKpi : null,
      };
    }),

  setNeedsAttentionOnly: needsAttentionOnly => set({ needsAttentionOnly }),

  resetFilters: () => set({ kpiFilter: [...DEFAULT_FILTERS.kpiFilter], needsAttentionOnly: DEFAULT_FILTERS.needsAttentionOnly }),

  setFocusedKpi: focusedKpi => set({ focusedKpi }),

  setTrendInterval: trendInterval => set({ trendInterval }),

  toggleSection: section =>
    set(state => ({ expandedSections: { ...state.expandedSections, [section]: !state.expandedSections[section] } })),

  resetComparison: () => set({ ...INITIAL_STATE, kpiFilter: [...DEFAULT_FILTERS.kpiFilter] }),
}));
