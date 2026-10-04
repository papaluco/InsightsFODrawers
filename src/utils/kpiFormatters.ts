import { getKpiDefinition, KpiDisplayFormat } from '../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../types/kpiTypes';

/**
 * Shared KPI value and delta formatters (NXT-77201).
 *
 * - Values are stored as numbers and formatted at render time.
 * - `null` means No Data and never formats as 0 (spec §1).
 * - Negative values use the true minus sign "−" (U+2212), as in the spec's examples.
 * - Percent values are in percent units (60 = 60%); relative changes are fractions (0.02 = 2%).
 */

export const MINUS_SIGN = '−';
export const NO_DATA_TEXT = 'No Data';

export interface NumberFormatOptions {
  /** Max decimal places (default depends on the formatter). */
  decimals?: number;
  /** Drop trailing zeros, e.g. "60%" instead of "60.0%". */
  trimZeros?: boolean;
}

/**
 * Formats a non-negative magnitude with thousands separators.
 * Returns the rounded magnitude too, so callers can avoid "−0" / "+0".
 */
function formatMagnitude(value: number, decimals: number, trimZeros: boolean): { text: string; rounded: number } {
  const rounded = Number(Math.abs(value).toFixed(decimals));
  const text = rounded.toLocaleString('en-US', {
    minimumFractionDigits: trimZeros ? 0 : decimals,
    maximumFractionDigits: decimals,
  });
  return { text, rounded };
}

/** "" for zero after rounding, otherwise "+" or "−" (signs only shown when `signed`). */
function signPrefix(value: number, rounded: number, signed: boolean): string {
  if (rounded === 0) return '';
  if (value < 0) return MINUS_SIGN;
  return signed ? '+' : '';
}

function formatWith(
  value: number,
  { decimals, trimZeros = false }: NumberFormatOptions,
  defaultDecimals: number,
  signed: boolean,
  wrap: (magnitude: string) => string,
): string {
  const { text, rounded } = formatMagnitude(value, decimals ?? defaultDecimals, trimZeros);
  return `${signPrefix(value, rounded, signed)}${wrap(text)}`;
}

// ─── Values ──────────────────────────────────────────────────────────────────

/** "60.0%" (1 dp by default); "60%" with trimZeros. */
export const formatPercent = (value: number, options: NumberFormatOptions = {}): string =>
  formatWith(value, options, 1, false, m => `${m}%`);

/** "$167,224" (whole dollars by default); negatives "−$500". */
export const formatCurrency = (value: number, options: NumberFormatOptions = {}): string =>
  formatWith(value, options, 0, false, m => `$${m}`);

/** "12,500" */
export const formatCount = (value: number, options: NumberFormatOptions = {}): string =>
  formatWith(value, options, 0, false, m => m);

/** MPLH, always 2 dp: "18.40" */
export const formatMplh = (value: number): string => formatWith(value, { decimals: 2 }, 2, false, m => m);

/** "16 days", "1 day", "14.5 days" (up to 1 dp, trailing zeros dropped). */
export function formatDays(value: number, options: NumberFormatOptions = {}): string {
  return formatWith(value, { trimZeros: true, ...options }, 1, false, m => `${m} ${m === '1' ? 'day' : 'days'}`);
}

/** Physical Inventory Discrepancy: % of total inventory value with the $ amount alongside: "2.6% ($4,725)". */
export function formatInventoryDiscrepancy(percentOfValue: number | null, dollars: number | null): string {
  if (percentOfValue === null) return NO_DATA_TEXT;
  const percent = formatPercent(percentOfValue);
  return dollars === null ? percent : `${percent} (${formatCurrency(dollars)})`;
}

// ─── Deltas ──────────────────────────────────────────────────────────────────

/** Percentage-point change: "+4.3 pts", "−0.5 pts", "0.0 pts". */
export const formatPointsDelta = (delta: number, options: NumberFormatOptions = {}): string =>
  formatWith(delta, options, 1, true, m => `${m} pts`);

/** Relative change from a fraction: 0.02 → "+2.0%", −0.063 → "−6.3%". */
export const formatRelativeChange = (relativeChange: number, options: NumberFormatOptions = {}): string =>
  formatWith(relativeChange * 100, options, 1, true, m => `${m}%`);

