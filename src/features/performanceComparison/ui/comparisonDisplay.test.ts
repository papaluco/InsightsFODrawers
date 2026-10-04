import { describe, expect, it } from 'vitest';
import { compareKpi } from '../engine/compareKpi';
import type { SideKpiInput } from '../engine/types';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import {
  getClassificationDisplay,
  getSideShortNames,
  getTargetStatusDisplay,
} from './comparisonDisplay';

const side = (actual: number | null, target: number | null = null, label = 'All Sites · SY 2024–25'): SideKpiInput => ({ actual, target, label });
const run = (kpi: ComparisonKpiKey, left: SideKpiInput, right: SideKpiInput) => compareKpi({ kpi, left, right });

describe('getClassificationDisplay', () => {
  it('Improved by a decrease (lower is favorable) points down in the favorable token', () => {
    expect(getClassificationDisplay(run('Waste', side(10000), side(9500)))).toEqual({ label: 'Improved', status: 'favorable', direction: 'down' });
  });

  it('Declined by a decrease points down in the unfavorable token', () => {
    expect(getClassificationDisplay(run('Lunch', side(61), side(59)))).toEqual({ label: 'Declined', status: 'unfavorable', direction: 'down' });
  });

  it('Comparable is flat and neutral even with a small change', () => {
    expect(getClassificationDisplay(run('Lunch', side(60), side(60.4)))).toEqual({ label: 'Comparable', status: 'neutral', direction: 'flat' });
  });

  it('baseline zero keeps its arrow but stays neutral', () => {
    expect(getClassificationDisplay(run('Revenue', side(0), side(5000)))).toEqual({ label: 'Relative Change N/A', status: 'neutral', direction: 'up' });
  });

  it('No Data has no color and no arrow', () => {
    expect(getClassificationDisplay(run('Lunch', side(null), side(60)))).toEqual({ label: 'No Data', status: null, direction: null });
  });

  it('Informational is neutral with no arrow', () => {
    expect(getClassificationDisplay(run('Inventory Value', side(100), side(120)))).toEqual({ label: 'Informational', status: 'neutral', direction: null });
  });
});

describe('getTargetStatusDisplay', () => {
  const result = run('Lunch', side(null, 60), side(58, 60));

  it('shows Met / Not Met for directional KPIs', () => {
    expect(getTargetStatusDisplay(result.right, false)).toEqual({ text: 'Not Met', tone: 'notMet' });
    expect(getTargetStatusDisplay(run('Lunch', side(61, 60), side(61, 60)).right, false)).toEqual({ text: 'Met', tone: 'met' });
  });

  it('No Data is never a missed target', () => {
    expect(getTargetStatusDisplay(result.left, false)).toEqual({ text: 'No Data', tone: 'none' });
  });

  it('a missing benchmark is "No target", not a missed target', () => {
    expect(getTargetStatusDisplay(run('Lunch', side(58), side(60)).right, false)).toEqual({ text: 'No target', tone: 'none' });
  });

  it('informational KPIs are never evaluated', () => {
    expect(getTargetStatusDisplay(run('Inventory Turnover Rate', side(16, 14), side(14, 14)).right, true)).toEqual({ text: 'Not evaluated', tone: 'none' });
  });
});

describe('getSideShortNames (spec §8)', () => {
  const name = (siteLabel: string, timeframeLabel: string) => ({ siteLabel, timeframeLabel, label: `${siteLabel} · ${timeframeLabel}` });

  it('only timeframes differ → timeframe part', () => {
    expect(getSideShortNames(name('All Sites', 'Yesterday'), name('All Sites', 'Today'))).toEqual(['Yesterday', 'Today']);
  });

  it('only sites differ → site part', () => {
    expect(getSideShortNames(name('Lincoln Elementary', 'This Month'), name('Jefferson Elementary', 'This Month'))).toEqual([
      'Lincoln Elementary',
      'Jefferson Elementary',
    ]);
  });

  it('both differ → full labels', () => {
    expect(getSideShortNames(name('All Sites', 'SY 2024–25'), name('High Schools', 'SY 2025–26'))).toEqual([
      'All Sites · SY 2024–25',
      'High Schools · SY 2025–26',
    ]);
  });

  it('identical labels → full labels', () => {
    expect(getSideShortNames(name('All Sites', 'This Week'), name('All Sites', 'This Week'))).toEqual(['All Sites · This Week', 'All Sites · This Week']);
  });
});
