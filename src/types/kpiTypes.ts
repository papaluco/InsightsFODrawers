export const KPI_SHORT_NAMES = [
  'MPLH',
  'PNA',
  'ENP',
  'Waste',
  'Breakfast',
  'Lunch',
  'Supper',
  'Snack',
  'MEQs',
  'Meals',
  'Eco Dis',
  'Revenue',
  'Inventory Value',
  'Inventory Turnover Rate',
  'Physical Inventory Discrepancy',
] as const;

export type KPIKey = typeof KPI_SHORT_NAMES[number];

export const KPI_LONG_NAMES = [
  'Meals per Labor Hour (MPLH)',
  'Paid Not Applied (PNA)',
  'Eligible Not Participating (ENP)',
  'Waste',
  'Breakfast',
  'Lunch',
  'Supper',
  'Snack',
  'Meal Equivalents (MEQs)',
  'Meals',
  'Economically Disadvantaged',
  'Revenue',
  'Inventory Value',
  'Inventory Turnover Rate',
  'Physical Inventory Discrepancy',
] as const;

export const KPI_SHORT_TO_LONG: Record<string, string> = Object.fromEntries(
  KPI_SHORT_NAMES.map((k, i) => [k, KPI_LONG_NAMES[i]])
);

export const KPI_LONG_TO_SHORT: Record<string, string> = Object.fromEntries(
  KPI_LONG_NAMES.map((l, i) => [l, KPI_SHORT_NAMES[i]])
);

// value = short name (matches event context), label = long name (shown in UI)
export const KPI_SELECT_OPTIONS = KPI_SHORT_NAMES.map((k, i) => ({
  value: k,
  label: KPI_LONG_NAMES[i],
}));

// Colors for all 15 KPIs
export const KPI_CHART_COLORS: Record<string, string> = {
  MPLH:                           '#6366f1',
  PNA:                            '#10b981',
  ENP:                            '#f59e0b',
  Waste:                          '#ef4444',
  Breakfast:                      '#f97316',
  Lunch:                          '#84cc16',
  Supper:                         '#06b6d4',
  Snack:                          '#8b5cf6',
  MEQs:                           '#ec4899',
  Meals:                          '#14b8a6',
  'Eco Dis':                      '#64748b',
  Revenue:                        '#22c55e',
  'Inventory Value':              '#a855f7',
  'Inventory Turnover Rate':      '#f43f5e',
  'Physical Inventory Discrepancy': '#0ea5e9',
};
