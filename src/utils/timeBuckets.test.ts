import { describe, expect, it } from 'vitest';
import { formatBucketLabel, getBucket, getDateBucket, UsageGranularity } from './timeBuckets';

// ─── Legacy copies (verbatim) ────────────────────────────────────────────────
// These are the implementations that lived in the Usage components before they
// were lifted into timeBuckets.ts. They exist only to prove the shared version
// produces identical output, so the Usage screens are unchanged.

type LegacyGranularity = 'day' | 'week' | 'month';

// From InsightsOverviewActivityTrend / InsightsDistrictActivityTrend / InsightsUserActivityTrend
function legacyInsightsGetBucket(isoTimestamp: string, granularity: LegacyGranularity): string {
  const date = new Date(isoTimestamp);
  if (granularity === 'day') return isoTimestamp.slice(0, 10);
  if (granularity === 'month') return isoTimestamp.slice(0, 7);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function legacyInsightsFormatBucketLabel(bucket: string, granularity: LegacyGranularity): string {
  if (granularity === 'month') {
    const [y, m] = bucket.split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  const date = new Date(bucket + 'T12:00:00');
  if (granularity === 'week') {
    return `Wk ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// From ReportsUserDetailPage
function legacyReportsGetBucket(ts: string, g: LegacyGranularity): string {
  if (g === 'day') return ts.slice(0, 10);
  if (g === 'month') return ts.slice(0, 7);
  const date = new Date(ts);
  const diff = date.getDay() === 0 ? -6 : 1 - date.getDay();
  const mon = new Date(date);
  mon.setDate(date.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function legacyReportsFmtBucket(bucket: string, g: LegacyGranularity): string {
  if (g === 'month') {
    const [y, m] = bucket.split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  const d = new Date(bucket + 'T12:00:00');
  return g === 'week'
    ? `Wk ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Weekdays, Sundays, Mondays, month/year ends, leap day, DST changes, and late-night UTC times.
const SAMPLE_TIMESTAMPS = [
  '2026-04-16T14:30:00.000Z',
  '2026-04-19T23:59:59.000Z', // Sunday
  '2026-04-20T00:00:00.000Z', // Monday
  '2026-04-13T03:15:00.000Z',
  '2026-03-01T23:30:00.000Z', // Sunday, month start
  '2026-02-28T12:00:00.000Z',
  '2025-12-31T23:59:59.000Z', // year end
  '2026-01-01T00:00:01.000Z',
  '2024-02-29T10:00:00.000Z', // leap day
  '2026-03-08T07:30:00.000Z', // US DST start
  '2025-11-02T06:00:00.000Z', // US DST end
  '2025-07-01T05:00:00.000Z',
  '2025-06-30T18:45:00.000Z',
  '2025-09-14T16:00:00Z',
  '2025-10-05T11:11:11.111Z',
];

const USAGE_GRANULARITIES: UsageGranularity[] = ['day', 'week', 'month'];

describe('lifted Usage bucketing is unchanged', () => {
  for (const granularity of USAGE_GRANULARITIES) {
    it(`getBucket matches both legacy copies for ${granularity}`, () => {
      for (const ts of SAMPLE_TIMESTAMPS) {
        const bucket = getBucket(ts, granularity);
        expect(bucket, ts).toBe(legacyInsightsGetBucket(ts, granularity));
        expect(bucket, ts).toBe(legacyReportsGetBucket(ts, granularity));
      }
    });

    it(`formatBucketLabel matches both legacy copies for ${granularity}`, () => {
      for (const ts of SAMPLE_TIMESTAMPS) {
        const bucket = legacyInsightsGetBucket(ts, granularity);
        const label = formatBucketLabel(bucket, granularity);
        expect(label, bucket).toBe(legacyInsightsFormatBucketLabel(bucket, granularity));
        expect(label, bucket).toBe(legacyReportsFmtBucket(bucket, granularity));
      }
    });
  }
});

describe('quarter buckets (school-year quarters)', () => {
  it('keys timestamps by school year and quarter', () => {
    expect(getBucket('2025-07-01T12:00:00Z', 'quarter')).toBe('2025-Q1');
    expect(getBucket('2025-12-31T12:00:00Z', 'quarter')).toBe('2025-Q2');
    expect(getBucket('2026-01-15T12:00:00Z', 'quarter')).toBe('2025-Q3');
    expect(getBucket('2026-06-30T12:00:00Z', 'quarter')).toBe('2025-Q4');
  });

  it('labels quarters with their school year', () => {
    expect(formatBucketLabel('2025-Q3', 'quarter')).toBe('Q3 SY 2025–26');
    expect(formatBucketLabel('2023-Q1', 'quarter')).toBe('Q1 SY 2023–24');
  });
});

describe('getDateBucket (calendar dates, time-zone safe)', () => {
  it('buckets by day, Monday week, month, and school-year quarter', () => {
    expect(getDateBucket('2026-04-16', 'day')).toBe('2026-04-16');
    expect(getDateBucket('2026-04-16', 'week')).toBe('2026-04-13');
    expect(getDateBucket('2026-04-19', 'week')).toBe('2026-04-13'); // Sunday
    expect(getDateBucket('2026-04-20', 'week')).toBe('2026-04-20'); // Monday
    expect(getDateBucket('2026-04-16', 'month')).toBe('2026-04');
    expect(getDateBucket('2026-06-30', 'quarter')).toBe('2025-Q4');
    expect(getDateBucket('2026-07-01', 'quarter')).toBe('2026-Q1');
  });
});
