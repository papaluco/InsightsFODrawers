import { describe, expect, it } from 'vitest';
import { DEMO_AS_OF_DATE } from '../../../constants/demo';
import { addDays, IsoDate } from '../../../utils/dateOnly';
import { resolveTimeframe, TimeframeOptionId } from '../../../utils/timeframes';
import {
  alignTrendBuckets,
  buildTrendBuckets,
  checkTrendCompatibility,
  getDayAlignment,
  getDefaultInterval,
  TREND_UNAVAILABLE_MESSAGE,
} from './trendRules';

// DEMO_AS_OF_DATE (2026-04-16) is a Thursday.
const tf = (id: TimeframeOptionId, asOf: IsoDate = DEMO_AS_OF_DATE) => resolveTimeframe(id, asOf);
const custom = (start: IsoDate, end: IsoDate) => resolveTimeframe('custom', DEMO_AS_OF_DATE, { start, end });
/** A complete custom range of `days` calendar days starting 2025-08-01. */
const customOfLength = (days: number) => custom('2025-08-01', addDays('2025-08-01', days - 1));

describe('getDefaultInterval (spec §3)', () => {
  it.each([
    [1, 'day'],
    [14, 'day'],
    [15, 'week'],
    [93, 'week'],
    [94, 'month'],
    [366, 'month'],
    [367, 'quarter'],
  ])('a %i-day span defaults to %s', (days, expected) => {
    const range = customOfLength(days);
    expect(getDefaultInterval(range, range)).toBe(expected);
  });

  it('uses the longer of the two sides', () => {
    expect(getDefaultInterval(customOfLength(10), customOfLength(100))).toBe('month');
    expect(getDefaultInterval(customOfLength(100), customOfLength(10))).toBe('month');
  });

  it('uses full periods, not the partial portion', () => {
    expect(getDefaultInterval(tf('ytd'), tf('prior_year'))).toBe('month');
    expect(getDefaultInterval(tf('this_month'), tf('last_month'))).toBe('week');
    expect(getDefaultInterval(tf('this_week'), tf('last_week'))).toBe('day');
    expect(getDefaultInterval(tf('today'), tf('yesterday'))).toBe('day');
  });

  it('a leap school year (366 days) is still Month', () => {
    expect(getDefaultInterval(tf('sy2324'), tf('sy2324'))).toBe('month');
  });
});

