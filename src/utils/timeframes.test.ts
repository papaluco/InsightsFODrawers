import { describe, expect, it } from 'vitest';
import { DEMO_AS_OF_DATE } from '../constants/demo';
import { inclusiveDayCount } from './dateOnly';
import {
  formatDateRangeLabel,
  getPartialPeriodLabel,
  getPeriodLengthNotice,
  PERIOD_LENGTH_NOTICE,
  PERIOD_LENGTH_NOTICE_YTD_VS_PRIOR_YEAR,
  getTimeframeLabel,
  resolveTimeframe,
  TIMEFRAME_OPTION_IDS,
  TimeframeOptionId,
} from './timeframes';

// DEMO_AS_OF_DATE (2026-04-16) is a Thursday in SY 2025–26.
const resolve = (id: TimeframeOptionId) => resolveTimeframe(id, DEMO_AS_OF_DATE);
const inclusiveDays = ({ start, end }: { start: string; end: string }) => inclusiveDayCount(start, end);

describe('resolveTimeframe against DEMO_AS_OF_DATE', () => {
  it('uses 2026-04-16 as the demo date', () => {
    expect(DEMO_AS_OF_DATE).toBe('2026-04-16');
  });

  it.each<[TimeframeOptionId, string, string, string, boolean, string | null]>([
    // id,          kind,         start,        end,          isPartial, throughDate
    ['today',       'day',        '2026-04-16', '2026-04-16', false, '2026-04-16'],
    ['yesterday',   'day',        '2026-04-15', '2026-04-15', false, '2026-04-15'],
    ['this_week',   'week',       '2026-04-13', '2026-04-19', true,  '2026-04-16'],
    ['last_week',   'week',       '2026-04-06', '2026-04-12', false, '2026-04-12'],
    ['this_month',  'month',      '2026-04-01', '2026-04-30', true,  '2026-04-16'],
    ['last_month',  'month',      '2026-03-01', '2026-03-31', false, '2026-03-31'],
    ['ytd',         'schoolYear', '2025-07-01', '2026-06-30', true,  '2026-04-16'],
    ['prior_year',  'schoolYear', '2024-07-01', '2025-06-30', false, '2025-06-30'],
    ['priorYearToDate', 'schoolYear', '2024-07-01', '2025-04-16', false, '2025-04-16'],
    ['sy2324',      'schoolYear', '2023-07-01', '2024-06-30', false, '2024-06-30'],
    ['sy2223',      'schoolYear', '2022-07-01', '2023-06-30', false, '2023-06-30'],
    ['sy2122',      'schoolYear', '2021-07-01', '2022-06-30', false, '2022-06-30'],
    ['sy2021',      'schoolYear', '2020-07-01', '2021-06-30', false, '2021-06-30'],
  ])('%s → %s %s – %s (partial: %s)', (id, kind, start, end, isPartial, throughDate) => {
    expect(resolve(id)).toMatchObject({ optionId: id, kind, start, end, isPartial, throughDate });
  });

  it('resolves every selector option except custom without a range', () => {
    for (const id of TIMEFRAME_OPTION_IDS.filter(o => o !== 'custom')) {
      expect(() => resolve(id)).not.toThrow();
    }
  });

  it('attaches the school year when the period is inside one', () => {
    expect(resolve('today').schoolYear?.label).toBe('SY 2025–26');
    expect(resolve('this_week').schoolYear?.label).toBe('SY 2025–26');
    expect(resolve('prior_year').schoolYear?.label).toBe('SY 2024–25');
  });
});

describe('resolveTimeframe boundaries', () => {
  it('treats Today as complete (data runs through the as-of date)', () => {
    expect(resolveTimeframe('today', '2026-04-16').isPartial).toBe(false);
  });

  it('rolls YTD and Prior Year over on Jul 1', () => {
    expect(resolveTimeframe('ytd', '2026-06-30')).toMatchObject({ start: '2025-07-01', end: '2026-06-30', isPartial: false });
    expect(resolveTimeframe('ytd', '2026-07-01')).toMatchObject({ start: '2026-07-01', end: '2027-06-30', isPartial: true, throughDate: '2026-07-01' });
    expect(resolveTimeframe('prior_year', '2026-06-30').start).toBe('2024-07-01');
    expect(resolveTimeframe('prior_year', '2026-07-01').start).toBe('2025-07-01');
  });

  it('handles weeks when the as-of date is a Monday or a Sunday', () => {
    expect(resolveTimeframe('this_week', '2026-04-13')).toMatchObject({ start: '2026-04-13', end: '2026-04-19', isPartial: true });
    expect(resolveTimeframe('this_week', '2026-04-19')).toMatchObject({ start: '2026-04-13', end: '2026-04-19', isPartial: false });
    expect(resolveTimeframe('last_week', '2026-04-19')).toMatchObject({ start: '2026-04-06', end: '2026-04-12' });
  });

  it('handles months across a year boundary and leap years', () => {
    expect(resolveTimeframe('last_month', '2026-01-15')).toMatchObject({ start: '2025-12-01', end: '2025-12-31' });
    expect(resolveTimeframe('this_month', '2024-02-10')).toMatchObject({ start: '2024-02-01', end: '2024-02-29' });
    expect(resolveTimeframe('this_month', '2026-04-30').isPartial).toBe(false);
  });

  it('a week that spans Jul 1 has no single school year', () => {
    // 2025-06-30 is a Monday; its week runs Jun 30 – Jul 6.
    expect(resolveTimeframe('this_week', '2025-07-02').schoolYear).toBeUndefined();
  });
});

