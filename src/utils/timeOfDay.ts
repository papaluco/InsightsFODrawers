export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export const TIME_OF_DAY_COLORS: Record<TimeOfDay, string> = {
  morning: '#f59e0b',
  afternoon: '#6366f1',
  evening: '#8b5cf6',
};

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morning (12am–12pm)',
  afternoon: 'Afternoon (12pm–5pm)',
  evening: 'Evening (5pm–12am)',
};

export function getTimeOfDay(isoTimestamp: string, timezone?: string): TimeOfDay {
  let hour: number;
  if (timezone) {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).formatToParts(new Date(isoTimestamp));
    hour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
    if (hour === 24) hour = 0;
  } else {
    hour = new Date(isoTimestamp).getUTCHours();
  }
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