describe('buildTrendBuckets — alignment by position (spec §7)', () => {
  it('Month: a full school year gives positions 1–12, Jul first', () => {
    const buckets = buildTrendBuckets(tf('prior_year'), 'month');
    expect(buckets.map(b => b.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(buckets[0]).toMatchObject({ start: '2024-07-01', end: '2024-07-31', positionLabel: 'Month 1', label: 'Jul 24' });
    expect(buckets[11]).toMatchObject({ start: '2025-06-01', end: '2025-06-30' });
  });

  it('Month: a partial school year stops at the through date (no future buckets)', () => {
    const buckets = buildTrendBuckets(tf('ytd'), 'month');
    expect(buckets).toHaveLength(10); // Jul – Apr
    expect(buckets[9]).toMatchObject({ position: 10, start: '2026-04-01', end: '2026-04-16' });
  });

  it('Month: positions count from the period start, so a range crossing Jul 1 stays in order', () => {
    const buckets = buildTrendBuckets(custom('2025-05-01', '2025-08-31'), 'month');
    expect(buckets.map(b => [b.position, b.start])).toEqual([
      [1, '2025-05-01'],
      [2, '2025-06-01'],
      [3, '2025-07-01'],
      [4, '2025-08-01'],
    ]);
  });

  it('Quarter: school-year quarters, Q1 = Jul–Sep', () => {
    const buckets = buildTrendBuckets(tf('prior_year'), 'quarter');
    expect(buckets.map(b => [b.position, b.positionLabel, b.start, b.end])).toEqual([
      [1, 'Q1', '2024-07-01', '2024-09-30'],
      [2, 'Q2', '2024-10-01', '2024-12-31'],
      [3, 'Q3', '2025-01-01', '2025-03-31'],
      [4, 'Q4', '2025-04-01', '2025-06-30'],
    ]);
    expect(buckets[0].label).toBe('Q1 SY 2024–25');
  });

  it('Quarter: a partial school year includes the in-progress quarter only up to the through date', () => {
    const buckets = buildTrendBuckets(tf('ytd'), 'quarter');
    expect(buckets).toHaveLength(4);
    expect(buckets[3]).toMatchObject({ position: 4, start: '2026-04-01', end: '2026-04-16' });
  });

  it('Quarter: positions count from the period start for ranges crossing Jul 1', () => {
    const buckets = buildTrendBuckets(custom('2025-02-01', '2025-08-31'), 'quarter');
    expect(buckets.map(b => [b.position, b.positionLabel])).toEqual([[1, 'Q3'], [2, 'Q4'], [3, 'Q1']]);
  });

  it('Week: Monday–Sunday week index within the period', () => {
    // April 2026 starts on a Wednesday.
    const april = buildTrendBuckets(tf('this_month'), 'week');
    expect(april.map(b => [b.position, b.start, b.end])).toEqual([
      [1, '2026-04-01', '2026-04-05'],
      [2, '2026-04-06', '2026-04-12'],
      [3, '2026-04-13', '2026-04-16'],
    ]);
    expect(april[0].positionLabel).toBe('Wk 1');

    // March 2026 starts on a Sunday, so week 1 is a single day.
    const march = buildTrendBuckets(tf('last_month'), 'week');
    expect(march).toHaveLength(6);
    expect(march[0]).toMatchObject({ start: '2026-03-01', end: '2026-03-01' });
    expect(march[5]).toMatchObject({ start: '2026-03-30', end: '2026-03-31' });
  });

  it('Day: school-day index, weekends excluded', () => {
    const buckets = buildTrendBuckets(tf('last_month'), 'day');
    expect(buckets).toHaveLength(22); // March 2026 weekdays
    expect(buckets[0]).toMatchObject({ position: 1, positionLabel: 'Day 1', start: '2026-03-02' });
    expect(buckets.some(b => b.start === '2026-03-07')).toBe(false);
  });

  it('Day: the isServingDay hook excludes non-serving days', () => {
    const isServingDay = (d: IsoDate) => d !== '2026-04-08' && !['2026-04-11', '2026-04-12'].includes(d);
    const buckets = buildTrendBuckets(tf('last_week'), 'day', { isServingDay });
    expect(buckets.map(b => [b.position, b.start])).toEqual([
      [1, '2026-04-06'],
      [2, '2026-04-07'],
      [3, '2026-04-09'],
      [4, '2026-04-10'],
    ]);
  });

  it('Day: week vs week aligns by weekday', () => {
    const left = tf('last_week');
    const right = tf('this_week'); // partial through Thursday
    const dayAlignment = getDayAlignment(left, right);
    expect(dayAlignment).toBe('weekday');

    const rows = alignTrendBuckets(
      buildTrendBuckets(left, 'day', { dayAlignment }),
      buildTrendBuckets(right, 'day', { dayAlignment }),
    );
    expect(rows.map(r => r.positionLabel)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    expect(rows[3].left?.start).toBe('2026-04-09');
    expect(rows[3].right?.start).toBe('2026-04-16');
    expect(rows[4].right).toBeNull(); // Friday hasn't happened yet
  });

  it('Day: non-week pairs use the school-day index', () => {
    expect(getDayAlignment(tf('this_month'), tf('last_month'))).toBe('schoolDayIndex');
    expect(getDayAlignment(tf('this_week'), tf('this_month'))).toBe('schoolDayIndex');
  });

  it('returns no buckets for a period that has not started', () => {
    expect(buildTrendBuckets(custom('2026-05-01', '2026-05-31'), 'week')).toEqual([]);
  });
});

describe('alignTrendBuckets', () => {
  it('pairs school years by month position, leaving future positions empty on the partial side', () => {
    const rows = alignTrendBuckets(buildTrendBuckets(tf('prior_year'), 'month'), buildTrendBuckets(tf('ytd'), 'month'));
    expect(rows).toHaveLength(12);
    expect(rows[0].left?.start).toBe('2024-07-01');
    expect(rows[0].right?.start).toBe('2025-07-01');
    expect(rows[9].right?.end).toBe('2026-04-16');
    expect(rows[10].right).toBeNull();
    expect(rows[11].right).toBeNull();
  });
});

describe('checkTrendCompatibility (spec §7)', () => {
  const available = { available: true, reason: null };

  it('allows school year vs school year at Month and Quarter', () => {
    expect(checkTrendCompatibility(tf('prior_year'), tf('ytd'), 'month')).toEqual(available);
    expect(checkTrendCompatibility(tf('prior_year'), tf('ytd'), 'quarter')).toEqual(available);
    expect(checkTrendCompatibility(tf('sy2324'), tf('prior_year'), 'week')).toEqual(available);
  });

  it('allows month vs month at Week and Day, but not Month or Quarter', () => {
    expect(checkTrendCompatibility(tf('last_month'), tf('this_month'), 'week')).toEqual(available);
    expect(checkTrendCompatibility(tf('last_month'), tf('this_month'), 'day')).toEqual(available);
    expect(checkTrendCompatibility(tf('last_month'), tf('this_month'), 'month').reason).toBe('intervalNotFinerThanPeriod');
    expect(checkTrendCompatibility(tf('last_month'), tf('this_month'), 'quarter').reason).toBe('intervalNotFinerThanPeriod');
  });

  it('allows week vs week only at Day', () => {
    expect(checkTrendCompatibility(tf('last_week'), tf('this_week'), 'day')).toEqual(available);
    expect(checkTrendCompatibility(tf('last_week'), tf('this_week'), 'week').reason).toBe('intervalNotFinerThanPeriod');
  });

  it('never allows a trend for single days', () => {
    expect(checkTrendCompatibility(tf('yesterday'), tf('today'), 'day').reason).toBe('intervalNotFinerThanPeriod');
    expect(checkTrendCompatibility(tf('yesterday'), tf('today'), 'week').reason).toBe('intervalNotFinerThanPeriod');
  });

  it('rejects different kinds', () => {
    expect(checkTrendCompatibility(tf('this_month'), tf('ytd'), 'week').reason).toBe('kindMismatch');
    expect(checkTrendCompatibility(customOfLength(30), tf('last_month'), 'week').reason).toBe('kindMismatch');
  });

  it('allows custom ranges whose lengths differ by at most 10%', () => {
    expect(checkTrendCompatibility(customOfLength(30), customOfLength(33), 'week')).toEqual(available); // 9.1%
    expect(checkTrendCompatibility(customOfLength(90), customOfLength(100), 'week')).toEqual(available); // exactly 10%
    expect(checkTrendCompatibility(customOfLength(30), customOfLength(34), 'week').reason).toBe('customLengthMismatch'); // 11.8%
  });

  it('ranks custom ranges by length for the "finer than period" rule', () => {
    expect(checkTrendCompatibility(customOfLength(10), customOfLength(10), 'month').reason).toBe('intervalNotFinerThanPeriod');
    expect(checkTrendCompatibility(customOfLength(10), customOfLength(10), 'day')).toEqual(available);
    expect(checkTrendCompatibility(customOfLength(120), customOfLength(120), 'quarter')).toEqual(available);
  });

  it('requires at least 2 buckets on each side', () => {
    // As of Monday 2026-04-13, This Week has only one day so far.
    expect(checkTrendCompatibility(tf('last_week', '2026-04-13'), tf('this_week', '2026-04-13'), 'day').reason)
      .toBe('insufficientBuckets');
    // As of Jul 1, the new school year has one month so far.
    expect(checkTrendCompatibility(tf('prior_year', '2026-07-01'), tf('ytd', '2026-07-01'), 'month').reason)
      .toBe('insufficientBuckets');
    // A range that hasn't started has no buckets.
    expect(checkTrendCompatibility(customOfLength(30), custom('2026-05-01', '2026-05-30'), 'week').reason)
      .toBe('insufficientBuckets');
  });

  it('counts serving days only when checking Day buckets', () => {
    const onlyMondays = (d: IsoDate) => new Date(`${d}T00:00:00Z`).getUTCDay() === 1;
    expect(checkTrendCompatibility(tf('last_week'), tf('this_week'), 'day', onlyMondays).reason).toBe('insufficientBuckets');
  });

  it('exposes the spec message', () => {
    expect(TREND_UNAVAILABLE_MESSAGE).toBe(
      'Trend comparison unavailable. Select comparable timeframes to view performance trends.',
    );
  });
});
