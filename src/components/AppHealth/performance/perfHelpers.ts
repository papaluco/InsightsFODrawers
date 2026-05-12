export const CAT_LABEL: Record<string, string> = {
  page_load:          'Page Load',
  api_request:        'API Request',
  component_render:   'Component Render',
  drawer_load:        'Drawer Load',
  grid_load:          'Grid Load',
  chart_render:       'Chart Render',
  filter_apply:       'Filter Apply',
  report_generation:  'Report Generation',
  ai_response:        'AI Response',
  unknown:            'Unknown',
};

export function fmtMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
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

export function slowColor(slowPct: number): string {
  if (slowPct >= 40) return '#e11d48';
  if (slowPct >= 20) return '#f97316';
  if (slowPct >= 10) return '#fbbf24';
  return '#10b981';
}

export function durationColor(ms: number): string {
  if (ms >= 3000) return 'text-rose-600';
  if (ms >= 1500) return 'text-orange-500';
  if (ms >= 500)  return 'text-amber-500';
  return 'text-emerald-600';
}
