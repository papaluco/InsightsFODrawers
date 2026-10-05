import { describe, expect, it } from 'vitest';
import { getAttainmentText, getKpisComparedText } from './summaryDisplay';

const side = (meetingTarget: number, kpisWithTarget: number) => ({ label: 'All Sites · This Month', meetingTarget, kpisWithTarget });

describe('getKpisComparedText', () => {
  it('counts directional KPIs in scope, with the singular for one', () => {
    expect(getKpisComparedText(14)).toBe('14 KPIs compared');
    expect(getKpisComparedText(1)).toBe('1 KPI compared');
    expect(getKpisComparedText(0)).toBe('0 KPIs compared');
  });
});

describe('getAttainmentText', () => {
  it('gives the count, the wording, and a whole percent', () => {
    expect(getAttainmentText(side(8, 13))).toEqual({ count: '8 of 13', rest: 'KPIs meeting target', percent: '62%' });
    expect(getAttainmentText(side(0, 12))).toEqual({ count: '0 of 12', rest: 'KPIs meeting target', percent: '0%' });
  });

  it('uses the singular when the denominator is 1', () => {
    expect(getAttainmentText(side(1, 1))).toEqual({ count: '1 of 1', rest: 'KPI meeting target', percent: '100%' });
    expect(getAttainmentText(side(0, 1))?.rest).toBe('KPI meeting target');
  });

  it('is null when no KPI in scope has data and a target (never "0 of 0" or a divide by zero)', () => {
    expect(getAttainmentText(side(0, 0))).toBeNull();
  });
});
