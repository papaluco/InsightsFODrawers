import type { SessionHealth } from '../../../telemetry/types';

export const HEALTH_BADGE: Record<SessionHealth, string> = {
  healthy:              'bg-emerald-100 text-emerald-700',
  slow:                 'bg-amber-100 text-amber-700',
  degraded:             'bg-orange-100 text-orange-700',
  failed:               'bg-rose-100 text-rose-700',
  abandoned_after_error:'bg-gray-100 text-gray-600',
};

export const HEALTH_DOT: Record<SessionHealth, string> = {
  healthy:              'bg-emerald-400',
  slow:                 'bg-amber-400',
  degraded:             'bg-orange-400',
  failed:               'bg-rose-500',
  abandoned_after_error:'bg-gray-400',
};

export const HEALTH_ORDER: Record<SessionHealth, number> = {
  failed:               0,
  degraded:             1,
  slow:                 2,
  healthy:              3,
  abandoned_after_error:4,
};

export const HEALTH_COLORS: Record<SessionHealth, string> = {
  healthy:              '#10b981',
  slow:                 '#fbbf24',
  degraded:             '#f97316',
  failed:               '#e11d48',
  abandoned_after_error:'#9ca3af',
};

export function fmtDuration(ms: number): string {
  if (ms <= 0)        return '—';
  if (ms < 60_000)    return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  return `${Math.floor(ms / 3_600_000)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
}

export function fmtTs(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function fmtTsFull(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
  });
}