describe('custom ranges', () => {
  it('resolves a complete custom range', () => {
    const tf = resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2025-08-01', end: '2025-09-30' });
    expect(tf).toMatchObject({ kind: 'custom', start: '2025-08-01', end: '2025-09-30', isPartial: false, throughDate: '2025-09-30' });
    expect(tf.schoolYear?.label).toBe('SY 2025–26');
  });

  it('is partial when it extends past the as-of date', () => {
    const tf = resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2026-04-01', end: '2026-05-15' });
    expect(tf).toMatchObject({ isPartial: true, throughDate: '2026-04-16' });
  });

  it('has no through date when it starts after the as-of date', () => {
    const tf = resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2026-05-01', end: '2026-05-31' });
    expect(tf).toMatchObject({ isPartial: true, throughDate: null });
  });

  it('has no school year when it spans Jul 1', () => {
    expect(resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2025-06-01', end: '2025-08-31' }).schoolYear).toBeUndefined();
  });

  it('rejects missing, invalid, or reversed ranges', () => {
    expect(() => resolveTimeframe('custom', DEMO_AS_OF_DATE)).toThrow();
    expect(() => resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2025-02-30', end: '2025-03-01' })).toThrow();
    expect(() => resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2025-09-30', end: '2025-08-01' })).toThrow();
  });

  it('rejects unknown option IDs', () => {
    expect(() => resolveTimeframe('sy1920' as TimeframeOptionId, DEMO_AS_OF_DATE)).toThrow();
  });
});

describe('timeframe labels (spec §6)', () => {
  it.each<[TimeframeOptionId, string]>([
    ['today', 'Today'],
    ['yesterday', 'Yesterday'],
    ['this_week', 'This Week'],
    ['last_week', 'Last Week'],
    ['this_month', 'This Month'],
    ['last_month', 'Last Month'],
    ['ytd', 'SY 2025–26'],
    ['prior_year', 'SY 2024–25'],
    ['priorYearToDate', 'SY 2024–25 through Apr 16'],
    ['sy2324', 'SY 2023–24'],
    ['sy2223', 'SY 2022–23'],
    ['sy2122', 'SY 2021–22'],
    ['sy2021', 'SY 2020–21'],
  ])('%s → "%s"', (id, label) => {
    expect(getTimeframeLabel(resolve(id))).toBe(label);
  });

  it('labels custom ranges with their dates', () => {
    const label = (start: string, end: string) => getTimeframeLabel(resolveTimeframe('custom', DEMO_AS_OF_DATE, { start, end }));
    expect(label('2025-08-01', '2025-09-30')).toBe('Aug 1 – Sep 30, 2025');
    expect(label('2025-12-15', '2026-01-10')).toBe('Dec 15, 2025 – Jan 10, 2026');
    expect(label('2025-08-01', '2025-08-01')).toBe('Aug 1, 2025');
  });

  it('formats date ranges', () => {
    expect(formatDateRangeLabel('2026-04-13', '2026-04-19')).toBe('Apr 13 – Apr 19, 2026');
  });
});

describe('partial-period label', () => {
  it('shows the through date for partial periods', () => {
    expect(getPartialPeriodLabel(resolve('ytd'))).toBe('Partial · through Apr 16, 2026');
    expect(getPartialPeriodLabel(resolve('this_week'))).toBe('Partial · through Apr 16, 2026');
  });

  it('is null for complete periods', () => {
    expect(getPartialPeriodLabel(resolve('prior_year'))).toBeNull();
    expect(getPartialPeriodLabel(resolve('today'))).toBeNull();
  });

  it('handles periods with no data yet', () => {
    expect(getPartialPeriodLabel(resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2026-05-01', end: '2026-05-31' })))
      .toBe('Partial · no data yet');
  });
});

describe('Prior Year to Date (spec §3)', () => {
  it('covers the same elapsed portion of the prior school year as Year to Date', () => {
    const ytd = resolve('ytd');
    const pytd = resolve('priorYearToDate');
    expect(pytd).toMatchObject({ kind: 'schoolYear', start: '2024-07-01', end: '2025-04-16' });
    expect(inclusiveDays(pytd)).toBe(inclusiveDays({ start: ytd.start, end: ytd.throughDate ?? ytd.start }));
    expect(pytd.schoolYear?.label).toBe('SY 2024–25');
  });

  it('is never partial: the period is complete', () => {
    expect(resolve('priorYearToDate')).toMatchObject({ isPartial: false, throughDate: '2025-04-16' });
    expect(getPartialPeriodLabel(resolve('priorYearToDate'))).toBeNull();
  });

  it('maps Feb 29 to Feb 28', () => {
    expect(resolveTimeframe('priorYearToDate', '2024-02-29')).toMatchObject({ start: '2022-07-01', end: '2023-02-28' });
    expect(getTimeframeLabel(resolveTimeframe('priorYearToDate', '2024-02-29'))).toBe('SY 2022–23 through Feb 28');
  });

  it('rolls over with the school year', () => {
    expect(resolveTimeframe('priorYearToDate', '2026-06-30')).toMatchObject({ start: '2024-07-01', end: '2025-06-30' });
    expect(resolveTimeframe('priorYearToDate', '2026-07-01')).toMatchObject({ start: '2025-07-01', end: '2025-07-01' });
  });
});

describe('getPeriodLengthNotice (spec §6)', () => {
  it('suggests Prior Year to Date for Year to Date vs Prior Year, in either order', () => {
    expect(getPeriodLengthNotice(resolve('ytd'), resolve('prior_year'))).toBe(PERIOD_LENGTH_NOTICE_YTD_VS_PRIOR_YEAR);
    expect(getPeriodLengthNotice(resolve('prior_year'), resolve('ytd'))).toBe(PERIOD_LENGTH_NOTICE_YTD_VS_PRIOR_YEAR);
  });

  it('shows no notice for the like-for-like Prior Year to Date vs Year to Date', () => {
    expect(getPeriodLengthNotice(resolve('priorYearToDate'), resolve('ytd'))).toBeNull();
  });

  it('uses the default notice for other partial vs longer pairs', () => {
    expect(getPeriodLengthNotice(resolve('sy2324'), resolve('ytd'))).toBe(PERIOD_LENGTH_NOTICE);
    expect(getPeriodLengthNotice(resolve('last_month'), resolve('this_month'))).toBe(PERIOD_LENGTH_NOTICE);
    expect(getPeriodLengthNotice(resolve('this_week'), resolve('last_week'))).toBe(PERIOD_LENGTH_NOTICE);
  });

  it('needs exactly one partial side', () => {
    expect(getPeriodLengthNotice(resolve('prior_year'), resolve('sy2324'))).toBeNull(); // both complete
    expect(getPeriodLengthNotice(resolve('this_month'), resolve('ytd'))).toBeNull(); //   both partial
    expect(getPeriodLengthNotice(resolve('today'), resolve('prior_year'))).toBeNull(); //  both complete
  });

  it('needs the complete side to cover at least 10% more days than the partial side has covered', () => {
    // Partial side: Apr 1 – Apr 16 covered = 16 days (custom range ending in the future).
    const partial = resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2026-04-01', end: '2026-04-30' });
    const complete = (days: number) =>
      resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2026-03-01', end: `2026-03-${String(days).padStart(2, '0')}` });
    expect(getPeriodLengthNotice(partial, complete(17))).toBeNull(); //                6.25% more
    expect(getPeriodLengthNotice(partial, complete(18))).toBe(PERIOD_LENGTH_NOTICE); // 12.5% more
    expect(getPeriodLengthNotice(partial, complete(16))).toBeNull(); //                same length
  });

  it('counts exactly 10% more as qualifying', () => {
    // 20 covered days vs 22 days = exactly 10%.
    const partial = resolveTimeframe('custom', '2026-04-20', { start: '2026-04-01', end: '2026-04-30' });
    const complete = resolveTimeframe('custom', '2026-04-20', { start: '2026-03-01', end: '2026-03-22' });
    expect(getPeriodLengthNotice(partial, complete)).toBe(PERIOD_LENGTH_NOTICE);
  });

  it('treats a period with no data yet as covering 0 days', () => {
    const future = resolveTimeframe('custom', DEMO_AS_OF_DATE, { start: '2026-05-01', end: '2026-05-31' });
    expect(getPeriodLengthNotice(future, resolve('last_month'))).toBe(PERIOD_LENGTH_NOTICE);
  });
});