/** "+$4,000", "−$500", "$0" */
export const formatSignedCurrency = (delta: number, options: NumberFormatOptions = {}): string =>
  formatWith(delta, options, 0, true, m => `$${m}`);

/** "+125", "−1,250" */
export const formatSignedCount = (delta: number, options: NumberFormatOptions = {}): string =>
  formatWith(delta, options, 0, true, m => m);

/** "+0.37", "−0.18" */
export const formatSignedMplh = (delta: number): string => formatWith(delta, { decimals: 2 }, 2, true, m => m);

/** "+2 days", "−1 day" */
export function formatSignedDays(delta: number, options: NumberFormatOptions = {}): string {
  return formatWith(delta, { trimZeros: true, ...options }, 1, true, m => `${m} ${m === '1' ? 'day' : 'days'}`);
}

// ─── By KPI ──────────────────────────────────────────────────────────────────

/** Decimal places each display format shows. formatKpiValue and roundToDisplayPrecision both use it. */
export const DISPLAY_DECIMALS: Record<KpiDisplayFormat, number> = {
  percent: 1,
  percentOfInventoryValue: 1,
  currency: 0,
  count: 0,
  mplh: 2,
  days: 1,
};

/**
 * A KPI value rounded exactly as formatKpiValue displays it (e.g. 59.97% → 60.0).
 * Target status uses this so the status always agrees with what users see (spec §5.6).
 */
export function roundToDisplayPrecision(key: ComparisonKpiKey, value: number): number {
  const { rounded } = formatMagnitude(value, DISPLAY_DECIMALS[getKpiDefinition(key).displayFormat], false);
  return value < 0 ? -rounded : rounded;
}

function formatByDisplayFormat(format: KpiDisplayFormat, value: number): string {
  const decimals = DISPLAY_DECIMALS[format];
  switch (format) {
    case 'percent':
    case 'percentOfInventoryValue':
      return formatPercent(value, { decimals });
    case 'currency':
      return formatCurrency(value, { decimals });
    case 'count':
      return formatCount(value, { decimals });
    case 'mplh':
      return formatMplh(value);
    case 'days':
      return formatDays(value, { decimals });
  }
}

/** A KPI's primary value in its display format. `null` → "No Data" (or `nullText`). */
export function formatKpiValue(key: ComparisonKpiKey, value: number | null, nullText = NO_DATA_TEXT): string {
  if (value === null) return nullText;
  return formatByDisplayFormat(getKpiDefinition(key).displayFormat, value);
}

/** Absolute change (right − left) in the KPI's units: pts for % KPIs, $ for currency, etc. */
export function formatKpiDelta(key: ComparisonKpiKey, delta: number): string {
  switch (getKpiDefinition(key).displayFormat) {
    case 'percent':
    case 'percentOfInventoryValue':
      return formatPointsDelta(delta);
    case 'currency':
      return formatSignedCurrency(delta);
    case 'count':
      return formatSignedCount(delta);
    case 'mplh':
      return formatSignedMplh(delta);
    case 'days':
      return formatSignedDays(delta);
  }
}

/** Relative-% KPI change with the absolute change in parentheses: "+2.0% (+$2,000)". */
export function formatRelativeDelta(key: ComparisonKpiKey, relativeChange: number, delta: number): string {
  return `${formatRelativeChange(relativeChange)} (${formatKpiDelta(key, delta)})`;
}

/**
 * Short chart-axis label in the KPI's units: "$1.2M", "250K", "60%", "18.5", "14 days".
 * Dollar and count values are abbreviated; other formats keep their display format.
 */
export function formatKpiAxisValue(key: ComparisonKpiKey, value: number): string {
  const format = getKpiDefinition(key).displayFormat;
  const compact = (v: number) =>
    Math.abs(v).toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 });
  const sign = value < 0 ? MINUS_SIGN : '';
  switch (format) {
    case 'currency':
      return `${sign}$${compact(value)}`;
    case 'count':
      return `${sign}${compact(value)}`;
    case 'percent':
    case 'percentOfInventoryValue':
      return formatPercent(value, { trimZeros: true });
    case 'mplh':
      return formatCount(value, { decimals: 1, trimZeros: true });
    case 'days':
      return formatDays(value, { decimals: 0 });
  }
}
