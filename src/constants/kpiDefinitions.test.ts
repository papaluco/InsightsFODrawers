import { describe, expect, it } from 'vitest';
import { KPI_SELECT_OPTIONS, KPI_SHORT_NAMES, NEW_KPI_SHORT_NAMES } from '../types/kpiTypes';
import {
  COMPARISON_KPI_KEYS,
  COMPARISON_KPI_TO_SCHOOLIE_KEY,
  getKpiDefinition,
  hasTargetStatus,
  KPI_DEFINITIONS,
} from './kpiDefinitions';

// Spec §4 rules matrix: key, format, kind, favorable, materiality method, threshold, aggregation, target policy.
const SPEC_MATRIX = [
  ['Breakfast', 'percent', 'directional', 'higher', 'percentagePoints', 0.5, 'ratioOfSums', 'configured'],
  ['Lunch', 'percent', 'directional', 'higher', 'percentagePoints', 0.5, 'ratioOfSums', 'configured'],
  ['Snack', 'percent', 'directional', 'higher', 'percentagePoints', 0.5, 'ratioOfSums', 'configured'],
  ['Supper', 'percent', 'directional', 'higher', 'percentagePoints', 0.5, 'ratioOfSums', 'configured'],
  ['Revenue', 'currency', 'directional', 'higher', 'relativePercent', 0.02, 'sum', 'configured'],
  ['Meals', 'count', 'directional', 'higher', 'relativePercent', 0.02, 'sum', 'configured'],
  ['MEQs', 'count', 'directional', 'higher', 'relativePercent', 0.02, 'sum', 'configured'],
  ['Eco Dis', 'percent', 'directional', 'higher', 'percentagePoints', 0.5, 'ratioOfSums', 'configured'],
  ['PNA', 'percent', 'directional', 'lower', 'percentagePoints', 0.5, 'ratioOfSums', 'configured'],
  ['ENP', 'percent', 'directional', 'lower', 'percentagePoints', 0.5, 'ratioOfSums', 'configured'],
  ['MPLH', 'mplh', 'directional', 'higher', 'relativePercent', 0.02, 'ratioOfSums', 'configured'],
  ['A La Carte', 'currency', 'directional', 'higher', 'relativePercent', 0.02, 'sum', 'configured'],
  ['Reimbursement', 'currency', 'directional', 'higher', 'relativePercent', 0.02, 'sum', 'configured'],
  ['Waste', 'currency', 'directional', 'lower', 'relativePercent', 0.02, 'sum', 'configured'],
  ['Inventory Value', 'currency', 'informational', 'none', 'none', null, 'pointInTime', 'none'],
  ['Inventory Turnover Rate', 'days', 'informational', 'none', 'none', null, 'pointInTime', 'contextOnly'],
  ['Physical Inventory Discrepancy', 'percentOfInventoryValue', 'informational', 'none', 'none', null, 'pointInTime', 'contextOnly'],
] as const;

describe('KPI_DEFINITIONS', () => {
  it('has all 17 KPIs in spec §4 order', () => {
    expect(COMPARISON_KPI_KEYS).toEqual(SPEC_MATRIX.map(row => row[0]));
    expect(new Set(COMPARISON_KPI_KEYS).size).toBe(17);
  });

  it.each(SPEC_MATRIX)('%s matches the spec matrix', (key, format, kind, favorable, method, threshold, aggregation, targetPolicy) => {
    expect(getKpiDefinition(key)).toMatchObject({
      key,
      displayFormat: format,
      kind,
      favorableDirection: favorable,
      materiality: { method, threshold },
      aggregation,
      targetPolicy,
    });
  });

  it('covers every existing dashboard KPI plus A La Carte and Reimbursement', () => {
    expect([...COMPARISON_KPI_KEYS].sort()).toEqual([...KPI_SHORT_NAMES, ...NEW_KPI_SHORT_NAMES].sort());
  });

  it('reuses the existing long names', () => {
    expect(getKpiDefinition('MPLH').name).toBe('Meals per Labor Hour (MPLH)');
    expect(getKpiDefinition('PNA').name).toBe('Paid Not Applied (PNA)');
    expect(getKpiDefinition('A La Carte').name).toBe('A La Carte');
  });

  it('shows Physical Inventory Discrepancy as % with $ alongside', () => {
    expect(getKpiDefinition('Physical Inventory Discrepancy').secondaryDisplayFormat).toBe('currency');
  });

  it('gives MPLH its ratio-of-sums components (MEQs ÷ labor hours)', () => {
    expect(getKpiDefinition('MPLH').ratio).toEqual({ numerator: 'MEQs', denominator: 'labor hours' });
  });

  it('informational KPIs never get a target status', () => {
    expect(hasTargetStatus('Inventory Value')).toBe(false);
    expect(hasTargetStatus('Inventory Turnover Rate')).toBe(false);
    expect(hasTargetStatus('Physical Inventory Discrepancy')).toBe(false);
    expect(KPI_DEFINITIONS.filter(d => d.kind === 'directional').every(d => hasTargetStatus(d.key))).toBe(true);
  });

  it('throws for unknown keys', () => {
    expect(() => getKpiDefinition('Nope' as never)).toThrow();
  });
});

describe('kpiTypes backward compatibility', () => {
  it('leaves the Usage KPI filter options unchanged (15, no new KPIs)', () => {
    expect(KPI_SELECT_OPTIONS).toHaveLength(15);
    expect(KPI_SELECT_OPTIONS.map(o => o.value)).not.toContain('A La Carte');
    expect(KPI_SELECT_OPTIONS.map(o => o.value)).not.toContain('Reimbursement');
  });
});

describe('COMPARISON_KPI_TO_SCHOOLIE_KEY', () => {
  it('maps each comparison KPI to the Schoolie KPIKey, or null when Schoolie has none', () => {
    expect(Object.keys(COMPARISON_KPI_TO_SCHOOLIE_KEY).sort()).toEqual([...COMPARISON_KPI_KEYS].sort());
    expect(COMPARISON_KPI_TO_SCHOOLIE_KEY.PNA).toBe('PAID_NOT_APPLIED');
    expect(COMPARISON_KPI_TO_SCHOOLIE_KEY.MEQs).toBe('MEAL_EQUIVALENTS');
    expect(COMPARISON_KPI_TO_SCHOOLIE_KEY['Inventory Turnover Rate']).toBe('INV_TURNOVER');
    expect(COMPARISON_KPI_TO_SCHOOLIE_KEY['A La Carte']).toBeNull();
    expect(COMPARISON_KPI_TO_SCHOOLIE_KEY.Reimbursement).toBeNull();
  });

  it('maps the 15 existing KPIs to 15 distinct Schoolie keys', () => {
    const mapped = KPI_SHORT_NAMES.map(k => COMPARISON_KPI_TO_SCHOOLIE_KEY[k]);
    expect(mapped.every(Boolean)).toBe(true);
    expect(new Set(mapped).size).toBe(15);
  });
});
