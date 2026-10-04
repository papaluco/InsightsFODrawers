import { IsoDate, startOfWeek } from './dateOnly';
import { getSchoolYearByStartYear, getSchoolYear, getSchoolYearQuarter } from './schoolYear';

/**
 * Shared time bucketing for trend charts.
 *
 * `getBucket` / `formatBucketLabel` were lifted from the Usage module trend charts
 * (InsightsOverview/District/UserActivityTrend, ReportsUserDetailPage). Their Day,
 * Week, and Month output is unchanged (see timeBuckets.test.ts); Quarter was added
 * for Performance Comparison (NXT-77211, spec §7).
 */

export type TimeBucketGranularity = 'day' | 'week' | 'month' | 'quarter';

/** Granularities offered by the Usage trend charts. */
export type UsageGranularity = Exclude<TimeBucketGranularity, 'quarter'>;

/** Quarter bucket key, e.g. "2025-Q3" = SY 2025–26 Q3 (Jan–Mar 2026). */
function toQuarterKey(date: IsoDate): string {
  return `${getSchoolYear(date).startYear}-Q${getSchoolYearQuarter(date)}`;
}

/**
 * Bucket key for an ISO timestamp (e.g. a telemetry event).
 * Day → "YYYY-MM-DD", Week → Monday "YYYY-MM-DD", Month → "YYYY-MM", Quarter → "YYYY-Qn" (school-year quarter).
 *
 * Week keys use the runtime's local time zone, as the Usage charts always have.
 * For calendar dates (no time of day) use `getDateBucket`, which is time-zone safe.
 */
export function getBucket(isoTimestamp: string, granularity: TimeBucketGranularity): string {
  const date = new Date(isoTimestamp);
  if (granularity === 'day') return isoTimestamp.slice(0, 10);
  if (granularity === 'month') return isoTimestamp.slice(0, 7);
  if (granularity === 'quarter') return toQuarterKey(isoTimestamp.slice(0, 10));
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

/** Bucket key for a calendar date. Same key formats as `getBucket`; weeks run Monday–Sunday. */
export function getDateBucket(date: IsoDate, granularity: TimeBucketGranularity): string {
  if (granularity === 'day') return date;
  if (granularity === 'week') return startOfWeek(date);
  if (granularity === 'month') return date.slice(0, 7);
  return toQuarterKey(date);
}

/** Display label for a bucket key: "Apr 16", "Wk Apr 13", "Apr 26", "Q3 SY 2025–26". */
export function formatBucketLabel(bucket: string, granularity: TimeBucketGranularity): string {
  if (granularity === 'quarter') {
    const [startYear, quarter] = bucket.split('-Q').map(Number);
    return `Q${quarter} ${getSchoolYearByStartYear(startYear).label}`;
  }
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

