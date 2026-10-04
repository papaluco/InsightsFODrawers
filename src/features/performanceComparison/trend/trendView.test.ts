import { describe, expect, it } from 'vitest';
import { DEMO_AS_OF_DATE } from '../../../constants/demo';
import { comparisonIsServingDay } from '../../../services/comparisonDataService';
import { resolveTimeframe, TimeframeOptionId } from '../../../utils/timeframes';
import { getDefaultInterval } from './trendRules';
import {
  buildTrendChartData,
  getTrendIntervalOptions,
  getTrendPartialNotes,
  resolveTrendInterval,
  TrendSeriesPoint,
} from './trendView';

const tf = (id: TimeframeOptionId) => resolveTimeframe(id, DEMO_AS_OF_DATE);
const available = (left: TimeframeOptionId, right: TimeframeOptionId) =>
  getTrendIntervalOptions(tf(left), tf(right), comparisonIsServingDay).filter(o => o.available).map(o => o.interval);

describe('getTrendIntervalOptions', () => {
  it('school years: Day, Week, Month, and Quarter are all finer than a year', () => {
    expect(available('prior_ytd', 'ytd')).toEqual(['day', 'week', 'month', 'quarter']);
  });

  it('weeks: only Day', () => {
    expect(available('last_week', 'this_week')).toEqual(['day']);
  });

  it('months: Day and Week, never Quarter', () => {
    expect(available('last_month', 'this_month')).toEqual(['day', 'week']);
  });

  it('different kinds: nothing, with a reason on every interval', () => {
    const options = getTrendIntervalOptions(tf('today'), tf('ytd'), comparisonIsServingDay);
    expect(options.every(o => !o.available)).toBe(true);
    expect(options[0].disabledReason).toBe('Unavailable: the two timeframes are different kinds of periods.');
  });

  it('explains an interval that is not finer than the period', () => {
    const quarter = getTrendIntervalOptions(tf('last_month'), tf('this_month'), comparisonIsServingDay)[3];
    expect(quarter).toEqual({
      interval: 'quarter',
      available: false,
      disabledReason: 'Unavailable: Quarter is not shorter than the selected timeframes.',
    });
  });
});

describe('resolveTrendInterval', () => {
  const options = getTrendIntervalOptions(tf('last_month'), tf('this_month'), comparisonIsServingDay);

  it('keeps an available user choice', () => {
    expect(resolveTrendInterval('day', options, 'week')).toBe('day');
  });

  it('falls back to the default when the choice is no longer available', () => {
    expect(resolveTrendInterval('quarter', options, 'week')).toBe('week');
  });

  it('uses the spec §3 default with no choice', () => {
    expect(resolveTrendInterval(null, options, getDefaultInterval(tf('last_month'), tf('this_month')))).toBe('week');
  });

  it('picks the closest available interval when the default is unavailable', () => {
    expect(resolveTrendInterval(null, options, 'month')).toBe('week');
  });

  it('is null when nothing is available', () => {
    expect(resolveTrendInterval('day', getTrendIntervalOptions(tf('today'), tf('ytd'), comparisonIsServingDay), 'day')).toBeNull();
  });
});

const point = (position: number, label: string, actual: number | null, target: number | null): TrendSeriesPoint => ({
  position,
  positionLabel: `Month ${position}`,
  label,
  start: '2025-07-01',
  end: '2025-07-31',
  actual,
  target,
});

