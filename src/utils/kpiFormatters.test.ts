import { describe, expect, it } from 'vitest';
import {
  formatCount,
  formatCurrency,
  formatDays,
  formatInventoryDiscrepancy,
  formatKpiDelta,
  formatKpiValue,
  formatMplh,
  formatPercent,
  formatPointsDelta,
  formatRelativeChange,
  formatRelativeDelta,
  formatSignedCount,
  formatSignedCurrency,
  formatSignedDays,
  formatSignedMplh,
  MINUS_SIGN,
  roundToDisplayPrecision,
} from './kpiFormatters';

describe('value formatters', () => {
  it('percent', () => {
    expect(formatPercent(60)).toBe('60.0%');
    expect(formatPercent(60, { trimZeros: true })).toBe('60%');
    expect(formatPercent(6.5, { trimZeros: true })).toBe('6.5%');
    expect(formatPercent(58.44)).toBe('58.4%');
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('currency', () => {
    expect(formatCurrency(167224)).toBe('$167,224');
    expect(formatCurrency(9000)).toBe('$9,000');
    expect(formatCurrency(-500)).toBe(`${MINUS_SIGN}$500`);
    expect(formatCurrency(1234.5, { decimals: 2 })).toBe('$1,234.50');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('count', () => {
    expect(formatCount(12500)).toBe('12,500');
    expect(formatCount(0)).toBe('0');
  });

  it('MPLH (always 2 dp)', () => {
    expect(formatMplh(18.4)).toBe('18.40');
    expect(formatMplh(18.577)).toBe('18.58');
  });

  it('days', () => {
    expect(formatDays(16)).toBe('16 days');
    expect(formatDays(1)).toBe('1 day');
    expect(formatDays(14.5)).toBe('14.5 days');
  });

  it('physical inventory discrepancy shows % with $ alongside', () => {
    expect(formatInventoryDiscrepancy(2.6, 4725)).toBe('2.6% ($4,725)');
    expect(formatInventoryDiscrepancy(2.6, null)).toBe('2.6%');
    expect(formatInventoryDiscrepancy(null, 4725)).toBe('No Data');
  });
});

describe('delta formatters', () => {
  it('percentage points', () => {
    expect(formatPointsDelta(4.3)).toBe('+4.3 pts');
    expect(formatPointsDelta(-0.5)).toBe(`${MINUS_SIGN}0.5 pts`);
    expect(formatPointsDelta(60.5 - 60)).toBe('+0.5 pts');
    expect(formatPointsDelta(0)).toBe('0.0 pts');
  });

  it('never shows a signed zero after rounding', () => {
    expect(formatPointsDelta(-0.04)).toBe('0.0 pts');
    expect(formatSignedCurrency(-0.4)).toBe('$0');
    expect(formatRelativeChange(0.0004)).toBe('0.0%');
  });

  it('relative change from a fraction', () => {
    expect(formatRelativeChange(0.02)).toBe('+2.0%');
    expect(formatRelativeChange(-0.063)).toBe(`${MINUS_SIGN}6.3%`);
    expect(formatRelativeChange(0.015)).toBe('+1.5%');
  });

  it('signed currency, counts, MPLH, and days', () => {
    expect(formatSignedCurrency(4000)).toBe('+$4,000');
    expect(formatSignedCurrency(-500)).toBe(`${MINUS_SIGN}$500`);
    expect(formatSignedCurrency(0)).toBe('$0');
    expect(formatSignedCount(-1250)).toBe(`${MINUS_SIGN}1,250`);
    expect(formatSignedMplh(0.37)).toBe('+0.37');
    expect(formatSignedDays(-2)).toBe(`${MINUS_SIGN}2 days`);
    expect(formatSignedDays(1)).toBe('+1 day');
  });

  it('uses the true minus sign, not a hyphen', () => {
    expect(formatSignedCurrency(-500)).not.toContain('-');
  });
});

describe('formatKpiValue', () => {
  it('formats by the KPI display format', () => {
    expect(formatKpiValue('Lunch', 58.4)).toBe('58.4%');
    expect(formatKpiValue('Revenue', 100000)).toBe('$100,000');
    expect(formatKpiValue('Meals', 12500)).toBe('12,500');
    expect(formatKpiValue('MPLH', 18.4)).toBe('18.40');
    expect(formatKpiValue('Inventory Turnover Rate', 16)).toBe('16 days');
    expect(formatKpiValue('Physical Inventory Discrepancy', 2.6)).toBe('2.6%');
    expect(formatKpiValue('A La Carte', 2500)).toBe('$2,500');
  });

  it('formats null as No Data, never 0', () => {
    expect(formatKpiValue('Lunch', null)).toBe('No Data');
    expect(formatKpiValue('Revenue', null, '—')).toBe('—');
  });

  it('keeps a legitimate zero distinct from No Data', () => {
    expect(formatKpiValue('Supper', 0)).toBe('0.0%');
    expect(formatKpiValue('Revenue', 0)).toBe('$0');
  });
});

describe('formatKpiDelta / formatRelativeDelta', () => {
  it('formats the absolute change in KPI units', () => {
    expect(formatKpiDelta('Lunch', 2)).toBe('+2.0 pts');
    expect(formatKpiDelta('PNA', -1.5)).toBe(`${MINUS_SIGN}1.5 pts`);
    expect(formatKpiDelta('Waste', -500)).toBe(`${MINUS_SIGN}$500`);
    expect(formatKpiDelta('Meals', 125)).toBe('+125');
    expect(formatKpiDelta('MPLH', 0.37)).toBe('+0.37');
    expect(formatKpiDelta('Inventory Turnover Rate', -2)).toBe(`${MINUS_SIGN}2 days`);
    expect(formatKpiDelta('Physical Inventory Discrepancy', -0.6)).toBe(`${MINUS_SIGN}0.6 pts`);
  });

  it('formats relative change with the absolute change alongside', () => {
    expect(formatRelativeDelta('Revenue', 0.02, 2000)).toBe('+2.0% (+$2,000)');
    expect(formatRelativeDelta('Waste', -0.02, -200)).toBe(`${MINUS_SIGN}2.0% (${MINUS_SIGN}$200)`);
    expect(formatRelativeDelta('Meals', 0.01, 125)).toBe('+1.0% (+125)');
  });
});

describe('roundToDisplayPrecision', () => {
  it('rounds exactly as formatKpiValue displays', () => {
    expect(roundToDisplayPrecision('Lunch', 59.97)).toBe(60);
    expect(roundToDisplayPrecision('Lunch', 59.94)).toBe(59.9);
    expect(roundToDisplayPrecision('Revenue', 1234.5)).toBe(1235);
    expect(roundToDisplayPrecision('MPLH', 18.496)).toBe(18.5);
    expect(roundToDisplayPrecision('Inventory Turnover Rate', 14.26)).toBe(14.3);
    expect(roundToDisplayPrecision('Waste', -500.4)).toBe(-500);
  });

  it('agrees with the formatted value for every KPI', () => {
    for (const kpi of ['Lunch', 'Revenue', 'Meals', 'MPLH', 'Inventory Turnover Rate', 'Physical Inventory Discrepancy'] as const) {
      for (const value of [0.05, 12.345, 59.97, 1234.5, 18.495]) {
        expect(formatKpiValue(kpi, roundToDisplayPrecision(kpi, value))).toBe(formatKpiValue(kpi, value));
      }
    }
  });
});