describe('buildTrendChartData', () => {
  it('pairs by position and labels months by name when both sides match', () => {
    const { rows } = buildTrendChartData(
      [point(2, 'Aug 24', 55, 60), point(3, 'Sep 24', 58, 60)],
      [point(2, 'Aug 25', 57, 60), point(3, 'Sep 25', 59, 60)],
      'month',
      true,
    );
    expect(rows.map(r => r.axisLabel)).toEqual(['Aug', 'Sep']);
    expect(rows[1]).toMatchObject({ leftActual: 58, rightActual: 59 });
  });

  it('drops intervals where neither side has data (summer months), whether null or missing', () => {
    const { rows } = buildTrendChartData(
      [point(1, 'Jul 24', null, 60), point(2, 'Aug 24', 55, 60), point(12, 'Jun 25', null, 60)],
      [point(1, 'Jul 25', null, 60), point(2, 'Aug 25', 57, 60)],
      'month',
      true,
    );
    expect(rows.map(r => r.axisLabel)).toEqual(['Aug']);
  });

  it('keeps an interval where only one side lacks data, as a gap on that side', () => {
    const { rows } = buildTrendChartData(
      [point(2, 'Aug 24', 55, 60), point(3, 'Sep 24', 58, 60), point(4, 'Oct 24', null, 60)],
      [point(2, 'Aug 25', 57, 60), point(4, 'Oct 25', 61, 60)],
      'month',
      true,
    );
    expect(rows.map(r => r.axisLabel)).toEqual(['Aug', 'Sep', 'Oct']);
    expect(rows[1]).toMatchObject({ leftActual: 58, rightActual: null, rightPeriodLabel: null });
    expect(rows[2]).toMatchObject({ leftActual: null, rightActual: 61 });
  });

  it('merges identical targets into one shared line, including positions only one side has', () => {
    const data = buildTrendChartData([point(1, 'Jul 24', 50, 60), point(2, 'Aug 24', 55, 60)], [point(1, 'Jul 25', 52, 60)], 'month', true);
    expect(data.targetsMerged).toBe(true);
    expect(data.rows.map(r => [r.sharedTarget, r.leftTarget, r.rightTarget])).toEqual([[60, null, null], [60, null, null]]);
  });

  it('keeps separate lines when targets differ', () => {
    const data = buildTrendChartData([point(1, 'Jul 24', 50, 60)], [point(1, 'Jul 25', 52, 62)], 'month', true);
    expect(data.targetsMerged).toBe(false);
    expect(data.rows[0]).toMatchObject({ leftTarget: 60, rightTarget: 62, sharedTarget: null });
  });

  it('a target on one side only is drawn for that side, not merged', () => {
    const data = buildTrendChartData([point(1, 'Jul 24', 50, null)], [point(1, 'Jul 25', 52, 62)], 'month', true);
    expect(data).toMatchObject({ targetsMerged: false, hasLeftTarget: false, hasRightTarget: true });
  });

  it('draws no target lines when targets are hidden (informational KPIs)', () => {
    const data = buildTrendChartData([point(1, 'Jul 24', 50, 60)], [point(1, 'Jul 25', 52, 60)], 'month', false);
    expect(data).toMatchObject({ targetsMerged: false, hasLeftTarget: false, hasRightTarget: false });
    expect(data.rows[0]).toMatchObject({ leftTarget: null, rightTarget: null, sharedTarget: null });
  });

  it('uses the position label when the calendar months differ (e.g. custom ranges)', () => {
    const { rows } = buildTrendChartData([point(1, 'Aug 25', 1, null)], [point(1, 'Oct 25', 2, null)], 'month', true);
    expect(rows[0].axisLabel).toBe('Month 1');
  });
});

describe('getTrendPartialNotes', () => {
  it('notes only the partial side, by its generated label', () => {
    expect(
      getTrendPartialNotes(
        { label: 'All Sites · SY 2024–25', timeframe: tf('prior_year') },
        { label: 'All Sites · SY 2025–26', timeframe: tf('ytd') },
      ),
    ).toEqual(['All Sites · SY 2025–26 includes data through April 16, 2026. Later periods have not occurred and are not shown.']);
  });

  it('is empty when neither side is partial', () => {
    expect(getTrendPartialNotes({ label: 'a', timeframe: tf('prior_year') }, { label: 'b', timeframe: tf('sy2324') })).toEqual([]);
  });
});
